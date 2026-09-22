"use client"

import * as React from "react"
import {
  ChevronRight,
  ChevronDown,
  Compass,
  MapPin,
  Map as MapIcon,
  Building2,
  Briefcase,
  Landmark,
  Layers,
} from "lucide-react"
import { PORTFOLIO_CATEGORIES, CATEGORY_COMMUNITIES, LandingProjectItem } from "@/lib/projects-api"

interface ProjectPortfolioSidebarProps {
  selectedCategory: string
  onSelectCategory: (category: string) => void
  onSelectCommunity?: (communityName: string) => void
  projects?: LandingProjectItem[]
}

// Standard Rose Associates Category Icons matching the scorecard design system
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Corridor/Transportation Studies": <MapPin className="w-4.5 h-4.5 text-white stroke-[2.2]" />,
  "Master/Comprehensive Land Use": <MapIcon className="w-4.5 h-4.5 text-white stroke-[2.2]" />,
  "Downtown & Small Area Plans": <Building2 className="w-4.5 h-4.5 text-white stroke-[2.2]" />,
  "Economic Development Strategic Plans": <Briefcase className="w-4.5 h-4.5 text-white stroke-[2.2]" />,
  "Entitlements & Positioning": <Landmark className="w-4.5 h-4.5 text-white stroke-[2.2]" />,
  "Asset/Portfolio Analysis & Strategy": <Layers className="w-4.5 h-4.5 text-white stroke-[2.2]" />,
}

export default function ProjectPortfolioSidebar({
  selectedCategory,
  onSelectCategory,
  onSelectCommunity,
}: ProjectPortfolioSidebarProps) {
  // Normalize category name formatting helper
  const formatCategoryLabel = (cat: string) => {
    return cat.replace(/\//g, " / ")
  }

  return (
    <div className="w-full space-y-3">
      <div className="px-1">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Browse by project type
        </h2>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden divide-y divide-slate-100">
        {/* All Practice Areas Option */}
        <div className="transition-colors">
          <button
            type="button"
            onClick={() => onSelectCategory("all")}
            className={`w-full text-left px-4 py-3 sm:py-3.5 flex items-center justify-between transition-all cursor-pointer group relative ${
              selectedCategory === "all"
                ? "bg-red-50/50 text-[#B5111B]"
                : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            {/* Red active left indicator bar */}
            {selectedCategory === "all" && (
              <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#B5111B] rounded-r-sm" />
            )}

            <div className="flex items-center gap-3.5 min-w-0 pr-2">
              {/* Official Rose Brand Red Icon Badge */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-xs ${
                  selectedCategory === "all"
                    ? "bg-[#B5111B] text-white ring-2 ring-[#B5111B]/25"
                    : "bg-[#B5111B] text-white"
                }`}
              >
                <Compass className="w-4.5 h-4.5 text-white stroke-[2.2]" />
              </div>

              <span
                className={`text-sm tracking-tight truncate ${
                  selectedCategory === "all" ? "font-bold text-[#B5111B]" : "font-medium text-slate-800"
                }`}
              >
                All Practice Areas
              </span>
            </div>

            <ChevronRight
              className={`w-4 h-4 shrink-0 transition-transform ${
                selectedCategory === "all"
                  ? "text-[#B5111B] translate-x-0.5"
                  : "text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5"
              }`}
            />
          </button>
        </div>

        {/* Categories matching Rose Associates scorecard category styling */}
        {PORTFOLIO_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat
          const icon = CATEGORY_ICONS[cat] || <Briefcase className="w-4.5 h-4.5 text-white stroke-[2.2]" />
          const communities = CATEGORY_COMMUNITIES[cat] || []

          return (
            <div key={cat} className="transition-colors">
              <button
                type="button"
                onClick={() => onSelectCategory(cat)}
                className={`w-full text-left px-4 py-3 sm:py-3.5 flex items-center justify-between transition-all cursor-pointer group relative ${
                  isSelected
                    ? "bg-red-50/50 text-[#B5111B]"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {/* Red active left indicator bar */}
                {isSelected && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#B5111B] rounded-r-sm" />
                )}

                <div className="flex items-center gap-3.5 min-w-0 pr-2">
                  {/* Official Rose Brand Red Icon Badge */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-xs ${
                      isSelected
                        ? "bg-[#B5111B] text-white ring-2 ring-[#B5111B]/25"
                        : "bg-[#B5111B] text-white"
                    }`}
                  >
                    {icon}
                  </div>

                  <span
                    className={`text-sm tracking-tight truncate ${
                      isSelected ? "font-bold text-[#B5111B]" : "font-medium text-slate-800"
                    }`}
                  >
                    {formatCategoryLabel(cat)}
                  </span>
                </div>

                <div className="flex items-center shrink-0">
                  {isSelected ? (
                    <ChevronDown className="w-4 h-4 text-[#B5111B] shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                  )}
                </div>
              </button>

              {/* Collapsible community list when category is active */}
              {isSelected && communities.length > 0 && (
                <div className="bg-slate-50/60 border-t border-slate-100 px-6 py-3 space-y-1 animate-in fade-in duration-200">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Representative Communities
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {communities.map((community, idx) => (
                      <li
                        key={`${community}-${idx}`}
                        onClick={() => onSelectCommunity && onSelectCommunity(community)}
                        className="flex items-center gap-2 py-0.5 hover:text-[#B5111B] transition-colors cursor-pointer group/item"
                      >
                        <span className="text-slate-400 group-hover/item:text-[#B5111B] text-xs">
                          •
                        </span>
                        <span className="font-normal group-hover/item:font-medium">
                          {community}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
