"use client"

import * as React from "react"
import { CATEGORY_COMMUNITIES } from "@/lib/projects-api"

interface ProjectPortfolioAccordionProps {
  // Kept for backward-compatibility if needed
  projects?: any[]
  onSelectProject?: (project: any) => void
}

export default function ProjectPortfolioAccordion({}: ProjectPortfolioAccordionProps) {
  // Default open "Downtown & Small Area Plans" or "Corridor/Transportation Studies" matching original site
  const [openCategories, setOpenCategories] = React.useState<Record<string, boolean>>({
    "Downtown & Small Area Plans": true,
  })

  const toggleCategory = (cat: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }))
  }

  const categories = Object.keys(CATEGORY_COMMUNITIES)

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-200">
      {categories.map((category) => {
        const isOpen = !!openCategories[category]
        const communities = CATEGORY_COMMUNITIES[category] || []

        return (
          <div key={category} className="transition-colors">
            {/* Category Header Button */}
            <button
              type="button"
              onClick={() => toggleCategory(category)}
              className="w-full px-4 py-3 sm:py-3.5 flex items-center text-left hover:bg-slate-50 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-[#B5111B] font-extrabold text-base leading-none select-none w-3">
                  {isOpen ? "−" : "+"}
                </span>
                <span className="text-sm font-bold text-slate-900 group-hover:text-[#B5111B] transition-colors">
                  {category}
                </span>
              </div>
            </button>

            {/* Accordion Content: Clean Bulleted List matching Rose Associates Screenshot */}
            {isOpen && (
              <div className="px-7 pb-4 pt-1 bg-white border-t border-slate-100">
                <ul className="space-y-1 text-xs text-slate-700 py-1">
                  {communities.map((community, idx) => (
                    <li key={`${community}-${idx}`} className="flex items-center gap-2">
                      <span className="text-slate-900 select-none text-[13px] leading-none">•</span>
                      <span className="font-normal text-slate-800">{community}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
