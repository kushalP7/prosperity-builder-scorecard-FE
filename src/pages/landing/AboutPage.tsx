"use client"

import * as React from "react"
import { LandingHeader } from "@/components/landing/LandingHeader"
import { AboutUsSection } from "@/components/landing/AboutUsSection"
import { LandingFooter } from "@/components/landing/LandingFooter"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <LandingHeader />
      <main className="flex-1">
        <AboutUsSection />
      </main>
      <LandingFooter />
    </div>
  )
}
