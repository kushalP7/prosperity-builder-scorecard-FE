"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"

export function TopPerformingModulesChart() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="space-y-0.5 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <TrendingUp className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Top Performing Modules</h3>
            <p className="text-xs text-slate-400 font-medium">Highest scoring sections</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center py-3">
        <svg viewBox="0 0 380 240" className="w-full h-56 sm:h-60 max-w-[360px] overflow-visible">
          <defs>
            <filter id="glowTop" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#14532D" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* 5 Donut Slices */}
          <g filter="url(#glowTop)">
            <circle cx="190" cy="120" r="66" fill="none" stroke="#14532D" strokeWidth="26" strokeDasharray="83 332" strokeDashoffset="0" />
            <circle cx="190" cy="120" r="66" fill="none" stroke="#15803D" strokeWidth="26" strokeDasharray="83 332" strokeDashoffset="-83" />
            <circle cx="190" cy="120" r="66" fill="none" stroke="#16A34A" strokeWidth="26" strokeDasharray="83 332" strokeDashoffset="-166" />
            <circle cx="190" cy="120" r="66" fill="none" stroke="#22C55E" strokeWidth="26" strokeDasharray="83 332" strokeDashoffset="-249" />
            <circle cx="190" cy="120" r="66" fill="none" stroke="#4ADE80" strokeWidth="26" strokeDasharray="83 332" strokeDashoffset="-332" />
          </g>

          {/* Center Callout */}
          <text x="190" y="110" className="text-[10px] font-extrabold fill-slate-400 uppercase tracking-widest font-sans" textAnchor="middle">TOP 5</text>
          <text x="190" y="133" className="text-2xl font-black fill-emerald-600 font-sans" textAnchor="middle">8.0 avg</text>

          {/* 5 Radial Leader Labels Fitted Around Graph */}
          {/* 01 Housing */}
          <line x1="237" y1="73" x2="252" y2="58" stroke="#14532D" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
          <circle cx="252" cy="58" r="3.5" fill="#14532D" />
          <text x="260" y="56" className="text-xs font-medium fill-slate-700 font-sans" textAnchor="start">
            <tspan x="260" dy="0">01 Housing</tspan>
            <tspan x="260" dy="14" className="fill-emerald-600 font-medium">(8.8)</tspan>
          </text>

          {/* 02 Safety */}
          <line x1="256" y1="120" x2="274" y2="120" stroke="#15803D" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
          <circle cx="274" cy="120" r="3.5" fill="#15803D" />
          <text x="282" y="118" className="text-xs font-medium fill-slate-700 font-sans" textAnchor="start">
            <tspan x="282" dy="0">02 Safety</tspan>
            <tspan x="282" dy="14" className="fill-emerald-600 font-medium">(8.4)</tspan>
          </text>

          {/* 03 Labor */}
          <line x1="190" y1="186" x2="190" y2="204" stroke="#16A34A" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
          <circle cx="190" cy="204" r="3.5" fill="#16A34A" />
          <text x="190" y="218" className="text-xs font-medium fill-slate-700 font-sans" textAnchor="middle">
            <tspan x="190" dy="0">03 Labor</tspan>
            <tspan x="190" dy="14" className="fill-emerald-600 font-medium">(7.9)</tspan>
          </text>

          {/* 04 Health */}
          <line x1="124" y1="120" x2="106" y2="120" stroke="#22C55E" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
          <circle cx="106" cy="120" r="3.5" fill="#22C55E" />
          <text x="98" y="118" className="text-xs font-medium fill-slate-700 font-sans" textAnchor="end">
            <tspan x="98" dy="0">04 Health</tspan>
            <tspan x="98" dy="14" className="fill-emerald-600 font-medium">(7.6)</tspan>
          </text>

          {/* 05 Transit */}
          <line x1="143" y1="73" x2="128" y2="58" stroke="#4ADE80" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
          <circle cx="128" cy="58" r="3.5" fill="#4ADE80" />
          <text x="120" y="56" className="text-xs font-medium fill-slate-700 font-sans" textAnchor="end">
            <tspan x="120" dy="0">05 Transit</tspan>
            <tspan x="120" dy="14" className="fill-emerald-600 font-medium">(7.2)</tspan>
          </text>
        </svg>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500 font-medium">Top Performers</span>
        <span className="text-emerald-600 font-bold">5 High Modules</span>
      </div>
    </div>
  )
}
