"use client"

import * as React from "react"
import { Link } from "@/lib/router-compat"
import { LandingHeader } from "@/components/landing/LandingHeader"
import { LandingFooter } from "@/components/landing/LandingFooter"
import { ReportShowcaseSection } from "@/components/landing/ReportShowcaseSection"
import { PublishedReportsCardsSection } from "@/components/landing/PublishedReportsCardsSection"

export default function ProsperityBuilderScorecardPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Top Navigation */}
      <LandingHeader />

      <main className="flex-1">
        {/* Page Hero Header */}
        <section className="bg-white border-b border-slate-200 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              Prosperity Builder{" "}
              <span className="text-[#B5111B]">Scorecard®</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-3xl mx-auto">
              A comprehensive quantitative and qualitative audit designed to
              provide municipal leaders, economic developers, and planning
              boards with clear policy direction and high-impact capital
              allocation insights.
            </p>

            {/* Clean Navigation Links */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/categories"
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
              >
                Explore 12 Categories
              </Link>
              <Link
                href="/pricing"
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
              >
                View Pricing Plans
              </Link>
            </div>
          </div>
        </section>

        {/* 1. Scorecard PDF Report Design Showcase (Interactive 3D Folio) */}
        <ReportShowcaseSection />

        {/* 2. Published Real Estate & Community Dossiers */}
        {/* need to uncomment */}
        {/* <PublishedReportsCardsSection /> */}
      </main>

      {/* Global Footer */}
      <LandingFooter />
    </div>
  );
}
