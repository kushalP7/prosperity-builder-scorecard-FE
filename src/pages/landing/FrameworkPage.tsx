"use client"

import * as React from "react"
import { LandingHeader } from "@/components/landing/LandingHeader"
import { ScorecardCategoriesSection } from "@/components/landing/ScorecardCategoriesSection"
import { LandingFooter } from "@/components/landing/LandingFooter"

export default function FrameworkPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <LandingHeader />
      <main className="flex-1">
        <ScorecardCategoriesSection />
      </main>
      <LandingFooter />
    </div>
  )
}
