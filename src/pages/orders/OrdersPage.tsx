"use client"

import * as React from "react"
import {
  MagnifyingGlassIcon,
  BellIcon,
  EnvelopeSimpleIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  PaperPlaneRightIcon,
  ReceiptIcon,
  MapPinIcon,
  XIcon,
  CaretRightIcon,
  DotsThreeVerticalIcon,
  CheckIcon,
  DatabaseIcon,
  PencilSimpleIcon,
  UserIcon,
  FileTextIcon
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef, SortingState } from "@tanstack/react-table"

export type PaymentStatus = 'partial' | 'full'; // partial = awaiting full package payment

export interface PaymentTransaction {
  id: string;
  date: string;
  amount: number;
  method: string;
  status: 'completed' | 'pending';
  reference: string;
  type: 'Full Package Payment' | 'Full Payment';
}

export interface TimelineStepItem {
  id: number;
  label: string;
  shortLabel: string;
  description: string;
  icon: React.ComponentType<any>;
}

/** Customer Roadmap — 5 operational steps (full upfront package payment; no 40/30/30 split) */
export const TIMELINE_STEPS: TimelineStepItem[] = [
  { id: 1, label: "Step 1: Package Selection & Full Payment", shortLabel: "Package & Pay", description: "Select Scorecard Only, Subscription, or Combined Package and complete full checkout", icon: CurrencyDollarIcon },
  { id: 2, label: "Step 2: Intake Questionnaire", shortLabel: "Intake", description: "Complete the municipal self-assessment across relevant community areas (90+ data points)", icon: FileTextIcon },
  { id: 3, label: "Step 3: 3rd-Party Data Ingestion", shortLabel: "API Ingestion", description: "Admin syncs Census, BLS, EPA, NCDOT, ESRI and related municipal APIs into the scorecard", icon: DatabaseIcon },
  { id: 4, label: "Step 4: Admin Review, Scoring & Report Upload", shortLabel: "Review & Report", description: "Validate scoring matrix, calibrate indicators, and upload the certified executive PDF", icon: PencilSimpleIcon },
  { id: 5, label: "Step 5: Final Release & Report Download", shortLabel: "Released", description: "Mark project Released, notify the customer by email, and enable certified PDF download", icon: CheckCircleIcon },
];

export const TOTAL_ROADMAP_STEPS = TIMELINE_STEPS.length; // 5

/** Remap legacy 6-step values: old 5→4, old 6→5 */
export function normalizeTimelineStep(step: number): number {
  if (!step || step < 1) return 1;
  if (step >= 6) return 5;
  if (step === 5) return 4;
  return Math.min(step, 5);
}

export interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  organization: string;
  countyOrState: string;
  projectName: string;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: PaymentStatus;
  orderDate: string;
  dueDate: string;
  reportSent: boolean;
  reminderSentCount: number;
  timelineStep: number; // 1 to 5
  stepDates?: Record<number, string>;
  paymentHistory?: PaymentTransaction[];
  packageName?: string;
}

const PKG = {
  scorecardOnly: { name: "Scorecard Only", amount: 15000 },
  subscription: { name: "Scorecard Subscription", amount: 36000 },
  combined: { name: "Combined Package", amount: 48000 },
} as const;

const fullPay = (id: string, date: string, amount: number, method: string, ref: string): PaymentTransaction => ({
  id, date, amount, method, status: "completed", reference: ref, type: "Full Package Payment",
});

const initialOrders: OrderItem[] = [
  {
    id: "ord_101", orderNumber: "ORD-2026-001", customerName: "Johnathan Smith", customerEmail: "jsmith@wakegov.com",
    organization: "Wake County Planning & Dev", countyOrState: "Wake County, NC", projectName: "Metropolis Master Plan 2026",
    packageName: PKG.scorecardOnly.name, totalAmount: PKG.scorecardOnly.amount, paidAmount: 0, paymentStatus: "partial",
    orderDate: "2026-08-01", dueDate: "2026-08-25", reportSent: false, reminderSentCount: 1, timelineStep: 1,
    stepDates: { 1: "Aug 01, 2026" }, paymentHistory: [],
  },
  {
    id: "ord_102", orderNumber: "ORD-2026-002", customerName: "Elena Rodriguez", customerEmail: "erodriguez@nycedc.org",
    organization: "NYC Economic Development Corp", countyOrState: "New York County, NY", projectName: "Hudson Yards District Vision 2026",
    packageName: PKG.combined.name, totalAmount: PKG.combined.amount, paidAmount: PKG.combined.amount, paymentStatus: "full",
    orderDate: "2026-07-28", dueDate: "2026-08-10", reportSent: true, reminderSentCount: 0, timelineStep: 5,
    stepDates: { 1: "Jul 28, 2026", 2: "Jul 30, 2026", 3: "Aug 02, 2026", 4: "Aug 08, 2026", 5: "Aug 10, 2026" },
    paymentHistory: [fullPay("TXN-8801", "Jul 28, 2026 09:15 AM", PKG.combined.amount, "ACH Bank Transfer", "REF-2026-7102")],
  },
  {
    id: "ord_103", orderNumber: "ORD-2026-003", customerName: "Marcus Vance", customerEmail: "mvance@riversidedev.org",
    organization: "Riverside Development Authority", countyOrState: "Cook County, IL", projectName: "Riverside Gateway Plan 2026",
    packageName: PKG.scorecardOnly.name, totalAmount: PKG.scorecardOnly.amount, paidAmount: PKG.scorecardOnly.amount, paymentStatus: "full",
    orderDate: "2026-08-05", dueDate: "2026-08-30", reportSent: false, reminderSentCount: 0, timelineStep: 3,
    stepDates: { 1: "Aug 05, 2026", 2: "Aug 08, 2026", 3: "Aug 12, 2026" },
    paymentHistory: [fullPay("TXN-9104", "Aug 05, 2026 04:20 PM", PKG.scorecardOnly.amount, "Corporate Mastercard (•••• 9901)", "REF-2026-9034")],
  },
  {
    id: "ord_104", orderNumber: "ORD-2026-004", customerName: "Sarah Jenkins", customerEmail: "s.jenkins@midtownalliance.org",
    organization: "Midtown Commerce Alliance", countyOrState: "Fulton County, GA", projectName: "Midtown Tech District 2026",
    packageName: PKG.subscription.name, totalAmount: PKG.subscription.amount, paidAmount: PKG.subscription.amount, paymentStatus: "full",
    orderDate: "2026-07-15", dueDate: "2026-07-30", reportSent: true, reminderSentCount: 0, timelineStep: 5,
    stepDates: { 1: "Jul 15, 2026", 2: "Jul 18, 2026", 3: "Jul 22, 2026", 4: "Jul 28, 2026", 5: "Jul 30, 2026" },
    paymentHistory: [fullPay("TXN-8501", "Jul 15, 2026 11:00 AM", PKG.subscription.amount, "Wire Transfer (FedWire)", "REF-2026-6100")],
  },
  {
    id: "ord_105", orderNumber: "ORD-2026-005", customerName: "Robert Chen", customerEmail: "rchen@harborport.gov",
    organization: "Harbor Port Authority", countyOrState: "King County, WA", projectName: "Harbor View Revitalization 2026",
    packageName: PKG.scorecardOnly.name, totalAmount: PKG.scorecardOnly.amount, paidAmount: 0, paymentStatus: "partial",
    orderDate: "2026-08-10", dueDate: "2026-09-01", reportSent: false, reminderSentCount: 0, timelineStep: 1,
    stepDates: {}, paymentHistory: [],
  },
  {
    id: "ord_106", orderNumber: "ORD-2026-006", customerName: "Claire Dupont", customerEmail: "c.dupont@bostonplanning.gov",
    organization: "Boston Urban Planning Board", countyOrState: "Suffolk County, MA", projectName: "Beacon Hill Urban Core 2026",
    packageName: PKG.combined.name, totalAmount: PKG.combined.amount, paidAmount: PKG.combined.amount, paymentStatus: "full",
    orderDate: "2026-07-20", dueDate: "2026-08-05", reportSent: false, reminderSentCount: 0, timelineStep: 4,
    stepDates: { 1: "Jul 20, 2026", 2: "Jul 23, 2026", 3: "Jul 27, 2026", 4: "Aug 05, 2026" },
    paymentHistory: [fullPay("TXN-8710", "Jul 20, 2026 10:00 AM", PKG.combined.amount, "ACH Bank Transfer", "REF-2026-7230")],
  },
  {
    id: "ord_107", orderNumber: "ORD-2026-007", customerName: "David Miller", customerEmail: "dmiller@oaklandgov.org",
    organization: "Oakland Redevelopment Agency", countyOrState: "Alameda County, CA", projectName: "Oakland Civic Hub 2026",
    packageName: PKG.scorecardOnly.name, totalAmount: PKG.scorecardOnly.amount, paidAmount: PKG.scorecardOnly.amount, paymentStatus: "full",
    orderDate: "2026-08-12", dueDate: "2026-09-05", reportSent: false, reminderSentCount: 0, timelineStep: 4,
    stepDates: { 1: "Aug 12, 2026", 2: "Aug 14, 2026", 3: "Aug 15, 2026", 4: "Aug 17, 2026" },
    paymentHistory: [fullPay("TXN-9302", "Aug 12, 2026 09:45 AM", PKG.scorecardOnly.amount, "Corporate Visa (•••• 5521)", "REF-2026-9388")],
  },
  {
    id: "ord_108", orderNumber: "ORD-2026-008", customerName: "Amanda Torres", customerEmail: "atorres@transitops.gov",
    organization: "Department of Transit & Mobility", countyOrState: "Travis County, TX", projectName: "Downtown Mobility Core 2026",
    packageName: PKG.subscription.name, totalAmount: PKG.subscription.amount, paidAmount: PKG.subscription.amount, paymentStatus: "full",
    orderDate: "2026-07-30", dueDate: "2026-08-15", reportSent: true, reminderSentCount: 0, timelineStep: 5,
    stepDates: { 1: "Jul 30, 2026", 2: "Aug 02, 2026", 3: "Aug 06, 2026", 4: "Aug 12, 2026", 5: "Aug 15, 2026" },
    paymentHistory: [fullPay("TXN-8901", "Jul 30, 2026 02:20 PM", PKG.subscription.amount, "Credit Card (Mastercard •••• 1102)", "REF-2026-8001")],
  },
  {
    id: "ord_109", orderNumber: "ORD-2026-009", customerName: "Benjamin Hayes", customerEmail: "b.hayes@denvergov.org",
    organization: "Denver Regional Transportation", countyOrState: "Denver County, CO", projectName: "Mile High Mobility Plan 2026",
    packageName: PKG.scorecardOnly.name, totalAmount: PKG.scorecardOnly.amount, paidAmount: PKG.scorecardOnly.amount, paymentStatus: "full",
    orderDate: "2026-08-14", dueDate: "2026-09-08", reportSent: false, reminderSentCount: 0, timelineStep: 2,
    stepDates: { 1: "Aug 14, 2026", 2: "Aug 16, 2026" },
    paymentHistory: [fullPay("TXN-9405", "Aug 14, 2026 01:10 PM", PKG.scorecardOnly.amount, "ACH Bank Transfer", "REF-2026-9420")],
  },
  {
    id: "ord_110", orderNumber: "ORD-2026-010", customerName: "Sophia Martinez", customerEmail: "smartinez@miamidade.gov",
    organization: "Miami-Dade Economic Board", countyOrState: "Miami-Dade County, FL", projectName: "Biscayne Bay Resilience 2026",
    packageName: PKG.combined.name, totalAmount: PKG.combined.amount, paidAmount: PKG.combined.amount, paymentStatus: "full",
    orderDate: "2026-07-10", dueDate: "2026-07-25", reportSent: true, reminderSentCount: 0, timelineStep: 5,
    stepDates: { 1: "Jul 10, 2026", 2: "Jul 13, 2026", 3: "Jul 16, 2026", 4: "Jul 22, 2026", 5: "Jul 25, 2026" },
    paymentHistory: [fullPay("TXN-8410", "Jul 10, 2026 09:00 AM", PKG.combined.amount, "Wire Transfer", "REF-2026-5501")],
  },
  {
    id: "ord_111", orderNumber: "ORD-2026-011", customerName: "Kevin O'Connor", customerEmail: "koconnor@phoenix.gov",
    organization: "Phoenix Housing Authority", countyOrState: "Maricopa County, AZ", projectName: "Sun Valley Affordable Housing 2026",
    packageName: PKG.scorecardOnly.name, totalAmount: PKG.scorecardOnly.amount, paidAmount: 0, paymentStatus: "partial",
    orderDate: "2026-08-15", dueDate: "2026-09-10", reportSent: false, reminderSentCount: 0, timelineStep: 1,
    stepDates: {}, paymentHistory: [],
  },
  {
    id: "ord_112", orderNumber: "ORD-2026-012", customerName: "Laura Bennett", customerEmail: "lbennett@seattle.gov",
    organization: "Seattle Planning Department", countyOrState: "King County, WA", projectName: "Puget Sound Urban Center 2026",
    packageName: PKG.subscription.name, totalAmount: PKG.subscription.amount, paidAmount: PKG.subscription.amount, paymentStatus: "full",
    orderDate: "2026-07-05", dueDate: "2026-07-20", reportSent: true, reminderSentCount: 0, timelineStep: 5,
    stepDates: { 1: "Jul 05, 2026", 2: "Jul 08, 2026", 3: "Jul 12, 2026", 4: "Jul 18, 2026", 5: "Jul 20, 2026" },
    paymentHistory: [fullPay("TXN-8301", "Jul 05, 2026 10:15 AM", PKG.subscription.amount, "ACH Bank Transfer", "REF-2026-4401")],
  },
];

const ITEMS_PER_PAGE = 5;

export default function OrdersPage() {
  const [orders, setOrders] = React.useState<OrderItem[]>(initialOrders);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "partial" | "full">("all");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(ITEMS_PER_PAGE);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // Modal & Dropdown State
  const [reminderModalOrder, setReminderModalOrder] = React.useState<OrderItem | null>(null);
  const [reportModalOrder, setReportModalOrder] = React.useState<OrderItem | null>(null);
  const [paymentHistoryModalOrder, setPaymentHistoryModalOrder] = React.useState<OrderItem | null>(null);
  const [roadmapModalOrder, setRoadmapModalOrder] = React.useState<OrderItem | null>(null);
  const [customerProfileModalOrder, setCustomerProfileModalOrder] = React.useState<OrderItem | null>(null);
  const [activeMenuOrderId, setActiveMenuOrderId] = React.useState<string | null>(null);
  const [isSending, setIsSending] = React.useState(false);

  // Reset page when search or filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, pageSize, sorting]);

  // Filtered Orders Calculation
  const filteredOrders = React.useMemo(() => {
    let rows = orders.filter(order => {
      const matchesSearch =
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.countyOrState.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || order.paymentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });

    if (sorting.length > 0) {
      const { id, desc } = sorting[0];
      rows = [...rows].sort((a, b) => {
        const av = (a as any)[id];
        const bv = (b as any)[id];
        if (typeof av === "number" && typeof bv === "number") return desc ? bv - av : av - bv;
        return desc
          ? String(bv ?? "").localeCompare(String(av ?? ""))
          : String(av ?? "").localeCompare(String(bv ?? ""));
      });
    }
    return rows;
  }, [orders, searchQuery, statusFilter, sorting]);

  // Pagination Calculations
  const paginatedOrders = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredOrders.slice(startIndex, startIndex + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  // Metrics Summary
  const metrics = React.useMemo(() => {
    const totalCount = orders.length;
    const partialOrders = orders.filter(o => o.paymentStatus === 'partial');
    const fullOrders = orders.filter(o => o.paymentStatus === 'full');

    const totalCollected = orders.reduce((sum, o) => sum + o.paidAmount, 0);
    const totalRemaining = orders.reduce((sum, o) => sum + (o.totalAmount - o.paidAmount), 0);

    return {
      totalCount,
      partialCount: partialOrders.length,
      fullCount: fullOrders.length,
      totalCollected,
      totalRemaining
    };
  }, [orders]);

  // Handle Send Reminder Action
  const handleConfirmSendReminder = () => {
    if (!reminderModalOrder) return;
    setIsSending(true);

    setTimeout(() => {
      setOrders(prev => prev.map(o => {
        if (o.id === reminderModalOrder.id) {
          return {
            ...o,
            reminderSentCount: o.reminderSentCount + 1
          };
        }
        return o;
      }));

      const remaining = reminderModalOrder.totalAmount - reminderModalOrder.paidAmount;
      toast.success(`Payment reminder email sent to ${reminderModalOrder.customerEmail} ($${remaining.toLocaleString('en-US')} balance due).`);
      setIsSending(false);
      setReminderModalOrder(null);
    }, 600);
  };

  // Handle Send Complete Report Action
  const handleConfirmSendReport = () => {
    if (!reportModalOrder) return;
    setIsSending(true);

    setTimeout(() => {
      setOrders(prev => prev.map(o => {
        if (o.id === reportModalOrder.id) {
          return {
            ...o,
            reportSent: true,
            timelineStep: Math.max(normalizeTimelineStep(o.timelineStep), 5)
          };
        }
        return o;
      }));

      toast.success(`Complete Scorecard PDF Report emailed to ${reportModalOrder.customerEmail}!`);
      setIsSending(false);
      setReportModalOrder(null);
    }, 600);
  };

  // Mark full package paid / awaiting payment (no partial deposits)
  const togglePaymentStatus = (orderId: string) => {
    const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const isAwaiting = o.paymentStatus === 'partial';
        if (isAwaiting) {
          return {
            ...o,
            paymentStatus: 'full' as PaymentStatus,
            paidAmount: o.totalAmount,
            timelineStep: Math.max(normalizeTimelineStep(o.timelineStep), 1),
            stepDates: { ...(o.stepDates || {}), 1: nowStr },
            paymentHistory: [
              {
                id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
                date: `${nowStr} ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
                amount: o.totalAmount,
                method: "Online Checkout (Stripe / HubSpot)",
                status: "completed" as const,
                reference: `REF-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                type: "Full Package Payment" as const,
              },
            ],
          };
        }
        return {
          ...o,
          paymentStatus: 'partial' as PaymentStatus,
          paidAmount: 0,
          reportSent: false,
          timelineStep: 1,
          paymentHistory: [],
        };
      }
      return o;
    }));
    toast.success("Order payment status updated successfully.");
  };

  const orderColumns = React.useMemo<ColumnDef<OrderItem>[]>(() => [
    {
      accessorKey: "customerName",
      header: "Customer Name",
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="flex items-center gap-3">
            <div
              onClick={() => setCustomerProfileModalOrder(order)}
              className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-500 flex items-center justify-center shrink-0 shadow-2xs cursor-pointer hover:bg-slate-200/70 hover:scale-105 transition-all"
            >
              <UserIcon weight="duotone" className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <div
                onClick={() => setCustomerProfileModalOrder(order)}
                className="font-bold text-slate-900 text-sm hover:text-blue-600 transition-colors cursor-pointer"
              >
                {order.customerName}
              </div>
              <div className="text-xs text-slate-500 font-medium">{order.customerEmail}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "countyOrState",
      header: "County / State (Project Name)",
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold">
              <MapPinIcon weight="duotone" className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>{order.countyOrState}</span>
            </div>
            <div className="text-xs font-bold text-[#B5111B] flex items-center gap-1">
              <span>{order.projectName}</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">Order: {order.orderNumber}</div>
          </div>
        );
      },
    },
    {
      id: "timeline",
      accessorKey: "timelineStep",
      header: "Customer Timeline",
      enableSorting: false,
      cell: ({ row }) => {
        const order = row.original;
        const stepNum = normalizeTimelineStep(order.timelineStep);
        const currentStepObj = TIMELINE_STEPS.find(s => s.id === stepNum) || TIMELINE_STEPS[0];
        const isAllDone = stepNum === TOTAL_ROADMAP_STEPS;
        return (
          <div className="space-y-2 max-w-[280px]">
            <button
              onClick={() => setRoadmapModalOrder(order)}
              className={cn(
                "w-full inline-flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs group",
                isAllDone
                  ? "bg-emerald-50/90 hover:bg-emerald-100/90 border-emerald-300 text-emerald-950"
                  : "bg-slate-100/90 hover:bg-slate-200/80 border-slate-200 text-slate-800"
              )}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                {isAllDone ? (
                  <CheckCircleIcon weight="duotone" className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
                )}
                <span className={cn("font-bold whitespace-nowrap", isAllDone ? "text-emerald-700" : "text-slate-500")}>
                  {isAllDone ? `Done (${TOTAL_ROADMAP_STEPS}/${TOTAL_ROADMAP_STEPS}):` : `Step ${stepNum}/${TOTAL_ROADMAP_STEPS}:`}
                </span>
                <span className="font-extrabold truncate">{currentStepObj.label}</span>
              </div>
              <CaretRightIcon weight="bold" className={cn("w-3.5 h-3.5 transition-transform shrink-0", isAllDone ? "text-emerald-500 group-hover:text-emerald-800" : "text-slate-400 group-hover:text-slate-700")} />
            </button>

            <div className="relative pt-2 pb-1 px-1 min-w-[240px]">
              <div className="absolute left-3 right-3 top-4 h-1 bg-slate-200 rounded-full z-0 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-300"
                  style={{ width: isAllDone ? '100%' : `${((stepNum - 1) / (TOTAL_ROADMAP_STEPS - 1)) * 100}%` }}
                />
              </div>
              <div className="relative z-10 flex items-center justify-between">
                {TIMELINE_STEPS.map((step) => {
                  const isCompleted = isAllDone ? true : step.id < stepNum;
                  const isCurrent = isAllDone ? false : step.id === stepNum;
                  const isUpcoming = isAllDone ? false : step.id > stepNum;
                  return (
                    <div key={step.id} className="relative group/step flex flex-col items-center">
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-200 shadow-2xs select-none cursor-default",
                          isCompleted && "bg-emerald-600 text-white",
                          isCurrent && "bg-blue-600 text-white ring-4 ring-blue-100 scale-110 shadow-md font-extrabold",
                          isUpcoming && "bg-white text-slate-400 border border-slate-300"
                        )}
                      >
                        {isCompleted ? (
                          <CheckIcon weight="bold" className="w-3 h-3 stroke-[3]" />
                        ) : (
                          <span>{step.id}</span>
                        )}
                      </div>
                      <div className="absolute bottom-full mb-2 hidden group-hover/step:flex flex-col items-center z-30 pointer-events-none min-w-[150px]">
                        <div className="bg-slate-900 text-white rounded-xl py-1.5 px-2.5 text-[11px] shadow-xl text-center space-y-0.5">
                          <div className="font-bold text-amber-300">Step {step.id}: {step.label}</div>
                          <div className="text-[10px] text-slate-300">{step.description}</div>
                          {order.stepDates?.[step.id] && (
                            <div className="text-[9px] text-emerald-400 font-mono pt-0.5">
                              {isCompleted ? "Done" : isCurrent ? "Active" : "Date"}: {order.stepDates[step.id]}
                            </div>
                          )}
                        </div>
                        <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "paymentStatus",
      header: () => <div className="text-center">Payment Details</div>,
      cell: ({ row }) => {
        const order = row.original;
        const isFull = order.paymentStatus === 'full';
        return (
          <div className="flex flex-col items-center justify-center space-y-1.5 text-center">
            {isFull ? (
              <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs whitespace-nowrap">
                <CheckCircleIcon weight="duotone" className="w-3.5 h-3.5 text-emerald-600" />
                Paid in Full
              </span>
            ) : (
              <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs whitespace-nowrap">
                <ClockIcon weight="duotone" className="w-3.5 h-3.5 text-amber-600" />
                Awaiting Payment
              </span>
            )}
            <button
              onClick={() => setPaymentHistoryModalOrder(order)}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors text-center"
            >
              View Payment History
            </button>
          </div>
        );
      },
    },
    {
      accessorKey: "dueDate",
      header: "Payment Due Date",
      cell: ({ row }) => (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold whitespace-nowrap">
          <ClockIcon weight="duotone" className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="whitespace-nowrap">{row.original.dueDate}</span>
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      enableSorting: false,
      cell: ({ row }) => {
        const order = row.original;
        const isPartial = order.paymentStatus === 'partial';
        const isLowerRow = paginatedOrders.length >= 4 && row.index >= paginatedOrders.length - 2 && row.index > 1;
        return (
          <div className="text-right relative">
            <div className="inline-block text-left">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setActiveMenuOrderId(activeMenuOrderId === order.id ? null : order.id)}
                className="w-9 h-9 p-0 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 flex items-center justify-center cursor-pointer transition-colors"
                title="Actions"
              >
                <DotsThreeVerticalIcon weight="bold" className="w-4 h-4" />
              </Button>

              {activeMenuOrderId === order.id && (
                <div className={cn(
                  "absolute w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-30 animate-in fade-in zoom-in-95 duration-150 text-left",
                  isLowerRow ? "bottom-full mb-1 right-5" : "top-12 right-5"
                )}>
                  <div className="px-3 py-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                    Choose an Action:
                  </div>

                  {isPartial ? (
                    <button
                      onClick={() => {
                        setReminderModalOrder(order);
                        setActiveMenuOrderId(null);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-900 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <BellIcon weight="duotone" className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Send Reminder {order.reminderSentCount > 0 ? `(${order.reminderSentCount})` : ''}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setReportModalOrder(order);
                        setActiveMenuOrderId(null);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <EnvelopeSimpleIcon weight="duotone" className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{order.reportSent ? "Resend Report" : "Send Complete Report"}</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      togglePaymentStatus(order.id);
                      setActiveMenuOrderId(null);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <CurrencyDollarIcon weight="bold" className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{isPartial ? "Mark Package Paid" : "Mark Awaiting Payment"}</span>
                  </button>

                  <button
                    onClick={() => {
                      setCustomerProfileModalOrder(order);
                      setActiveMenuOrderId(null);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer border-t border-slate-100 mt-1 pt-2"
                  >
                    <UserIcon weight="duotone" className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>View Profile & Details</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      },
    },
  ], [activeMenuOrderId, paginatedOrders.length]);

  return (
    <div className="space-y-3 sm:space-y-3.5 w-full pb-0">
      {/* Modern High-Impact Stat Cards (Dark Red, Light Red, Light Gray, Dark Gray Theme with 4 Unique Vector Background Patterns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Total Orders (DARK RED) */}
        <div className="relative rounded-2xl p-4 sm:p-4.5 overflow-hidden bg-[#7c0d15] text-white shadow-md hover:shadow-xl transition-all duration-300 group cursor-default border border-red-900/40">
          {/* Rose Associates Real Estate Background Image (Properties) */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
            style={{ backgroundImage: `url('https://i0.wp.com/roseassociates.com/wp-content/uploads/2022/09/properties.png?fit=1200%2C300&ssl=1')` }}
          />
          {/* Dark Red Tint Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#7c0d15] via-[#7c0d15]/90 to-[#7c0d15]/65 pointer-events-none" />

          {/* Pattern 1: Curved Fluid Contour Waves Overlay */}
          <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none stroke-white" viewBox="0 0 300 120" fill="none">
            <path d="M-20 30 Q 90 110, 190 20 T 330 90" strokeWidth="2.5" />
            <path d="M-20 70 Q 110 130, 210 30 T 350 110" strokeWidth="1.5" />
          </svg>

          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-red-100 block drop-shadow-xs">Total Orders</span>
              <h3 className="text-2xl sm:text-3xl font-black text-white leading-none tracking-tight drop-shadow-md">{metrics.totalCount}</h3>
              <span className="text-[10px] font-bold text-white flex items-center gap-1 mt-1.5 bg-black/40 backdrop-blur-md border border-white/20 px-2.5 py-0.5 rounded-full w-fit">
                Active Contracts
              </span>
            </div>
            {/* Sleek Un-boxed Vertical Bar Sparkline Chart */}
            <div className="flex items-end gap-1.5 h-11 shrink-0 opacity-95 group-hover:scale-110 transition-transform duration-300 pr-1">
              <div className="w-2 h-4 bg-white/40 rounded-full shadow-xs" />
              <div className="w-2 h-7 bg-white/60 rounded-full shadow-xs" />
              <div className="w-2 h-4.5 bg-white/40 rounded-full shadow-xs" />
              <div className="w-2 h-9 bg-white/80 rounded-full shadow-xs" />
              <div className="w-2 h-5.5 bg-white/50 rounded-full shadow-xs" />
              <div className="w-2 h-11 bg-white rounded-full shadow-md animate-pulse border border-white/80" />
            </div>
          </div>
        </div>

        {/* Card 2: Full Payments (LIGHT RED) */}
        <div className="relative rounded-2xl p-4 sm:p-4.5 overflow-hidden bg-[#b5111b] text-white shadow-md hover:shadow-xl transition-all duration-300 group cursor-default border border-red-500/30">
          {/* Rose Associates Services Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
            style={{ backgroundImage: `url('https://i0.wp.com/roseassociates.com/wp-content/uploads/2022/09/services-.png?fit=1200%2C300&ssl=1')` }}
          />
          {/* Light Red / Crimson Tint Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#b5111b] via-[#c41e2a]/90 to-[#b5111b]/65 pointer-events-none" />

          {/* Pattern 2: Concentric Radar Circles & Ripple Arcs Overlay */}
          <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none stroke-white" viewBox="0 0 300 120" fill="none">
            <circle cx="260" cy="20" r="35" strokeWidth="1.5" />
            <circle cx="260" cy="20" r="70" strokeWidth="2" strokeDasharray="5 4" />
            <circle cx="260" cy="20" r="105" strokeWidth="1.5" />
          </svg>

          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-red-100 block drop-shadow-xs">Full Payments</span>
              <h3 className="text-2xl sm:text-3xl font-black text-white leading-none tracking-tight drop-shadow-md">{metrics.fullCount}</h3>
              <span className="text-[10px] font-bold text-white flex items-center gap-1 mt-1.5 bg-black/40 backdrop-blur-md border border-white/20 px-2.5 py-0.5 rounded-full w-fit">
                ${metrics.totalCollected.toLocaleString('en-US')} Verified
              </span>
            </div>
            {/* Sleek Un-boxed Glowing Sparkline Wave */}
            <div className="w-24 sm:w-28 h-11 shrink-0 opacity-95 group-hover:scale-110 transition-transform duration-300 pr-1">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" fill="none">
                <defs>
                  <linearGradient id="fullSparkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d="M0 34 C 20 30, 30 14, 50 20 C 70 26, 80 8, 98 4 L 98 40 L 0 40 Z" fill="url(#fullSparkGrad)" />
                <path d="M0 34 C 20 30, 30 14, 50 20 C 70 26, 80 8, 98 4" stroke="white" strokeWidth="3" strokeLinecap="round" />
                <circle cx="98" cy="4" r="4" fill="#34d399" className="animate-ping" />
                <circle cx="98" cy="4" r="3.5" fill="white" />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 3: Awaiting Payment (LIGHT GRAY) */}
        <div className="relative rounded-2xl p-4 sm:p-4.5 overflow-hidden bg-[#475569] text-white shadow-md hover:shadow-xl transition-all duration-300 group cursor-default border border-slate-500/40">
          {/* Rose Associates Cross Services Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
            style={{ backgroundImage: `url('https://i0.wp.com/roseassociates.com/wp-content/uploads/2022/09/cross-services.png?fit=1200%2C300&ssl=1')` }}
          />
          {/* Light Gray / Slate Metallic Tint Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#475569] via-[#334155]/90 to-[#334155]/65 pointer-events-none" />

          {/* Pattern 3: Geometric Architectural Lattice Grid Mesh Overlay */}
          <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none stroke-white" viewBox="0 0 300 120" fill="none">
            <path d="M-50 0 L350 120 M-50 40 L350 160 M-50 -40 L350 80" strokeWidth="1.5" />
            <path d="M350 0 L-50 120 M350 40 L-50 160 M350 -40 L-50 80" strokeWidth="1.5" />
          </svg>

          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-100 block drop-shadow-xs">Awaiting Payment</span>
              <h3 className="text-2xl sm:text-3xl font-black text-white leading-none tracking-tight drop-shadow-md">{metrics.partialCount}</h3>
              <span className="text-[10px] font-bold text-white flex items-center gap-1 mt-1.5 bg-black/40 backdrop-blur-md border border-white/20 px-2.5 py-0.5 rounded-full w-fit">
                ${metrics.totalRemaining.toLocaleString('en-US')} Remaining
              </span>
            </div>
            {/* Sleek Un-boxed Speed-Arc Progress Gauge Visualizer */}
            <div className="w-20 sm:w-24 h-11 shrink-0 opacity-95 group-hover:scale-110 transition-transform duration-300 pr-1 flex items-center justify-center">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 80 44" fill="none">
                <path d="M 10 38 A 30 30 0 0 1 70 38" stroke="rgba(255,255,255,0.25)" strokeWidth="6" strokeLinecap="round" />
                <path d="M 10 38 A 30 30 0 0 1 40 8" stroke="#fbbf24" strokeWidth="6" strokeLinecap="round" />
                <circle cx="40" cy="8" r="4.5" fill="white" className="shadow-md" />
                <circle cx="40" cy="8" r="2.5" fill="#fbbf24" />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 4: Contract Value (DARK GRAY) */}
        <div className="relative rounded-2xl p-4 sm:p-4.5 overflow-hidden bg-[#0f172a] text-white shadow-md hover:shadow-xl transition-all duration-300 group cursor-default border border-slate-800">
          {/* Rose Associates Newspapers Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
            style={{ backgroundImage: `url('https://i0.wp.com/roseassociates.com/wp-content/uploads/2023/01/newspapers.png?fit=1200%2C300&ssl=1')` }}
          />
          {/* Dark Gray / Slate Charcoal Tint Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-[#0f172a]/95 to-[#1e293b]/70 pointer-events-none" />

          {/* Pattern 4: Intersecting Rays & Constellation Dot Network Overlay */}
          <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none stroke-slate-300" viewBox="0 0 300 120" fill="none">
            <line x1="0" y1="100" x2="300" y2="10" strokeWidth="1.5" strokeDasharray="6 4" />
            <line x1="20" y1="120" x2="280" y2="-10" strokeWidth="2" />
            <line x1="-10" y1="40" x2="250" y2="130" strokeWidth="1.5" />
            <circle cx="180" cy="35" r="4" fill="white" opacity="0.8" />
            <circle cx="90" cy="70" r="3" fill="white" opacity="0.8" />
          </svg>

          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-200 block drop-shadow-xs">Contract Value</span>
              <h3 className="text-2xl sm:text-3xl font-black text-white leading-none tracking-tight drop-shadow-md">
                ${(metrics.totalCollected + metrics.totalRemaining).toLocaleString('en-US')}
              </h3>
              <span className="text-[10px] font-bold text-white flex items-center gap-1 mt-1.5 bg-black/40 backdrop-blur-md border border-white/20 px-2.5 py-0.5 rounded-full w-fit">
                100% Receivables
              </span>
            </div>
            {/* Sleek Un-boxed Sweeping Financial Growth Area Graph */}
            <div className="w-24 sm:w-28 h-11 shrink-0 opacity-95 group-hover:scale-110 transition-transform duration-300 pr-1">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" fill="none">
                <defs>
                  <linearGradient id="contractSparkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d="M0 36 C 25 32, 40 18, 60 22 C 78 26, 85 8, 98 2 L 98 40 L 0 40 Z" fill="url(#contractSparkGrad)" />
                <path d="M0 36 C 25 32, 40 18, 60 22 C 78 26, 85 8, 98 2" stroke="white" strokeWidth="3" strokeLinecap="round" />
                <circle cx="98" cy="2" r="3.5" fill="#38bdf8" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop overlay for closing dropdown menus */}
      {activeMenuOrderId && (
        <div
          className="fixed inset-0 z-20 bg-transparent"
          onClick={() => {
            setActiveMenuOrderId(null);
          }}
        />
      )}

      {/* Toolbar + shared DataTable (no outer card — DataTable has its own chrome) */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
          {/* Integrated Search Input Box */}
          <div className="relative w-full lg:w-96">
            <MagnifyingGlassIcon weight="bold" className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Customer, County, State or Project..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 text-sm rounded-xl border border-slate-200 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary shadow-2xs transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <XIcon weight="bold" className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Integrated Segmented Capsule Filter Pills */}
          <div className="bg-white p-1 rounded-2xl border border-slate-200 flex items-center gap-1.5 w-full lg:w-auto overflow-x-auto shadow-2xs">
            <button
              onClick={() => setStatusFilter("all")}
              className={cn(
                "px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex-1 lg:flex-none text-center whitespace-nowrap",
                statusFilter === "all"
                  ? "bg-[#B5111B] text-white shadow-xs font-extrabold scale-[1.02]"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              All Orders ({metrics.totalCount})
            </button>
            <button
              onClick={() => setStatusFilter("partial")}
              className={cn(
                "px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex-1 lg:flex-none text-center flex items-center justify-center gap-1.5 whitespace-nowrap",
                statusFilter === "partial"
                  ? "bg-amber-500 text-white shadow-xs font-extrabold scale-[1.02]"
                  : "text-slate-600 hover:bg-amber-50 hover:text-amber-700"
              )}
            >
              <ClockIcon weight="duotone" className="w-3.5 h-3.5" />
              Awaiting ({metrics.partialCount})
            </button>
            <button
              onClick={() => setStatusFilter("full")}
              className={cn(
                "px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex-1 lg:flex-none text-center flex items-center justify-center gap-1.5 whitespace-nowrap",
                statusFilter === "full"
                  ? "bg-emerald-600 text-white shadow-xs font-extrabold scale-[1.02]"
                  : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
              )}
            >
              <CheckCircleIcon weight="duotone" className="w-3.5 h-3.5" />
              Full ({metrics.fullCount})
            </button>
          </div>
        </div>

        <DataTable
          columns={orderColumns}
          data={paginatedOrders}
          totalItems={filteredOrders.length}
          page={currentPage}
          pageSize={pageSize}
          pageSizeOptions={[5, 10, 25, 50, 100]}
          scrollAfterPageSize={5}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          sorting={sorting}
          onSortingChange={setSorting}
          emptyMessage="No orders match your filter"
          emptySubtext="Try adjusting your search keywords or switching filters."
        />
      </div>

      {/* MODAL 1: Send Reminder Confirmation Popup */}
      {reminderModalOrder && (
        <Modal
          isOpen={!!reminderModalOrder}
          onClose={() => setReminderModalOrder(null)}
          title="Confirm Send Payment Reminder"
          className="max-w-md w-[94%] sm:w-full rounded-2xl sm:rounded-3xl"
        >
          <div className="space-y-4">
            {/* Header Alert Card */}
            <div className="flex items-center gap-3 p-3.5 bg-amber-50 border border-amber-200/90 rounded-2xl text-amber-900">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-2xs font-bold">
                <EnvelopeSimpleIcon weight="duotone" className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Send Payment Reminder Email?</div>
                <div className="text-xs text-amber-800 font-semibold">Outstanding balance notice to customer</div>
              </div>
            </div>

            {/* Details Summary Card */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Customer Name:</span>
                <span className="font-bold text-slate-900">{reminderModalOrder.customerName}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Recipient Email:</span>
                <span className="font-bold text-slate-900">{reminderModalOrder.customerEmail}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Project Name:</span>
                <span className="font-bold text-slate-900">{reminderModalOrder.projectName}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Remaining Due:</span>
                <span className="font-extrabold text-amber-700 text-xs">
                  ${(reminderModalOrder.totalAmount - reminderModalOrder.paidAmount).toLocaleString('en-US')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Payment Due Date:</span>
                <span className="font-bold text-slate-800">{reminderModalOrder.dueDate}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 text-center leading-relaxed">
              Are you sure you want to trigger this payment reminder email to <strong>{reminderModalOrder.customerEmail}</strong>?
            </p>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReminderModalOrder(null)}
                className="text-xs font-bold cursor-pointer rounded-xl border-slate-300"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmSendReminder}
                disabled={isSending}
                className="bg-[#B5111B] hover:bg-[#8C0C14] text-white text-xs font-bold cursor-pointer shadow-xs rounded-xl flex items-center gap-1.5"
              >
                <PaperPlaneRightIcon weight="bold" className="w-3.5 h-3.5" />
                <span>{isSending ? "Sending..." : "Confirm & Send Email"}</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 2: Deliver Report Confirmation Popup */}
      {reportModalOrder && (
        <Modal
          isOpen={!!reportModalOrder}
          onClose={() => setReportModalOrder(null)}
          title="Confirm Deliver Scorecard Report"
          className="max-w-md w-[94%] sm:w-full rounded-2xl sm:rounded-3xl"
        >
          <div className="space-y-4">
            {/* Header Alert Card */}
            <div className="flex items-center gap-3 p-3.5 bg-emerald-50 border border-emerald-200/90 rounded-2xl text-emerald-900">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs font-bold">
                <CheckCircleIcon weight="duotone" className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Deliver Scorecard PDF Report?</div>
                <div className="text-xs text-emerald-800 font-semibold">Full payment verified (${reportModalOrder.totalAmount.toLocaleString('en-US')})</div>
              </div>
            </div>

            {/* Details Summary Card */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Customer Name:</span>
                <span className="font-bold text-slate-900">{reportModalOrder.customerName}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Recipient Email:</span>
                <span className="font-bold text-slate-900">{reportModalOrder.customerEmail}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Project Name:</span>
                <span className="font-bold text-slate-900">{reportModalOrder.projectName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">PDF Attachment:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircleIcon weight="duotone" className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Full Scorecard PDF (4.2 MB)</span>
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 text-center leading-relaxed">
              Are you sure you want to deliver the complete Scorecard PDF report to <strong>{reportModalOrder.customerEmail}</strong>?
            </p>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReportModalOrder(null)}
                className="text-xs font-bold cursor-pointer rounded-xl border-slate-300"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmSendReport}
                disabled={isSending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-xs rounded-xl flex items-center gap-1.5"
              >
                <PaperPlaneRightIcon weight="bold" className="w-3.5 h-3.5" />
                <span>{isSending ? "Delivering..." : "Confirm & Deliver Report"}</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 3: Payment History Modal */}
      {paymentHistoryModalOrder && (
        <Modal
          isOpen={!!paymentHistoryModalOrder}
          onClose={() => setPaymentHistoryModalOrder(null)}
          title="Payment History & Transactions"
          className="max-w-xl w-[94%] sm:w-full rounded-2xl sm:rounded-3xl"
        >
          <div className="space-y-4 text-left">
            {/* Header Info Banner */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
              <div>
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Order: {paymentHistoryModalOrder.orderNumber}
                </div>
                <div className="text-sm font-extrabold text-white">{paymentHistoryModalOrder.projectName}</div>
                <div className="text-xs text-slate-300 font-medium">
                  {paymentHistoryModalOrder.customerName} ({paymentHistoryModalOrder.organization})
                </div>
              </div>
              <div className="shrink-0">
                {paymentHistoryModalOrder.paymentStatus === 'full' ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <CheckCircleIcon weight="duotone" className="w-3.5 h-3.5" /> Paid in Full
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <ClockIcon weight="duotone" className="w-3.5 h-3.5" /> Awaiting Payment
                  </span>
                )}
              </div>
            </div>

            {/* Metric Cards Summary */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Total Contract</div>
                <div className="text-sm sm:text-base font-extrabold text-slate-900">
                  ${paymentHistoryModalOrder.totalAmount.toLocaleString('en-US')}
                </div>
              </div>
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 text-center">
                <div className="text-[10px] font-bold text-emerald-700 uppercase">Total Paid</div>
                <div className="text-sm sm:text-base font-extrabold text-emerald-800">
                  ${paymentHistoryModalOrder.paidAmount.toLocaleString('en-US')}
                </div>
              </div>
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-center">
                <div className="text-[10px] font-bold text-amber-700 uppercase">Remaining Due</div>
                <div className="text-sm sm:text-base font-extrabold text-amber-800">
                  ${(paymentHistoryModalOrder.totalAmount - paymentHistoryModalOrder.paidAmount).toLocaleString('en-US')}
                </div>
              </div>
            </div>

            {/* Transaction History Log Table */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ReceiptIcon weight="duotone" className="w-4 h-4 text-blue-600" />
                  Transaction History ({paymentHistoryModalOrder.paymentHistory?.length || 0})
                </span>
                <span className="text-[11px] text-slate-400 font-normal">All amounts in USD</span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-3.5 py-2.5">Date & Ref</th>
                      <th className="px-3.5 py-2.5">Type & Method</th>
                      <th className="px-3.5 py-2.5 text-right">Amount</th>
                      <th className="px-3.5 py-2.5 text-center">Status</th>
                      <th className="px-3.5 py-2.5 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(paymentHistoryModalOrder.paymentHistory || []).map((txn) => (
                      <tr key={txn.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-3.5 py-3 align-middle">
                          <div className="font-bold text-slate-900">{txn.date}</div>
                          <div className="text-[10px] font-mono text-slate-400">{txn.id} • {txn.reference}</div>
                        </td>
                        <td className="px-3.5 py-3 align-middle">
                          <div className="font-bold text-slate-800">{txn.type}</div>
                          <div className="text-[10px] text-slate-500">{txn.method}</div>
                        </td>
                        <td className="px-3.5 py-3 align-middle text-right font-extrabold text-emerald-700">
                          +${txn.amount.toLocaleString('en-US')}
                        </td>
                        <td className="px-3.5 py-3 align-middle text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckIcon weight="bold" className="w-2.5 h-2.5" />
                            Completed
                          </span>
                        </td>
                        <td className="px-3.5 py-3 align-middle text-right">
                          <button
                            onClick={() => toast.success(`Receipt PDF for ${txn.id} downloaded.`)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer transition-colors"
                            title="Download Payment Receipt PDF"
                          >
                            <ReceiptIcon weight="duotone" className="w-3 h-3 text-slate-500" />
                            <span>PDF</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              {paymentHistoryModalOrder.paymentStatus === 'partial' ? (
                <Button
                  size="sm"
                  onClick={() => {
                    setReminderModalOrder(paymentHistoryModalOrder);
                    setPaymentHistoryModalOrder(null);
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <BellIcon weight="duotone" className="w-3.5 h-3.5" />
                  <span>Send Payment Reminder</span>
                </Button>
              ) : (
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircleIcon weight="duotone" className="w-4 h-4 text-emerald-600" /> 100% Contract Paid in Full
                </span>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaymentHistoryModalOrder(null)}
                className="text-xs font-bold cursor-pointer rounded-xl border-slate-300"
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
      {/* DRAWER: Customer Roadmap Right-Side Slide-Over Panel */}
      {roadmapModalOrder && (() => {
        const drawerStep = normalizeTimelineStep(roadmapModalOrder.timelineStep);
        const isDrawerAllDone = drawerStep === TOTAL_ROADMAP_STEPS;
        return (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop Overlay */}
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
              onClick={() => setRoadmapModalOrder(null)}
            />

            {/* Slide-over Drawer Panel */}
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 animate-in slide-in-from-right duration-300 flex flex-col justify-between">

                {/* Drawer Header */}
                <div className="p-4 sm:p-5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold">
                      <ClockIcon weight="duotone" className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 leading-tight">Customer Roadmap</h3>
                      <p className="text-xs text-slate-500 font-medium">Track the 5-step customer journey</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setRoadmapModalOrder(null)}
                    className="w-8 h-8 p-0 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    <XIcon weight="bold" className="w-4 h-4" />
                  </Button>
                </div>

                {/* Drawer Scrollable Content */}
                <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-left">
                  {/* Order & Customer Summary Card */}
                  <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between shadow-md">
                    <div>
                      <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        Order: {roadmapModalOrder.orderNumber}
                      </div>
                      <div className="text-sm font-extrabold text-white">{roadmapModalOrder.projectName}</div>
                      <div className="text-xs text-slate-300 font-medium">
                        {roadmapModalOrder.customerName} • {roadmapModalOrder.countyOrState}
                      </div>
                    </div>
                    {isDrawerAllDone ? (
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                        <CheckCircleIcon weight="duotone" className="w-3.5 h-3.5 text-emerald-400" /> Completed ({TOTAL_ROADMAP_STEPS}/{TOTAL_ROADMAP_STEPS})
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30 shrink-0">
                        Stage {drawerStep} of {TOTAL_ROADMAP_STEPS}
                      </span>
                    )}
                  </div>

                  {/* Vertical Stepper Item List */}
                  <div className="relative pl-6 border-l-2 border-slate-200 ml-3 space-y-3 py-1">
                    {TIMELINE_STEPS.map((step) => {
                      const isCompleted = isDrawerAllDone ? true : step.id < drawerStep;
                      const isCurrent = isDrawerAllDone ? false : step.id === drawerStep;
                      const isUpcoming = isDrawerAllDone ? false : step.id > drawerStep;
                      const stepDate = roadmapModalOrder.stepDates?.[step.id];

                      return (
                        <div
                          key={step.id}
                          className="relative"
                        >
                          <div className={cn(
                            "absolute -left-[35px] top-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-2xs select-none",
                            isCompleted && "bg-emerald-600 text-white",
                            isCurrent && "bg-blue-600 text-white ring-4 ring-blue-100 scale-110 shadow-md",
                            isUpcoming && "bg-white text-slate-400 border border-slate-300"
                          )}>
                            {isCompleted ? <CheckIcon weight="bold" className="w-3 h-3 stroke-[3]" /> : step.id}
                          </div>

                          <div className={cn(
                            "p-3.5 rounded-2xl border transition-all select-none",
                            isCurrent && "bg-blue-50/90 border-blue-300 shadow-2xs ring-1 ring-blue-200",
                            isCompleted && "bg-emerald-50/90 border-emerald-300 shadow-2xs",
                            isUpcoming && "bg-white border-slate-200"
                          )}>
                            <div className="flex items-center justify-between gap-1">
                              <span className={cn(
                                "text-xs font-extrabold",
                                isCurrent ? "text-blue-950" : isCompleted ? "text-emerald-950" : "text-slate-800"
                              )}>
                                {step.id}. {step.label}
                              </span>
                              {isCurrent && (
                                <span className="text-[9px] font-extrabold bg-blue-100 text-blue-800 border border-blue-300 px-2 py-0.5 rounded-md shrink-0">
                                  ACTIVE STAGE
                                </span>
                              )}
                              {isDrawerAllDone && step.id === 6 && (
                                <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-md shrink-0 flex items-center gap-0.5">
                                  <CheckIcon weight="bold" className="w-2.5 h-2.5" /> COMPLETED
                                </span>
                              )}
                            </div>
                            <div className={cn(
                              "text-xs font-medium leading-relaxed mt-1",
                              isCurrent ? "text-blue-800/80" : isCompleted ? "text-emerald-800/80" : "text-slate-500"
                            )}>
                              {step.description}
                            </div>
                            <div className={cn(
                              "text-[11px] font-semibold mt-2 flex items-center gap-1.5",
                              isCurrent ? "text-blue-700" : isCompleted ? "text-emerald-700" : "text-slate-400"
                            )}>
                              <ClockIcon weight="duotone" className="w-3 h-3 shrink-0 opacity-80" />
                              <span>
                                {isCompleted
                                  ? `Completed: ${stepDate || "Done"}`
                                  : isCurrent
                                    ? `Active: ${stepDate || "In Progress"}`
                                    : `Scheduled`}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Drawer Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
                  <span className="text-xs text-slate-500 font-medium">Stages update automatically with project progress</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRoadmapModalOrder(null)}
                    className="text-xs font-bold rounded-xl border-slate-300 hover:bg-white cursor-pointer"
                  >
                    Close
                  </Button>
                </div>

              </div>
            </div>
          </div>
        );
      })()}
      {/* DRAWER: Customer Profile & Order Overview Side Panel */}
      {(() => {
        if (!customerProfileModalOrder) return null;
        const remaining = customerProfileModalOrder.totalAmount - customerProfileModalOrder.paidAmount;

        return (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
              onClick={() => setCustomerProfileModalOrder(null)}
            />

            {/* Slide-over Drawer Panel */}
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 animate-in slide-in-from-right duration-300 flex flex-col justify-between">

                {/* Drawer Header */}
                <div className="p-4 sm:p-5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#B5111B] to-rose-800 text-white font-black flex items-center justify-center text-xs shadow-md shrink-0">
                      {customerProfileModalOrder.customerName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 leading-tight">{customerProfileModalOrder.customerName}</h3>
                      <p className="text-xs text-slate-500 font-medium">{customerProfileModalOrder.customerEmail}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setCustomerProfileModalOrder(null)}
                    className="w-8 h-8 p-0 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    <XIcon weight="bold" className="w-4 h-4" />
                  </Button>
                </div>

                {/* Drawer Scrollable Content */}
                <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-left">
                  {/* Account Overview Summary Card (Matches Settings Light Slate Style) */}
                  <div className="p-4 bg-slate-50/90 border border-slate-200/90 rounded-2xl space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Account Overview</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-50 text-[#B5111B] border border-red-200">
                        Order: {customerProfileModalOrder.orderNumber}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-0.5">
                        <span className="text-slate-400 block text-[10px] font-extrabold uppercase tracking-wider">County / Region</span>
                        <span className="font-black text-slate-900 text-xs flex items-center gap-1">
                          <MapPinIcon weight="duotone" className="w-3.5 h-3.5 text-slate-400" />
                          {customerProfileModalOrder.countyOrState}
                        </span>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-0.5">
                        <span className="text-slate-400 block text-[10px] font-extrabold uppercase tracking-wider">Project Name</span>
                        <span className="font-black text-[#B5111B] text-xs truncate block" title={customerProfileModalOrder.projectName}>
                          {customerProfileModalOrder.projectName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Details Grid */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <ReceiptIcon weight="duotone" className="w-3.5 h-3.5 text-slate-500" /> Financial & Order Summary
                    </h4>
                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-0.5">
                        <span className="text-slate-400 block text-[10px] font-extrabold uppercase tracking-wider">Contract Total</span>
                        <span className="font-black text-slate-900 text-sm">
                          ${customerProfileModalOrder.totalAmount.toLocaleString('en-US')}
                        </span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-0.5">
                        <span className="text-slate-400 block text-[10px] font-extrabold uppercase tracking-wider">Amount Paid</span>
                        <span className="font-black text-emerald-700 text-sm">
                          ${customerProfileModalOrder.paidAmount.toLocaleString('en-US')}
                        </span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-0.5">
                        <span className="text-slate-400 block text-[10px] font-extrabold uppercase tracking-wider">Remaining Balance</span>
                        <span className={cn("font-black text-sm", remaining > 0 ? "text-amber-700" : "text-emerald-700")}>
                          ${remaining.toLocaleString('en-US')}
                        </span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-0.5">
                        <span className="text-slate-400 block text-[10px] font-extrabold uppercase tracking-wider">Payment Status</span>
                        <span className={cn("font-black text-xs inline-flex items-center gap-1", customerProfileModalOrder.paymentStatus === 'full' ? "text-emerald-700" : "text-amber-700")}>
                          {customerProfileModalOrder.paymentStatus === 'full' ? 'Paid in Full' : 'Awaiting Payment'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Stage Summary */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-900 uppercase tracking-wider text-[10px]">Current Timeline Stage</span>
                      <span className="font-bold text-[#B5111B]">
                        Stage {normalizeTimelineStep(customerProfileModalOrder.timelineStep)} of {TOTAL_ROADMAP_STEPS}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#B5111B] to-rose-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${(normalizeTimelineStep(customerProfileModalOrder.timelineStep) / TOTAL_ROADMAP_STEPS) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-slate-600 font-semibold pt-1 flex items-center justify-between">
                      <span>Active Stage:</span>
                      <button
                        onClick={() => {
                          const target = customerProfileModalOrder;
                          setCustomerProfileModalOrder(null);
                          setRoadmapModalOrder(target);
                        }}
                        className="text-[#B5111B] font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <span>Open Timeline Stepper</span>
                        <CaretRightIcon weight="bold" className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Drawer Footer Actions */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const target = customerProfileModalOrder;
                      setCustomerProfileModalOrder(null);
                      setPaymentHistoryModalOrder(target);
                    }}
                    className="rounded-xl text-xs font-bold border-slate-300 flex-1"
                  >
                    Payment History
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      const email = customerProfileModalOrder.customerEmail;
                      setCustomerProfileModalOrder(null);
                      toast.success(`Opening email message draft to ${email}`);
                    }}
                    className="bg-[#B5111B] hover:bg-[#8F0D15] text-white rounded-xl text-xs font-bold flex-1"
                  >
                    Contact Customer
                  </Button>
                </div>

              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
