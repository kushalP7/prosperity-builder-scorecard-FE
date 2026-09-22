"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { 
  FileText, 
  Download, 
  ArrowLeft, 
  Share2, 
  Loader2
} from "lucide-react"
import { LandingHeader } from "@/components/landing/LandingHeader"
import { LandingFooter } from "@/components/landing/LandingFooter"
import { reportsApi, LandingReportItem } from "@/lib/reports-api"

// Fallback demo dataset for Summer 2026 report matching roseassociates.com/rose-report-summer-2026/
const FALLBACK_SUMMER_REPORT: LandingReportItem = {
  id: "demo-summer-2026",
  title: "Rose Report - Summer 2026",
  slug: "rose-report-summer-2026",
  subtitle: "Strategic Real Estate & Economic Development Decision Audit",
  author: "Kathleen Rose, CCIM, CRE",
  publishedAt: "2026-07-01",
  coverImage: "/rose_community_hero.jpg",
  pdfUrl: "https://roseassociates.com/reports/summer-2026.pdf",
  summary: "Comprehensive analysis of municipal growth trends, land use optimization, and real estate market indicators across Southeast developments.",
  contentHtml: `
    <h2 class="text-2xl font-black text-slate-900 my-4">Executive Vision & Market Analysis</h2>
    <p class="text-slate-700 leading-relaxed mb-4">
      The Summer 2026 Rose Report provides municipal leaders, economic developers, and planning boards with clear quantitative policy directions. By bridging local demographic indicators with real estate market realities, we outline a 3-phase action roadmap for long-term community prosperity.
    </p>
    <blockquote class="p-4 border-l-4 border-[#B5111B] bg-red-50 text-slate-900 font-serif italic text-base my-6 rounded-r-xl">
      "No gimmicks, no redundant reports, and no guesswork about where to get the most value for the money you spend." — Kathleen Rose, CCIM, CRE
    </blockquote>
  `,
  featured: true,
  status: "published",
  blocks: [
    {
      id: "b-1",
      type: "stats_grid",
      title: "Key Performance Benchmarks",
      stats: [
        { label: "Prosperity Score", value: "74 / 100", subtext: "Lee County Benchmark" },
        { label: "Indicators Evaluated", value: "90+", subtext: "Demographic & Land Data" },
        { label: "Historic Preservation", value: "100 Score", subtext: "Sanford Case Study" },
      ]
    }
  ]
}

export default function ReportDetailPage() {
  const params = useParams()
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug

  const [report, setReport] = React.useState<LandingReportItem | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    async function loadReport() {
      if (!slug) return
      setLoading(true)
      try {
        const rawData: any = await reportsApi.getReportBySlug(slug)
        // Unwrap nested .data if returned by NestJS API wrapper response
        const fetchedReport = (rawData && rawData.data) ? rawData.data : rawData
        if (fetchedReport && (fetchedReport.title || fetchedReport.id)) {
          setReport(fetchedReport)
        } else {
          setReport(FALLBACK_SUMMER_REPORT)
        }
      } catch (err) {
        console.warn("Using fallback report for slug:", slug, err)
        setReport(FALLBACK_SUMMER_REPORT)
      } finally {
        setLoading(false)
      }
    }
    loadReport()
  }, [slug])

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center items-center text-slate-900">
        <Loader2 className="w-10 h-10 text-[#B5111B] animate-spin mb-3" />
        <p className="text-xs font-bold text-slate-500">Loading Report...</p>
      </div>
    )
  }

  if (!report || report.status === "draft") {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex flex-col">
        <LandingHeader />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 py-20">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <FileText className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            {report?.status === "draft" ? "Report Currently in Draft Mode" : "Report Not Found"}
          </h1>
          <p className="text-xs font-medium text-slate-500 max-w-md mx-auto">
            {report?.status === "draft" 
              ? "This report is currently a draft and has not been published to the public." 
              : "The requested report could not be found or has been removed."}
          </p>
          <Link href="/reports" className="px-5 py-2.5 bg-[#B5111B] text-white rounded-xl text-xs font-bold shadow-xs">
            Browse Published Reports
          </Link>
        </div>
        <LandingFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col">
      <LandingHeader />

      <main className="flex-1">
        
        {/* 1. HERO SHOWCASE BANNER SECTION (Matching authentic Rose Associates report page design) */}
        <section className="bg-slate-50/60 py-8 sm:py-12 border-b border-slate-200/80">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            
            {/* Back to Reports Link */}
            <div>
              <Link
                href="/reports"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#B5111B] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to All Reports</span>
              </Link>
            </div>

            {/* Split Red Title & Image Banner Card */}
            <div className="rounded-2xl overflow-hidden border border-slate-200/90 shadow-lg flex flex-col md:flex-row min-h-[320px] sm:min-h-[360px] bg-slate-900">
              {/* Left Side: Solid Dark Red Box with White Title */}
              <div className="w-full md:w-5/12 bg-[#B5111B] p-8 sm:p-10 flex flex-col justify-center text-white space-y-3 shrink-0">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
                  {report.title}
                </h1>

                {report.subtitle && (
                  <p className="text-sm sm:text-base font-bold text-white/90 leading-snug pt-1 border-t border-white/20">
                    {report.subtitle}
                  </p>
                )}
              </div>

              {/* Right Side: Cover Image */}
              <div className="w-full md:w-7/12 bg-slate-100 relative min-h-[240px] md:min-h-full">
                {report.coverImage ? (
                  <img 
                    src={report.coverImage} 
                    alt={report.title} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-slate-100 text-slate-400 text-xs font-bold text-center">
                    <FileText className="w-10 h-10 text-[#B5111B] mb-2" />
                    <span>Rose Associates Publication</span>
                  </div>
                )}
              </div>
            </div>

            {/* Sub-Banner Metadata & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 text-xs text-slate-600 font-medium">
              <div>
                <span>Published: <strong>{report.publishedAt ? new Date(report.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Recent"}</strong></span>
                {report.author && (
                  <>
                    <span className="mx-2">•</span>
                    <span>By <strong>{report.author}</strong></span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleShare}
                  className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-semibold flex items-center gap-1.5 transition-all text-xs cursor-pointer border border-slate-300 shadow-2xs"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copied ? "Link Copied!" : "Share"}</span>
                </button>

                {report.pdfUrl && (
                  <a
                    href={report.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-1.5 rounded-lg bg-[#B5111B] hover:bg-[#8F0D15] text-white font-bold flex items-center gap-2 transition-all text-xs shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </a>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* 2. MAIN REPORT BODY & DYNAMIC BLOCKS */}
        <section className="py-10 sm:py-14 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

            {/* Executive Summary Overview */}
            {report.summary && (
              <div className="border-l-4 border-[#B5111B] pl-5 py-1">
                <p className="text-lg text-slate-800 leading-relaxed font-medium">
                  {report.summary}
                </p>
              </div>
            )}

            {/* Quill Rich Text HTML Content */}
            {report.contentHtml && (
              <div 
                className="prose prose-lg max-w-none text-slate-800 leading-relaxed font-sans border-t border-slate-100 pt-6 overflow-x-hidden [&_*]:max-w-full [&_*]:box-border [&_p]:ml-0 [&_p]:mr-0 [&_div]:ml-0 [&_div]:mr-0 [&_p]:pl-0 [&_p]:pr-0 [&_div]:pl-0 [&_div]:pr-0 [&_p]:my-3 [&_p]:leading-relaxed [&_h1]:my-4 [&_h1]:text-3xl [&_h1]:font-black [&_h1]:text-[#B5111B] [&_h1]:tracking-tight [&_h2]:my-3 [&_h2]:text-2xl [&_h2]:font-black [&_h2]:text-[#B5111B] [&_h2]:tracking-tight [&_h3]:my-3 [&_h3]:text-xl [&_h3]:font-black [&_h3]:text-slate-900 [&_h3]:tracking-tight [&_blockquote]:my-4 [&_blockquote]:p-4 [&_blockquote]:border-l-4 [&_blockquote]:border-[#B5111B] [&_blockquote]:bg-red-50/60 [&_blockquote]:text-slate-900 [&_blockquote]:font-serif [&_blockquote]:italic [&_blockquote]:text-base [&_blockquote]:rounded-r-xl [&_img]:max-w-[28px] [&_img]:max-h-[28px] [&_img]:inline-block [&_img]:align-middle [&_img]:my-0.5 [&_img]:mx-1 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3 [&_li]:mb-1"
                dangerouslySetInnerHTML={{ __html: report.contentHtml }}
              />
            )}

            {/* Dynamic Section Blocks Render */}
            {(report.blocks || []).map((block) => (
              <div key={block.id} className="space-y-4 pt-4">
                {block.title && (
                  <div className="border-b border-slate-300 pb-2 mb-4">
                    <h2 className="text-xl sm:text-2xl font-black text-[#B5111B] uppercase tracking-tight">
                      {block.title}
                    </h2>
                  </div>
                )}

                {/* RICH TEXT BLOCK */}
                {block.type === "rich_text" && block.contentHtml && (
                  <div 
                    className="prose prose-lg max-w-none text-slate-800 leading-relaxed font-sans overflow-x-hidden [&_*]:max-w-full [&_*]:box-border [&_p]:ml-0 [&_p]:mr-0 [&_div]:ml-0 [&_div]:mr-0 [&_p]:pl-0 [&_p]:pr-0 [&_div]:pl-0 [&_div]:pr-0 [&_p]:my-3 [&_p]:leading-relaxed [&_h1]:my-4 [&_h1]:text-3xl [&_h1]:font-black [&_h1]:text-[#B5111B] [&_h1]:tracking-tight [&_h2]:my-3 [&_h2]:text-2xl [&_h2]:font-black [&_h2]:text-[#B5111B] [&_h2]:tracking-tight [&_h3]:my-3 [&_h3]:text-xl [&_h3]:font-black [&_h3]:text-slate-900 [&_h3]:tracking-tight [&_blockquote]:my-4 [&_blockquote]:p-4 [&_blockquote]:border-l-4 [&_blockquote]:border-[#B5111B] [&_blockquote]:bg-red-50/60 [&_blockquote]:text-slate-900 [&_blockquote]:font-serif [&_blockquote]:italic [&_blockquote]:text-base [&_blockquote]:rounded-r-xl [&_img]:max-w-[28px] [&_img]:max-h-[28px] [&_img]:inline-block [&_img]:align-middle [&_img]:my-0.5 [&_img]:mx-1 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3 [&_li]:mb-1"
                    dangerouslySetInnerHTML={{ __html: block.contentHtml }}
                  />
                )}

                {/* IMAGE + TEXT BLOCK (SIDE-BY-SIDE / EDITORIAL WRAP MULTI-ITEM) */}
                {block.type === "image_text" && (
                  <div className="space-y-8 pt-1">
                    {/* Items loop with fallback to legacy single item */}
                    {((block.items && block.items.length > 0)
                      ? block.items
                      : [{ imageUrl: block.imageUrl, contentHtml: block.contentHtml, imagePosition: block.imagePosition, layoutStyle: block.layoutStyle }]
                    ).map((item, itemIdx) => {
                      const layoutStyle = item.layoutStyle || block.layoutStyle || "wrap";
                      const isRight = item.imagePosition === "right";

                      if (layoutStyle === "stacked") {
                        return (
                          <div key={itemIdx} className="space-y-6">
                            {item.imageUrl && (
                              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/40 shadow-xs flex items-center justify-center p-1 max-w-4xl mx-auto">
                                <img 
                                  src={item.imageUrl} 
                                  alt={block.title || "Section Showcase"} 
                                  className="w-full h-auto max-h-[550px] object-cover rounded-xl" 
                                />
                              </div>
                            )}
                            {item.contentHtml && (
                              <div 
                                className="prose prose-lg max-w-none text-slate-800 leading-relaxed font-sans overflow-x-hidden [&_*]:max-w-full [&_*]:box-border [&_p]:ml-0 [&_p]:mr-0 [&_div]:ml-0 [&_div]:mr-0 [&_p]:pl-0 [&_p]:pr-0 [&_div]:pl-0 [&_div]:pr-0 [&_p]:my-3 [&_p]:leading-relaxed [&_h1]:my-4 [&_h1]:text-3xl [&_h1]:font-black [&_h1]:text-[#B5111B] [&_h1]:tracking-tight [&_h2]:my-3 [&_h2]:text-2xl [&_h2]:font-black [&_h2]:text-[#B5111B] [&_h2]:tracking-tight [&_h3]:my-3 [&_h3]:text-xl [&_h3]:font-black [&_h3]:text-slate-900 [&_h3]:tracking-tight [&_blockquote]:my-4 [&_blockquote]:p-4 [&_blockquote]:border-l-4 [&_blockquote]:border-[#B5111B] [&_blockquote]:bg-red-50/60 [&_blockquote]:text-slate-900 [&_blockquote]:font-serif [&_blockquote]:italic [&_blockquote]:text-base [&_blockquote]:rounded-r-xl [&_img]:max-w-[28px] [&_img]:max-h-[28px] [&_img]:inline-block [&_img]:align-middle [&_img]:my-0.5 [&_img]:mx-1 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3 [&_li]:mb-1"
                                dangerouslySetInnerHTML={{ __html: item.contentHtml }}
                              />
                            )}
                          </div>
                        );
                      }

                      if (layoutStyle === "columns") {
                        return (
                          <div key={itemIdx} className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                            {/* Image Column */}
                            <div className={`md:col-span-5 ${isRight ? "md:order-2" : "md:order-1"} md:sticky md:top-28 self-start`}>
                              {item.imageUrl ? (
                                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/40 shadow-xs flex items-center justify-center p-1">
                                  <img 
                                    src={item.imageUrl} 
                                    alt={block.title || "Section Showcase"} 
                                    className="w-full h-auto max-h-[750px] object-contain rounded-xl" 
                                  />
                                </div>
                              ) : (
                                <div className="w-full h-56 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-xs font-bold">
                                  No Image Provided
                                </div>
                              )}
                            </div>

                            {/* Content Column */}
                            <div className={`md:col-span-7 ${isRight ? "md:order-1" : "md:order-2"} space-y-4`}>
                              {item.contentHtml && (
                                <div 
                                  className="prose prose-lg max-w-none text-slate-800 leading-relaxed font-sans overflow-x-hidden [&_*]:max-w-full [&_*]:box-border [&_p]:ml-0 [&_p]:mr-0 [&_div]:ml-0 [&_div]:mr-0 [&_p]:pl-0 [&_p]:pr-0 [&_div]:pl-0 [&_div]:pr-0 [&_p]:my-3 [&_p]:leading-relaxed [&_h1]:my-4 [&_h1]:text-3xl [&_h1]:font-black [&_h1]:text-[#B5111B] [&_h1]:tracking-tight [&_h2]:my-3 [&_h2]:text-2xl [&_h2]:font-black [&_h2]:text-[#B5111B] [&_h2]:tracking-tight [&_h3]:my-3 [&_h3]:text-xl [&_h3]:font-black [&_h3]:text-slate-900 [&_h3]:tracking-tight [&_blockquote]:my-4 [&_blockquote]:p-4 [&_blockquote]:border-l-4 [&_blockquote]:border-[#B5111B] [&_blockquote]:bg-red-50/60 [&_blockquote]:text-slate-900 [&_blockquote]:font-serif [&_blockquote]:italic [&_blockquote]:text-base [&_blockquote]:rounded-r-xl [&_img]:max-w-[28px] [&_img]:max-h-[28px] [&_img]:inline-block [&_img]:align-middle [&_img]:my-0.5 [&_img]:mx-1 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3 [&_li]:mb-1"
                                  dangerouslySetInnerHTML={{ __html: item.contentHtml }}
                                />
                              )}
                            </div>
                          </div>
                        );
                      }

                      // Default: "wrap" (Editorial Magazine Flow - Prevents empty whitespace!)
                      return (
                        <div key={itemIdx} className="block flow-root clear-both">
                          {item.imageUrl && (
                            <div
                              className={`w-full md:w-[42%] max-w-[460px] mb-6 ${
                                isRight ? "md:float-right md:ml-8 md:mb-4" : "md:float-left md:mr-8 md:mb-4"
                              }`}
                            >
                              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/40 shadow-xs flex items-center justify-center p-1">
                                <img 
                                  src={item.imageUrl} 
                                  alt={block.title || "Section Showcase"} 
                                  className="w-full h-auto max-h-[600px] object-contain rounded-xl" 
                                />
                              </div>
                            </div>
                          )}

                          {item.contentHtml && (
                            <div 
                              className="prose prose-lg max-w-none text-slate-800 leading-relaxed font-sans break-words [&_*]:max-w-full [&_*]:box-border [&_p]:ml-0 [&_p]:mr-0 [&_div]:ml-0 [&_div]:mr-0 [&_p]:pl-0 [&_p]:pr-0 [&_div]:pl-0 [&_div]:pr-0 [&_p]:my-3 [&_p]:leading-relaxed [&_h1]:my-4 [&_h1]:text-3xl [&_h1]:font-black [&_h1]:text-[#B5111B] [&_h1]:tracking-tight [&_h2]:my-3 [&_h2]:text-2xl [&_h2]:font-black [&_h2]:text-[#B5111B] [&_h2]:tracking-tight [&_h3]:my-3 [&_h3]:text-xl [&_h3]:font-black [&_h3]:text-slate-900 [&_h3]:tracking-tight [&_blockquote]:my-4 [&_blockquote]:p-4 [&_blockquote]:border-l-4 [&_blockquote]:border-[#B5111B] [&_blockquote]:bg-red-50/60 [&_blockquote]:text-slate-900 [&_blockquote]:font-serif [&_blockquote]:italic [&_blockquote]:text-base [&_blockquote]:rounded-r-xl [&_img]:max-w-[28px] [&_img]:max-h-[28px] [&_img]:inline-block [&_img]:align-middle [&_img]:my-0.5 [&_img]:mx-1 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3 [&_li]:mb-1"
                              dangerouslySetInnerHTML={{ __html: item.contentHtml }}
                            />
                          )}
                          <div className="clear-both" />
                        </div>
                      );
                    })}

                    {/* Bottom Content below all images */}
                    {block.bottomContentHtml && (
                      <div className="pt-2">
                        <div 
                          className="prose prose-lg max-w-none text-slate-800 leading-relaxed font-sans overflow-x-hidden [&_*]:max-w-full [&_*]:box-border [&_p]:ml-0 [&_p]:mr-0 [&_div]:ml-0 [&_div]:mr-0 [&_p]:pl-0 [&_p]:pr-0 [&_div]:pl-0 [&_div]:pr-0 [&_p]:my-3 [&_p]:leading-relaxed [&_h1]:my-4 [&_h1]:text-3xl [&_h1]:font-black [&_h1]:text-[#B5111B] [&_h1]:tracking-tight [&_h2]:my-3 [&_h2]:text-2xl [&_h2]:font-black [&_h2]:text-[#B5111B] [&_h2]:tracking-tight [&_h3]:my-3 [&_h3]:text-xl [&_h3]:font-black [&_h3]:text-slate-900 [&_h3]:tracking-tight [&_blockquote]:my-4 [&_blockquote]:p-4 [&_blockquote]:border-l-4 [&_blockquote]:border-[#B5111B] [&_blockquote]:bg-red-50/60 [&_blockquote]:text-slate-900 [&_blockquote]:font-serif [&_blockquote]:italic [&_blockquote]:text-base [&_blockquote]:rounded-r-xl [&_img]:max-w-[28px] [&_img]:max-h-[28px] [&_img]:inline-block [&_img]:align-middle [&_img]:my-0.5 [&_img]:mx-1 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3 [&_li]:mb-1"
                          dangerouslySetInnerHTML={{ __html: block.bottomContentHtml }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* STATS GRID BLOCK */}
                {block.type === "stats_grid" && block.stats && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {block.stats.map((st, i) => (
                      <div key={i} className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-2 text-center shadow-md">
                        <div className="text-2xl sm:text-3xl font-black text-[#B5111B]">{st.value}</div>
                        <div className="text-xs font-bold text-slate-200">{st.label}</div>
                        {st.subtext && <div className="text-[10px] text-slate-400">{st.subtext}</div>}
                      </div>
                    ))}
                  </div>
                )}

                {/* PDF VIEWER BLOCK */}
                {block.type === "pdf_viewer" && block.pdfUrl && (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-lg bg-slate-900 text-white p-4 space-y-4">
                    <div className="flex justify-between items-center px-2">
                      <span className="text-xs font-bold flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#B5111B]" />
                        <span>Embedded Report Reader</span>
                      </span>
                      <a href={block.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#B5111B] underline">
                        Open in New Tab ↗
                      </a>
                    </div>
                    <iframe src={block.pdfUrl} className="w-full h-[600px] rounded-xl bg-white border-0" title="PDF Report Reader" />
                  </div>
                )}

                {/* GALLERY BLOCK */}
                {block.type === "gallery" && block.images && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {block.images.map((img, i) => (
                      <div key={i} className="rounded-xl overflow-hidden border border-slate-200">
                        <img src={img.url} alt={img.caption || "Report Showcase"} className="w-full h-56 object-cover" />
                        {img.caption && <p className="p-2 text-xs text-slate-600 bg-slate-50 text-center font-medium">{img.caption}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {/* DOWNLOADS BLOCK */}
                {block.type === "downloads" && block.files && (
                  <div className="space-y-2">
                    {block.files.map((f, i) => (
                      <a
                        key={i}
                        href={f.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 rounded-xl bg-slate-100 hover:bg-[#B5111B] hover:text-white transition-all border border-slate-200 flex items-center justify-between text-xs font-bold group"
                      >
                        <span className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#B5111B] group-hover:text-white" />
                          <span>{f.name}</span>
                        </span>
                        <Download className="w-4 h-4" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}

          </div>
        </section>

      </main>

      <LandingFooter />
    </div>
  )
}
