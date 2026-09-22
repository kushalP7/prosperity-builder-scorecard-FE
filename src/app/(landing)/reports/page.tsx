"use client"

import * as React from "react"
import Link from "next/link"
import { 
  FileText, 
  Download, 
  Loader2,
  ArrowLeft
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
    coverImage: "/rose_community_hero.jpg",
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

export default function ReportsPage() {
  const [reports, setReports] = React.useState<LandingReportItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")

  React.useEffect(() => {
    const controller = new AbortController()
    async function load() {
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((report) => (
                <div
                  key={report.id}
                  className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md hover:border-[#B5111B]/60 transition-all duration-300 group flex flex-col justify-between"
                >
                  <div className="relative h-44 bg-slate-100 overflow-hidden">
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
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 p-4 text-center">
                        <FileText className="w-8 h-8 text-[#B5111B]" />
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
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

                      <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#B5111B] transition-colors leading-snug">
                        {report.title}
                      </h3>

                      {report.subtitle && (
                        <p className="text-xs font-semibold text-slate-600">
                          {report.subtitle}
                        </p>
                      )}

                      {report.summary && (
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 font-normal">
                          {report.summary}
                        </p>
                      )}
                    </div>

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
          )}

        </div>
      </main>

      <LandingFooter />
    </div>
  )
}
