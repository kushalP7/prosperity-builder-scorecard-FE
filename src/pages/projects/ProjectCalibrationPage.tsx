"use client"

import * as React from "react"
import { useParams } from "@/lib/router-compat"
import { useAppStore } from "@/store"
import { apiClient } from "@/lib/api"
import { toast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ShieldCheckIcon,
  ArrowsClockwiseIcon,
  DatabaseIcon,
  MedalIcon,
  FilePdfIcon,
  UploadSimpleIcon,
  DownloadSimpleIcon,
  ArrowSquareOutIcon,
  XIcon,
  ChartPieIcon,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/loader"
import { Modal } from "@/components/ui/modal"
import { CategoryChartsModal } from "@/components/calibration/CategoryChartsModal"

type PendingReport = {
  reportUrl: string
  reportPublicId?: string
  reportFileName: string
}

export default function ProjectCalibrationPage() {
  const routeParams = useParams<{ id: string }>()
  const id = routeParams.id || ""
  const { projects, templates, widgets, fetchTemplates, fetchWidgets, currentUser } = useAppStore()
  const project = projects.find((p) => p.id === id)
  const isSuperAdmin = String(currentUser?.role || "").toLowerCase() === "super_admin"

  const [loading, setLoading] = React.useState(true)
  const [recalculating, setRecalculating] = React.useState(false)
  const [publishing, setPublishing] = React.useState(false)
  const [isPublishModalOpen, setIsPublishModalOpen] = React.useState(false)
  const [isReplaceModalOpen, setIsReplaceModalOpen] = React.useState(false)
  const [uploadingReport, setUploadingReport] = React.useState(false)
  const [replacingReport, setReplacingReport] = React.useState(false)
  const [replaceReport, setReplaceReport] = React.useState<PendingReport | null>(null)
  const replaceFileRef = React.useRef<HTMLInputElement>(null)
  const [ingesting, setIngesting] = React.useState(false)
  const [rollup, setRollup] = React.useState<any>(null)
  const [stagedData, setStagedData] = React.useState<any[]>([])
  const [overrides, setOverrides] = React.useState<Record<string, number>>({})
  const [notes, setNotes] = React.useState<string>('')
  const [chartsCategory, setChartsCategory] = React.useState<string | null>(null)
  const [downloadingTopLow, setDownloadingTopLow] = React.useState(false)

  const loadAll = React.useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const [rData, sData, pData] = await Promise.all([
        apiClient.getScorecardRollup(id),
        apiClient.getStagedData(id),
        apiClient.getProject(id),
      ])
      if (pData) {
        useAppStore.setState(state => ({
          projects: state.projects.map(p => p.id === id ? { ...p, ...pData } : p),
          activeProject: state.activeProject?.id === id ? { ...state.activeProject, ...pData } : state.activeProject,
        }))
      }
      if (rData) {
        setRollup(rData)
        setNotes(rData.calibrationNotes || '')
        const existingOverrides: Record<string, number> = {}
        if (rData.analystOverrides) {
          Object.keys(rData.analystOverrides).forEach((k) => {
            existingOverrides[k] = rData.analystOverrides[k].calibratedValue
          })
        }
        setOverrides(existingOverrides)
      }
      if (sData) {
        const list = Array.isArray(sData) ? sData : (Array.isArray(sData.data) ? sData.data : [])
        setStagedData(list)
      } else {
        setStagedData([])
      }
    } catch (err) {
      console.error('Error loading calibration data:', err)
    } finally {
      setLoading(false)
    }
  }, [id])

  React.useEffect(() => {
    loadAll()
    void fetchTemplates()
    void fetchWidgets()
    const handleSync = (e: Event) => {
      const detail = (e as CustomEvent)?.detail
      // When layout already refreshed the project, still reload rollup/staged but skip duplicate getProject
      if (detail?.skipRefetch && detail?.fresh) {
        useAppStore.setState(state => ({
          projects: state.projects.map(p => p.id === id ? { ...p, ...detail.fresh } : p),
          activeProject: state.activeProject?.id === id ? { ...state.activeProject, ...detail.fresh } : state.activeProject,
        }))
        Promise.all([
          apiClient.getScorecardRollup(id),
          apiClient.getStagedData(id),
        ]).then(([rData, sData]) => {
          if (rData) {
            setRollup(rData)
            setNotes(rData.calibrationNotes || '')
          }
          if (sData) {
            const list = Array.isArray(sData) ? sData : (Array.isArray(sData.data) ? sData.data : [])
            setStagedData(list)
          }
        }).catch(console.error)
        return
      }
      loadAll()
    }
    window.addEventListener('project-synced', handleSync)
    window.addEventListener('project-section-assigned', handleSync)
    return () => {
      window.removeEventListener('project-synced', handleSync)
      window.removeEventListener('project-section-assigned', handleSync)
    }
  }, [loadAll, id])

  const handleTriggerIngestion = async () => {
    setIngesting(true)
    try {
      const res = await apiClient.triggerIngestion(id)
      if (res?.success) {
        toast.success(`Automated ingestion complete (${res.stagedCount} records fetched)`)
        await loadAll()
      } else {
        toast.error(
          res?.message ||
            'Sync could not run. Assign sections and confirm project location, then try again.',
        )
      }
    } catch {
      toast.error('Failed to run ingestion')
    } finally {
      setIngesting(false)
    }
  }

  const handleRecalculate = async () => {
    setRecalculating(true)
    try {
      const formattedOverrides: Record<string, any> = {}
      Object.keys(overrides).forEach((k) => {
        formattedOverrides[k] = {
          calibratedValue: overrides[k],
          reason: 'Analyst adjustment during calibration',
          calibratedBy: 'Kathleen Rose',
          timestamp: new Date().toISOString(),
        }
      })
      await apiClient.applyCalibration(id, formattedOverrides, notes)
      const updated = await apiClient.recalculateScorecard(id)
      if (updated) {
        setRollup(updated)
        toast.success('Scorecard calibrated & moved to IN_REVIEW successfully')
      }
      const freshProject = await apiClient.getProject(id)
      if (freshProject) {
        useAppStore.setState(state => ({
          projects: state.projects.map(p => p.id === id ? { ...p, ...freshProject } : p),
          activeProject: state.activeProject?.id === id ? { ...state.activeProject, ...freshProject } : state.activeProject,
        }))
        window.dispatchEvent(new CustomEvent('project-synced', { detail: { id, fresh: freshProject } }))
      }
    } catch {
      toast.error('Failed to recalculate scorecard')
    } finally {
      setRecalculating(false)
    }
  }

  const uploadPdfFile = async (file: File): Promise<PendingReport | null> => {
    if (!file) return null
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please upload a PDF file')
      return null
    }
    setUploadingReport(true)
    try {
      const folder = `projects/${id}/reports`
      const uploaded = await apiClient.uploadFile(file, folder)
      const reportUrl = (uploaded as any)?.url || (uploaded as any)?.secure_url
      if (!reportUrl) throw new Error('Upload did not return a file URL')
      return {
        reportUrl,
        reportPublicId: (uploaded as any)?.public_id || (uploaded as any)?.publicId,
        reportFileName: file.name,
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to upload PDF')
      return null
    } finally {
      setUploadingReport(false)
    }
  }

  const handlePublish = () => {
    setIsPublishModalOpen(true)
  }

  const handleDetailedFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const uploaded = await uploadPdfFile(file)
    if (uploaded) setReplaceReport(uploaded)
  }

  const refreshProjectInStore = async () => {
    const freshProject = await apiClient.getProject(id)
    if (freshProject) {
      useAppStore.setState(state => ({
        projects: state.projects.map(p => p.id === id ? { ...p, ...freshProject } : p),
        activeProject: state.activeProject?.id === id ? { ...state.activeProject, ...freshProject } : state.activeProject,
      }))
      window.dispatchEvent(new CustomEvent('project-synced', { detail: { id, fresh: freshProject } }))
    }
    return freshProject
  }

  const executePublish = async () => {
    setPublishing(true)
    try {
      await apiClient.publishScorecard(id)
      toast.success('Published - initial scorecard PDF generated and emailed to the customer.')
      await loadAll()
      await refreshProjectInStore()
      setIsPublishModalOpen(false)
    } catch (err: any) {
      toast.error(err?.message || 'Failed to publish scorecard')
    } finally {
      setPublishing(false)
    }
  }

  const executeReplaceReport = async () => {
    if (!replaceReport?.reportUrl) {
      toast.error('Upload a PDF for the detailed report')
      return
    }
    setReplacingReport(true)
    try {
      await apiClient.replaceProjectReport(id, replaceReport)
      toast.success(
        project?.certifiedReportUrl
          ? 'Detailed report replaced and emailed to the customer.'
          : 'Detailed report uploaded and emailed to the customer.',
      )
      await refreshProjectInStore()
      setIsReplaceModalOpen(false)
      setReplaceReport(null)
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update detailed report')
    } finally {
      setReplacingReport(false)
    }
  }

  const handleDownloadTopLow = async () => {
    if (!id) return
    setDownloadingTopLow(true)
    try {
      const result = await apiClient.downloadTopLowPerformingPdf(id)
      if (!result.success || !result.blob) {
        toast.error(result.message || 'Could not download Top & Lowest PDF')
        return
      }
      const url = URL.createObjectURL(result.blob)
      const a = document.createElement('a')
      a.href = url
      a.download = result.filename || 'Top-Low-Performing.pdf'
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Top & Lowest Performing PDF downloaded')
    } catch (err: any) {
      toast.error(err?.message || 'Could not download Top & Lowest PDF')
    } finally {
      setDownloadingTopLow(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-3">
        <Spinner className="w-8 h-8 text-[#B5111B]" />
        <span className="text-sm font-medium text-slate-500">Loading Calibration & Review Console...</span>
      </div>
    )
  }

  const categoryScores = rollup?.categoryScores || []
  const isPublished = project?.status === 'PUBLISHED'
  const initialReportUrl = project?.initialReportUrl || null
  const initialReportFileName = project?.initialReportFileName || 'Initial Scorecard Report.pdf'
  const certifiedReportUrl = project?.certifiedReportUrl || null
  const certifiedReportFileName = project?.certifiedReportFileName || 'Detailed Scorecard Report.pdf'

  return (
    <div className="space-y-6 pb-16">
      {/* Executive Header Banner */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#B5111B]" />
        
        <div className="space-y-2 max-w-2xl">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Scorecard Calibration & Final Release
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Review normalized scores across the 12 categories, cross-reference automated secondary API data, apply expert overrides, and finalize delivery.
          </p>
        </div>

        {/* Executive Rollup Card */}
        <div className="bg-slate-50/90 p-4 rounded-xl border border-slate-200/90 min-w-[260px] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Overall Rollup</span>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
              rollup?.performanceBand === 'Good' || rollup?.performanceBand === 'Excellent'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                : 'bg-amber-50 text-amber-700 border border-amber-300'
            }`}>
              {rollup?.performanceBand || 'Average'} Band
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900">{rollup?.overallScoreTenScale || '0.0'}</span>
            <span className="text-sm font-semibold text-slate-400">/ 10.0</span>
            <span className="text-xs font-bold text-[#B5111B] ml-auto bg-red-50 border border-red-200/70 px-2 py-0.5 rounded-md">
              {rollup?.overallScorePercentage || '0'}% Overall
            </span>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1.5 border-t border-slate-200/80">
            <span>Methodology:</span>
            <span className="font-semibold text-slate-800">
              {categoryScores.length === 0
                ? 'No Sections Assigned'
                : categoryScores.length === 1
                  ? 'Single Section Score'
                  : `Equal ${categoryScores.length}-Category Average`}
            </span>
          </div>
        </div>
      </div>

      {/* Control Actions Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRecalculate}
            disabled={recalculating || categoryScores.length === 0}
            className="flex items-center gap-1.5 text-xs h-9 px-4 rounded-lg border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer disabled:opacity-50"
          >
            <ArrowsClockwiseIcon weight="bold" className={`w-3.5 h-3.5 text-slate-500 ${recalculating ? 'animate-spin' : ''}`} />
            {recalculating ? 'Recalculating...' : 'Recalculate Rollup'}
          </Button>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Recalculates scores with analyst overrides factored in
          </span>
        </div>

        <Button
          size="sm"
          onClick={handlePublish}
          disabled={publishing || isPublished || categoryScores.length === 0}
          className="bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 text-xs h-9 px-4 rounded-lg font-semibold shadow-xs cursor-pointer disabled:opacity-50"
        >
          <ShieldCheckIcon weight="duotone" className="w-4 h-4" />
          {publishing ? 'Publishing...' : isPublished ? 'Scorecard Published' : 'Approve & Publish Scorecard'}
        </Button>
      </div>

      {isPublished && (
        <div className={cn("grid grid-cols-1 gap-4", isSuperAdmin ? "lg:grid-cols-3" : "lg:grid-cols-2")}>
          <Card className="border-sky-200/80 shadow-xs overflow-hidden bg-sky-50/40">
            <CardContent className="p-4 sm:p-5 flex flex-col gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white border border-sky-200 flex items-center justify-center shrink-0">
                  <FilePdfIcon weight="duotone" className="w-5 h-5 text-sky-700" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-900">Initial scorecard report</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Auto-generated on publish and emailed to the customer.
                  </div>
                  {initialReportUrl ? (
                    <>
                      <div className="text-xs text-slate-600 truncate mt-1.5 font-medium">{initialReportFileName}</div>
                      {project?.initialReportGeneratedAt && (
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Generated{' '}
                          {new Date(project.initialReportGeneratedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-xs text-amber-700 mt-1.5 font-medium">PDF not found - re-publish to regenerate.</div>
                  )}
                </div>
              </div>
              {initialReportUrl && (
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={initialReportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <ArrowSquareOutIcon weight="bold" className="w-3.5 h-3.5" />
                    View
                  </a>
                  <a
                    href={initialReportUrl}
                    download={initialReportFileName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <DownloadSimpleIcon weight="bold" className="w-3.5 h-3.5" />
                    Download
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-emerald-200/80 shadow-xs overflow-hidden bg-emerald-50/40">
            <CardContent className="p-4 sm:p-5 flex flex-col gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white border border-emerald-200 flex items-center justify-center shrink-0">
                  <FilePdfIcon weight="duotone" className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-900">Detailed report (15–30 days)</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Admin upload - customer is emailed automatically on upload.
                  </div>
                  {certifiedReportUrl ? (
                    <>
                      <div className="text-xs text-slate-600 truncate mt-1.5 font-medium">{certifiedReportFileName}</div>
                      {project?.certifiedReportUploadedAt && (
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Uploaded{' '}
                          {new Date(project.certifiedReportUploadedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-xs text-slate-500 mt-1.5">Not uploaded yet.</div>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {certifiedReportUrl && (
                  <>
                    <a
                      href={certifiedReportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <ArrowSquareOutIcon weight="bold" className="w-3.5 h-3.5" />
                      View
                    </a>
                    <a
                      href={certifiedReportUrl}
                      download={certifiedReportFileName}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <DownloadSimpleIcon weight="bold" className="w-3.5 h-3.5" />
                      Download
                    </a>
                  </>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setReplaceReport(null)
                    setIsReplaceModalOpen(true)
                  }}
                  className="h-9 px-3 text-xs font-semibold border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                >
                  <UploadSimpleIcon weight="bold" className="w-3.5 h-3.5 mr-1.5" />
                  {certifiedReportUrl ? 'Replace detailed PDF' : 'Upload detailed PDF'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {isSuperAdmin && (
            <Card className="border-violet-200/80 shadow-xs overflow-hidden bg-violet-50/40">
              <CardContent className="p-4 sm:p-5 flex flex-col gap-4 h-full">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white border border-violet-200 flex items-center justify-center shrink-0">
                    <ChartPieIcon weight="duotone" className="w-5 h-5 text-violet-700" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-900">Top &amp; Lowest Performing</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Combined polar chart PDF for top 5 and lowest 5 assigned categories. Super admin only.
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={downloadingTopLow || categoryScores.length === 0}
                    onClick={handleDownloadTopLow}
                    className="h-9 px-3 text-xs font-semibold border-violet-300 text-violet-900 hover:bg-violet-50"
                  >
                    <DownloadSimpleIcon weight="bold" className={cn("w-3.5 h-3.5 mr-1.5", downloadingTopLow && "animate-pulse")} />
                    {downloadingTopLow ? 'Preparing…' : 'Download PDF'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Category Score Breakdown Grid */}
      <Card className="border-slate-200/90 shadow-xs overflow-hidden">
        <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                {categoryScores.length === 12
                  ? '12 Quality of Life Categories - Normalized Scores & Calibration'
                  : 'Assigned Categories - Normalized Scores & Calibration'}
              </CardTitle>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Formula: (Client Metric Points / Max Possible Points) × 10. You can override points directly in the right column.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
              {categoryScores.length} {categoryScores.length === 1 ? 'Category' : 'Categories'} Active
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/90 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Client Points</th>
                  <th className="px-4 py-3">Max Points</th>
                  <th className="px-4 py-3">Percentage</th>
                  <th className="px-4 py-3">10-Scale Score</th>
                  <th className="px-4 py-3 text-right">Analyst Override</th>
                  {isSuperAdmin && isPublished && (
                    <th className="px-4 py-3 text-right">Charts</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categoryScores.length === 0 ? (
                  <tr>
                    <td colSpan={isSuperAdmin && isPublished ? 8 : 7} className="px-4 py-10 text-center text-slate-400 text-xs">
                      No sections assigned to this project yet. Return to Executive Scorecard (step 2) and assign a section first.
                    </td>
                  </tr>
                ) : (
                  categoryScores.map((cat: any) => {
                  const currentOverride = overrides[cat.categoryKey] ?? cat.totalClientPoints

                  return (
                    <tr key={cat.categoryKey} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-400">
                        #{cat.rank}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {cat.categoryLabel}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600 font-medium">
                        {cat.totalClientPoints}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-400">
                        {cat.totalMaxPoints}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {cat.scorePercentage}%
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded font-black font-mono text-xs bg-slate-100 text-slate-900 border border-slate-200">
                          {cat.scoreTenScale}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <input
                          type="number"
                          step="0.5"
                          max={cat.totalMaxPoints}
                          value={currentOverride}
                          onChange={(e) =>
                            setOverrides((prev) => ({
                              ...prev,
                              [cat.categoryKey]: Number(e.target.value),
                            }))
                          }
                          className="w-20 text-xs p-1.5 text-right rounded-md border border-slate-300 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#B5111B]/20 focus:border-[#B5111B] transition-colors"
                        />
                      </td>
                      {isSuperAdmin && isPublished && (
                        <td className="px-4 py-3 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setChartsCategory(String(cat.categoryLabel || cat.categoryKey))}
                            className="h-8 px-2.5 text-[11px] font-semibold border-slate-300 text-slate-700 hover:bg-slate-50"
                          >
                            <ChartPieIcon weight="bold" className="w-3.5 h-3.5 mr-1" />
                            View charts
                          </Button>
                        </td>
                      )}
                    </tr>
                  )
                }))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Calibration Notes & Secondary Staging Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Analyst Calibration Notes */}
        <Card className="border-slate-200/90 shadow-xs">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MedalIcon weight="duotone" className="w-4 h-4 text-[#B5111B]" />
              Lead Analyst Calibration Sign-Off
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Analyst Rationale & Final Calibration Notes
              </label>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Document adjustments made based on local interviews, field observations, or geographic weighting..."
                className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#B5111B]/20 focus:border-[#B5111B] transition-colors"
              />
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRecalculate}
                className="text-xs h-8 px-3.5 border-slate-300 text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
              >
                Save Calibration Notes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Secondary API Data Lake Staging Preview */}
        <Card className="border-slate-200/90 shadow-xs">
          <CardHeader className="border-b border-slate-100 pb-3 flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <DatabaseIcon weight="duotone" className="w-4 h-4 text-[#B5111B]" />
              Secondary API Ingestion ({(Array.isArray(stagedData) ? stagedData.length : 0)} Indicators)
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTriggerIngestion}
                disabled={ingesting}
                className="h-7 px-2.5 text-[11px] text-slate-700 hover:text-slate-900 hover:bg-slate-100 border-slate-200 rounded-md font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Re-query Census, BLS, and EPA APIs for this county"
              >
                <ArrowsClockwiseIcon weight="bold" className={cn("w-3 h-3 text-slate-500", ingesting && "animate-spin")} />
                <span>{ingesting ? 'Syncing...' : 'Re-fetch APIs'}</span>
              </Button>
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">Phase 2 Staging Lake</span>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {!Array.isArray(stagedData) || stagedData.length === 0 ? (
                <div className="text-xs text-slate-400 py-6 text-center">
                  No automated API data staged yet. Click &quot;Re-fetch APIs&quot; above to ingest data.
                </div>
              ) : (
                stagedData.map((s: any) => (
                  <div
                    key={s.id || s.metricKey}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-medium text-slate-900">{s.metricLabel}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Source: {s.source} • {s.categoryKey}
                      </div>
                    </div>
                    <div className="text-right shrink-0 font-mono">
                      <span className="font-bold text-slate-900">{s.extractedValue}</span>
                      {s.unit && <span className="text-slate-400 ml-1">{s.unit}</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      <Modal
        isOpen={isPublishModalOpen}
        onClose={() => {
          if (publishing) return
          setIsPublishModalOpen(false)
        }}
        title="Approve & Publish Scorecard"
        className="max-w-lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Publishing generates the <strong>initial scorecard PDF</strong> from current category scores,
            emails it to the customer, and unlocks portal download. You can upload the{' '}
            <strong>detailed report</strong> later (typically 15–30 days).
          </p>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs text-slate-600 leading-relaxed">
            No PDF upload is required at publish time.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={publishing}
              onClick={() => setIsPublishModalOpen(false)}
              className="h-9 px-4 text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={publishing || categoryScores.length === 0}
              onClick={executePublish}
              className="h-9 px-4 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              <ShieldCheckIcon weight="duotone" className="w-4 h-4 mr-1.5" />
              {publishing ? 'Publishing…' : 'Publish & email initial PDF'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isReplaceModalOpen}
        onClose={() => {
          if (replacingReport || uploadingReport) return
          setIsReplaceModalOpen(false)
          setReplaceReport(null)
        }}
        title={certifiedReportUrl ? 'Replace Detailed Report' : 'Upload Detailed Report'}
        className="max-w-lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Upload the detailed / certified scorecard PDF. The customer is emailed automatically when
            you save. The project stays published; the initial report is unchanged.
          </p>

          <input
            ref={replaceFileRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={handleDetailedFileChange}
          />

          {replaceReport ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <FilePdfIcon weight="duotone" className="w-5 h-5 text-emerald-700 shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">{replaceReport.reportFileName}</div>
                  <div className="text-[11px] text-emerald-700 font-medium">Ready to save</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReplaceReport(null)}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-white"
                aria-label="Remove PDF"
              >
                <XIcon weight="bold" className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={uploadingReport}
              onClick={() => replaceFileRef.current?.click()}
              className="w-full rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-[#B5111B]/40 p-8 text-center transition-colors disabled:opacity-60"
            >
              <UploadSimpleIcon weight="duotone" className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <div className="text-sm font-bold text-slate-800">
                {uploadingReport ? 'Uploading PDF…' : 'Select detailed report PDF'}
              </div>
            </button>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={replacingReport || uploadingReport}
              onClick={() => {
                setIsReplaceModalOpen(false)
                setReplaceReport(null)
              }}
              className="h-9 px-4 text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={replacingReport || uploadingReport || !replaceReport?.reportUrl}
              onClick={executeReplaceReport}
              className="h-9 px-4 text-xs font-semibold bg-[#B5111B] hover:bg-[#8F0D15] text-white"
            >
              {replacingReport ? 'Saving…' : 'Save & email customer'}
            </Button>
          </div>
        </div>
      </Modal>

      <CategoryChartsModal
        open={Boolean(chartsCategory)}
        onClose={() => setChartsCategory(null)}
        categoryLabel={chartsCategory || ''}
        project={project as any}
        templates={templates || []}
        widgets={widgets || []}
      />
      </div>
    </div>
  )
}
