"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, ShieldCheck, Layers, Activity, Sparkles, Download } from "lucide-react"

export function ReportShowcaseSection() {
  const [activeFannedPage, setActiveFannedPage] = React.useState<number>(2)

  return (
    <section id="report-showcase" className="scroll-mt-20 py-12 sm:py-16 bg-gradient-to-b from-slate-100 via-white to-slate-50 text-slate-900 border-b border-slate-200/90 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
        
        {/* Header */}
        <div className="space-y-2 pb-6 border-b border-slate-200">
          <h2 className="text-3xl sm:text-4xl font-black text-[#B5111B] tracking-tight">
            Scorecard PDF Report Design Showcase
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-none">
            A comprehensive executive document folio compiled automatically by Prosperity Builder with real-time embedded analytics graphs. Click any page to focus or open full-screen preview.
          </p>
        </div>

        {/* Mobile / Tablet Quick Page Selector Switcher */}
        <div className="flex xl:hidden justify-center items-center gap-1.5 pt-1 pb-2">
          <button
            onClick={() => setActiveFannedPage((prev) => (prev > 1 ? prev - 1 : 3))}
            className="p-2 rounded-xl bg-white text-[#B5111B] border border-slate-200 hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer shadow-2xs flex items-center gap-1 text-xs font-bold"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-4 h-4 text-[#B5111B]" />
            <span className="hidden xs:inline">Prev</span>
          </button>

          <button
            onClick={() => setActiveFannedPage(1)}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeFannedPage === 1
                ? "bg-[#B5111B] text-white shadow-xs ring-2 ring-[#B5111B]/20"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            Page 1: Cover
          </button>
          <button
            onClick={() => setActiveFannedPage(2)}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeFannedPage === 2
                ? "bg-[#B5111B] text-white shadow-xs ring-2 ring-[#B5111B]/20"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            Page 2: Matrix
          </button>
          <button
            onClick={() => setActiveFannedPage(3)}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeFannedPage === 3
                ? "bg-[#B5111B] text-white shadow-xs ring-2 ring-[#B5111B]/20"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            Page 3: Roadmap
          </button>

          <button
            onClick={() => setActiveFannedPage((prev) => (prev < 3 ? prev + 1 : 1))}
            className="p-2 rounded-xl bg-white text-[#B5111B] border border-slate-200 hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer shadow-2xs flex items-center gap-1 text-xs font-bold"
            aria-label="Next Page"
          >
            <span className="hidden xs:inline">Next</span>
            <ChevronRight className="w-4 h-4 text-[#B5111B]" />
          </button>
        </div>

        {/* 3D FANNED PAPER STACK CONTAINER WITH REAL ADMIN PORTAL CALLOUTS */}
        <div className="relative min-h-[580px] sm:min-h-[640px] flex items-center justify-center py-6 px-2 sm:px-4 overflow-visible">
          
          <button
            onClick={() => setActiveFannedPage((prev) => (prev > 1 ? prev - 1 : 3))}
            className="xl:hidden absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-40 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 text-[#B5111B] border-2 border-[#B5111B] shadow-xl flex items-center justify-center hover:bg-[#B5111B] hover:text-white transition-all cursor-pointer"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          <button
            onClick={() => setActiveFannedPage((prev) => (prev < 3 ? prev + 1 : 1))}
            className="xl:hidden absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 z-40 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 text-[#B5111B] border-2 border-[#B5111B] shadow-xl flex items-center justify-center hover:bg-[#B5111B] hover:text-white transition-all cursor-pointer"
            aria-label="Next Page"
          >
            <ChevronRight className="w-6 h-6 stroke-[2.5]" />
          </button>
          
          {/* ANNOTATION 1 (Top Left) */}
          <div 
            onClick={() => setActiveFannedPage(1)}
            className={`hidden xl:flex flex-col items-start gap-1.5 absolute top-0 left-0 max-w-[280px] cursor-pointer transition-all duration-500 ${
              activeFannedPage === 1 
                ? "opacity-100 scale-105 z-50 pointer-events-auto" 
                : "opacity-75 scale-95 z-30 hover:opacity-100 hover:scale-100 pointer-events-auto"
            }`}
          >
            <div className={`p-3.5 rounded-2xl transition-all duration-300 ${
              activeFannedPage === 1
                ? "bg-white border-2 border-[#B5111B] shadow-2xl ring-4 ring-[#B5111B]/15"
                : "bg-white/95 border border-slate-300 shadow-sm"
            }`}>
              <h4 className="text-xs font-black tracking-tight flex items-center gap-2">
                <span className={`p-1.5 rounded-lg flex items-center justify-center transition-colors ${
                  activeFannedPage === 1 ? "bg-[#B5111B] text-white shadow-xs" : "bg-slate-100 text-slate-500"
                }`}>
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <span className={activeFannedPage === 1 ? "text-slate-900 font-extrabold text-sm" : "text-slate-700 font-bold text-xs"}>
                  Official 12-Step Guide Cover
                </span>
              </h4>
              <p className={`text-[11px] leading-tight pt-1.5 pl-0.5 ${
                activeFannedPage === 1 ? "text-slate-700 font-semibold" : "text-slate-500 font-medium"
              }`}>
                Lee County, NC 2025 Prosperity Building guide with Kathleen Rose CCIM/CRE seal.
              </p>
            </div>
            <svg viewBox="0 0 160 70" className="w-36 h-16 overflow-visible ml-6">
              <path
                d="M 15 5 C 50 5, 85 20, 115 45"
                fill="none"
                stroke={activeFannedPage === 1 ? "#B5111B" : "#94A3B8"}
                strokeWidth={activeFannedPage === 1 ? "2.5" : "1.5"}
                strokeLinecap="round"
                strokeDasharray="3 4"
              />
              <polygon points="115 45, 103 40, 110 34" fill={activeFannedPage === 1 ? "#B5111B" : "#64748B"} />
            </svg>
          </div>

          {/* ANNOTATION 2 (Top Right) */}
          <div 
            onClick={() => setActiveFannedPage(2)}
            className={`hidden xl:flex flex-col items-end gap-1.5 absolute top-2 -right-4 max-w-[280px] cursor-pointer transition-all duration-500 ${
              activeFannedPage === 2 
                ? "opacity-100 scale-105 z-50 pointer-events-auto" 
                : "opacity-75 scale-95 z-30 hover:opacity-100 hover:scale-100 pointer-events-auto"
            }`}
          >
            <div className={`p-3.5 rounded-2xl text-right transition-all duration-300 relative ${
              activeFannedPage === 2
                ? "bg-white border-2 border-[#B5111B] shadow-2xl ring-4 ring-[#B5111B]/15"
                : "bg-white/95 border border-slate-300 shadow-sm"
            }`}>
              <h4 className="text-xs font-black tracking-tight flex items-center justify-end gap-2">
                <span className={activeFannedPage === 2 ? "text-slate-900 font-extrabold text-sm" : "text-slate-700 font-bold text-xs"}>
                  12-Category Scorecard Matrix
                </span>
                <span className={`p-1.5 rounded-lg flex items-center justify-center transition-colors ${
                  activeFannedPage === 2 ? "bg-[#B5111B] text-white shadow-xs" : "bg-slate-100 text-slate-500"
                }`}>
                  <Layers className="w-4 h-4" />
                </span>
              </h4>
              <p className={`text-[11px] leading-tight pt-1.5 pr-0.5 ${
                activeFannedPage === 2 ? "text-slate-700 font-semibold" : "text-slate-500 font-medium"
              }`}>
                Comprehensive 12-module evaluation across 90 verified community indicators.
              </p>

              <svg viewBox="0 0 140 80" className="w-32 h-16 overflow-visible absolute -left-[105px] top-6 pointer-events-none z-40">
                <path
                  d="M 130 10 C 95 10, 60 30, 25 55"
                  fill="none"
                  stroke={activeFannedPage === 2 ? "#B5111B" : "#94A3B8"}
                  strokeWidth={activeFannedPage === 2 ? "2.5" : "1.5"}
                  strokeLinecap="round"
                  strokeDasharray="4 5"
                />
                <polygon points="25 55, 38 51, 33 43" fill={activeFannedPage === 2 ? "#B5111B" : "#64748B"} />
              </svg>
            </div>
          </div>

          {/* ANNOTATION 3 (Bottom Left) */}
          <div 
            onClick={() => setActiveFannedPage(2)}
            className={`hidden xl:flex flex-col items-start gap-1.5 absolute bottom-4 -left-4 max-w-[280px] cursor-pointer transition-all duration-500 ${
              activeFannedPage === 2 
                ? "opacity-100 scale-105 z-50 pointer-events-auto" 
                : "opacity-75 scale-95 z-30 hover:opacity-100 hover:scale-100 pointer-events-auto"
            }`}
          >
            <div className={`p-3.5 rounded-2xl transition-all duration-300 relative ${
              activeFannedPage === 2
                ? "bg-white border-2 border-[#B5111B] shadow-2xl ring-4 ring-[#B5111B]/15"
                : "bg-white/95 border border-slate-300 shadow-sm"
            }`}>
              <h4 className="text-xs font-black tracking-tight flex items-center gap-2">
                <span className={`p-1.5 rounded-lg flex items-center justify-center transition-colors ${
                  activeFannedPage === 2 ? "bg-[#B5111B] text-white shadow-xs" : "bg-slate-100 text-slate-500"
                }`}>
                  <Activity className="w-4 h-4" />
                </span>
                <span className={activeFannedPage === 2 ? "text-slate-900 font-extrabold text-sm" : "text-slate-700 font-bold text-xs"}>
                  Quality of Life Score Dial
                </span>
              </h4>
              <p className={`text-[11px] leading-tight pt-1.5 pl-0.5 ${
                activeFannedPage === 2 ? "text-slate-700 font-semibold" : "text-slate-500 font-medium"
              }`}>
                Aggregated 74/100 community prosperity index with Poor/Average/Good/Excellent bands.
              </p>

              <svg viewBox="0 0 140 80" className="w-32 h-16 overflow-visible absolute -right-[105px] -top-14 pointer-events-none z-40">
                <path
                  d="M 10 70 C 45 70, 80 50, 115 25"
                  fill="none"
                  stroke={activeFannedPage === 2 ? "#B5111B" : "#94A3B8"}
                  strokeWidth={activeFannedPage === 2 ? "2.5" : "1.5"}
                  strokeLinecap="round"
                  strokeDasharray="4 5"
                />
                <polygon points="115 25, 102 29, 107 37" fill={activeFannedPage === 2 ? "#B5111B" : "#64748B"} />
              </svg>
            </div>
          </div>

          {/* ANNOTATION 4 (Bottom Right) */}
          <div 
            onClick={() => setActiveFannedPage(3)}
            className={`hidden xl:flex flex-col items-end gap-1.5 absolute bottom-0 right-0 max-w-[280px] cursor-pointer transition-all duration-500 ${
              activeFannedPage === 3 
                ? "opacity-100 scale-105 z-50 pointer-events-auto" 
                : "opacity-75 scale-95 z-30 hover:opacity-100 hover:scale-100 pointer-events-auto"
            }`}
          >
            <svg viewBox="0 0 160 70" className="w-36 h-16 overflow-visible mr-6">
              <path
                d="M 145 65 C 110 65, 75 50, 45 25"
                fill="none"
                stroke={activeFannedPage === 3 ? "#B5111B" : "#94A3B8"}
                strokeWidth={activeFannedPage === 3 ? "2.5" : "1.5"}
                strokeLinecap="round"
                strokeDasharray="3 4"
              />
              <polygon points="45 25, 57 30, 50 36" fill={activeFannedPage === 3 ? "#B5111B" : "#64748B"} />
            </svg>
            <div className={`p-3.5 rounded-2xl text-right transition-all duration-300 ${
              activeFannedPage === 3
                ? "bg-white border-2 border-[#B5111B] shadow-2xl ring-4 ring-[#B5111B]/15"
                : "bg-white/95 border border-slate-300 shadow-sm"
            }`}>
              <h4 className="text-xs font-black tracking-tight flex items-center justify-end gap-2">
                <span className={activeFannedPage === 3 ? "text-slate-900 font-extrabold text-sm" : "text-slate-700 font-bold text-xs"}>
                  3-Phase Action Roadmap
                </span>
                <span className={`p-1.5 rounded-lg flex items-center justify-center transition-colors ${
                  activeFannedPage === 3 ? "bg-[#B5111B] text-white shadow-xs" : "bg-slate-100 text-slate-500"
                }`}>
                  <Sparkles className="w-4 h-4" />
                </span>
              </h4>
              <p className={`text-[11px] leading-tight pt-1.5 pr-0.5 ${
                activeFannedPage === 3 ? "text-slate-700 font-semibold" : "text-slate-500 font-medium"
              }`}>
                Reality Check → Plan Blueprint → Prosperity Building implementation chevrons.
              </p>
            </div>
          </div>

          {/* FANNED STACK CONTAINER */}
          <div className="relative w-full max-w-4xl h-[580px] flex items-center justify-center">
            
            {/* PAGE 1: COVER PAGE */}
            <div 
              onClick={() => setActiveFannedPage(1)}
              className={`absolute left-[1%] xs:left-[2%] sm:left-[8%] top-2 w-[275px] xs:w-[310px] sm:w-[350px] h-[500px] xs:h-[520px] sm:h-[560px] bg-white text-slate-900 rounded-2xl p-4 xs:p-6 space-y-3.5 cursor-pointer transition-all duration-500 ease-out origin-bottom-left flex flex-col justify-between ${
                activeFannedPage === 1 
                  ? "z-30 scale-102 sm:scale-108 rotate-0 shadow-[0_35px_90px_-15px_rgba(0,0,0,0.6)] ring-4 ring-[#B5111B]/30 border-2 border-[#B5111B] opacity-100" 
                  : "z-10 -rotate-6 scale-98 border border-slate-200 shadow-xl opacity-90 hover:opacity-100 hover:scale-100"
              }`}
            >
              <div className="h-1.5 bg-[#A48256] w-full rounded-full" />

              <div className="space-y-3 relative z-10">
                <div className="space-y-1">
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                    Prosperity <br /><span className="text-[#B5111B]">Building</span>
                  </h3>
                  <p className="text-xs font-bold text-[#8F0D15] leading-snug">
                    A 12-Step Guide to constructing quality of life and community prosperity.
                  </p>
                </div>

                <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm relative space-y-1 bg-slate-100 p-1">
                  <div className="grid grid-cols-2 gap-1 h-32">
                    <img 
                      src="/rose_community_hero.jpg" 
                      alt="Sanford Historic Downtown"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <img 
                      src="/rose_report_team.jpg" 
                      alt="Kathleen Rose Community Presentation"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="p-1 text-[8.5px] font-mono text-slate-500 flex justify-between items-center">
                    <span>Historic Sanford & Davidson, NC</span>
                    <span className="font-bold text-[#B5111B]">Case Study</span>
                  </div>
                </div>

                <div className="space-y-1 pt-1 border-t border-slate-100">
                  <div className="text-[11px] font-black text-slate-900">Lee County, NC 2025</div>
                  <div className="text-[9.5px] font-bold text-[#8F0D15]">Prosperity Builder Scorecard™</div>
                  <div className="text-[9px] text-slate-500">Rose & Associates Southeast, Inc.</div>
                  <div className="text-[9px] font-extrabold text-slate-700">Kathleen Rose, CCIM, CRE</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="Rose Associates" className="h-6 w-auto object-contain" />
                </div>
                <span className="text-[8.5px] font-mono text-slate-400">Page 1 • Official Cover</span>
              </div>
            </div>

            {/* PAGE 2: MIDDLE PAGE (Quality of Life Scorecard - All 12 Indicators) */}
            <div 
              onClick={() => setActiveFannedPage(2)}
              className={`absolute top-0 w-[285px] xs:w-[325px] sm:w-[380px] h-[520px] xs:h-[550px] sm:h-[600px] bg-white text-slate-900 rounded-2xl p-3.5 xs:p-4 sm:p-5 space-y-2 cursor-pointer transition-all duration-500 ease-out origin-bottom-center flex flex-col justify-between overflow-hidden ${
                activeFannedPage === 2 
                  ? "z-30 scale-102 sm:scale-108 rotate-0 shadow-[0_35px_90px_-15px_rgba(0,0,0,0.6)] border-4 border-[#8F0D15] ring-4 ring-[#B5111B]/30 opacity-100" 
                  : "z-20 rotate-4 scale-98 border border-slate-200 shadow-xl opacity-90 hover:opacity-100 hover:scale-100"
              }`}
            >
              {/* Top Gold Accent Bar */}
              <div className="h-1 bg-[#A48256] w-full rounded-full shrink-0" />

              <div className="space-y-1.5 relative z-10 flex-1 flex flex-col justify-between">
                {/* Header Title */}
                <div className="text-center space-y-0.5">
                  <div className="text-[11px] sm:text-xs font-serif font-black text-slate-900 tracking-tight">
                    Prosperity Builder Scorecard™
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight">
                    Quality of Life
                  </h4>
                </div>

                {/* 4-ZONE SPEEDOMETER DIAL */}
                <div className="flex flex-col items-center justify-center py-0.5">
                  <svg viewBox="0 0 200 105" className="w-44 sm:w-48 h-22 sm:h-24">
                    <path d="M 30 85 A 70 70 0 0 1 50 36" fill="none" stroke="#E11D48" strokeWidth="18" />
                    <path d="M 50 36 A 70 70 0 0 1 115 17" fill="none" stroke="#FBBF24" strokeWidth="18" />
                    <path d="M 115 17 A 70 70 0 0 1 158 50" fill="none" stroke="#84CC16" strokeWidth="18" />
                    <path d="M 158 50 A 70 70 0 0 1 170 85" fill="none" stroke="#16A34A" strokeWidth="18" />

                    <text x="38" y="70" className="text-[6.5px] font-black fill-white" textAnchor="middle">Poor</text>
                    <text x="86" y="24" className="text-[6.5px] font-black fill-slate-900" textAnchor="middle">Average</text>
                    <text x="145" y="44" className="text-[6.5px] font-black fill-slate-900" textAnchor="middle">Good</text>
                    <text x="163" y="74" className="text-[5.5px] font-black fill-white" textAnchor="middle">Excellent</text>

                    <g transform="rotate(45 100 85)">
                      <line x1="100" y1="85" x2="100" y2="24" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
                      <circle cx="100" cy="85" r="4.5" fill="#1E293B" />
                      <circle cx="100" cy="85" r="2" fill="#FFFFFF" />
                    </g>
                  </svg>

                  <div className="text-center -mt-2">
                    <div className="text-xl sm:text-2xl font-black text-slate-900 leading-none">74</div>
                    <div className="text-[9px] sm:text-[10px] font-black text-slate-900 tracking-tight">Lee County, North Carolina</div>
                    <div className="text-[8px] sm:text-[8.5px] text-slate-600 font-semibold">Overall Score</div>
                  </div>
                </div>

                {/* ALL 12 CORE MODULE HORIZONTAL GRADIENT SCORE BARS */}
                <div className="grid grid-cols-2 gap-x-2.5 gap-y-1 text-[7.5px] sm:text-[8px] pt-0.5">
                  
                  {/* Column 1 - Item 1: Accessibility & Transportation (80) */}
                  <div className="flex items-start gap-1">
                    <div className="w-3.5 h-3.5 rounded-xs bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 text-slate-700">
                      <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-current">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
                      </svg>
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center gap-1">
                        <span className="text-[7px] text-slate-500 font-bold">Score:</span>
                        <div className="flex-1 h-2 rounded-xs bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500 relative flex items-center">
                          <span className="absolute right-3 text-[6.5px] font-black text-slate-900 bg-white/70 px-1 rounded-xs">80</span>
                        </div>
                      </div>
                      <div className="font-bold text-slate-900 leading-tight">Accessibility & Transportation</div>
                      <div className="text-[6px] text-slate-500 leading-tight truncate">How well can residents, visitors & workers move</div>
                    </div>
                  </div>

                  {/* Column 2 - Item 7: Healthcare & Wellness (59) */}
                  <div className="flex items-start gap-1">
                    <div className="w-3.5 h-3.5 rounded-xs bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 text-slate-700">
                      <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                        <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
                      </svg>
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center gap-1">
                        <span className="text-[7px] text-slate-500 font-bold">Score:</span>
                        <div className="flex-1 h-2 rounded-xs bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500 relative flex items-center">
                          <span className="absolute right-6 text-[6.5px] font-black text-slate-900 bg-white/70 px-1 rounded-xs">59</span>
                        </div>
                      </div>
                      <div className="font-bold text-slate-900 leading-tight">Healthcare & Wellness</div>
                      <div className="text-[6px] text-slate-500 leading-tight truncate">Status of public health & medical care</div>
                    </div>
                  </div>

                  {/* Column 1 - Item 2: Arts & Culture (74) */}
                  <div className="flex items-start gap-1">
                    <div className="w-3.5 h-3.5 rounded-xs bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 text-slate-700">
                      <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 10a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4z" />
                        <circle cx="6" cy="10" r="1" fill="currentColor" />
                        <circle cx="10" cy="10" r="1" fill="currentColor" />
                        <path d="M6 13c1 1 2 1 3 0" />
                        <path d="M14 6h4a4 4 0 0 1 4 4v2a4 4 0 0 1-4 4h-4" />
                        <path d="M18 10h.01" />
                      </svg>
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center gap-1">
                        <span className="text-[7px] text-slate-500 font-bold">Score:</span>
                        <div className="flex-1 h-2 rounded-xs bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500 relative flex items-center">
                          <span className="absolute right-4 text-[6.5px] font-black text-slate-900 bg-white/70 px-1 rounded-xs">74</span>
                        </div>
                      </div>
                      <div className="font-bold text-slate-900 leading-tight">Arts & Culture</div>
                      <div className="text-[6px] text-slate-500 leading-tight truncate">Foster & support local and visiting artists</div>
                    </div>
                  </div>

                  {/* Column 2 - Item 8: Historic Preservation (100) */}
                  <div className="flex items-start gap-1">
                    <div className="w-3.5 h-3.5 rounded-xs bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 text-slate-700">
                      <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 21h18M4 18h16M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 3l10 5H2l10-5z" />
                      </svg>
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center gap-1">
                        <span className="text-[7px] text-slate-500 font-bold">Score:</span>
                        <div className="flex-1 h-2 rounded-xs bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500 relative flex items-center">
                          <span className="absolute right-0.5 text-[6.5px] font-black text-white bg-black/60 px-1 rounded-xs">100</span>
                        </div>
                      </div>
                      <div className="font-bold text-slate-900 leading-tight">Historic Preservation</div>
                      <div className="text-[6px] text-slate-500 leading-tight truncate">Preserve & honor historic assets</div>
                    </div>
                  </div>

                  {/* Column 1 - Item 3: Crime & Public Safety (61) */}
                  <div className="flex items-start gap-1">
                    <div className="w-3.5 h-3.5 rounded-xs bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 text-slate-700">
                      <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2l7 4v6c0 5.25-3.5 10-7 12-3.5-2-7-6.75-7-12V6l7-4z" />
                        <path d="M12 8v4" />
                        <path d="M12 16h.01" />
                      </svg>
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center gap-1">
                        <span className="text-[7px] text-slate-500 font-bold">Score:</span>
                        <div className="flex-1 h-2 rounded-xs bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500 relative flex items-center">
                          <span className="absolute right-6 text-[6.5px] font-black text-slate-900 bg-white/70 px-1 rounded-xs">61</span>
                        </div>
                      </div>
                      <div className="font-bold text-slate-900 leading-tight">Crime & Public Safety</div>
                      <div className="text-[6px] text-slate-500 leading-tight truncate">Residents & workers feel safe in community</div>
                    </div>
                  </div>

                  {/* Column 2 - Item 9: Population & Housing (95) */}
                  <div className="flex items-start gap-1">
                    <div className="w-3.5 h-3.5 rounded-xs bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 text-slate-700">
                      <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center gap-1">
                        <span className="text-[7px] text-slate-500 font-bold">Score:</span>
                        <div className="flex-1 h-2 rounded-xs bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500 relative flex items-center">
                          <span className="absolute right-1 text-[6.5px] font-black text-slate-900 bg-white/70 px-1 rounded-xs">95</span>
                        </div>
                      </div>
                      <div className="font-bold text-slate-900 leading-tight">Population & Housing</div>
                      <div className="text-[6px] text-slate-500 leading-tight truncate">Adequate & affordable housing for all</div>
                    </div>
                  </div>

                  {/* Column 1 - Item 4: Education (63) */}
                  <div className="flex items-start gap-1">
                    <div className="w-3.5 h-3.5 rounded-xs bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 text-slate-700">
                      <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                        <path d="M6 12v5c3 3 9 3 12 0v-5" />
                      </svg>
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center gap-1">
                        <span className="text-[7px] text-slate-500 font-bold">Score:</span>
                        <div className="flex-1 h-2 rounded-xs bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500 relative flex items-center">
                          <span className="absolute right-6 text-[6.5px] font-black text-slate-900 bg-white/70 px-1 rounded-xs">63</span>
                        </div>
                      </div>
                      <div className="font-bold text-slate-900 leading-tight">Education</div>
                      <div className="text-[6px] text-slate-500 leading-tight truncate">Resources for educational attainment</div>
                    </div>
                  </div>

                  {/* Column 2 - Item 10: Infrastructure (81) */}
                  <div className="flex items-start gap-1">
                    <div className="w-3.5 h-3.5 rounded-xs bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 text-slate-700">
                      <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
                        <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
                        <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
                        <path d="M10 6h4M10 10h4M10 14h4M10 18h4" />
                      </svg>
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center gap-1">
                        <span className="text-[7px] text-slate-500 font-bold">Score:</span>
                        <div className="flex-1 h-2 rounded-xs bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500 relative flex items-center">
                          <span className="absolute right-3 text-[6.5px] font-black text-slate-900 bg-white/70 px-1 rounded-xs">81</span>
                        </div>
                      </div>
                      <div className="font-bold text-slate-900 leading-tight">Infrastructure</div>
                      <div className="text-[6px] text-slate-500 leading-tight truncate">Meet needs for current & future expansion</div>
                    </div>
                  </div>

                  {/* Column 1 - Item 5: Employment & Labor (53) */}
                  <div className="flex items-start gap-1">
                    <div className="w-3.5 h-3.5 rounded-xs bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 text-slate-700">
                      <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="14" x="2" y="7" rx="2" />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                      </svg>
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center gap-1">
                        <span className="text-[7px] text-slate-500 font-bold">Score:</span>
                        <div className="flex-1 h-2 rounded-xs bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500 relative flex items-center">
                          <span className="absolute right-7 text-[6.5px] font-black text-slate-900 bg-white/70 px-1 rounded-xs">53</span>
                        </div>
                      </div>
                      <div className="font-bold text-slate-900 leading-tight">Employment & Labor</div>
                      <div className="text-[6px] text-slate-500 leading-tight truncate">Balanced workforce & expansion</div>
                    </div>
                  </div>

                  {/* Column 2 - Item 11: Open Space & Recreation (77) */}
                  <div className="flex items-start gap-1">
                    <div className="w-3.5 h-3.5 rounded-xs bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 text-slate-700">
                      <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="18.5" cy="17.5" r="3.5" />
                        <circle cx="5.5" cy="17.5" r="3.5" />
                        <circle cx="15" cy="5" r="1" />
                        <path d="M12 17.5V14l-3-3 4-3 2 3h2" />
                      </svg>
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center gap-1">
                        <span className="text-[7px] text-slate-500 font-bold">Score:</span>
                        <div className="flex-1 h-2 rounded-xs bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500 relative flex items-center">
                          <span className="absolute right-3.5 text-[6.5px] font-black text-slate-900 bg-white/70 px-1 rounded-xs">77</span>
                        </div>
                      </div>
                      <div className="font-bold text-slate-900 leading-tight">Open Space & Recreation</div>
                      <div className="text-[6px] text-slate-500 leading-tight truncate">Passive & active recreation opportunities</div>
                    </div>
                  </div>

                  {/* Column 1 - Item 6: Goods & Services (72) */}
                  <div className="flex items-start gap-1">
                    <div className="w-3.5 h-3.5 rounded-xs bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 text-slate-700">
                      <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m7.5 4.27 9 5.15" />
                        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                        <path d="m3.3 7 8.7 5 8.7-5" />
                        <path d="M12 22V12" />
                      </svg>
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center gap-1">
                        <span className="text-[7px] text-slate-500 font-bold">Score:</span>
                        <div className="flex-1 h-2 rounded-xs bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500 relative flex items-center">
                          <span className="absolute right-4 text-[6.5px] font-black text-slate-900 bg-white/70 px-1 rounded-xs">72</span>
                        </div>
                      </div>
                      <div className="font-bold text-slate-900 leading-tight">Goods & Services</div>
                      <div className="text-[6px] text-slate-500 leading-tight truncate">Adequate food, beverages & goods</div>
                    </div>
                  </div>

                  {/* Column 2 - Item 12: Planning & Land Use (78) */}
                  <div className="flex items-start gap-1">
                    <div className="w-3.5 h-3.5 rounded-xs bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 text-slate-700">
                      <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                        <line x1="9" x2="9" y1="3" y2="18" />
                        <line x1="15" x2="15" y1="6" y2="21" />
                      </svg>
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center gap-1">
                        <span className="text-[7px] text-slate-500 font-bold">Score:</span>
                        <div className="flex-1 h-2 rounded-xs bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500 relative flex items-center">
                          <span className="absolute right-3.5 text-[6.5px] font-black text-slate-900 bg-white/70 px-1 rounded-xs">78</span>
                        </div>
                      </div>
                      <div className="font-bold text-slate-900 leading-tight">Planning & Land Use</div>
                      <div className="text-[6px] text-slate-500 leading-tight truncate">Preservation & balanced tax base</div>
                    </div>
                  </div>

                </div>
              </div>

              <div className="pt-1.5 border-t border-slate-200 flex justify-between items-center text-[8px] font-mono text-slate-400 shrink-0">
                <span>Rose Associates Southeast, Inc.</span>
                <span className="font-bold text-[#B5111B]">Page 6</span>
              </div>
            </div>

            {/* PAGE 3: BACK PAGE (Next Steps & Resources) */}
            <div 
              onClick={() => setActiveFannedPage(3)}
              className={`absolute right-[1%] xs:right-[2%] sm:right-[8%] top-0 w-[285px] xs:w-[325px] sm:w-[380px] h-[520px] xs:h-[550px] sm:h-[600px] bg-white text-slate-900 rounded-2xl p-3.5 xs:p-5 sm:p-6 cursor-pointer transition-all duration-500 ease-out origin-bottom-right flex flex-col justify-between overflow-hidden ${
                activeFannedPage === 3 
                  ? "z-30 scale-102 sm:scale-108 rotate-0 shadow-[0_35px_90px_-15px_rgba(0,0,0,0.6)] border-4 border-[#8F0D15] ring-4 ring-[#B5111B]/30 opacity-100" 
                  : "z-10 rotate-8 scale-98 border border-slate-200 shadow-xl opacity-90 hover:opacity-100 hover:scale-100"
              }`}
            >
              <div className="h-1 bg-[#A48256] w-full rounded-full shrink-0" />

              <div className="space-y-2 relative z-10 flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start pt-1">
                  <div className="space-y-0.5">
                    <h3 className="text-base sm:text-lg font-serif font-black text-slate-900 tracking-tight">
                      Next Steps & Resources
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-slate-700 italic font-medium">
                      Where do we go from here?
                    </p>
                  </div>

                  <div className="w-8 h-8 text-slate-300 shrink-0 flex items-center justify-center opacity-80">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current" strokeWidth="1.5">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
                      <path d="M19 16c-2 1-4-1-6 0s-3 3-5 2" strokeDasharray="1.5 1.5" />
                    </svg>
                  </div>
                </div>

                <p className="text-[8px] sm:text-[9px] text-slate-700 leading-relaxed">
                  The Scorecard provides a foundational first step in understanding your current reality. There are several resources available to assist communities in building prosperity. In addition to the Scorecard, these steps include the following:
                </p>

                <div className="space-y-1 text-[7.5px] sm:text-[8.5px] text-slate-800 leading-snug pl-1">
                  <div className="flex items-start gap-1.5">
                    <span className="text-slate-900 font-black shrink-0">•</span>
                    <span><strong>Understand your community characteristics and dynamics.</strong> This includes updated demographic and economic data from state and federal resources such as the U.S. Census and the Bureau of Labor Statistics.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-slate-900 font-black shrink-0">•</span>
                    <span><strong>Set forth a Vision and Mission for your community.</strong> This requires input from local residents, business owners and other stakeholders.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-slate-900 font-black shrink-0">•</span>
                    <span><strong>Identify your community assets.</strong> What makes your community special?</span>
                  </div>
                </div>

                <div className="py-1">
                  <svg viewBox="0 0 330 42" className="w-full h-auto drop-shadow-2xs">
                    <polygon points="0,0 95,0 110,21 95,42 0,42" fill="#F8FAFC" stroke="#64748B" strokeWidth="1" />
                    <text x="48" y="17" textAnchor="middle" className="text-[8px] font-sans font-bold fill-slate-900 tracking-tight">REALITY</text>
                    <text x="48" y="29" textAnchor="middle" className="text-[8px] font-sans font-bold fill-slate-900 tracking-tight">CHECK</text>

                    <polygon points="105,0 200,0 215,21 200,42 105,42 120,21" fill="#F8FAFC" stroke="#64748B" strokeWidth="1" />
                    <text x="160" y="17" textAnchor="middle" className="text-[8px] font-sans font-bold fill-slate-900 tracking-tight">PLAN</text>
                    <text x="160" y="29" textAnchor="middle" className="text-[8px] font-sans font-bold fill-slate-900 tracking-tight">BLUEPRINT</text>

                    <polygon points="210,0 305,0 320,21 305,42 210,42 225,21" fill="#FEF2F2" stroke="#B5111B" strokeWidth="1.2" />
                    <text x="265" y="17" textAnchor="middle" className="text-[8px] font-sans font-black fill-[#8F0D15] tracking-tight">PROSPERITY</text>
                    <text x="265" y="29" textAnchor="middle" className="text-[8px] font-sans font-black fill-[#8F0D15] tracking-tight">BUILDING</text>
                  </svg>
                </div>

                <div className="space-y-1 border-t border-slate-100 pt-1.5">
                  <div className="text-[9px] sm:text-[10px] font-serif font-black text-slate-900 italic text-center">
                    The Prosperity Builder Program™
                  </div>
                  <p className="text-[7px] sm:text-[8px] text-slate-600 leading-tight">
                    If further interested, join our Prosperity Builder Program. Our process begins by evaluating the community&apos;s health and well-being through data sources and tools that interpret complex information into a scorecard to assist in prioritizing decisions based on market reality, vision and goals.
                  </p>
                  <p className="text-[7.5px] sm:text-[8px] text-slate-800 pt-0.5">
                    Reach out to us at <strong className="text-[#B5111B]">info@roseassociates.com</strong> to schedule a consultation on building your best path forward.
                  </p>
                </div>
              </div>

              <div className="pt-1.5 border-t border-slate-200 flex justify-between items-center text-[8px] font-mono text-slate-400 shrink-0">
                <span>Rose Associates Southeast, Inc.</span>
                <span className="font-bold text-slate-700">31</span>
              </div>
            </div>

          </div>
        </div>

        <div className="text-center pt-2">
          <Link
            href="/login"
            className="bg-[#B5111B] hover:bg-[#8F0D15] text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-md transition-all inline-flex items-center gap-2 cursor-pointer hover:scale-102"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Buy Subscription to Generate Certified Reports</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
