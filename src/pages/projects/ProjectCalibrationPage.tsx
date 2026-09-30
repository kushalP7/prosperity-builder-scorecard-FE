"use client"

import * as React from "react"
import { useParams } from "@/lib/router-compat"
import { useAppStore } from "@/store"
import { apiClient } from "@/lib/api"
import { toast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ShieldCheck,
  RefreshCw,
  Database,
  Sliders,
  Award
} from "lucide-react"

export default function ProjectCalibrationPage() {
  const routeParams = useParams<{ id: string }>()
  const id = routeParams.id || ""
  const { projects } = useAppStore()
  const project = projects.find((p) => p.id === id)

  const [loading, setLoading] = React.useState(true)
  const [recalculating, setRecalculating] = React.useState(false)
  const [publishing, setPublishing] = React.useState(false)
  const [ingesting, setIngesting] = React.useState(false)
  const [rollup, setRollup] = React.useState<any>(null)
  const [stagedData, setStagedData] = React.useState<any[]>([])
  const [overrides, setOverrides] = React.useState<Record<string, number>>({})
  const [notes, setNotes] = React.useState<string>('')

  const loadAll = React.useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const [rData, sData] = await Promise.all([
        apiClient.getScorecardRollup(id),
        apiClient.getStagedData(id),
      ])
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
  }, [loadAll])

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
        toast.success('Scorecard recalculated successfully')
      }
    } catch {
      toast.error('Failed to recalculate scorecard')
    } finally {
      setRecalculating(false)
    }
  }

  const handlePublish = async () => {
    if (!confirm('Publish final scorecard? This marks the assessment complete, auto-bypasses the final 30% milestone, and releases the interactive report.')) {
      return
    }
    setPublishing(true)
    try {
      const res = await apiClient.publishScorecard(id)
      if (res) {
        toast.success('Scorecard officially calibrated and published!')
        await loadAll()
      }
    } catch {
      toast.error('Failed to publish scorecard')
    } finally {
      setPublishing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        <span className="ml-3 text-sm text-slate-500">Loading Calibration & Review Console...</span>
      </div>
    )
  }

  const categoryScores = rollup?.categoryScores || []
  const isPublished = project?.status === 'PUBLISHED' || rollup?.isCalibrated

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-6 sm:p-8 rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-700/50">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <Sliders className="w-3.5 h-3.5" />
            Phase 3 & 4: Calibration & Analyst Review
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Scorecard Calibration & Final Release
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Review normalized scores across the 12 categories, cross-reference automated secondary API data, apply expert overrides, and finalize delivery.
          </p>
        </div>

        {/* Speedometer Rollup Card */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/15 min-w-[260px] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium">Overall Rollup</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
              rollup?.performanceBand === 'Good' || rollup?.performanceBand === 'Excellent'
                ? 'bg-emerald-500 text-white'
                : 'bg-amber-500 text-slate-900'
            }`}>
              {rollup?.performanceBand || 'Average'} Band
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white">{rollup?.overallScoreTenScale || '0.0'}</span>
            <span className="text-sm text-slate-300 font-medium">/ 10.0</span>
            <span className="text-xs text-emerald-400 font-bold ml-auto">{rollup?.overallScorePercentage || '0'}% Overall</span>
          </div>

          <div className="text-[11px] text-slate-300 flex items-center justify-between pt-1 border-t border-white/10">
            <span>Methodology:</span>
            <span className="font-semibold text-white">Equal 12-Category Average</span>
          </div>
        </div>
      </div>

      {/* Control Actions Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTriggerIngestion}
            disabled={ingesting}
            className="flex items-center gap-1.5 text-xs"
          >
            <Database className="w-3.5 h-3.5 text-slate-500" />
            {ingesting ? 'Ingesting APIs...' : 'Refresh Secondary APIs'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRecalculate}
            disabled={recalculating}
            className="flex items-center gap-1.5 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${recalculating ? 'animate-spin' : ''}`} />
            {recalculating ? 'Recalculating...' : 'Recalculate Rollup'}
          </Button>
        </div>

        <Button
          size="sm"
          onClick={handlePublish}
          disabled={publishing || isPublished}
          className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 text-xs"
        >
          <ShieldCheck className="w-4 h-4" />
          {publishing ? 'Publishing...' : isPublished ? 'Scorecard Published' : 'Approve & Publish Scorecard'}
        </Button>
      </div>

      {/* 12 Category Score Breakdown Grid */}
      <Card className="border-slate-200/90 shadow-2xs">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                12 Quality of Life Categories — Normalized Scores & Calibration
              </CardTitle>
              <p className="text-xs text-slate-500 font-normal">
                Formula: (Client Metric Points / Max Possible Points) × 10. You can override points directly in the right column.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              12 Categories Active
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200/80 font-semibold">
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
                {categoryScores.map((cat: any) => {
                  const currentOverride = overrides[cat.categoryKey] ?? cat.totalClientPoints

                  return (
                    <tr key={cat.categoryKey} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-400">
                        #{cat.rank}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {cat.categoryLabel}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">
                        {cat.totalClientPoints}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-400">
                        {cat.totalMaxPoints}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {cat.scorePercentage}%
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-black font-mono bg-emerald-50 text-emerald-700">
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
                          className="w-20 text-xs p-1 text-right rounded border border-slate-300 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Calibration Notes & Secondary Staging Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Analyst Calibration Notes */}
        <Card className="border-slate-200/90 shadow-2xs">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
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
                className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRecalculate}
                className="text-xs"
              >
                Save Calibration Notes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Secondary API Data Lake Staging Preview */}
        <Card className="border-slate-200/90 shadow-2xs">
          <CardHeader className="border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              Secondary API Ingestion ({(Array.isArray(stagedData) ? stagedData.length : 0)} Indicators)
            </CardTitle>
            <span className="text-[11px] text-slate-400 font-mono">Phase 2 Staging Lake</span>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {!Array.isArray(stagedData) || stagedData.length === 0 ? (
                <div className="text-xs text-slate-400 py-6 text-center">
                  No automated API data staged yet. Click &quot;Refresh Secondary APIs&quot; above to ingest data.
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
      </div>
    </div>
  )
}
