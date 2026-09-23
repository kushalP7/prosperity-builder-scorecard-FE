"use client"

import * as React from "react"
import Link from "next/link"
import { 
  ShieldCheck, 
  CheckCircle2, 
  Award, 
  RefreshCw, 
  ChevronRight, 
  MapPin, 
  Mail, 
  Globe 
} from "lucide-react"

export function LandingFooter() {
  return (
    <footer className="bg-slate-950 text-xs text-slate-300 font-sans">
      {/* 1. TOP TRUST GUARANTEE BANNER (VIBRANT DARK CRIMSON GRADIENT) */}
      <div className="bg-gradient-to-r from-[#4A0A10] via-[#660C14] to-[#4A0A10] border-t border-red-700/30 border-b border-red-950/90 py-7 sm:py-9">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 items-start">
            {/* Pillar 1: Verified Data Quality Guarantee */}
            <div className="flex items-start gap-3.5 lg:pr-6 lg:border-r lg:border-red-500/20">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B5111B] to-[#E11D48] text-white flex items-center justify-center shrink-0 shadow-lg ring-2 ring-white/10">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="space-y-1 min-w-0">
                <h4 className="text-xs font-black uppercase tracking-wider text-white leading-tight">
                  VERIFIED DATA QUALITY GUARANTEE
                </h4>
                <p className="text-[11.5px] text-rose-100/90 leading-relaxed font-medium">
                  Our data is meticulously collected, validated, and
                  continuously verified from trusted sources.
                </p>
              </div>
            </div>

            {/* Pillar 2: Trusted Sources */}
            <div className="flex items-start gap-3.5 lg:pr-6 lg:border-r lg:border-red-500/20">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B5111B] to-[#E11D48] text-white flex items-center justify-center shrink-0 shadow-lg ring-2 ring-white/10">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div className="space-y-1 min-w-0">
                <h4 className="text-xs font-black uppercase tracking-wider text-white leading-tight">
                  TRUSTED SOURCES
                </h4>
                <p className="text-[11.5px] text-rose-100/90 leading-relaxed font-medium">
                  Data from authoritative public & government providers you can
                  rely on.
                </p>
              </div>
            </div>

            {/* Pillar 3: Rigorous Validation */}
            <div className="flex items-start gap-3.5 lg:pr-6 lg:border-r lg:border-red-500/20">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B5111B] to-[#E11D48] text-white flex items-center justify-center shrink-0 shadow-lg ring-2 ring-white/10">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div className="space-y-1 min-w-0">
                <h4 className="text-xs font-black uppercase tracking-wider text-white leading-tight">
                  RIGOROUS VALIDATION
                </h4>
                <p className="text-[11.5px] text-rose-100/90 leading-relaxed font-medium">
                  Multi-step verification and cross-checking for maximum
                  precision.
                </p>
              </div>
            </div>

            {/* Pillar 4: Continuous Monitoring */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B5111B] to-[#E11D48] text-white flex items-center justify-center shrink-0 shadow-lg ring-2 ring-white/10">
                <RefreshCw className="w-5 h-5 text-white" />
              </div>
              <div className="space-y-1 min-w-0">
                <h4 className="text-xs font-black uppercase tracking-wider text-white leading-tight">
                  CONTINUOUS MONITORING
                </h4>
                <p className="text-[11.5px] text-rose-100/90 leading-relaxed font-medium">
                  Regular updates and quality assurance across all scorecards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN FOOTER BODY (CHARCOAL SECTION WITH HIGH-CONTRAST COLUMNS) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 items-start">
          {/* Column 1: Logo & Company Overview */}
          <div className="space-y-5">
            <Link href="/" className="inline-flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Rose Associates"
                className="h-10 w-auto object-contain brightness-0 invert"
              />
            </Link>

            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              Providing strategic advisory and data-driven insights at the
              intersection of economic development, public policy, and real
              estate.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href="https://www.linkedin.com/company/roseassociatessoutheastinc/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-xl border border-slate-800 bg-slate-900 hover:bg-[#B5111B] hover:border-[#B5111B] text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-xs"
                aria-label="LinkedIn"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-xl border border-slate-800 bg-slate-900 hover:bg-[#B5111B] hover:border-[#B5111B] text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-xs"
                aria-label="Twitter"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@RoseAssociatesNC"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-xl border border-slate-800 bg-slate-900 hover:bg-[#B5111B] hover:border-[#B5111B] text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-xs"
                aria-label="YouTube"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Solutions */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                SOLUTIONS
              </h3>
              <div className="w-8 h-1 bg-gradient-to-r from-[#B5111B] to-[#E11D48] rounded-full" />
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300 font-medium">
              <li>
                <Link
                  href="/#services"
                  className="hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#E11D48] group-hover:translate-x-0.5 transition-transform shrink-0" />
                  <span>Economic Development</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/#services"
                  className="hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#E11D48] group-hover:translate-x-0.5 transition-transform shrink-0" />
                  <span>Real Estate Advisory</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/#scorecard-categories"
                  className="hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#E11D48] group-hover:translate-x-0.5 transition-transform shrink-0" />
                  <span>Quality of Life Scorecard</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/#analytics-showcase"
                  className="hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#E11D48] group-hover:translate-x-0.5 transition-transform shrink-0" />
                  <span>Executive Analytics</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#E11D48] group-hover:translate-x-0.5 transition-transform shrink-0" />
                  <span>Custom Section Maker</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Navigation */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                NAVIGATION
              </h3>
              <div className="w-8 h-1 bg-gradient-to-r from-[#B5111B] to-[#E11D48] rounded-full" />
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300 font-medium">
              <li>
                <Link
                  href="/"
                  className="hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#E11D48] group-hover:translate-x-0.5 transition-transform shrink-0" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/#services"
                  className="hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#E11D48] group-hover:translate-x-0.5 transition-transform shrink-0" />
                  <span>Advisory Services</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/#report-showcase"
                  className="hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#E11D48] group-hover:translate-x-0.5 transition-transform shrink-0" />
                  <span>Report Showcase</span>
                </Link>
              </li>

              <li>
                <Link
                  href="/categories"
                  className="hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#E11D48] group-hover:translate-x-0.5 transition-transform shrink-0" />
                  <span>Categories</span>
                </Link>
              </li>

              <li>
                <Link
                  href="/about"
                  className="hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#E11D48] group-hover:translate-x-0.5 transition-transform shrink-0" />
                  <span>About Us</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#E11D48] group-hover:translate-x-0.5 transition-transform shrink-0" />
                  <span>Pricing Plans</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                CONTACT US
              </h3>
              <div className="w-8 h-1 bg-gradient-to-r from-[#B5111B] to-[#E11D48] rounded-full" />
            </div>

            <div className="space-y-3.5 text-xs text-slate-300 font-medium">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-red-950/80 border border-red-800/60 text-[#E11D48] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <MapPin className="w-3.5 h-3.5 text-[#E11D48]" />
                </div>
                <span className="leading-relaxed text-slate-200">
                  Rose Associates
                  <br />
                  Davidson, NC & Carolinas, USA
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-red-950/80 border border-red-800/60 text-[#E11D48] flex items-center justify-center shrink-0 shadow-xs">
                  <Mail className="w-3.5 h-3.5 text-[#E11D48]" />
                </div>
                <a
                  href="mailto:info@roseassociates.com"
                  className="hover:text-white transition-colors underline decoration-slate-700 underline-offset-2 text-slate-200"
                >
                  info@roseassociates.com
                </a>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-red-950/80 border border-red-800/60 text-[#E11D48] flex items-center justify-center shrink-0 shadow-xs">
                  <Globe className="w-3.5 h-3.5 text-[#E11D48]" />
                </div>
                <a
                  href="https://roseassociates.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors text-slate-200"
                >
                  roseassociates.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 3. BOTTOM COPYRIGHT & LEGAL BAR */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} Rose Associates. All rights
            reserved. Davidson, NC.
          </div>
        </div>
      </div>
    </footer>
  );
}
