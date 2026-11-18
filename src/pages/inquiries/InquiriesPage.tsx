"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import {
  ColumnDef,
  SortingState,
} from "@tanstack/react-table"
import {
  MagnifyingGlassIcon,
  XIcon,
  SpinnerGapIcon,
  EnvelopeSimpleIcon,
  DotsThreeVerticalIcon,
  SignInIcon,
} from "@phosphor-icons/react"
import { DataTable } from "@/components/ui/data-table"
import { Dropdown } from "@/components/ui/dropdown"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store"
import { apiClient } from "@/lib/api"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import { INQUIRY_LEAD_ROLE_OPTIONS } from "@/lib/inquiries-api"

const ITEMS_PER_PAGE = 10

type InquiryRow = {
  id: string
  firstName: string
  lastName: string
  organizationName: string
  jobTitle?: string
  businessEmail: string
  phoneNumber: string
  city: string
  state: string
  leadRole: string
  status: string
  userId?: string | null
  invitedAt?: string | null
  createdAt: string
}

const LEAD_LABELS: Record<string, string> = {
  county: "County Rep",
  city: "City/Town Rep",
  partner_vendor: "Partners & Vendors",
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  invited: "bg-blue-50 text-blue-800 border-blue-200",
  registered: "bg-emerald-50 text-emerald-800 border-emerald-200",
  closed: "bg-slate-100 text-slate-600 border-slate-200",
  contacted: "bg-slate-100 text-slate-600 border-slate-200",
  qualified: "bg-slate-100 text-slate-600 border-slate-200",
}

export default function InquiriesPage() {
  const { currentUser } = useAppStore()
  const [rows, setRows] = React.useState<InquiryRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [actionId, setActionId] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [leadRole, setLeadRole] = React.useState("all")
  const [status, setStatus] = React.useState("all")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(ITEMS_PER_PAGE)
  const [totalItems, setTotalItems] = React.useState(0)
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "createdAt", desc: true }])
  const [mounted, setMounted] = React.useState(false)
  const isFirstSearchDebounce = React.useRef(true)
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null)
  const [actionMenuPos, setActionMenuPos] = React.useState<{
    top: number
    left: number
    openUp: boolean
  } | null>(null)
  const actionButtonRefs = React.useRef<Record<string, HTMLButtonElement | null>>({})

  const isSuperAdmin = currentUser?.role === "super_admin"

  const closeActionMenu = React.useCallback(() => {
    setActiveMenuId(null)
    setActionMenuPos(null)
  }, [])

  const openActionMenu = React.useCallback(
    (id: string) => {
      if (activeMenuId === id) {
        closeActionMenu()
        return
      }
      const btn = actionButtonRefs.current[id]
      if (!btn) {
        setActiveMenuId(id)
        return
      }
      const rect = btn.getBoundingClientRect()
      const menuHeight = 160
      const spaceBelow = window.innerHeight - rect.bottom
      const openUp = spaceBelow < menuHeight + 12
      setActionMenuPos({
        top: openUp ? rect.top - 8 : rect.bottom + 8,
        left: Math.max(12, rect.right - 224),
        openUp,
      })
      setActiveMenuId(id)
    },
    [activeMenuId, closeActionMenu],
  )

  React.useEffect(() => {
    setMounted(true)
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    if (params.get("search")) {
      const s = params.get("search") || ""
      setSearchQuery(s)
      setDebouncedSearch(s)
    }
    const lr = params.get("leadRole")
    if (lr && ["county", "city", "partner_vendor"].includes(lr)) setLeadRole(lr)
    const st = params.get("status")
    if (st && ["pending", "invited", "registered", "closed"].includes(st)) setStatus(st)
    if (params.get("page")) setCurrentPage(Math.max(1, parseInt(params.get("page") || "1", 10)))
    if (params.get("limit")) {
      setPageSize(Math.max(1, parseInt(params.get("limit") || String(ITEMS_PER_PAGE), 10)))
    }
  }, [])

  React.useEffect(() => {
    if (isFirstSearchDebounce.current) {
      isFirstSearchDebounce.current = false
      return
    }
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1)
    }, 600)
    return () => clearTimeout(timer)
  }, [searchQuery])

  React.useEffect(() => {
    if (typeof window === "undefined" || !mounted) return
    const params = new URLSearchParams()
    if (currentPage > 1) params.set("page", String(currentPage))
    if (pageSize !== ITEMS_PER_PAGE) params.set("limit", String(pageSize))
    if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim())
    if (leadRole !== "all") params.set("leadRole", leadRole)
    if (status !== "all") params.set("status", status)
    const qs = params.toString() ? `?${params.toString()}` : ""
    window.history.replaceState(null, "", `/inquiries${qs}`)
  }, [currentPage, pageSize, debouncedSearch, leadRole, status, mounted])

  const sortBy = sorting[0]?.id || "createdAt"
  const sortDir = sorting[0]?.desc === false ? "ASC" : "DESC"

  const fetchInquiries = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiClient.getInquiries({
        search: debouncedSearch.trim(),
        leadRole,
        status,
        page: currentPage,
        limit: pageSize,
        sortBy,
        sortDir,
      })
      if (res) {
        setRows((res.data || []) as InquiryRow[])
        setTotalItems(typeof res.total === "number" ? res.total : (res.data || []).length)
      } else {
        setRows([])
        setTotalItems(0)
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to load inquiries")
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, leadRole, status, currentPage, pageSize, sortBy, sortDir])

  React.useEffect(() => {
    if (mounted && isSuperAdmin) fetchInquiries()
  }, [fetchInquiries, mounted, isSuperAdmin])

  const handleSendAccess = async (row: InquiryRow) => {
    setActionId(row.id)
    try {
      const res = await apiClient.sendInquiryPortalAccess(row.id)
      if (res.success) {
        toast.success(res.message || "Portal access processed")
        await fetchInquiries()
      } else {
        toast.error(res.message || "Failed")
      }
    } finally {
      setActionId(null)
    }
  }

  const handleResendLogin = async (row: InquiryRow) => {
    setActionId(row.id)
    try {
      const res = await apiClient.resendInquiryLogin(row.id)
      if (res.success) {
        toast.success(res.message || "Login reminder sent")
        await fetchInquiries()
      } else {
        toast.error(res.message || "Failed")
      }
    } finally {
      setActionId(null)
    }
  }

  const handleSendSetPassword = async (row: InquiryRow) => {
    setActionId(row.id)
    try {
      const res = await apiClient.sendInquirySetPassword(row.id)
      if (res.success) {
        toast.success(res.message || "Set-password email sent")
        await fetchInquiries()
      } else {
        toast.error(res.message || "Failed")
      }
    } finally {
      setActionId(null)
    }
  }

  const columns = React.useMemo<ColumnDef<InquiryRow>[]>(
    () => [
      {
        accessorKey: "firstName",
        header: "Contact",
        cell: ({ row }) => (
          <div>
            <div className="text-xs font-bold text-slate-900">
              {row.original.firstName} {row.original.lastName}
            </div>
            <div className="text-[11px] text-slate-500">{row.original.jobTitle || "-"}</div>
          </div>
        ),
      },
      {
        accessorKey: "organizationName",
        header: "Organization",
        cell: ({ row }) => (
          <div className="text-xs font-semibold text-slate-800 max-w-[160px] truncate">
            {row.original.organizationName}
          </div>
        ),
      },
      {
        accessorKey: "businessEmail",
        header: "Email",
        cell: ({ row }) => (
          <div className="text-xs text-slate-700">{row.original.businessEmail}</div>
        ),
      },
      {
        accessorKey: "city",
        header: "Location",
        cell: ({ row }) => (
          <div className="text-xs text-slate-600">
            {row.original.city}, {row.original.state}
          </div>
        ),
      },
      {
        accessorKey: "leadRole",
        header: "Lead role",
        cell: ({ row }) => (
          <span className="inline-flex text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md border border-slate-200 bg-slate-50 text-slate-700">
            {LEAD_LABELS[row.original.leadRole] || row.original.leadRole}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={cn(
              "inline-flex text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md border",
              STATUS_STYLES[row.original.status] || STATUS_STYLES.pending,
            )}
          >
            {row.original.status}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Submitted",
        cell: ({ row }) => (
          <div className="text-[11px] text-slate-500 whitespace-nowrap">
            {row.original.createdAt
              ? new Date(row.original.createdAt).toLocaleString()
              : "-"}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        meta: { align: "right", cellClassName: "w-[72px]" },
        cell: ({ row }) => {
          const r = row.original
          const gov = r.leadRole === "county" || r.leadRole === "city"
          const busy = actionId === r.id
          if (!gov) {
            return <span className="text-[11px] text-slate-400">No portal invite</span>
          }
          return (
            <Button
              ref={(el) => {
                actionButtonRefs.current[r.id] = el
              }}
              type="button"
              size="sm"
              variant="ghost"
              disabled={busy}
              onClick={() => openActionMenu(r.id)}
              className="w-7 h-7 p-0 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 inline-flex items-center justify-center cursor-pointer transition-colors"
              title="Actions"
            >
              {busy ? (
                <SpinnerGapIcon className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <DotsThreeVerticalIcon weight="bold" className="w-3.5 h-3.5" />
              )}
            </Button>
          )
        },
      },
    ],
    [actionId, openActionMenu],
  )

  const activeMenuRow = activeMenuId
    ? rows.find((r) => r.id === activeMenuId) || null
    : null

  if (!isSuperAdmin) {
    return (
      <div className="space-y-3 sm:space-y-3.5 w-full pb-0 text-sm text-slate-600">
        Inquiries are only available to Super Admins.
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-3.5 w-full pb-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#7c0d15]/10 text-[#7c0d15] border border-[#7c0d15]/20">
            <EnvelopeSimpleIcon weight="duotone" className="w-5 h-5 text-[#b5111b]" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
              Enterprise Inquiries
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Review leads and send portal access to Authorized County / City representatives. Partners &amp; Vendors are listed for follow-up only.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
            <div className="relative flex-1 max-w-sm">
              <MagnifyingGlassIcon weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, org, email, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <XIcon weight="bold" className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Dropdown
              value={leadRole}
              onChange={(v) => {
                setLeadRole(v)
                setCurrentPage(1)
              }}
              align="right"
              title="LEAD ROLE:"
              options={[
                { value: "all", label: "All lead roles" },
                ...INQUIRY_LEAD_ROLE_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
              ]}
            />
            <Dropdown
              value={status}
              onChange={(v) => {
                setStatus(v)
                setCurrentPage(1)
              }}
              align="right"
              title="STATUS:"
              options={[
                { value: "all", label: "All statuses" },
                { value: "pending", label: "Pending" },
                { value: "invited", label: "Invited" },
                { value: "registered", label: "Registered" },
                { value: "closed", label: "Closed" },
              ]}
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={rows}
          totalItems={totalItems}
          page={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setCurrentPage(1)
          }}
          sorting={sorting}
          onSortingChange={setSorting}
          isLoading={loading}
          emptyMessage="No inquiries found."
        />
      </div>

      {activeMenuRow && actionMenuPos && typeof document !== "undefined" && createPortal(
        <>
          <div className="fixed inset-0 z-[60]" onClick={closeActionMenu} />
          <div
            className="fixed z-[70] w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 animate-in fade-in zoom-in-95 duration-150"
            style={{
              top: actionMenuPos.openUp ? undefined : actionMenuPos.top,
              bottom: actionMenuPos.openUp ? window.innerHeight - actionMenuPos.top : undefined,
              left: actionMenuPos.left,
            }}
          >
            <div className="px-3 py-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
              Inquiry Actions
            </div>
            {activeMenuRow.status === "registered" ? (
              <>
                <button
                  type="button"
                  disabled={actionId === activeMenuRow.id}
                  onClick={() => {
                    closeActionMenu()
                    void handleSendSetPassword(activeMenuRow)
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <EnvelopeSimpleIcon weight="duotone" className="w-4 h-4 text-[#B5111B] shrink-0" />
                  <span>Set password mail</span>
                </button>
                <button
                  type="button"
                  disabled={actionId === activeMenuRow.id}
                  onClick={() => {
                    closeActionMenu()
                    void handleResendLogin(activeMenuRow)
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <SignInIcon weight="duotone" className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>Login reminder</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  disabled={actionId === activeMenuRow.id}
                  onClick={() => {
                    closeActionMenu()
                    void handleSendAccess(activeMenuRow)
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <EnvelopeSimpleIcon weight="duotone" className="w-4 h-4 text-[#B5111B] shrink-0" />
                  <span>Portal access</span>
                </button>
                {(activeMenuRow.status === "invited" || activeMenuRow.userId) && (
                  <button
                    type="button"
                    disabled={actionId === activeMenuRow.id}
                    onClick={() => {
                      closeActionMenu()
                      void handleSendSetPassword(activeMenuRow)
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <EnvelopeSimpleIcon weight="duotone" className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Set password mail</span>
                  </button>
                )}
              </>
            )}
          </div>
        </>,
        document.body,
      )}
    </div>
  )
}
