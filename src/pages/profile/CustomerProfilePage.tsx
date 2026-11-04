"use client"

import * as React from "react"
import { Link } from "@/lib/router-compat"
import { apiClient } from "@/lib/api"
import { useAppStore } from "@/store"
import { hasActiveSubscription, isCustomerRole } from "@/lib/permissions"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/toast"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import {
  CameraIcon,
  SpinnerGapIcon,
  PencilSimpleIcon,
  TrashIcon,
  CheckIcon,
  XIcon,
  PrinterIcon,
  ReceiptIcon,
} from "@phosphor-icons/react"
import { printPaymentReceipt } from "@/lib/payment-receipt"

const MAX_AVATAR_BYTES = 2 * 1024 * 1024
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/jpg", "image/webp"])

function formatMoney(n: number) {
  return `$${Number(n || 0).toLocaleString("en-US")}`
}

function formatDate(v?: string | Date | null) {
  if (!v) return "-"
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return "-"
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function formatRole(role?: string) {
  if (!role) return "Customer"
  return String(role)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatSubStatus(status?: string) {
  if (!status || status === "none") return "None"
  return String(status).replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatProjectStatus(status?: string) {
  if (!status) return "Unknown"
  return String(status)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function projectStatusClasses(status?: string) {
  const s = String(status || "").toUpperCase()
  if (s === "PUBLISHED") return "bg-emerald-50 text-emerald-700 border-emerald-200"
  if (s === "INTAKE_PENDING" || s.includes("PENDING")) return "bg-amber-50 text-amber-800 border-amber-200"
  if (s === "IN_REVIEW" || s === "CALCULATED") return "bg-sky-50 text-sky-800 border-sky-200"
  if (s.includes("FAIL") || s.includes("ERROR")) return "bg-rose-50 text-rose-700 border-rose-200"
  return "bg-slate-50 text-slate-700 border-slate-200"
}

function initials(name?: string) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function renewCheckoutHref(pkg?: string | null) {
  const raw = String(pkg || "combined").toLowerCase()
  const map: Record<string, string> = {
    scorecard_only: "scorecard_only",
    "scorecard-only": "scorecard_only",
    subscription: "subscription",
    combined: "combined",
  }
  const packageType = map[raw] || "combined"
  return `/checkout?package=${packageType}&renew=1`
}

function SectionTitle({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="w-1 h-5 rounded-full bg-[#B5111B] shrink-0" aria-hidden />
      <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
        {children}
      </h3>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5 sm:gap-4 py-2 border-b border-slate-100 last:border-0">
      <span className="text-xs sm:text-sm text-slate-500 shrink-0">{label}</span>
      <span className="text-sm font-semibold text-slate-900 sm:text-right break-all">{value}</span>
    </div>
  )
}

export default function CustomerProfilePage() {
  const currentUser = useAppStore((s) => s.currentUser)
  const setCurrentUser = useAppStore((s) => s.setCurrentUser)
  const navigate = useNavigate()
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const [orders, setOrders] = React.useState<any[]>([])
  const [payments, setPayments] = React.useState<any[]>([])
  const [projects, setProjects] = React.useState<any[]>([])
  const [allowance, setAllowance] = React.useState<{
    maxProjects: number
    usedProjects: number
    remaining: number
    paidPackages: any[]
  } | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [uploading, setUploading] = React.useState(false)
  const [removingPhoto, setRemovingPhoto] = React.useState(false)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [editingName, setEditingName] = React.useState(false)
  const [nameDraft, setNameDraft] = React.useState("")
  const [savingName, setSavingName] = React.useState(false)
  const [receiptPay, setReceiptPay] = React.useState<any | null>(null)

  const subscribed = hasActiveSubscription(currentUser?.subscriptionStatus)
  const isExpired = String(currentUser?.subscriptionStatus || "").toLowerCase() === "expired"
  const isCustomer = isCustomerRole(currentUser?.role)
  const avatarSrc = previewUrl || currentUser?.avatarUrl || null

  React.useEffect(() => {
    if (currentUser && !isCustomer) {
      navigate("/projects", { replace: true })
    }
  }, [currentUser, isCustomer, navigate])

  React.useEffect(() => {
    if (!isCustomer) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const [o, p, a, projRes, me] = await Promise.all([
        apiClient.getMyOrders(),
        apiClient.getMyPayments(),
        apiClient.getMyProjectAllowance(),
        apiClient.getProjects(),
        apiClient.getMe(),
      ])
      if (cancelled) return
      if (me) setCurrentUser(me as any)
      setOrders(o)
      setPayments(p)
      setAllowance(a)
      const list = Array.isArray(projRes) ? projRes : (projRes as any)?.data || []
      setProjects(list)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [isCustomer, setCurrentUser])

  React.useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const primaryPackage =
    allowance?.paidPackages?.[0] ||
    orders.find((o) => o.status === "paid") ||
    null

  const slotUsed = allowance?.usedProjects ?? 0
  const slotMax = allowance?.maxProjects ?? 0
  const slotPct = slotMax > 0 ? Math.min(100, Math.round((slotUsed / slotMax) * 100)) : 0
  const validUntil = currentUser?.subscriptionExpiresAt || null
  const renewHref = renewCheckoutHref(
    currentUser?.subscriptionPackage || primaryPackage?.packageType,
  )
  const showRenew = subscribed || isExpired || Boolean(primaryPackage)
  const unpaidOrders = orders.filter((o) => {
    const s = String(o.status || "").toLowerCase()
    return s === "pending" || s === "failed"
  })

  const onPickPhoto = () => fileInputRef.current?.click()

  const startEditName = () => {
    setNameDraft(currentUser?.name || "")
    setEditingName(true)
  }

  const cancelEditName = () => {
    setEditingName(false)
    setNameDraft("")
  }

  const saveName = async () => {
    const next = nameDraft.trim()
    if (!next) {
      toast.error("Name cannot be empty.")
      return
    }
    if (!currentUser?.id) return
    if (next === currentUser.name) {
      setEditingName(false)
      return
    }
    setSavingName(true)
    try {
      const res = await apiClient.updateMyProfile({ name: next })
      if (!res.success || !res.user) {
        toast.error(res.message || "Could not update name.")
        return
      }
      setCurrentUser({ ...currentUser, ...res.user })
      setEditingName(false)
      toast.success("Name updated.")
    } catch {
      toast.error("Could not update name.")
    } finally {
      setSavingName(false)
    }
  }

  const removePhoto = async () => {
    if (!currentUser?.id || !currentUser.avatarUrl) return
    setRemovingPhoto(true)
    try {
      const res = await apiClient.updateMyProfile({ avatarUrl: "" })
      if (!res.success || !res.user) {
        toast.error(res.message || "Could not remove photo.")
        return
      }
      setCurrentUser({ ...currentUser, ...res.user, avatarUrl: null })
      setPreviewUrl(null)
      toast.success("Profile photo removed.")
    } catch {
      toast.error("Could not remove photo.")
    } finally {
      setRemovingPhoto(false)
    }
  }

  const onPhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file || !currentUser?.id) return

    if (!ACCEPTED_TYPES.has(file.type) && !/\.(jpe?g|png|webp)$/i.test(file.name)) {
      toast.error("Please upload a JPG or PNG image.")
      return
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error("Image must be 2MB or smaller.")
      return
    }

    const localPreview = URL.createObjectURL(file)
    setPreviewUrl(localPreview)
    setUploading(true)

    try {
      const uploaded = await apiClient.uploadImage(file, "avatars")
      if (!uploaded?.url) {
        toast.error("Upload failed. Please try again.")
        setPreviewUrl(null)
        return
      }

      const res = await apiClient.updateMyProfile({ avatarUrl: uploaded.url })
      if (!res.success || !res.user) {
        toast.error(res.message || "Could not save profile photo.")
        setPreviewUrl(null)
        return
      }

      setCurrentUser({ ...currentUser, ...res.user })
      setPreviewUrl(null)
      toast.success("Profile photo updated.")
    } catch {
      toast.error("Could not update profile photo.")
      setPreviewUrl(null)
    } finally {
      setUploading(false)
      if (localPreview.startsWith("blob:")) URL.revokeObjectURL(localPreview)
    }
  }

  return (
    <div className="space-y-3 sm:space-y-3.5 w-full pb-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
            My Profile
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Account, subscription plan, your projects, and payment history.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 font-semibold">
          Loading profile…
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-3.5">
          {unpaidOrders.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-3.5 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-amber-950">Invoice pending</p>
                  <p className="text-xs text-amber-800/90 mt-0.5 leading-relaxed">
                    You have {unpaidOrders.length} unpaid invoice
                    {unpaidOrders.length === 1 ? "" : "s"}. Access unlocks after Rose Associates
                    records payment.
                  </p>
                </div>
                <Link
                  href={`/checkout?orderId=${unpaidOrders[0].id}`}
                  className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#B5111B] hover:bg-[#8F0D15] text-white font-bold text-sm h-9 px-4"
                >
                  View invoice status
                </Link>
              </div>
              {unpaidOrders.length > 1 && (
                <ul className="mt-3 space-y-1.5 border-t border-amber-200/80 pt-3">
                  {unpaidOrders.map((o) => (
                    <li
                      key={o.id}
                      className="flex flex-wrap items-center justify-between gap-2 text-xs text-amber-950"
                    >
                      <span className="font-mono font-semibold">{o.orderNumber}</span>
                      <span className="text-amber-800">{o.packageName || o.packageType}</span>
                      <Link
                        href={`/checkout?orderId=${o.id}`}
                        className="font-bold text-[#B5111B] hover:underline"
                      >
                        View status →
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Account + Subscription */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-3.5 items-stretch">
            <section className="rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-2xs h-full flex flex-col">
              <SectionTitle className="mb-3">Account Information</SectionTitle>

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 flex-1">
                <div className="flex flex-col items-center sm:items-start shrink-0">
                  <div className="relative">
                    <div
                      className={cn(
                        "w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden flex items-center justify-center text-xl font-bold",
                        avatarSrc ? "bg-slate-100" : currentUser?.avatarBg || "bg-slate-700 text-white",
                      )}
                    >
                      {avatarSrc ? (
                        <img
                          src={avatarSrc}
                          alt={currentUser?.name || "Profile"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white">{initials(currentUser?.name)}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={onPickPhoto}
                      disabled={uploading}
                      className="absolute bottom-0.5 right-0.5 w-8 h-8 rounded-full bg-[#B5111B] text-white flex items-center justify-center shadow-md hover:bg-[#8F0D15] disabled:opacity-60"
                      aria-label="Change photo"
                    >
                      {uploading ? (
                        <SpinnerGapIcon className="w-4 h-4 animate-spin" weight="bold" />
                      ) : (
                        <CameraIcon className="w-4 h-4" weight="bold" />
                      )}
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <button
                      type="button"
                      onClick={onPickPhoto}
                      disabled={uploading || removingPhoto}
                      className="text-sm font-bold text-[#B5111B] hover:underline disabled:opacity-60"
                    >
                      {uploading ? "Uploading…" : "Change Photo"}
                    </button>
                    {avatarSrc && (
                      <button
                        type="button"
                        onClick={removePhoto}
                        disabled={uploading || removingPhoto}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-rose-700 disabled:opacity-60"
                      >
                        <TrashIcon className="w-3.5 h-3.5" weight="bold" />
                        {removingPhoto ? "Removing…" : "Remove"}
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 text-center sm:text-left">
                    JPG, PNG (Max 2MB)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={onPhotoSelected}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-2 border-b border-slate-100">
                    <span className="text-xs sm:text-sm text-slate-500 shrink-0">Name</span>
                    {editingName ? (
                      <div className="flex items-center gap-1.5 w-full sm:w-auto sm:max-w-[260px]">
                        <input
                          value={nameDraft}
                          onChange={(e) => setNameDraft(e.target.value)}
                          className="flex-1 min-w-0 h-9 px-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#B5111B]/30"
                          maxLength={120}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") void saveName()
                            if (e.key === "Escape") cancelEditName()
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => void saveName()}
                          disabled={savingName}
                          className="h-9 w-9 rounded-lg bg-[#B5111B] text-white flex items-center justify-center hover:bg-[#8F0D15] disabled:opacity-60"
                          aria-label="Save name"
                        >
                          {savingName ? (
                            <SpinnerGapIcon className="w-4 h-4 animate-spin" weight="bold" />
                          ) : (
                            <CheckIcon className="w-4 h-4" weight="bold" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditName}
                          disabled={savingName}
                          className="h-9 w-9 rounded-lg border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-50"
                          aria-label="Cancel"
                        >
                          <XIcon className="w-4 h-4" weight="bold" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 sm:justify-end min-w-0">
                        <span className="text-sm font-semibold text-slate-900 truncate">
                          {currentUser?.name || "-"}
                        </span>
                        <button
                          type="button"
                          onClick={startEditName}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#B5111B] hover:bg-red-50"
                          aria-label="Edit name"
                        >
                          <PencilSimpleIcon className="w-4 h-4" weight="bold" />
                        </button>
                      </div>
                    )}
                  </div>
                  <InfoRow label="Email" value={currentUser?.email || "-"} />
                  <InfoRow label="Role" value={formatRole(currentUser?.role)} />
                  <InfoRow
                    label="Subscription Status"
                    value={
                      <span
                        className={cn(
                          "inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold border",
                          subscribed
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : isExpired
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-amber-50 text-amber-800 border-amber-200",
                        )}
                      >
                        {formatSubStatus(currentUser?.subscriptionStatus)}
                      </span>
                    }
                  />
                </div>
              </div>

              {!subscribed && (
                <Link
                  href={isExpired ? renewHref : "/checkout"}
                  className="inline-flex w-full mt-5 items-center justify-center rounded-xl bg-[#B5111B] hover:bg-[#8F0D15] text-white font-bold text-sm h-10 px-4"
                >
                  {isExpired ? "Renew subscription" : "Purchase a package"}
                </Link>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-2xs h-full flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <SectionTitle>Subscription Plan</SectionTitle>
                {showRenew && (
                  <Link
                    href={renewHref}
                    className="text-sm font-bold text-[#B5111B] hover:underline whitespace-nowrap"
                  >
                    Renew
                  </Link>
                )}
              </div>

              {primaryPackage || subscribed ? (
                <div className="space-y-1">
                  <InfoRow
                    label="Package"
                    value={
                      primaryPackage?.packageName ||
                      primaryPackage?.packageType ||
                      currentUser?.subscriptionPackage ||
                      "-"
                    }
                  />
                  <div className="py-2 border-b border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 mb-2">
                      <span className="text-xs sm:text-sm text-slate-500">Project Slots</span>
                      <span className="text-sm font-semibold text-slate-900">
                        {allowance
                          ? `${slotUsed} used / ${slotMax} allowed`
                          : "-"}
                      </span>
                    </div>
                    {allowance && slotMax > 0 && (
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#B5111B] transition-all"
                          style={{ width: `${slotPct}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <InfoRow label="Valid Until" value={formatDate(validUntil)} />
                  <div className="mt-3 rounded-xl bg-sky-50 border border-sky-100 px-3.5 py-3 text-[12px] sm:text-[13px] text-sky-900 leading-relaxed">
                    Scorecard only unlocks 1 project · Subscription unlocks 3 · Combined unlocks 4
                    (Slots stack across paid packages)
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">No active paid package yet.</p>
              )}
            </section>
          </div>

          {/* My Projects */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <SectionTitle>My Projects</SectionTitle>
              {subscribed && (
                <Link
                  href="/projects"
                  className="text-sm font-bold text-[#B5111B] hover:underline whitespace-nowrap"
                >
                  View all projects
                </Link>
              )}
            </div>

            {!subscribed ? (
              <p className="text-sm text-slate-500">Projects unlock after full package payment.</p>
            ) : projects.length === 0 ? (
              <p className="text-sm text-slate-500">No projects linked to your account yet.</p>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto -mx-1">
                  <table className="w-full text-left text-sm min-w-[640px]">
                    <thead>
                      <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-400">
                        <th className="py-3 pr-3 font-extrabold">Project Name</th>
                        <th className="py-3 pr-3 font-extrabold">County / State</th>
                        <th className="py-3 pr-3 font-extrabold">Status</th>
                        <th className="py-3 pr-3 font-extrabold">Last Updated</th>
                        <th className="py-3 font-extrabold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.slice(0, 8).map((p: any) => {
                        const hasInitial = Boolean(p.initialReportUrl)
                        const hasDetailed = Boolean(p.certifiedReportUrl)
                        const location = [p.county, p.state].filter(Boolean).join(", ") || "-"
                        return (
                          <tr key={p.id} className="border-b border-slate-100 last:border-0">
                            <td className="py-3.5 pr-3 font-bold text-slate-900">{p.name}</td>
                            <td className="py-3.5 pr-3 text-slate-600">
                              {location}
                              {p.year ? (
                                <span className="text-slate-400">, {p.year}</span>
                              ) : null}
                            </td>
                            <td className="py-3.5 pr-3">
                              <span
                                className={cn(
                                  "inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold border",
                                  projectStatusClasses(p.status),
                                )}
                              >
                                {formatProjectStatus(p.status)}
                              </span>
                            </td>
                            <td className="py-3.5 pr-3 text-slate-600 whitespace-nowrap">
                              {formatDate(p.updatedAt || p.createdAt)}
                            </td>
                            <td className="py-3.5 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-3 justify-end flex-wrap">
                                <Link
                                  href={`/projects/${p.id}/intake`}
                                  className="text-sm font-bold text-[#B5111B] hover:underline"
                                >
                                  Open
                                </Link>
                                {hasInitial && (
                                  <a
                                    href={p.initialReportUrl}
                                    download={p.initialReportFileName || "Initial-Scorecard-Report.pdf"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-bold text-sky-700 hover:underline"
                                  >
                                    Initial PDF
                                  </a>
                                )}
                                {hasDetailed && (
                                  <a
                                    href={p.certifiedReportUrl}
                                    download={p.certifiedReportFileName || "Detailed-Scorecard-Report.pdf"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-bold text-emerald-700 hover:underline"
                                  >
                                    Detailed PDF
                                  </a>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                  {projects.slice(0, 8).map((p: any) => {
                    const hasInitial = Boolean(p.initialReportUrl)
                    const hasDetailed = Boolean(p.certifiedReportUrl)
                    const location = [p.county, p.state].filter(Boolean).join(", ") || "-"
                    return (
                      <div key={p.id} className="p-4 space-y-2.5 bg-white">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {location}
                              {p.year ? `, ${p.year}` : ""}
                            </div>
                          </div>
                          <span
                            className={cn(
                              "inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0",
                              projectStatusClasses(p.status),
                            )}
                          >
                            {formatProjectStatus(p.status)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                          <span>Updated {formatDate(p.updatedAt || p.createdAt)}</span>
                          <div className="flex items-center gap-3 flex-wrap justify-end">
                            <Link
                              href={`/projects/${p.id}/intake`}
                              className="font-bold text-[#B5111B]"
                            >
                              Open
                            </Link>
                            {hasInitial && (
                              <a
                                href={p.initialReportUrl}
                                download={p.initialReportFileName || "Initial-Scorecard-Report.pdf"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-bold text-sky-700"
                              >
                                Initial
                              </a>
                            )}
                            {hasDetailed && (
                              <a
                                href={p.certifiedReportUrl}
                                download={p.certifiedReportFileName || "Detailed-Scorecard-Report.pdf"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-bold text-emerald-700"
                              >
                                Detailed
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </section>

          {/* How You Paid — table is the history; no separate "view all" link */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-2xs">
            <SectionTitle className="mb-3">How You Paid</SectionTitle>

            {payments.length === 0 ? (
              <p className="text-sm text-slate-500">No payment attempts on file.</p>
            ) : (
              <>
                <div className="hidden md:block overflow-x-auto -mx-1">
                  <table className="w-full text-left text-sm min-w-[800px]">
                    <thead>
                      <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-400">
                        <th className="py-3 pr-3 font-extrabold">Date</th>
                        <th className="py-3 pr-3 font-extrabold">Order</th>
                        <th className="py-3 pr-3 font-extrabold">Package</th>
                        <th className="py-3 pr-3 font-extrabold">Payment Method</th>
                        <th className="py-3 pr-3 font-extrabold">Amount</th>
                        <th className="py-3 pr-3 font-extrabold">Status</th>
                        <th className="py-3 font-extrabold text-right">Receipt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((pay: any) => (
                        <tr key={pay.id} className="border-b border-slate-100 last:border-0">
                          <td className="py-3.5 pr-3 text-slate-600 whitespace-nowrap">
                            {formatDate(pay.date)}
                          </td>
                          <td className="py-3.5 pr-3 font-mono text-xs text-slate-800">
                            {pay.orderNumber}
                          </td>
                          <td className="py-3.5 pr-3 font-semibold text-slate-800">
                            {pay.packageName || "-"}
                          </td>
                          <td className="py-3.5 pr-3 text-slate-600">
                            {pay.method || "Card"}
                            {pay.cardLast4 ? ` •••• ${pay.cardLast4}` : ""}
                          </td>
                          <td className="py-3.5 pr-3 font-bold text-slate-900">
                            {formatMoney(pay.amount)}
                          </td>
                          <td className="py-3.5 pr-3">
                            <span
                              className={cn(
                                "inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold border",
                                pay.status === "succeeded"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : pay.status === "failed"
                                    ? "bg-rose-50 text-rose-700 border-rose-200"
                                    : "bg-slate-50 text-slate-600 border-slate-200",
                              )}
                            >
                              {pay.status === "succeeded"
                                ? "Succeeded"
                                : formatProjectStatus(pay.status)}
                            </span>
                          </td>
                          <td className="py-3.5 text-right">
                            {pay.status === "succeeded" ? (
                              <button
                                type="button"
                                onClick={() => setReceiptPay(pay)}
                                className="inline-flex items-center gap-1 text-sm font-bold text-[#B5111B] hover:underline"
                              >
                                <ReceiptIcon className="w-4 h-4" weight="bold" />
                                View
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="md:hidden divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                  {payments.map((pay: any) => (
                    <div key={pay.id} className="p-4 space-y-2 bg-white">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-bold text-slate-900">
                            {formatMoney(pay.amount)}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {formatDate(pay.date)} · {pay.orderNumber}
                          </div>
                        </div>
                        <span
                          className={cn(
                            "inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0",
                            pay.status === "succeeded"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : pay.status === "failed"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-slate-50 text-slate-600 border-slate-200",
                          )}
                        >
                          {pay.status === "succeeded" ? "Succeeded" : formatProjectStatus(pay.status)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-xs text-slate-600">
                        <div className="min-w-0">
                          <span className="font-semibold text-slate-800">
                            {pay.packageName || "-"}
                          </span>
                          <span className="text-slate-400"> · </span>
                          {pay.method || "Card"}
                          {pay.cardLast4 ? ` •••• ${pay.cardLast4}` : ""}
                        </div>
                        {pay.status === "succeeded" && (
                          <button
                            type="button"
                            onClick={() => setReceiptPay(pay)}
                            className="inline-flex items-center gap-1 font-bold text-[#B5111B] shrink-0"
                          >
                            <ReceiptIcon className="w-3.5 h-3.5" weight="bold" />
                            View
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      )}

      <Modal
        isOpen={Boolean(receiptPay)}
        onClose={() => setReceiptPay(null)}
        title="Payment receipt"
        className="max-w-lg"
      >
        {receiptPay && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-0">
              <p className="text-sm font-black text-[#B5111B] mb-3">Rose Associates</p>
              <InfoRow label="Date" value={formatDate(receiptPay.date)} />
              <InfoRow label="Order" value={receiptPay.orderNumber || "-"} />
              <InfoRow label="Package" value={receiptPay.packageName || "-"} />
              <InfoRow
                label="Payment method"
                value={`${receiptPay.method || "Card"}${
                  receiptPay.cardLast4 ? ` •••• ${receiptPay.cardLast4}` : ""
                }`}
              />
              <InfoRow label="Reference" value={receiptPay.reference || "-"} />
              <InfoRow
                label="Status"
                value={receiptPay.status === "succeeded" ? "Succeeded" : receiptPay.status || "-"}
              />
              <InfoRow label="Customer" value={currentUser?.name || "-"} />
              <InfoRow label="Email" value={currentUser?.email || "-"} />
              <InfoRow label="Amount paid" value={formatMoney(receiptPay.amount)} />
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Download a branded Rose Associates PDF receipt for your records.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setReceiptPay(null)}>
                Close
              </Button>
              <Button
                onClick={() => void printPaymentReceipt(receiptPay)}
                className="bg-[#B5111B] hover:bg-[#8F0D15] text-white"
              >
                <PrinterIcon className="w-4 h-4 mr-1.5" weight="bold" />
                Download PDF
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
