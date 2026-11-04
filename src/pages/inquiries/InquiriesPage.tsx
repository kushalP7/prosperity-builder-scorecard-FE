"use client"

import * as React from "react"
import {
  ColumnDef,
  SortingState,
} from "@tanstack/react-table"
import {
  MagnifyingGlassIcon,
  XIcon,
  SpinnerGapIcon,
  EnvelopeSimpleIcon,
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

  const isSuperAdmin = currentUser?.role === "super_admin"

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
        cell: ({ row }) => {
          const r = row.original
          const gov = r.leadRole === "county" || r.leadRole === "city"
          const busy = actionId === r.id
          if (!gov) {
            return <span className="text-[11px] text-slate-400">No portal invite</span>
          }
          const isRegistered = r.status === "registered"
          const displayName = [r.firstName, r.lastName].filter(Boolean).join(" ").trim() || "user"
          if (isRegistered) {
            return (
              <Button
                type="button"
                disabled={busy}
                onClick={() => handleResendLogin(r)}
                className="h-7 px-2.5 rounded-lg text-[11px] font-bold bg-white border border-sky-200 text-sky-800 hover:bg-sky-50 cursor-pointer shadow-none"
                title={`Resend login reminder to ${displayName}`}
              >
                {busy ? (
                  <SpinnerGapIcon className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <EnvelopeSimpleIcon weight="bold" className="w-3.5 h-3.5 mr-1 shrink-0" />
                    <span className="truncate max-w-[180px]">
                      Resend login reminder
                    </span>
                  </>
                )}
              </Button>
            )
          }
          return (
            <Button
              type="button"
              disabled={busy}
              onClick={() => handleSendAccess(r)}
              className="h-7 px-2.5 rounded-lg text-[11px] font-bold bg-[#7c0d15] hover:bg-[#b5111b] text-white cursor-pointer"
              title="Send portal access / invite"
            >
              {busy ? (
                <SpinnerGapIcon className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <EnvelopeSimpleIcon weight="bold" className="w-3.5 h-3.5 mr-1 shrink-0" />
                  Portal access
                </>
              )}
            </Button>
          )
        },
      },
    ],
    [actionId],
  )

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
    </div>
  )
}
