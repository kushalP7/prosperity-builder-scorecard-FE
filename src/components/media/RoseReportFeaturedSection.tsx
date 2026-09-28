"use client"

import * as React from "react"
import { Link } from "@/lib/router-compat"

export function RoseReportFeaturedSection() {
  const LINKEDIN_SUBSCRIBE_URL =
    "https://www.linkedin.com/build-relation/newsletter-follow?entityUrn=7482478285134729216"
  const LINKEDIN_NEWSLETTER_URL =
    "https://www.linkedin.com/newsletters/rose-report-7482478285134729216"

  const FEATURED_EDITIONS = [
    {
      id: "driving-automotive-carolinas",
      title: "Driving automotive in the Carolinas",
      date: "Sep 14, 2026",
      summary:
        "Did you know that you can now get data from U.S. Census on the automotive industry? As of July 2026, U.S. Inventories were up to $67.2B and shipments up to $73.8B. From batteries to cars, the Carolinas lead in this sector.",
      articleUrl:
        "https://www.linkedin.com/pulse/driving-automotive-carolinas-kathleen-rose-ccim-cre--trzme",
      image: "linkedIn-newsletter/Driving-automotive-in-the-Carolinas.png",
    },
    {
      id: "the-human-moat",
      title: "The Human Moat",
      date: "Aug 29, 2026",
      summary:
        "Why experience and reasoning remain irreplaceable in real estate and economic development as artificial intelligence continues to be deployed across land use planning.",
      articleUrl:
        "https://www.linkedin.com/pulse/human-moat-kathleen-rose-ccim-cre--ht0ne",
      image: "linkedIn-newsletter/The-Human-Moat.png",
    },
    {
      id: "whats-up-with-opportunity-zones",
      title: "What's Up with Opportunity Zones?",
      date: "Aug 25, 2026",
      summary:
        "Evaluating nationwide Opportunity Zone incentives established to foster private investment in economically distressed communities and how to maximize local capital allocation.",
      articleUrl:
        "https://www.linkedin.com/pulse/whats-up-opportunity-zones-kathleen-rose-ccim-cre--vxhue",
      image: "linkedIn-newsletter/Whats-Up-with-Opportunity-Zones.png",
    },
    {
      id: "longevity",
      title: "Longevity",
      date: "Jul 30, 2026",
      summary:
        "Building lasting value and enduring municipal health through balanced land use, sustainable development strategies, and community resilience.",
      articleUrl:
        "https://www.linkedin.com/pulse/longevity-kathleen-rose-ccim-cre--lxlse",
      image: "linkedIn-newsletter/Whats-Up-with-Opportunity-Zones.png",
    },
  ]

  return (
    <section id="rose-report-spotlight" className="space-y-10">
      {/* 1. CLEAN FEATURED NEWSLETTER CARD */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 lg:p-10 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Left Details */}
          <div className="md:col-span-8 space-y-4">
            <div className="space-y-1">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                The <span className="text-[#B5111B]">Rose Report</span>
              </h2>
              <p className="text-sm sm:text-base font-semibold text-slate-600">
                A view from the road - thoughts, ideas & inspiration on economic development, land use, and real estate
              </p>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
              Published monthly on LinkedIn by Kathleen Rose, CCIM, CRE®, The Rose Report provides municipal leaders, economic developers, planning boards, and commercial developers with actionable market perspectives and growth strategies.
            </p>

            {/* Actions */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href={LINKEDIN_SUBSCRIBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#0A66C2] hover:bg-[#084e96] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                style={{ fontFamily: '"SF Pro Text", Helvetica, sans-serif' }}
              >
                Subscribe on LinkedIn
              </a>

              <a
                href={LINKEDIN_NEWSLETTER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 text-xs sm:text-sm font-semibold transition-colors bg-white cursor-pointer"
              >
                Read on LinkedIn
              </a>

              <Link
                href="/reports"
                className="inline-flex items-center justify-center px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#B5111B] transition-colors"
              >
                View all reports &rarr;
              </Link>
            </div>
          </div>

          {/* Right Author Profile */}
          <div className="md:col-span-4 flex flex-col items-center md:items-end text-center md:text-right">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 mb-3">
              <img
                src="/kathleen_rose.png"
                alt="Kathleen Rose, CCIM, CRE"
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  e.currentTarget.src = "/logo.png"
                  e.currentTarget.className = "w-full h-full object-contain p-2 bg-white"
                }}
              />
            </div>
            <div className="text-sm font-bold text-slate-900">Kathleen Rose, CCIM, CRE®</div>
            <div className="text-xs text-slate-500">President & Founder, Rose Associates</div>
          </div>
        </div>
      </div>

      {/* 2. RECENT EDITIONS */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Sample Newsletter Editions
            </h3>
            <p className="text-xs text-slate-500">
              Read recent articles published in The Rose Report on LinkedIn.
            </p>
          </div>
          <a
            href={LINKEDIN_NEWSLETTER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-slate-600 hover:text-[#B5111B] transition-colors"
          >
            View all on LinkedIn &rarr;
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURED_EDITIONS.map((edition) => (
            <div
              key={edition.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-colors shadow-2xs"
            >
              <div>
                <div className="aspect-[16/10] w-full bg-slate-100 overflow-hidden">
                  <img
                    src={edition.image}
                    alt={edition.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/rose_community_hero.jpg"
                    }}
                  />
                </div>

                <div className="p-4 space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {edition.date}
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-2">
                    {edition.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {edition.summary}
                  </p>
                </div>
              </div>

              <div className="px-4 pb-4 pt-1">
                <a
                  href={edition.articleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#B5111B] hover:text-[#8F0D15] transition-colors inline-flex items-center gap-1"
                >
                  Read on LinkedIn &rarr;
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
