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
  MedalIcon
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/loader"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"

export default function ProjectCalibrationPage() {
  const routeParams = useParams<{ id: string }>()
  const id = routeParams.id || ""
  const { projects } = useAppStore()
  const project = projects.find((p) => p.id === id)

  const [loading, setLoading] = React.useState(true)
  const [recalculating, setRecalculating] = React.useState(false)
  const [publishing, setPublishing] = React.useState(false)
  const [isConfirmPublishOpen, setIsConfirmPublishOpen] = React.useState(false)
  const [ingesting, setIngesting] = React.useState(false)
  const [rollup, setRollup] = React.useState<any>(null)
  const [stagedData, setStagedData] = React.useState<any[]>([])
  const [overrides, setOverrides] = React.useState<Record<string, number>>({})
  const [notes, setNotes] = React.useState<string>('')

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

  const handlePublish = async () => {
    setIsConfirmPublishOpen(true)
  }

  const executePublish = async () => {
    setPublishing(true)
    try {
      const res = await apiClient.publishScorecard(id)
      if (res) {
        toast.success('Scorecard officially calibrated and published!')
        await loadAll()
        const freshProject = await apiClient.getProject(id)
        if (freshProject) {
          useAppStore.setState(state => ({
            projects: state.projects.map(p => p.id === id ? { ...p, ...freshProject } : p),
            activeProject: state.activeProject?.id === id ? { ...state.activeProject, ...freshProject } : state.activeProject,
          }))
          window.dispatchEvent(new CustomEvent('project-synced', { detail: { id, fresh: freshProject } }))
        }
      }
    } catch {
      toast.error('Failed to publish scorecard')
    } finally {
      setPublishing(false)
      setIsConfirmPublishOpen(false)
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

      {/* Category Score Breakdown Grid */}
      <Card className="border-slate-200/90 shadow-xs overflow-hidden">
        <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                {categoryScores.length === 12
                  ? '12 Quality of Life Categories — Normalized Scores & Calibration'
                  : 'Assigned Categories — Normalized Scores & Calibration'}
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categoryScores.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-slate-400 text-xs">
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
      <ConfirmDialog
        isOpen={isConfirmPublishOpen}
        onClose={() => setIsConfirmPublishOpen(false)}
        title="Approve & Publish Final Scorecard"
        description="Are you sure you want to officially publish this scorecard? This marks the municipal assessment complete, unlocks the final release dossier, and sets the project status to PUBLISHED."
        confirmText="Publish Scorecard"
        isLoading={publishing}
        loadingText="Publishing..."
        variant="primary"
        onConfirm={executePublish}
      />
      </div>
    </div>
  )
}
