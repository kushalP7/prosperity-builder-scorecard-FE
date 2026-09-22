"use client"

import * as React from "react"
import { TrendingDown } from "lucide-react"

export function LowestPerformingModulesChart() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="space-y-0.5 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#B5111B] to-[#E11D48] text-white flex items-center justify-center shrink-0 shadow-xs">
            <TrendingDown className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Lowest Performing Modules</h3>
            <p className="text-xs text-slate-400 font-medium">Lowest scoring sections</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center py-3">
        <svg viewBox="0 0 380 240" className="w-full h-56 sm:h-60 max-w-[360px] overflow-visible">
          <defs>
            <filter id="glowLow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#7F1D1D" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* 5 Donut Slices */}
          <g filter="url(#glowLow)">
            <circle cx="190" cy="120" r="66" fill="none" stroke="#7F1D1D" strokeWidth="26" strokeDasharray="83 332" strokeDashoffset="0" />
            <circle cx="190" cy="120" r="66" fill="none" stroke="#B91C1C" strokeWidth="26" strokeDasharray="83 332" strokeDashoffset="-83" />
            <circle cx="190" cy="120" r="66" fill="none" stroke="#DC2626" strokeWidth="26" strokeDasharray="83 332" strokeDashoffset="-166" />
            <circle cx="190" cy="120" r="66" fill="none" stroke="#EF4444" strokeWidth="26" strokeDasharray="83 332" strokeDashoffset="-249" />
            <circle cx="190" cy="120" r="66" fill="none" stroke="#F87171" strokeWidth="26" strokeDasharray="83 332" strokeDashoffset="-332" />
          </g>

          {/* Center Callout */}
          <text x="190" y="110" className="text-[10px] font-extrabold fill-slate-400 uppercase tracking-widest font-sans" textAnchor="middle">LOW 5</text>
          <text x="190" y="133" className="text-2xl font-black fill-red-600 font-sans" textAnchor="middle">4.9 avg</text>

          {/* 5 Radial Leader Labels Fitted Around Graph */}
          {/* 01 Historic */}
          <line x1="237" y1="73" x2="252" y2="58" stroke="#7F1D1D" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
          <circle cx="252" cy="58" r="3.5" fill="#7F1D1D" />
          <text x="260" y="56" className="text-xs font-medium fill-slate-700 font-sans" textAnchor="start">
            <tspan x="260" dy="0">01 Historic</tspan>
            <tspan x="260" dy="14" className="fill-red-600 font-medium">(4.1)</tspan>
          </text>

          {/* 02 Culture */}
          <line x1="256" y1="120" x2="274" y2="120" stroke="#B91C1C" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
          <circle cx="274" cy="120" r="3.5" fill="#B91C1C" />
          <text x="282" y="118" className="text-xs font-medium fill-slate-700 font-sans" textAnchor="start">
            <tspan x="282" dy="0">02 Culture</tspan>
            <tspan x="282" dy="14" className="fill-red-600 font-medium">(4.5)</tspan>
          </text>

          {/* 03 Land Use */}
          <line x1="190" y1="186" x2="190" y2="204" stroke="#DC2626" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
          <circle cx="190" cy="204" r="3.5" fill="#DC2626" />
          <text x="190" y="218" className="text-xs font-medium fill-slate-700 font-sans" textAnchor="middle">
            <tspan x="190" dy="0">03 Land Use</tspan>
            <tspan x="190" dy="14" className="fill-red-600 font-medium">(4.9)</tspan>
          </text>

          {/* 04 Transport */}
          <line x1="124" y1="120" x2="106" y2="120" stroke="#EF4444" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
          <circle cx="106" cy="120" r="3.5" fill="#EF4444" />
          <text x="98" y="118" className="text-xs font-medium fill-slate-700 font-sans" textAnchor="end">
            <tspan x="98" dy="0">04 Transport</tspan>
            <tspan x="98" dy="14" className="fill-red-600 font-medium">(5.2)</tspan>
          </text>

          {/* 05 Infra */}
          <line x1="143" y1="73" x2="128" y2="58" stroke="#F87171" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
          <circle cx="128" cy="58" r="3.5" fill="#F87171" />
          <text x="120" y="56" className="text-xs font-medium fill-slate-700 font-sans" textAnchor="end">
            <tspan x="120" dy="0">05 Infra</tspan>
            <tspan x="120" dy="14" className="fill-red-600 font-medium">(5.6)</tspan>
          </text>
        </svg>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500 font-medium">Lowest Performers</span>
        <span className="text-red-600 font-bold">5 Low Modules</span>
      </div>
    </div>
  )
}
