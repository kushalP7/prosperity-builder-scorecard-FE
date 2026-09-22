"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  FileText, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  Star, 
  Loader2, 
  Film, 
  FolderOpen, 
  Mic, 
  ExternalLink,
  LayoutGrid,
  List,
  Calendar,
  User,
  ArrowUpDown,
  X,
  Play,
  Share2,
  Check,
  Send,
  Headphones,
  MapPin,
  Upload
} from "lucide-react"
import { reportsApi, LandingReportItem } from "@/lib/reports-api"
import { mediaApi, LandingMediaItem, getYouTubeThumbnail } from "@/lib/media-api"
import { projectsApi, LandingProjectItem, PORTFOLIO_CATEGORIES } from "@/lib/projects-api"
import { Dropdown } from "@/components/ui/dropdown"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"

export default function LandingCMSPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = React.useState<"reports" | "media" | "projects">("reports")

  // Confirm Delete Dialog State
  const [deleteTarget, setDeleteTarget] = React.useState<{
    id: string
    title: string
    type: "project" | "report" | "media"
  } | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)
  
  // Data state
  const [reports, setReports] = React.useState<LandingReportItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [mediaItems, setMediaItems] = React.useState<LandingMediaItem[]>([])
  const [mediaLoading, setMediaLoading] = React.useState(false)

  // Reports Filters & Controls
  const [reportViewMode, setReportViewMode] = React.useState<"grid" | "list">("grid")
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [reportYearFilter, setReportYearFilter] = React.useState<string>("all")
  const [reportFeaturedOnly, setReportFeaturedOnly] = React.useState<boolean>(false)
  const [reportSortBy, setReportSortBy] = React.useState<"newest" | "oldest" | "title_asc" | "title_desc">("newest")

  // Media Sphere Filters & Controls
  const [mediaViewMode, setMediaViewMode] = React.useState<"grid" | "list">("grid")
  const [mediaSearch, setMediaSearch] = React.useState("")
  const [mediaTypeFilter, setMediaTypeFilter] = React.useState<"all" | "video" | "audio" | "document">("all")
  const [mediaStatusFilter, setMediaStatusFilter] = React.useState<string>("all")
  const [mediaYearFilter, setMediaYearFilter] = React.useState<string>("all")
  const [mediaFeaturedOnly, setMediaFeaturedOnly] = React.useState<boolean>(false)
  const [mediaSortBy, setMediaSortBy] = React.useState<"newest" | "oldest" | "title_asc" | "title_desc">("newest")

  // Featured Projects Data & Controls
  const [projects, setProjects] = React.useState<LandingProjectItem[]>([])
  const [projectsLoading, setProjectsLoading] = React.useState(false)
  const [projectsSearch, setProjectsSearch] = React.useState("")
  const [projectsCategoryFilter, setProjectsCategoryFilter] = React.useState<string>("all")
  const [projectsStatusFilter, setProjectsStatusFilter] = React.useState<string>("all")
  const [projectsFeaturedOnly, setProjectsFeaturedOnly] = React.useState<boolean>(false)

  // Project Add/Edit Modal State
  const [projectModalOpen, setProjectModalOpen] = React.useState(false)
  const [editingProject, setEditingProject] = React.useState<LandingProjectItem | null>(null)
  const [uploadingPdf, setUploadingPdf] = React.useState(false)
  const [stagedPdfFile, setStagedPdfFile] = React.useState<File | null>(null)
  const [stagedPdfPreviewUrl, setStagedPdfPreviewUrl] = React.useState<string | null>(null)
  const [projectFormData, setProjectFormData] = React.useState({
    title: "",
    category: PORTFOLIO_CATEGORIES[0] as string,
    studyType: "",
    latitude: 35.785,
    longitude: -80.888,
    pdfUrl: "",
    featured: true,
    status: "published" as "published" | "draft",
  })

  // Sync tab with URL
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const tab = params.get("tab")
      if (tab === "media" || tab === "reports" || tab === "projects") {
        setActiveTab(tab)
      }
    }
  }, [])

  const handleTabChange = (tab: "reports" | "media" | "projects") => {
    setActiveTab(tab)
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `/landing-cms?tab=${tab}`)
    }
  }

  // Load Data
  const loadReports = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await reportsApi.getReports()
      setReports(Array.isArray(data) ? data : [])
    } catch (err: any) {
      console.error("Failed to fetch reports:", err)
      setError("Failed to connect to backend server. Make sure NestJS backend is running.")
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMedia = React.useCallback(async () => {
    setMediaLoading(true)
    try {
      const items = await mediaApi.getMedia()
      setMediaItems(Array.isArray(items) ? items : [])
    } catch (err: any) {
      console.error("Failed to fetch media:", err)
    } finally {
      setMediaLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadReports()
  }, [loadReports])

  React.useEffect(() => {
    if (activeTab === "media") {
      loadMedia()
    }
  }, [activeTab, loadMedia])

  const loadProjects = React.useCallback(async () => {
    setProjectsLoading(true)
    try {
      const items = await projectsApi.getProjects()
      setProjects(Array.isArray(items) ? items : [])
    } catch (err: any) {
      console.error("Failed to fetch projects:", err)
    } finally {
      setProjectsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    if (activeTab === "projects") {
      loadProjects()
    }
  }, [activeTab, loadProjects])

  const cleanupStagedPdf = () => {
    if (stagedPdfPreviewUrl?.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(stagedPdfPreviewUrl)
      } catch {}
    }
    setStagedPdfFile(null)
    setStagedPdfPreviewUrl(null)
  }

  const closeProjectModal = () => {
    cleanupStagedPdf()
    setProjectModalOpen(false)
  }

  const openCreateProjectModal = () => {
    cleanupStagedPdf()
    setEditingProject(null)
    setProjectFormData({
      title: "",
      category: PORTFOLIO_CATEGORIES[0],
      studyType: "",
      latitude: 35.785,
      longitude: -80.888,
      pdfUrl: "",
      featured: true,
      status: "published",
    })
    setProjectModalOpen(true)
  }

  const openEditProjectModal = (proj: LandingProjectItem) => {
    cleanupStagedPdf()
    setEditingProject(proj)
    setProjectFormData({
      title: proj.title,
      category: proj.category,
      studyType: proj.studyType,
      latitude: proj.latitude,
      longitude: proj.longitude,
      pdfUrl: proj.pdfUrl,
      featured: proj.featured ?? true,
      status: proj.status,
    })
    setProjectModalOpen(true)
  }

  const handleDeleteProject = (proj: LandingProjectItem) => {
    setDeleteTarget({
      id: proj.id,
      title: proj.title,
      type: "project",
    })
  }

  const handleToggleProjectStatus = async (proj: LandingProjectItem) => {
    const newStatus = proj.status === "published" ? "draft" : "published"
    try {
      await projectsApi.updateProject(proj.id, { status: newStatus })
      loadProjects()
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`)
    }
  }

  const handleToggleProjectFeatured = async (proj: LandingProjectItem) => {
    try {
      await projectsApi.updateProject(proj.id, { featured: !proj.featured })
      loadProjects()
    } catch (err: any) {
      alert(`Featured update failed: ${err.message}`)
    }
  }

  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      alert("Please select a valid PDF file.")
      return
    }

    // Revoke previous blob URL if any
    if (stagedPdfPreviewUrl?.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(stagedPdfPreviewUrl)
      } catch {}
    }

    // Stage file locally via blob URL for instant preview without touching Cloudinary
    const previewUrl = URL.createObjectURL(file)
    setStagedPdfFile(file)
    setStagedPdfPreviewUrl(previewUrl)
    setProjectFormData((prev) => ({ ...prev, pdfUrl: previewUrl }))
  }

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectFormData.title || !projectFormData.studyType || !projectFormData.pdfUrl) {
      alert("Please fill in all required fields (Location, Study Type, and PDF URL).")
      return
    }

    let finalPdfUrl = projectFormData.pdfUrl

    // If a PDF file was staged locally, upload it now upon form submit
    if (stagedPdfFile && projectFormData.pdfUrl === stagedPdfPreviewUrl) {
      setUploadingPdf(true)
      try {
        const res = await projectsApi.uploadPdf(stagedPdfFile)
        if (!res?.url) throw new Error("No URL returned from upload")
        finalPdfUrl = res.url
        // Revoke temporary preview blob
        if (stagedPdfPreviewUrl) {
          try {
            URL.revokeObjectURL(stagedPdfPreviewUrl)
          } catch {}
        }
        setStagedPdfFile(null)
        setStagedPdfPreviewUrl(null)
      } catch (err: any) {
        setUploadingPdf(false)
        alert(`PDF upload failed: ${err.message}`)
        return
      } finally {
        setUploadingPdf(false)
      }
    }

    const payload = { ...projectFormData, pdfUrl: finalPdfUrl }

    try {
      if (editingProject) {
        await projectsApi.updateProject(editingProject.id, payload)
      } else {
        await projectsApi.createProject(payload)
      }
      setProjectModalOpen(false)
      loadProjects()
    } catch (err: any) {
      alert(`Save failed: ${err.message}`)
    }
  }

  // Filtered Projects
  const filteredProjects = React.useMemo(() => {
    return (Array.isArray(projects) ? projects : []).filter((p) => {
      const term = projectsSearch.trim().toLowerCase()
      const matchesSearch =
        !term ||
        p.title.toLowerCase().includes(term) ||
        p.studyType.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)

      const matchesCat =
        projectsCategoryFilter === "all" || p.category === projectsCategoryFilter
      const matchesStatus =
        projectsStatusFilter === "all" || p.status === projectsStatusFilter
      const matchesFeatured = !projectsFeaturedOnly || !!p.featured

      return matchesSearch && matchesCat && matchesStatus && matchesFeatured
    })
  }, [projects, projectsSearch, projectsCategoryFilter, projectsStatusFilter, projectsFeaturedOnly])

  // Delete Actions
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      if (deleteTarget.type === "project") {
        await projectsApi.deleteProject(deleteTarget.id)
        loadProjects()
      } else if (deleteTarget.type === "report") {
        await reportsApi.deleteReport(deleteTarget.id)
        loadReports()
      } else if (deleteTarget.type === "media") {
        await mediaApi.deleteMedia(deleteTarget.id)
        loadMedia()
      }
      setDeleteTarget(null)
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDelete = (report: LandingReportItem) => {
    setDeleteTarget({
      id: report.id,
      title: report.title,
      type: "report",
    })
  }

  const handleToggleStatus = async (report: LandingReportItem) => {
    const newStatus = report.status === "published" ? "draft" : "published"
    try {
      await reportsApi.updateReport(report.id, { status: newStatus })
      loadReports()
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`)
    }
  }

  const handleDeleteMedia = (item: LandingMediaItem) => {
    setDeleteTarget({
      id: item.id,
      title: item.title || "Untitled",
      type: "media",
    })
  }

  const handleToggleMediaStatus = async (item: LandingMediaItem) => {
    const newStatus = item.status === "published" ? "draft" : "published"
    try {
      await mediaApi.updateMedia(item.id, { status: newStatus })
      loadMedia()
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`)
    }
  }

  const handleToggleMediaFeatured = async (item: LandingMediaItem) => {
    try {
      await mediaApi.updateMedia(item.id, { featured: !item.featured })
      loadMedia()
    } catch (err: any) {
      alert(`Featured update failed: ${err.message}`)
    }
  }

  const [copiedMediaId, setCopiedMediaId] = React.useState<string | null>(null)

  const handleShareMedia = (item: LandingMediaItem, e: React.MouseEvent) => {
    e.stopPropagation()
    const shareUrl = item.sourceUrl || (typeof window !== "undefined" ? `${window.location.origin}/videos` : "")
    if (navigator.clipboard && shareUrl) {
      navigator.clipboard.writeText(shareUrl)
      setCopiedMediaId(item.id)
      setTimeout(() => setCopiedMediaId(null), 2000)
    }
  }

  const formatMediaDate = (dateString?: string): string => {
    if (!dateString) return ""
    try {
      const d = new Date(dateString)
      if (isNaN(d.getTime())) return ""
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric"
      })
    } catch (e) {
      return ""
    }
  }


  // Dynamic Year Extraction
  const reportYears = React.useMemo(() => {
    const years = new Set<string>()
    ;(reports || []).forEach((r) => {
      const d = r.publishedAt || r.createdAt
      if (d) {
        const yr = new Date(d).getFullYear()
        if (!isNaN(yr)) years.add(String(yr))
      }
    })
    return Array.from(years).sort((a, b) => b.localeCompare(a))
  }, [reports])

  const mediaYears = React.useMemo(() => {
    const years = new Set<string>()
    ;(mediaItems || []).forEach((m) => {
      const d = m.createdAt || m.updatedAt
      if (d) {
        const yr = new Date(d).getFullYear()
        if (!isNaN(yr)) years.add(String(yr))
      }
    })
    return Array.from(years).sort((a, b) => b.localeCompare(a))
  }, [mediaItems])

  // Filtered & Sorted Reports
  const filteredReports = React.useMemo(() => {
    const list = (Array.isArray(reports) ? [...reports] : []).filter((r) => {
      const term = searchTerm.trim().toLowerCase()
      const matchesSearch =
        !term ||
        r.title.toLowerCase().includes(term) ||
        (r.summary || "").toLowerCase().includes(term) ||
        (r.author || "").toLowerCase().includes(term)

      const matchesStatus = statusFilter === "all" || r.status === statusFilter
      const matchesFeatured = !reportFeaturedOnly || !!r.featured

      let matchesYear = true
      if (reportYearFilter !== "all") {
        const d = r.publishedAt || r.createdAt
        if (d) {
          matchesYear = String(new Date(d).getFullYear()) === reportYearFilter
        } else {
          matchesYear = false
        }
      }

      return matchesSearch && matchesStatus && matchesFeatured && matchesYear
    })

    list.sort((a, b) => {
      if (reportSortBy === "newest") {
        const da = new Date(a.publishedAt || a.createdAt || 0).getTime()
        const db = new Date(b.publishedAt || b.createdAt || 0).getTime()
        return db - da
      }
      if (reportSortBy === "oldest") {
        const da = new Date(a.publishedAt || a.createdAt || 0).getTime()
        const db = new Date(b.publishedAt || b.createdAt || 0).getTime()
        return da - db
      }
      if (reportSortBy === "title_asc") {
        return a.title.localeCompare(b.title)
      }
      if (reportSortBy === "title_desc") {
        return b.title.localeCompare(a.title)
      }
      return 0
    })

    return list
  }, [reports, searchTerm, statusFilter, reportYearFilter, reportFeaturedOnly, reportSortBy])

  // Filtered & Sorted Media
  const filteredMedia = React.useMemo(() => {
    const list = (Array.isArray(mediaItems) ? [...mediaItems] : []).filter((m) => {
      const term = mediaSearch.trim().toLowerCase()
      const matchesSearch =
        !term ||
        m.title.toLowerCase().includes(term) ||
        (m.category || "").toLowerCase().includes(term)

      const matchesType = mediaTypeFilter === "all" || m.mediaType === mediaTypeFilter
      const matchesStatus = mediaStatusFilter === "all" || m.status === mediaStatusFilter
      const matchesFeatured = !mediaFeaturedOnly || !!m.featured

      let matchesYear = true
      if (mediaYearFilter !== "all") {
        const d = m.createdAt || m.updatedAt
        if (d) {
          matchesYear = String(new Date(d).getFullYear()) === mediaYearFilter
        } else {
          matchesYear = false
        }
      }

      return matchesSearch && matchesType && matchesStatus && matchesFeatured && matchesYear
    })

    list.sort((a, b) => {
      if (mediaSortBy === "newest") {
        const da = new Date(a.createdAt || 0).getTime()
        const db = new Date(b.createdAt || 0).getTime()
        return db - da
      }
      if (mediaSortBy === "oldest") {
        const da = new Date(a.createdAt || 0).getTime()
        const db = new Date(b.createdAt || 0).getTime()
        return da - db
      }
      if (mediaSortBy === "title_asc") {
        return a.title.localeCompare(b.title)
      }
      if (mediaSortBy === "title_desc") {
        return b.title.localeCompare(a.title)
      }
      return 0
    })

    return list
  }, [mediaItems, mediaSearch, mediaTypeFilter, mediaStatusFilter, mediaYearFilter, mediaFeaturedOnly, mediaSortBy])

  return (
    <div className="space-y-6">
      {/* STICKY TOP CONTROLS (Capsule Tabs + Unified Advanced Filter Bar) */}
      <div className="sticky -top-4 sm:-top-6 z-40 bg-[#F4F4F5] -mt-4 sm:-mt-6 -mx-4 sm:-mx-6 px-4 sm:px-6 pt-4 sm:pt-6 pb-2 space-y-4">
        {/* High-Contrast Segmented Capsule Tabs Track (Matching Section Maker) */}
        <div className="bg-slate-200/90 p-1.5 sm:p-2 rounded-2xl border border-slate-300/80 shadow-inner flex items-center gap-1.5 max-w-full overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => handleTabChange("reports")}
            className={`px-3.5 py-2 text-xs md:text-sm font-semibold transition-all duration-200 rounded-xl cursor-pointer select-none flex items-center gap-2 shrink-0 ${
              activeTab === "reports"
                ? "bg-[#B5111B] text-white shadow-md shadow-red-900/30 scale-[1.02] font-bold border border-[#B5111B]"
                : "bg-slate-100 text-slate-800 hover:bg-white hover:text-slate-950 border border-slate-300/90 shadow-xs hover:shadow-sm active:scale-95"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Reports Module</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("media")}
            className={`px-3.5 py-2 text-xs md:text-sm font-semibold transition-all duration-200 rounded-xl cursor-pointer select-none flex items-center gap-2 shrink-0 ${
              activeTab === "media"
                ? "bg-[#B5111B] text-white shadow-md shadow-red-900/30 scale-[1.02] font-bold border border-[#B5111B]"
                : "bg-slate-100 text-slate-800 hover:bg-white hover:text-slate-950 border border-slate-300/90 shadow-xs hover:shadow-sm active:scale-95"
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Media Sphere</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("projects")}
            className={`px-3.5 py-2 text-xs md:text-sm font-semibold transition-all duration-200 rounded-xl cursor-pointer select-none flex items-center gap-2 shrink-0 ${
              activeTab === "projects"
                ? "bg-[#B5111B] text-white shadow-md shadow-red-900/30 scale-[1.02] font-bold border border-[#B5111B]"
                : "bg-slate-100 text-slate-800 hover:bg-white hover:text-slate-950 border border-slate-300/90 shadow-xs hover:shadow-sm active:scale-95"
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>Featured Projects</span>
          </button>
        </div>

        {/* REPORTS MODULE FILTER & TOOLBAR */}
        {activeTab === "reports" && (
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            {/* Top Row: Search Input + View Mode Toggle + Create Action */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {/* Search Input */}
              <div className="relative flex-1 min-w-0">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search reports by title, summary or author..."
                  className="w-full pl-10 pr-9 py-2 sm:py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/90 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#B5111B] focus:ring-1 focus:ring-[#B5111B]/20 transition"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* View Switcher & Action Button */}
              <div className="flex items-center gap-2 justify-between sm:justify-end shrink-0">
                <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200/80 shrink-0">
                  <button
                    type="button"
                    onClick={() => setReportViewMode("grid")}
                    className={`p-1.5 rounded-lg transition cursor-pointer ${
                      reportViewMode === "grid"
                        ? "bg-[#B5111B] text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportViewMode("list")}
                    className={`p-1.5 rounded-lg transition cursor-pointer ${
                      reportViewMode === "list"
                        ? "bg-[#B5111B] text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                <Link
                  href="/landing-cms/reports/create"
                  className="bg-[#B5111B] hover:bg-[#8F0D15] text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 sm:gap-2 shadow-xs transition-all hover:scale-102 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span className="whitespace-nowrap"><span className="hidden sm:inline">Create </span>New Report</span>
                </Link>
              </div>
            </div>

            {/* Bottom Row: Filter Dropdowns & Controls */}
            <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100">
              {/* Status Dropdown with Colored Indicator */}
              <Dropdown
                value={statusFilter}
                onChange={setStatusFilter}
                title="FILTER BY STATUS:"
                options={[
                  { value: "all", label: "All Statuses" },
                  { value: "published", label: "Published" },
                  { value: "draft", label: "Draft" },
                ]}
              />

              {/* Year Dropdown */}
              <Dropdown
                value={reportYearFilter}
                onChange={setReportYearFilter}
                title="FILTER BY YEAR:"
                icon={<Calendar className="w-3.5 h-3.5" />}
                options={[
                  { value: "all", label: "All Years" },
                  ...reportYears.map((yr) => ({ value: yr, label: yr })),
                ]}
              />

              {/* Featured Toggle Button */}
              <button
                type="button"
                onClick={() => setReportFeaturedOnly(!reportFeaturedOnly)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer select-none shrink-0 ${
                  reportFeaturedOnly
                    ? "bg-amber-50 border-amber-300 text-amber-900 shadow-2xs font-extrabold"
                    : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                }`}
              >
                <Star
                  className={`w-3.5 h-3.5 ${
                    reportFeaturedOnly ? "text-amber-500 fill-amber-400" : "text-slate-400"
                  }`}
                />
                <span>Featured</span>
              </button>

              {/* Sort By Dropdown - Aligned right on laptop/desktop */}
              <Dropdown
                value={reportSortBy}
                onChange={(val) => setReportSortBy(val as any)}
                title="SORT REPORTS:"
                icon={<ArrowUpDown className="w-3.5 h-3.5" />}
                options={[
                  { value: "newest", label: "Sort by: Newest" },
                  { value: "oldest", label: "Sort by: Oldest" },
                  { value: "title_asc", label: "Sort by: Title (A-Z)" },
                  { value: "title_desc", label: "Sort by: Title (Z-A)" },
                ]}
                className="sm:ml-auto"
              />
            </div>
          </div>
        )}

        {/* MEDIA SPHERE FILTER & TOOLBAR */}
        {activeTab === "media" && (
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            {/* Top Row: Search Input + View Mode Toggle + Action Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {/* Search Input */}
              <div className="relative flex-1 min-w-0">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={mediaSearch}
                  onChange={(e) => setMediaSearch(e.target.value)}
                  placeholder="Search media by title, category or speaker..."
                  className="w-full pl-10 pr-9 py-2 sm:py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/90 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#B5111B] focus:ring-1 focus:ring-[#B5111B]/20 transition"
                />
                {mediaSearch && (
                  <button
                    type="button"
                    onClick={() => setMediaSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* View Switcher & Action Button */}
              <div className="flex items-center gap-2 justify-between sm:justify-end shrink-0">
                <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200/80 shrink-0">
                  <button
                    type="button"
                    onClick={() => setMediaViewMode("grid")}
                    className={`p-1.5 rounded-lg transition cursor-pointer ${
                      mediaViewMode === "grid"
                        ? "bg-[#B5111B] text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaViewMode("list")}
                    className={`p-1.5 rounded-lg transition cursor-pointer ${
                      mediaViewMode === "list"
                        ? "bg-[#B5111B] text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                <Link
                  href="/landing-cms/media/create"
                  className="bg-[#B5111B] hover:bg-[#8F0D15] text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 sm:gap-2 shadow-xs transition-all hover:scale-102 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span className="whitespace-nowrap"><span className="hidden sm:inline">Add </span>Media Item</span>
                </Link>
              </div>
            </div>

            {/* Bottom Row: Filter Dropdowns & Controls */}
            <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100">
              {/* Media Type Segmented Pills */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 overflow-x-auto shrink-0">
                {(["all", "video", "audio", "document"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setMediaTypeFilter(type)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition cursor-pointer shrink-0 ${
                      mediaTypeFilter === type
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {type === "all" ? "All" : type === "document" ? "PDFs" : type + "s"}
                  </button>
                ))}
              </div>

              {/* Status Dropdown */}
              <Dropdown
                value={mediaStatusFilter}
                onChange={setMediaStatusFilter}
                title="FILTER BY STATUS:"
                options={[
                  { value: "all", label: "All Statuses" },
                  { value: "published", label: "Published" },
                  { value: "draft", label: "Draft" },
                ]}
              />

              {/* Year Dropdown */}
              <Dropdown
                value={mediaYearFilter}
                onChange={setMediaYearFilter}
                title="FILTER BY YEAR:"
                icon={<Calendar className="w-3.5 h-3.5" />}
                options={[
                  { value: "all", label: "All Years" },
                  ...mediaYears.map((yr) => ({ value: yr, label: yr })),
                ]}
              />

              {/* Featured Toggle */}
              <button
                type="button"
                onClick={() => setMediaFeaturedOnly(!mediaFeaturedOnly)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer select-none shrink-0 ${
                  mediaFeaturedOnly
                    ? "bg-amber-50 border-amber-300 text-amber-900 shadow-2xs font-extrabold"
                    : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                }`}
              >
                <Star
                  className={`w-3.5 h-3.5 ${
                    mediaFeaturedOnly ? "text-amber-500 fill-amber-400" : "text-slate-400"
                  }`}
                />
                <span>Featured</span>
              </button>

              {/* Sort Dropdown - Aligned right on laptop/desktop */}
              <Dropdown
                value={mediaSortBy}
                onChange={(val) => setMediaSortBy(val as any)}
                title="SORT MEDIA:"
                icon={<ArrowUpDown className="w-3.5 h-3.5" />}
                options={[
                  { value: "newest", label: "Sort by: Newest" },
                  { value: "oldest", label: "Sort by: Oldest" },
                  { value: "title_asc", label: "Sort by: Title (A-Z)" },
                  { value: "title_desc", label: "Sort by: Title (Z-A)" },
                ]}
                className="sm:ml-auto"
              />
            </div>
          </div>
        )}

        {/* FEATURED PROJECTS FILTER & TOOLBAR */}
        {activeTab === "projects" && (
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {/* Search */}
              <div className="relative flex-1 min-w-0">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={projectsSearch}
                  onChange={(e) => setProjectsSearch(e.target.value)}
                  placeholder="Search projects by location, study type, or category..."
                  className="w-full pl-10 pr-9 py-2 sm:py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/90 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#B5111B] focus:ring-1 focus:ring-[#B5111B]/20 transition"
                />
                {projectsSearch && (
                  <button
                    type="button"
                    onClick={() => setProjectsSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/project-portfolio"
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 sm:py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                  title="View live portfolio map page"
                >
                  <Eye className="w-4 h-4" />
                  <span className="hidden md:inline">Preview Page</span>
                </Link>

                <button
                  type="button"
                  onClick={openCreateProjectModal}
                  className="inline-flex items-center gap-2 bg-[#B5111B] hover:bg-[#8F0D15] text-white text-xs font-bold px-4 py-2 sm:py-2.5 rounded-xl shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Project</span>
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {/* Category Filter */}
              <Dropdown
                value={projectsCategoryFilter}
                onChange={setProjectsCategoryFilter}
                title="FILTER BY PRACTICE AREA:"
                options={[
                  { value: "all", label: `All Practice Areas (${projects.length})` },
                  ...PORTFOLIO_CATEGORIES.map((cat) => ({ value: cat, label: cat })),
                ]}
              />

              {/* Status Filter */}
              <Dropdown
                value={projectsStatusFilter}
                onChange={setProjectsStatusFilter}
                title="FILTER BY STATUS:"
                options={[
                  { value: "all", label: "All Statuses" },
                  { value: "published", label: "Published" },
                  { value: "draft", label: "Draft" },
                ]}
              />

              {/* Featured On Map Only */}
              <button
                type="button"
                onClick={() => setProjectsFeaturedOnly(!projectsFeaturedOnly)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  projectsFeaturedOnly
                    ? "bg-amber-100 text-amber-900 border border-amber-300 font-bold"
                    : "bg-slate-50/80 text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${projectsFeaturedOnly ? "fill-amber-500 text-amber-500" : ""}`} />
                <span>Map Pins Only</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* REPORTS MODULE CONTENT */}
      {activeTab === "reports" && (
        <div>
          {loading ? (
            <div className="p-16 text-center flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-[#B5111B] animate-spin" />
              <span className="text-xs font-bold text-slate-600">Loading reports from database...</span>
            </div>
          ) : error ? (
            <div className="p-8 bg-red-50 border border-red-200 rounded-2xl text-center space-y-3">
              <p className="text-xs font-bold text-red-700">{error}</p>
              <button
                type="button"
                onClick={loadReports}
                className="px-4 py-1.5 bg-[#B5111B] text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Retry
              </button>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 rounded-3xl p-14 text-center bg-white space-y-3 shadow-xs">
              <FileText className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Reports Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {reports.length === 0
                  ? "Publish your first research report to make it visible on your landing page."
                  : "No reports match your active search terms and filter criteria."}
              </p>
              <Link
                href="/landing-cms/reports/create"
                className="inline-flex items-center gap-2 bg-[#B5111B] hover:bg-[#8F0D15] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Report</span>
              </Link>
            </div>
          ) : reportViewMode === "grid" ? (
            /* GRID VIEW (Responsive Columns: 1 col tab portrait, 2 col laptop/tab landscape, 3 col xl desktop) */
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {filteredReports.map((report) => {
                const dateStr = report.publishedAt
                  ? new Date(report.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : report.createdAt
                  ? new Date(report.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Recent"

                return (
                  <div
                    key={report.id}
                    className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
                  >
                    {/* Thumbnail Image with Badges */}
                    <div className="relative h-44 sm:h-48 w-full bg-slate-900 overflow-hidden shrink-0">
                      {report.coverImage ? (
                        <img
                          src={report.coverImage}
                          alt={report.title}
                          className="w-full h-full object-cover group-hover:scale-103 transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-slate-800 to-slate-950 text-slate-300">
                          <FileText className="w-10 h-10 text-rose-400 mb-2 opacity-80" />
                          <span className="text-xs font-bold line-clamp-2 px-2">{report.title}</span>
                        </div>
                      )}

                      {/* Floating Badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap max-w-[85%]">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(report)}
                          title="Click to toggle status"
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs cursor-pointer transition ${
                            report.status === "published"
                              ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                              : "bg-slate-700/90 hover:bg-slate-800 text-white"
                          }`}
                        >
                          {report.status}
                        </button>

                        {report.featured && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                            <Star className="w-3 h-3 fill-slate-950" />
                            <span>Featured</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug line-clamp-2 group-hover:text-[#B5111B] transition-colors min-h-[38px] sm:min-h-[42px]">
                          {report.title}
                        </h3>

                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed min-h-[34px]">
                          {report.summary || report.subtitle || "In-depth market intelligence and executive insights."}
                        </p>

                        {/* Author and Date Metadata Row */}
                        <div className="flex items-center justify-between gap-2 text-[11px] font-medium text-slate-500 pt-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{report.author || "Kathleen Rose, CCIM, CRE"}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="whitespace-nowrap">{dateStr}</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                        <Link
                          href={`/report/${report.slug}`}
                          target="_blank"
                          className="text-xs font-bold text-slate-700 hover:text-[#B5111B] flex items-center gap-1.5 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#B5111B]" />
                          <span>Preview</span>
                        </Link>

                        <div className="flex items-center gap-1">
                          <Link
                            href={`/landing-cms/reports/edit/${report.id}`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="Edit Report"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(report)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete Report"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* LIST VIEW (Table Matching Mockup) */
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                <table className="w-full text-left border-collapse min-w-[720px]">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4 w-12 text-center">#</th>
                      <th className="py-3 px-4">Report</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Featured</th>
                      <th className="py-3 px-4">Author</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredReports.map((report, idx) => {
                      const dateStr = report.publishedAt
                        ? new Date(report.publishedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : report.createdAt
                        ? new Date(report.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Recent"

                      return (
                        <tr key={report.id} className="hover:bg-slate-50/70 transition-colors group">
                          {/* Index */}
                          <td className="py-3 px-4 text-center font-bold text-slate-400">
                            {idx + 1}
                          </td>

                          {/* Thumbnail + Title */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3 min-w-[200px]">
                              <div
                                className="w-11 h-11 rounded-xl border border-slate-200/60 overflow-hidden shrink-0 flex items-center justify-center"
                                style={{ backgroundColor: "lab(92 0 -0.01)" }}
                              >
                                {report.coverImage ? (
                                  <img
                                    src={report.coverImage}
                                    alt={report.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <FileText className="w-5 h-5 text-[#B5111B]" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <Link
                                  href={`/landing-cms/reports/edit/${report.id}`}
                                  className="font-bold text-slate-900 group-hover:text-[#B5111B] transition-colors truncate block"
                                >
                                  {report.title}
                                </Link>
                                <span className="text-[11px] text-slate-400 truncate block">
                                  {report.summary || report.subtitle || `/${report.slug}`}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(report)}
                              title="Click to toggle status"
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition cursor-pointer ${
                                report.status === "published"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-slate-100 text-slate-700 border-slate-200"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  report.status === "published" ? "bg-emerald-500" : "bg-slate-400"
                                }`}
                              />
                              <span className="capitalize">{report.status}</span>
                            </button>
                          </td>

                          {/* Featured */}
                          <td className="py-3 px-4">
                            {report.featured ? (
                              <span className="inline-flex items-center gap-1 font-bold text-amber-600 text-[11px]">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                                <span>Yes</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-slate-400 text-[11px]">
                                <Star className="w-3.5 h-3.5" />
                                <span>No</span>
                              </span>
                            )}
                          </td>

                          {/* Author */}
                          <td className="py-3 px-4 text-slate-600 font-medium whitespace-nowrap">
                            {report.author || "Kathleen Rose, CCIM, CRE"}
                          </td>

                          {/* Date */}
                          <td className="py-3 px-4 text-slate-500 font-medium whitespace-nowrap">
                            {dateStr}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              <Link
                                href={`/report/${report.slug}`}
                                target="_blank"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition text-xs font-semibold"
                              >
                                <Eye className="w-3.5 h-3.5 text-[#B5111B]" />
                                <span>Preview</span>
                              </Link>
                              <Link
                                href={`/landing-cms/reports/edit/${report.id}`}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                                title="Edit Report"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleDelete(report)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                                title="Delete Report"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MEDIA SPHERE TAB CONTENT */}
      {activeTab === "media" && (
        <div>
          {mediaLoading ? (
            <div className="p-16 text-center flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-[#B5111B] animate-spin" />
              <span className="text-xs font-bold text-slate-600">Loading Media Sphere items...</span>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 rounded-3xl p-14 text-center bg-white space-y-3 shadow-xs">
              <Film className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Media Sphere Items Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {mediaItems.length === 0
                  ? "Add YouTube broadcasts, podcast audio episodes, or market report PDFs."
                  : "No media items match your search terms and filter criteria."}
              </p>
              <Link
                href="/landing-cms/media/create"
                className="inline-flex items-center gap-2 bg-[#B5111B] hover:bg-[#8F0D15] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Media Item</span>
              </Link>
            </div>
          ) : mediaViewMode === "grid" ? (
            /* MEDIA GRID VIEW (Responsive Columns: 1 col tab portrait, 2 col laptop/tab landscape, 3 col xl desktop) */
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {filteredMedia.map((item, idx) => {
                const ytThumb = item.mediaType === "video" ? getYouTubeThumbnail(item.sourceUrl) : null

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group relative"
                  >
                    {/* Media Header Banner */}
                    <div className="relative h-44 sm:h-48 overflow-hidden shrink-0 border-b border-slate-100">
                      {/* 1. VIDEO BANNER */}
                      {item.mediaType === "video" && (
                        ytThumb ? (
                          <div className="w-full h-full relative overflow-hidden bg-slate-950">
                            <img
                              src={ytThumb}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            {/* Subtle dark vignette overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30 pointer-events-none" />
                            {/* Centered Frosted Glass Play Button */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:bg-[#B5111B] group-hover:border-[#B5111B] transition-all duration-300">
                                <Play className="w-5 h-5 fill-current ml-0.5 text-white" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Fallback modern look for non-YouTube video */
                          <div className="w-full h-full relative bg-gradient-to-br from-slate-900 via-[#131b2e] to-slate-950 flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                            <div className="relative z-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[#B5111B] group-hover:border-[#B5111B] transition-all duration-300">
                              <Play className="w-5 h-5 fill-current ml-0.5 text-white" />
                            </div>
                          </div>
                        )
                      )}

                      {/* 2. AUDIO BANNER (Matching Uploaded Screenshot) */}
                      {item.mediaType === "audio" && (
                        <div className="w-full h-full relative bg-gradient-to-r from-[#0a111e] via-[#0f192b] to-[#0a111e] flex items-center justify-center overflow-hidden">
                          {/* Audio Waveform Graphic */}
                          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center gap-[3px] sm:gap-[3.5px] px-6 sm:px-8 opacity-45 group-hover:opacity-65 transition-opacity pointer-events-none">
                            {[12, 18, 8, 22, 34, 16, 28, 42, 30, 48, 24, 38, 56, 32, 20, 0, 0, 0, 0, 0, 20, 32, 56, 38, 24, 48, 30, 42, 28, 16, 34, 22, 8, 18, 12].map((h, i) => (
                              <span
                                key={i}
                                style={{ height: `${h}px` }}
                                className={`w-[2.5px] rounded-full transition-all duration-300 ${
                                  h === 0 ? "invisible w-3" : "bg-gradient-to-t from-slate-400 via-white to-slate-400"
                                }`}
                              />
                            ))}
                          </div>

                          {/* Centered Circular Play Button */}
                          <div className="relative z-10 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border-2 border-white text-white flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:border-[#B5111B] group-hover:bg-[#B5111B] transition-all duration-300">
                            <Play className="w-5 h-5 fill-current ml-0.5 text-white" />
                          </div>
                        </div>
                      )}

                      {/* 3. DOCUMENT BANNER (Matching Uploaded Screenshot) */}
                      {item.mediaType === "document" && (
                        <div className="w-full h-full relative bg-gradient-to-br from-[#FFF1F2] via-[#FDF3F5] to-[#FCE8EB] flex items-center justify-center overflow-hidden">
                          {/* Soft wavy abstract decorative layer */}
                          <svg className="absolute inset-0 w-full h-full opacity-60 pointer-events-none" viewBox="0 0 400 200" fill="none" preserveAspectRatio="none">
                            <path d="M-20,130 C80,180 180,90 280,140 C340,170 390,130 420,110 L420,220 L-20,220 Z" fill="#FCA5A5" fillOpacity="0.22" />
                            <path d="M-20,150 C70,110 160,190 260,130 C330,85 380,150 420,135 L420,220 L-20,220 Z" fill="#FECDD3" fillOpacity="0.35" />
                          </svg>

                          {/* Center Rounded Icon Tile */}
                          <div className="relative z-10 w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-white/95 backdrop-blur-xs shadow-xs border border-rose-200/70 flex items-center justify-center group-hover:scale-105 group-hover:shadow-md transition-all duration-300">
                            <FileText className="w-8 h-8 text-[#B5111B] stroke-[1.8]" />
                          </div>
                        </div>
                      )}

                      {/* Top Left: Type Badge (Matching Uploaded Screenshot) */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                        {item.mediaType === "video" ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-xs font-semibold shadow-xs">
                            <Play className="w-3 h-3 fill-white text-white" />
                            <span>Video</span>
                          </div>
                        ) : item.mediaType === "document" ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/90 text-slate-700 border border-slate-200/80 text-xs font-semibold shadow-xs">
                            <FileText className="w-3.5 h-3.5 text-slate-600" />
                            <span>Document</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-xs font-semibold shadow-xs">
                            <Headphones className="w-3.5 h-3.5 text-white" />
                            <span>Audio</span>
                          </div>
                        )}
                      </div>

                      {/* Top Right: Featured + Status Badges (Matching Uploaded Screenshot) */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                        {item.featured && (
                          <button
                            type="button"
                            onClick={() => handleToggleMediaFeatured(item)}
                            title="Click to unpin from featured"
                            className="px-2.5 py-1 rounded-lg bg-amber-100/95 hover:bg-amber-200 text-amber-900 border border-amber-300/80 text-xs font-semibold flex items-center gap-1 shadow-xs transition cursor-pointer"
                          >
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span>Featured</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleToggleMediaStatus(item)}
                          title="Click to toggle status"
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition ${
                            item.status === "published"
                              ? "bg-emerald-100/90 hover:bg-emerald-200 text-emerald-800 border border-emerald-200/80"
                              : "bg-slate-100/90 hover:bg-slate-200 text-slate-700 border border-slate-200/80"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.status === "published" ? "bg-emerald-600" : "bg-slate-400"
                            }`}
                          />
                          <span className="capitalize">{item.status}</span>
                        </button>
                      </div>
                    </div>

                    {/* Body Content */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1">
                        <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug line-clamp-2 group-hover:text-[#B5111B] transition-colors min-h-[38px] sm:min-h-[42px]">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed min-h-[34px]">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Card Footer: Date on left, 4 Action Icons on right (Matching Screenshot Red Box) */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-xs font-medium text-slate-500">
                            {formatMediaDate(item.createdAt)}
                          </span>
                        </div>

                        {/* 4 Action Icons */}
                        <div className="flex items-center gap-1">
                          {/* 1. Preview / View */}
                          {item.sourceUrl ? (
                            <a
                              href={item.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
                              title="Preview media in new tab"
                            >
                              <Eye className="w-4 h-4" />
                            </a>
                          ) : (
                            <span className="p-1.5 text-slate-300 cursor-not-allowed" title="No URL available">
                              <Eye className="w-4 h-4" />
                            </span>
                          )}

                          {/* 2. Edit */}
                          <Link
                            href={`/landing-cms/media/edit/${item.id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
                            title="Edit media item"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>

                          {/* 3. Share / Send */}
                          <button
                            type="button"
                            onClick={(e) => handleShareMedia(item, e)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer relative"
                            title={copiedMediaId === item.id ? "Link copied!" : "Share / Copy link"}
                          >
                            {copiedMediaId === item.id ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                          </button>

                          {/* 4. Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteMedia(item)}
                            className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition cursor-pointer"
                            title="Delete media item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* MEDIA LIST VIEW */
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                <table className="w-full text-left border-collapse min-w-[740px]">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4 w-12 text-center">#</th>
                      <th className="py-3 px-4">Item</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Featured</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredMedia.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                        {/* Index */}
                        <td className="py-3 px-4 text-center font-bold text-slate-400">
                          {idx + 1}
                        </td>

                        {/* Title & Preview */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3 min-w-[200px]">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-slate-200/60 shadow-2xs"
                              style={{ backgroundColor: "lab(92 0 -0.01)" }}
                            >
                              {item.mediaType === "audio" ? (
                                <Mic className="w-4 h-4 text-[#B5111B]" />
                              ) : item.mediaType === "document" ? (
                                <FileText className="w-4 h-4 text-[#B5111B]" />
                              ) : (
                                <Film className="w-4 h-4 text-[#B5111B]" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <Link
                                href={`/landing-cms/media/edit/${item.id}`}
                                className="font-bold text-slate-900 group-hover:text-[#B5111B] transition-colors truncate block"
                              >
                                {item.title}
                              </Link>
                              <span className="text-[11px] text-slate-400 truncate block">
                                {item.category || "Media Sphere broadcast"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold uppercase tracking-wider">
                            {item.mediaType}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleMediaStatus(item)}
                            title="Click to toggle status"
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition cursor-pointer ${
                              item.status === "published"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.status === "published" ? "bg-emerald-500" : "bg-slate-400"
                              }`}
                            />
                            <span className="capitalize">{item.status}</span>
                          </button>
                        </td>

                        {/* Featured */}
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleMediaFeatured(item)}
                            title={item.featured ? "Click to unpin from featured" : "Click to pin as featured"}
                            className="inline-flex items-center gap-1 cursor-pointer transition hover:opacity-80 text-[11px]"
                          >
                            {item.featured ? (
                              <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                                <span>Yes</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-slate-400">
                                <Star className="w-3.5 h-3.5" />
                                <span>No</span>
                              </span>
                            )}
                          </button>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4 font-medium text-slate-600 whitespace-nowrap">
                          {item.category || "Media"}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 justify-end">

                            {item.mediaType === "document" && item.sourceUrl && (
                              <a
                                href={item.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                                title="Open PDF in new tab"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}

                            <Link
                              href={`/landing-cms/media/edit/${item.id}`}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                              title="Edit media item"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDeleteMedia(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                              title="Delete media item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FEATURED PROJECTS TAB CONTENT */}
      {activeTab === "projects" && (
        <div className="space-y-4">
          {projectsLoading ? (
            <div className="p-16 text-center flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-[#B5111B] animate-spin" />
              <span className="text-xs font-bold text-slate-600">Loading portfolio projects...</span>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 rounded-3xl p-14 text-center bg-white space-y-3 shadow-xs">
              <FolderOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Projects Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {projects.length === 0
                  ? "Create your first portfolio project to make it visible on your interactive map."
                  : "No projects match your active search terms and filter criteria."}
              </p>
              <button
                type="button"
                onClick={openCreateProjectModal}
                className="inline-flex items-center gap-2 bg-[#B5111B] hover:bg-[#8F0D15] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Project</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3.5 px-4">Location / Title</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Study Type</th>
                      <th className="py-3.5 px-4">Map Coordinates</th>
                      <th className="py-3.5 px-4 text-center">Map Pin</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProjects.map((proj) => (
                      <tr key={proj.id} className="hover:bg-slate-50/60 transition group">
                        {/* Title */}
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span>{proj.title}</span>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4">
                          <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 max-w-[200px] truncate">
                            {proj.category}
                          </span>
                        </td>

                        {/* Study Type */}
                        <td className="py-3 px-4 font-medium text-slate-600 max-w-[220px] truncate">
                          {proj.studyType}
                        </td>

                        {/* Coordinates */}
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                          {proj.latitude?.toFixed(3)}, {proj.longitude?.toFixed(3)}
                        </td>

                        {/* Featured (Map Pin) */}
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleProjectFeatured(proj)}
                            title="Toggle visibility on interactive map"
                            className={`p-1.5 rounded-lg transition cursor-pointer ${
                              proj.featured
                                ? "text-amber-500 hover:bg-amber-50"
                                : "text-slate-300 hover:text-slate-500"
                            }`}
                          >
                            <Star className={`w-4 h-4 ${proj.featured ? "fill-amber-400" : ""}`} />
                          </button>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleProjectStatus(proj)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer transition ${
                              proj.status === "published"
                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            }`}
                          >
                            {proj.status}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            {proj.pdfUrl && (
                              <a
                                href={proj.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                                title="Open PDF in new tab"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}

                            <button
                              type="button"
                              onClick={() => openEditProjectModal(proj)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                              title="Edit project"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteProject(proj)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                              title="Delete project"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PROJECT CREATE / EDIT MODAL */}
      {projectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#B5111B]" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingProject ? "Edit Portfolio Project" : "Add Portfolio Project"}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeProjectModal}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="p-6 space-y-4 text-xs">
              {/* Location / Title */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Location / Project Name *</label>
                <input
                  type="text"
                  required
                  value={projectFormData.title}
                  onChange={(e) => setProjectFormData({ ...projectFormData, title: e.target.value })}
                  placeholder="e.g. Statesville, NC"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#B5111B] focus:bg-white"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block text-xs">Practice Area Category *</label>
                <Dropdown
                  value={projectFormData.category}
                  onChange={(val) => setProjectFormData({ ...projectFormData, category: val })}
                  options={PORTFOLIO_CATEGORIES.map((cat) => ({ value: cat, label: cat }))}
                  fullWidth
                  size="md"
                  align="left"
                  highlightSelected={false}
                />
              </div>

              {/* Study Type */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Study / Assignment Type *</label>
                <input
                  type="text"
                  required
                  value={projectFormData.studyType}
                  onChange={(e) => setProjectFormData({ ...projectFormData, studyType: e.target.value })}
                  placeholder="e.g. Comprehensive Land Use Plan"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#B5111B] focus:bg-white"
                />
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">Latitude *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={projectFormData.latitude}
                    onChange={(e) =>
                      setProjectFormData({ ...projectFormData, latitude: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#B5111B] focus:bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">Longitude *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={projectFormData.longitude}
                    onChange={(e) =>
                      setProjectFormData({ ...projectFormData, longitude: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#B5111B] focus:bg-white"
                  />
                </div>
              </div>

              {/* PDF Document */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <label className="font-bold text-slate-700 block">Project PDF Document *</label>
                <div className="space-y-2">
                  <input
                    type="url"
                    required
                    value={projectFormData.pdfUrl}
                    onChange={(e) => {
                      cleanupStagedPdf()
                      setProjectFormData({ ...projectFormData, pdfUrl: e.target.value })
                    }}
                    placeholder="https://.../project-highlights.pdf"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#B5111B] focus:bg-white"
                  />

                  {/* Staged file indicator */}
                  {stagedPdfFile && (
                    <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-medium">
                      <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="font-bold block truncate">{stagedPdfFile.name}</span>
                        <span className="text-[10px] text-amber-600 font-semibold">
                          {(stagedPdfFile.size / 1024).toFixed(0)} KB &bull; Staged locally (uploads to Cloudinary on Save)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          cleanupStagedPdf()
                          setProjectFormData((prev) => ({ ...prev, pdfUrl: editingProject?.pdfUrl || "" }))
                        }}
                        className="p-1 text-amber-700 hover:text-red-600 rounded-md transition cursor-pointer"
                        title="Remove staged file"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Upload button & preview */}
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold cursor-pointer transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{stagedPdfFile ? "Choose Different PDF" : "Upload Local PDF"}</span>
                      <input
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={handlePdfSelect}
                        disabled={uploadingPdf}
                        className="hidden"
                      />
                    </label>

                    {projectFormData.pdfUrl && (
                      <a
                        href={projectFormData.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#B5111B] hover:underline font-bold"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Preview PDF</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-4">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={projectFormData.featured}
                    onChange={(e) => setProjectFormData({ ...projectFormData, featured: e.target.checked })}
                    className="w-4 h-4 rounded text-[#B5111B] focus:ring-[#B5111B]"
                  />
                  <span>Show Pin on Interactive Map</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">Status:</span>
                  <button
                    type="button"
                    onClick={() =>
                      setProjectFormData({
                        ...projectFormData,
                        status: projectFormData.status === "published" ? "draft" : "published",
                      })
                    }
                    className={`px-3 py-1 rounded-full font-black uppercase text-[10px] tracking-wider transition cursor-pointer ${
                      projectFormData.status === "published"
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {projectFormData.status}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={closeProjectModal}
                  disabled={uploadingPdf}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingPdf}
                  className="px-5 py-2 bg-[#B5111B] hover:bg-[#8F0D15] text-white font-bold rounded-xl shadow-xs transition cursor-pointer disabled:opacity-60 flex items-center gap-2"
                >
                  {uploadingPdf ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading PDF...</span>
                    </>
                  ) : (
                    <span>{editingProject ? "Update Project" : "Create Project"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GLOBAL CONFIRM DELETE MODAL */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        isLoading={isDeleting}
        onClose={() => {
          if (!isDeleting) setDeleteTarget(null)
        }}
        onConfirm={handleConfirmDelete}
        title={
          deleteTarget?.type === "project"
            ? "Delete Portfolio Project"
            : deleteTarget?.type === "report"
            ? "Delete Market Report"
            : "Delete Media Item"
        }
        description={
          deleteTarget?.type === "project"
            ? "Are you sure you want to delete this portfolio project? It will be removed from the active projects list and map."
            : deleteTarget?.type === "report"
            ? "Are you sure you want to delete this report? It will no longer be visible on your landing page."
            : "Are you sure you want to delete this media item? It will be removed from your active media sphere."
        }
        itemName={deleteTarget?.title}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  )
}
