"use client"

import { ReportShowcaseSection } from "./ReportShowcaseSection"
import { PublishedReportsCardsSection } from "./PublishedReportsCardsSection"
import { ScorecardAnatomySection } from "./ScorecardAnatomySection"

export function ReportShowcaseDetailedSection() {
  return (
    <div id="report-showcase" className="scroll-mt-20 bg-slate-50 text-slate-900 font-sans">
      {/* 1. HERO & 3D REPORT SHOWCASE PREVIEW */}
      <ReportShowcaseSection />

      {/* 2. DYNAMIC PUBLISHED REPORTS & DOSSIERS CARDS */}
      <PublishedReportsCardsSection />

      {/* 3. CLEAN REPORT STRUCTURE & ANATOMY SECTION */}
      <ScorecardAnatomySection />
    </div>
  )
}

