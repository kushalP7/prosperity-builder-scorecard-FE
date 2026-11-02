"use client"

import * as React from "react"
import { Link, useSearchParams, useNavigate } from "react-router-dom"
import {
  CheckCircleIcon,
  ArrowLeftIcon,
  WarningCircleIcon,
  LockIcon,
  SpinnerGapIcon,
} from "@phosphor-icons/react"
import { apiClient } from "@/lib/api"
import { StripeCardPaymentForm } from "@/components/payments/StripeCardPaymentForm"
import { FakeCardPaymentForm } from "@/components/payments/FakeCardPaymentForm"
import { toast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/store"

type PaymentProvider = "stripe" | "stub"

type PackageType = "scorecard_only" | "subscription" | "combined"

type PackageRow = {
  id: string
  packageType: PackageType
  name: string
  description: string
  amount: number
  currency: string
}

const PACKAGE_QUERY_MAP: Record<string, PackageType> = {
  "scorecard-only": "scorecard_only",
  scorecard_only: "scorecard_only",
  subscription: "subscription",
  "scorecard-subscription": "subscription",
  combined: "combined",
}

const STEPS = [
  { id: "details", label: "Details" },
  { id: "pay", label: "Payment" },
  { id: "done", label: "Done" },
] as const

export default function CheckoutPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const currentUser = useAppStore((s) => s.currentUser)
  const isAuthenticated = useAppStore((s) => s.isAuthenticated)
  const setCurrentUser = useAppStore((s) => s.setCurrentUser)

  const [packages, setPackages] = React.useState<PackageRow[]>([])
  const [paymentProvider, setPaymentProvider] = React.useState<PaymentProvider>("stub")
  const [loading, setLoading] = React.useState(true)
  const [step, setStep] = React.useState<"details" | "pay" | "done">("details")
  const [submitting, setSubmitting] = React.useState(false)
  const [order, setOrder] = React.useState<any>(null)
  const [clientSecret, setClientSecret] = React.useState<string | null>(null)
  const [projectId, setProjectId] = React.useState<string | null>(null)
  const [payError, setPayError] = React.useState<string | null>(null)
  const resumeHandled = React.useRef(false)
  const useStripe = paymentProvider === "stripe"

  const initialPkg =
    PACKAGE_QUERY_MAP[String(searchParams.get("package") || "").toLowerCase()] || "scorecard_only"
  const resumeOrderId = String(searchParams.get("orderId") || searchParams.get("pay") || "").trim()
  const isRenew = searchParams.get("renew") === "1"

  const [packageType, setPackageType] = React.useState<PackageType>(initialPkg)
  const [customerName, setCustomerName] = React.useState(currentUser?.name || "")
  const [organization, setOrganization] = React.useState("")
  const [checkoutMethod, setCheckoutMethod] = React.useState<"card" | "invoice">("card")

  // Require login — preserve package query for post-auth return
  React.useEffect(() => {
    if (isAuthenticated && currentUser) return
    const qs = searchParams.toString()
    const target = `/checkout${qs ? `?${qs}` : ""}`
    navigate(`/login?redirect=${encodeURIComponent(target)}`, { replace: true })
  }, [isAuthenticated, currentUser, navigate, searchParams])

  React.useEffect(() => {
    if (currentUser?.name) setCustomerName(currentUser.name)
  }, [currentUser?.name])

  const resolveProvider = React.useCallback(async (): Promise<PaymentProvider> => {
    const config = await apiClient.getPaymentConfig()
    const next: PaymentProvider = config?.provider === "stripe" ? "stripe" : "stub"
    setPaymentProvider(next)
    return next
  }, [])

  React.useEffect(() => {
    if (!isAuthenticated) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const [rows, provider] = await Promise.all([
        apiClient.getOrderPackages(),
        resolveProvider(),
      ])
      if (!cancelled) {
        setPackages(rows)
        setPaymentProvider(provider)
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, resolveProvider])

  React.useEffect(() => {
    setPackageType(initialPkg)
  }, [initialPkg])

  // Resume unpaid order → payment step (+ PaymentIntent when Stripe)
  React.useEffect(() => {
    if (!resumeOrderId || resumeHandled.current || loading || !isAuthenticated) return
    let cancelled = false
    ;(async () => {
      const existing = await apiClient.getOrder(resumeOrderId)
      if (cancelled || !existing) return
      const status = String(existing.status || "").toLowerCase()
      if (status === "paid") {
        toast.info("This order is already paid.")
        setOrder(existing)
        setProjectId(existing.customerProjects?.[0]?.id || null)
        setStep("done")
        resumeHandled.current = true
        return
      }
      if (status !== "pending" && status !== "failed") {
        toast.error("This order cannot be paid.")
        return
      }
      setOrder(existing)
      setPackageType(existing.packageType || packageType)
      setCustomerName(existing.customerName || customerName)
      setOrganization(existing.organization || "")

      if (String(existing.provider || "").toLowerCase() === "invoice") {
        setCheckoutMethod("invoice")
        setStep("done")
        resumeHandled.current = true
        toast.info("Invoice / mail check order is pending. Access unlocks after payment is recorded.")
        return
      }

      setCheckoutMethod("card")
      const provider = await resolveProvider()
      if (cancelled) return
      if (provider === "stripe") {
        const pi = await apiClient.createPaymentIntent(existing.id)
        if (cancelled) return
        if (!pi.success || !pi.data?.clientSecret) {
          // Backend may be in stub mode — fall back to fake card
          setPaymentProvider("stub")
          setClientSecret(null)
          toast.info(pi.message || "Using local stub payment.")
        } else {
          setClientSecret(pi.data.clientSecret)
        }
      } else {
        setClientSecret(null)
      }
      setStep("pay")
      resumeHandled.current = true
      toast.info("Complete payment to unlock your package.")
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeOrderId, loading, isAuthenticated, resolveProvider])

  const selected = packages.find((p) => p.packageType === packageType) || packages[0]

  const finishPaid = async (paidOrder: any, project?: any, message?: string) => {
    setOrder(paidOrder)
    setProjectId(project?.id || paidOrder?.customerProjects?.[0]?.id || null)
    setStep("done")
    toast.success(message || "Payment received. Package unlocked.")
    try {
      const me = await apiClient.getMe()
      if (me) setCurrentUser(me as any)
    } catch {
      /* ignore */
    }
  }

  const continueToPay = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) {
      toast.error("Packages are not available. Check Settings plan prices.")
      return
    }
    if (!customerName.trim()) {
      toast.error("Name is required.")
      return
    }
    setSubmitting(true)
    setPayError(null)

    const result = await apiClient.createOrder({
      packageType: selected.packageType,
      customerName: customerName.trim(),
      organization: organization.trim() || undefined,
      checkoutMethod,
    })
    if (!result.success || !result.data) {
      setSubmitting(false)
      toast.error(result.message || "Could not start checkout.")
      return
    }
    setOrder(result.data)

    if (checkoutMethod === "invoice") {
      setSubmitting(false)
      setStep("done")
      toast.success(result.message || "Invoice emailed. Order is pending until payment is recorded.")
      return
    }

    // Always re-read BE config so PAYMENT_PROVIDER=stub never hits Stripe APIs
    const provider = await resolveProvider()

    if (provider === "stripe") {
      const pi = await apiClient.createPaymentIntent(result.data.id)
      setSubmitting(false)
      if (!pi.success || !pi.data?.clientSecret) {
        setPaymentProvider("stub")
        setClientSecret(null)
        setStep("pay")
        toast.info(pi.message || "Stripe not active — using local stub payment.")
        return
      }
      setClientSecret(pi.data.clientSecret)
    } else {
      setClientSecret(null)
      setSubmitting(false)
    }

    setStep("pay")
    toast.info("Order started. Pay now to unlock projects — unpaid checkouts do not grant access.")
  }

  const handleStubPay = async (payload: {
    cardNumber: string
    expiry: string
    cvc: string
    cardholderName: string
  }) => {
    if (!order?.id) return
    setSubmitting(true)
    setPayError(null)
    const result = await apiClient.stubPayOrder(order.id, payload)
    setSubmitting(false)
    if (!result.success) {
      const msg =
        typeof result.message === "string"
          ? result.message
          : "Payment failed. Your order is still open — try another card."
      setPayError(msg)
      toast.error(msg)
      if (result.data?.order || result.data?.id) {
        setOrder(result.data.order || result.data)
      }
      return
    }
    const paidOrder = result.data?.order || result.data
    await finishPaid(paidOrder, result.data?.project, result.message)
  }

  const handleStripeSuccess = async () => {
    if (!order?.id) return
    setSubmitting(true)
    setPayError(null)
    toast.info("Confirming payment…")

    let confirmed = await apiClient.confirmStripePayment(order.id)
    if (!confirmed.success) {
      await new Promise((r) => setTimeout(r, 2000))
      confirmed = await apiClient.confirmStripePayment(order.id)
    }

    if (!confirmed.success) {
      setSubmitting(false)
      const msg =
        confirmed.message ||
        "Payment submitted. Confirmation is still processing — refresh in a moment or check your profile."
      setPayError(msg)
      toast.info(msg)
      return
    }

    const paidOrder = confirmed.data?.order || confirmed.data
    setSubmitting(false)
    await finishPaid(paidOrder, confirmed.data?.project, confirmed.message)
  }

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-semibold">
        <SpinnerGapIcon className="w-5 h-5 animate-spin mr-2" />
        Redirecting to sign in…
      </div>
    )
  }

  const stepIndex = STEPS.findIndex((s) => s.id === step)

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#f8fafc_0%,_#ffffff_45%,_#f1f5f9_100%)]">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <Link
            to="/profile"
            className="text-sm font-bold text-slate-600 hover:text-[#B5111B] inline-flex items-center gap-1.5"
          >
            <ArrowLeftIcon weight="bold" className="w-4 h-4" />
            Back to profile
          </Link>
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#B5111B]">
            {isRenew ? "Renew package" : "Package checkout"}
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {isRenew ? (
              <>
                Renew your <span className="text-[#B5111B]">scorecard package</span>
              </>
            ) : (
              <>
                Complete your <span className="text-[#B5111B]">scorecard purchase</span>
              </>
            )}
          </h1>
          <p className="mt-2 text-slate-600 text-sm sm:text-base max-w-2xl">
            Projects unlock only after payment succeeds. Prices come from admin Settings — starting
            checkout does not grant access.
          </p>
        </div>

        {/* Step indicator */}
        <ol className="flex items-center gap-2 sm:gap-4 mb-8">
          {STEPS.map((s, i) => {
            const active = i === stepIndex
            const done = i < stepIndex
            return (
              <li key={s.id} className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black",
                    done || active ? "bg-[#B5111B] text-white" : "bg-slate-200 text-slate-500",
                  )}
                >
                  {done ? "✓" : i + 1}
                </span>
                <span
                  className={cn(
                    "text-xs sm:text-sm font-bold truncate",
                    active ? "text-slate-900" : "text-slate-400",
                  )}
                >
                  {s.label}
                </span>
                {i < STEPS.length - 1 && (
                  <span className="hidden sm:block h-px flex-1 bg-slate-200" aria-hidden />
                )}
              </li>
            )
          })}
        </ol>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 font-semibold">
            <SpinnerGapIcon className="w-5 h-5 animate-spin inline-block mr-2" />
            Loading packages…
          </div>
        ) : step === "done" ? (
          (() => {
            const invoicePending =
              String(order?.status || "").toLowerCase() !== "paid" &&
              (checkoutMethod === "invoice" ||
                String(order?.provider || "").toLowerCase() === "invoice")
            return (
          <div
            className={cn(
              "rounded-2xl border bg-white p-8 sm:p-10 shadow-sm text-center space-y-4 max-w-xl mx-auto",
              invoicePending ? "border-amber-200" : "border-emerald-200",
            )}
          >
            <div
              className={cn(
                "mx-auto w-14 h-14 rounded-full flex items-center justify-center",
                invoicePending ? "bg-amber-100" : "bg-emerald-100",
              )}
            >
              {invoicePending ? (
                <WarningCircleIcon weight="fill" className="w-8 h-8 text-amber-600" />
              ) : (
                <CheckCircleIcon weight="fill" className="w-8 h-8 text-emerald-600" />
              )}
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              {invoicePending ? "Invoice sent - awaiting payment" : "Payment received"}
            </h2>
            {invoicePending && (
              <p className="text-sm text-slate-600 leading-relaxed">
                A PDF invoice was emailed to you. Make checks payable to Rose Associates.
                Package access unlocks after payment is recorded. You can view this pending
                order on your profile.
              </p>
            )}
            <div className="text-left rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm space-y-1.5">
              <div className="flex justify-between gap-3">
                <span className="text-slate-500 font-medium">Order</span>
                <span className="font-mono font-bold text-slate-900">{order?.orderNumber}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500 font-medium">Package</span>
                <span className="font-bold text-slate-900">{order?.packageName || selected?.name}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500 font-medium">
                  {invoicePending ? "Amount due" : "Amount"}
                </span>
                <span className="font-black text-[#B5111B]">
                  $
                  {Number(
                    invoicePending
                      ? order?.amountDue || 0
                      : order?.amountPaid || order?.amountDue || 0,
                  ).toLocaleString("en-US")}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {invoicePending ? (
                <Button
                  onClick={() => navigate("/profile")}
                  className="rounded-xl bg-[#B5111B] hover:bg-[#8F0D15] text-white font-bold"
                >
                  View pending order
                </Button>
              ) : projectId ? (
                <Button
                  onClick={() => navigate(`/projects/${projectId}/intake`)}
                  className="rounded-xl bg-[#B5111B] hover:bg-[#8F0D15] text-white font-bold"
                >
                  Go to intake questionnaire
                </Button>
              ) : (
                <Button
                  onClick={() => navigate("/projects")}
                  className="rounded-xl bg-[#B5111B] hover:bg-[#8F0D15] text-white font-bold"
                >
                  Go to projects
                </Button>
              )}
              {!invoicePending && (
                <Button variant="ghost" onClick={() => navigate("/profile")} className="rounded-xl">
                  Back to profile
                </Button>
              )}
            </div>
          </div>
            )
          })()
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 lg:gap-8 items-start">
            <div className="space-y-5 order-2 lg:order-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {packages.map((pkg) => {
                  const active = pkg.packageType === (selected?.packageType || packageType)
                  return (
                    <button
                      key={pkg.packageType}
                      type="button"
                      disabled={step === "pay"}
                      onClick={() => setPackageType(pkg.packageType)}
                      className={cn(
                        "text-left rounded-2xl border p-4 transition-all",
                        active
                          ? "border-[#B5111B] bg-red-50/60 shadow-sm ring-1 ring-[#B5111B]/30"
                          : "border-slate-200 bg-white hover:border-slate-300",
                        step === "pay" && "opacity-80 cursor-default",
                      )}
                    >
                      <div className="text-sm font-bold text-slate-900">{pkg.name}</div>
                      <div className="text-xl font-black text-[#B5111B] mt-1">
                        ${Number(pkg.amount).toLocaleString("en-US")}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">{pkg.description}</p>
                    </button>
                  )
                })}
              </div>

              {step === "details" ? (
                <form
                  onSubmit={continueToPay}
                  className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-4"
                >
                  <h2 className="text-lg font-black text-slate-900">Customer details</h2>
                  <p className="text-xs text-slate-500">
                    Signed in as{" "}
                    <span className="font-bold text-slate-700">{currentUser.email}</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Full name *" value={customerName} onChange={setCustomerName} required />
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Email</label>
                      <input
                        type="email"
                        readOnly
                        value={currentUser.email || ""}
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-600 cursor-not-allowed"
                      />
                    </div>
                    <Field
                      label="Organization"
                      value={organization}
                      onChange={setOrganization}
                      className="sm:col-span-2"
                    />
                  </div>
                  <div className="space-y-2 pt-1">
                    <p className="text-xs font-bold text-slate-700">Payment method</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCheckoutMethod("card")}
                        className={cn(
                          "text-left rounded-xl border px-3.5 py-3 transition-all",
                          checkoutMethod === "card"
                            ? "border-[#B5111B] bg-red-50/60 ring-1 ring-[#B5111B]/30"
                            : "border-slate-200 bg-white hover:border-slate-300",
                        )}
                      >
                        <div className="text-sm font-bold text-slate-900">Pay online</div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {useStripe ? "Card via Stripe" : "Card (local stub)"}
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCheckoutMethod("invoice")}
                        className={cn(
                          "text-left rounded-xl border px-3.5 py-3 transition-all",
                          checkoutMethod === "invoice"
                            ? "border-[#B5111B] bg-red-50/60 ring-1 ring-[#B5111B]/30"
                            : "border-slate-200 bg-white hover:border-slate-300",
                        )}
                      >
                        <div className="text-sm font-bold text-slate-900">Invoice / mail check</div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          PDF invoice emailed — pay offline
                        </p>
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {checkoutMethod === "invoice"
                      ? "Creates a pending order and emails a PDF invoice. Access unlocks after Rose Associates records payment."
                      : `Continue creates a pending order. Your package unlocks only after payment succeeds${useStripe ? " (Stripe)" : " (local stub card)"}.`}
                  </p>
                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      disabled={submitting || !selected}
                      className="rounded-xl bg-[#B5111B] hover:bg-[#8F0D15] text-white font-bold"
                    >
                      {submitting
                        ? checkoutMethod === "invoice"
                          ? "Sending invoice…"
                          : "Starting checkout…"
                        : checkoutMethod === "invoice"
                          ? "Request invoice"
                          : "Continue to payment"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-black text-slate-900">
                        {useStripe ? "Pay securely" : "Pay with test card"}
                      </h2>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        {order?.orderNumber} · awaiting payment
                        {!useStripe ? " · stub mode" : ""}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-xs font-bold rounded-xl"
                      disabled={submitting}
                      onClick={() => {
                        setPayError(null)
                        setClientSecret(null)
                        setStep("details")
                      }}
                    >
                      Edit details
                    </Button>
                  </div>

                  {payError && (
                    <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-900">
                      <WarningCircleIcon weight="fill" className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Payment not completed</p>
                        <p className="text-xs mt-0.5 leading-relaxed">{payError}</p>
                      </div>
                    </div>
                  )}

                  {useStripe ? (
                    clientSecret ? (
                      <StripeCardPaymentForm
                        clientSecret={clientSecret}
                        amount={Number(order?.amountDue || selected?.amount || 0)}
                        packageName={order?.packageName || selected?.name}
                        orderNumber={order?.orderNumber}
                        onSuccess={handleStripeSuccess}
                        onError={(msg) => setPayError(msg)}
                      />
                    ) : (
                      <div className="text-sm text-slate-500 font-medium py-6 text-center">
                        <SpinnerGapIcon className="w-5 h-5 animate-spin inline-block mr-2" />
                        Preparing secure payment…
                      </div>
                    )
                  ) : (
                    <FakeCardPaymentForm
                      amount={Number(order?.amountDue || selected?.amount || 0)}
                      packageName={order?.packageName || selected?.name}
                      submitting={submitting}
                      onSubmit={handleStubPay}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Order summary */}
            <aside className="order-1 lg:order-2 lg:sticky lg:top-24">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-500">
                  Order summary
                </h2>
                <div>
                  <p className="text-base font-black text-slate-900">
                    {selected?.name || "Select a package"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {selected?.description}
                  </p>
                </div>
                <div className="border-t border-slate-100 pt-3 flex items-baseline justify-between">
                  <span className="text-sm font-bold text-slate-600">Total due</span>
                  <span className="text-2xl font-black text-[#B5111B]">
                    ${Number(selected?.amount || order?.amountDue || 0).toLocaleString("en-US")}
                  </span>
                </div>
                <ul className="text-[11px] text-slate-500 space-y-1.5 leading-snug">
                  <li className="flex items-start gap-1.5">
                    <LockIcon weight="bold" className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
                    {checkoutMethod === "invoice"
                      ? "Invoice / mail check — PDF emailed"
                      : useStripe
                        ? "Secured payment via Stripe"
                        : "Local stub payment (dev)"}
                  </li>
                  <li>Prices set by admin — not editable at checkout</li>
                  <li>No project access until payment is recorded</li>
                </ul>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  className,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
  className?: string
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-xs font-bold text-slate-700">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#B5111B]/30 focus:border-[#B5111B]"
      />
    </div>
  )
}
