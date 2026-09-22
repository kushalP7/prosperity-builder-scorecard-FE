"use client"

import * as React from "react"
import Link from "next/link"
import { FileText, Download } from "lucide-react"
import { reportsApi, LandingReportItem } from "@/lib/reports-api"

// Fallback demo reports if DB is currently empty or connecting
const DEMO_REPORTS: LandingReportItem[] = [
  {
    id: "demo-1",
    title: "Rose Report - Summer 2026",
    slug: "rose-report-summer-2026",
    subtitle: "Strategic Real Estate & Economic Development Decision Audit",
    author: "Kathleen Rose, CCIM, CRE",
    publishedAt: "2026-07-01",
    coverImage: "/rose_community_hero.jpg",
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
    coverImage: "/rose_report_team.jpg",
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
    coverImage: "/kathleen_rose.png",
    pdfUrl: "",
    summary: "Market research on commercial real estate yields, downtown revitalization tactics, and public-private economic partnerships.",
    featured: false,
    status: "published",
  },
]

export function PublishedReportsCardsSection() {
  const [reports, setReports] = React.useState<LandingReportItem[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const controller = new AbortController()
    async function fetchReports() {
      try {
        const data = await reportsApi.getReports("published", true, undefined, controller.signal)
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

  return (
    <section className="py-8 sm:py-12 bg-white text-slate-900 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Published <span className="text-[#B5111B]">Reports</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Explore our latest real estate market audits and community scorecards.
            </p>
          </div>

          <Link
            href="/reports"
            className="inline-flex items-center text-xs font-extrabold text-[#B5111B] hover:text-[#8F0D15] underline decoration-[#B5111B]/40 hover:decoration-[#B5111B] underline-offset-4 shrink-0 transition-colors"
          >
            View All Reports
          </Link>
        </div>

        {/* Compact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.slice(0, 3).map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-xl border border-slate-200/90 overflow-hidden hover:border-[#B5111B]/50 transition-all duration-300 group flex flex-col justify-between"
            >
              {/* Cover Image Container */}
              <div className="relative h-40 bg-slate-100 overflow-hidden">
                {report.coverImage ? (
                  <img
                    src={report.coverImage}
                    alt={report.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = "/rose_community_hero.jpg"
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100 p-4 text-center">
                    <FileText className="w-8 h-8 text-[#B5111B]" />
                  </div>
                )}
              </div>

              {/* Card Details */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="text-[11px] text-slate-500 font-medium">
                    <span>By {report.author || "Kathleen Rose, CCIM, CRE"}</span>
                    {report.publishedAt && (
                      <>
                        <span className="mx-1.5">•</span>
                        <span>{new Date(report.publishedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                      </>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-[#B5111B] transition-colors leading-snug line-clamp-2">
                    {report.title}
                  </h3>

                  {report.summary && (
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 font-normal">
                      {report.summary}
                    </p>
                  )}
                </div>

                {/* Card Action Link */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/report/${report.slug}`}
                    className="text-xs font-bold text-[#B5111B] hover:text-[#8F0D15] transition-colors"
                  >
                    Read Full Report
                  </Link>

                  {report.pdfUrl && (
                    <a
                      href={report.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-[#B5111B] transition-all"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
