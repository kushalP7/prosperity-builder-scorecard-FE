"use client"

import * as React from "react"
import {
  DollarSign,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lock,
  Unlock,
  ShieldCheck,
  Receipt,
  Building2,
  MapPin,
  X,
  FileText,
  TrendingUp,
  ArrowUpRight,
  ShieldAlert,
  ChevronRight,
  ChevronLeft,
  MoreVertical,
  Check,
  User,
  Filter,
  CreditCard,
  Send,
  RotateCcw,
  XCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

export type PaymentTrackingStatus = 'Paid' | 'Partially Paid' | 'Payment Hold' | 'Overdue' | 'Failed' | 'Refunded';

export interface AuditTransactionRow {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  projectName: string;
  countyOrState: string;
  paymentType: "Platform Subscription ($149)" | "Report Generation Plan ($99)" | "Pay in Parts (50% Deposit)" | "Pay in Full ($248)";
  paymentMethod: string;
  paidAmount: number;
  totalAmount: number;
  status: PaymentTrackingStatus;
  stageUnlocked: boolean;
  stageLabel: string;
  date: string;
}

const ITEMS_PER_PAGE = 10;

const INITIAL_TRANSACTIONS: AuditTransactionRow[] = [
  {
    id: "TXN-8801",
    orderNumber: "ORD-2026-001",
    customerName: "Johnathan Smith",
    customerEmail: "jsmith@wakegov.com",
    projectName: "Metropolis Master Plan 2026",
    countyOrState: "Wake County, NC",
    paymentType: "Platform Subscription ($149)",
    paymentMethod: "ACH / U.S. Bank Debit",
    paidAmount: 149,
    totalAmount: 248,
    status: "Partially Paid",
    stageUnlocked: true,
    stageLabel: "Step 2: Questionnaire Filled",
    date: "Aug 18, 2026"
  },
  {
    id: "TXN-8802",
    orderNumber: "ORD-2026-002",
    customerName: "Elena Rodriguez",
    customerEmail: "erodriguez@nycedc.org",
    projectName: "Hudson Yards District Vision 2026",
    countyOrState: "New York County, NY",
    paymentType: "Pay in Full ($248)",
    paymentMethod: "Corporate Bank Transfer",
    paidAmount: 248,
    totalAmount: 248,
    status: "Paid",
    stageUnlocked: true,
    stageLabel: "Step 6: Complete Report Delivered",
    date: "Aug 17, 2026"
  },
  {
    id: "TXN-8803",
    orderNumber: "ORD-2026-003",
    customerName: "Marcus Vance",
    customerEmail: "mvance@riversidedev.org",
    projectName: "Riverside Gateway Plan 2026",
    countyOrState: "Cook County, IL",
    paymentType: "Report Generation Plan ($99)",
    paymentMethod: "ACH Direct Debit",
    paidAmount: 99,
    totalAmount: 99,
    status: "Paid",
    stageUnlocked: true,
    stageLabel: "Step 3: 3rd Party Web Data",
    date: "Aug 15, 2026"
  },
  {
    id: "TXN-8804",
    orderNumber: "ORD-2026-004",
    customerName: "Sarah Jenkins",
    customerEmail: "s.jenkins@midtownalliance.org",
    projectName: "Midtown Tech District 2026",
    countyOrState: "Fulton County, GA",
    paymentType: "Pay in Parts (50% Deposit)",
    paymentMethod: "ACH / U.S. Bank Debit",
    paidAmount: 124,
    totalAmount: 248,
    status: "Payment Hold",
    stageUnlocked: false,
    stageLabel: "Step 3 Hold (Auth Required)",
    date: "Aug 12, 2026"
  },
  {
    id: "TXN-8805",
    orderNumber: "ORD-2026-005",
    customerName: "Robert Chen",
    customerEmail: "rchen@harborport.gov",
    projectName: "Harbor View Revitalization 2026",
    countyOrState: "King County, WA",
    paymentType: "Platform Subscription ($149)",
    paymentMethod: "ACH Wire Transfer",
    paidAmount: 0,
    totalAmount: 149,
    status: "Overdue",
    stageUnlocked: false,
    stageLabel: "Step 1 Blocked (Unpaid)",
    date: "Aug 01, 2026"
  },
  {
    id: "TXN-8806",
    orderNumber: "ORD-2026-006",
    customerName: "Sophia Martinez",
    customerEmail: "smartinez@austincommunity.org",
    projectName: "Community Gardens 2026",
    countyOrState: "Travis County, TX",
    paymentType: "Report Generation Plan ($99)",
    paymentMethod: "ACH Direct Debit",
    paidAmount: 0,
    totalAmount: 99,
    status: "Failed",
    stageUnlocked: false,
    stageLabel: "Step 4 Blocked (ACH Failed)",
    date: "Jul 28, 2026"
  },
  {
    id: "TXN-8807",
    orderNumber: "ORD-2026-007",
    customerName: "David Miller",
    customerEmail: "dmiller@denverurban.gov",
    projectName: "Downtown Transportation Corridor 2026",
    countyOrState: "Denver County, CO",
    paymentType: "Platform Subscription ($149)",
    paymentMethod: "Corporate ACH Debit",
    paidAmount: 149,
    totalAmount: 149,
    status: "Paid",
    stageUnlocked: true,
    stageLabel: "Step 2: Questionnaire Filled",
    date: "Jul 25, 2026"
  },
  {
    id: "TXN-8808",
    orderNumber: "ORD-2026-008",
    customerName: "Jessica Taylor",
    customerEmail: "jtaylor@miamidev.org",
    projectName: "Brickell Financial Hub Assessment",
    countyOrState: "Miami-Dade County, FL",
    paymentType: "Report Generation Plan ($99)",
    paymentMethod: "ACH / Bank Wire",
    paidAmount: 99,
    totalAmount: 99,
    status: "Paid",
    stageUnlocked: true,
    stageLabel: "Step 5: Scorecard Certified",
    date: "Jul 20, 2026"
  },
  {
    id: "TXN-8809",
    orderNumber: "ORD-2026-009",
    customerName: "Michael Brown",
    customerEmail: "mbrown@bostonplanning.org",
    projectName: "Seaport Innovation District Master Plan",
    countyOrState: "Suffolk County, MA",
    paymentType: "Pay in Full ($248)",
    paymentMethod: "Corporate Bank Transfer",
    paidAmount: 248,
    totalAmount: 248,
    status: "Paid",
    stageUnlocked: true,
    stageLabel: "Step 6: Complete Report Delivered",
    date: "Jul 15, 2026"
  },
  {
    id: "TXN-8810",
    orderNumber: "ORD-2026-010",
    customerName: "Amanda Wilson",
    customerEmail: "awilson@phoenixdev.gov",
    projectName: "Desert Ridge Innovation Campus 2026",
    countyOrState: "Maricopa County, AZ",
    paymentType: "Pay in Parts (50% Deposit)",
    paymentMethod: "ACH Direct Debit",
    paidAmount: 124,
    totalAmount: 248,
    status: "Partially Paid",
    stageUnlocked: true,
    stageLabel: "Step 3: Web Audit in Progress",
    date: "Jul 10, 2026"
  },
  {
    id: "TXN-8811",
    orderNumber: "ORD-2026-011",
    customerName: "Christopher Lee",
    customerEmail: "clee@sfhousing.org",
    projectName: "Mission Bay Residential Framework",
    countyOrState: "San Francisco County, CA",
    paymentType: "Platform Subscription ($149)",
    paymentMethod: "ACH / U.S. Bank Debit",
    paidAmount: 149,
    totalAmount: 149,
    status: "Paid",
    stageUnlocked: true,
    stageLabel: "Step 1: Account Login Active",
    date: "Jul 05, 2026"
  },
  {
    id: "TXN-8812",
    orderNumber: "ORD-2026-012",
    customerName: "Elizabeth Davis",
    customerEmail: "edavis@dallasgrowth.gov",
    projectName: "Uptown Pedestrian Mall Expansion",
    countyOrState: "Dallas County, TX",
    paymentType: "Report Generation Plan ($99)",
    paymentMethod: "ACH Direct Debit",
    paidAmount: 0,
    totalAmount: 99,
    status: "Payment Hold",
    stageUnlocked: false,
    stageLabel: "Step 5 Hold (Approval Pending)",
    date: "Jun 28, 2026"
  },
  {
    id: "TXN-8813",
    orderNumber: "ORD-2026-013",
    customerName: "James Anderson",
    customerEmail: "janderson@seattleland.org",
    projectName: "South Lake Union Tech Center",
    countyOrState: "King County, WA",
    paymentType: "Pay in Full ($248)",
    paymentMethod: "Corporate Bank Transfer",
    paidAmount: 248,
    totalAmount: 248,
    status: "Paid",
    stageUnlocked: true,
    stageLabel: "Step 6: Complete Report Delivered",
    date: "Jun 20, 2026"
  },
  {
    id: "TXN-8814",
    orderNumber: "ORD-2026-014",
    customerName: "Patricia Thomas",
    customerEmail: "pthomas@phillyredevelopment.gov",
    projectName: "University City Knowledge Corridor",
    countyOrState: "Philadelphia County, PA",
    paymentType: "Platform Subscription ($149)",
    paymentMethod: "ACH Wire Transfer",
    paidAmount: 0,
    totalAmount: 149,
    status: "Overdue",
    stageUnlocked: false,
    stageLabel: "Step 1 Blocked (30 Days Overdue)",
    date: "Jun 15, 2026"
  },
  {
    id: "TXN-8815",
    orderNumber: "ORD-2026-015",
    customerName: "Matthew Jackson",
    customerEmail: "mjackson@portlandplanning.org",
    projectName: "Pearl District Mixed-Use Vision",
    countyOrState: "Multnomah County, OR",
    paymentType: "Report Generation Plan ($99)",
    paymentMethod: "ACH Direct Debit",
    paidAmount: 99,
    totalAmount: 99,
    status: "Paid",
    stageUnlocked: true,
    stageLabel: "Step 5: Certified PDF Exported",
    date: "Jun 08, 2026"
  },
  {
    id: "TXN-8816",
    orderNumber: "ORD-2026-016",
    customerName: "Jennifer White",
    customerEmail: "jwhite@nashvilledev.org",
    projectName: "Music Row Cultural Heritage Plan",
    countyOrState: "Davidson County, TN",
    paymentType: "Pay in Parts (50% Deposit)",
    paymentMethod: "ACH / Bank Wire",
    paidAmount: 124,
    totalAmount: 248,
    status: "Partially Paid",
    stageUnlocked: true,
    stageLabel: "Step 4: Final Score Calculated",
    date: "Jun 01, 2026"
  },
  {
    id: "TXN-8817",
    orderNumber: "ORD-2026-017",
    customerName: "Daniel Harris",
    customerEmail: "dharris@minneapolisurban.gov",
    projectName: "Nicolet Mall Greenway Project",
    countyOrState: "Hennepin County, MN",
    paymentType: "Platform Subscription ($149)",
    paymentMethod: "ACH Direct Debit",
    paidAmount: 149,
    totalAmount: 149,
    status: "Refunded",
    stageUnlocked: false,
    stageLabel: "Subscription Cancelled / Refunded",
    date: "May 24, 2026"
  },
  {
    id: "TXN-8818",
    orderNumber: "ORD-2026-018",
    customerName: "Victoria Martin",
    customerEmail: "vmartin@charlottedevelopment.org",
    projectName: "Uptown Financial Center Phase II",
    countyOrState: "Mecklenburg County, NC",
    paymentType: "Pay in Full ($248)",
    paymentMethod: "Corporate Bank Transfer",
    paidAmount: 248,
    totalAmount: 248,
    status: "Paid",
    stageUnlocked: true,
    stageLabel: "Step 6: Complete Report Delivered",
    date: "May 18, 2026"
  }
];

export default function PaymentsPage() {
  const [transactions, setTransactions] = React.useState<AuditTransactionRow[]>(INITIAL_TRANSACTIONS);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [currentPage, setCurrentPage] = React.useState(1);

  // Receipt Modal State
  const [selectedReceiptTxn, setSelectedReceiptTxn] = React.useState<AuditTransactionRow | null>(null);

  // Filtered Transactions Calculation
  const filteredTransactions = React.useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch =
        t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.paymentType.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "paid" && t.status === "Paid") ||
        (statusFilter === "partial" && t.status === "Partially Paid") ||
        (statusFilter === "hold" && t.status === "Payment Hold") ||
        (statusFilter === "issue" && (t.status === "Overdue" || t.status === "Failed"));

      return matchesSearch && matchesStatus;
    });
  }, [transactions, searchQuery, statusFilter]);

  // Pagination Calculations
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE) || 1;
  const paginatedTransactions = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTransactions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTransactions, currentPage]);

  // Reset to Page 1 when filter/search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Metrics Summary
  const metrics = React.useMemo(() => {
    const totalCollected = transactions.reduce((sum, t) => sum + t.paidAmount, 0);
    const paidCount = transactions.filter(t => t.status === "Paid").length;
    const partialCount = transactions.filter(t => t.status === "Partially Paid").length;
    const holdCount = transactions.filter(t => t.status === "Payment Hold").length;
    const issueCount = transactions.filter(t => t.status === "Overdue" || t.status === "Failed").length;

    return {
      totalCollected,
      paidCount,
      partialCount,
      holdCount,
      issueCount,
      totalCount: transactions.length
    };
  }, [transactions]);

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

        {/* Card 2: Platform Subscriptions (LIGHT RED) */}
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
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-red-100 block drop-shadow-xs">Platform Subscriptions</span>
              <h3 className="text-2xl sm:text-3xl font-black text-white leading-none tracking-tight drop-shadow-md">
                $149 <span className="text-xs font-bold text-red-100">/ Account</span>
              </h3>
              <span className="text-[10px] font-bold text-white flex items-center gap-1 mt-1.5 bg-black/40 backdrop-blur-md border border-white/20 px-2.5 py-0.5 rounded-full w-fit">
                Step 1 Billing (On Login)
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

        {/* Card 3: Report Audit Fees (LIGHT GRAY SLATE) */}
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
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-100 block drop-shadow-xs">Report Generation Fees</span>
              <h3 className="text-2xl sm:text-3xl font-black text-white leading-none tracking-tight drop-shadow-md">
                $99 <span className="text-xs font-bold text-slate-200">/ Report</span>
              </h3>
              <span className="text-[10px] font-bold text-white flex items-center gap-1 mt-1.5 bg-black/40 backdrop-blur-md border border-white/20 px-2.5 py-0.5 rounded-full w-fit">
                Step 2 Billing (On Delivery)
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
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-200 block drop-shadow-xs">Holds & Overdue</span>
              <h3 className="text-2xl sm:text-3xl font-black text-amber-400 leading-none tracking-tight drop-shadow-md">
                {metrics.holdCount + metrics.issueCount} <span className="text-xs font-bold text-slate-200">Orders</span>
              </h3>
              <span className="text-[10px] font-bold text-white flex items-center gap-1 mt-1.5 bg-black/40 backdrop-blur-md border border-white/20 px-2.5 py-0.5 rounded-full w-fit">
                Stage Locks Enforced
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

      {/* Main Payment & Settlement Audit Ledger Table */}
      <Card className="bg-white border border-slate-200/80 shadow-2xs rounded-xl overflow-hidden">
        {/* Integrated Toolbar */}
        <div className="p-2.5 sm:p-3 border-b border-slate-200/80 bg-slate-50/50 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
          {/* Search Box */}
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
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
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Segmented Filter Pills */}
          <div className="bg-white p-1 rounded-xl border border-slate-200 flex items-center gap-1 overflow-x-auto shadow-2xs">
            <button
              onClick={() => setStatusFilter("all")}
              className={cn(
                "px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap",
                statusFilter === "all"
                  ? "bg-[#B5111B] text-white shadow-xs font-extrabold"
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              All Payments ({metrics.totalCount})
            </button>
            <button
              onClick={() => setStatusFilter("paid")}
              className={cn(
                "px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap",
                statusFilter === "paid"
                  ? "bg-emerald-600 text-white shadow-xs font-extrabold"
                  : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
              )}
            >
              Paid ({metrics.paidCount})
            </button>
            <button
              onClick={() => setStatusFilter("partial")}
              className={cn(
                "px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap",
                statusFilter === "partial"
                  ? "bg-amber-500 text-white shadow-xs font-extrabold"
                  : "text-slate-600 hover:bg-amber-50 hover:text-amber-700"
              )}
            >
              Partially Paid ({metrics.partialCount})
            </button>
            <button
              onClick={() => setStatusFilter("hold")}
              className={cn(
                "px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap",
                statusFilter === "hold"
                  ? "bg-purple-600 text-white shadow-xs font-extrabold"
                  : "text-slate-600 hover:bg-purple-50 hover:text-purple-700"
              )}
            >
              Payment Hold ({metrics.holdCount})
            </button>
            <button
              onClick={() => setStatusFilter("issue")}
              className={cn(
                "px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap",
                statusFilter === "issue"
                  ? "bg-rose-900 text-white shadow-xs font-extrabold"
                  : "text-slate-600 hover:bg-rose-50 hover:text-rose-700"
              )}
            >
              Overdue / Failed ({metrics.issueCount})
            </button>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto min-h-[360px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="px-3 py-2">Order / Customer</th>
                <th className="px-3 py-2">Payment Type</th>
                <th className="px-3 py-2">Payment Method</th>
                <th className="px-3 py-2">Amount Paid / Total</th>
                <th className="px-3 py-2">Payment Tracking Status</th>
                <th className="px-3 py-2">Project Stage Lock</th>
                <th className="px-3 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No transactions match your search filter.
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Customer & Order */}
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          onClick={() => setSelectedReceiptTxn(row)}
                          className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-500 flex items-center justify-center shrink-0 shadow-2xs cursor-pointer hover:bg-slate-200/70 hover:scale-105 transition-all"
                        >
                          <User className="w-4 h-4 text-slate-500" />
                        </div>
                        <div>
                          <div
                            onClick={() => setSelectedReceiptTxn(row)}
                            className="font-bold text-slate-900 text-xs hover:text-blue-600 transition-colors cursor-pointer"
                          >
                            {row.customerName}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">{row.orderNumber} • {row.date}</div>
                        </div>
                      </div>
                    </td>

                    {/* Payment Type Column */}
                    <td className="px-3 py-2.5 font-bold text-slate-800 text-xs">
                      {row.paymentType}
                    </td>

                    {/* Payment Method */}
                    <td className="px-3 py-2.5 text-slate-600 text-xs">
                      {row.paymentMethod}
                    </td>

                    {/* Amount Paid / Total */}
                    <td className="px-3 py-2.5 font-black text-slate-900 text-xs">
                      ${row.paidAmount} <span className="text-slate-400 font-normal">/ ${row.totalAmount}</span>
                    </td>

                    {/* Payment Tracking Status (MATCHES USERS TABLE BADGE DESIGN) */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {renderStatusBadge(row.status)}
                    </td>

                    {/* Project Stage Lock Column */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {row.stageUnlocked ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                          <Unlock className="w-3 h-3 text-emerald-600" />
                          {row.stageLabel}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                          <Lock className="w-3 h-3 text-rose-600" />
                          {row.stageLabel}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-2.5 text-right whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedReceiptTxn(row)}
                        className="text-xs font-bold text-[#B5111B] hover:text-[#8F0D15] hover:bg-red-50 cursor-pointer rounded-xl h-7 px-2.5"
                      >
                        View Receipt
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Bar (MATCHES USERS MODULE TABLE EXACTLY) */}
        {filteredTransactions.length > 0 && (
          <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-medium text-slate-600">
            <div>
              Showing <span className="font-bold text-slate-900">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> to{" "}
              <span className="font-bold text-slate-900">{Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)}</span> of{" "}
              <span className="font-bold text-slate-900">{filteredTransactions.length}</span> transactions
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center justify-center font-bold text-xs shadow-2xs text-slate-700"
                title="First Page"
              >
                &laquo;
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center justify-center font-bold text-xs shadow-2xs text-slate-700"
              >
                &lsaquo; Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "w-8 h-8 rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-2xs",
                    currentPage === page
                      ? "bg-[#B5111B] text-white shadow-xs font-black"
                      : "border border-slate-200 bg-white hover:bg-slate-100 text-slate-700"
                  )}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center justify-center font-bold text-xs shadow-2xs text-slate-700"
              >
                Next &rsaquo;
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center justify-center font-bold text-xs shadow-2xs text-slate-700"
                title="Last Page"
              >
                &raquo;
              </button>
            </div>
          </div>
        )}
      </Card>

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
                <span className="text-slate-500 font-medium">Payment Method:</span>
                <span className="font-bold text-slate-900">{selectedReceiptTxn.paymentMethod}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Amount Settled:</span>
                <span className="font-black text-emerald-700 text-sm">${selectedReceiptTxn.paidAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Project Lock Status:</span>
                <span className={cn("font-bold text-xs", selectedReceiptTxn.stageUnlocked ? "text-emerald-700" : "text-rose-700")}>
                  {selectedReceiptTxn.stageLabel}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                size="sm"
                onClick={() => setSelectedReceiptTxn(null)}
                className="bg-slate-900 text-white rounded-xl font-bold text-xs"
              >
                Close Receipt
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
