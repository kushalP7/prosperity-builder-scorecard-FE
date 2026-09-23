"use client"

import * as React from "react"
import Link from "next/link"
import { 
  FileText, 
  Layers, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  Building2, 
  Award,
  ShieldCheck,
  ExternalLink
} from "lucide-react"
import { ReportShowcaseSection } from "./ReportShowcaseSection"
import { PublishedReportsCardsSection } from "./PublishedReportsCardsSection"

export function ReportShowcaseDetailedSection() {
  return (
    <div id="report-showcase" className="scroll-mt-20 bg-slate-50 text-slate-900 font-sans">
      
      {/* 1. HERO & 3D REPORT SHOWCASE PREVIEW */}
      <ReportShowcaseSection />

      {/* 2. DYNAMIC PUBLISHED REPORTS & DOSSIERS CARDS */}
      {/* <PublishedReportsCardsSection />  need to comment  */}

      {/* 2. CLEAN REPORT STRUCTURE & ANATOMY SECTION */}
      <section className="py-16 sm:py-24 bg-white border-t border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#B5111B]">
              COMPREHENSIVE MUNICIPAL DOSSIER OUTLINE
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Anatomy of a Prosperity Builder Scorecard™
            </h2>
            <p className="text-sm text-slate-600 font-normal leading-relaxed">
              A comprehensive quantitative and qualitative audit designed to provide municipal leaders, economic developers, and planning boards with clear policy direction.
            </p>
          </div>

          {/* 4-Card Report Structure Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-3 hover:border-slate-300 transition-colors">
              <div className="text-xs font-extrabold text-[#B5111B] uppercase tracking-wider">
                EXECUTIVE VISION
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Executive Vision & History
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Framing community vision, historical case study background, and aligning local goals with market reality.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-3 hover:border-slate-300 transition-colors">
              <div className="text-xs font-extrabold text-[#B5111B] uppercase tracking-wider">
                SCORECARD MATRIX
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Scorecard Matrix Gauge
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Overall quality-of-life score speedometer gauge and executive summary across all 12 core category indicators.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-3 hover:border-slate-300 transition-colors">
              <div className="text-xs font-extrabold text-[#B5111B] uppercase tracking-wider">
                CATEGORY DEEP DIVES
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                12 Category Deep Dives
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dedicated pages per module featuring national/state comparison tables, local statistics, and policy recommendations.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-3 hover:border-slate-300 transition-colors">
              <div className="text-xs font-extrabold text-[#B5111B] uppercase tracking-wider">
                ACTION BLUEPRINT
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                3-Phase Action Blueprint
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Action steps for municipal staff, elected officials, and business leaders with ongoing progress monitoring.
              </p>
            </div>

          </div>

          {/* Clean Executive Quote Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-[#3B070B] to-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-red-950/80 shadow-xl max-w-4xl mx-auto space-y-4 text-center">
            <blockquote className="text-base sm:text-lg font-bold text-slate-100 leading-relaxed max-w-3xl mx-auto italic font-serif">
              &ldquo;No gimmicks, no redundant reports, and no guesswork about where to get the most value for the money you spend.&rdquo;
            </blockquote>
            <div className="flex items-center justify-center gap-3 pt-1">
              <div className="w-10 h-10 rounded-full border-2 border-rose-500/50 overflow-hidden shrink-0 bg-slate-800 shadow-md">
                <img
                  src="/kathleen_rose.png"
                  alt="Kathleen Rose"
                  className="w-full h-full object-cover object-center"
                  onError={(e) => {
                    e.currentTarget.src = "/logo.png"
                    e.currentTarget.className = "w-full h-full object-contain p-1 bg-white"
                  }}
                />
              </div>
              <div className="text-xs text-rose-200/90 font-medium text-left">
                <span className="font-bold text-white">Kathleen Rose, CCIM, CRE</span>
                <span className="opacity-80"> • President & Founder, Rose Associates</span>
              </div>
            </div>
          </div>

          {/* 3-Phase Program Flow */}
          <div className="space-y-8 pt-4">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-extrabold text-[#B5111B] uppercase tracking-widest">
                METHODOLOGY
              </span>
              <h3 className="text-2xl font-black text-slate-900">
                The 3-Phase Implementation Blueprint
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-2">
                <div className="text-sm font-extrabold text-[#B5111B]">Phase 1: Reality Check</div>
                <div className="text-xs font-bold text-slate-800">Initial Assessment & 90+ Data Points</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Onsite self-assessment questionnaire and compiling demographic, economic, and land use indicators.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-2">
                <div className="text-sm font-extrabold text-[#B5111B]">Phase 2: Plan Blueprint</div>
                <div className="text-xs font-bold text-slate-800">Constructing the Strategy</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Prioritizing revitalization vs preservation and assigning actionable goals for municipal staff and council.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-2">
                <div className="text-sm font-extrabold text-[#B5111B]">Phase 3: Prosperity Building</div>
                <div className="text-xs font-bold text-slate-800">Tracking Progress & Performance</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Annual performance reviews, metric updates, and celebrating community progress.
                </p>
              </div>
            </div>
          </div>

          {/* Full Report Subscription Unlock Banner */}
          <div className="bg-slate-100 rounded-3xl p-8 sm:p-10 border border-slate-200 text-center space-y-6 max-w-3xl mx-auto">
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900">
                Unlock Complete Customized Municipal Dossiers
              </h3>
              <p className="text-xs text-slate-600 max-w-xl mx-auto leading-relaxed">
                Ordering a scorecard or starting a subscription provides full unredacted report access with complete data tables, custom GIS maps, and peer benchmarks.
              </p>
            </div>

            <div className="flex justify-center">
              <Link
                href="/pricing"
                className="bg-[#B5111B] hover:bg-[#8F0D15] text-white px-6 py-3 rounded-xl font-extrabold text-xs flex items-center gap-2 shadow-md transition-all hover:scale-102"
              >
                <span>View Subscription Plans & Pricing</span>
              </Link>
            </div>
          </div>

        </div>
      </section>

    </div>
  )
}
