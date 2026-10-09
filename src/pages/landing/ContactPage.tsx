"use client"

import * as React from "react"
import { LandingHeader } from "@/components/landing/LandingHeader"
import { LandingFooter } from "@/components/landing/LandingFooter"
import { submitInquiry, CreateInquiryPayload } from "@/lib/inquiries-api"
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  Loader2,
  Send,
  ArrowRight,
  ShieldCheck,
  Check,
  AlertCircle,
} from "lucide-react"
import { Dropdown } from "@/components/ui/dropdown"
import { FormInput, FormField } from "@/components/ui/form-input"
import { validateForm, contactInquirySchema } from "@/lib/validation"

const ORGANIZATION_TYPES = [
  "Municipal / City Government",
  "County Government",
  "Economic Development Organization (EDC)",
  "Regional Planning Council / COG",
  "Private Developer / Commercial Real Estate",
  "Non-Profit / Institutional Foundation",
  "Other Public / Private Entity",
]

export default function ContactPage() {
  const [formData, setFormData] = React.useState<CreateInquiryPayload>({
    firstName: "",
    lastName: "",
    organizationName: "",
    jobTitle: "",
    businessEmail: "",
    phoneNumber: "",
    city: "",
    state: "",
    country: "United States",
    organizationType: "Municipal / City Government",
  })

  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [loading, setLoading] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

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

    // Common schema-based validation
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <LandingHeader />

      <main className="flex-1">
        {/* HERO SECTION - Matches style of Videos & Reports pages */}
        <section className="bg-white border-b border-slate-200 py-10 sm:py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
              Enterprise <span className="text-[#B5111B]">Contact</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-5xl mx-auto whitespace-normal lg:whitespace-nowrap">
              Request a custom proposal, discuss municipal study scopes, or initiate a conversation about the Prosperity Builder Scorecard®.
            </p>
          </div>
        </section>

        {/* MAIN CONTENT SECTION */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* LEFT COLUMN: Clean Inquiry Form */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
                {submitted ? (
                  /* Success State Screen */
                  <div className="text-center py-8 sm:py-12 space-y-5">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div className="space-y-1.5 max-w-md mx-auto">
                      <h2 className="text-2xl font-bold text-slate-900">Thank you for your inquiry</h2>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        We have received your submission. An acknowledgement email has been sent to{" "}
                        <strong className="text-slate-900">{formData.businessEmail}</strong>.
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 max-w-md mx-auto text-left text-xs text-slate-600 space-y-2">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#B5111B]" />
                        <span>What to expect next</span>
                      </div>
                      <p>Our advisory team will review your requirements and follow up directly within one business day.</p>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSubmitted(false)
                          setErrors({})
                          setError(null)
                          setFormData({
                            firstName: "",
                            lastName: "",
                            organizationName: "",
                            jobTitle: "",
                            businessEmail: "",
                            phoneNumber: "",
                            city: "",
                            state: "",
                            country: "United States",
                            organizationType: "Municipal / City Government",
                          })
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B5111B] hover:text-[#8F0D15] transition cursor-pointer"
                      >
                        <span>Submit another inquiry</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Inquiry Form */
                  <form noValidate onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Contact Information</h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Please provide your contact details so our team can follow up with you.
                      </p>
                    </div>

                    {error && (
                      <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                        <span>{error}</span>
                      </div>
                    )}

                    {/* Name Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormInput
                        label="City"
                        required
                        value={formData.city}
                        onChange={(e) => handleFieldChange("city", e.target.value)}
                        placeholder="Davidson"
                        error={errors.city}
                      />
                      <FormInput
                        label="State / Province"
                        required
                        value={formData.state}
                        onChange={(e) => handleFieldChange("state", e.target.value)}
                        placeholder="NC"
                        error={errors.state}
                      />
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
                        size="md"
                        buttonClassName={`w-full text-xs sm:text-sm font-normal text-slate-800 rounded-xl px-3.5 py-2.5 shadow-none transition ${
                          errors.organizationType
                            ? "bg-red-50/20 border border-red-500"
                            : "bg-white hover:bg-slate-50 border border-slate-200"
                        }`}
                        menuClassName="w-full max-h-64 shadow-xl border border-slate-200"
                      />
                    </FormField>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto px-8 py-3 bg-[#B5111B] hover:bg-[#990e17] disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Submit Inquiry</span>
                          </>
                        )}
                      </button>
                      <p className="text-[11px] text-slate-400 mt-2">
                        Your information is kept confidential and will only be used to respond to your inquiry.
                      </p>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Clean Corporate Contact Info Card */}
            <div className="lg:col-span-5 space-y-6">
              {/* Direct Office & Contact Details Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-6 shadow-xs">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Rose Associates Southeast, Inc.
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Strategic Real Estate &amp; Economic Advisory Services
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Email */}
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#B5111B] to-[#E11D48] text-white flex items-center justify-center shrink-0 shadow-sm ring-2 ring-white/20">
                      <Mail className="w-4.5 h-4.5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-500">Email</div>
                      <a
                        href="mailto:info@roseassociates.com"
                        className="text-slate-900 hover:text-[#B5111B] font-medium transition"
                      >
                        info@roseassociates.com
                      </a>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#B5111B] to-[#E11D48] text-white flex items-center justify-center shrink-0 shadow-sm ring-2 ring-white/20">
                      <Phone className="w-4.5 h-4.5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-500">Phone</div>
                      <a
                        href="tel:7048960391"
                        className="text-slate-900 hover:text-[#B5111B] font-medium transition"
                      >
                        (704) 896-0391
                      </a>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#B5111B] to-[#E11D48] text-white flex items-center justify-center shrink-0 shadow-sm ring-2 ring-white/20">
                      <MapPin className="w-4.5 h-4.5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-500">Location</div>
                      <span className="text-slate-800">
                        P.O. Box 4140, Davidson, NC 28036
                      </span>
                    </div>
                  </div>

                  {/* Office Hours */}
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#B5111B] to-[#E11D48] text-white flex items-center justify-center shrink-0 shadow-sm ring-2 ring-white/20">
                      <Clock className="w-4.5 h-4.5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-500">Office Hours</div>
                      <span className="text-slate-800">
                        Monday – Friday, 8:30 AM – 5:00 PM EST
                      </span>
                    </div>
                  </div>
                </div>

                {/* Founder Info */}
                <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-[#B5111B] ring-2 ring-red-100 overflow-hidden shrink-0 bg-slate-800 shadow-sm">
                    <img
                      src="/team/kathleen_rose.png"
                      alt="Kathleen Rose"
                      className="w-full h-full object-cover object-center"
                      onError={(e) => {
                        e.currentTarget.src = "/branding/logo.png"
                        e.currentTarget.className = "w-full h-full object-contain p-1 bg-white"
                      }}
                    />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900">Kathleen Rose, CCIM, CRE</div>
                    <div className="text-[11px] text-slate-500">President &amp; Founder</div>
                  </div>
                </div>
              </div>

              {/* Advisory Standard Card */}
              <div className="bg-slate-100/70 rounded-2xl border border-slate-200/80 p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <ShieldCheck className="w-4 h-4 text-[#B5111B]" />
                  <span>Advisory Standard</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Direct response within one business day</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Customized proposal and fee schedule</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Confidential consultation and data sharing</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}
