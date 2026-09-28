"use client"

import * as React from "react"
import { LandingHeader } from "@/components/landing/LandingHeader"
import { AnalyticsShowcaseSection } from "@/components/landing/AnalyticsShowcaseSection"
import { LandingFooter } from "@/components/landing/LandingFooter"

export default function ExecutiveAnalyticsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <LandingHeader />
      <main className="flex-1">
        <AnalyticsShowcaseSection />
      </main>
      <LandingFooter />
    </div>
  )
}
