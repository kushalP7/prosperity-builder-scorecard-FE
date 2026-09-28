"use client"

import { Gauge } from "lucide-react"

export function GaugeSpeedometerChart({ score = 6.4, max = 10, percentage = "64%" }: {
  score?: number
  max?: number
  percentage?: string }) {
  const angle = -90 + (score / max) * 180
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="space-y-0.5 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#B5111B] to-[#E11D48] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Gauge className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Overall Project Score</h3>
            <p className="text-xs text-slate-400 font-medium">Aggregated performance across core metrics</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-3 relative">
        <svg viewBox="0 0 220 135" className="w-60 h-40">
          <defs>
            <linearGradient id="gaugeGradSpectrum" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="35%" stopColor="#F97316" />
              <stop offset="65%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#22C55E" />
            </linearGradient>
          </defs>
          <path
            d="M 25 105 A 85 85 0 0 1 195 105"
            fill="none"
            stroke="#F1F5F9"
            strokeWidth="18"
            strokeLinecap="round"
          />
          <path
            d="M 25 105 A 85 85 0 0 1 195 105"
            fill="none"
            stroke="url(#gaugeGradSpectrum)"
            strokeWidth="18"
            strokeLinecap="round"
          />
          <g transform={`rotate(${angle} 110 105)`}>
            <line x1="110" y1="105" x2="110" y2="44" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
            <circle cx="110" cy="105" r="7" fill="#1E293B" />
            <circle cx="110" cy="105" r="3" fill="#FFFFFF" />
          </g>
        </svg>
        <div className="text-center pt-1">
          <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {score} <span className="text-sm font-normal text-slate-400">/{max}</span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500 font-medium">Total Evaluation</span>
        <span className="text-[#B5111B] font-bold">{percentage} Overall Score</span>
      </div>
    </div>
  )
}
