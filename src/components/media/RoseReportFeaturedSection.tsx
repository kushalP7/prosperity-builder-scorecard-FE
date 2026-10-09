"use client"

import * as React from "react"
import { Link } from "@/lib/router-compat"
import { ArrowRight } from "lucide-react"
import { PublishedReportsCardsSection } from "@/components/landing/PublishedReportsCardsSection"
import { reportsApi, LandingReportItem } from "@/lib/reports-api"

function formatEditionDate(dateString?: string): string {
  if (!dateString) return ""
  try {
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return dateString
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  } catch {
    return dateString
  }
}

export function RoseReportFeaturedSection() {
  const LINKEDIN_SUBSCRIBE_URL =
    "https://www.linkedin.com/build-relation/newsletter-follow?entityUrn=7482478285134729216"
  const LINKEDIN_NEWSLETTER_URL =
    "https://www.linkedin.com/newsletters/rose-report-7482478285134729216"

  const FEATURED_EDITIONS = [
    {
      id: "driving-automotive-carolinas",
      title: "Driving automotive in the Carolinas",
      author: "Kathleen Rose, CCIM, CRE",
      date: "Sep 14, 2026",
      articleUrl:
        "https://www.linkedin.com/pulse/driving-automotive-carolinas-kathleen-rose-ccim-cre--trzme",
      image: "linkedIn-newsletter/Driving-automotive-in-the-Carolinas.png",
    },
    {
      id: "the-human-moat",
      title: "The Human Moat",
      author: "Kathleen Rose, CCIM, CRE",
      date: "Aug 29, 2026",
      articleUrl:
        "https://www.linkedin.com/pulse/human-moat-kathleen-rose-ccim-cre--ht0ne",
      image: "linkedIn-newsletter/The-Human-Moat.png",
    },
    {
      id: "whats-up-with-opportunity-zones",
      title: "What's Up with Opportunity Zones?",
      author: "Kathleen Rose, CCIM, CRE",
      date: "Aug 25, 2026",
      articleUrl:
        "https://www.linkedin.com/pulse/whats-up-opportunity-zones-kathleen-rose-ccim-cre--vxhue",
      image: "linkedIn-newsletter/Whats-Up-with-Opportunity-Zones.png",
    },
    {
      id: "longevity",
      title: "Longevity",
      author: "Kathleen Rose, CCIM, CRE",
      date: "Jul 30, 2026",
      articleUrl:
        "https://www.linkedin.com/pulse/longevity-kathleen-rose-ccim-cre--lxlse",
      image: "linkedIn-newsletter/Whats-Up-with-Opportunity-Zones.png",
    },
  ]

  const [dynamicEditions, setDynamicEditions] = React.useState<LandingReportItem[]>([])
  const [loadingEditions, setLoadingEditions] = React.useState(true)

  React.useEffect(() => {
    const controller = new AbortController()
    async function loadNewsletters() {
      try {
        const data = await reportsApi.getNewsletters(controller.signal, 100)
        if (!controller.signal.aborted && Array.isArray(data) && data.length > 0) {
          setDynamicEditions(data)
        }
      } catch (err: any) {
        if (!controller.signal.aborted) {
          console.warn("Could not load dynamic newsletters:", err)
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingEditions(false)
        }
      }
    }
    loadNewsletters()
    return () => controller.abort()
  }, [])

  const editionsToDisplay =
    dynamicEditions.length > 0
      ? dynamicEditions.map((item) => ({
          id: item.id,
          title: item.title,
          author: item.author || "Kathleen Rose, CCIM, CRE",
          date: formatEditionDate(item.publishedAt),
          articleUrl: item.externalUrl || item.pdfUrl || LINKEDIN_NEWSLETTER_URL,
          image: item.coverImage || "/reports/rose_community_hero.jpg",
        }))
      : FEATURED_EDITIONS

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
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#0A66C2] hover:bg-[#084e96] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs"
                style={{ fontFamily: '"SF Pro Text", Helvetica, sans-serif' }}
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
                <span>Subscribe on LinkedIn</span>
              </a>

              <a
                href={LINKEDIN_NEWSLETTER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 text-xs sm:text-sm font-semibold transition-colors bg-white cursor-pointer"
              >
                <svg className="w-4 h-4 fill-[#0A66C2] shrink-0" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
                <span>Read on LinkedIn</span>
              </a>

              <Link
                href="/reports"
                className="inline-flex items-center justify-center px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#B5111B] transition-colors"
              >
                View all reports
              </Link>
            </div>
          </div>

          {/* Right Author Profile */}
          <div className="md:col-span-4 flex justify-center md:justify-end">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 mb-3">
                <img
                  src="/team/kathleen_rose.png"
                  alt="Kathleen Rose, CCIM, CRE"
                  className="w-full h-full object-cover object-center"
                  onError={(e) => {
                    e.currentTarget.src = "/branding/logo.png"
                    e.currentTarget.className = "w-full h-full object-contain p-2 bg-white"
                  }}
                />
              </div>
              <div className="text-sm font-bold text-slate-900">Kathleen Rose, CCIM, CRE®</div>
              <div className="text-xs text-slate-500">President & Founder, Rose Associates</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. RECENT EDITIONS */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Sample Newsletter <span className="text-[#0A66C2]">Editions</span>
            </h3>
            <p className="text-xs text-slate-500">
              Read recent articles published in The Rose Report on LinkedIn.
            </p>
          </div>
          <a
            href={LINKEDIN_NEWSLETTER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-slate-600 hover:text-[#0A66C2] transition-colors"
          >
            View all on LinkedIn
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {editionsToDisplay.map((edition) => (
            <a
              key={edition.id}
              href={edition.articleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block aspect-[16/10] min-h-[220px] w-full rounded-2xl overflow-hidden bg-slate-900 shadow-2xs hover:shadow-lg hover:shadow-blue-600/20 transition-all duration-300 cursor-pointer select-none border border-slate-200"
            >
              {/* Base Image */}
              <img
                src={edition.image}
                alt={edition.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = "/reports/rose_community_hero.jpg"
                }}
              />

              {/* Resting State: Dark bottom gradient for high contrast & legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent transition-opacity duration-300 group-hover:opacity-0 pointer-events-none" />

              {/* Resting State Details (Inside the image card) */}
              <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 text-white transition-all duration-300 group-hover:opacity-0 group-hover:translate-y-1 pointer-events-none z-10">
                <h4 className="font-bold text-sm sm:text-base leading-snug line-clamp-2 tracking-tight text-white drop-shadow-sm">
                  {edition.title}
                </h4>
                <p className="text-xs text-white/85 font-medium mt-1 drop-shadow-xs">
                  By {edition.author || "Kathleen Rose, CCIM, CRE"} • {edition.date}
                </p>
              </div>

              {/* Hover State: Deep-blue LinkedIn overlay with Read on LinkedIn link & arrow graphic */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#003666] via-[#0A66C2]/95 to-[#0A66C2]/60 text-white p-4 sm:p-5 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 pointer-events-none">
                <h4 className="text-white font-bold text-sm sm:text-base tracking-tight leading-snug mb-1 line-clamp-2 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                  {edition.title}
                </h4>

                <div className="text-[11.5px] text-blue-100/90 font-medium mb-3 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                  <span>By {edition.author || "Kathleen Rose, CCIM, CRE"}</span>
                  <span className="mx-1">•</span>
                  <span>{edition.date}</span>
                </div>

                <div className="flex items-center justify-between transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300 delay-100">
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-semibold text-white">
                    <span>Read on LinkedIn</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                  <div className="flex items-center text-white/40">
                    <div className="w-8 sm:w-12 h-[1px] bg-white/40" />
                    <ArrowRight className="w-3 h-3 -ml-0.5 text-white/50" />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* 3. PUBLISHED REPORTS SECTION */}
      <PublishedReportsCardsSection embedded />
    </section>
  )
}
