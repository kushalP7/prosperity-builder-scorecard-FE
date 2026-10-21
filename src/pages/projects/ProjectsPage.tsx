"use client"

import * as React from "react"
import { useAppStore } from "@/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { Spinner, SkeletonCard } from "@/components/ui/loader"
import { Folder, Plus, Trash2, Pencil, Database, Image as ImageIcon, X, Upload, Search } from "lucide-react"
import { Link } from "@/lib/router-compat"
import { createPortal } from "react-dom"
import { usePermission } from "@/lib/permissions"
import { apiClient } from "@/lib/api"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { Pagination } from "@/components/ui/pagination"

const US_STATES = [
  { name: "North Carolina", abbr: "NC", fips: "37" },
  { name: "California", abbr: "CA", fips: "06" },
  { name: "Florida", abbr: "FL", fips: "12" },
  { name: "Georgia", abbr: "GA", fips: "13" },
  { name: "New York", abbr: "NY", fips: "36" },
  { name: "Ohio", abbr: "OH", fips: "39" },
  { name: "Pennsylvania", abbr: "PA", fips: "42" },
  { name: "South Carolina", abbr: "SC", fips: "45" },
  { name: "Tennessee", abbr: "TN", fips: "47" },
  { name: "Texas", abbr: "TX", fips: "48" },
  { name: "Virginia", abbr: "VA", fips: "51" },
  { name: "Other / Custom State", abbr: "US", fips: "" },
]

const POPULAR_NC_COUNTIES = [
  { name: "Lee County", fips: "105" },
  { name: "Wake County", fips: "183" },
  { name: "Mecklenburg County", fips: "119" },
  { name: "Durham County", fips: "063" },
  { name: "Guilford County", fips: "081" },
  { name: "Forsyth County", fips: "067" },
  { name: "Buncombe County", fips: "021" },
  { name: "Orange County", fips: "135" },
  { name: "Johnston County", fips: "101" },
  { name: "Cumberland County", fips: "051" },
  { name: "Other / Custom County", fips: "" },
]

export default function ProjectsPage() {
  const { projects, fetchProjects, isLoadingProjects, createProject, updateProject, deleteProject, loadSampleData, isLoading } = useAppStore()
  const canCreate = usePermission('create_project')
  const canEdit = usePermission('edit_project_metadata')
  const canDelete = usePermission('delete_project')
  const [mounted, setMounted] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isUploadingImage, setIsUploadingImage] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Soft delete confirmation modal state
  const [projectToDelete, setProjectToDelete] = React.useState<any | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  // Search and Pagination State (matching Landing CMS)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [currentPage, setCurrentPage] = React.useState<number>(1)
  const [pageSize, setPageSize] = React.useState<number>(9)
  const [paginatedProjects, setPaginatedProjects] = React.useState<any[]>([])
  const [totalItems, setTotalItems] = React.useState<number>(0)
  const [totalPages, setTotalPages] = React.useState<number>(1)
  const [isFetchingProjects, setIsFetchingProjects] = React.useState<boolean>(true)
  const isFirstSearchDebounce = React.useRef(true)

  // 1. Sync search and pagination from URL query params on initial mount
  React.useEffect(() => {
    setMounted(true)
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      if (params.get("search")) {
        const s = params.get("search") || ""
        setSearchTerm(s)
        setDebouncedSearch(s)
      }
      if (params.get("page")) {
        setCurrentPage(Math.max(1, parseInt(params.get("page") || "1", 10)))
      }
      if (params.get("limit")) {
        setPageSize(Math.max(1, parseInt(params.get("limit") || "9", 10)))
      }
    }
  }, [])

  // 2. Debounce search input (300ms) - matches Landing CMS
  React.useEffect(() => {
    if (isFirstSearchDebounce.current) {
      isFirstSearchDebounce.current = false
      return
    }
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setCurrentPage(1)
    }, 600)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // 3. Sync URL route path when page, limit, or search query changes (matching Landing CMS)
  React.useEffect(() => {
    if (typeof window === "undefined" || !mounted) return
    const params = new URLSearchParams()
    if (currentPage > 1) params.set("page", String(currentPage))
    if (pageSize !== 9) params.set("limit", String(pageSize))
    if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim())

    const newQuery = params.toString() ? `?${params.toString()}` : ""
    window.history.replaceState(null, "", `/projects${newQuery}`)
  }, [currentPage, pageSize, debouncedSearch, mounted])

  // 4. Fetch projects from API based on limit, page, and debounced search
  const loadProjects = React.useCallback(async () => {
    setIsFetchingProjects(true)
    try {
      const res = await apiClient.getProjects({
        search: debouncedSearch.trim(),
        page: currentPage,
        limit: pageSize,
      })

      if (res) {
        if (Array.isArray(res.data)) {
          setPaginatedProjects(res.data)
          setTotalItems(typeof res.total === 'number' ? res.total : res.data.length)
          setTotalPages(typeof res.totalPages === 'number' ? res.totalPages : 1)
        } else if (Array.isArray(res)) {
          setPaginatedProjects(res)
          setTotalItems(res.length)
          setTotalPages(Math.ceil(res.length / pageSize) || 1)
        }
      }
    } catch (err) {
      console.error("Failed to load projects:", err)
    } finally {
      setIsFetchingProjects(false)
    }
  }, [debouncedSearch, currentPage, pageSize])

  React.useEffect(() => {
    if (mounted) {
      loadProjects()
    }
  }, [loadProjects, mounted])

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return
    setIsDeleting(true)
    try {
      await deleteProject(projectToDelete.id)
      setProjectToDelete(null)
      await loadProjects()
    } finally {
      setIsDeleting(false)
    }
  }

  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [editingProjectId, setEditingProjectId] = React.useState<string | null>(null)
  const [newProject, setNewProject] = React.useState<{
    name: string;
    clientName: string;
    year: number;
    image?: string;
    state: string;
    county: string;
    stateFips: string;
    countyFips: string;
  }>({
    name: "",
    clientName: "",
    year: new Date().getFullYear(),
    image: "",
    state: "North Carolina",
    county: "Lee County",
    stateFips: "37",
    countyFips: "105",
  })

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB.")
        return
      }

      setIsUploadingImage(true)
      try {
        const uploadResult = await apiClient.uploadImage(file, 'projects')
        if (uploadResult?.url) {
          setNewProject(prev => ({ ...prev, image: uploadResult.url }))
        } else {
          alert("Failed to upload image. Please try again.")
        }
      } catch (err) {
        console.error("Failed to upload image:", err)
        alert("Failed to upload image. Please check your connection and try again.")
      } finally {
        setIsUploadingImage(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
    }
  }

  const handleRemoveImage = () => {
    setNewProject(prev => ({ ...prev, image: "" }))
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleStateChange = (stateName: string) => {
    const matched = US_STATES.find(s => s.name === stateName)
    const newFips = matched?.fips || ""
    setNewProject(prev => ({
      ...prev,
      state: stateName,
      stateFips: newFips || prev.stateFips,
      // If switching away from NC, keep county or clear
      county: stateName === "North Carolina" ? prev.county : (prev.county || "County"),
    }))
  }

  const handleCountyChange = (countyName: string) => {
    const matched = POPULAR_NC_COUNTIES.find(c => c.name === countyName)
    setNewProject(prev => ({
      ...prev,
      county: countyName,
      countyFips: matched?.fips || prev.countyFips,
    }))
  }

  const handleSaveProject = async () => {
    if (!newProject.name || !newProject.clientName) return;
    setIsSubmitting(true)

    if (editingProjectId) {
      await updateProject(editingProjectId, {
        name: newProject.name,
        clientName: newProject.clientName,
        year: newProject.year,
        image: newProject.image,
        state: newProject.state,
        county: newProject.county,
        stateFips: newProject.stateFips,
        countyFips: newProject.countyFips,
      })
    } else {
      await createProject({
        name: newProject.name,
        clientName: newProject.clientName,
        year: newProject.year,
        image: newProject.image,
        state: newProject.state,
        county: newProject.county,
        stateFips: newProject.stateFips,
        countyFips: newProject.countyFips,
        enabledWidgets: []
      })
    }

    setIsSubmitting(false)
    setIsModalOpen(false)
    setEditingProjectId(null)
    setNewProject({
      name: "",
      clientName: "",
      year: new Date().getFullYear(),
      image: "",
      state: "North Carolina",
      county: "Lee County",
      stateFips: "37",
      countyFips: "105",
    })
    await loadProjects()
  }

  const openEditModal = (project: any) => {
    setNewProject({
      name: project.name,
      clientName: project.clientName,
      year: project.year,
      image: project.image || "",
      state: project.state || "North Carolina",
      county: project.county || "Lee County",
      stateFips: project.stateFips || "37",
      countyFips: project.countyFips || "105",
    })
    setEditingProjectId(project.id)
    setIsModalOpen(true)
  }

  const openCreateModal = () => {
    setNewProject({
      name: "",
      clientName: "",
      year: new Date().getFullYear(),
      image: "",
      state: "North Carolina",
      county: "Lee County",
      stateFips: "37",
      countyFips: "105",
    })
    setEditingProjectId(null)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {mounted && document.getElementById('app-header-title') && createPortal(
        <>
          <h1 className="text-xl font-bold tracking-tight">Projects</h1>
        </>,
        document.getElementById('app-header-title')!
      )}

      {mounted && document.getElementById('app-header-actions') && createPortal(
        <div className="flex items-center gap-2">
          {canCreate && (
            <>
              {/* <Button
                variant="outline"
                onClick={async () => {
                  await loadSampleData()
                  await loadProjects()
                }}
                disabled={isLoading}
              >
                {isLoading ? <Spinner className="mr-2 h-4 w-4" /> : <Database className="h-4 w-4 mr-2" />}
                Load Sample Data
              </Button> */}
              <Button onClick={openCreateModal}>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </>
          )}
        </div>,
        document.getElementById('app-header-actions')!
      )}

      {/* Search Toolbar (matching Landing CMS) */}
      {(totalItems > 0 || searchTerm || paginatedProjects.length > 0 || isFetchingProjects) && (
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1 min-w-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search projects by name, client, county or state..."
                className="w-full pl-10 pr-9 py-2 sm:py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/90 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#B5111B] focus:ring-1 focus:ring-[#B5111B]/20 transition"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("")
                    setDebouncedSearch("")
                    setCurrentPage(1)
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {debouncedSearch && (
              <span className="text-xs text-slate-500 font-medium px-2.5 py-1.5 bg-slate-100 rounded-xl shrink-0 border border-slate-200/80">
                Found <strong className="text-slate-800">{totalItems}</strong> {totalItems === 1 ? 'project' : 'projects'}
              </span>
            )}
          </div>
        </div>
      )}

      {isFetchingProjects && paginatedProjects.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : totalItems === 0 && !debouncedSearch ? (
        <div className="p-12 text-center border border-dashed rounded-lg text-muted-foreground">
          No projects yet. Create one to start an assessment.
        </div>
      ) : paginatedProjects.length === 0 ? (
        <div className="p-12 text-center border border-dashed rounded-2xl bg-white text-muted-foreground space-y-3">
          <Search className="w-8 h-8 text-slate-300 mx-auto" />
          <div className="text-base font-semibold text-slate-700">No Projects Found</div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No projects match "{debouncedSearch}". Check your spelling or clear the search to view all projects.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm("")
              setDebouncedSearch("")
              setCurrentPage(1)
            }}
            className="cursor-pointer"
          >
            Clear Search
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedProjects.map((project) => (
              <Card key={project.id} className="group hover:border-primary transition-colors flex flex-col overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <Link href={`/projects/${project.id}/data`} className="flex-1 hover:underline">
                      <div className="flex items-center gap-3">
                        {project.image ? (
                          <img
                            src={project.image}
                            alt={project.name}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0 shadow-sm"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                            <Folder className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        )}
                        <CardTitle className="text-lg leading-tight text-primary">{project.name}</CardTitle>
                      </div>
                    </Link>
                    <div className="flex items-center">
                      {canEdit && (
                        <button
                          onClick={() => openEditModal(project)}
                          title="Edit Project Details"
                          className="text-muted-foreground hover:text-primary transition-colors p-1 mr-1 cursor-pointer"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => setProjectToDelete(project)}
                          title="Delete Project (Admin only)"
                          className="text-muted-foreground hover:text-red-500 transition-colors p-1 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm text-muted-foreground mb-1">Client: {project.clientName}</p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-muted text-foreground">
                      {project.county || 'Lee County'}, {project.state || 'NC'}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      (FIPS: {project.stateFips || '37'}-{project.countyFips || '105'})
                    </span>
                  </div>

                  <div className="mt-auto flex justify-between items-center text-xs text-muted-foreground border-t border-border pt-4">
                    <span>{project.year}</span>
                    <span>{(project.assignedSections || []).length} sections assigned</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalItems > 0 && (
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize)
                setCurrentPage(1)
              }}
              pageSizeOptions={[6, 9, 12, 24, 48, 100]}
              isLoading={isFetchingProjects}
            />
          )}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProjectId ? "Edit Project" : "Create New Project"}>
        <div className="space-y-4">
          {/* Project Image Upload Field & Live Preview */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Project Image / Logo</label>
            <div className="flex items-center gap-4">
              {newProject.image ? (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0 group">
                  <img src={newProject.image} alt="Project Preview" className="w-full h-full object-cover" />
                  {!isUploadingImage && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white p-0.5 rounded-full transition-colors"
                      title="Remove Image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {isUploadingImage && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Spinner className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 shrink-0">
                  {isUploadingImage ? (
                    <Spinner className="w-5 h-5 text-primary" />
                  ) : (
                    <ImageIcon className="w-6 h-6" />
                  )}
                </div>
              )}
              <div className="flex flex-col gap-1.5 flex-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isUploadingImage}
                  className="hidden"
                  id="project-image-input"
                />
                <label
                  htmlFor={isUploadingImage ? undefined : "project-image-input"}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-input bg-background text-xs font-semibold w-fit transition-colors ${isUploadingImage ? "opacity-60 cursor-not-allowed" : "hover:bg-accent cursor-pointer"
                    }`}
                >
                  {isUploadingImage ? (
                    <>
                      <Spinner className="w-3.5 h-3.5" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>{newProject.image ? "Change Image" : "Upload Image"}</span>
                    </>
                  )}
                </label>
                <span className="text-[11px] text-muted-foreground">PNG, JPG or WebP (Max 5MB)</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Project Name</label>
            <input
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              value={newProject.name}
              onChange={e => setNewProject({ ...newProject, name: e.target.value })}
              placeholder="e.g. Town of Wake Forest, NC, 2026"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Client Name</label>
            <input
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              value={newProject.clientName}
              onChange={e => setNewProject({ ...newProject, clientName: e.target.value })}
              placeholder="e.g. Wake Forest"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Year</label>
            <input
              type="number"
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              value={newProject.year}
              onChange={e => setNewProject({ ...newProject, year: parseInt(e.target.value) || new Date().getFullYear() })}
            />
          </div>

          {/* Location & 3rd-Party Data Source Configuration */}
          <div className="space-y-3 p-3.5 bg-muted/20 border border-border rounded-lg">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">State</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  value={newProject.state}
                  onChange={e => handleStateChange(e.target.value)}
                >
                  {US_STATES.map(s => (
                    <option key={s.name} value={s.name}>
                      {s.name} {s.abbr ? `(${s.abbr})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">County</label>
                {newProject.state === "North Carolina" ? (
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    value={newProject.county}
                    onChange={e => handleCountyChange(e.target.value)}
                  >
                    {POPULAR_NC_COUNTIES.map(c => (
                      <option key={c.name} value={c.name}>
                        {c.name} {c.fips ? `(FIPS ${c.fips})` : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    value={newProject.county}
                    onChange={e => setNewProject({ ...newProject, county: e.target.value })}
                    placeholder="e.g. Orange County"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">State FIPS Code</label>
                <input
                  className="w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs font-mono shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  value={newProject.stateFips}
                  onChange={e => setNewProject({ ...newProject, stateFips: e.target.value })}
                  placeholder="e.g. 37"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">County FIPS Code</label>
                <input
                  className="w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs font-mono shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  value={newProject.countyFips}
                  onChange={e => setNewProject({ ...newProject, countyFips: e.target.value })}
                  placeholder="e.g. 105"
                />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              US Census ACS and BLS Local Area Unemployment statistics will be dynamically requested for this specific state & county FIPS code.
            </p>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveProject} disabled={isSubmitting || isUploadingImage}>
              {isSubmitting && <Spinner className="mr-2 h-4 w-4" />}
              {editingProjectId ? "Save Changes" : "Create Project"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Soft Delete Confirmation Modal Popup */}
      <ConfirmDialog
        isOpen={Boolean(projectToDelete)}
        isLoading={isDeleting}
        onClose={() => {
          if (!isDeleting) setProjectToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Project"
        description="Are you sure you want to delete this project? It will be soft-deleted and moved to trash. You can restore it anytime."
        itemName={projectToDelete?.name}
        confirmText="Delete Project"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  )
}
