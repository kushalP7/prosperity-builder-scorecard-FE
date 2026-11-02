"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CreditCardIcon, LockIcon } from "@phosphor-icons/react"

export interface FakeCardPayload {
  cardNumber: string
  expiry: string
  cvc: string
  cardholderName: string
  forceFail?: boolean
}

interface FakeCardPaymentFormProps {
  amount: number
  packageName?: string
  submitting?: boolean
  onSubmit: (payload: FakeCardPayload) => void | Promise<void>
  onCancel?: () => void
  className?: string
}

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 16)
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim()
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

export function FakeCardPaymentForm({
  amount,
  packageName,
  submitting = false,
  onSubmit,
  onCancel,
  className,
}: FakeCardPaymentFormProps) {
  const [cardholderName, setCardholderName] = React.useState("")
  const [cardNumber, setCardNumber] = React.useState("")
  const [expiry, setExpiry] = React.useState("")
  const [cvc, setCvc] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const digits = cardNumber.replace(/\D/g, "")
    if (digits.length < 13) {
      setError("Enter a valid card number (use 4242…4242 to succeed, or 4000…0002 to decline).")
      return
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      setError("Expiry must be MM/YY.")
      return
    }
    if (cvc.replace(/\D/g, "").length < 3) {
      setError("Enter a 3–4 digit CVC.")
      return
    }
    await onSubmit({
      cardholderName: cardholderName.trim() || "Cardholder",
      cardNumber: digits,
      expiry,
      cvc: cvc.replace(/\D/g, ""),
    })
  }

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Amount due (full package)</p>
          <p className="text-2xl font-black text-slate-900 mt-0.5">
            ${Number(amount || 0).toLocaleString("en-US")}
          </p>
          {packageName && <p className="text-sm font-semibold text-slate-600 mt-1">{packageName}</p>}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
          <LockIcon weight="bold" className="w-3.5 h-3.5" />
          Stub checkout
        </div>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        Test cards: <span className="font-mono font-semibold text-slate-700">4242 4242 4242 4242</span> succeeds ·{" "}
        <span className="font-mono font-semibold text-slate-700">4000 0000 0000 0002</span> declines. Stripe-ready later.
      </p>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700">Cardholder name</label>
        <input
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#B5111B]/30 focus:border-[#B5111B]"
          placeholder="Jane Doe"
          autoComplete="cc-name"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700">Card number</label>
        <div className="relative">
          <CreditCardIcon weight="duotone" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            className="w-full h-10 pl-10 pr-3 rounded-xl border border-slate-200 bg-white text-sm font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[#B5111B]/30 focus:border-[#B5111B]"
            placeholder="4242 4242 4242 4242"
            inputMode="numeric"
            autoComplete="cc-number"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Expiry</label>
          <input
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[#B5111B]/30 focus:border-[#B5111B]"
            placeholder="12/28"
            inputMode="numeric"
            autoComplete="cc-exp"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">CVC</label>
          <input
            value={cvc}
            onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[#B5111B]/30 focus:border-[#B5111B]"
            placeholder="123"
            inputMode="numeric"
            autoComplete="cc-csc"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs font-semibold px-3 py-2">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-1">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting} className="rounded-xl">
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-[#B5111B] hover:bg-[#8F0D15] text-white font-bold px-5"
        >
          {submitting ? "Processing…" : `Pay $${Number(amount || 0).toLocaleString("en-US")} now`}
        </Button>
      </div>
    </form>
  )
}
