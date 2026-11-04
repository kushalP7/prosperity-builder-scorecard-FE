"use client"

import * as React from "react"
import { Link, useSearchParams, useNavigate } from "react-router-dom"
import {
  CheckCircleIcon,
  LockIcon,
  SpinnerGapIcon,
  ClockIcon,
  FileTextIcon,
} from "@phosphor-icons/react"
import { apiClient } from "@/lib/api"
import { toast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/store"

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
  { id: "done", label: "Invoice sent" },
] as const

function money(n: number) {
  return Number(n || 0).toLocaleString("en-US")
}

export default function CheckoutPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const currentUser = useAppStore((s) => s.currentUser)
  const isAuthenticated = useAppStore((s) => s.isAuthenticated)
  const setCurrentUser = useAppStore((s) => s.setCurrentUser)

  const [packages, setPackages] = React.useState<PackageRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [step, setStep] = React.useState<"details" | "done">("details")
  const [submitting, setSubmitting] = React.useState(false)
  const [order, setOrder] = React.useState<any>(null)
  const resumeHandled = React.useRef(false)
  const redirectedPaid = React.useRef(false)
  const watchOrderIdRef = React.useRef("")

  const initialPkg =
    PACKAGE_QUERY_MAP[String(searchParams.get("package") || "").toLowerCase()] || "scorecard_only"
  const resumeOrderId = String(searchParams.get("orderId") || searchParams.get("pay") || "").trim()
  // Renew / additional-package checkout must not bounce active subscribers away
  const isRenewFlow = String(searchParams.get("renew") || "").trim() === "1"

  const [packageType, setPackageType] = React.useState<PackageType>(initialPkg)
  const [customerName, setCustomerName] = React.useState(currentUser?.name || "")
  const [organization, setOrganization] = React.useState("")

  watchOrderIdRef.current = String(order?.id || resumeOrderId || "").trim()

  const goToProfilePaid = React.useCallback(
    (message?: string) => {
      if (redirectedPaid.current) return
      redirectedPaid.current = true
      if (message) toast.success(message)
      navigate("/profile", { replace: true })
    },
    [navigate],
  )

  React.useEffect(() => {
    if (isAuthenticated && currentUser) return
    const qs = searchParams.toString()
    const target = `/checkout${qs ? `?${qs}` : ""}`
    navigate(`/login?redirect=${encodeURIComponent(target)}`, { replace: true })
  }, [isAuthenticated, currentUser, navigate, searchParams])

  React.useEffect(() => {
    if (currentUser?.name) setCustomerName(currentUser.name)
  }, [currentUser?.name])

  // Fresh entitlement on load + poll while staying on checkout (admin may mark paid).
  // Skip "already active → profile" when renew=1 or watching an unpaid invoice order.
  React.useEffect(() => {
    if (!isAuthenticated) return
    let cancelled = false

    const syncPaidState = async (opts?: { announce?: boolean }) => {
      if (redirectedPaid.current || cancelled) return false

      try {
        const me = await apiClient.getMe()
        if (cancelled) return false
        if (me) setCurrentUser(me as any)

        const subActive = String((me as any)?.subscriptionStatus || "").toLowerCase() === "active"

        let orderPaid = false
        let orderPending = false
        const watchId = watchOrderIdRef.current
        if (watchId) {
          const latest = await apiClient.getOrder(watchId)
          if (cancelled) return false
          if (latest) {
            setOrder((prev: any) => {
              if (!prev || prev.id === latest.id) return latest
              return prev
            })
            const st = String(latest.status || "").toLowerCase()
            orderPaid = st === "paid"
            orderPending = st === "pending" || st === "failed"
          }
        }

        // Always leave once THIS checkout's order is paid
        if (orderPaid) {
          goToProfilePaid(
            opts?.announce ? "Payment recorded. Welcome to your profile." : undefined,
          )
          return true
        }

        // Active subscriber on plain checkout (not renew, not awaiting an invoice) → profile
        const allowDespiteActive = isRenewFlow || orderPending
        if (subActive && !allowDespiteActive) {
          goToProfilePaid(
            opts?.announce ? "Payment recorded. Welcome to your profile." : undefined,
          )
          return true
        }
      } catch {
        /* keep checkout UI */
      }
      return false
    }

    void syncPaidState()

    const intervalId = window.setInterval(() => {
      void syncPaidState({ announce: true })
    }, 5000)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [isAuthenticated, isRenewFlow, setCurrentUser, goToProfilePaid])

  React.useEffect(() => {
    if (!isAuthenticated) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const rows = await apiClient.getOrderPackages()
      if (!cancelled) {
        setPackages(rows)
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

  React.useEffect(() => {
    setPackageType(initialPkg)
  }, [initialPkg])

  React.useEffect(() => {
    if (!resumeOrderId || resumeHandled.current || loading || !isAuthenticated) return
    if (redirectedPaid.current) return
    let cancelled = false
    ;(async () => {
      const existing = await apiClient.getOrder(resumeOrderId)
      if (cancelled || !existing) return
      const status = String(existing.status || "").toLowerCase()
      setOrder(existing)
      setPackageType(existing.packageType || packageType)
      setCustomerName(existing.customerName || customerName)
      setOrganization(existing.organization || "")
      resumeHandled.current = true

      if (status === "paid") {
        goToProfilePaid("This order is already paid.")
        return
      }
      if (status === "pending" || status === "failed") {
        setStep("done")
        toast.info("Your invoice is pending. Access unlocks after Rose Associates records payment.")
        return
      }
      toast.error("This order cannot be resumed.")
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeOrderId, loading, isAuthenticated, goToProfilePaid])

  const selected = packages.find((p) => p.packageType === packageType) || packages[0]

  const requestInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) {
      toast.error("Packages are not available. Please try again later.")
      return
    }
    if (!customerName.trim()) {
      toast.error("Name is required.")
      return
    }
    setSubmitting(true)

    const result = await apiClient.createOrder({
      packageType: selected.packageType,
      customerName: customerName.trim(),
      organization: organization.trim() || undefined,
      checkoutMethod: "invoice",
    })
    setSubmitting(false)
    if (!result.success || !result.data) {
      toast.error(result.message || "Could not create invoice order.")
      return
    }
    setOrder(result.data)
    setStep("done")
    toast.success(result.message || "Invoice emailed. Your order is pending until payment is recorded.")
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
  const invoicePending =
    step === "done" && String(order?.status || "pending").toLowerCase() !== "paid"

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#f8fafc_0%,_#ffffff_45%,_#f1f5f9_100%)]">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-center">
          <span className="text-sm font-black tracking-tight text-slate-900">Checkout</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 sm:py-10 space-y-8">
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border",
                  i <= stepIndex
                    ? "bg-[#B5111B] text-white border-[#B5111B]"
                    : "bg-white text-slate-400 border-slate-200",
                )}
              >
                <span className="w-5 h-5 rounded-full bg-white/20 inline-flex items-center justify-center text-[10px]">
                  {i < stepIndex ? <CheckCircleIcon weight="bold" className="w-3 h-3" /> : i + 1}
                </span>
                {s.label}
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn("h-px w-8 sm:w-12", i < stepIndex ? "bg-[#B5111B]" : "bg-slate-200")} />
              )}
            </React.Fragment>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-slate-500 font-semibold py-16">
            <SpinnerGapIcon className="w-5 h-5 animate-spin inline-block mr-2" />
            Loading packages…
          </div>
        ) : step === "done" && order ? (
          <div
            className={cn(
              "rounded-2xl border p-6 sm:p-8 shadow-sm max-w-xl mx-auto space-y-4",
              invoicePending ? "border-amber-200 bg-amber-50/40" : "border-emerald-200 bg-emerald-50/40",
            )}
          >
            <div
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center",
                invoicePending ? "bg-amber-100" : "bg-emerald-100",
              )}
            >
              {invoicePending ? (
                <ClockIcon weight="duotone" className="w-6 h-6 text-amber-700" />
              ) : (
                <CheckCircleIcon weight="duotone" className="w-6 h-6 text-emerald-700" />
              )}
            </div>
            <h1 className="text-xl font-black text-slate-900">
              {invoicePending ? "Invoice sent - awaiting payment" : "Payment received"}
            </h1>
            {invoicePending && (
              <p className="text-sm text-slate-600 leading-relaxed">
                A PDF invoice was emailed to <span className="font-semibold text-slate-800">{currentUser.email}</span>.
                Make checks payable to Rose Associates. Your package unlocks once payment is recorded.
              </p>
            )}
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm space-y-1.5">
              <div className="flex justify-between gap-3">
                <span className="text-slate-500 font-semibold">Order</span>
                <span className="font-mono font-bold text-slate-900">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500 font-semibold">Package</span>
                <span className="font-bold text-slate-900">{order.packageName}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500 font-semibold">
                  {invoicePending ? "Amount due" : "Amount"}
                </span>
                <span
                  className={cn(
                    "font-black",
                    invoicePending ? "text-amber-800" : "text-emerald-800",
                  )}
                >
                  ${money(order.amountDue)}
                </span>
              </div>
            </div>
            <div className="flex pt-1">
              <Link
                to="/profile"
                className="inline-flex items-center justify-center h-9 px-5 rounded-xl bg-[#B5111B] hover:bg-[#8F0D15] text-white text-sm font-bold"
              >
                Back to home
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <section className="space-y-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Choose your package
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Invoice / mail check only - a PDF invoice is emailed after you confirm.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {packages.map((pkg) => {
                  const active = pkg.packageType === packageType
                  return (
                    <button
                      key={pkg.packageType}
                      type="button"
                      onClick={() => setPackageType(pkg.packageType)}
                      className={cn(
                        "relative text-left rounded-2xl border p-4 transition-all min-h-[7.5rem]",
                        active
                          ? "border-[#B5111B] bg-red-50/40 ring-2 ring-[#B5111B]/20 shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm",
                      )}
                    >
                      {active && (
                        <span className="absolute top-3 right-3 text-[#B5111B]">
                          <CheckCircleIcon weight="fill" className="w-5 h-5" />
                        </span>
                      )}
                      <div className="text-sm font-extrabold text-slate-900 pr-6">{pkg.name}</div>
                      <div className="text-xl font-black text-[#B5111B] mt-1.5">
                        ${money(pkg.amount)}
                      </div>
                      <p className="text-xs text-slate-500 mt-2 leading-snug">{pkg.description}</p>
                    </button>
                  )
                })}
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-start">
              <form
                onSubmit={requestInvoice}
                className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5"
              >
                <div>
                  <h2 className="text-lg font-black text-slate-900">Billing details</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Signed in as <span className="font-bold text-slate-700">{currentUser.email}</span>
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    label="Project name"
                    value={organization}
                    onChange={setOrganization}
                    placeholder="e.g. Lee County Prosperity Scorecard (optional)"
                    className="sm:col-span-2"
                  />
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-600">
                    <FileTextIcon weight="duotone" className="w-5 h-5" />
                  </div>
                  <div className="text-xs text-slate-600 leading-relaxed">
                    <p className="font-bold text-slate-800 mb-0.5">How payment works</p>
                    We email a PDF invoice for the selected package. Mail your check to Rose Associates.
                    Portal access unlocks after payment is recorded.
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                  <p className="text-[11px] text-slate-400 font-medium">
                    No charge is taken online.
                  </p>
                  <Button
                    type="submit"
                    disabled={submitting || !selected}
                    className="rounded-xl bg-[#B5111B] hover:bg-[#8F0D15] text-white font-bold h-11 px-6"
                  >
                    {submitting ? (
                      <>
                        <SpinnerGapIcon className="w-4 h-4 animate-spin mr-2" />
                        Sending invoice…
                      </>
                    ) : (
                      "Request invoice"
                    )}
                  </Button>
                </div>
              </form>

              <aside className="lg:col-span-2 lg:sticky lg:top-24">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-5">
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Order summary
                  </h2>
                  <div className="space-y-1">
                    <p className="text-base font-black text-slate-900">
                      {selected?.name || "Select a package"}
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">{selected?.description}</p>
                  </div>
                  <div className="border-t border-slate-100 pt-4 flex items-baseline justify-between gap-3">
                    <span className="text-sm font-bold text-slate-600">Total due</span>
                    <span className="text-2xl font-black text-[#B5111B] tabular-nums">
                      ${money(selected?.amount || order?.amountDue || 0)}
                    </span>
                  </div>
                  <ul className="text-xs text-slate-500 space-y-2.5 leading-snug border-t border-slate-100 pt-4">
                    <li className="flex items-start gap-2">
                      <LockIcon weight="bold" className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
                      <span>Invoice emailed as PDF - pay by mail check</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon weight="bold" className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
                      <span>Package prices are set by Rose Associates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ClockIcon weight="bold" className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
                      <span>Projects unlock after payment is recorded</span>
                    </li>
                  </ul>
                </div>
              </aside>
            </div>
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
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
  className?: string
  placeholder?: string
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-xs font-bold text-slate-700">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#B5111B]/30 focus:border-[#B5111B]"
      />
    </div>
  )
}
