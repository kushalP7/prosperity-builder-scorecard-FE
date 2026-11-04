import { toast } from "@/components/ui/toast"
import { apiClient } from "@/lib/api"

export type PaymentReceiptData = {
  date?: string | Date | null
  orderNumber?: string | null
  packageName?: string | null
  method?: string | null
  cardLast4?: string | null
  reference?: string | null
  status?: string | null
  amount?: number | null
  /** Required for backend PDF download */
  orderId?: string | null
  /** Payment attempt id (required for backend PDF) */
  attemptId?: string | null
  id?: string | null
}

/** Downloads branded PDF receipt from the API (PDFKit on BE). */
export async function downloadPaymentReceiptPdf(pay: PaymentReceiptData) {
  const orderId = String(pay.orderId || "").trim()
  const attemptId = String(pay.attemptId || pay.id || "").trim()
  if (!orderId || !attemptId) {
    toast.error("Receipt is missing order details. Refresh and try again.")
    return
  }

  const result = await apiClient.downloadPaymentReceipt(orderId, attemptId)
  if (!result.success || !result.blob) {
    toast.error(result.message || "Could not download receipt PDF.")
    return
  }

  const url = URL.createObjectURL(result.blob)
  const a = document.createElement("a")
  a.href = url
  a.download = result.filename || `Receipt-${pay.orderNumber || attemptId}.pdf`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
  toast.success("Receipt PDF downloaded.")
}

/** @deprecated Use downloadPaymentReceiptPdf - kept name for call-site compatibility. */
export async function printPaymentReceipt(
  pay: PaymentReceiptData,
  _customerName?: string,
  _customerEmail?: string,
) {
  await downloadPaymentReceiptPdf(pay)
}
