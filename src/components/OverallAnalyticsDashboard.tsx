"use client"

import * as React from "react"
import { useAppStore } from "@/store"
import { evaluateWidgetData } from "@/lib/analyticsEngine"
import {
  Building2,
  Layers,
  Filter,
  Download,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Search,
  Leaf,
  TrendingUp,
  Cpu,
  Users,
  Target,
  Bus,
  Palette,
  ShieldAlert,
  ShieldCheck,
  Siren,
  GraduationCap,
  Briefcase,
  ShoppingBag,
  Heart,
  Landmark,
  Home,
  Wrench,
  Trees,
  Compass,
  Map,
  CheckSquare,
  Square,
  SlidersHorizontal,
  FolderCheck,
  Gauge
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "@/lib/router-compat"
import { cn } from "@/lib/utils"

const getScoreRatingTheme = (score: number) => {
  if (score >= 8.5) {
    return {
      cardBg: 'bg-[#f0fdf4]',
      cardBorder: 'border-[#bbf7d0]',
      iconBox: 'bg-[#15803d] border border-[#166534] text-white',
      iconColor: 'text-white bg-[#15803d] border border-[#166534]',
      titleColor: 'text-[#14532d]',
      scoreColor: 'text-[#15803d]',
      scaleColor: 'text-[#166534]/70',
    }
  }
  if (score >= 7.0) {
    return {
      cardBg: 'bg-[#f7fee7]',
      cardBorder: 'border-[#d9f99d]',
      iconBox: 'bg-[#4d7c0f] border border-[#3f6212] text-white',
      iconColor: 'text-white bg-[#4d7c0f] border border-[#3f6212]',
      titleColor: 'text-[#365314]',
      scoreColor: 'text-[#4d7c0f]',
      scaleColor: 'text-[#3f6212]/70',
    }
  }
  if (score >= 5.5) {
    return {
      cardBg: 'bg-[#fffbeb]',
      cardBorder: 'border-[#fef08a]',
      iconBox: 'bg-[#d97706] border border-[#b45309] text-white',
      iconColor: 'text-white bg-[#d97706] border border-[#b45309]',
      titleColor: 'text-[#713f12]',
      scoreColor: 'text-[#a16207]',
      scaleColor: 'text-[#854d0e]/70',
    }
  }
  if (score >= 4.0) {
    return {
      cardBg: 'bg-[#fff7ed]',
      cardBorder: 'border-[#fed7aa]',
      iconBox: 'bg-[#ea580c] border border-[#c2410c] text-white',
      iconColor: 'text-white bg-[#ea580c] border border-[#c2410c]',
      titleColor: 'text-[#7c2d12]',
      scoreColor: 'text-[#c2410c]',
      scaleColor: 'text-[#9a3412]/70',
    }
  }
  return {
    cardBg: 'bg-[#fef2f2]',
    cardBorder: 'border-[#fecaca]',
    iconBox: 'bg-[#dc2626] border border-[#b91c1c] text-white',
    iconColor: 'text-white bg-[#dc2626] border border-[#b91c1c]',
    titleColor: 'text-[#7f1d1d]',
    scoreColor: 'text-[#b91c1c]',
    scaleColor: 'text-[#991b1b]/70',
  }
}

const PROJECT_PALETTE = ['#2563eb', '#16a34a', '#d97706', '#7c3aed', '#db2777', '#0891b2', '#ea580c']

function MiniHeaderMeterGauge({ score, maxScore = 10 }: { score: number; maxScore?: number }) {
  const normScore = Math.min(Math.max(score, 0), maxScore)
  const rotation = -90 + (normScore / maxScore) * 180

  return (
    <div className="relative w-16 h-10 flex items-center justify-center shrink-0">
      <svg viewBox="0 0 100 65" className="w-full h-full">
        <defs>
          <linearGradient id={`miniGaugeGrad_${score}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="40%" stopColor="#f97316" />
            <stop offset="70%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>

        <path
          d="M 12 50 A 38 38 0 0 1 88 50"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="11"
          strokeLinecap="round"
        />

        <path
          d="M 12 50 A 38 38 0 0 1 88 50"
          fill="none"
          stroke={`url(#miniGaugeGrad_${score})`}
          strokeWidth="11"
          strokeLinecap="round"
        />

        <g transform={`rotate(${rotation}, 50, 50)`} className="transition-transform duration-700 ease-out">
          <path d="M 48 50 L 50 14 L 52 50 Z" fill="#1f2937" />
          <circle cx="50" cy="50" r="4.5" fill="#1f2937" />
          <circle cx="50" cy="50" r="1.8" fill="#ffffff" />
        </g>
      </svg>
    </div>
  )
}

export function OverallAnalyticsDashboard() {
  const { projects, widgets, templates } = useAppStore()
  const [selectedProjectIds, setSelectedProjectIds] = React.useState<string[]>([])
  const [isFilterExpanded, setIsFilterExpanded] = React.useState<boolean>(false)
  const [searchQuery, setSearchQuery] = React.useState<string>("")
  const [expandedProjectIds, setExpandedProjectIds] = React.useState<string[]>([])

  // Initialize selected projects with all project IDs when projects load
  React.useEffect(() => {
    if (projects.length > 0 && selectedProjectIds.length === 0) {
      setSelectedProjectIds(projects.map(p => p.id))
    }
  }, [projects, selectedProjectIds.length])

  // Toggle single project selection
  const toggleProjectSelection = (id: string) => {
    setSelectedProjectIds(prev => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev
        return prev.filter(pId => pId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const selectAllProjects = () => {
    setSelectedProjectIds(projects.map(p => p.id))
  }

  const deselectAllProjects = () => {
    if (projects.length > 0) {
      setSelectedProjectIds([projects[0].id])
    }
  }

  // Toggle Accordion expansion for a project
  const toggleAccordion = (id: string) => {
    setExpandedProjectIds(prev =>
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    )
  }

  const allExpanded = projects.length > 0 && expandedProjectIds.length === projects.length
  const toggleAllAccordions = () => {
    if (allExpanded) {
      setExpandedProjectIds([])
    } else {
      setExpandedProjectIds(projects.map(p => p.id))
    }
  }

  // Active projects included in the analytics
  const activeProjects = React.useMemo(() => {
    return projects.filter(p => selectedProjectIds.includes(p.id))
  }, [projects, selectedProjectIds])

  // Helper for category themes
  const getCategoryTheme = (title: string) => {
    const lower = title.toLowerCase()

    if (lower.includes('accessibility') || lower.includes('transportation')) {
      return { icon: Bus, color: '#2563eb', bg: 'bg-blue-50 text-blue-600' }
    }
    if (lower.includes('arts') || lower.includes('culture')) {
      return { icon: Palette, color: '#7c3aed', bg: 'bg-purple-50 text-purple-600' }
    }
    if (lower.includes('crime') || lower.includes('safety')) {
      return { icon: Siren, color: '#dc2626', bg: 'bg-red-50 text-red-600' }
    }
    if (lower.includes('education')) {
      return { icon: GraduationCap, color: '#4f46e5', bg: 'bg-indigo-50 text-indigo-600' }
    }
    if (lower.includes('employment') || lower.includes('labor')) {
      return { icon: Briefcase, color: '#d97706', bg: 'bg-amber-50 text-amber-600' }
    }
    if (lower.includes('goods') || lower.includes('services')) {
      return { icon: ShoppingBag, color: '#059669', bg: 'bg-emerald-50 text-emerald-600' }
    }
    if (lower.includes('healthcare') || lower.includes('wellness')) {
      return { icon: Heart, color: '#db2777', bg: 'bg-pink-50 text-pink-600' }
    }
    if (lower.includes('historic') || lower.includes('preservation')) {
      return { icon: Landmark, color: '#0891b2', bg: 'bg-cyan-50 text-cyan-600' }
    }
    if (lower.includes('housing')) {
      return { icon: Home, color: '#0284c7', bg: 'bg-sky-50 text-sky-600' }
    }
    if (lower.includes('infrastructure')) {
      return { icon: Building2, color: '#ea580c', bg: 'bg-orange-50 text-orange-600' }
    }
    if (lower.includes('open space') || lower.includes('recreation')) {
      return { icon: Trees, color: '#16a34a', bg: 'bg-green-50 text-green-600' }
    }
    if (lower.includes('planning') || lower.includes('land use')) {
      return { icon: Map, color: '#6d28d9', bg: 'bg-violet-50 text-violet-600' }
    }
    if (lower.includes('sustainability') || lower.includes('environment')) {
      return { icon: Leaf, color: '#059669', bg: 'bg-emerald-50 text-emerald-600' }
    }
    if (lower.includes('economic') || lower.includes('vitality') || lower.includes('growth')) {
      return { icon: TrendingUp, color: '#d97706', bg: 'bg-amber-50 text-amber-600' }
    }
    if (lower.includes('digital') || lower.includes('smart city')) {
      return { icon: Cpu, color: '#0284c7', bg: 'bg-sky-50 text-sky-600' }
    }
    if (lower.includes('community') || lower.includes('equity')) {
      return { icon: Users, color: '#e11d48', bg: 'bg-rose-50 text-rose-600' }
    }

    return { icon: Target, color: '#2563eb', bg: 'bg-blue-50 text-blue-600' }
  }

  // Compute overall score & category scores for each selected project
  const projectSummaries = React.useMemo(() => {
    return activeProjects.map(project => {
      const assignedSectionIds = (project.assignedSections || []).map(s => s.id);
      const enabled = (project.enabledWidgets && project.enabledWidgets.length > 0)
        ? widgets.filter(w => project.enabledWidgets!.includes(w.id))
        : widgets.filter(w => !w.sectionId || assignedSectionIds.includes(w.sectionId));
      const isStatCard = (w: any) => w.chartType === 'stat_card' || (w.title && w.title.endsWith(' Score'));
      const statCards = enabled.filter(w => isStatCard(w));

      const sectionScores = statCards.map(widget => {
        const data = evaluateWidgetData(widget, project, templates)
        let totalClient = 0
        let totalHighest = 0
        let hasBoth = false
        data.forEach((dp: any) => {
          if (typeof dp['Client Total Score'] === 'number' && typeof dp['Highest Score'] === 'number') {
            totalClient += dp['Client Total Score']
            totalHighest += dp['Highest Score']
            hasBoth = true
          }
        })
        let rawScore = 0
        if (hasBoth && totalHighest > 0) {
          rawScore = (totalClient / totalHighest) * 10
        } else {
          const positivePoints = data.filter((d: any) => typeof d.value === 'number' && d.value > 0)
          if (positivePoints.length > 0) {
            const avg = positivePoints.reduce((sum: number, d: any) => sum + d.value, 0) / positivePoints.length
            rawScore = avg > 10 ? Math.min(10, avg / 10) : avg
          } else {
            rawScore = data[0]?.value || 0
          }
        }
        const finalScore = Math.min(10, Math.max(0, rawScore))

        return {
          name: widget.title.replace(' Score', '').trim(),
          score: Number(finalScore.toFixed(1))
        }
      })

      const scoredSections = sectionScores.filter(s => s.score > 0)
      const overall = scoredSections.length > 0
        ? scoredSections.reduce((a, b) => a + b.score, 0) / scoredSections.length
        : (sectionScores.length > 0 ? sectionScores.reduce((a, b) => a + b.score, 0) / sectionScores.length : 0)

      return {
        project,
        overallScore: Number(overall.toFixed(1)),
        sectionScores
      }
    })
  }, [activeProjects, widgets, templates])

  // Filter project summaries based on searchQuery (Project Name and Client Name)
  const filteredProjectSummaries = React.useMemo(() => {
    if (!searchQuery.trim()) return projectSummaries
    const query = searchQuery.toLowerCase()
    return projectSummaries.filter(ps =>
      ps.project.name.toLowerCase().includes(query) ||
      ps.project.clientName.toLowerCase().includes(query)
    )
  }, [projectSummaries, searchQuery])

  return (
    <div className="space-y-6 animate-in fade-in duration-700">



      {/* Main Section: Active Managed Projects (Full Width Accordion-Based Horizontal Cards) */}
      <div className="bg-[#f8fafc] rounded-2xl p-6 shadow-sm w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-200/60">
          <div>
            <h3 className="text-lg font-bold text-foreground">Active Managed Projects</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Showing {filteredProjectSummaries.length} of {projects.length} included projects
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Box - Works on Project Name and Client Name */}
            <div className="relative flex-1 sm:w-64 md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search project or client name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-white rounded-xl text-xs font-semibold text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Single Combined Expand / Collapse All Button */}
            <Button
              onClick={toggleAllAccordions}
              variant="ghost"
              className="h-8 gap-1.5 rounded-xl text-xs font-semibold bg-white shadow-sm hover:bg-slate-100"
            >
              {allExpanded ? <ChevronUp className="w-3.5 h-3.5 text-primary" /> : <ChevronDown className="w-3.5 h-3.5 text-primary" />}
              <span>{allExpanded ? "Collapse All" : "Expand All"}</span>
            </Button>

            {/* Export Button */}
            <Button variant="ghost" className="h-8 gap-1.5 rounded-xl text-xs font-semibold bg-white shadow-sm hover:bg-slate-100 hidden sm:flex">
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
            </Button>

            {/* Manage All Button */}
            <Link href="/projects">
              <Button variant="ghost" className="h-8 gap-1.5 rounded-xl text-xs font-semibold shrink-0 bg-white shadow-sm hover:bg-slate-100">
                <Building2 className="h-3.5 w-3.5" />
                <span>Manage All</span>
              </Button>
            </Link>
          </div>
        </div>

        {filteredProjectSummaries.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl text-xs text-muted-foreground font-medium">
            No matching projects found for "{searchQuery}". Try searching for another project name or client name.
          </div>
        ) : (
          /* Vertical Accordion Stack of Horizontal Cards */
          <div className="space-y-3.5">
            {filteredProjectSummaries.map((ps, index) => {
              const isExpanded = expandedProjectIds.includes(ps.project.id)
              const scorePct = (ps.overallScore / 10) * 100
              const avatarColor = PROJECT_PALETTE[index % PROJECT_PALETTE.length]
              const projectRotation = -90 + (Math.min(Math.max(ps.overallScore, 0), 10) / 10) * 180

              return (
                <div
                  key={ps.project.id}
                  className={`bg-white rounded-2xl shadow-sm border transition-all duration-300 overflow-hidden ${isExpanded ? 'ring-2 ring-primary/20 border-primary/30' : 'border-slate-200/60 hover:border-slate-300'
                    }`}
                >
                  {/* Horizontal Card Header Bar (Clickable) */}
                  <div
                    onClick={() => toggleAccordion(ps.project.id)}
                    className="p-3.5 sm:p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/60 transition-colors select-none"
                  >
                    {/* Left: Project Badge & Info */}
                    <div className="flex items-center gap-3.5 min-w-[280px]">
                      {ps.project.image ? (
                        <img
                          src={ps.project.image}
                          alt={ps.project.name}
                          className="w-11 h-11 rounded-xl object-cover shrink-0 shadow-sm border border-slate-200"
                        />
                      ) : (
                        <div
                          className="w-11 h-11 rounded-xl text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm"
                          style={{ backgroundColor: avatarColor }}
                        >
                          P{index + 1}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-slate-900 truncate" title={ps.project.name}>{ps.project.name}</h4>
                        <p className="text-xs text-slate-500 font-medium truncate">{ps.project.clientName} ({ps.project.year})</p>
                      </div>
                    </div>

                    {/* Center: Category-wise Rating Cards (Neutral Pill with Icon Color Coded by Score) */}
                    <div className="hidden xl:flex items-center gap-2 flex-1 overflow-x-auto py-1 px-1 custom-scrollbar">
                      {[...ps.sectionScores].sort((a, b) => b.score - a.score).slice(0, 6).map(ss => {
                        const categoryTheme = getCategoryTheme(ss.name)
                        const ThemeIcon = categoryTheme.icon
                        const ratingTheme = getScoreRatingTheme(ss.score)

                        return (
                          <div
                            key={ss.name}
                            className={cn("border rounded-xl px-2.5 py-1.5 flex items-center gap-2 shrink-0 shadow-2xs transition-all", ratingTheme.cardBg, ratingTheme.cardBorder)}
                          >
                            <div className={cn("p-1 rounded-lg shrink-0 flex items-center justify-center shadow-2xs", ratingTheme.iconColor)}>
                              <ThemeIcon className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex flex-col leading-none">
                              <span className={cn("text-[10px] font-extrabold truncate max-w-[85px]", ratingTheme.titleColor)} title={ss.name}>
                                {ss.name.length > 10 ? `${ss.name.slice(0, 10)}.` : ss.name}
                              </span>
                              <span className={cn("text-xs font-black mt-0.5", ratingTheme.scoreColor)}>
                                {ss.score} <span className={cn("text-[9px] font-bold", ratingTheme.scaleColor)}>/ 10</span>
                              </span>
                            </div>
                          </div>
                        )
                      })}
                      {ps.sectionScores.length > 6 && (
                        <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2.5 py-2 rounded-xl whitespace-nowrap shrink-0">
                          +{ps.sectionScores.length - 6} more
                        </span>
                      )}
                    </div>

                    {/* Right: Overall Score Gauge & Action Buttons */}
                    <div className="flex items-center gap-3 shrink-0 self-end xl:self-center">
                      <div className="h-7 w-[1px] bg-slate-200/80 mx-0.5 hidden sm:block" />

                      <div className="flex items-center gap-2.5 px-1 py-0.5">
                        <MiniHeaderMeterGauge score={ps.overallScore} />
                        <div className="flex flex-col leading-none">
                          <span className="text-xl font-black text-slate-900 tracking-tight leading-none">
                            {ps.overallScore} <span className="text-slate-400 font-semibold text-xs">/ 10</span>
                          </span>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                            Overall Score
                          </span>
                        </div>
                      </div>

                      <div className="h-7 w-[1px] bg-slate-200/80 mx-0.5 hidden sm:block" />

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleAccordion(ps.project.id)
                        }}
                        className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 rounded-xl transition-colors"
                      >
                        <span>{isExpanded ? "Hide Details" : "View Details"}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-indigo-600" /> : <ChevronDown className="w-4 h-4 text-indigo-600" />}
                      </button>
                    </div>
                  </div>

                  {/* Accordion Body (Expanded View) */}
                  {isExpanded && (
                    <div className="p-6 border-t border-slate-100 bg-[#f8fafc]/60 space-y-6 animate-in slide-in-from-top-2 duration-300">
                      <div className="grid grid-cols-12 gap-6 items-stretch">

                        {/* Left: Project Speed Gauge Card */}
                        <div className="col-span-12 lg:col-span-4 bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between items-center text-center">
                          <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                              <Gauge className="w-4 h-4 text-primary" />
                              <span>Overall Project Score</span>
                            </div>
                            <span className={cn(
                              "text-[10px] font-bold px-2.5 py-0.5 rounded-full border",
                              ps.overallScore >= 7 ? "text-emerald-700 bg-emerald-500/15 border-emerald-500/30" :
                                ps.overallScore >= 5 ? "text-amber-800 bg-amber-500/15 border-amber-500/30" :
                                  "text-red-800 bg-red-500/15 border-red-500/30"
                            )}>
                              {ps.overallScore >= 7 ? "High Performing" : ps.overallScore >= 5 ? "Average" : "Needs Review"}
                            </span>
                          </div>

                          <div className="h-[180px] w-full flex flex-col items-center justify-center relative my-2">
                            <svg viewBox="0 0 200 135" className="w-full h-full max-h-[170px]">
                              <defs>
                                <linearGradient id={`projectGaugeGrad_${ps.project.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stopColor="#ef4444" />
                                  <stop offset="40%" stopColor="#f97316" />
                                  <stop offset="70%" stopColor="#f59e0b" />
                                  <stop offset="100%" stopColor="#22c55e" />
                                </linearGradient>
                              </defs>

                              <path
                                d="M 25 90 A 75 75 0 0 1 175 90"
                                fill="none"
                                stroke="#e2e8f0"
                                strokeWidth="16"
                                strokeLinecap="round"
                              />

                              <path
                                d="M 25 90 A 75 75 0 0 1 175 90"
                                fill="none"
                                stroke={`url(#projectGaugeGrad_${ps.project.id})`}
                                strokeWidth="16"
                                strokeLinecap="round"
                              />

                              <g transform={`rotate(${projectRotation}, 100, 90)`} className="transition-transform duration-700 ease-out">
                                <path d="M 97.5 90 L 100 24 L 102.5 90 Z" fill="#1f2937" />
                                <circle cx="100" cy="90" r="6" fill="#1f2937" />
                                <circle cx="100" cy="90" r="2.5" fill="#ffffff" />
                              </g>

                              <text x="100" y="125" textAnchor="middle" className="text-3xl font-black fill-foreground font-sans drop-shadow-sm">
                                {ps.overallScore}
                                <tspan fontSize="14" fill="#64748b" fontWeight="600" dx="3">/ 10</tspan>
                              </text>
                            </svg>
                          </div>

                          <div className="w-full text-xs text-muted-foreground flex justify-between items-center pt-3 border-t border-slate-100">
                            <span>Total Evaluation:</span>
                            <span className="font-bold text-foreground">{scorePct.toFixed(0)}% Overall Score</span>
                          </div>
                        </div>

                        {/* Right: Category Detailed Cards (Sorted Descending, Compact Card Size & Sizing) */}
                        <div className="col-span-12 lg:col-span-8 flex flex-col justify-between gap-3">
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category Wise Score Breakdown ({ps.sectionScores.length})</h5>
                            <span className="text-[11px] text-muted-foreground font-semibold">Scale 0 - 10</span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            {[...ps.sectionScores].sort((a, b) => b.score - a.score).map(ss => {
                              const categoryTheme = getCategoryTheme(ss.name)
                              const ThemeIcon = categoryTheme.icon
                              const ratingTheme = getScoreRatingTheme(ss.score)

                              return (
                                <div
                                  key={ss.name}
                                  className={cn(
                                    "rounded-xl p-2.5 sm:p-3 flex flex-col justify-between border shadow-2xs transition-all duration-200 gap-2 min-h-[82px]",
                                    ratingTheme.cardBg,
                                    ratingTheme.cardBorder
                                  )}
                                >
                                  {/* Top Row: Icon Box & Score / 10 */}
                                  <div className="flex items-center justify-between">
                                    <div className={cn("w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shadow-2xs shrink-0", ratingTheme.iconBox)}>
                                      <ThemeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    </div>
                                    <div className="flex items-baseline gap-0.5">
                                      <span className={cn("text-base sm:text-lg font-black tracking-tight", ratingTheme.scoreColor)}>{ss.score}</span>
                                      <span className={cn("text-[10px] font-extrabold", ratingTheme.scaleColor)}>/ 10</span>
                                    </div>
                                  </div>

                                  {/* Bottom Row: Uppercase Title */}
                                  <div>
                                    <h6 className={cn("text-[10px] sm:text-[11px] font-black tracking-wider uppercase leading-tight line-clamp-1", ratingTheme.titleColor)} title={ss.name}>
                                      {ss.name}
                                    </h6>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                      </div>

                      {/* Footer Action */}
                      <div className="flex items-center justify-end pt-3 border-t border-slate-200/60">
                        <Link href={`/projects/${ps.project.id}/analytics`}>
                          <Button size="sm" className="gap-2 rounded-xl text-xs font-semibold shadow-sm">
                            Open Project Dashboard
                            <ArrowUpRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
