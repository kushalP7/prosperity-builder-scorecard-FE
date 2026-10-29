"use client"

import * as React from "react"
import { partnersApi, LandingPartnerItem } from "@/lib/partners-api"

export function PartnersSection() {
  const [partners, setPartners] = React.useState<LandingPartnerItem[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    ;(async () => {
      setLoading(true)
      try {
        const items = await partnersApi.getPartners({
          status: "published",
          signal: controller.signal,
        })
        if (!cancelled) {
          setPartners(Array.isArray(items) ? items : [])
        }
      } catch {
        if (!cancelled) setPartners([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [])

  if (loading || partners.length === 0) {
    return null
  }

  // Duplicate for seamless marquee loop
  const marqueeList = [...partners, ...partners]

  return (
    <section id="project-partners" className="scroll-mt-20 py-6 sm:py-8 bg-white border-b border-slate-200/80 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Project <span className="text-[#B5111B]">Partners</span>
          </h2>
        </div>

        <div className="relative w-full overflow-hidden py-2">
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-white via-white/90 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-white via-white/90 to-transparent z-10 pointer-events-none" />

          <div className="flex animate-marquee gap-8 sm:gap-12 md:gap-14 items-center">
            {marqueeList.map((partner, idx) => (
              <div
                key={`${partner.id}-${idx}`}
                className="shrink-0 flex items-center justify-center px-3 py-1 hover:scale-105 transition-transform duration-300 cursor-pointer"
                title={partner.name}
              >
                <img
                  src={partner.logoUrl}
                  alt={partner.name}
                  draggable={false}
                  className="h-10 sm:h-12 md:h-14 w-auto max-w-[130px] sm:max-w-[170px] object-contain drop-shadow-2xs select-none pointer-events-none"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
