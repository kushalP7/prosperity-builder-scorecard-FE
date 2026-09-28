"use client"

import * as React from "react"
import { useAppStore } from "@/store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { Spinner } from "@/components/ui/loader"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import { 
  CreditCard, 
  Clock, 
  Building2, 
  Sliders, 
  CheckCircle2, 
  Sparkles, 
  Calendar, 
  DollarSign, 
  ShieldCheck, 
  Bell, 
  Mail,
  Zap,
  Save,
  Check,
  Eye,
  FileCheck,
  FileText,
  AlertCircle,
  ChevronDown,
  Edit3,
  Lock,
  Unlock,
  AlertTriangle,
  XCircle,
  RotateCcw,
  ShieldAlert,
  Receipt,
  Calculator
} from "lucide-react"

interface BrandRedSelectOption {
  value: string;
  label: string;
}

interface BrandRedSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: BrandRedSelectOption[];
  className?: string;
}

function BrandRedSelect({ value, onChange, options, className }: BrandRedSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectedOption = options.find(o => o.value === value) || options[0];

  return (
    <div className={cn("relative w-full", isOpen && "z-50")}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100/80 px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B5111B]/30 focus:border-[#B5111B] cursor-pointer transition-all flex items-center justify-between shadow-2xs group",
          isOpen && "ring-2 ring-[#B5111B]/30 border-[#B5111B] bg-white",
          className
        )}
      >
        <span className="truncate">{selectedOption.label}</span>
        <ChevronDown className={cn(
          "w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-transform shrink-0 ml-2",
          isOpen && "rotate-180 text-[#B5111B]"
        )} />
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setIsOpen(false)}
        />
      )}

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer",
                  isSelected
                    ? "bg-[#B5111B] text-white shadow-xs font-extrabold"
                    : "text-slate-700 hover:bg-red-50 hover:text-[#B5111B]"
                )}
              >
                <span>{option.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] text-white shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface BrandRedDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

function BrandRedDatePicker({ value, onChange, className }: BrandRedDatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Parse initial date or default to 2026-10-24
  const parsedDate = React.useMemo(() => {
    if (!value) return new Date(2026, 9, 24);
    const parts = value.split("-");
    if (parts.length === 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
    return new Date();
  }, [value]);

  const [currentViewDate, setCurrentViewDate] = React.useState(parsedDate);

  React.useEffect(() => {
    setCurrentViewDate(parsedDate);
  }, [parsedDate]);

  const viewYear = currentViewDate.getFullYear();
  const viewMonth = currentViewDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentViewDate(new Date(viewYear, viewMonth + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    const dateStr = `${viewYear}-${mm}-${dd}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleSetToday = () => {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const dateStr = `${today.getFullYear()}-${mm}-${dd}`;
    onChange(dateStr);
    setCurrentViewDate(today);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange("");
    setIsOpen(false);
  };

  const selectedDay = parsedDate.getFullYear() === viewYear && parsedDate.getMonth() === viewMonth ? parsedDate.getDate() : null;

  return (
    <div className={cn("relative w-full", isOpen && "z-50")}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100/80 px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B5111B]/30 focus:border-[#B5111B] cursor-pointer transition-all flex items-center justify-between shadow-2xs group",
          isOpen && "ring-2 ring-[#B5111B]/30 border-[#B5111B] bg-white",
          className
        )}
      >
        <span>{value || "Select Date..."}</span>
        <Calendar className="w-4 h-4 text-slate-400 group-hover:text-[#B5111B] transition-colors shrink-0 ml-2" />
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setIsOpen(false)}
        />
      )}

      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-4 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3">
          {/* Header Month & Navigation */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="font-extrabold text-xs text-slate-900">
              {monthNames[viewMonth]}, {viewYear}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-6 h-6 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-600 font-bold transition-colors cursor-pointer"
              >
                &lsaquo;
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="w-6 h-6 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-600 font-bold transition-colors cursor-pointer"
              >
                &rsaquo;
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 uppercase">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Date Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="w-8 h-8" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected = selectedDay === day;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={cn(
                    "w-8 h-8 rounded-lg font-bold flex items-center justify-center transition-all cursor-pointer",
                    isSelected
                      ? "bg-[#B5111B] text-white shadow-xs"
                      : "hover:bg-slate-100 text-slate-700"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer Today & Clear */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px]">
            <button
              type="button"
              onClick={handleSetToday}
              className="font-bold text-[#B5111B] hover:underline cursor-pointer"
            >
              Set Today
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { settings, updateSettings } = useAppStore()
  const [isSaving, setIsSaving] = React.useState(false)

  // Admin Plan Price Configuration State (Matches Scorecard Pricing: $18,000 Scorecard, $36,000 Subscription, $45,000 Combined)
  const [reportPrice, setReportPrice] = React.useState<number>(18000)
  const [subscriptionPrice, setSubscriptionPrice] = React.useState<number>(36000)
  const [combinedPrice, setCombinedPrice] = React.useState<number>(45000)
  const [showEditPricingModal, setShowEditPricingModal] = React.useState(false)

  // Business Payment Requirements State (Standalone Gateway, ACH Non-Card, Stage Progression Lock)
  const [paymentProvider, setPaymentProvider] = React.useState<"HubSpot Payments" | "Stripe Standalone">("HubSpot Payments")
  const [cardPaymentsEnabled, setCardPaymentsEnabled] = React.useState(false) // Disabled per requirements
  const [preferredMethod, setPreferredMethod] = React.useState("ACH / U.S. Bank Debit")
  const [enforceProjectStageHold, setEnforceProjectStageHold] = React.useState(true)

  // Partial Payment Deadline Settings (Frontend State)
  const [partialPaymentDeadline, setPartialPaymentDeadline] = React.useState("30") // Days
  const [reminderNoticeDays, setReminderNoticeDays] = React.useState("3") // Days before deadline
  const [autoSendReportOnFullPayment, setAutoSendReportOnFullPayment] = React.useState(true)

  // Email Template Preview Modal State
  const [showEmailPreviewModal, setShowEmailPreviewModal] = React.useState(false)
  const [previewTab, setPreviewTab] = React.useState<"reminder" | "report">("reminder")

  const handleSave = async () => {
    setIsSaving(true)
    await updateSettings(settings)
    
    // Simulate updating billing & deadline settings
    setTimeout(() => {
      setIsSaving(false)
      toast.success("Settings & Partial Payment Deadline updated successfully!")
    }, 400)
  }

  const companyName = settings?.companyProfile?.name || "Rose Associates"
  const companyPhone = settings?.companyProfile?.phone || "(555) 0100"
  const companyAddress = settings?.companyProfile?.address || "123 Planning Way"

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Clean Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            System Settings & Preferences
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure subscription plan details, partial payment deadlines, company branding, and scorecard rating bands.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button 
            onClick={handleSave} 
            disabled={isSaving} 
            className="bg-[#B5111B] hover:bg-[#8F0D15] text-white font-bold px-6 py-2.5 rounded-xl shadow-xs cursor-pointer transition-all flex items-center gap-2 text-xs sm:text-sm"
          >
            {isSaving ? <Spinner className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? "Saving..." : "Save Settings"}</span>
          </Button>
        </div>
      </div>

      {/* CARD 1: Plan Details & Subscription (RED THEME: 2 PLANS ONLY - STREAMLINED) */}
      <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl border-t-4 border-t-[#B5111B] relative z-20">
        <CardHeader className="bg-slate-50/70 border-b border-slate-200/80 pb-4 rounded-t-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#B5111B] to-rose-700 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Plan Details & Subscription</CardTitle>
                <CardDescription className="text-xs text-slate-500">Configure company subscription rates and report generation plan pricing.</CardDescription>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => setShowEditPricingModal(true)}
              className="bg-red-50 hover:bg-red-100 text-[#B5111B] border border-red-200 font-bold px-3.5 py-1.5 rounded-xl shadow-2xs cursor-pointer transition-all flex items-center gap-1.5 text-xs w-fit"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Plan Prices</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Sequential Billing Workflow Banner (Matches Landing Page Architecture) */}
          <div className="p-4 sm:p-5 bg-slate-50/90 border border-slate-200/90 rounded-2xl space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#B5111B]" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Billing Plan Architecture & Workflow
                </span>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs w-fit flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active 2-Plan System</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-[#B5111B] flex items-center justify-center shrink-0 font-bold">
                  <FileText className="w-4.5 h-4.5" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-[10px] font-extrabold text-[#B5111B] uppercase tracking-wider">Option 01: Single Audit</div>
                  <div className="font-black text-slate-900 text-sm">Single Report Plan (${reportPrice} / Report)</div>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    Single project audit calculation. Unlocks executive scorecard PDF generation & verified stamp.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-[#B5111B] flex items-center justify-center shrink-0 font-bold">
                  <Calculator className="w-4.5 h-4.5" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-[10px] font-extrabold text-[#B5111B] uppercase tracking-wider">Option 02: All-In-One Package</div>
                  <div className="font-black text-slate-900 text-sm">Total All-In-One Plan (${reportPrice + subscriptionPrice} / Year)</div>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    Complete bundle: ${reportPrice} Report + ${subscriptionPrice} Subscription = ${reportPrice + subscriptionPrice}/yr.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Scorecard Pricing Plan Cards */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">Scorecard Investment &amp; Billing Options</label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pt-1">
              {/* PLAN 1: Scorecard Only ($18,000 / Report) */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-5 flex flex-col justify-between shadow-2xs">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="text-[11px] font-black text-[#B5111B] uppercase tracking-wider">Baseline Assessment</div>
                    <h3 className="text-lg font-extrabold text-slate-900">Scorecard Only</h3>
                    <p className="text-xs text-slate-500 font-semibold">(1x Report)</p>
                    <p className="text-xs text-slate-500 leading-relaxed pt-0.5">
                      Single project assessment, diagnostic data synthesis &amp; verified PDF delivery.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <div className="text-2xl sm:text-3xl font-black text-slate-900">
                      ${reportPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </div>
                    <span className="inline-block text-[10px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                      Single Report One-Time Payment
                    </span>
                  </div>

                  <ul className="space-y-2 pt-1 text-xs text-slate-700 font-medium">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#B5111B] shrink-0" />
                      <span>Initial Virtual Scoping Call</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#B5111B] shrink-0" />
                      <span>Intake Questionnaire (90+ Data Points)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#B5111B] shrink-0" />
                      <span>Certified Scorecard Report PDF</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#B5111B] shrink-0" />
                      <span>Presentation / Consultation Visit</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#B5111B] shrink-0" />
                      <span>Kathleen Rose, CCIM/CRE Seal</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* PLAN 2: Scorecard Subscription ($36,000 / 3 Updates) */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-5 flex flex-col justify-between shadow-2xs">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="text-[11px] font-black text-[#B5111B] uppercase tracking-wider">Multi-Year Monitoring</div>
                    <h3 className="text-lg font-extrabold text-slate-900">Scorecard Subscription</h3>
                    <p className="text-xs text-slate-500 font-semibold">(2 or 5-Yr Update &times; 3)</p>
                    <p className="text-xs text-slate-500 leading-relaxed pt-0.5">
                      3 scheduled update cycles over a 2-year or 5-year progression horizon.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <div className="text-2xl sm:text-3xl font-black text-slate-900">
                      ${subscriptionPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </div>
                    <span className="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                      $12,000.00 each update &bull; 3 total
                    </span>
                  </div>

                  <ul className="space-y-2 pt-1 text-xs text-slate-700 font-medium">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#B5111B] shrink-0" />
                      <span>3 Milestone Update Reports</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#B5111B] shrink-0" />
                      <span>Virtual Alignment Call Per Cycle</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#B5111B] shrink-0" />
                      <span>Recalibrated Intake Questionnaires</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#B5111B] shrink-0" />
                      <span>Presentation / Consultation Visit x 3</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#B5111B] shrink-0" />
                      <span>Longitudinal Trend Benchmarks</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* PLAN 3: Combined Package ($45,000 / $54k Value) */}
              <div className="bg-white rounded-2xl border-2 border-[#B5111B] p-5 space-y-5 flex flex-col justify-between shadow-md relative overflow-hidden ring-2 ring-[#B5111B]/10">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-[#B5111B] uppercase tracking-wider">Turnkey Package</span>
                      <span className="text-[9px] font-black text-white bg-[#B5111B] px-1.5 py-0.5 rounded">SAVE $9,000</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-900">Combined Package</h3>
                    <p className="text-xs text-slate-500 font-semibold">($54,000.00 Total Value)</p>
                    <p className="text-xs text-slate-500 leading-relaxed pt-0.5">
                      Includes 1x Baseline Scorecard ($18k) + Full 3-Cycle Subscription ($36k).
                    </p>
                  </div>

                  <div className="p-2.5 bg-red-50/90 border border-red-200 rounded-xl space-y-0.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-extrabold text-[#B5111B] uppercase tracking-wider">
                        Value Calculation
                      </span>
                      <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                        Save $9,000.00
                      </span>
                    </div>
                    <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1 flex-wrap">
                      <span>$18k Base</span>
                      <span>+</span>
                      <span>$36k Sub (x3)</span>
                      <span className="text-slate-400 line-through">= $54k Value</span>
                    </div>
                  </div>

                  <div className="pt-1 border-t border-slate-100 space-y-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl sm:text-3xl font-black text-[#B5111B]">
                        ${combinedPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs font-bold text-slate-400 line-through">$54,000</span>
                    </div>
                    <span className="inline-block text-[10px] font-bold text-[#B5111B] bg-red-50 px-2.5 py-0.5 rounded-lg border border-red-200/80">
                      Complete Turnkey Engagement
                    </span>
                  </div>

                  <ul className="space-y-2 pt-1 text-xs text-slate-700 font-medium">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#B5111B] shrink-0" />
                      <span>Full Baseline 1x Scorecard ($18k Value)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#B5111B] shrink-0" />
                      <span>Complete 3-Cycle Subscription ($36k Value)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#B5111B] shrink-0" />
                      <span>Initial Virtual Call &amp; Recurring Alignment</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#B5111B] shrink-0" />
                      <span>4 Certified Reports in Total</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#B5111B] shrink-0" />
                      <span>Consultation Visits Per Milestone</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CARD 2: Partial Payment & Invoicing Settings (SLATE/GRAY THEME) */}
      <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl border-t-4 border-t-slate-800 relative z-10">
        <CardHeader className="bg-slate-50/70 border-b border-slate-200/80 pb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Partial Payment & Invoicing Settings</CardTitle>
                <CardDescription className="text-xs text-slate-500">Configure payment deadlines, reminder notification rules, and report delivery triggers.</CardDescription>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowEmailPreviewModal(true)}
              className="text-xs border-slate-300 bg-slate-100 text-slate-900 hover:bg-slate-200 font-bold cursor-pointer shadow-2xs flex items-center gap-1.5 shrink-0"
            >
              <Eye className="w-3.5 h-3.5 text-slate-700" />
              <span>Preview Email Templates</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Partial Payment Deadline Field */}
            <div className="space-y-2.5">
              <label className="text-sm font-bold text-slate-900 block">
                Partial Payment Deadline
              </label>
              <p className="text-xs text-slate-500">Default window allocated for customers to settle remaining partial balances.</p>
              <BrandRedSelect
                value={partialPaymentDeadline}
                onChange={setPartialPaymentDeadline}
                options={[
                  { value: "14", label: "14 Days from Order Date" },
                  { value: "30", label: "30 Days from Order Date (Standard Net 30)" },
                  { value: "45", label: "45 Days from Order Date" },
                  { value: "60", label: "60 Days from Order Date (Net 60)" }
                ]}
              />
            </div>

            {/* Reminder Notice Window */}
            <div className="space-y-2.5">
              <label className="text-sm font-bold text-slate-900 block">
                Automated Reminder Timing
              </label>
              <p className="text-xs text-slate-500">Trigger payment reminder notice emails before partial deadline expires.</p>
              <BrandRedSelect
                value={reminderNoticeDays}
                onChange={setReminderNoticeDays}
                options={[
                  { value: "3", label: "3 Days before Deadline" },
                  { value: "5", label: "5 Days before Deadline" },
                  { value: "7", label: "7 Days before Deadline" },
                  { value: "14", label: "14 Days before Deadline" }
                ]}
              />
            </div>
          </div>

          {/* Auto Send Complete Report Policy Toggle */}
          <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-2xl flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="text-sm font-bold text-slate-900">
                Automatic Full Report Delivery
              </div>
              <p className="text-xs text-slate-500">
                Automatically email the complete scorecard PDF report as soon as full payment is completed by the customer.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={autoSendReportOnFullPayment}
                onChange={e => setAutoSendReportOnFullPayment(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#B5111B]"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* 2-Column Grid Container for Company Profile & Score Rating Bands */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CARD 3: Company Profile (RED THEME) */}
        <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden border-t-4 border-t-[#B5111B] flex flex-col justify-between">
          <div>
            <CardHeader className="bg-slate-50/70 border-b border-slate-200/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#B5111B] to-rose-700 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">Company Profile</CardTitle>
                  <CardDescription className="text-xs text-slate-500">Your organization details printed on invoices and scorecard reports.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {(() => {
                const companyProfile = settings?.companyProfile || {
                  name: "Rose Associates",
                  phone: "555-0100",
                  address: "123 Planning Way"
                };

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Company Name</label>
                      <input 
                        type="text" 
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm shadow-xs font-bold text-slate-900 focus:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B5111B]/20 focus-visible:border-[#B5111B] transition-all"
                        value={companyProfile.name || ''}
                        onChange={(e) => updateSettings({
                          ...settings,
                          companyProfile: { ...companyProfile, name: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone</label>
                      <input 
                        type="text" 
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm shadow-xs font-bold text-slate-900 focus:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B5111B]/20 focus-visible:border-[#B5111B] transition-all"
                        value={companyProfile.phone || ''}
                        onChange={(e) => updateSettings({
                          ...settings,
                          companyProfile: { ...companyProfile, phone: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Address</label>
                      <input 
                        type="text" 
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm shadow-xs font-bold text-slate-900 focus:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B5111B]/20 focus-visible:border-[#B5111B] transition-all"
                        value={companyProfile.address || ''}
                        onChange={(e) => updateSettings({
                          ...settings,
                          companyProfile: { ...companyProfile, address: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </div>
        </Card>

        {/* CARD 4: Score Rating Bands (SLATE/GRAY THEME) */}
        <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden border-t-4 border-t-slate-700 flex flex-col justify-between">
          <div>
            <CardHeader className="bg-slate-50/70 border-b border-slate-200/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">Score Rating Bands</CardTitle>
                  <CardDescription className="text-xs text-slate-500">Rating thresholds used across project analytics and scorecard dashboards.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {(settings?.ratingBands || []).map((band, idx) => (
                <div key={idx} className="flex items-center gap-3 sm:gap-4">
                  <div className="flex-1 space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Label</label>
                    <input 
                      type="text" 
                      value={band.label}
                      readOnly
                      className="w-full rounded-xl border border-slate-200 bg-slate-100/80 px-3 py-2 text-xs sm:text-sm font-bold text-slate-900"
                    />
                  </div>
                  <div className="w-16 sm:w-20 space-y-1">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Min</label>
                    <input 
                      type="number" 
                      value={band.min}
                      readOnly
                      className="w-full rounded-xl border border-slate-200 bg-slate-100/80 px-2 sm:px-3 py-2 text-xs sm:text-sm font-bold text-slate-900 text-center"
                    />
                  </div>
                  <div className="w-16 sm:w-20 space-y-1">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Max</label>
                    <input 
                      type="number" 
                      value={band.max}
                      readOnly
                      className="w-full rounded-xl border border-slate-200 bg-slate-100/80 px-2 sm:px-3 py-2 text-xs sm:text-sm font-bold text-slate-900 text-center"
                    />
                  </div>
                  <div className="w-14 sm:w-16 space-y-1">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Color</label>
                    <div 
                      className="w-full h-[38px] rounded-xl border border-slate-300 shadow-2xs"
                      style={{ backgroundColor: band.color }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </div>
        </Card>
      </div>

      {/* SETTINGS EMAIL TEMPLATE PREVIEW MODAL */}
      {showEmailPreviewModal && (
        <Modal
          isOpen={showEmailPreviewModal}
          onClose={() => setShowEmailPreviewModal(false)}
          title="Automated Email Templates Preview"
          className="max-w-2xl w-[94%] sm:w-full rounded-2xl sm:rounded-3xl max-h-[90vh] overflow-y-auto"
        >
          <div className="space-y-4">
            {/* Modal Subtitle Header */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between text-blue-900 text-xs">
              <div className="font-bold flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Live Email Output Preview (Configured by Settings)</span>
              </div>
              <span className="text-[11px] font-bold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-300">
                Deadline Policy: {partialPaymentDeadline} Days
              </span>
            </div>

            {/* Segmented Tab Switcher */}
            <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200 flex items-center gap-1.5">
              <button
                onClick={() => setPreviewTab("reminder")}
                className={cn(
                  "px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex-1 text-center flex items-center justify-center gap-1.5",
                  previewTab === "reminder"
                    ? "bg-amber-500 text-white shadow-md font-bold"
                    : "text-slate-600 hover:bg-white hover:text-slate-900"
                )}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Partial Payment Reminder Email</span>
              </button>
              <button
                onClick={() => setPreviewTab("report")}
                className={cn(
                  "px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex-1 text-center flex items-center justify-center gap-1.5",
                  previewTab === "report"
                    ? "bg-emerald-600 text-white shadow-md font-bold"
                    : "text-slate-600 hover:bg-white hover:text-slate-900"
                )}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Full Scorecard Report Email</span>
              </button>
            </div>

            {/* TAB 1: Reminder Email Template */}
            {previewTab === "reminder" && (
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white text-slate-800">
                {/* Email Client Header Bar */}
                <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-500 w-16">From:</span>
                    <span className="font-medium text-slate-900">{companyName} Invoicing &lt;billing@roseassociates.com&gt;</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-500 w-16">To:</span>
                    <span className="font-medium text-slate-900">Johnathan Smith &lt;jsmith@wakegov.com&gt;</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-500 w-16">Subject:</span>
                    <span className="font-bold text-slate-900">
                      [Action Required] Payment Reminder for Metropolis Master Plan 2026 (ORD-2026-001)
                    </span>
                  </div>
                </div>

                {/* Email Body Content */}
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#B5111B] text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
                        RA
                      </div>
                      <span className="font-bold text-xs text-slate-900 tracking-tight">{companyName} Scorecard Services</span>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                      INVOICE REMINDER
                    </span>
                  </div>

                  <div className="text-xs space-y-2 text-slate-700 leading-relaxed">
                    <p className="font-bold text-slate-900">Dear Johnathan Smith,</p>
                    <p>
                      Thank you for partnering with <strong>{companyName}</strong> for your <strong>Metropolis Master Plan 2026</strong> assessment. This automated notice is triggered <strong>{reminderNoticeDays} days</strong> prior to your payment deadline as configured in your billing policy (Net {partialPaymentDeadline} days).
                    </p>
                  </div>

                  {/* Email Summary Box */}
                  <div className="bg-slate-50/90 border border-slate-200 rounded-xl p-4 space-y-2.5 text-xs">
                    <div className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-2 flex items-center justify-between">
                      <span>Invoice Summary #ORD-2026-001</span>
                      <span className="text-[11px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        Wake County, NC
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-[11px]">
                      <div>
                        <span className="text-slate-500">Project Name:</span>
                        <div className="font-bold text-slate-900">Metropolis Master Plan 2026</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Selected Billing Plan:</span>
                        <div className="font-bold text-slate-900">Single Report Plan ($500)</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Total Plan Value:</span>
                        <div className="font-bold text-slate-900">$2,500 / Year</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Single Report Fee (20%):</span>
                        <div className="font-extrabold text-amber-700 text-xs">$500 Pending</div>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="pt-2 flex justify-center">
                    <div className="bg-[#B5111B] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer">
                      Settle Single Report Fee ($500)
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 text-center border-t border-slate-100 pt-3">
                    {companyName} • {companyAddress} • Phone: {companyPhone}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Full Report Email Template */}
            {previewTab === "report" && (
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white text-slate-800">
                {/* Email Client Header Bar */}
                <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-500 w-16">From:</span>
                    <span className="font-medium text-slate-900">{companyName} Delivery &lt;reports@roseassociates.com&gt;</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-500 w-16">To:</span>
                    <span className="font-medium text-slate-900">Elena Rodriguez &lt;erodriguez@nycedc.org&gt;</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-500 w-16">Subject:</span>
                    <span className="font-bold text-slate-900">
                      [Completed Assessment] Full Scorecard Report - Hudson Yards District Vision 2026
                    </span>
                  </div>
                </div>

                {/* Email Body Content */}
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#B5111B] text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
                        RA
                      </div>
                      <span className="font-bold text-xs text-slate-900 tracking-tight">{companyName} Scorecard Services</span>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      REPORT DELIVERED
                    </span>
                  </div>

                  <div className="text-xs space-y-2 text-slate-700 leading-relaxed">
                    <p className="font-bold text-slate-900">Dear Elena Rodriguez,</p>
                    <p>
                      We are pleased to deliver your completed <strong>Hudson Yards District Vision 2026</strong> Master Plan Scorecard Assessment PDF report. Full payment for the Total Plan ($2,500) has been verified.
                    </p>
                  </div>

                  {/* Attachment Preview Card */}
                  <div className="p-3.5 bg-slate-50/90 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0 font-extrabold text-xs shadow-2xs">
                        PDF
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">Hudson_Yards_District_Vision_2026_Report.pdf</div>
                        <div className="text-[11px] text-slate-500">Full Assessment Document • 4.2 MB</div>
                      </div>
                    </div>
                    <FileCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  </div>

                  {/* CTA Button */}
                  <div className="pt-2 flex justify-center">
                    <div className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      <span>Download Scorecard PDF Report</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 text-center border-t border-slate-100 pt-3">
                    {companyName} • {companyAddress} • Phone: {companyPhone}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" onClick={() => setShowEmailPreviewModal(false)} className="bg-slate-900 hover:bg-slate-800 text-white cursor-pointer font-bold px-5">
                Close Preview
              </Button>
            </div>
          </div>
        </Modal>
      )}
      {/* ADMIN EDIT PLAN PRICES MODAL */}
      {showEditPricingModal && (
        <Modal
          isOpen={showEditPricingModal}
          onClose={() => setShowEditPricingModal(false)}
          title="Configure Company Plan Prices"
          className="max-w-md w-[94%] sm:w-full rounded-2xl sm:rounded-3xl"
        >
          <div className="space-y-4 text-left">
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-xs text-[#B5111B]">
              <Edit3 className="w-4 h-4 shrink-0" />
              <span>Admin Pricing Control: Update base rates for Scorecard Only, Subscription, and Combined packages.</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700 uppercase tracking-wider block text-[10px]">
                  Option 01: Scorecard Only (1x Report) ($)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    value={reportPrice}
                    onChange={(e) => setReportPrice(Number(e.target.value) || 0)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 font-black text-slate-900 focus:outline-none focus:border-[#B5111B]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700 uppercase tracking-wider block text-[10px]">
                  Option 02: Scorecard Subscription (3 Updates) ($)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    value={subscriptionPrice}
                    onChange={(e) => setSubscriptionPrice(Number(e.target.value) || 0)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 font-black text-slate-900 focus:outline-none focus:border-[#B5111B]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700 uppercase tracking-wider block text-[10px]">
                  Option 03: Combined Package = Scorecard Only + Scorecard Subscription ($)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    value={combinedPrice}
                    onChange={(e) => setCombinedPrice(Number(e.target.value) || 0)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 font-black text-slate-900 focus:outline-none focus:border-[#B5111B]"
                  />
                </div>
              </div>

              {/* Live Combined Summary Card */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-700">Combined Package Savings:</span>
                <span className="font-black text-sm text-emerald-700">
                  Save ${(reportPrice + subscriptionPrice) - combinedPrice > 0 ? (reportPrice + subscriptionPrice) - combinedPrice : 0} ($54k Value)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditPricingModal(false)}
                className="rounded-xl font-bold border-slate-300 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setShowEditPricingModal(false);
                  toast.success(`Plan pricing updated: $${reportPrice} Scorecard, $${subscriptionPrice} Subscription, $${combinedPrice} Combined`);
                }}
                className="bg-[#B5111B] hover:bg-[#8F0D15] text-white rounded-xl font-bold text-xs"
              >
                Save Pricing Rates
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
