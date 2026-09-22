"use client"

import * as React from "react"
import { Activity, PieChart, Zap, ShieldCheck } from "lucide-react"
import { GaugeSpeedometerChart } from "./GaugeSpeedometerChart"
import { TopPerformingModulesChart } from "./TopPerformingModulesChart"
import { LowestPerformingModulesChart } from "./LowestPerformingModulesChart"

export function AnalyticsShowcaseSection() {
  return (
    <section id="analytics-showcase" className="scroll-mt-20 py-12 sm:py-16 bg-gradient-to-b from-white via-slate-50/60 to-white text-slate-900 border-b border-slate-200/90 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        
        {/* Centered Top Header */}
        <div className="text-center max-w-5xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-slate-900 tracking-tight leading-tight whitespace-nowrap">
            Executive Analytics & <span className="text-[#B5111B]">Scorecard Insights</span>
          </h2>
          <p className="text-xs sm:text-sm lg:text-base text-slate-600 font-normal max-w-full sm:whitespace-nowrap mx-auto">
            Real-time score speedometers, radar analysis, module insights, and trend visualizations - all in one place.
          </p>
        </div>

        {/* 3 Summary Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          <GaugeSpeedometerChart score={6.4} max={10} percentage="64%" />
          <TopPerformingModulesChart />
          <LowestPerformingModulesChart />
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {[
            {
              icon: <Activity className="w-5 h-5 text-white" />,
              title: "Real-time Insights",
              desc: "Live data from trusted sources & benchmarks"
            },
            {
              icon: <PieChart className="w-5 h-5 text-white" />,
              title: "Advanced Analytics",
              desc: "Radar, trend & distribution charts for deep insights"
            },
            {
              icon: <Zap className="w-5 h-5 text-white" />,
              title: "Actionable Advisory",
              desc: "Data-driven recommendations to improve performance"
            },
            {
              icon: <ShieldCheck className="w-5 h-5 text-white" />,
              title: "Secure & Reliable",
              desc: "Enterprise-grade security and data integrity"
            }
          ].map((f, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200/80 p-4 flex items-start gap-3.5 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B5111B] to-[#E11D48] text-white flex items-center justify-center shrink-0 shadow-md">
                {f.icon}
              </div>
              <div className="space-y-0.5 min-w-0">
                <h4 className="text-xs font-bold text-slate-900 truncate">{f.title}</h4>
                <p className="text-[11px] text-slate-500 leading-tight">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
