"use client"

import * as React from "react"
import { Link } from "@/lib/router-compat"
import { FileText, ArrowRight } from "lucide-react"
import { reportsApi, LandingReportItem } from "@/lib/reports-api"

function formatReportDate(dateString?: string): string {
  if (!dateString) return "Sep 2026";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Sep 2026";
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  } catch {
    return "Sep 2026";
  }
}

// Fallback demo reports if DB is currently empty or connecting
const DEMO_REPORTS: LandingReportItem[] = [
  {
    id: "demo-1",
    title: "Rose Report - Summer 2026",
    slug: "rose-report-summer-2026",
    subtitle: "Strategic Real Estate & Economic Development Decision Audit",
    author: "Kathleen Rose, CCIM, CRE",
    publishedAt: "2026-07-01",
    coverImage: "/reports/rose_community_hero.jpg",
    pdfUrl: "https://roseassociates.com/reports/summer-2026.pdf",
    summary: "A comprehensive analysis of municipal growth trends, land use optimization, and real estate market indicators across Southeast developments.",
    featured: true,
    status: "published",
  },
  {
    id: "demo-2",
    title: "Lee County Community Prosperity Audit",
    slug: "lee-county-prosperity-audit",
    subtitle: "12-Category Scorecard Benchmark & Policy Blueprint",
    author: "Kathleen Rose, CCIM, CRE",
    publishedAt: "2026-05-15",
    coverImage: "/reports/rose_report_team.jpg",
    pdfUrl: "https://roseassociates.com/reports/lee-county.pdf",
    summary: "Deep dive evaluation of infrastructure, housing affordability, labor statistics, and municipal growth strategies for Lee County, NC.",
    featured: true,
    status: "published",
  },
  {
    id: "demo-3",
    title: "Southeast Commercial Real Estate Outlook Q2 2026",
    slug: "southeast-cre-outlook-q2-2026",
    subtitle: "Capital Allocation & Advisory Intelligence",
    author: "Rose Associates Research Team",
    publishedAt: "2026-04-10",
    coverImage: "/team/kathleen_rose.png",
    pdfUrl: "",
    summary: "Market research on commercial real estate yields, downtown revitalization tactics, and public-private economic partnerships.",
    featured: false,
    status: "published",
  },
]

interface PublishedReportsCardsSectionProps {
  embedded?: boolean
}

export function PublishedReportsCardsSection({ embedded = false }: PublishedReportsCardsSectionProps = {}) {
  const [reports, setReports] = React.useState<LandingReportItem[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const controller = new AbortController()
    async function fetchReports() {
      try {
        const data = await reportsApi.getReports("published", true, undefined, controller.signal, "report")
        if (!controller.signal.aborted) {
          if (Array.isArray(data)) {
            setReports(data)
          } else {
            setReports(DEMO_REPORTS)
          }
        }
      } catch (err: any) {
        if (!controller.signal.aborted) {
          console.warn("Using fallback demo reports:", err)
          setReports(DEMO_REPORTS)
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }
    fetchReports()
    return () => {
      controller.abort()
    }
  }, [])

  const content = (
    <div className={embedded ? "space-y-5 pt-8 border-t border-slate-200" : "space-y-6"}>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Published <span className="text-[#B5111B]">Reports</span>
          </h3>
          <p className="text-xs text-slate-500">
            Explore our latest real estate market audits and community scorecards.
          </p>
        </div>

        <Link
          href="/reports"
          className="text-xs font-semibold text-slate-600 hover:text-[#B5111B] transition-colors"
        >
          View All Reports
        </Link>
      </div>

      {/* Published Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {reports.slice(0, 3).map((report) => {
          const formattedDate = formatReportDate(report.publishedAt);
          const reportHref = `/report/${report.slug || report.id}`;
          const coverSrc = report.coverImage || "/reports/rose_community_hero.jpg";

          return (
            <Link
              key={report.id}
              href={reportHref}
              className="group relative block aspect-[16/10] min-h-[220px] w-full rounded-2xl overflow-hidden bg-slate-900 shadow-2xs hover:shadow-lg hover:shadow-[#B5111B]/20 transition-all duration-300 cursor-pointer select-none border border-slate-200"
            >
              {/* Base Image */}
              <img
                src={coverSrc}
                alt={report.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = "/reports/rose_community_hero.jpg";
                }}
              />

              {/* Resting State: Dark bottom gradient for high contrast & legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent transition-opacity duration-300 group-hover:opacity-0 pointer-events-none" />

              {/* Resting State Details (Inside the image card) */}
              <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 text-white transition-all duration-300 group-hover:opacity-0 group-hover:translate-y-1 pointer-events-none z-10">
                <h4 className="font-bold text-sm sm:text-base leading-snug line-clamp-2 tracking-tight text-white drop-shadow-sm">
                  {report.title}
                </h4>
                <p className="text-xs text-white/85 font-medium mt-1 drop-shadow-xs">
                  By {report.author || "Kathleen Rose, CCIM, CRE"} • {formattedDate}
                </p>
              </div>

              {/* Hover State: Deep-red overlay with Read Report link & arrow graphic */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#9B0A13] via-[#A80F1A]/90 to-[#A80F1A]/50 text-white p-4 sm:p-5 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 pointer-events-none">
                <h4 className="text-white font-bold text-base sm:text-lg tracking-tight leading-snug mb-1 line-clamp-2 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                  {report.title}
                </h4>

                <div className="text-[11.5px] text-rose-100/90 font-medium mb-3 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                  <span>By {report.author || "Kathleen Rose, CCIM, CRE"}</span>
                  <span className="mx-1">•</span>
                  <span>{formattedDate}</span>
                </div>

                <div className="flex items-center justify-between transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300 delay-100">
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-semibold text-white">
                    <span>Read Report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                  <div className="flex items-center text-white/40">
                    <div className="w-8 sm:w-12 h-[1px] bg-white/40" />
                    <ArrowRight className="w-3 h-3 -ml-0.5 text-white/50" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  )

  if (embedded) {
    return content
  }

  return (
    <section className="py-8 sm:py-12 bg-white text-slate-900 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {content}
      </div>
    </section>
  )
}
