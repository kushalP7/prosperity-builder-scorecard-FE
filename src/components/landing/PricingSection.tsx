"use client"

import * as React from "react"
import Link from "next/link"
import { Check } from "lucide-react"

export function PricingSection() {
  const plans = [
    {
      id: "scorecard-only",
      name: "Scorecard Only",
      subtitle: "1x Report",
      price: "$18,000",
      cents: ".00",
      billingNote: "One-time comprehensive assessment",
      description:
        "A full standalone diagnostic audit, baseline evaluation, and certified executive PDF report delivery for municipal and project leaders.",
      features: [
        "Initial virtual alignment & scoping call",
        "Diagnostic intake questionnaire (90+ data points)",
        "Certified Scorecard Report (Executive PDF & digital matrix)",
        "Presentation & consultation visit by Kathleen Rose, CCIM, CRE",
        "Action vs. Inaction economic projection models",
        "Official advisory seal & cryptographic verification stamp",
      ],
      ctaText: "Select Scorecard Only",
      ctaHref: "/login",
      featured: false,
    },
    {
      id: "scorecard-subscription",
      name: "Scorecard Subscription",
      subtitle: "2 or 5-Yr Update × 3",
      price: "$36,000",
      cents: ".00",
      billingNote: "$12,000.00 each update • 3 scheduled cycles",
      description:
        "Structured multi-year milestone evaluation providing 3 periodic update reports across a 2-year or 5-year community planning horizon.",
      features: [
        "3 milestone update scorecard reports",
        "Initial virtual alignment call for each update cycle",
        "Recalibrated questionnaires tracking community shifts",
        "Presentation & consultation visit for each update milestone",
        "Longitudinal progress benchmarking & trend gauges",
        "Ongoing indicator monitoring and advisory check-ins",
      ],
      ctaText: "Select Subscription Plan",
      ctaHref: "/login",
      featured: false,
    },
    {
      id: "combined",
      name: "Combined Package",
      subtitle: "(Scorecard Only + Scorecard Subscription)",
      price: "$45,000",
      cents: ".00",
      billingNote: "Complete 4-report bundled lifecycle",
      description:
        "Our complete turnkey advisory partnership combining the initial baseline scorecard assessment with the full 3-cycle multi-year subscription program.",
        features: [
        "Covers all deliverable points included in Scorecard Only & Scorecard Subscription.",
        "Full Baseline 1x Scorecard Report ($18,000 Value)",
        "Full 3-Cycle Subscription Series ($36,000 Value)",
      ],
      ctaText: "Select Combined Package",
      ctaHref: "/login",
      featured: true,
      badge: "Best Value • Save $9,000",
    },
  ]

  return (
    <section id="pricing-section" className="scroll-mt-20 py-14 sm:py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-5xl mx-auto mb-14 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Scorecard Investment &amp; <span className="text-[#B5111B]">Pricing</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed max-w-none lg:whitespace-nowrap">
            Every engagement includes an initial virtual call, comprehensive questionnaire, certified scorecard report, and dedicated presentation / consultation visit.
          </p>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch pt-4">
          {plans.map((plan) => {
            const isFeatured = plan.featured

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-2xl h-full transition-all duration-200 ${
                  isFeatured
                    ? "bg-white border-2 border-[#B5111B] shadow-lg z-10"
                    : "bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300"
                }`}
              >
                {/* Featured Badge - Floating Pill so content starts at identical top baseline */}
                {isFeatured && plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#B5111B] text-white text-[11px] font-bold text-center py-1 px-4 rounded-full uppercase tracking-wider shadow-sm z-20 whitespace-nowrap">
                    {plan.badge}
                  </div>
                )}

                <div className="p-6 sm:p-8 flex-1 flex flex-col">
                  {/* Header info */}
                  <div className="border-b border-slate-100 pb-6 mb-6">
                    <div className="flex items-center justify-between gap-2 mb-1.5 h-[28px]">
                      <h3 className="text-xl font-bold text-slate-900 leading-tight">
                        {plan.name}
                      </h3>
                    </div>

                    {/* Subtitle row - aligned across cards */}
                    <div className="h-[52px] mb-3 flex flex-col justify-start">
                      {plan.id === "combined" ? (
                        <>
                          <p className="text-xs font-semibold text-slate-700">
                            (Scorecard Only + Scorecard Subscription)
                          </p>
                          <div className="mt-1 flex items-center gap-1.5 text-xs">
                            <span className="text-slate-400 line-through font-medium">
                              $54,000 Total Value
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/90 px-2 py-0.5 rounded-full text-[11px]">
                              Save $9,000.00
                            </span>
                          </div>
                        </>
                      ) : (
                        <p className="text-xs font-semibold text-[#B5111B]">
                          {plan.subtitle}
                        </p>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed h-[56px] overflow-hidden">
                      {plan.description}
                    </p>

                    {/* Price Block - exactly aligned across cards */}
                    <div className="mt-5 pt-5 border-t border-slate-100">
                      <div className="flex items-baseline text-slate-900 h-[48px]">
                        <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                          {plan.price}
                        </span>
                        <span className="text-lg font-bold text-slate-400">
                          {plan.cents}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-medium text-slate-600">
                        {plan.billingNote}
                      </p>
                    </div>
                  </div>

                  {/* Deliverables List */}
                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3.5">
                      Included Deliverables
                    </p>
                    <ul className="space-y-3 text-xs sm:text-[13px] text-slate-700">
                      {plan.features.map((feature, idx) => {
                        const isHighValue = feature.includes("($")

                        return (
                          <li
                            key={idx}
                            className={`flex items-start gap-2.5 leading-snug ${
                              isHighValue
                                ? "font-semibold text-slate-900"
                                : "text-slate-700"
                            }`}
                          >
                            <Check
                              className={`w-4 h-4 shrink-0 mt-0.5 ${
                                isHighValue
                                  ? "text-[#B5111B] stroke-[2.5]"
                                  : "text-[#B5111B]"
                              }`}
                            />
                            <span>
                              {isHighValue ? (
                                <>
                                  <span>{feature.split("($")[0]}</span>
                                  <span className="font-bold text-[#B5111B]">
                                    (${feature.split("($")[1]}
                                  </span>
                                </>
                              ) : feature.includes("Scorecard Only") && feature.includes("Scorecard Subscription") ? (
                                <span className="font-medium text-slate-800">
                                  Covers all deliverable points included in{" "}
                                  <strong className="font-bold text-slate-900">Scorecard Only</strong> &amp;{" "}
                                  <strong className="font-bold text-slate-900">Scorecard Subscription</strong>.
                                </span>
                              ) : (
                                feature
                              )}
                            </span>
                          </li>
                        )
                      })}
                    </ul>
                  </div>

                  {/* Action CTA */}
                  <div className="pt-8 mt-auto">
                    <Link
                      href={plan.ctaHref}
                      className={`w-full block py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-center transition-all cursor-pointer ${
                        isFeatured
                          ? "bg-[#B5111B] text-white hover:bg-[#960E16] shadow-sm hover:shadow"
                          : "bg-slate-900 text-white hover:bg-slate-800"
                      }`}
                    >
                      {plan.ctaText}
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
