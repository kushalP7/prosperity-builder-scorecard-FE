"use client"

import * as React from "react"
import { useAppStore } from "@/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { Spinner, SkeletonCard } from "@/components/ui/loader"
import {
  FolderIcon,
  PlusIcon,
  TrashIcon,
  PencilSimpleIcon,
  DatabaseIcon,
  ImageIcon,
  XIcon,
  UploadSimpleIcon,
  MagnifyingGlassIcon
} from "@phosphor-icons/react"
import { Link } from "@/lib/router-compat"
import { createPortal } from "react-dom"
import { usePermission, isCustomerRole, hasActiveSubscription } from "@/lib/permissions"
import { apiClient } from "@/lib/api"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { Pagination } from "@/components/ui/pagination"
import { Dropdown } from "@/components/ui/dropdown"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import {
  getSeStates,
  getCountiesForState,
  resolveSeFips,
} from "@/lib/se-counties"
import { getPlacesForState, resolveSePlace } from "@/lib/se-places"

const SE_STATES = getSeStates()
const DEFAULT_STATE = SE_STATES[0]?.name || "North Carolina"
const DEFAULT_COUNTY = getCountiesForState(SE_STATES[0]?.fips || "37")[0]?.name || "Alamance County"
const DEFAULT_RESOLVED = resolveSeFips(DEFAULT_STATE, DEFAULT_COUNTY)
const DEFAULT_CITY = getPlacesForState(SE_STATES[0]?.fips || "37")[0]?.name || "Aberdeen town"
const DEFAULT_PLACE = resolveSePlace(DEFAULT_STATE, DEFAULT_CITY)

const PROJECT_STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "INTAKE_PENDING", label: "Intake Pending" },
  { value: "INTAKE_SUBMITTED", label: "Intake Submitted" },
  { value: "CALCULATED", label: "Calculated" },
  { value: "IN_REVIEW", label: "In Review" },
  { value: "PUBLISHED", label: "Published" },
]

const PROJECT_STATUS_VALUES = new Set(
  PROJECT_STATUS_FILTER_OPTIONS.map((o) => o.value).filter((v) => v !== "all"),
)

export default function ProjectsPage() {
  const { projects, fetchProjects, isLoadingProjects, createProject, updateProject, deleteProject, loadSampleData, isLoading, currentUser } = useAppStore()
  const canCreatePermission = usePermission('create_project')
  const canEdit = usePermission('edit_project_metadata')
  const canDelete = usePermission('delete_project')
  const isCustomer = isCustomerRole(currentUser?.role)
  const customerJurisdiction: "CITY" | "COUNTY" =
    String((currentUser as any)?.jurisdictionType || "").toUpperCase() === "CITY" ||
    String((currentUser as any)?.leadRole || "").toLowerCase() === "city"
      ? "CITY"
      : "COUNTY"
  const [allowance, setAllowance] = React.useState<{ maxProjects: number; usedProjects: number; remaining: number } | null>(null)
  const [mounted, setMounted] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isUploadingImage, setIsUploadingImage] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Soft delete confirmation modal state
  const [projectToDelete, setProjectToDelete] = React.useState<any | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  // Search, status filter, and pagination state
  const [searchTerm, setSearchTerm] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [currentPage, setCurrentPage] = React.useState<number>(1)
  const [pageSize, setPageSize] = React.useState<number>(9)
  const [paginatedProjects, setPaginatedProjects] = React.useState<any[]>([])
  const [totalItems, setTotalItems] = React.useState<number>(0)
  const [totalPages, setTotalPages] = React.useState<number>(1)
  const [isFetchingProjects, setIsFetchingProjects] = React.useState<boolean>(true)
  const isFirstSearchDebounce = React.useRef(true)

  // 1. Sync search, status, and pagination from URL query params on initial mount
  React.useEffect(() => {
    setMounted(true)
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      if (params.get("search")) {
        const s = params.get("search") || ""
        setSearchTerm(s)
        setDebouncedSearch(s)
      }
      const st = params.get("status")
      if (st && PROJECT_STATUS_VALUES.has(st)) {
        setStatusFilter(st)
      }
      if (params.get("page")) {
        setCurrentPage(Math.max(1, parseInt(params.get("page") || "1", 10)))
      }
      if (params.get("limit")) {
        setPageSize(Math.max(1, parseInt(params.get("limit") || "9", 10)))
      }
    }
  }, [])

  React.useEffect(() => {
    if (!isCustomer || !hasActiveSubscription(currentUser?.subscriptionStatus)) {
      setAllowance(null)
      return
    }
    let cancelled = false
    ;(async () => {
      const a = await apiClient.getMyProjectAllowance()
      if (!cancelled && a) setAllowance(a)
    })()
    return () => {
      cancelled = true
    }
  }, [isCustomer, currentUser?.subscriptionStatus, paginatedProjects.length])

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

  // 3. Sync URL when page, limit, search, or status changes
  React.useEffect(() => {
    if (typeof window === "undefined" || !mounted) return
    const params = new URLSearchParams()
    if (currentPage > 1) params.set("page", String(currentPage))
    if (pageSize !== 9) params.set("limit", String(pageSize))
    if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim())
    if (statusFilter !== "all") params.set("status", statusFilter)

    const newQuery = params.toString() ? `?${params.toString()}` : ""
    window.history.replaceState(null, "", `/projects${newQuery}`)
  }, [currentPage, pageSize, debouncedSearch, statusFilter, mounted])

  // 4. Fetch projects from API based on limit, page, search, and status
  const loadProjects = React.useCallback(async () => {
    setIsFetchingProjects(true)
    try {
      const res = await apiClient.getProjects({
        search: debouncedSearch.trim(),
        status: statusFilter !== "all" ? statusFilter : undefined,
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
  }, [debouncedSearch, statusFilter, currentPage, pageSize])

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
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({})
  const [newProject, setNewProject] = React.useState<{
    name: string;
    clientName: string;
    year: number;
    image?: string;
    jurisdictionType: "CITY" | "COUNTY";
    state: string;
    county: string;
    city: string;
    stateFips: string;
    countyFips: string;
    placeFips: string;
  }>({
    name: "",
    clientName: "",
    year: new Date().getFullYear(),
    image: "",
    jurisdictionType: "COUNTY",
    state: DEFAULT_STATE,
    county: DEFAULT_COUNTY,
    city: DEFAULT_CITY,
    stateFips: DEFAULT_RESOLVED?.stateFips || "37",
    countyFips: DEFAULT_RESOLVED?.countyFips || "001",
    placeFips: DEFAULT_PLACE?.placeFips || "",
  })

  const countyOptions = React.useMemo(
    () => getCountiesForState(newProject.stateFips || newProject.state),
    [newProject.state, newProject.stateFips],
  )
  const placeOptions = React.useMemo(
    () => getPlacesForState(newProject.stateFips || newProject.state),
    [newProject.state, newProject.stateFips],
  )
  const isCityMode = newProject.jurisdictionType === "CITY"

  const clearFieldError = (field: string) => {
    setFormErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const validateProjectForm = () => {
    const errors: Record<string, string> = {}
    if (!String(newProject.name || "").trim()) errors.name = "This field is required."
    if (!String(newProject.clientName || "").trim()) errors.clientName = "This field is required."
    if (!newProject.year || Number.isNaN(Number(newProject.year))) errors.year = "This field is required."
    if (!String(newProject.state || "").trim()) errors.state = "This field is required."
    if (isCityMode) {
      if (!String(newProject.city || "").trim()) errors.city = "This field is required."
      if (!resolveSePlace(newProject.state, newProject.city)) {
        errors.city = "Select a valid city/place for the chosen Southeast state."
      }
    } else {
      if (!String(newProject.county || "").trim()) errors.county = "This field is required."
      if (!resolveSeFips(newProject.state, newProject.county)) {
        errors.county = "Select a valid county for the chosen Southeast state."
      }
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

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
    const matched = SE_STATES.find((s) => s.name === stateName)
    const counties = getCountiesForState(matched?.fips || stateName)
    const places = getPlacesForState(matched?.fips || stateName)
    const firstCounty = counties[0]
    const firstPlace = places[0]
    clearFieldError("state")
    clearFieldError("county")
    clearFieldError("city")
    setNewProject((prev) => ({
      ...prev,
      state: stateName,
      stateFips: matched?.fips || "",
      county: firstCounty?.name || "",
      countyFips: firstCounty?.countyFips || "",
      city: firstPlace?.name || "",
      placeFips: firstPlace?.placeFips || "",
    }))
  }

  const handleCountyChange = (countyName: string) => {
    const resolved = resolveSeFips(newProject.state, countyName)
    clearFieldError("county")
    setNewProject((prev) => ({
      ...prev,
      county: countyName,
      stateFips: resolved?.stateFips || prev.stateFips,
      countyFips: resolved?.countyFips || "",
    }))
  }

  const handleCityChange = (cityName: string) => {
    const resolved = resolveSePlace(newProject.state, cityName)
    clearFieldError("city")
    setNewProject((prev) => ({
      ...prev,
      city: cityName,
      stateFips: resolved?.stateFips || prev.stateFips,
      placeFips: resolved?.placeFips || "",
    }))
  }

  const emptyProjectForm = (jurisdiction: "CITY" | "COUNTY" = customerJurisdiction) => ({
    name: "",
    clientName: "",
    year: new Date().getFullYear(),
    image: "",
    jurisdictionType: jurisdiction,
    state: DEFAULT_STATE,
    county: DEFAULT_COUNTY,
    city: DEFAULT_CITY,
    stateFips: DEFAULT_RESOLVED?.stateFips || "37",
    countyFips: DEFAULT_RESOLVED?.countyFips || "001",
    placeFips: DEFAULT_PLACE?.placeFips || "",
  })

  const handleSaveProject = async () => {
    if (!validateProjectForm()) return
    const geoPayload =
      newProject.jurisdictionType === "CITY"
        ? (() => {
            const resolved = resolveSePlace(newProject.state, newProject.city)
            if (!resolved) return null
            return {
              jurisdictionType: "CITY" as const,
              state: resolved.stateName,
              city: resolved.placeName,
              stateFips: resolved.stateFips,
              placeFips: resolved.placeFips,
              locationConfirmed: true,
            }
          })()
        : (() => {
            const resolved = resolveSeFips(newProject.state, newProject.county)
            if (!resolved) return null
            return {
              jurisdictionType: "COUNTY" as const,
              state: resolved.state.name,
              county: resolved.county.name,
              stateFips: resolved.stateFips,
              countyFips: resolved.countyFips,
              placeFips: null as string | null,
              locationConfirmed: true,
            }
          })()
    if (!geoPayload) return
    // Customers cannot change jurisdiction — stamp from lead role
    if (isCustomer) {
      ;(geoPayload as any).jurisdictionType = customerJurisdiction
    }
    setIsSubmitting(true)

    if (editingProjectId) {
      const ok = await updateProject(editingProjectId, {
        name: newProject.name,
        clientName: newProject.clientName,
        year: newProject.year,
        image: newProject.image,
        ...geoPayload,
      })
      if (ok) {
        setPaginatedProjects(prev =>
          prev.map(p => (p.id === editingProjectId ? { ...p, ...newProject, ...geoPayload } : p))
        )
      }
    } else {
      await createProject({
        name: newProject.name,
        clientName: newProject.clientName,
        year: newProject.year,
        image: newProject.image,
        ...geoPayload,
        enabledWidgets: []
      })
      if (isCustomer) {
        const a = await apiClient.getMyProjectAllowance()
        if (a) setAllowance(a)
      }
    }

    setIsSubmitting(false)
    setIsModalOpen(false)
    setEditingProjectId(null)
    setFormErrors({})
    setNewProject(emptyProjectForm())
    await loadProjects()
  }

  const openEditModal = (project: any) => {
    setFormErrors({})
    const jurisdiction: "CITY" | "COUNTY" =
      String(project.jurisdictionType || "").toUpperCase() === "CITY" ? "CITY" : "COUNTY"
    const countyResolved =
      resolveSeFips(project.state || DEFAULT_STATE, project.county || DEFAULT_COUNTY) ||
      DEFAULT_RESOLVED
    const placeResolved =
      resolveSePlace(project.state || DEFAULT_STATE, project.city || DEFAULT_CITY) ||
      DEFAULT_PLACE
    setNewProject({
      name: project.name,
      clientName: project.clientName,
      year: project.year,
      image: project.image || "",
      jurisdictionType: jurisdiction,
      state: countyResolved?.state.name || placeResolved?.stateName || DEFAULT_STATE,
      county: countyResolved?.county.name || DEFAULT_COUNTY,
      city: placeResolved?.placeName || project.city || DEFAULT_CITY,
      stateFips: countyResolved?.stateFips || placeResolved?.stateFips || project.stateFips || "37",
      countyFips: countyResolved?.countyFips || project.countyFips || "001",
      placeFips: placeResolved?.placeFips || project.placeFips || "",
    })
    setEditingProjectId(project.id)
    setIsModalOpen(true)
  }

  const openCreateModal = () => {
    if (isCustomer && allowance && allowance.remaining <= 0) {
      toast.error(
        `Project limit reached (${allowance.usedProjects}/${allowance.maxProjects}). Purchase another package for more slots.`,
      )
      return
    }
    setFormErrors({})
    setNewProject(emptyProjectForm(isCustomer ? customerJurisdiction : "COUNTY"))
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

      {/* Search + New Project toolbar */}
      {(totalItems > 0 || searchTerm || statusFilter !== "all" || paginatedProjects.length > 0 || isFetchingProjects || (canCreatePermission && (!isCustomer || hasActiveSubscription(currentUser?.subscriptionStatus)))) && (
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1 min-w-0">
              <MagnifyingGlassIcon weight="bold" className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                  <XIcon weight="bold" className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {debouncedSearch && (
              <span className="text-xs text-slate-500 font-medium px-2.5 py-1.5 bg-slate-100 rounded-xl shrink-0 border border-slate-200/80 self-center">
                Found <strong className="text-slate-800">{totalItems}</strong> {totalItems === 1 ? 'project' : 'projects'}
              </span>
            )}
            <Dropdown
              value={statusFilter}
              onChange={(v) => {
                setStatusFilter(v)
                setCurrentPage(1)
              }}
              align="right"
              title="FILTER BY STATUS:"
              options={PROJECT_STATUS_FILTER_OPTIONS}
              className="shrink-0 w-full sm:w-auto"
            />
            {canCreatePermission && (!isCustomer || hasActiveSubscription(currentUser?.subscriptionStatus)) && (
              <div className="flex items-center gap-2 shrink-0 sm:ml-auto">
                {isCustomer && allowance && (
                  <span className="hidden sm:inline text-[11px] font-semibold text-slate-500 whitespace-nowrap">
                    {allowance.usedProjects}/{allowance.maxProjects} slots used
                  </span>
                )}
                <Button
                  onClick={openCreateModal}
                  disabled={isCustomer && allowance !== null && allowance.remaining <= 0}
                  className="w-full sm:w-auto"
                >
                  <PlusIcon weight="bold" className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </div>
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
      ) : totalItems === 0 && !debouncedSearch && statusFilter === "all" ? (
        <div className="p-12 text-center border border-dashed rounded-lg text-muted-foreground">
          No projects yet. Create one to start an assessment.
        </div>
      ) : paginatedProjects.length === 0 ? (
        <div className="p-12 text-center border border-dashed rounded-2xl bg-white text-muted-foreground space-y-3">
          <MagnifyingGlassIcon weight="duotone" className="w-8 h-8 text-slate-300 mx-auto" />
          <div className="text-base font-semibold text-slate-700">No Projects Found</div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {debouncedSearch
              ? `No projects match "${debouncedSearch}". Check your spelling or clear the search to view all projects.`
              : "No projects match the selected status. Try another filter."}
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
              <Card key={project.id} className="group hover:border-primary transition-colors flex flex-col overflow-hidden h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/projects/${project.id}/intake`} className="flex-1 min-w-0 hover:underline">
                      <div className="flex items-center gap-3 min-h-10">
                        {project.image ? (
                          <img
                            src={project.image}
                            alt={project.name}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0 shadow-sm"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                            <FolderIcon weight="duotone" className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        )}
                        <CardTitle className="text-lg leading-tight text-primary line-clamp-2 break-words">
                          {project.name}
                        </CardTitle>
                      </div>
                    </Link>
                    <div className="flex items-center shrink-0 w-14 justify-end gap-0.5">
                      {canEdit && (
                        <button
                          onClick={() => openEditModal(project)}
                          title="Edit Project Details"
                          className="text-muted-foreground hover:text-primary transition-colors p-1 cursor-pointer"
                        >
                          <PencilSimpleIcon weight="duotone" className="h-4 w-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => setProjectToDelete(project)}
                          title="Delete Project (Admin only)"
                          className="text-muted-foreground hover:text-red-500 transition-colors p-1 cursor-pointer"
                        >
                          <TrashIcon weight="duotone" className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col pt-0">
                  <div className="space-y-1 mb-4 min-h-[2.75rem]">
                    <p className="text-sm leading-5 text-muted-foreground font-normal truncate">
                      Client: {project.clientName}
                    </p>
                    <p className="text-xs leading-5 text-muted-foreground font-normal truncate">
                      {project.county || "Lee County"}, {project.state || "North Carolina"}
                      <span className="text-muted-foreground">
                        {" "}
                        (FIPS: {project.stateFips || "37"}-{project.countyFips || "105"})
                      </span>
                    </p>
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          if (!isSubmitting) {
            setIsModalOpen(false)
            setFormErrors({})
          }
        }}
        title={editingProjectId ? "Edit Project" : "Create New Project"}
      >
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
                      <XIcon weight="bold" className="w-3.5 h-3.5" />
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
                    <ImageIcon weight="duotone" className="w-6 h-6" />
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
                      <UploadSimpleIcon weight="bold" className="w-3.5 h-3.5" />
                      <span>{newProject.image ? "Change Image" : "Upload Image"}</span>
                    </>
                  )}
                </label>
                <span className="text-[11px] text-muted-foreground">PNG, JPG or WebP (Max 5MB)</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Project Name <span className="text-[#B5111B]">*</span>
            </label>
            <input
              className={cn(
                "w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
                formErrors.name ? "border-rose-500" : "border-input",
              )}
              value={newProject.name}
              onChange={e => {
                clearFieldError("name")
                setNewProject({ ...newProject, name: e.target.value })
              }}
              placeholder="e.g. Town of Wake Forest, NC, 2026"
            />
            {formErrors.name && (
              <p className="text-xs font-medium text-rose-600">{formErrors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Client Name <span className="text-[#B5111B]">*</span>
            </label>
            <input
              className={cn(
                "w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
                formErrors.clientName ? "border-rose-500" : "border-input",
              )}
              value={newProject.clientName}
              onChange={e => {
                clearFieldError("clientName")
                setNewProject({ ...newProject, clientName: e.target.value })
              }}
              placeholder="e.g. Wake Forest"
            />
            {formErrors.clientName && (
              <p className="text-xs font-medium text-rose-600">{formErrors.clientName}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Year <span className="text-[#B5111B]">*</span>
            </label>
            <input
              type="number"
              className={cn(
                "w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
                formErrors.year ? "border-rose-500" : "border-input",
              )}
              value={newProject.year}
              onChange={e => {
                clearFieldError("year")
                setNewProject({ ...newProject, year: parseInt(e.target.value) || 0 })
              }}
            />
            {formErrors.year && (
              <p className="text-xs font-medium text-rose-600">{formErrors.year}</p>
            )}
          </div>

          {/* Location & 3rd-Party Data Source Configuration */}
          <div className="space-y-3 p-3.5 bg-muted/20 border border-border rounded-lg">

            {!isCustomer && (
              <div className="space-y-1.5 mb-1">
                <label className="text-xs font-medium text-foreground">
                  Jurisdiction <span className="text-[#B5111B]">*</span>
                </label>
                <Dropdown
                  fullWidth
                  size="md"
                  value={newProject.jurisdictionType}
                  onChange={(v) =>
                    setNewProject((prev) => ({
                      ...prev,
                      jurisdictionType: v === "CITY" ? "CITY" : "COUNTY",
                    }))
                  }
                  options={[
                    { value: "COUNTY", label: "County Rep (county APIs)" },
                    { value: "CITY", label: "City/Town Rep (place APIs)" },
                  ]}
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  State <span className="text-[#B5111B]">*</span>
                </label>
                <Dropdown
                  fullWidth
                  size="md"
                  direction="down"
                  value={newProject.state}
                  onChange={handleStateChange}
                  options={SE_STATES.map((s) => ({
                    value: s.name,
                    label: `${s.name} (${s.abbr})`,
                  }))}
                />
                {formErrors.state && (
                  <p className="text-xs font-medium text-rose-600">{formErrors.state}</p>
                )}
              </div>

              {isCityMode ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    City <span className="text-[#B5111B]">*</span>
                  </label>
                  <Dropdown
                    fullWidth
                    size="md"
                    direction="down"
                    value={newProject.city}
                    onChange={handleCityChange}
                    options={placeOptions.map((p) => ({
                      value: p.name,
                      label: p.name,
                    }))}
                  />
                  {formErrors.city && (
                    <p className="text-xs font-medium text-rose-600">{formErrors.city}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    County <span className="text-[#B5111B]">*</span>
                  </label>
                  <Dropdown
                    fullWidth
                    size="md"
                    direction="down"
                    value={newProject.county}
                    onChange={handleCountyChange}
                    options={countyOptions.map((c) => ({
                      value: c.name,
                      label: c.name,
                    }))}
                  />
                  {formErrors.county && (
                    <p className="text-xs font-medium text-rose-600">{formErrors.county}</p>
                  )}
                </div>
              )}
            </div>

            {!isCustomer && (
              <p className="text-[11px] text-muted-foreground font-mono">
                {isCityMode
                  ? `Place FIPS ${newProject.stateFips || "—"}-${newProject.placeFips || "—"} · Census ACS place (BLS skipped)`
                  : `County FIPS ${newProject.stateFips || "—"}-${newProject.countyFips || "—"} · Census ACS / BLS`}
              </p>
            )}
            <p className="text-[11px] text-muted-foreground">
              {isCityMode
                ? "City/Town scorecards use Census place geography. County-only APIs (BLS LAUS, EPA byCounty) are skipped."
                : "County scorecards use Census county + BLS LAUS and related county APIs."}
            </p>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false)
                setFormErrors({})
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
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
