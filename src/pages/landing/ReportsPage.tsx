"use client"

import * as React from "react"
import { Link } from "@/lib/router-compat"
import {
  FileText,
  Loader2,
  ArrowLeft,
  ArrowRight
} from "lucide-react"
import { LandingHeader } from "@/components/landing/LandingHeader"
import { LandingFooter } from "@/components/landing/LandingFooter"
import { reportsApi, LandingReportItem } from "@/lib/reports-api"

// Fallback demo reports if DB is empty
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
    summary: "A comprehensive audit of municipal growth trends, land use optimization, and real estate market indicators across Southeast developments.",
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

export default function ReportsPage() {
  const [reports, setReports] = React.useState<LandingReportItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")

  React.useEffect(() => {
    const controller = new AbortController()
    async function load() {
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
          console.warn("Using fallback reports:", err)
          setReports(DEMO_REPORTS)
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }
    load()
    return () => {
      controller.abort()
    }
  }, [])

  const reportsList = Array.isArray(reports) ? reports : DEMO_REPORTS
  const filtered = reportsList.filter((r) =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.summary || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.subtitle || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col">
      <LandingHeader />

      <main className="flex-1 py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          {/* Header Banner */}
          <div className="space-y-3 border-b border-slate-200 pb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#B5111B] transition-colors mb-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Published <span className="text-[#B5111B]">Reports</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 font-medium whitespace-normal xl:whitespace-nowrap">
              Explore our complete library of real estate market audits, land development research, and economic advisory reports authored by Kathleen Rose, CCIM, CRE.
            </p>

            {/* LinkedIn Newsletter Subscribe Callout */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-red-50/60 via-slate-50 to-white border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0A66C2] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Never Miss an Edition of The Rose Report
                  </div>
                  <div className="text-[11.5px] text-slate-500">
                    Subscribe on LinkedIn for quarterly market audits and community prosperity perspectives.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <a
                  href="https://www.linkedin.com/build-relation/newsletter-follow?entityUrn=7482478285134729216"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0A66C2] hover:bg-[#084e96] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                  style={{ fontFamily: '"SF Pro Text", Helvetica, sans-serif' }}
                >
                  <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                  <span>Subscribe on LinkedIn</span>
                </a>
                <a
                  href="https://www.linkedin.com/newsletters/rose-report-7482478285134729216"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition"
                >
                  <svg className="w-3.5 h-3.5 fill-[#0A66C2] shrink-0" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                  <span>View Newsletter</span>
                </a>
              </div>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="py-16 text-center flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-[#B5111B] animate-spin" />
              <span className="text-xs font-bold text-slate-500">Loading reports...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="border border-slate-200 rounded-2xl p-12 text-center bg-slate-50 space-y-3">
              <FileText className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-600">No reports found matching your query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {filtered.map((report) => {
                const formattedDate = formatReportDate(report.publishedAt);
                const reportHref = `/report/${report.slug || report.id}`;
                const coverSrc = report.coverImage || "/reports/rose_community_hero.jpg";

                return (
                  <Link
                    key={report.id}
                    href={reportHref}
                    className="group relative block aspect-[16/10] min-h-[240px] w-full rounded-xl overflow-hidden bg-slate-900 shadow-xs hover:shadow-lg hover:shadow-[#B5111B]/20 transition-all duration-300 cursor-pointer select-none"
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
                      <h3 className="font-bold text-sm sm:text-base leading-snug line-clamp-2 tracking-tight text-white drop-shadow-sm">
                        {report.title}
                      </h3>
                      <p className="text-xs text-white/85 font-medium mt-1 drop-shadow-xs">
                        By {report.author || "Kathleen Rose, CCIM, CRE"} • {formattedDate}
                      </p>
                    </div>

                    {/* Hover State: Deep-red overlay with Read Report link & arrow graphic */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#9B0A13] via-[#A80F1A]/85 to-[#A80F1A]/40 text-white p-4 sm:p-5 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 pointer-events-none">
                      {/* Report Title */}
                      <h3 className="text-white font-bold text-base sm:text-lg tracking-tight leading-snug mb-1 line-clamp-2 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                        {report.title}
                      </h3>

                      {/* Metadata */}
                      <div className="text-[11.5px] text-rose-100/90 font-medium mb-3 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                        <span>By {report.author || "Kathleen Rose, CCIM, CRE"}</span>
                        <span className="mx-1">•</span>
                        <span>{formattedDate}</span>
                      </div>

                      {/* Read Report Link & Subtle right arrow graphic */}
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
          )}

        </div>
      </main>

      <LandingFooter />
    </div>
  )
}
