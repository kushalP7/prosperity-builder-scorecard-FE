"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Loader2, FileText, CheckCircle2, Eye, Sparkles } from "lucide-react"
import { reportsApi, LandingReportItem } from "@/lib/reports-api"
import { uploadAllPendingInPayload } from "@/lib/pending-uploads"
import { FileUploadDropzone } from "./FileUploadDropzone"
import { RichTextEditor } from "./RichTextEditor"
import { ReportBlockBuilder } from "./ReportBlockBuilder"

interface ReportFormProps {
  reportId?: string
}

export function ReportForm({ reportId }: ReportFormProps) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(!!reportId)
  const [isSaving, setIsSaving] = React.useState(false)
  const [uploadStatusText, setUploadStatusText] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const [formState, setFormState] = React.useState<Partial<LandingReportItem>>({
    title: "",
    slug: "",
    subtitle: "",
    author: "Kathleen Rose, CCIM, CRE",
    publishedAt: new Date().toISOString().split("T")[0],
    coverImage: "",
    pdfUrl: "",
    summary: "",
    contentHtml: "",
    featured: false,
    status: "published",
    blocks: [],
  })

  React.useEffect(() => {
    async function loadReport() {
      if (!reportId) return
      setLoading(true)
      try {
        const report = await reportsApi.getReportById(reportId)
        if (report) {
          setFormState({
            title: report.title,
            slug: report.slug,
            subtitle: report.subtitle || "",
            author: report.author || "Kathleen Rose, CCIM, CRE",
            publishedAt: report.publishedAt ? new Date(report.publishedAt).toISOString().split("T")[0] : "",
            coverImage: report.coverImage || "",
            pdfUrl: report.pdfUrl || "",
            summary: report.summary || "",
            contentHtml: report.contentHtml || "",
            featured: report.featured || false,
            status: report.status || "published",
            blocks: report.blocks || [],
          })
        }
      } catch (err: any) {
        console.error("Failed to load report:", err)
        setError("Report not found or server offline.")
      } finally {
        setLoading(false)
      }
    }
    loadReport()
  }, [reportId])

  const handleSave = async (e?: React.FormEvent, forceStatus?: "published" | "draft") => {
    if (e) e.preventDefault()
    if (!formState.title) {
      alert("Please provide a report title.")
      return
    }

    setIsSaving(true)
    setError(null)
    setUploadStatusText("Checking staged media...")

    const finalStatus = forceStatus || formState.status || "published"
    const rawPayload = {
      ...formState,
      status: finalStatus,
    }

    try {
      // Defer-upload all staged pending files (cover image, PDF, block media) to Cloudinary
      const cleanPayload = await uploadAllPendingInPayload(rawPayload, (msg) => {
        setUploadStatusText(msg)
      })

      setUploadStatusText("Saving report to database...")
      if (reportId) {
        await reportsApi.updateReport(reportId, cleanPayload)
      } else {
        await reportsApi.createReport(cleanPayload)
      }
      router.push("/landing-cms")
    } catch (err: any) {
      console.error("Save error:", err)
      setError(`Save failed: ${err.message}`)
    } finally {
      setIsSaving(false)
      setUploadStatusText(null)
    }
  }

  if (loading) {
    return (
      <div className="p-16 text-center flex flex-col items-center gap-3">
        <Loader2 className="w-10 h-10 text-[#B5111B] animate-spin" />
        <span className="text-xs font-bold text-slate-600">Loading Report Details...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8 w-full pb-20">
      {/* Sticky Header Bar */}
      <div className="sticky -top-4 sm:-top-6 z-30 bg-white border-b border-slate-200 py-3 sm:py-4 px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 mb-6 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/landing-cms"
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors border border-slate-200 shrink-0"
            title="Back to Landing CMS"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex flex-col min-w-0">
            <h1 className="text-sm sm:text-lg font-black text-slate-900 truncate">
              {reportId ? `Edit Report: ${formState.title || "Untitled"}` : "Create New Dynamic Report"}
            </h1>
            <span className="hidden md:inline-block text-[11px] text-slate-500 font-medium truncate">
              Configure cover images, PDF downloads, rich text content, and dynamic section blocks
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end shrink-0">
          {formState.slug && (
            <Link
              href={`/report/${formState.slug}`}
              target="_blank"
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4 text-[#B5111B]" />
              <span className="hidden xs:inline sm:inline">Preview</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => handleSave(undefined, "draft")}
            disabled={isSaving}
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all disabled:opacity-50"
          >
            <span className="hidden xs:inline">Save </span>Draft
          </button>

          <button
            type="button"
            onClick={(e) => handleSave(e, "published")}
            disabled={isSaving}
            className="px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl bg-[#B5111B] hover:bg-[#8F0D15] text-white text-xs font-extrabold shadow-md flex items-center gap-1.5 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{uploadStatusText || (reportId ? "Update Report" : "Publish Report")}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-700">
          {error}
        </div>
      )}

      {/* Main Form Fields */}
      <form onSubmit={(e) => handleSave(e)} className="space-y-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        
        {/* Section 1: Basic Information */}
        <div className="space-y-4">
          <h2 className="text-sm font-black text-[#B5111B] border-b border-slate-100 pb-2">
            1. Basic Report Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Report Title *
              </label>
              <input
                type="text"
                required
                value={formState.title || ""}
                onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                placeholder="e.g. Rose Report - Summer 2026"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#B5111B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                URL Slug (Auto-generated if blank)
              </label>
              <input
                type="text"
                value={formState.slug || ""}
                onChange={(e) => setFormState({ ...formState, slug: e.target.value })}
                placeholder="e.g. rose-report-summer-2026"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-[#B5111B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Subtitle / Tagline
              </label>
              <input
                type="text"
                value={formState.subtitle || ""}
                onChange={(e) => setFormState({ ...formState, subtitle: e.target.value })}
                placeholder="e.g. Strategic Real Estate & Economic Development Audit"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#B5111B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Author Name
              </label>
              <input
                type="text"
                value={formState.author || ""}
                onChange={(e) => setFormState({ ...formState, author: e.target.value })}
                placeholder="Kathleen Rose, CCIM, CRE"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#B5111B]"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-800">Status:</label>
              <select
                value={formState.status || "published"}
                onChange={(e) => setFormState({ ...formState, status: e.target.value as any })}
                className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 bg-white"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured-full"
                checked={formState.featured || false}
                onChange={(e) => setFormState({ ...formState, featured: e.target.checked })}
                className="w-4 h-4 text-[#B5111B] rounded-xs cursor-pointer"
              />
              <label htmlFor="featured-full" className="text-xs font-bold text-slate-800 cursor-pointer">
                Feature on Main Landing Page
              </label>
            </div>
          </div>
        </div>

        {/* Section 2: Media & Files Uploaders */}
        <div className="space-y-4">
          <h2 className="text-sm font-black text-[#B5111B] border-b border-slate-100 pb-2">
            2. Media Assets
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FileUploadDropzone
              acceptType="image"
              value={formState.coverImage || ""}
              onChange={(url) => setFormState({ ...formState, coverImage: url })}
              label="Banner Cover Image"
              helperText="Upload cover image to Rose/Reports folder"
              folder="reports"
            />

            <FileUploadDropzone
              acceptType="document"
              value={formState.pdfUrl || ""}
              onChange={(url) => setFormState({ ...formState, pdfUrl: url })}
              label="Downloadable Report PDF"
              helperText="Upload full PDF document to Rose/Reports folder"
              folder="reports"
            />
          </div>
        </div>

        {/* Section 3: Summary Excerpt */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800 mb-1">
            3. Executive Summary Excerpt
          </label>
          <textarea
            rows={3}
            value={formState.summary || ""}
            onChange={(e) => setFormState({ ...formState, summary: e.target.value })}
            placeholder="Brief summary card teaser text..."
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#B5111B]"
          />
        </div>

        {/* Section 4: Rich Text Body Editor */}
        <div className="space-y-2">
          <h2 className="text-sm font-black text-[#B5111B] border-b border-slate-100 pb-2">
            4. Article Content (Quill / Rich Text Editor)
          </h2>
          <RichTextEditor
            value={formState.contentHtml || ""}
            onChange={(html) => setFormState({ ...formState, contentHtml: html })}
            label=""
          />
        </div>

        {/* Section 5: Dynamic Section Block Builder */}
        <div className="space-y-2">
          <h2 className="text-sm font-black text-[#B5111B] border-b border-slate-100 pb-2">
            5. Dynamic Section Blocks (Re-orderable)
          </h2>
          <ReportBlockBuilder
            blocks={formState.blocks || []}
            onChange={(blocks) => setFormState({ ...formState, blocks })}
          />
        </div>

        {/* Submit Footer */}
        <div className="pt-6 border-t border-slate-200 flex justify-end gap-3">
          <Link
            href="/landing-cms"
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-2.5 rounded-xl text-xs font-extrabold text-white bg-[#B5111B] hover:bg-[#8F0D15] shadow-md flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{uploadStatusText || (reportId ? "Update & Save Report" : "Publish Report")}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
