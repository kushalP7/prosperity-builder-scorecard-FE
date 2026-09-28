"use client"
import { Layers, TrendingUp, Building2, Check, ArrowRight } from "lucide-react"

export function AdvisoryServicesSection() {
  return (
    <section
      id="services"
      className="scroll-mt-20 py-10 sm:py-14 bg-slate-50/50 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Our Advisory <span className="text-[#B5111B]">Services</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-normal">
            Specialized commercial real estate, land use planning, and economic
            growth advisory.
          </p>
        </div>

        {/* 3 Compact Services Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Service 1: Land Use & Real Estate Advisory */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-4 shadow-2xs hover:shadow-md hover:border-[#B5111B]/40 transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B5111B] to-[#E11D48] text-white flex items-center justify-center shrink-0 shadow-lg ring-2 ring-white/10">
                  <Layers className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                  Land Use & Real Estate Advisory
                </h3>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Maximize the potential of land for different uses and property
                types by assessing development feasibility and providing
                strategic guidance on land use planning to identify and unlock
                highest and best use.
              </p>

              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                  Our work includes:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Real Estate Market Analysis",
                    "Asset/Portfolio Strategy & Repositioning",
                    "Financial Feasibility Studies",
                    "Highest & Best Use",
                  ].map((item, i) => (
                    <span
                      key={i}
                      className="text-[11px] bg-slate-50 border border-slate-200/80 rounded-md px-2 py-0.5 text-slate-700 font-medium flex items-center gap-1"
                    >
                      <Check className="w-3 h-3 text-[#B5111B] shrink-0" />
                      <span>{item}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <a
              href="https://roseassociates.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-[#B5111B] hover:text-[#8F0D15] inline-flex items-center gap-1.5 pt-2 group-hover:translate-x-1 transition-transform"
            >
              <span>Explore Advisory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Service 2: Economic Development */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-4 shadow-2xs hover:shadow-md hover:border-[#B5111B]/40 transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B5111B] to-[#E11D48] text-white flex items-center justify-center shrink-0 shadow-lg ring-2 ring-white/10">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                  Economic Development
                </h3>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Through analytics, we assess overall economic health to create
                plans for attracting businesses, supporting existing
                enterprises, promoting job creation, and delivering strategic
                growth frameworks.
              </p>

              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                  Our work includes:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Economic Development Strategy",
                    "Revitalization & Adaptive Reuse",
                    "Tourism & Place Marketing",
                    "Retail Positioning",
                    "Developer Solicitation & Selection",
                    "Incentive Negotiation Support",
                  ].map((item, i) => (
                    <span
                      key={i}
                      className="text-[11px] bg-slate-50 border border-slate-200/80 rounded-md px-2 py-0.5 text-slate-700 font-medium flex items-center gap-1"
                    >
                      <Check className="w-3 h-3 text-[#B5111B] shrink-0" />
                      <span>{item}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <a
              href="https://roseassociates.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-[#B5111B] hover:text-[#8F0D15] inline-flex items-center gap-1.5 pt-2 group-hover:translate-x-1 transition-transform"
            >
              <span>Explore Advisory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Service 3: Commercial Real Estate */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-4 shadow-2xs hover:shadow-md hover:border-[#B5111B]/40 transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B5111B] to-[#E11D48] text-white flex items-center justify-center shrink-0 shadow-lg ring-2 ring-white/10">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                  Commercial Real Estate
                </h3>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Experienced advisory specializing in facilitating due diligence,
                buying, selling, and leasing commercial properties and land,
                negotiating favorable terms for public and private clients.
              </p>

              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                  Our work includes:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Site Selection Strategy & Services",
                    "Market Analysis",
                    "Property & Asset Strategy",
                    "Distressed Assets Forensics",
                    "Property Acquisition & Disposition",
                    "Brokerage Services",
                  ].map((item, i) => (
                    <span
                      key={i}
                      className="text-[11px] bg-slate-50 border border-slate-200/80 rounded-md px-2 py-0.5 text-slate-700 font-medium flex items-center gap-1"
                    >
                      <Check className="w-3 h-3 text-[#B5111B] shrink-0" />
                      <span>{item}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <a
              href="https://roseassociates.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-[#B5111B] hover:text-[#8F0D15] inline-flex items-center gap-1.5 pt-2 group-hover:translate-x-1 transition-transform"
            >
              <span>Explore Advisory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
