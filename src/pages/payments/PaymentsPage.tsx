"use client"

import * as React from "react"
import {
  MagnifyingGlassIcon,
  XIcon,
  UserIcon,
  PrinterIcon,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef, SortingState } from "@tanstack/react-table"
import { apiClient } from "@/lib/api"
import { downloadPaymentReceiptPdf } from "@/lib/payment-receipt"

export type PaymentTrackingStatus = 'Paid' | 'Partially Paid' | 'Payment Hold' | 'Overdue' | 'Failed' | 'Refunded';

export interface AuditTransactionRow {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  projectName: string;
  countyOrState: string;
  paymentType: string;
  paymentMethod: string;
  paidAmount: number;
  totalAmount: number;
  status: PaymentTrackingStatus;
  stageUnlocked: boolean;
  stageLabel: string;
  date: string;
}

const ITEMS_PER_PAGE = 10;

function formatLedgerDate(value?: string | Date | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function mapLedgerRow(raw: any): AuditTransactionRow {
  const statusRaw = String(raw.status || "");
  let status: PaymentTrackingStatus = "Payment Hold";
  if (statusRaw === "Paid") status = "Paid";
  else if (statusRaw === "Failed") status = "Failed";
  else if (statusRaw === "Refunded") status = "Refunded";
  else if (/overdue/i.test(statusRaw)) status = "Overdue";

  const paid = status === "Paid";
  return {
    id: raw.id,
    orderId: String(raw.orderId || ""),
    orderNumber: raw.orderNumber || "—",
    customerName: raw.customerName || "—",
    customerEmail: raw.customerEmail || "—",
    projectName: raw.projectName || "—",
    countyOrState: raw.countyOrState || "—",
    paymentType: raw.paymentType || "Package",
    paymentMethod: raw.method || (raw.cardLast4 ? `Card •••• ${raw.cardLast4}` : "Card (Stub)"),
    paidAmount: paid ? Number(raw.paidAmount || 0) : 0,
    totalAmount: Number(raw.totalAmount || raw.paidAmount || 0),
    status,
    stageUnlocked: paid,
    stageLabel: paid
      ? "Step 2+: Project unlocked"
      : status === "Failed"
        ? "Step 1: Checkout Failed"
        : status === "Refunded"
          ? "Package Cancelled / Refunded"
          : "Step 1: Awaiting Full Payment",
    date: formatLedgerDate(raw.date),
  };
}

export default function PaymentsPage() {
  const [transactions, setTransactions] = React.useState<AuditTransactionRow[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(ITEMS_PER_PAGE);
  const [totalItems, setTotalItems] = React.useState(0);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [mounted, setMounted] = React.useState(false);
  const isFirstSearchDebounce = React.useRef(true);
  const [isLoading, setIsLoading] = React.useState(true);
  const [packagePrices, setPackagePrices] = React.useState({ scorecard: 15000, subscription: 36000, combined: 48000 });
  const [metrics, setMetrics] = React.useState({
    totalCollected: 0,
    paidCount: 0,
    failedCount: 0,
    refundedCount: 0,
    scorecardOnlyCount: 0,
    subscriptionCount: 0,
    combinedCount: 0,
    totalCount: 0,
  });

  // Receipt Modal State
  const [selectedReceiptTxn, setSelectedReceiptTxn] = React.useState<AuditTransactionRow | null>(null);

  React.useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("search")) {
      const s = params.get("search") || "";
      setSearchQuery(s);
      setDebouncedSearch(s);
    }
    const st = params.get("status");
    if (st && ["paid", "failed", "refunded"].includes(st)) setStatusFilter(st);
    if (params.get("page")) setCurrentPage(Math.max(1, parseInt(params.get("page") || "1", 10)));
    if (params.get("limit")) {
      setPageSize(Math.max(1, parseInt(params.get("limit") || String(ITEMS_PER_PAGE), 10)));
    }
  }, []);

  React.useEffect(() => {
    if (isFirstSearchDebounce.current) {
      isFirstSearchDebounce.current = false;
      return;
    }
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 600);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  React.useEffect(() => {
    if (typeof window === "undefined" || !mounted) return;
    const params = new URLSearchParams();
    if (currentPage > 1) params.set("page", String(currentPage));
    if (pageSize !== ITEMS_PER_PAGE) params.set("limit", String(pageSize));
    if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
    if (statusFilter !== "all") params.set("status", statusFilter);
    const newQuery = params.toString() ? `?${params.toString()}` : "";
    window.history.replaceState(null, "", `/payments${newQuery}`);
  }, [currentPage, pageSize, debouncedSearch, statusFilter, mounted]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const packages = await apiClient.getOrderPackages();
      if (cancelled) return;
      const byType = Object.fromEntries(packages.map((p) => [p.packageType, p.amount]));
      setPackagePrices({
        scorecard: Number(byType.scorecard_only || 15000),
        subscription: Number(byType.subscription || 36000),
        combined: Number(byType.combined || 48000),
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadLedger = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const ledger = await apiClient.getPaymentLedger({
        search: debouncedSearch.trim(),
        status: statusFilter,
        page: currentPage,
        limit: pageSize,
      });
      if (!ledger) {
        setTransactions([]);
        setTotalItems(0);
        return;
      }
      setTransactions((ledger.data || []).map(mapLedgerRow));
      setTotalItems(typeof ledger.total === "number" ? ledger.total : (ledger.data || []).length);
      if (ledger.summary) {
        setMetrics({
          totalCollected: Number(ledger.summary.totalCollected || 0),
          paidCount: Number(ledger.summary.paidCount || 0),
          failedCount: Number(ledger.summary.failedCount || 0),
          refundedCount: Number(ledger.summary.refundedCount || 0),
          scorecardOnlyCount: Number(ledger.summary.scorecardOnlyCount || 0),
          subscriptionCount: Number(ledger.summary.subscriptionCount || 0),
          combinedCount: Number(ledger.summary.combinedCount || 0),
          totalCount: Number(ledger.summary.totalCount || 0),
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, statusFilter, currentPage, pageSize]);

  React.useEffect(() => {
    if (mounted) loadLedger();
  }, [loadLedger, mounted]);

  const paginatedTransactions = React.useMemo(() => {
    if (sorting.length === 0) return transactions;
    const { id, desc } = sorting[0];
    return [...transactions].sort((a, b) => {
      const av = (a as any)[id];
      const bv = (b as any)[id];
      if (typeof av === "number" && typeof bv === "number") return desc ? bv - av : av - bv;
      return desc
        ? String(bv ?? "").localeCompare(String(av ?? ""))
        : String(av ?? "").localeCompare(String(bv ?? ""));
    });
  }, [transactions, sorting]);

  // Status Badge Renderer (MATCHES USERS PAGE EXACTLY)
  const renderStatusBadge = (status: PaymentTrackingStatus) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-block text-[11px] font-extrabold text-white bg-emerald-600 px-3 py-1 rounded-md shadow-2xs">
            Paid
          </span>
        );
      case 'Partially Paid':
        return (
          <span className="inline-block text-[11px] font-extrabold text-white bg-amber-600 px-3 py-1 rounded-md shadow-2xs">
            Partially Paid
          </span>
        );
      case 'Payment Hold':
        return (
          <span className="inline-block text-[11px] font-extrabold text-white bg-[#7c0d15] px-3 py-1 rounded-md shadow-2xs">
            Payment Hold
          </span>
        );
      case 'Overdue':
        return (
          <span className="inline-block text-[11px] font-extrabold text-white bg-rose-700 px-3 py-1 rounded-md shadow-2xs">
            Overdue
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-block text-[11px] font-extrabold text-white bg-rose-700 px-3 py-1 rounded-md shadow-2xs">
            Failed
          </span>
        );
      case 'Refunded':
      default:
        return (
          <span className="inline-block text-[11px] font-extrabold text-white bg-slate-600 px-3 py-1 rounded-md shadow-2xs">
            Refunded
          </span>
        );
    }
  };

  const paymentColumns = React.useMemo<ColumnDef<AuditTransactionRow>[]>(() => [
    {
      accessorKey: "customerName",
      header: "Order / Customer",
      cell: ({ row }) => {
        const txn = row.original;
        return (
          <div className="flex items-center gap-2.5">
            <div
              onClick={() => setSelectedReceiptTxn(txn)}
              className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-500 flex items-center justify-center shrink-0 shadow-2xs cursor-pointer hover:bg-slate-200/70 hover:scale-105 transition-all"
            >
              <UserIcon weight="duotone" className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <div
                onClick={() => setSelectedReceiptTxn(txn)}
                className="font-bold text-slate-900 text-xs hover:text-blue-600 transition-colors cursor-pointer"
              >
                {txn.customerName}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">{txn.orderNumber} • {txn.date}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "paymentType",
      header: "Payment Type",
      cell: ({ row }) => (
        <span className="font-bold text-slate-800 text-xs">{row.original.paymentType}</span>
      ),
    },
    {
      accessorKey: "paidAmount",
      header: "Amount Paid",
      cell: ({ row }) => (
        <span className="font-black text-slate-900 text-xs">
          ${row.original.paidAmount.toLocaleString("en-US")}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Payment Tracking Status",
      cell: ({ row }) => renderStatusBadge(row.original.status),
    },
    {
      id: "actions",
      header: "Action",
      enableSorting: false,
      meta: { align: "right", cellClassName: "w-[120px]" },
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setSelectedReceiptTxn(row.original)}
          className="text-xs font-bold text-[#B5111B] hover:text-[#8F0D15] hover:bg-red-50 cursor-pointer rounded-xl h-7 px-2.5"
        >
          View Receipt
        </Button>
      ),
    },
  ], []);

  return (
    <div className="space-y-3 sm:space-y-3.5 w-full pb-0 text-left">
      {/* 4 High-Impact Stat Cards (MATCHES ORDERS PAGE DESIGN EXACTLY: Dark Red, Light Red, Slate, Dark Gray Theme) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Total Revenue Collected (DARK RED) */}
        <div className="relative rounded-2xl p-3.5 sm:p-4 overflow-hidden bg-[#7c0d15] text-white shadow-md hover:shadow-xl transition-all duration-300 group cursor-default border border-red-900/40">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
            style={{ backgroundImage: `url('https://i0.wp.com/roseassociates.com/wp-content/uploads/2022/09/properties.png?fit=1200%2C300&ssl=1')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#7c0d15] via-[#7c0d15]/90 to-[#7c0d15]/65 pointer-events-none" />
          <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none stroke-white" viewBox="0 0 300 120" fill="none">
            <path d="M-20 30 Q 90 110, 190 20 T 330 90" strokeWidth="2.5" />
            <path d="M-20 70 Q 110 130, 210 30 T 350 110" strokeWidth="1.5" />
          </svg>

          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-red-100 block drop-shadow-xs">Total Revenue Collected</span>
              <h3 className="text-2xl sm:text-3xl font-black text-white leading-none tracking-tight drop-shadow-md">
                ${metrics.totalCollected.toLocaleString('en-US')}
              </h3>
              <span className="text-[10px] font-bold text-white flex items-center gap-1 mt-1.5 bg-black/40 backdrop-blur-md border border-white/20 px-2.5 py-0.5 rounded-full w-fit">
                Verified Settlements ({metrics.totalCount})
              </span>
            </div>
            <div className="flex items-end gap-1.5 h-10 shrink-0 opacity-95 group-hover:scale-110 transition-transform duration-300 pr-1">
              <div className="w-2 h-3.5 bg-white/40 rounded-full shadow-xs" />
              <div className="w-2 h-6 bg-white/60 rounded-full shadow-xs" />
              <div className="w-2 h-4 bg-white/40 rounded-full shadow-xs" />
              <div className="w-2 h-8 bg-white/80 rounded-full shadow-xs" />
              <div className="w-2 h-5 bg-white/50 rounded-full shadow-xs" />
              <div className="w-2 h-10 bg-white rounded-full shadow-md animate-pulse border border-white/80" />
            </div>
          </div>
        </div>

        {/* Card 2: Scorecard Only package */}
        <div className="relative rounded-2xl p-3.5 sm:p-4 overflow-hidden bg-[#b5111b] text-white shadow-md hover:shadow-xl transition-all duration-300 group cursor-default border border-red-500/30">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
            style={{ backgroundImage: `url('https://i0.wp.com/roseassociates.com/wp-content/uploads/2022/09/services-.png?fit=1200%2C300&ssl=1')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#b5111b] via-[#c41e2a]/90 to-[#b5111b]/65 pointer-events-none" />
          <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none stroke-white" viewBox="0 0 300 120" fill="none">
            <circle cx="260" cy="20" r="35" strokeWidth="1.5" />
            <circle cx="260" cy="20" r="70" strokeWidth="2" strokeDasharray="5 4" />
            <circle cx="260" cy="20" r="105" strokeWidth="1.5" />
          </svg>

          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-red-100 block drop-shadow-xs">Scorecard Only</span>
              <h3 className="text-2xl sm:text-3xl font-black text-white leading-none tracking-tight drop-shadow-md">
                ${packagePrices.scorecard.toLocaleString("en-US")} <span className="text-xs font-bold text-red-100">/ Plan</span>
              </h3>
              <span className="text-[10px] font-bold text-white flex items-center gap-1 mt-1.5 bg-black/40 backdrop-blur-md border border-white/20 px-2.5 py-0.5 rounded-full w-fit">
                {metrics.scorecardOnlyCount} orders
              </span>
            </div>
            <div className="w-20 sm:w-24 h-10 shrink-0 opacity-95 group-hover:scale-110 transition-transform duration-300 pr-1">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" fill="none">
                <defs>
                  <linearGradient id="paySubSparkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d="M0 34 C 20 30, 30 14, 50 20 C 70 26, 80 8, 98 4 L 98 40 L 0 40 Z" fill="url(#paySubSparkGrad)" />
                <path d="M0 34 C 20 30, 30 14, 50 20 C 70 26, 80 8, 98 4" stroke="white" strokeWidth="3" strokeLinecap="round" />
                <circle cx="98" cy="4" r="4" fill="#34d399" className="animate-ping" />
                <circle cx="98" cy="4" r="3.5" fill="white" />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 3: Subscription + Combined packages */}
        <div className="relative rounded-2xl p-3.5 sm:p-4 overflow-hidden bg-[#475569] text-white shadow-md hover:shadow-xl transition-all duration-300 group cursor-default border border-slate-500/40">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
            style={{ backgroundImage: `url('https://i0.wp.com/roseassociates.com/wp-content/uploads/2022/09/cross-services.png?fit=1200%2C300&ssl=1')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#475569] via-[#334155]/90 to-[#334155]/65 pointer-events-none" />
          <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none stroke-white" viewBox="0 0 300 120" fill="none">
            <path d="M-50 0 L350 120 M-50 40 L350 160 M-50 -40 L350 80" strokeWidth="1.5" />
            <path d="M350 0 L-50 120 M350 40 L-50 160 M350 -40 L-50 80" strokeWidth="1.5" />
          </svg>

          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-100 block drop-shadow-xs">Multi-Year & Combined</span>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                ${(packagePrices.subscription / 1000).toFixed(0)}k{" "}
                <span className="text-xl sm:text-2xl font-black text-white leading-tight tracking-tight drop-shadow-md">/ ${(packagePrices.combined / 1000).toFixed(0)}k</span>
              </h3>
              <span className="text-[10px] font-bold text-white flex items-center gap-1 mt-1.5 bg-black/40 backdrop-blur-md border border-white/20 px-2.5 py-0.5 rounded-full w-fit">
                Sub {metrics.subscriptionCount} · Combined {metrics.combinedCount}
              </span>
            </div>
            <div className="w-16 sm:w-20 h-10 shrink-0 opacity-95 group-hover:scale-110 transition-transform duration-300 pr-1 flex items-center justify-center">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 80 44" fill="none">
                <path d="M 10 38 A 30 30 0 0 1 70 38" stroke="rgba(255,255,255,0.25)" strokeWidth="6" strokeLinecap="round" />
                <path d="M 10 38 A 30 30 0 0 1 40 8" stroke="#fbbf24" strokeWidth="6" strokeLinecap="round" />
                <circle cx="40" cy="8" r="4.5" fill="white" className="shadow-md" />
                <circle cx="40" cy="8" r="2.5" fill="#fbbf24" />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 4: Holds & Overdue (DARK CHARCOAL) */}
        <div className="relative rounded-2xl p-3.5 sm:p-4 overflow-hidden bg-[#0f172a] text-white shadow-md hover:shadow-xl transition-all duration-300 group cursor-default border border-slate-800">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
            style={{ backgroundImage: `url('https://i0.wp.com/roseassociates.com/wp-content/uploads/2023/01/newspapers.png?fit=1200%2C300&ssl=1')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-[#0f172a]/95 to-[#1e293b]/70 pointer-events-none" />
          <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none stroke-slate-300" viewBox="0 0 300 120" fill="none">
            <line x1="0" y1="100" x2="300" y2="10" strokeWidth="1.5" strokeDasharray="6 4" />
            <line x1="20" y1="120" x2="280" y2="-10" strokeWidth="2" />
            <line x1="-10" y1="40" x2="250" y2="130" strokeWidth="1.5" />
            <circle cx="180" cy="35" r="4" fill="white" opacity="0.8" />
            <circle cx="90" cy="70" r="3" fill="white" opacity="0.8" />
          </svg>

          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-200 block drop-shadow-xs">Failed & Refunded</span>
              <h3 className="text-2xl sm:text-3xl font-black text-amber-400 leading-none tracking-tight drop-shadow-md">
                {metrics.failedCount + metrics.refundedCount}{" "}
                <span className="text-xs font-bold text-slate-200">Attempts</span>
              </h3>
              <span className="text-[10px] font-bold text-white flex items-center gap-1 mt-1.5 bg-black/40 backdrop-blur-md border border-white/20 px-2.5 py-0.5 rounded-full w-fit">
                Failed {metrics.failedCount} · Refunded {metrics.refundedCount}
              </span>
            </div>
            <div className="w-20 sm:w-24 h-10 shrink-0 opacity-95 group-hover:scale-110 transition-transform duration-300 pr-1">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" fill="none">
                <path d="M0 35 L 20 28 L 40 32 L 60 18 L 80 22 L 100 8" stroke="#fbbf24" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <circle cx="100" cy="8" r="3" fill="#fbbf24" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar + shared DataTable (no outer card — DataTable has its own chrome) */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
          {/* Search Box */}
          <div className="relative w-full lg:w-80">
            <MagnifyingGlassIcon weight="bold" className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Customer, Order #, Project or Type..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#B5111B] shadow-2xs font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <XIcon weight="bold" className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Segmented Filter Pills — attempt statuses */}
          <div className="bg-white p-1 rounded-xl border border-slate-200 flex items-center gap-1 overflow-x-auto shadow-2xs">
            {([
              { id: "all", label: `All (${metrics.totalCount})`, active: "bg-[#B5111B] text-white", idle: "text-slate-600 hover:bg-slate-50" },
              { id: "paid", label: `Paid (${metrics.paidCount})`, active: "bg-emerald-600 text-white", idle: "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700" },
              { id: "failed", label: `Failed (${metrics.failedCount})`, active: "bg-rose-900 text-white", idle: "text-slate-600 hover:bg-rose-50 hover:text-rose-700" },
              { id: "refunded", label: `Refunded (${metrics.refundedCount})`, active: "bg-slate-700 text-white", idle: "text-slate-600 hover:bg-slate-100" },
            ] as const).map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setStatusFilter(tab.id);
                  setCurrentPage(1);
                }}
                className={cn(
                  "px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap",
                  statusFilter === tab.id
                    ? `${tab.active} shadow-xs font-extrabold`
                    : tab.idle,
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <DataTable
          columns={paymentColumns}
          data={paginatedTransactions}
          totalItems={totalItems}
          page={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          sorting={sorting}
          onSortingChange={setSorting}
          isLoading={isLoading}
        />
            </div>

      {/* RECEIPT MODAL */}
      {selectedReceiptTxn && (
        <Modal
          isOpen={!!selectedReceiptTxn}
          onClose={() => setSelectedReceiptTxn(null)}
          title="Payment Audit Receipt & Settlement Details"
          className="max-w-md w-[94%] sm:w-full rounded-2xl sm:rounded-3xl"
        >
          <div className="space-y-4 text-left">
            <div className="p-4 bg-slate-50/90 border border-slate-200/90 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Transaction ID: {selectedReceiptTxn.id}</span>
                <div>{renderStatusBadge(selectedReceiptTxn.status)}</div>
              </div>
              <h3 className="text-base font-extrabold text-slate-900">{selectedReceiptTxn.customerName}</h3>
              <p className="text-xs text-slate-500 font-mono">{selectedReceiptTxn.orderNumber} • {selectedReceiptTxn.projectName}</p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Payment Type:</span>
                <span className="font-bold text-slate-900">{selectedReceiptTxn.paymentType}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Amount Settled:</span>
                <span className="font-black text-emerald-700 text-sm">${selectedReceiptTxn.paidAmount.toLocaleString('en-US')}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedReceiptTxn(null)}
                className="rounded-xl font-bold text-xs"
              >
                Close
              </Button>
              <Button
                size="sm"
                disabled={!selectedReceiptTxn.orderId}
                onClick={() =>
                  void downloadPaymentReceiptPdf({
                    orderId: selectedReceiptTxn.orderId,
                    attemptId: selectedReceiptTxn.id,
                    id: selectedReceiptTxn.id,
                    orderNumber: selectedReceiptTxn.orderNumber,
                  })
                }
                className="bg-[#B5111B] hover:bg-[#8F0D15] text-white rounded-xl font-bold text-xs"
              >
                <PrinterIcon className="w-3.5 h-3.5 mr-1" weight="bold" />
                Download PDF
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
