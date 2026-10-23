"use client"

import * as React from "react"
import { submitInquiry, CreateInquiryPayload } from "@/lib/inquiries-api"
import { validateForm, contactInquirySchema } from "@/lib/validation"
import { Dropdown } from "@/components/ui/dropdown"
import { FormInput, FormField } from "@/components/ui/form-input"
import {
  BuildingsIcon,
  CheckCircleIcon,
  ClockIcon,
  PaperPlaneRightIcon,
  XIcon,
  WarningCircleIcon,
  SpinnerGapIcon,
} from "@phosphor-icons/react"

const ORGANIZATION_TYPES = [
  "Municipal / City Government",
  "County Government",
  "Economic Development Organization (EDC)",
  "Regional Planning Council / COG",
  "Private Developer / Commercial Real Estate",
  "Non-Profit / Institutional Foundation",
  "Other Public / Private Entity",
]

const SOUTHEAST_STATES = [
  { value: "NC", label: "NC – North Carolina" },
  { value: "SC", label: "SC – South Carolina" },
  { value: "GA", label: "GA – Georgia" },
  { value: "TN", label: "TN – Tennessee" },
  { value: "FL", label: "FL – Florida" },
  { value: "AL", label: "AL – Alabama" },
  { value: "MS", label: "MS – Mississippi" },
  { value: "VA", label: "VA – Virginia" },
]

export interface EnterpriseContactModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  subtitle?: string
}

export function EnterpriseContactModal({
  isOpen,
  onClose,
  title = "Enterprise Contact & Subscription Inquiry",
  subtitle = "Please provide your contact information to request subscription access or discuss municipal certified reports.",
}: EnterpriseContactModalProps) {
  const [formData, setFormData] = React.useState<CreateInquiryPayload>({
    firstName: "",
    lastName: "",
    organizationName: "",
    jobTitle: "",
    businessEmail: "",
    phoneNumber: "",
    city: "",
    state: "NC",
    country: "United States",
    organizationType: "Municipal / City Government",
  })

  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [loading, setLoading] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Prevent background scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleFieldChange = (field: keyof CreateInquiryPayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const { isValid, errors: validationErrors } = validateForm(contactInquirySchema, formData)
    if (!isValid) {
      setErrors(validationErrors)
      setError("Please fill out all required fields correctly before submitting.")
      return
    }

    try {
      setLoading(true)
      await submitInquiry(formData)
      setSubmitted(true)
      setErrors({})
    } catch (err: any) {
      setError(err.message || "Failed to submit inquiry. Please try again or contact us directly.")
    } finally {
      setLoading(false)
    }
  }

  const handleResetAndClose = () => {
    setSubmitted(false)
    setError(null)
    setErrors({})
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={handleResetAndClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full z-10 animate-in fade-in-0 zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-50/90 border border-red-200/60 text-[#B5111B] flex items-center justify-center shrink-0 shadow-2xs">
              <BuildingsIcon weight="duotone" className="w-5 h-5 text-[#B5111B]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {title}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
          >
            <XIcon weight="bold" className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {submitted ? (
            /* Success State */
            <div className="text-center py-6 sm:py-8 space-y-4">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                <CheckCircleIcon weight="duotone" className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h4 className="text-xl font-bold text-slate-900">
                  Thank you for your inquiry
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  We have received your submission. An acknowledgement email has been sent to{" "}
                  <strong className="text-slate-900">{formData.businessEmail}</strong>.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 max-w-md mx-auto text-left text-xs text-slate-600 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <ClockIcon weight="duotone" className="w-4 h-4 text-[#B5111B]" />
                  <span>What to expect next</span>
                </div>
                <p>Our advisory team will review your requirements and follow up directly within one business day.</p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-6 py-2.5 bg-[#B5111B] hover:bg-[#8F0D15] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            /* Inquiry Form */
            <form noValidate onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
                  <WarningCircleIcon weight="duotone" className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Name Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <FormInput
                  label="First Name"
                  required
                  value={formData.firstName}
                  onChange={(e) => handleFieldChange("firstName", e.target.value)}
                  placeholder="Kathleen"
                  error={errors.firstName}
                />
                <FormInput
                  label="Last Name"
                  required
                  value={formData.lastName}
                  onChange={(e) => handleFieldChange("lastName", e.target.value)}
                  placeholder="Rose"
                  error={errors.lastName}
                />
              </div>

              {/* Organization & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <FormInput
                  label="Organization / Company"
                  required
                  value={formData.organizationName}
                  onChange={(e) => handleFieldChange("organizationName", e.target.value)}
                  placeholder="e.g. Town of Davidson"
                  error={errors.organizationName}
                />
                <FormInput
                  label="Job Title / Designation"
                  required
                  value={formData.jobTitle}
                  onChange={(e) => handleFieldChange("jobTitle", e.target.value)}
                  placeholder="e.g. Planning Director"
                  error={errors.jobTitle}
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <FormInput
                  type="email"
                  label="Business Email"
                  required
                  value={formData.businessEmail}
                  onChange={(e) => handleFieldChange("businessEmail", e.target.value)}
                  placeholder="name@organization.gov"
                  error={errors.businessEmail}
                />
                <FormInput
                  type="tel"
                  label="Phone Number"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => handleFieldChange("phoneNumber", e.target.value)}
                  placeholder="(704) 555-0100"
                  error={errors.phoneNumber}
                />
              </div>

              {/* City, State, Country */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <FormInput
                  label="City / County"
                  required
                  value={formData.city}
                  onChange={(e) => handleFieldChange("city", e.target.value)}
                  placeholder="Davidson or County"
                  error={errors.city}
                />
                <FormField label="State" required error={errors.state}>
                  <Dropdown
                    value={formData.state}
                    onChange={(val) => handleFieldChange("state", val)}
                    options={SOUTHEAST_STATES}
                    fullWidth
                    size="md"
                    placeholder="Select State"
                    buttonClassName={`w-full text-xs font-normal text-slate-800 rounded-xl px-3 py-2.5 shadow-none transition ${
                      errors.state
                        ? "bg-red-50/20 border border-red-500"
                        : "bg-white hover:bg-slate-50 border border-slate-200"
                    }`}
                    menuClassName="w-full max-h-56 shadow-xl border border-slate-200"
                  />
                </FormField>
                <FormInput
                  label="Country"
                  required
                  value={formData.country}
                  onChange={(e) => handleFieldChange("country", e.target.value)}
                  placeholder="United States"
                  error={errors.country}
                />
              </div>

              {/* Organization Type Dropdown */}
              <FormField label="Organization Type" required error={errors.organizationType}>
                <Dropdown
                  value={formData.organizationType}
                  onChange={(val) => handleFieldChange("organizationType", val)}
                  options={ORGANIZATION_TYPES.map((type) => ({
                    value: type,
                    label: type,
                  }))}
                  fullWidth
                  direction="down"
                  size="md"
                  buttonClassName={`w-full text-xs font-normal text-slate-800 rounded-xl px-3 py-2.5 shadow-none transition ${
                    errors.organizationType
                      ? "bg-red-50/20 border border-red-500"
                      : "bg-white hover:bg-slate-50 border border-slate-200"
                  }`}
                  menuClassName="w-full max-h-56 shadow-2xl border border-slate-200 z-50"
                />
              </FormField>

              {/* Actions Footer */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                <p className="text-[11px] text-slate-400 text-center sm:text-left">
                  Your information is kept confidential with Rose Associates.
                </p>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#B5111B] hover:bg-[#990e17] disabled:bg-slate-300 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  {loading ? (
                    <>
                      <SpinnerGapIcon weight="bold" className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <PaperPlaneRightIcon weight="bold" className="w-3.5 h-3.5" />
                      <span>Submit Inquiry</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
