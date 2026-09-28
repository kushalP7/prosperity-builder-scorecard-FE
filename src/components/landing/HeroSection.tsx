"use client"

import { ShieldCheck, MapPin } from "lucide-react"
import { CommunityWedgeWheel } from "./CommunityWedgeWheel"

export function HeroSection() {
  return (
    <section className="relative bg-[#540208] text-white overflow-hidden border-b border-red-950 flex items-center min-h-0 lg:min-h-[620px] xl:min-h-[680px]">
      {/* Ambient Gradient Lighting & Mesh Accent */}
      <div className="absolute inset-0 bg-radial-[ellipse_at_center,_var(--tw-gradient-stops)] from-[#6A040E]/80 via-[#540208] to-[#3B0105] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />

      {/* Desktop Flush Right Wedge Wheel Graphic */}
      <div className="hidden lg:flex absolute top-1/2 -translate-y-1/2 right-0 xl:right-4 2xl:right-12 w-[42vw] xl:w-[45vw] max-w-[500px] xl:max-w-[620px] 2xl:max-w-[700px] pointer-events-none z-10 select-none items-center justify-end pr-2 lg:pr-4 py-2">
        <div className="w-full pointer-events-auto">
          <CommunityWedgeWheel />
        </div>
      </div>

      {/* Content Container - Perfect alignment with LandingHeader (max-w-7xl px-4 sm:px-6 lg:px-8) */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 xl:py-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Content Column */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-4 lg:space-y-5 z-10 max-w-xl lg:max-w-2xl">
            
            {/* Header Heritage & Location Bar - Left Vertical Crimson Accent Bar (Single Line) */}
            <div className="border-l-2 border-[#E11D48] pl-3 py-0.5 flex flex-wrap items-center gap-2.5 sm:gap-3">
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-black uppercase tracking-widest text-[#E11D48]">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>ESTABLISHED 1992</span>
              </div>
              <span className="text-white/30 text-xs font-normal">•</span>
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-rose-100/90">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Davidson, North Carolina</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-[36px] xl:text-[44px] 2xl:text-[50px] font-black text-white tracking-tight leading-[1.08]">
              Strategic Advisory<br />
              at the Intersection of<br />
              Economic Development<br />
              & Real Estate<span className="text-[#E11D48]">.</span>
            </h1>

            <p className="text-xs sm:text-sm lg:text-xs xl:text-sm 2xl:text-base text-rose-100/90 leading-relaxed font-normal max-w-xl">
              Rose Associates is a real estate and economic development advisory firm providing comprehensive services for private, institutional and municipal clients. Our 30+ years of experience in both urban and rural communities throughout the Carolinas and Southeast will guide you on a path toward prosperity. <strong className="text-[#E11D48] font-bold">Problem. Solved.</strong>
            </p>

            {/* Divider Line */}
            <div className="w-full border-t border-red-900/60 pt-3 lg:pt-3" />

            {/* Bottom Stat Callout Text */}
            <div className="space-y-1 lg:space-y-1 max-w-xl">
              <h3 className="text-sm sm:text-base lg:text-sm xl:text-base 2xl:text-lg font-black text-white tracking-tight leading-snug">
                90+ Data Points Simplified into the Insights That Matter<span className="text-[#E11D48]">.</span>
              </h3>
              <p className="text-[11px] sm:text-xs lg:text-[11px] xl:text-xs 2xl:text-sm text-rose-200/90 font-normal leading-normal">
                Turn Municipal Spending into Measurable Quality of Life Gains with this helpful tool.
              </p>
            </div>
          </div>

          {/* Mobile/Tablet Graphic */}
          <div className="lg:hidden flex justify-center pt-4">
            <div className="w-full max-w-[340px] sm:max-w-[420px]">
              <CommunityWedgeWheel />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

