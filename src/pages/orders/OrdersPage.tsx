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
  CaretDownIcon,
  DotsThreeVerticalIcon,
  CheckIcon,
  DatabaseIcon,
  PencilSimpleIcon,
  UserIcon,
  FileTextIcon,
  FolderOpenIcon,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef, SortingState } from "@tanstack/react-table"
import { apiClient } from "@/lib/api"
import { FakeCardPaymentForm } from "@/components/payments/FakeCardPaymentForm"
import { Link } from "@/lib/router-compat"
import { printPaymentReceipt } from "@/lib/payment-receipt"
import { createPortal } from "react-dom"
import { useAppStore } from "@/store"

export type PaymentStatus = 'partial' | 'full'; // derived: paid → full, else partial
export type OrderStatusFilter = 'all' | 'pending' | 'paid' | 'failed' | 'refunded';

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

/** Clamp to 1–5; legacy 6-step values (≥6) map to Released (5). */
export function normalizeTimelineStep(step: number): number {
  if (!step || step < 1) return 1;
  if (step >= 6) return 5;
  return Math.min(step, 5);
}

export interface OrderProjectItem {
  id: string;
  name: string;
  status: string;
  year?: number;
  county?: string;
  state?: string;
  clientName?: string;
  /** Paid order that owns this project slot */
  orderId?: string;
  timelineStep: number;
  certifiedReportUrl?: string | null;
  certifiedReportFileName?: string | null;
  isPrimary?: boolean;
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
  /** Backend order status: pending | paid | failed | refunded */
  status: string;
  paymentStatus: PaymentStatus;
  orderDate: string;
  /** Paid date when paid; otherwise order created date */
  paymentOrOrderDate: string;
  paymentOrOrderDateLabel: "Paid on" | "Ordered on";
  dueDate: string;
  reportSent: boolean;
  reminderSentCount: number;
  timelineStep: number; // 1 to 5 (legacy / primary project)
  stepDates?: Record<number, string>;
  paymentHistory?: PaymentTransaction[];
  packageName?: string;
  packageSlots?: number;
  projectsUsed?: number;
  customerProjects?: OrderProjectItem[];
  /** stub | stripe | invoice */
  provider?: string;
}

function formatShortDate(value?: string | Date | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function packageBadgeClasses(packageName?: string | null) {
  const n = String(packageName || "").toLowerCase();
  if (n.includes("combined")) {
    return "bg-[#B5111B]/10 text-[#B5111B] border-[#B5111B]/25";
  }
  if (n.includes("subscription") || n.includes("multi")) {
    return "bg-slate-100 text-slate-700 border-slate-300";
  }
  if (n.includes("scorecard")) {
    return "bg-amber-50 text-amber-800 border-amber-200";
  }
  return "bg-sky-50 text-sky-800 border-sky-200";
}

function mapApiOrderToItem(raw: any): OrderItem {
  const status = String(raw.status || "pending").toLowerCase();
  const paid = status === "paid";
  const attempts = Array.isArray(raw.paymentAttempts) ? raw.paymentAttempts : [];
  const customerProjects: OrderProjectItem[] = Array.isArray(raw.customerProjects)
    ? raw.customerProjects.map((p: any) => ({
        id: p.id,
        name: p.name || "Untitled project",
        status: String(p.status || ""),
        year: p.year,
        county: p.county,
        state: p.state,
        clientName: p.clientName,
        orderId: p.orderId || raw.id,
        timelineStep: normalizeTimelineStep(Number(p.timelineStep || 1)),
        certifiedReportUrl: p.certifiedReportUrl || null,
        certifiedReportFileName: p.certifiedReportFileName || null,
        isPrimary: Boolean(p.isPrimary),
      }))
    : [];
  const paidAtFormatted = formatShortDate(raw.paidAt);
  const createdFormatted = formatShortDate(raw.createdAt);
  const customerName = String(raw.customerName || "").trim();
  const orgFromOrder = String(raw.organization || raw.organizationName || "").trim();
  const orgFromProject = String(customerProjects[0]?.clientName || "").trim();
  const organization =
    orgFromOrder ||
    (orgFromProject && orgFromProject.toLowerCase() !== customerName.toLowerCase()
      ? orgFromProject
      : "");
  return {
    id: raw.id,
    orderNumber: raw.orderNumber,
    customerName,
    customerEmail: raw.customerEmail || "",
    organization,
    countyOrState:
      raw.countyOrState ||
      [customerProjects[0]?.county, customerProjects[0]?.state].filter(Boolean).join(", ") ||
      "—",
    projectName: raw.projectName || customerProjects[0]?.name || raw.packageName || "",
    totalAmount: Number(raw.amountDue || 0),
    paidAmount: Number(raw.amountPaid || 0),
    status,
    paymentStatus: paid ? "full" : "partial",
    orderDate: createdFormatted,
    paymentOrOrderDate: paid && paidAtFormatted !== "—" ? paidAtFormatted : createdFormatted,
    paymentOrOrderDateLabel: paid && raw.paidAt ? "Paid on" : "Ordered on",
    dueDate: createdFormatted,
    reportSent:
      customerProjects.some((p) => p.timelineStep >= 5) ||
      Number(raw.timelineStep || 1) >= 5,
    reminderSentCount: Number(raw.reminderSentCount || 0),
    timelineStep: normalizeTimelineStep(
      Number(
        raw.timelineStep ||
          (customerProjects.length
            ? Math.max(...customerProjects.map((p) => p.timelineStep))
            : 1),
      ),
    ),
    stepDates: raw.paidAt ? { 1: paidAtFormatted } : {},
    packageName: raw.packageName,
    packageSlots: Number(raw.packageSlots || 0),
    projectsUsed: Number(raw.projectsUsed ?? customerProjects.length),
    customerProjects,
    provider: String(raw.provider || "").toLowerCase() || undefined,
    paymentHistory: attempts.map((a: any) => ({
      id: a.id,
      date: formatShortDate(a.createdAt),
      amount: Number(a.amount || 0),
      method: a.method || (a.cardLast4 ? `Card •••• ${a.cardLast4}` : "Card (Stub)"),
      status: a.status === "succeeded" ? "completed" : "pending",
      reference: a.reference || "—",
      type: "Full Package Payment" as const,
    })),
  };
}

const STEP_PILL_LABELS: Record<number, string> = {
  1: "Package Selection & Pay",
  2: "Intake Questionnaire",
  3: "3rd-Party Data Ingestion",
  4: "Review & Report Upload",
  5: "Final Release",
};

function getStepLabel(step: number) {
  const stepNum = normalizeTimelineStep(step);
  const isAllDone = stepNum === TOTAL_ROADMAP_STEPS;
  return isAllDone
    ? `Done (${TOTAL_ROADMAP_STEPS}/${TOTAL_ROADMAP_STEPS}): Final Release`
    : `Step ${stepNum}/${TOTAL_ROADMAP_STEPS}: ${STEP_PILL_LABELS[stepNum] || "In progress"}`;
}

/** Chip + 5-node stepper (opens project roadmap on click). Tooltip uses a portal so overflow parents don't clip it. */
function ProjectTimelineCell({
  step,
  stepDates,
  onOpen,
}: {
  step: number;
  stepDates?: Record<number, string>;
  onOpen: () => void;
}) {
  const stepNum = normalizeTimelineStep(step);
  const isAllDone = stepNum === TOTAL_ROADMAP_STEPS;
  const nodeRefs = React.useRef<Record<number, HTMLDivElement | null>>({});
  const [tip, setTip] = React.useState<{
    stepId: number;
    top: number;
    left: number;
    placeBelow: boolean;
  } | null>(null);

  const showNodeTip = (stepId: number) => {
    const el = nodeRefs.current[stepId];
    if (!el) {
      setTip({ stepId, top: 0, left: 0, placeBelow: true });
      return;
    }
    const rect = el.getBoundingClientRect();
    const tipHeight = 118;
    const tipWidth = 208;
    const gap = 10;
    const placeBelow = rect.top < tipHeight + 16;
    const rawLeft = rect.left + rect.width / 2 - tipWidth / 2;
    const left = Math.min(Math.max(8, rawLeft), window.innerWidth - tipWidth - 8);
    const top = placeBelow ? rect.bottom + gap : rect.top - gap;
    setTip({ stepId, top, left, placeBelow });
  };

  const hideNodeTip = () => setTip(null);

  const hoveredStep = tip ? TIMELINE_STEPS.find((s) => s.id === tip.stepId) : null;
  const tipCompleted = hoveredStep
    ? isAllDone || hoveredStep.id < stepNum
    : false;
  const tipCurrent = hoveredStep ? !isAllDone && hoveredStep.id === stepNum : false;
  const tipUpcoming = hoveredStep ? !isAllDone && hoveredStep.id > stepNum : false;
  const tipDoneDate = tip ? stepDates?.[tip.stepId] : undefined;

  return (
    <div className="space-y-2 w-full max-w-md">
      <button
        type="button"
        onClick={onOpen}
        className="inline-flex items-center gap-1.5 max-w-full px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-extrabold text-slate-800 hover:bg-slate-200/80 hover:border-slate-300 cursor-pointer transition-colors"
        title="Open project roadmap"
      >
        {isAllDone ? (
          <CheckCircleIcon weight="duotone" className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        ) : (
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
        )}
        <span className="truncate">{getStepLabel(stepNum)}</span>
        <CaretRightIcon weight="bold" className="w-3 h-3 text-slate-400 shrink-0" />
      </button>

      <button
        type="button"
        onClick={onOpen}
        className="relative block w-full pt-1.5 pb-0.5 px-0.5 cursor-pointer text-left"
        title="Open project roadmap"
      >
        <div className="absolute left-2 right-2 top-[13px] h-1 bg-slate-200 rounded-full z-0 overflow-hidden pointer-events-none">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-300"
            style={{
              width: isAllDone
                ? "100%"
                : `${((Math.max(stepNum, 1) - 1) / (TOTAL_ROADMAP_STEPS - 1)) * 100}%`,
            }}
          />
        </div>
        <div className="relative z-10 flex items-center justify-between">
          {TIMELINE_STEPS.map((s) => {
            const isCompleted = isAllDone ? true : s.id < stepNum;
            const isCurrent = isAllDone ? false : s.id === stepNum;
            const isUpcoming = isAllDone ? false : s.id > stepNum;
            return (
              <div
                key={s.id}
                ref={(el) => {
                  nodeRefs.current[s.id] = el;
                }}
                onMouseEnter={() => showNodeTip(s.id)}
                onMouseLeave={hideNodeTip}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shadow-2xs select-none",
                    isCompleted && "bg-emerald-600 text-white",
                    isCurrent && "bg-blue-600 text-white ring-2 ring-blue-100 scale-110",
                    isUpcoming && "bg-white text-slate-400 border border-slate-300",
                  )}
                >
                  {isCompleted ? <CheckIcon weight="bold" className="w-2.5 h-2.5" /> : s.id}
                </div>
              </div>
            );
          })}
        </div>
      </button>

      {tip && hoveredStep && typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed z-[90] w-52 pointer-events-none"
            style={{
              top: tip.placeBelow ? tip.top : undefined,
              bottom: tip.placeBelow ? undefined : window.innerHeight - tip.top,
              left: tip.left,
            }}
          >
            {tip.placeBelow && (
              <div className="mx-auto w-2.5 h-2.5 bg-slate-900 rotate-45 translate-y-1 border-l border-t border-slate-700" />
            )}
            <div className="rounded-xl bg-slate-900 text-white px-3 py-2.5 shadow-xl border border-slate-700">
              <div className="text-[11px] font-extrabold text-amber-300 leading-snug">
                Step {hoveredStep.id}: {hoveredStep.label.replace(/^Step \d+:\s*/, "")}
              </div>
              <div className="text-[10px] text-slate-300 mt-1 leading-snug">{hoveredStep.description}</div>
              {tipCompleted && (
                <div className="text-[10px] font-bold text-emerald-400 mt-1.5">
                  Done{tipDoneDate ? `: ${tipDoneDate}` : ""}
                </div>
              )}
              {tipCurrent && (
                <div className="text-[10px] font-bold text-sky-300 mt-1.5">Current step</div>
              )}
              {tipUpcoming && (
                <div className="text-[10px] font-bold text-slate-400 mt-1.5">Upcoming</div>
              )}
            </div>
            {!tip.placeBelow && (
              <div className="mx-auto w-2.5 h-2.5 bg-slate-900 rotate-45 -mt-1.5 border-r border-b border-slate-700" />
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}

function projectLifecycleStatus(step: number): { label: string; className: string } {
  const stepNum = normalizeTimelineStep(step);
  if (stepNum >= TOTAL_ROADMAP_STEPS) {
    return { label: "Completed", className: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  }
  return { label: "In Progress", className: "bg-blue-50 text-blue-700 border-blue-200" };
}

const ITEMS_PER_PAGE = 5;

export default function OrdersPage() {
  const currentUser = useAppStore((s) => s.currentUser);
  const isSuperAdmin = String(currentUser?.role || "").toLowerCase() === "super_admin";
  const [orders, setOrders] = React.useState<OrderItem[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<OrderStatusFilter>("all");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(ITEMS_PER_PAGE);
  const [totalItems, setTotalItems] = React.useState(0);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [mounted, setMounted] = React.useState(false);
  const isFirstSearchDebounce = React.useRef(true);
  const [metrics, setMetrics] = React.useState({
    totalCount: 0,
    pendingCount: 0,
    paidCount: 0,
    failedCount: 0,
    refundedCount: 0,
    totalCollected: 0,
    totalRemaining: 0,
    contractValue: 0,
  });

  // Modal & Dropdown State
  const [reminderModalOrder, setReminderModalOrder] = React.useState<OrderItem | null>(null);
  const [reportModalOrder, setReportModalOrder] = React.useState<OrderItem | null>(null);
  const [reportModalProject, setReportModalProject] = React.useState<OrderProjectItem | null>(null);
  const [paymentHistoryModalOrder, setPaymentHistoryModalOrder] = React.useState<OrderItem | null>(null);
  const [roadmapModalOrder, setRoadmapModalOrder] = React.useState<OrderItem | null>(null);
  const [roadmapSelectedProjectId, setRoadmapSelectedProjectId] = React.useState<string | null>(null);
  const [customerProfileModalOrder, setCustomerProfileModalOrder] = React.useState<OrderItem | null>(null);
  const [payModalOrder, setPayModalOrder] = React.useState<OrderItem | null>(null);
  const [isPaying, setIsPaying] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const [expandedOrderIds, setExpandedOrderIds] = React.useState<Set<string>>(new Set());
  const [activeMenuOrderId, setActiveMenuOrderId] = React.useState<string | null>(null);
  const [actionMenuPos, setActionMenuPos] = React.useState<{ top: number; left: number; openUp: boolean } | null>(null);
  const actionButtonRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});
  /** Project action menu key: `${orderId}::${projectId}` */
  const [activeProjectMenuKey, setActiveProjectMenuKey] = React.useState<string | null>(null);
  const [projectMenuPos, setProjectMenuPos] = React.useState<{ top: number; left: number; openUp: boolean } | null>(null);
  const [activeProjectMenuContext, setActiveProjectMenuContext] = React.useState<{
    order: OrderItem;
    project: OrderProjectItem;
  } | null>(null);
  const projectActionButtonRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});

  const closeOrderActionMenu = React.useCallback(() => {
    setActiveMenuOrderId(null);
    setActionMenuPos(null);
  }, []);

  const closeProjectActionMenu = React.useCallback(() => {
    setActiveProjectMenuKey(null);
    setProjectMenuPos(null);
    setActiveProjectMenuContext(null);
  }, []);

  const openActionMenu = React.useCallback((orderId: string) => {
    closeProjectActionMenu();
    if (activeMenuOrderId === orderId) {
      closeOrderActionMenu();
      return;
    }
    const btn = actionButtonRefs.current[orderId];
    if (!btn) {
      setActiveMenuOrderId(orderId);
      return;
    }
    const rect = btn.getBoundingClientRect();
    const menuHeight = 200;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < menuHeight + 12;
    setActionMenuPos({
      top: openUp ? rect.top - 8 : rect.bottom + 8,
      left: Math.max(12, rect.right - 224),
      openUp,
    });
    setActiveMenuOrderId(orderId);
  }, [activeMenuOrderId, closeOrderActionMenu, closeProjectActionMenu]);

  const openProjectActionMenu = React.useCallback(
    (order: OrderItem, project: OrderProjectItem) => {
      closeOrderActionMenu();
      const key = `${order.id}::${project.id}`;
      if (activeProjectMenuKey === key) {
        closeProjectActionMenu();
        return;
      }
      const btn = projectActionButtonRefs.current[key];
      if (!btn) {
        setActiveProjectMenuKey(key);
        setActiveProjectMenuContext({ order, project });
        return;
      }
      const rect = btn.getBoundingClientRect();
      const menuHeight = 180;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < menuHeight + 12;
      setProjectMenuPos({
        top: openUp ? rect.top - 8 : rect.bottom + 8,
        left: Math.max(12, rect.right - 224),
        openUp,
      });
      setActiveProjectMenuKey(key);
      setActiveProjectMenuContext({ order, project });
    },
    [activeProjectMenuKey, closeOrderActionMenu, closeProjectActionMenu],
  );

  const toggleOrderExpanded = React.useCallback((orderId: string) => {
    setExpandedOrderIds((prev) => {
      // Accordion: only one child row open at a time
      if (prev.has(orderId)) return new Set();
      return new Set([orderId]);
    });
  }, []);

  const openRoadmap = React.useCallback((order: OrderItem, projectId?: string) => {
    setRoadmapModalOrder(order);
    const projects = order.customerProjects || [];
    const preferred =
      projectId ||
      projects.find((p) => p.isPrimary)?.id ||
      projects[0]?.id ||
      null;
    setRoadmapSelectedProjectId(preferred);
  }, []);

  // 1. Seed from URL on mount
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
    if (st && ["pending", "paid", "failed", "refunded"].includes(st)) {
      setStatusFilter(st as OrderStatusFilter);
    }
    if (params.get("page")) {
      setCurrentPage(Math.max(1, parseInt(params.get("page") || "1", 10)));
    }
    if (params.get("limit")) {
      setPageSize(Math.max(1, parseInt(params.get("limit") || String(ITEMS_PER_PAGE), 10)));
    }
  }, []);

  // 2. Debounce search
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

  // 3. Sync URL
  React.useEffect(() => {
    if (typeof window === "undefined" || !mounted) return;
    const params = new URLSearchParams();
    if (currentPage > 1) params.set("page", String(currentPage));
    if (pageSize !== ITEMS_PER_PAGE) params.set("limit", String(pageSize));
    if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
    if (statusFilter !== "all") params.set("status", statusFilter);
    const newQuery = params.toString() ? `?${params.toString()}` : "";
    window.history.replaceState(null, "", `/orders${newQuery}`);
  }, [currentPage, pageSize, debouncedSearch, statusFilter, mounted]);

  const refreshOrders = React.useCallback(async () => {
    setIsLoadingOrders(true);
    try {
      const res = await apiClient.getOrders({
        search: debouncedSearch.trim(),
        status: statusFilter,
        page: currentPage,
        limit: pageSize,
      });
      if (res) {
        setOrders((res.data || []).map(mapApiOrderToItem));
        setTotalItems(typeof res.total === "number" ? res.total : (res.data || []).length);
        if (res.summary) {
          setMetrics({
            totalCount: Number(res.summary.totalCount || 0),
            pendingCount: Number(res.summary.pendingCount || 0),
            paidCount: Number(res.summary.paidCount || 0),
            failedCount: Number(res.summary.failedCount || 0),
            refundedCount: Number(res.summary.refundedCount || 0),
            totalCollected: Number(res.summary.totalCollected || 0),
            totalRemaining: Number(res.summary.totalRemaining || 0),
            contractValue: Number(res.summary.contractValue || 0),
          });
        }
      } else {
        setOrders([]);
        setTotalItems(0);
      }
    } finally {
      setIsLoadingOrders(false);
    }
  }, [debouncedSearch, statusFilter, currentPage, pageSize]);

  React.useEffect(() => {
    if (mounted) refreshOrders();
  }, [refreshOrders, mounted]);

  // Client-side sort of current page only
  const paginatedOrders = React.useMemo(() => {
    if (sorting.length === 0) return orders;
    const { id, desc } = sorting[0];
    return [...orders].sort((a, b) => {
      const av = (a as any)[id];
      const bv = (b as any)[id];
      if (typeof av === "number" && typeof bv === "number") return desc ? bv - av : av - bv;
      return desc
        ? String(bv ?? "").localeCompare(String(av ?? ""))
        : String(av ?? "").localeCompare(String(bv ?? ""));
    });
  }, [orders, sorting]);

  // Handle Send Reminder Action
  const handleConfirmSendReminder = async () => {
    if (!reminderModalOrder) return;
    setIsSending(true);
    try {
      const result = await apiClient.sendOrderPaymentReminder(reminderModalOrder.id);
      if (!result.success) {
        toast.error(result.message || "Failed to send payment reminder email.");
        return;
      }
      const nextCount = Number(
        result.data?.reminderSentCount ?? reminderModalOrder.reminderSentCount + 1,
      );
      setOrders((prev) =>
        prev.map((o) =>
          o.id === reminderModalOrder.id ? { ...o, reminderSentCount: nextCount } : o,
        ),
      );
      const remaining =
        result.data?.remainingDue ??
        reminderModalOrder.totalAmount - reminderModalOrder.paidAmount;
      toast.success(
        result.message ||
          `Payment reminder email sent to ${reminderModalOrder.customerEmail} ($${Number(remaining).toLocaleString("en-US")} balance due).`,
      );
      setReminderModalOrder(null);
    } catch {
      toast.error("Failed to send payment reminder email.");
    } finally {
      setIsSending(false);
    }
  };

  // Handle Send / Resend Report for a specific project
  const handleConfirmSendReport = async () => {
    if (!reportModalOrder || !reportModalProject) return;
    setIsSending(true);
    try {
      const result = await apiClient.sendOrderProjectReport(
        reportModalOrder.id,
        reportModalProject.id,
      );
      if (!result.success) {
        toast.error(result.message || "Failed to send scorecard report email.");
        return;
      }

      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== reportModalOrder.id) return o;
          return {
            ...o,
            reportSent: true,
            timelineStep: Math.max(normalizeTimelineStep(o.timelineStep), 5),
            customerProjects: (o.customerProjects || []).map((p) =>
              p.id === reportModalProject.id
                ? { ...p, timelineStep: Math.max(normalizeTimelineStep(p.timelineStep), 5) }
                : p,
            ),
          };
        }),
      );

      toast.success(
        result.message ||
          `Scorecard PDF for “${reportModalProject.name}” emailed to ${reportModalOrder.customerEmail}.`,
      );
      setReportModalOrder(null);
      setReportModalProject(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to send scorecard report email.");
    } finally {
      setIsSending(false);
    }
  };

  const openReportModal = (order: OrderItem, project: OrderProjectItem) => {
    closeProjectActionMenu();
    setReportModalOrder(order);
    setReportModalProject(project);
  };

  const collectPayment = (order: OrderItem) => {
    setActiveMenuOrderId(null);
    setActionMenuPos(null);
    setPayModalOrder(order);
  };

  const handleStubPay = async (payload: {
    cardNumber: string;
    expiry: string;
    cvc: string;
    cardholderName: string;
  }) => {
    if (!payModalOrder) return;
    setIsPaying(true);
    const result = await apiClient.stubPayOrder(payModalOrder.id, payload);
    setIsPaying(false);
    if (!result.success) {
      toast.error(typeof result.message === "string" ? result.message : "Payment failed.");
      await refreshOrders();
      return;
    }
    toast.success(result.message || "Full payment received. Project created.");
    setPayModalOrder(null);
    await refreshOrders();
  };

  const markOrderPaid = async (order: OrderItem) => {
    setActiveMenuOrderId(null);
    setActionMenuPos(null);
    const result = await apiClient.markOrderPaid(order.id);
    if (!result.success) {
      toast.error(result.message || "Could not mark order as paid.");
      return;
    }
    toast.success(result.message || "Order marked paid. Package unlocked.");
    await refreshOrders();
  };

  const refundOrder = async (orderId: string) => {
    setActiveMenuOrderId(null);
    setActionMenuPos(null);
    const result = await apiClient.refundOrder(orderId);
    if (!result.success) {
      toast.error(result.message || "Refund failed.");
      return;
    }
    toast.success("Order refunded.");
    await refreshOrders();
  };

  const orderColumns = React.useMemo<ColumnDef<OrderItem>[]>(() => [
    {
      accessorKey: "customerName",
      header: "Order Details",
      cell: ({ row }) => {
        const order = row.original;
        const isExpanded = expandedOrderIds.has(order.id);
        const projectCount = order.customerProjects?.length || 0;
        return (
          <div className="flex items-center gap-2.5">
            {projectCount > 0 && (
              <button
                type="button"
                onClick={() => toggleOrderExpanded(order.id)}
                className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 inline-flex items-center justify-center cursor-pointer shrink-0"
                title={isExpanded ? "Collapse projects" : "Expand projects"}
              >
                {isExpanded ? (
                  <CaretDownIcon weight="bold" className="w-3.5 h-3.5" />
                ) : (
                  <CaretRightIcon weight="bold" className="w-3.5 h-3.5" />
                )}
              </button>
            )}
            <div
              onClick={() => setCustomerProfileModalOrder(order)}
              className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-500 flex items-center justify-center shrink-0 shadow-2xs cursor-pointer hover:bg-slate-200/70 hover:scale-105 transition-all"
            >
              <UserIcon weight="duotone" className="w-4 h-4 text-slate-500" />
            </div>
            <div className="min-w-0">
              <div
                onClick={() => setCustomerProfileModalOrder(order)}
                className="font-bold text-slate-900 text-sm hover:text-blue-600 transition-colors cursor-pointer truncate"
              >
                {order.customerName}
              </div>
              {order.organization ? (
                <div className="text-xs text-slate-600 font-semibold truncate" title={order.organization}>
                  {order.organization}
                </div>
              ) : null}
              <div className="text-xs text-slate-500 font-medium truncate">{order.customerEmail}</div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                {order.orderNumber}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      id: "contractValue",
      accessorKey: "totalAmount",
      header: "Contract Value",
      cell: ({ row }) => (
        <div className="text-sm font-black text-slate-900">
          ${row.original.totalAmount.toLocaleString("en-US")}
        </div>
      ),
    },
    {
      id: "package",
      accessorKey: "packageName",
      header: "Package",
      cell: ({ row }) => {
        const name = row.original.packageName || "—";
        if (!row.original.packageName) {
          return <span className="text-xs font-semibold text-slate-400">—</span>;
        }
        return (
          <span
            className={cn(
              "inline-flex max-w-[160px] truncate items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold border",
              packageBadgeClasses(name),
            )}
            title={name}
          >
            {name}
          </span>
        );
      },
    },
    {
      id: "slotsUsed",
      accessorFn: (row) =>
        Number(row.projectsUsed ?? row.customerProjects?.length ?? 0),
      header: "Slots Used",
      meta: { align: "center" },
      cell: ({ row }) => {
        const order = row.original;
        const used = Number(order.projectsUsed ?? order.customerProjects?.length ?? 0);
        const slots = Number(order.packageSlots || 0);
        const isExpanded = expandedOrderIds.has(order.id);
        const label = slots > 0 ? `${used} / ${slots}` : `${used}`;
        const canExpand = (order.customerProjects?.length || 0) > 0;
        if (!canExpand) {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold border bg-slate-50 text-slate-600 border-slate-200">
              <FolderOpenIcon weight="duotone" className="w-3.5 h-3.5" />
              {label}
            </span>
          );
        }
        return (
          <button
            type="button"
            onClick={() => toggleOrderExpanded(order.id)}
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold border cursor-pointer transition-colors",
              isExpanded
                ? "bg-sky-100 text-sky-800 border-sky-300"
                : "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100",
            )}
            title={isExpanded ? "Collapse projects" : "Expand projects"}
          >
            <FolderOpenIcon weight="duotone" className="w-3.5 h-3.5" />
            {label}
          </button>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Order Status",
      meta: { align: "center" },
      cell: ({ row }) => {
        const order = row.original;
        const st = String(order.status || "pending");
        const badge =
          st === "paid"
            ? {
                label: "Paid",
                className: "bg-emerald-50 text-emerald-700 border-emerald-200",
                Icon: CheckCircleIcon,
              }
            : st === "failed"
              ? {
                  label: "Failed",
                  className: "bg-rose-50 text-rose-700 border-rose-200",
                  Icon: ClockIcon,
                }
              : st === "refunded"
                ? {
                    label: "Refunded",
                    className: "bg-slate-100 text-slate-700 border-slate-200",
                    Icon: ReceiptIcon,
                  }
                : {
                    label: "Pending",
                    className: "bg-amber-50 text-amber-800 border-amber-200",
                    Icon: ClockIcon,
                  };
        const Icon = badge.Icon;
        return (
          <div className="inline-flex flex-col items-center justify-center space-y-1.5">
            <span
              className={cn(
                "inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-2xs whitespace-nowrap",
                badge.className,
              )}
            >
              <Icon weight="duotone" className="w-3.5 h-3.5" />
              {badge.label}
            </span>
            <button
              onClick={() => {
                setCustomerProfileModalOrder(null);
                setPaymentHistoryModalOrder(order);
              }}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
            >
              View Payment History
            </button>
          </div>
        );
      },
    },
    {
      id: "paymentOrOrderDate",
      accessorKey: "paymentOrOrderDate",
      header: "Order / Payment Date",
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold whitespace-nowrap">
              <span className="whitespace-nowrap">{order.paymentOrOrderDate}</span>
            </div>
            <div className="text-[10px] font-semibold text-slate-400 pl-0.5">
              {order.paymentOrOrderDateLabel}
            </div>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      meta: { align: "right", cellClassName: "w-[72px]" },
      cell: ({ row }) => {
        const order = row.original;
        return (
          <Button
            ref={(el) => {
              actionButtonRefs.current[order.id] = el;
            }}
            size="sm"
            variant="ghost"
            onClick={() => openActionMenu(order.id)}
            className="w-9 h-9 p-0 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 inline-flex items-center justify-center cursor-pointer transition-colors"
            title="Actions"
          >
            <DotsThreeVerticalIcon weight="bold" className="w-4 h-4" />
          </Button>
        );
      },
    },
  ], [expandedOrderIds, toggleOrderExpanded, openActionMenu]);

  const activeMenuOrder = activeMenuOrderId
    ? orders.find((o) => o.id === activeMenuOrderId) || paginatedOrders.find((o) => o.id === activeMenuOrderId) || null
    : null;

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
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-red-100 block drop-shadow-xs">Paid Orders</span>
              <h3 className="text-2xl sm:text-3xl font-black text-white leading-none tracking-tight drop-shadow-md">{metrics.paidCount}</h3>
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
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-100 block drop-shadow-xs">Pending Orders</span>
              <h3 className="text-2xl sm:text-3xl font-black text-white leading-none tracking-tight drop-shadow-md">{metrics.pendingCount}</h3>
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
                ${metrics.contractValue.toLocaleString('en-US')}
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

      {/* Order action menu — payment / profile only (report is per-project) */}
      {activeMenuOrder && actionMenuPos && typeof document !== "undefined" && createPortal(
        <>
          <div className="fixed inset-0 z-[60]" onClick={closeOrderActionMenu} />
          <div
            className="fixed z-[70] w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 animate-in fade-in zoom-in-95 duration-150"
            style={{
              top: actionMenuPos.openUp ? undefined : actionMenuPos.top,
              bottom: actionMenuPos.openUp ? window.innerHeight - actionMenuPos.top : undefined,
              left: actionMenuPos.left,
            }}
          >
            <div className="px-3 py-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
              Choose an Action:
            </div>
            {activeMenuOrder.paymentStatus === "partial" && (
              <button
                onClick={() => {
                  setReminderModalOrder(activeMenuOrder);
                  closeOrderActionMenu();
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-900 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <BellIcon weight="duotone" className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Send Reminder {activeMenuOrder.reminderSentCount > 0 ? `(${activeMenuOrder.reminderSentCount})` : ""}</span>
              </button>
            )}
            {activeMenuOrder.paymentStatus === "partial" ? (
              activeMenuOrder.provider === "invoice" ? (
                isSuperAdmin ? (
                  <button
                    onClick={() => markOrderPaid(activeMenuOrder)}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <CheckCircleIcon weight="bold" className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Mark as paid</span>
                  </button>
                ) : (
                  <div className="px-3 py-2 text-[11px] text-slate-500 font-medium leading-snug">
                    Invoice / mail check — only a super admin can mark paid.
                  </div>
                )
              ) : (
                <button
                  onClick={() => collectPayment(activeMenuOrder)}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <CurrencyDollarIcon weight="bold" className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Collect Full Payment</span>
                </button>
              )
            ) : (
              <button
                onClick={() => refundOrder(activeMenuOrder.id)}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-900 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <CurrencyDollarIcon weight="bold" className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Refund Full Payment</span>
              </button>
            )}
            <button
              onClick={() => {
                setCustomerProfileModalOrder(null);
                setPaymentHistoryModalOrder(activeMenuOrder);
                closeOrderActionMenu();
              }}
              className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer border-t border-slate-100 mt-1 pt-2"
            >
              <ReceiptIcon weight="duotone" className="w-4 h-4 text-[#B5111B] shrink-0" />
              <span>Payment History</span>
            </button>
            <button
              onClick={() => {
                setCustomerProfileModalOrder(activeMenuOrder);
                closeOrderActionMenu();
              }}
              className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <UserIcon weight="duotone" className="w-4 h-4 text-slate-500 shrink-0" />
              <span>View Profile & Details</span>
            </button>
          </div>
        </>,
        document.body,
      )}

      {/* Project action menu — roadmap + resend report */}
      {activeProjectMenuContext && projectMenuPos && typeof document !== "undefined" && createPortal(
        <>
          <div className="fixed inset-0 z-[60]" onClick={closeProjectActionMenu} />
          <div
            className="fixed z-[70] w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 animate-in fade-in zoom-in-95 duration-150"
            style={{
              top: projectMenuPos.openUp ? undefined : projectMenuPos.top,
              bottom: projectMenuPos.openUp ? window.innerHeight - projectMenuPos.top : undefined,
              left: projectMenuPos.left,
            }}
          >
            <div className="px-3 py-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
              Project Actions:
            </div>
            <button
              onClick={() => {
                const { order, project } = activeProjectMenuContext;
                closeProjectActionMenu();
                openRoadmap(order, project.id);
              }}
              className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <CaretRightIcon weight="bold" className="w-4 h-4 text-slate-500 shrink-0" />
              <span>Open Roadmap</span>
            </button>
            {(() => {
              const { order, project } = activeProjectMenuContext;
              const canResend = Boolean(project.certifiedReportUrl);
              const alreadyReleased = normalizeTimelineStep(project.timelineStep) >= TOTAL_ROADMAP_STEPS;
              return (
                <button
                  type="button"
                  disabled={!canResend}
                  title={
                    canResend
                      ? "Email the certified PDF for this project"
                      : "Upload a certified report on the project before resending"
                  }
                  onClick={() => {
                    if (!canResend) return;
                    openReportModal(order, project);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-colors",
                    canResend
                      ? "text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 cursor-pointer"
                      : "text-slate-400 cursor-not-allowed opacity-60",
                  )}
                >
                  <EnvelopeSimpleIcon
                    weight="duotone"
                    className={cn("w-4 h-4 shrink-0", canResend ? "text-emerald-600" : "text-slate-400")}
                  />
                  <span>{alreadyReleased || order.reportSent ? "Resend Report" : "Send Report"}</span>
                </button>
              );
            })()}
          </div>
        </>,
        document.body,
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

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
          {/* Order status filter pills */}
          <div className="bg-white p-1 rounded-2xl border border-slate-200 flex items-center gap-1.5 w-full lg:w-auto overflow-x-auto shadow-2xs">
            {([
              { id: "all" as const, label: `All (${metrics.totalCount})`, active: "bg-[#B5111B] text-white", idle: "text-slate-600 hover:bg-slate-50" },
              { id: "pending" as const, label: `Pending (${metrics.pendingCount})`, active: "bg-amber-500 text-white", idle: "text-slate-600 hover:bg-amber-50 hover:text-amber-700" },
              { id: "paid" as const, label: `Paid (${metrics.paidCount})`, active: "bg-emerald-600 text-white", idle: "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700" },
              { id: "failed" as const, label: `Failed (${metrics.failedCount})`, active: "bg-rose-700 text-white", idle: "text-slate-600 hover:bg-rose-50 hover:text-rose-700" },
              { id: "refunded" as const, label: `Refunded (${metrics.refundedCount})`, active: "bg-slate-700 text-white", idle: "text-slate-600 hover:bg-slate-100" },
            ]).map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setStatusFilter(tab.id);
                  setCurrentPage(1);
                }}
                className={cn(
                  "px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex-1 lg:flex-none text-center whitespace-nowrap",
                  statusFilter === tab.id
                    ? `${tab.active} shadow-xs font-extrabold scale-[1.02]`
                    : tab.idle,
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          </div>
        </div>

        <DataTable
          columns={orderColumns}
          data={paginatedOrders}
          totalItems={totalItems}
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
          isLoading={isLoadingOrders}
          getRowId={(row) => row.id}
          expandedRowIds={expandedOrderIds}
          renderExpandedRow={(order) => {
            const projects = order.customerProjects || [];
            return (
              <div className="px-4 py-3 sm:px-6 sm:py-4 bg-slate-50/90 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-3">
                  <FolderOpenIcon weight="duotone" className="w-4 h-4 text-slate-500" />
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Projects in this Order ({projects.length})
                  </h4>
                </div>
                {projects.length === 0 ? (
                  <p className="text-xs text-slate-500 font-medium py-3">
                    No projects linked to this customer yet.
                  </p>
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto shadow-2xs">
                    <table className="w-full table-fixed text-left text-xs min-w-[640px]">
                      <colgroup>
                        <col className="w-[5%]" />
                        <col className="w-[32%]" />
                        <col className="w-[55%]" />
                        <col className="w-[8%]" />
                      </colgroup>
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-extrabold">
                          <th className="px-3 py-2.5">#</th>
                          <th className="px-3 py-2.5">Project</th>
                          <th className="px-3 py-2.5">Customer Timeline</th>
                          <th className="px-3 py-2.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projects.map((p, idx) => {
                          const life = projectLifecycleStatus(p.timelineStep);
                          const countyLabel = p.county || "";
                          const stateLabel = p.state || "";
                          const locationLine = [countyLabel, stateLabel].filter(Boolean).join(", ") || "—";
                          return (
                            <tr
                              key={p.id}
                              className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80"
                            >
                              <td className="px-3 py-2.5 text-slate-400 font-bold align-middle">{idx + 1}</td>
                              <td className="px-3 py-2.5 align-middle">
                                <div className="font-extrabold text-slate-900 text-sm leading-snug truncate" title={p.name}>
                                  {p.name}
                                </div>
                                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                  <span
                                    className={cn(
                                      "inline-flex px-1.5 py-0.5 rounded-md text-[10px] font-extrabold border",
                                      life.className,
                                    )}
                                  >
                                    {life.label}
                                  </span>
                                  {p.year != null && (
                                    <span className="inline-flex px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600">
                                      {p.year}
                                    </span>
                                  )}
                                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 min-w-0">
                                    <MapPinIcon weight="duotone" className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span className="truncate">
                                      <span className="text-[#B5111B] font-bold">{countyLabel || locationLine}</span>
                                      {countyLabel && stateLabel ? (
                                        <span className="text-slate-400"> · {stateLabel}</span>
                                      ) : null}
                                    </span>
                                  </span>
                                </div>
                                {p.certifiedReportFileName && (
                                  <div className="mt-1 text-[10px] font-medium text-emerald-700 truncate" title={p.certifiedReportFileName}>
                                    PDF · {p.certifiedReportFileName}
                                  </div>
                                )}
                              </td>
                              <td className="px-3 py-2.5 align-middle">
                                <ProjectTimelineCell
                                  step={p.timelineStep}
                                  stepDates={order.stepDates}
                                  onOpen={() => openRoadmap(order, p.id)}
                                />
                              </td>
                              <td className="px-3 py-2.5 text-right align-middle">
                                <button
                                  type="button"
                                  ref={(el) => {
                                    projectActionButtonRefs.current[`${order.id}::${p.id}`] = el;
                                  }}
                                  onClick={() => openProjectActionMenu(order, p)}
                                  className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 hover:bg-white text-slate-600 hover:text-slate-900 cursor-pointer"
                                  title="Project actions"
                                >
                                  <DotsThreeVerticalIcon weight="bold" className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          }}
          emptyMessage={isLoadingOrders ? "Loading orders…" : "No orders match your filter"}
          emptySubtext={isLoadingOrders ? "Fetching live package orders from the API." : "Try adjusting your search keywords or switching filters."}
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

      {/* MODAL 2: Deliver / Resend Report for a specific project */}
      {reportModalOrder && reportModalProject && (
        <Modal
          isOpen={!!reportModalOrder && !!reportModalProject}
          onClose={() => {
            setReportModalOrder(null);
            setReportModalProject(null);
          }}
          title="Confirm Deliver Scorecard Report"
          className="max-w-md w-[94%] sm:w-full rounded-2xl sm:rounded-3xl"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3.5 bg-emerald-50 border border-emerald-200/90 rounded-2xl text-emerald-900">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs font-bold">
                <CheckCircleIcon weight="duotone" className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">
                  {normalizeTimelineStep(reportModalProject.timelineStep) >= TOTAL_ROADMAP_STEPS
                    ? "Resend Scorecard PDF?"
                    : "Deliver Scorecard PDF?"}
                </div>
                <div className="text-xs text-emerald-800 font-semibold">
                  Project-level delivery · {reportModalOrder.orderNumber}
                </div>
              </div>
            </div>

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
                <span className="font-bold text-slate-900 text-right max-w-[60%] truncate">
                  {reportModalProject.name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">PDF Attachment:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1 max-w-[60%] justify-end">
                  <CheckCircleIcon weight="duotone" className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">
                    {reportModalProject.certifiedReportFileName || "Certified Scorecard PDF"}
                  </span>
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 text-center leading-relaxed">
              Email the certified report for <strong>{reportModalProject.name}</strong> to{" "}
              <strong>{reportModalOrder.customerEmail}</strong>?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setReportModalOrder(null);
                  setReportModalProject(null);
                }}
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
                <span>{isSending ? "Sending..." : "Confirm & Send Email"}</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* DRAWER: Payment History & Transactions Side Panel */}
      {(() => {
        if (!paymentHistoryModalOrder) return null;
        const remainingDue =
          paymentHistoryModalOrder.totalAmount - paymentHistoryModalOrder.paidAmount;
        const closePaymentHistory = () => setPaymentHistoryModalOrder(null);

        return (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
              onClick={closePaymentHistory}
            />

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <div className="w-screen max-w-xl bg-white shadow-2xl border-l border-slate-200 animate-in slide-in-from-right duration-300 flex flex-col justify-between">
                <div className="p-4 sm:p-5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md shrink-0">
                      <ReceiptIcon weight="duotone" className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                        Payment History & Transactions
                      </h3>
                      <p className="text-xs text-slate-500 font-medium truncate">
                        {paymentHistoryModalOrder.orderNumber}
                        {paymentHistoryModalOrder.organization
                          ? ` · ${paymentHistoryModalOrder.organization}`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={closePaymentHistory}
                    className="w-8 h-8 p-0 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 cursor-pointer shrink-0"
                  >
                    <XIcon weight="bold" className="w-4 h-4" />
                  </Button>
                </div>

                <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-left">
                  <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                    <div className="min-w-0">
                      <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        Order: {paymentHistoryModalOrder.orderNumber}
                      </div>
                      <div className="text-sm font-extrabold text-white truncate">
                        {paymentHistoryModalOrder.projectName}
                      </div>
                      <div className="text-xs text-slate-300 font-medium truncate">
                        {paymentHistoryModalOrder.customerName}
                        {paymentHistoryModalOrder.organization
                          ? ` · ${paymentHistoryModalOrder.organization}`
                          : ""}
                      </div>
                    </div>
                    <div className="shrink-0">
                      {paymentHistoryModalOrder.paymentStatus === "full" ? (
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

                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Total Contract</div>
                      <div className="text-sm sm:text-base font-extrabold text-slate-900">
                        ${paymentHistoryModalOrder.totalAmount.toLocaleString("en-US")}
                      </div>
                    </div>
                    <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 text-center">
                      <div className="text-[10px] font-bold text-emerald-700 uppercase">Total Paid</div>
                      <div className="text-sm sm:text-base font-extrabold text-emerald-800">
                        ${paymentHistoryModalOrder.paidAmount.toLocaleString("en-US")}
                      </div>
                    </div>
                    <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-center">
                      <div className="text-[10px] font-bold text-amber-700 uppercase">Remaining Due</div>
                      <div className="text-sm sm:text-base font-extrabold text-amber-800">
                        ${remainingDue.toLocaleString("en-US")}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-700 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5">
                        <ReceiptIcon weight="duotone" className="w-4 h-4 text-blue-600" />
                        Transaction History ({paymentHistoryModalOrder.paymentHistory?.length || 0})
                      </span>
                      <span className="text-[11px] text-slate-400 font-normal shrink-0">All amounts in USD</span>
                    </div>

                    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs overflow-x-auto">
                      <table className="w-full text-left text-xs min-w-[520px]">
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
                          {(paymentHistoryModalOrder.paymentHistory || []).length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-3.5 py-8 text-center text-slate-500 font-medium">
                                No payment transactions yet.
                              </td>
                            </tr>
                          ) : (
                            (paymentHistoryModalOrder.paymentHistory || []).map((txn) => (
                              <tr key={txn.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-3.5 py-3 align-middle">
                                  <div className="font-bold text-slate-900">{txn.date}</div>
                                  <div className="text-[10px] font-mono text-slate-400">
                                    {txn.id} • {txn.reference}
                                  </div>
                                </td>
                                <td className="px-3.5 py-3 align-middle">
                                  <div className="font-bold text-slate-800">{txn.type}</div>
                                  <div className="text-[10px] text-slate-500">{txn.method}</div>
                                </td>
                                <td className="px-3.5 py-3 align-middle text-right font-extrabold text-emerald-700">
                                  +${txn.amount.toLocaleString("en-US")}
                                </td>
                                <td className="px-3.5 py-3 align-middle text-center">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    <CheckIcon weight="bold" className="w-2.5 h-2.5" />
                                    Completed
                                  </span>
                                </td>
                                <td className="px-3.5 py-3 align-middle text-right">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void printPaymentReceipt({
                                        date: txn.date,
                                        orderId: paymentHistoryModalOrder.id,
                                        attemptId: txn.id,
                                        id: txn.id,
                                        orderNumber: paymentHistoryModalOrder.orderNumber,
                                        packageName: paymentHistoryModalOrder.packageName,
                                        method: txn.method,
                                        reference: txn.reference,
                                        status: txn.status === "completed" ? "succeeded" : txn.status,
                                        amount: txn.amount,
                                      })
                                    }
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer transition-colors"
                                    title="Download Payment Receipt PDF"
                                  >
                                    <ReceiptIcon weight="duotone" className="w-3 h-3 text-slate-500" />
                                    <span>PDF</span>
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
                  {paymentHistoryModalOrder.paymentStatus === "partial" ? (
                    <Button
                      size="sm"
                      onClick={() => {
                        setReminderModalOrder(paymentHistoryModalOrder);
                        closePaymentHistory();
                      }}
                      className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer flex-1"
                    >
                      <BellIcon weight="duotone" className="w-3.5 h-3.5" />
                      <span>Send Payment Reminder</span>
                    </Button>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1 flex-1">
                      <CheckCircleIcon weight="duotone" className="w-4 h-4 text-emerald-600" />{" "}
                      100% Contract Paid in Full
                    </span>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={closePaymentHistory}
                    className="text-xs font-bold cursor-pointer rounded-xl border-slate-300"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
      {/* DRAWER: Customer Roadmap Right-Side Slide-Over Panel */}
      {roadmapModalOrder && (() => {
        const projects = roadmapModalOrder.customerProjects || [];
        const selected =
          projects.find((p) => p.id === roadmapSelectedProjectId) ||
          projects.find((p) => p.isPrimary) ||
          projects[0] ||
          null;
        const drawerStep = normalizeTimelineStep(
          selected?.timelineStep ?? roadmapModalOrder.timelineStep,
        );
        const isDrawerAllDone = drawerStep === TOTAL_ROADMAP_STEPS;
        const slots = Number(roadmapModalOrder.packageSlots || 0);
        const used = Number(roadmapModalOrder.projectsUsed ?? projects.length);
        const closeRoadmap = () => {
          setRoadmapModalOrder(null);
          setRoadmapSelectedProjectId(null);
        };
        return (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
              onClick={closeRoadmap}
            />

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 animate-in slide-in-from-right duration-300 flex flex-col justify-between">

                <div className="p-4 sm:p-5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold">
                      <ClockIcon weight="duotone" className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 leading-tight">Customer Roadmap</h3>
                      <p className="text-xs text-slate-500 font-medium">Per-project 5-step journey</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={closeRoadmap}
                    className="w-8 h-8 p-0 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    <XIcon weight="bold" className="w-4 h-4" />
                  </Button>
                </div>

                <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-left">
                  <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-md space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                          Order: {roadmapModalOrder.orderNumber}
                        </div>
                        <div className="text-sm font-extrabold text-white mt-0.5">
                          {roadmapModalOrder.packageName || roadmapModalOrder.projectName}
                        </div>
                        <div className="text-xs text-slate-300 font-medium">
                          {roadmapModalOrder.customerName} • {roadmapModalOrder.countyOrState}
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-white/10 text-slate-200 border border-white/15 shrink-0">
                        {slots > 0 ? `${used}/${slots} slots` : `${used} projects`}
                      </span>
                    </div>
                  </div>

                  {projects.length > 1 && (
                    <div className="space-y-2">
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Projects
                      </div>
                      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                        {projects.map((p) => {
                          const active = selected?.id === p.id;
                          const pStep = normalizeTimelineStep(p.timelineStep);
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => setRoadmapSelectedProjectId(p.id)}
                              className={cn(
                                "flex-1 min-w-[120px] px-3 py-2 rounded-lg text-left transition-all cursor-pointer",
                                active
                                  ? "bg-white shadow-xs border border-slate-200 text-slate-900"
                                  : "text-slate-600 hover:bg-white/70 border border-transparent",
                              )}
                            >
                              <div className="text-[11px] font-extrabold truncate">{p.name}</div>
                              <div className={cn(
                                "text-[10px] font-bold mt-0.5",
                                pStep >= TOTAL_ROADMAP_STEPS ? "text-emerald-600" : "text-blue-600",
                              )}>
                                {pStep >= TOTAL_ROADMAP_STEPS
                                  ? "Released"
                                  : `Stage ${pStep}/${TOTAL_ROADMAP_STEPS}`}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selected && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                          {projects.length > 1 ? "Timeline for" : "Project"}
                        </div>
                        <div className="text-sm font-extrabold text-slate-900 truncate">{selected.name}</div>
                      </div>
                      {isDrawerAllDone ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                          Completed ({TOTAL_ROADMAP_STEPS}/{TOTAL_ROADMAP_STEPS})
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                          Stage {drawerStep} of {TOTAL_ROADMAP_STEPS}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="relative pl-6 border-l-2 border-slate-200 ml-3 space-y-3 py-1">
                    {TIMELINE_STEPS.map((step) => {
                      const isCompleted = isDrawerAllDone ? true : step.id < drawerStep;
                      const isCurrent = isDrawerAllDone ? false : step.id === drawerStep;
                      const isUpcoming = isDrawerAllDone ? false : step.id > drawerStep;
                      const stepDate = roadmapModalOrder.stepDates?.[step.id];

                      return (
                        <div key={step.id} className="relative">
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

                  {!selected && projects.length === 0 && (
                    <p className="text-xs text-slate-500 font-medium text-center py-6">
                      No projects for this customer yet. Timeline will appear when a project is created.
                    </p>
                  )}
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
                  <span className="text-xs text-slate-500 font-medium">Stages follow each project&apos;s status</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={closeRoadmap}
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
                        <span className="text-slate-400 block text-[10px] font-extrabold uppercase tracking-wider">Organization</span>
                        <span className="font-black text-slate-900 text-xs truncate block" title={customerProfileModalOrder.organization || undefined}>
                          {customerProfileModalOrder.organization || "—"}
                        </span>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-0.5">
                        <span className="text-slate-400 block text-[10px] font-extrabold uppercase tracking-wider">County / Region</span>
                        <span className="font-black text-slate-900 text-xs flex items-center gap-1">
                          <MapPinIcon weight="duotone" className="w-3.5 h-3.5 text-slate-400" />
                          {customerProfileModalOrder.countyOrState}
                        </span>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-0.5 col-span-2">
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
                          openRoadmap(target);
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

      <Modal
        isOpen={!!payModalOrder}
        onClose={() => !isPaying && setPayModalOrder(null)}
        title={payModalOrder ? `Collect payment — ${payModalOrder.orderNumber}` : "Collect payment"}
      >
        {payModalOrder && (
          <FakeCardPaymentForm
            amount={payModalOrder.totalAmount}
            packageName={payModalOrder.packageName}
            submitting={isPaying}
            onCancel={() => setPayModalOrder(null)}
            onSubmit={handleStubPay}
          />
        )}
      </Modal>
    </div>
  );
}
