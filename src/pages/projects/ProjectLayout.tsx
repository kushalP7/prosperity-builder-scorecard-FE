"use client"

import * as React from "react"
import { useAppStore } from "@/store"
import { Link, usePathname, useRouter, useParams } from "@/lib/router-compat"
import { Outlet } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import {
  ArrowLeftIcon,
  CheckIcon,
  CheckCircleIcon,
  PlusIcon,
  StackIcon,
  ArrowsClockwiseIcon
} from "@phosphor-icons/react"

import { apiClient } from "@/lib/api"
import { Spinner } from "@/components/ui/loader"
import { toast } from "@/components/ui/toast"

type StagedMetric = {
  id?: string
  source?: string
  metricLabel?: string
  metricKey?: string
  categoryKey?: string
  extractedValue?: number | string | null
  unit?: string
  ingestionStatus?: string
}

type SyncSummary = {
  stagedCount: number
  populatedMatrixCount?: number
  calculatedRows?: number
  overallScore?: number
  bySource: Array<{
    source: string
    items: StagedMetric[]
  }>
}

function formatSourceLabel(source: string): string {
  const map: Record<string, string> = {
    US_CENSUS: 'US Census Bureau',
    BLS: 'Bureau of Labor Statistics (BLS)',
    EPA: 'EPA Air Quality',
    NCDOT_GIS: 'NCDOT GIS',
    ESRI: 'ESRI / ArcGIS',
    NC_DPI: 'NC DPI',
    CDC_PLACES: 'CDC PLACES',
  }
  return map[source] || source.replace(/_/g, ' ')
}

function getApiSourceChipClass(source: string): string {
  const s = (source || '').toUpperCase()
  if (s.includes('NCDOT')) return 'bg-sky-100 text-sky-900 border-sky-200'
  if (s.includes('CENSUS')) return 'bg-teal-100 text-teal-900 border-teal-200'
  if (s.includes('BLS')) return 'bg-violet-100 text-violet-900 border-violet-200'
  if (s.includes('EPA')) return 'bg-amber-100 text-amber-900 border-amber-200'
  if (s.includes('CDC')) return 'bg-rose-100 text-rose-900 border-rose-200'
  if (s.includes('ESRI')) return 'bg-indigo-100 text-indigo-900 border-indigo-200'
  return 'bg-slate-100 text-slate-800 border-slate-200'
}

function groupStagedBySource(staged: StagedMetric[]): SyncSummary['bySource'] {
  const groups = new Map<string, StagedMetric[]>()
  for (const item of staged) {
    const key = item.source || 'UNKNOWN'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(item)
  }
  return Array.from(groups.entries())
    .map(([source, items]) => ({ source, items }))
    .sort((a, b) => a.source.localeCompare(b.source))
}

export default function ProjectLayout({
  children,
}: {
  children?: React.ReactNode
}) {
  const routeParams = useParams<{ id: string }>()
  const id = routeParams.id || ""
  const pathname = usePathname()
  const router = useRouter()

  const { projects, templates, assignSectionsToProject, assignSectionToProject, fetchTemplates } = useAppStore()
  const project = projects.find(p => p.id === id)

  const [isAssignModalOpen, setIsAssignModalOpen] = React.useState(false)
  const [selectedSectionIds, setSelectedSectionIds] = React.useState<string[]>([])
  const [isAssigning, setIsAssigning] = React.useState(false)
  const [isLoadingProject, setIsLoadingProject] = React.useState(!project)
  const [isSyncing, setIsSyncing] = React.useState(false)
  const [syncMessage, setSyncMessage] = React.useState<string | null>(null)
  const [isSyncResultOpen, setIsSyncResultOpen] = React.useState(false)
  const [syncSummary, setSyncSummary] = React.useState<SyncSummary | null>(null)

  const handleSyncLiveApis = async () => {
    if (!id || isSyncing) return
    if (!project?.assignedSections || project.assignedSections.length === 0) {
      toast.error('Please assign at least one section before syncing and calculating.')
      return
    }
    setIsSyncing(true)
    setSyncMessage(null)
    try {
      const res = await apiClient.triggerIngestion(id)

      // Single project refresh after trigger (listeners reuse this via project-synced detail)
      const fresh = await apiClient.getProject(id)
      if (fresh) {
        useAppStore.setState(state => {
          const exists = state.projects.some(p => p.id === id)
          return {
            projects: exists
              ? state.projects.map(p => p.id === id ? { ...p, ...fresh, data: fresh.data || p.data } : p)
              : [...state.projects, fresh],
            activeProject: state.activeProject?.id === id ? { ...state.activeProject, ...fresh, data: fresh.data || state.activeProject.data } : state.activeProject,
          }
        })
      }

      // Prefer stagedRecords from trigger response — avoids a second staged-data GET
      const staged: StagedMetric[] = Array.isArray(res?.stagedRecords)
        ? res.stagedRecords
        : []
      const summary: SyncSummary = {
        stagedCount: res?.stagedCount ?? staged.length,
        populatedMatrixCount: res?.populatedMatrixCount,
        calculatedRows: res?.calculatedRows,
        overallScore: res?.overallScore,
        bySource: groupStagedBySource(staged),
      }
      setSyncSummary(summary)
      setIsSyncResultOpen(true)

      setSyncMessage('APIs Ingested & Calculated!')
      toast.success(res?.message || 'Live APIs synced & scores calculated successfully!')
      window.dispatchEvent(new CustomEvent('project-synced', { detail: { id, fresh, skipRefetch: true } }))
      setTimeout(() => setSyncMessage(null), 4000)
    } catch (err: any) {
      console.error('Failed to sync live APIs:', err)
      toast.error('Failed to sync live APIs')
    } finally {
      setIsSyncing(false)
    }
  }

  React.useEffect(() => {
    // Base project route opens Client Intake first (workflow step 1)
    if (pathname === `/projects/${id}`) {
      router.replace(`/projects/${id}/intake`)
    }
  }, [pathname, id, router])

  React.useEffect(() => {
    let isMounted = true;
    async function loadProject() {
      // Ensure global templates are loaded in background
      fetchTemplates();

      // If project is not in store, or only has summary without categories
      if (!project || !project.assignedSections || project.assignedSections.some(s => !s.categories)) {
        setIsLoadingProject(true);
        try {
          const fresh = await apiClient.getProject(id);
          if (fresh && isMounted) {
            useAppStore.setState(state => {
              const exists = state.projects.some(p => p.id === id);
              return {
                projects: exists
                  ? state.projects.map(p => p.id === id ? { ...p, ...fresh, data: fresh.data || p.data } : p)
                  : [...state.projects, fresh],
                activeProject: fresh,
              };
            });
          }
        } catch (err) {
          console.error("Failed to load project details:", err);
        } finally {
          if (isMounted) setIsLoadingProject(false);
        }
      } else {
        setIsLoadingProject(false);
      }
    }
    loadProject();
    return () => { isMounted = false; };
  }, [id]);

  if (isLoadingProject && !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Spinner className="w-8 h-8 text-primary" />
        <span className="text-sm text-muted-foreground">Loading project...</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 flex flex-col items-start gap-4">
        <div className="text-lg font-semibold text-foreground">Project not found</div>
        <p className="text-sm text-muted-foreground">The requested project could not be found or has been removed.</p>
        <Button variant="outline" onClick={() => router.push('/projects')}>
          <ArrowLeftIcon weight="bold" className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>
      </div>
    );
  }



  const handleToggleSelectAll = (availTemplates: typeof availableTemplates) => {
    if (selectedSectionIds.length === availTemplates.length) {
      setSelectedSectionIds([])
    } else {
      setSelectedSectionIds(availTemplates.map(t => t.id))
    }
  }

  const handleToggleSection = (templateId: string) => {
    setSelectedSectionIds(prev =>
      prev.includes(templateId) ? prev.filter(id => id !== templateId) : [...prev, templateId]
    )
  }

  const handleBatchAssign = async () => {
    if (selectedSectionIds.length === 0 || isAssigning) return
    setIsAssigning(true)
    try {
      await assignSectionsToProject(project.id, selectedSectionIds)
      setSelectedSectionIds([])
      setIsAssignModalOpen(false)
    } finally {
      setIsAssigning(false)
    }
  }


  // Deduplicate global templates by label / name
  const uniqueTemplatesMap = new Map<string, typeof templates[0]>();
  (templates || []).forEach(t => {
    const key = (t.label || t.id || '').trim().toLowerCase();
    if (key && !uniqueTemplatesMap.has(key)) {
      uniqueTemplatesMap.set(key, t);
    }
  });
  const uniqueTemplates = Array.from(uniqueTemplatesMap.values());

  // Find assigned section keys (matching by normalized label or ID)
  const assignedKeys = new Set(
    (project.assignedSections || []).map(as => (as.label || as.id || '').trim().toLowerCase())
  );

  // Available templates are unique templates that are NOT assigned to this project
  const availableTemplates = uniqueTemplates.filter(t => {
    const key = (t.label || t.id || '').trim().toLowerCase();
    return !assignedKeys.has(key);
  });

  // Deduplicate assigned sections display
  const uniqueAssignedSectionsMap = new Map<string, typeof project.assignedSections[0]>();
  (project.assignedSections || []).forEach(s => {
    const key = (s.label || s.id || '').trim().toLowerCase();
    if (key && !uniqueAssignedSectionsMap.has(key)) {
      uniqueAssignedSectionsMap.set(key, s);
    }
  });
  const uniqueAssignedSections = Array.from(uniqueAssignedSectionsMap.values());

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/projects"
              className="p-2 -ml-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors flex items-center justify-center shrink-0"
              title="Back to Projects"
            >
              <ArrowLeftIcon weight="bold" className="h-6 w-6" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{project.name}</h2>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${project.status === 'PUBLISHED'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : project.status === 'IN_REVIEW'
                    ? 'bg-purple-50 text-purple-700 border-purple-300'
                    : project.status === 'CALCULATED'
                      ? 'bg-blue-50 text-blue-700 border-blue-300'
                      : project.status === 'INTAKE_SUBMITTED'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                        : project.status === 'INGESTION_RUNNING'
                          ? 'bg-cyan-50 text-cyan-700 border-cyan-300'
                          : 'bg-amber-50 text-amber-700 border-amber-300'
                  }`}>
                  {project.status || 'INTAKE_PENDING'}
                </span>
              </div>
              <p className="text-muted-foreground mt-1 text-xs">Client: {project.clientName} &bull; {project.year} &bull; {project.packageType || 'Standard Scorecard'}</p>
            </div>
          </div>
          <Button
            onClick={() => {
              setSelectedSectionIds([])
              setIsAssignModalOpen(true)
            }}
            size="sm"
            variant="outline"
          >
            <PlusIcon weight="bold" className="h-3.5 w-3.5 mr-1.5" />
            Assign Section
          </Button>
        </div>

        {/* Phase Navigation Tabs & Sync Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 mt-5 pb-2.5">
          {/* Phase Navigation Tabs — Intake → Executive → Calibration */}
          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/90 shadow-2xs overflow-x-auto">
            <Link
              href={`/projects/${id}/intake`}
              className={cn(
                "group flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm transition-all duration-150 whitespace-nowrap cursor-pointer select-none",
                pathname.includes('/intake')
                  ? "bg-white text-slate-900 font-bold shadow-xs border border-slate-200/90"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60 font-medium"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black transition-colors shrink-0",
                pathname.includes('/intake') ? "bg-[#B5111B] text-white shadow-2xs" : "bg-slate-200 text-slate-600 group-hover:bg-slate-300"
              )}>
                1
              </div>
              <span>Client Intake</span>
            </Link>

            <Link
              href={`/projects/${id}/data`}
              className={cn(
                "group flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm transition-all duration-150 whitespace-nowrap cursor-pointer select-none",
                pathname.includes('/data')
                  ? "bg-white text-slate-900 font-bold shadow-xs border border-slate-200/90"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60 font-medium"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black transition-colors shrink-0",
                pathname.includes('/data') ? "bg-[#B5111B] text-white shadow-2xs" : "bg-slate-200 text-slate-600 group-hover:bg-slate-300"
              )}>
                2
              </div>
              <span>Executive Scorecard</span>
            </Link>

            <Link
              href={`/projects/${id}/calibration`}
              className={cn(
                "group flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm transition-all duration-150 whitespace-nowrap cursor-pointer select-none",
                pathname.includes('/calibration')
                  ? "bg-white text-slate-900 font-bold shadow-xs border border-slate-200/90"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60 font-medium"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black transition-colors shrink-0",
                pathname.includes('/calibration') ? "bg-[#B5111B] text-white shadow-2xs" : "bg-slate-200 text-slate-600 group-hover:bg-slate-300"
              )}>
                3
              </div>
              <span>Calibration & Release</span>
            </Link>
          </div>

          {/* Sync Live APIs & Calculate Button (Active on Intake & Executive) */}
          {!pathname.includes('/calibration') && (
            <div className="flex items-center gap-2.5 shrink-0">
              {syncMessage && (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg flex items-center gap-1.5 animate-in fade-in shadow-2xs">
                  <CheckCircleIcon weight="duotone" className="w-3.5 h-3.5 text-emerald-600" />
                  {syncMessage}
                </span>
              )}
              {(() => {
                const hasAssigned = (project.assignedSections || []).length > 0;
                return (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSyncLiveApis}
                    disabled={isSyncing || !hasAssigned}
                    className={cn(
                      "text-xs h-9 rounded-xl px-4 border-red-200/90 bg-red-50/80 text-[#B5111B] hover:bg-red-100 hover:border-red-300 font-bold shadow-xs flex items-center gap-2 transition-all",
                      !hasAssigned ? "opacity-40 cursor-not-allowed hover:bg-red-50/80" : "cursor-pointer active:scale-98"
                    )}
                    title={!hasAssigned ? "Assign at least one section before calculating" : "Sync live external APIs and recalculate project scores"}
                  >
                    <ArrowsClockwiseIcon weight="bold" className={cn("w-3.5 h-3.5 text-[#B5111B]", isSyncing && "animate-spin")} />
                    <span>{isSyncing ? "Syncing & Calculating..." : "Sync Live APIs & Calculate"}</span>
                  </Button>
                );
              })()}
            </div>
          )}
        </div>

      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 flex flex-col">
        {children || <Outlet />}
      </div>

      {/* Assign Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => {
          if (!isAssigning) {
            setIsAssignModalOpen(false)
            setSelectedSectionIds([])
          }
        }}
        title="Assign Global Sections"
        className="max-w-2xl"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Select global sections to clone into this project. You can select multiple sections and assign them simultaneously without delays.
          </p>

          <div className="max-h-[60vh] overflow-y-auto pr-1.5 space-y-5">
            {/* Available Templates Header & Actions */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between pb-1 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <StackIcon weight="duotone" className="w-3.5 h-3.5" />
                    Available Sections ({availableTemplates.length})
                  </h5>
                  {availableTemplates.length > 0 && (
                    <button
                      type="button"
                      disabled={isAssigning}
                      onClick={() => handleToggleSelectAll(availableTemplates)}
                      className="text-xs text-[#B5111B] hover:text-[#9B0F17] font-semibold hover:underline ml-2 cursor-pointer transition-colors"
                    >
                      {selectedSectionIds.length === availableTemplates.length ? "Deselect All" : "Select All"}
                    </button>
                  )}
                </div>

                {availableTemplates.length > 0 && (
                  <Button
                    size="sm"
                    disabled={selectedSectionIds.length === 0 || isAssigning}
                    onClick={handleBatchAssign}
                    className="bg-[#B5111B] text-white hover:bg-[#9B0F17] h-8 px-3.5 text-xs font-bold rounded-lg shadow-sm cursor-pointer disabled:opacity-50 transition-all"
                  >
                    {isAssigning ? (
                      <>
                        <ArrowsClockwiseIcon weight="bold" className="w-3 h-3 mr-1.5 animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      `Assign Selected (${selectedSectionIds.length})`
                    )}
                  </Button>
                )}
              </div>

              {availableTemplates.length === 0 && (
                <div className="p-6 text-center border border-dashed rounded-xl text-muted-foreground bg-muted/20 text-sm">
                  All global sections have already been assigned to this project.
                </div>
              )}

              <div className="space-y-2">
                {availableTemplates.map(template => {
                  const isSelected = selectedSectionIds.includes(template.id);
                  return (
                    <div
                      key={template.id}
                      onClick={() => !isAssigning && handleToggleSection(template.id)}
                      className={cn(
                        "flex items-center justify-between p-3.5 border rounded-xl transition-all cursor-pointer select-none group",
                        isSelected
                          ? "bg-[#B5111B]/[0.04] border-[#B5111B]/70 shadow-xs"
                          : "bg-background border-border/80 hover:border-[#B5111B]/50 hover:bg-muted/30"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Checkbox */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isAssigning) handleToggleSection(template.id);
                          }}
                          className={cn(
                            "w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 cursor-pointer",
                            isSelected
                              ? "bg-[#B5111B] border-[#B5111B] text-white shadow-2xs"
                              : "border-slate-300 bg-white group-hover:border-[#B5111B]/60"
                          )}
                        >
                          {isSelected && <CheckIcon weight="bold" className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        {/* Color dot */}
                        <div
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: template.accentColor || '#B5111B' }}
                        />

                        {/* Label & Details */}
                        <div className="min-w-0">
                          <h4 className={cn(
                            "font-bold text-sm transition-colors truncate",
                            isSelected ? "text-[#B5111B]" : "text-foreground group-hover:text-[#B5111B]"
                          )}>
                            {template.label}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {template.categories?.length || 0} {(template.categories?.length || 0) === 1 ? 'category' : 'categories'}
                            {template.columns && template.columns.length > 0 && ` • ${template.columns.length} columns`}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sticky footer when items are selected */}
            {selectedSectionIds.length > 0 && (
              <div className="pt-3 border-t border-border flex items-center justify-between bg-background sticky bottom-0 z-10 py-2">
                <div className="text-xs font-medium text-muted-foreground">
                  <span className="font-bold text-foreground text-sm text-[#B5111B]">{selectedSectionIds.length}</span> of {availableTemplates.length} sections selected
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isAssigning}
                    onClick={() => setSelectedSectionIds([])}
                    className="text-xs h-8 cursor-pointer"
                  >
                    Clear Selection
                  </Button>
                  <Button
                    size="sm"
                    disabled={isAssigning}
                    onClick={handleBatchAssign}
                    className="bg-[#B5111B] text-white hover:bg-[#9B0F17] h-8 px-4 text-xs font-bold rounded-lg shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isAssigning ? (
                      <>
                        <ArrowsClockwiseIcon weight="bold" className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      `Assign Selected (${selectedSectionIds.length})`
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Already Assigned Sections */}
            {uniqueAssignedSections.length > 0 && (
              <div className="pt-3 border-t border-border/70 space-y-2.5">
                <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <CheckCircleIcon weight="duotone" className="w-3.5 h-3.5 text-emerald-600" />
                  Already Assigned ({uniqueAssignedSections.length})
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {uniqueAssignedSections.map(s => (
                    <div
                      key={s.id}
                      className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200/60 text-xs font-semibold text-emerald-950"
                    >
                      <CheckCircleIcon weight="duotone" className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="truncate">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Sync Live APIs result — data by source */}
      <Modal
        isOpen={isSyncResultOpen}
        onClose={() => setIsSyncResultOpen(false)}
        title="API Sync Complete"
        className="max-w-2xl"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Third-party data was ingested and the scorecard was recalculated. Review what was retrieved from each source below.
          </p>

          {syncSummary && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-center">
                  <div className="text-base font-black text-slate-900">{syncSummary.stagedCount}</div>
                  <div className="text-[10px] font-medium text-slate-500 mt-0.5">Staged metrics</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-center">
                  <div className="text-base font-black text-slate-900">{syncSummary.populatedMatrixCount ?? '—'}</div>
                  <div className="text-[10px] font-medium text-slate-500 mt-0.5">Matrix rows filled</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-center">
                  <div className="text-base font-black text-slate-900">{syncSummary.calculatedRows ?? '—'}</div>
                  <div className="text-[10px] font-medium text-slate-500 mt-0.5">Rows calculated</div>
                </div>
                <div className="rounded-xl border border-rose-200 bg-rose-50/70 px-3 py-2.5 text-center">
                  <div className="text-base font-black text-[#B5111B]">
                    {syncSummary.overallScore != null ? `${syncSummary.overallScore}/10` : '—'}
                  </div>
                  <div className="text-[10px] font-medium text-rose-700/80 mt-0.5">Overall score</div>
                </div>
              </div>

              <div className="max-h-[50vh] overflow-y-auto space-y-3 pr-1">
                {syncSummary.bySource.length === 0 ? (
                  <div className="text-sm text-slate-500 text-center py-8 border border-dashed border-slate-200 rounded-xl">
                    No staged API records were returned for this run.
                  </div>
                ) : (
                  syncSummary.bySource.map(group => (
                    <div key={group.source} className="rounded-xl border border-slate-200/90 overflow-hidden">
                      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-slate-50 border-b border-slate-200/80">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold',
                            getApiSourceChipClass(group.source)
                          )}
                        >
                          {formatSourceLabel(group.source)}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {group.items.length} metric{group.items.length === 1 ? '' : 's'}
                        </span>
                      </div>
                      <ul className="divide-y divide-slate-100">
                        {group.items.map((item, idx) => (
                          <li
                            key={item.id || `${item.metricKey}-${idx}`}
                            className="flex items-start justify-between gap-3 px-3 py-2 text-xs"
                          >
                            <div className="min-w-0">
                              <div className="font-medium text-slate-900 leading-snug">
                                {item.metricLabel || item.metricKey || 'Metric'}
                              </div>
                              {item.categoryKey && (
                                <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                                  {item.categoryKey}
                                </div>
                              )}
                            </div>
                            <div className="shrink-0 text-right font-mono">
                              <span className="font-bold text-slate-900">
                                {item.extractedValue != null && item.extractedValue !== ''
                                  ? String(item.extractedValue)
                                  : '—'}
                              </span>
                              {item.unit && (
                                <span className="text-slate-400 ml-1">{item.unit}</span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          <div className="flex justify-end pt-1">
            <Button
              type="button"
              onClick={() => setIsSyncResultOpen(false)}
              className="bg-[#B5111B] hover:bg-[#8F0D15] text-white font-bold rounded-xl px-5"
            >
              Got it
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
