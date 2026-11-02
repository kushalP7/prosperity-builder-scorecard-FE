"use client"

import * as React from "react"
import { loadStripe, type Stripe } from "@stripe/stripe-js"
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js"
import { LockIcon, SpinnerGapIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined

let stripePromise: Promise<Stripe | null> | null = null
function getStripePromise() {
  if (!publishableKey) return null
  if (!stripePromise) stripePromise = loadStripe(publishableKey)
  return stripePromise
}

interface StripeCardPaymentFormProps {
  clientSecret: string
  amount: number
  packageName?: string
  orderNumber?: string
  className?: string
  onSuccess: () => void | Promise<void>
  onError?: (message: string) => void
}

function PaymentFormInner({
  amount,
  packageName,
  orderNumber,
  onSuccess,
  onError,
}: Omit<StripeCardPaymentFormProps, "clientSecret" | "className">) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setSubmitting(true)
    setError(null)

    const { error: submitError } = await elements.submit()
    if (submitError) {
      const msg = submitError.message || "Check your payment details and try again."
      setError(msg)
      onError?.(msg)
      setSubmitting(false)
      return
    }

    const result = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        return_url: `${window.location.origin}/checkout?paid=1`,
      },
    })

    if (result.error) {
      const msg = result.error.message || "Payment failed. Please try another card."
      setError(msg)
      onError?.(msg)
      setSubmitting(false)
      return
    }

    await onSuccess()
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between gap-3 text-sm">
        <div>
          <p className="font-bold text-slate-900">
            Pay ${Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {packageName || "Package"}
            {orderNumber ? ` · ${orderNumber}` : ""}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
          <LockIcon weight="bold" className="w-3.5 h-3.5" />
          Secured by Stripe
        </span>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      </div>

      {error && (
        <p className="text-sm font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={!stripe || !elements || submitting}
        className="w-full h-11 rounded-xl bg-[#B5111B] hover:bg-[#8F0D15] text-white font-bold"
      >
        {submitting ? (
          <span className="inline-flex items-center gap-2">
            <SpinnerGapIcon className="w-4 h-4 animate-spin" />
            Processing…
          </span>
        ) : (
          `Pay $${Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
        )}
      </Button>
    </form>
  )
}

export function StripeCardPaymentForm({
  clientSecret,
  amount,
  packageName,
  orderNumber,
  className,
  onSuccess,
  onError,
}: StripeCardPaymentFormProps) {
  const promise = getStripePromise()

  if (!publishableKey || !promise) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Stripe is not configured. Set <code className="font-mono text-xs">VITE_STRIPE_PUBLISHABLE_KEY</code> in
        the frontend environment.
      </div>
    )
  }

  return (
    <div className={cn(className)}>
      <Elements
        stripe={promise}
        options={{
          clientSecret,
          appearance: {
            theme: "stripe",
            variables: {
              colorPrimary: "#B5111B",
              borderRadius: "12px",
            },
          },
        }}
      >
        <PaymentFormInner
          amount={amount}
          packageName={packageName}
          orderNumber={orderNumber}
          onSuccess={onSuccess}
          onError={onError}
        />
      </Elements>
    </div>
  )
}
