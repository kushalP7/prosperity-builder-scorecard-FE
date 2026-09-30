"use client"

import * as React from "react"
import { useParams } from "@/lib/router-compat"
import { useAppStore } from "@/store"
import { apiClient } from "@/lib/api"
import { toast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CheckCircle2,
  Save,
  Send,
  Sparkles,
  Info
} from "lucide-react"

export default function ProjectIntakePage() {
  const routeParams = useParams<{ id: string }>()
  const id = routeParams.id || ""
  const { projects } = useAppStore()
  const project = projects.find((p) => p.id === id)

  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [submission, setSubmission] = React.useState<any>(null)
  const [answers, setAnswers] = React.useState<Record<string, any>>({})
  const [activeCategory, setActiveCategory] = React.useState<string>('accessibility_transportation')

  React.useEffect(() => {
    async function loadData() {
      if (!id) return
      setLoading(true)
      try {
        const data = await apiClient.getQuestionnaireSubmission(id)
        if (data) {
          setSubmission(data)
          const initialAnswers: Record<string, any> = {}
          if (data.answersPayload) {
            Object.keys(data.answersPayload).forEach((k) => {
              initialAnswers[k] = data.answersPayload[k]?.value ?? data.answersPayload[k]
            })
          }
          setAnswers(initialAnswers)
        }
      } catch (err) {
        console.error('Error loading questionnaire:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  const handleInputChange = (key: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSaveDraft = async () => {
    setSaving(true)
    try {
      const formattedAnswers: Record<string, any> = {}
      Object.keys(answers).forEach((k) => {
        formattedAnswers[k] = { value: answers[k], updatedAt: new Date().toISOString() }
      })
      const res = await apiClient.saveQuestionnaireDraft(id, formattedAnswers)
      if (res) {
        setSubmission((prev: any) => ({ ...prev, ...res }))
        toast.success('Draft saved successfully')
      }
    } catch {
      toast.error('Failed to save draft')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async () => {
    if (!confirm('Are you ready to submit the Questionnaire? This will trigger automated secondary API ingestion and milestone processing.')) {
      return
    }
    setSubmitting(true)
    try {
      const formattedAnswers: Record<string, any> = {}
      Object.keys(answers).forEach((k) => {
        formattedAnswers[k] = { value: answers[k], updatedAt: new Date().toISOString() }
      })
      const res = await apiClient.submitQuestionnaire(id, formattedAnswers)
      if (res) {
        setSubmission((prev: any) => ({ ...prev, status: 'SUBMITTED' }))
        toast.success('Questionnaire submitted! Milestone payment bypassed and ingestion initiated.')
      }
    } catch {
      toast.error('Failed to submit questionnaire')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        <span className="ml-3 text-sm text-slate-500">Loading Client Intake Questionnaire...</span>
      </div>
    )
  }

  const categories = submission?.categories || []
  const totalQuestions = categories.reduce((s: number, c: any) => s + (c.questions?.length || 0), 0)
  const answeredCount = Object.keys(answers).filter((k) => answers[k] !== undefined && answers[k] !== '' && answers[k] !== null).length
  const progressPct = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0

  const isSubmitted = submission?.status === 'SUBMITTED' || project?.status === 'PUBLISHED' || project?.status === 'CALCULATED'

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-6 sm:p-8 rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-700/50">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            Phase 2: Client Intake Portal (90+ Data Points)
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {project?.name || 'Scorecard Intake Questionnaire'}
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Gathering local indicators across 12 essential Quality of Life categories. Responses feed directly into the Metric Normalization & Scoring Engine.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/15 min-w-[240px] space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-200">
            <span className="font-medium">Intake Progress</span>
            <span className="font-bold text-emerald-400">{answeredCount} of {totalQuestions} answered ({progressPct}%)</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-300 font-medium">Status:</span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${isSubmitted ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-slate-900'}`}>
              {isSubmitted ? 'SUBMITTED' : 'DRAFT IN PROGRESS'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Info className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Payment milestone bypass is active. Submitting will immediately trigger the 30% milestone clearance and automated API ingestion.</span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            disabled={saving || isSubmitted}
            className="flex items-center gap-1.5"
          >
            <Save className="w-4 h-4 text-slate-500" />
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={submitting || isSubmitted}
            className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Submitting...' : isSubmitted ? 'Intake Submitted' : 'Submit Questionnaire'}
          </Button>
        </div>
      </div>

      {/* 12 Categories Tabs & Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Category Navigation Sidebar */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200/90 p-3 shadow-2xs space-y-1 sticky top-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 py-2">
            12 QOL Categories
          </h3>
          {categories.map((cat: any, idx: number) => {
            const catAnswered = (cat.questions || []).filter((q: any) => answers[q.key] !== undefined && answers[q.key] !== '' && answers[q.key] !== null).length
            const isCatComplete = catAnswered === (cat.questions?.length || 0) && (cat.questions?.length || 0) > 0
            const isActive = activeCategory === cat.categoryKey

            return (
              <button
                key={cat.categoryKey}
                onClick={() => setActiveCategory(cat.categoryKey)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-900 font-bold border-l-4 border-emerald-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="text-[11px] font-mono text-slate-400 shrink-0">{(idx + 1).toString().padStart(2, '0')}</span>
                  <span className="truncate">{cat.categoryLabel}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {isCatComplete ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {catAnswered}/{cat.questions?.length || 0}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Category Questions Panel */}
        <div className="lg:col-span-3 space-y-6">
          {categories
            .filter((cat: any) => cat.categoryKey === activeCategory)
            .map((cat: any) => (
              <Card key={cat.categoryKey} className="border-slate-200/90 shadow-2xs">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-bold text-slate-900">
                      {cat.categoryLabel}
                    </CardTitle>
                    <p className="text-xs text-slate-500 font-normal">
                      {cat.description}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {cat.questions.map((q: any) => {
                      const val = answers[q.key] ?? ''

                      return (
                        <div
                          key={q.key}
                          className={`space-y-1.5 ${q.type === 'textarea' ? 'md:col-span-2' : ''}`}
                        >
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-slate-800">
                              {q.label}
                            </label>
                            {q.unit && (
                              <span className="text-[11px] text-slate-400 font-mono">
                                ({q.unit})
                              </span>
                            )}
                          </div>

                          {q.type === 'boolean' ? (
                            <div className="flex items-center gap-4 pt-1">
                              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                                <input
                                  type="radio"
                                  name={q.key}
                                  checked={val === true}
                                  onChange={() => handleInputChange(q.key, true)}
                                  disabled={isSubmitted}
                                  className="text-emerald-600 focus:ring-emerald-500"
                                />
                                Yes (1)
                              </label>
                              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                                <input
                                  type="radio"
                                  name={q.key}
                                  checked={val === false}
                                  onChange={() => handleInputChange(q.key, false)}
                                  disabled={isSubmitted}
                                  className="text-emerald-600 focus:ring-emerald-500"
                                />
                                No (0)
                              </label>
                            </div>
                          ) : q.type === 'textarea' ? (
                            <textarea
                              rows={3}
                              value={val}
                              placeholder={q.placeholder || 'Enter notes or local observations...'}
                              onChange={(e) => handleInputChange(q.key, e.target.value)}
                              disabled={isSubmitted}
                              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            />
                          ) : q.type === 'number' ? (
                            <input
                              type="number"
                              value={val}
                              placeholder={q.placeholder || '0'}
                              onChange={(e) => handleInputChange(q.key, e.target.value === '' ? '' : Number(e.target.value))}
                              disabled={isSubmitted}
                              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            />
                          ) : (
                            <input
                              type="text"
                              value={val}
                              placeholder={q.placeholder || 'Enter response...'}
                              onChange={(e) => handleInputChange(q.key, e.target.value)}
                              disabled={isSubmitted}
                              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSaveDraft}
                      disabled={saving || isSubmitted}
                      className="text-xs"
                    >
                      Save Progress
                    </Button>
                    <div className="text-xs text-slate-400">
                      Auto-saved drafts are accessible to both client and analysts.
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </div>
  )
}
