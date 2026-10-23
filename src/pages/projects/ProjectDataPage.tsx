"use client"

import * as React from "react"
import { useParams } from "@/lib/router-compat"
import { useAppStore } from "@/store"
import {
  TableIcon,
  CaretRightIcon,
  CaretUpDownIcon,
  BusIcon,
  PaletteIcon,
  ShieldCheckIcon,
  ActivityIcon,
  BuildingsIcon,
  KanbanIcon,
  ArrowLeftIcon,
  ArrowsClockwiseIcon
} from "@phosphor-icons/react"
import { apiClient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/loader"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

const getSectionIcon = (label?: string, iconName?: string) => {
  const l = (label || '').toLowerCase();
  if (l.includes('transport') || l.includes('access')) return BusIcon;
  if (l.includes('art') || l.includes('culture')) return PaletteIcon;
  if (l.includes('crime') || l.includes('safety') || l.includes('public')) return ShieldCheckIcon;
  if (l.includes('health')) return ActivityIcon;
  if (l.includes('housing') || l.includes('land')) return BuildingsIcon;
  return KanbanIcon;
}

/** Color + category chip styling for Data Source values */
function getSourceChipClass(source: string): string {
  const s = source.toLowerCase()
  if (s.includes('ncdot') || s.includes('dot gis') || s.includes('highway')) {
    return 'bg-sky-100 text-sky-900 border-sky-200'
  }
  if (s.includes('census') || s.includes('acs') || s.includes('quickfacts')) {
    return 'bg-teal-100 text-teal-900 border-teal-200'
  }
  if (s.includes('intake') || s.includes('phase 2') || s.includes('client') || s.includes('questionnaire')) {
    return 'bg-rose-100 text-rose-900 border-rose-200'
  }
  if (s.includes('bls') || s.includes('labor') || s.includes('unemployment')) {
    return 'bg-violet-100 text-violet-900 border-violet-200'
  }
  if (s.includes('epa') || s.includes('esri') || s.includes('gis')) {
    return 'bg-amber-100 text-amber-900 border-amber-200'
  }
  return 'bg-slate-100 text-slate-800 border-slate-200'
}

function isNotesColumn(name?: string): boolean {
  const n = (name || '').toLowerCase().replace(/[^a-z0-9]/g, '')
  return (
    n.includes('localdata') ||
    n.includes('resultnotes') ||
    n.includes('localdatanotes') ||
    (n.includes('notes') && !n.includes('datasource') && !n.includes('source'))
  )
}

const NOTES_CHIP_CLASS =
  'inline-flex max-w-full items-start rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-left text-[11px] font-medium leading-snug text-slate-700 break-words whitespace-normal'

/** Single-style chip for Local Data Result & Notes (one color only) */
function NotesChip({ value }: { value: string }) {
  const trimmed = (value || '').trim()
  if (!trimmed || trimmed === '-') {
    return <span className="text-xs text-muted-foreground">—</span>
  }
  return (
    <span title={trimmed} className={NOTES_CHIP_CLASS}>
      {trimmed}
    </span>
  )
}

function NotesCell({
  value,
  onChange,
}: {
  value: string
  onChange: (val: string) => void
}) {
  const [editing, setEditing] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const trimmed = (value || '').trim()

  React.useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        className="w-full min-h-[32px] rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === 'Escape') {
            e.preventDefault()
            setEditing(false)
          }
        }}
        placeholder="Notes..."
      />
    )
  }

  if (!trimmed) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="w-full min-h-[32px] rounded-md border border-dashed border-slate-300 bg-transparent px-2 py-1 text-left text-xs text-slate-400 hover:border-slate-400 hover:text-slate-500 transition-colors cursor-pointer"
      >
        Add notes…
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      title={trimmed}
      className={cn(NOTES_CHIP_CLASS, 'cursor-pointer transition-opacity hover:opacity-90')}
    >
      {trimmed}
    </button>
  )
}

function DataSourceCell({
  value,
  onChange,
}: {
  value: string
  onChange: (val: string) => void
}) {
  const [editing, setEditing] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const trimmed = (value || '').trim()

  React.useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        className="w-full min-h-[32px] rounded-md border border-sky-300 bg-white px-2 py-1 text-xs text-slate-800 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === 'Escape') {
            e.preventDefault()
            setEditing(false)
          }
        }}
        placeholder="Source..."
      />
    )
  }

  if (!trimmed) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="w-full min-h-[32px] rounded-md border border-dashed border-slate-300 bg-transparent px-2 py-1 text-left text-xs text-slate-400 hover:border-slate-400 hover:text-slate-500 transition-colors cursor-pointer"
      >
        Add source…
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      title={trimmed}
      className={cn(
        'inline-flex max-w-full items-start rounded-full border px-2.5 py-1 text-left text-[11px] font-semibold leading-snug break-words whitespace-normal cursor-pointer transition-opacity hover:opacity-90',
        getSourceChipClass(trimmed)
      )}
    >
      {trimmed}
    </button>
  )
}

// Canonical Excel column order as defined in Prosperity Builder Scorecard Master
const EXCEL_COLUMN_ORDER = [
  'Y(1)/N(0)',
  'Weight (1-4)',
  'Value',
  'Client Total Score',
  'Highest Score',
  'Local Data Result & Notes'
];

// Canonical Section order
const SECTION_ORDER = [
  "Accessibility & Transportation",
  "Arts & Culture",
  "Crime & Public Safety",
  "Education",
  "Employment & Labor",
  "Goods & Services",
  "Healthcare & Wellness",
  "Historic Preservation",
  "Population & Housing",
  "Housing",
  "Infrastructure",
  "Open Space & Recreation",
  "Planning & Land Use"
];

// Canonical Category row order per Section from Master Excel
const SECTION_CATEGORY_ORDER: Record<string, string[]> = {
  "Accessibility & Transportation": [
    "Major Routes",
    "HH w/o Vehicle",
    "Average commute time",
    "Public transportation options",
    "State transportation funds",
    "Bike and Ped Plan"
  ],
  "Arts & Culture": [
    "Public Art installations",
    "Public Art Map",
    "Cultural facilities",
    "Event Programs",
    "% of employment in Arts, Entertainment Sector"
  ],
  "Crime & Public Safety": [
    "Personal Crime Index",
    "Property Crime Index",
    "Bonus: Officer to Resident Ratio",
    "Crime Rates"
  ],
  "Education": [
    "HS Graduation",
    "College",
    "K-12 Performance",
    "K-12 Chronic Absentism",
    "Secondary Education"
  ],
  "Employment & Labor": [
    "% White Collar Employed",
    "% Blue Collar Employed",
    "% Services Emloyed",
    "Unemployment Rate",
    "Labor Participation",
    "Average HH Income",
    "Median HH Income",
    "Per Capita Income",
    "Certified Pad Ready Sites",
    "Available buildings",
    "Large Employers",
    "BONUS: HQ/Fortune 500/100",
    "Add Entrepreneurship Category"
  ],
  "Goods & Services": [
    "% Employed in Retail Trade",
    "% Employed in Accommodations & Food Services",
    "% Emplyed in Arts, Entertainment & Recreation",
    "Retail Vacancy",
    "Lower vacancy rate, higher score",
    "ADD Tourism Data score"
  ],
  "Healthcare & Wellness": [
    "Hospitals",
    "Clinics, Medical Facilities",
    "County Health Factors",
    "Air Quality Index",
    "Households Below Poverty Level",
    "Access to Healthy Food",
    "% Employed in Healthcare Sector"
  ],
  "Historic Preservation": [
    "Historic Districts",
    "Main St. Designation",
    "Downtown or Main St. Manager",
    "Registered Buildings",
    "Municipal Service or Business Improvement District",
    "Historic Tour Map"
  ],
  "Population & Housing": [
    "Housing Units Renter Occupied",
    "Median Home Value",
    "Median Rent Price",
    "Housing Structure Year Built",
    "Cost Burdened Households",
    "BONUS: Diversity Index"
  ],
  "Housing": [
    "Housing Units Renter Occupied",
    "Median Home Value",
    "Median Rent Price",
    "Housing Structure Year Built",
    "Cost Burdened Households",
    "BONUS: Diversity Index"
  ],
  "Infrastructure": [
    "Public Sewer Capacity",
    "Public Water Capacity",
    "Public Electric Capacity",
    "Broadband Availibility",
    "Expansion Plans",
    "Roadways (STIP)",
    "Water Quality",
    "Emergency Planning",
    "BONUS: Green Energy Alternatives"
  ],
  "Open Space & Recreation": [
    "Recreation Plan",
    "Parks and Rec Director",
    "Greenway",
    "Natural/Recreational Assets",
    "Open Space/Parks",
    "Conservation Ordinances",
    "BONUS: National (2) or State Park (1)"
  ],
  "Planning & Land Use": [
    "Voluntary Argricultural Districts",
    "% Agricultural Employment Sector",
    "% Residential Property Tax Value",
    "% Commercial Property Tax Value",
    "Vacant Land",
    "Tax Exempt Acreage",
    "Comprehensive Land Use Plan"
  ]
};

export default function ProjectDataPage() {
  const routeParams = useParams<{ id: string }>()
  const id = routeParams.id || ""
  const { projects, updateProjectData } = useAppStore()

  const project = projects.find(p => p.id === id)
  const [selectedSectionId, setSelectedSectionId] = React.useState<string | null>(null)
  const [viewMode, setViewMode] = React.useState<'summary' | 'detailed'>('summary')
  const [collapsedCategories, setCollapsedCategories] = React.useState<Record<string, boolean>>({})
  const [isAllCollapsed, setIsAllCollapsed] = React.useState(true)

  const [isLoadingProject, setIsLoadingProject] = React.useState(true)
  const [isRecalculating, setIsRecalculating] = React.useState(false)

  // Debounced auto-refresh ref to keep calculations in sync without full page reload
  const refreshTimerRef = React.useRef<any>(null)

  const scheduleAutoRefresh = React.useCallback(() => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(async () => {
      try {
        const fresh = await apiClient.getProject(id);
        if (fresh) {
          useAppStore.setState(state => ({
            projects: state.projects.map(p => p.id === id ? { ...p, ...fresh, data: fresh.data || p.data } : p),
            activeProject: fresh,
          }));
        }
      } catch (err) {
        console.error('Auto refresh error:', err);
      }
    }, 1200);
  }, [id]);

  const handleRecalculate = async () => {
    if (!id || isRecalculating) return;
    setIsRecalculating(true);
    try {
      const fresh = await apiClient.recalculateProject(id);
      if (fresh) {
        useAppStore.setState(state => ({
          projects: state.projects.map(p => p.id === id ? { ...p, ...fresh, data: fresh.data || p.data } : p),
          activeProject: fresh,
        }));
        toast.success("Scores and calculations updated successfully!");
      } else {
        const fallback = await apiClient.getProject(id);
        if (fallback) {
          useAppStore.setState(state => ({
            projects: state.projects.map(p => p.id === id ? { ...p, ...fallback, data: fallback.data || p.data } : p),
            activeProject: fallback,
          }));
        }
        toast.success("Project data refreshed!");
      }
    } catch (err) {
      console.error('Failed to recalculate project:', err);
      toast.error("Failed to recalculate scores. Please try again.");
    } finally {
      setIsRecalculating(false);
    }
  };

  // Helper to prevent negative signs, 'e', 'E', or negative paste in number inputs
  const handleNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '-' || e.key === 'Subtract' || e.key === 'e' || e.key === 'E') {
      e.preventDefault();
    }
  };

  const handleNumberPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData('text');
    if (paste.includes('-') || isNaN(Number(paste)) || Number(paste) < 0) {
      e.preventDefault();
    }
  };

  React.useEffect(() => {
    let isMounted = true;
    async function loadFreshProject() {
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
        console.error('Failed to load fresh project:', err);
      } finally {
        if (isMounted) setIsLoadingProject(false);
      }
    }
    loadFreshProject();

    const handleSectionAssigned = () => {
      loadFreshProject();
    };
    const handleProjectSynced = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      // Layout already refreshed store — reuse payload, skip duplicate getProject
      if (detail?.skipRefetch && detail?.fresh) {
        useAppStore.setState(state => {
          const exists = state.projects.some(p => p.id === id);
          return {
            projects: exists
              ? state.projects.map(p => p.id === id ? { ...p, ...detail.fresh, data: detail.fresh.data || p.data } : p)
              : [...state.projects, detail.fresh],
            activeProject: detail.fresh,
          };
        });
        return;
      }
      loadFreshProject();
    };
    window.addEventListener('project-section-assigned', handleSectionAssigned);
    window.addEventListener('project-synced', handleProjectSynced);
    return () => { 
      isMounted = false; 
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      window.removeEventListener('project-section-assigned', handleSectionAssigned);
      window.removeEventListener('project-synced', handleProjectSynced);
    };
  }, [id]);

  if (!project) {
    return isLoadingProject ? (
      <div className="flex items-center justify-center min-h-[300px]">
        <Spinner className="w-8 h-8 text-primary" />
      </div>
    ) : (
      <div className="p-8 text-muted-foreground">Project not found</div>
    );
  }

  const assignedSections = React.useMemo(() => {
    if (!project) return []
    const raw = project.assignedSections || []
    const sorted = [...raw]
    const cleanStr = (s?: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '')
    sorted.sort((a, b) => {
      const aNorm = cleanStr(a.label || (a as any).name || '')
      const bNorm = cleanStr(b.label || (b as any).name || '')
      let aIdx = SECTION_ORDER.findIndex(s => {
        const sNorm = cleanStr(s)
        return aNorm.includes(sNorm) || sNorm.includes(aNorm)
      })
      let bIdx = SECTION_ORDER.findIndex(s => {
        const sNorm = cleanStr(s)
        return bNorm.includes(sNorm) || sNorm.includes(bNorm)
      })
      if (aIdx === -1) aIdx = 999
      if (bIdx === -1) bIdx = 999
      return aIdx - bIdx
    })
    return sorted
  }, [project?.assignedSections, project])

  const activeSectionId = selectedSectionId && assignedSections.some(s => s.id === selectedSectionId)
    ? selectedSectionId
    : (assignedSections[0]?.id || null)

  const activeSection = assignedSections.find(s => s.id === activeSectionId)

  const activeCategories = React.useMemo(() => {
    if (!activeSection || !Array.isArray(activeSection.categories)) return []
    const cats = [...activeSection.categories]
    const secName = (activeSection.label || (activeSection as any).name || '').trim()
    const cleanStr = (s?: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '')
    const secNorm = cleanStr(secName)

    const orderEntry = Object.entries(SECTION_CATEGORY_ORDER).find(([k]) => {
      const kNorm = cleanStr(k)
      return secNorm.includes(kNorm) || kNorm.includes(secNorm)
    })
    const orderList = orderEntry ? orderEntry[1] : []

    if (orderList.length > 0) {
      cats.sort((a, b) => {
        const aNorm = cleanStr(a.label || '')
        const bNorm = cleanStr(b.label || '')

        let aIdx = orderList.findIndex(o => {
          const oNorm = cleanStr(o)
          return aNorm.includes(oNorm) || oNorm.includes(aNorm)
        })
        let bIdx = orderList.findIndex(o => {
          const oNorm = cleanStr(o)
          return bNorm.includes(oNorm) || oNorm.includes(bNorm)
        })

        if (aIdx === -1) aIdx = 999
        if (bIdx === -1) bIdx = 999
        return aIdx - bIdx
      })
    }
    return cats
  }, [activeSection])

  const sectionColumns = React.useMemo(() => {
    const colMap = new Map<string, any>()
    
    if (activeSection?.columns && activeSection.columns.length > 0) {
      activeSection.columns.forEach(col => {
        const key = (col.name || '').trim().toLowerCase()
        if (key && !colMap.has(key)) {
          colMap.set(key, col)
        }
      })
    } else {
      activeCategories.forEach(cat => {
        (cat.columns || []).forEach(col => {
          const key = (col.name || '').trim().toLowerCase()
          if (key && !colMap.has(key)) {
            colMap.set(key, col)
          }
        })
      })
    }

    const cleanStr = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
    const allCols = Array.from(colMap.values())

    const getColumnSortOrder = (colName: string): number => {
      const norm = cleanStr(colName);
      // 1. Data Source / Notes column ALWAYS comes LAST
      if (
        norm.includes('localdata') ||
        norm.includes('datasource') ||
        norm.includes('resultnotes') ||
        norm.includes('localdatanotes') ||
        norm.includes('source') ||
        norm.includes('notes')
      ) {
        return 1000;
      }

      // 2. Canonical Excel Scorecard columns
      if (norm.includes('y1n0') || norm === 'yn' || norm.includes('yesno')) return 1;
      if (norm.includes('weight')) return 2;
      if (norm === 'value') return 3;
      if (norm.includes('totalscore') || norm.includes('clienttotal')) return 4;
      if (norm.includes('highestscore') || norm.includes('maxscore')) return 5;
      if (norm.includes('trend')) return 6;

      // 3. Custom / additional columns come after standard columns but before Data Source / Notes
      return 500;
    };

    allCols.sort((a, b) => {
      const aOrder = getColumnSortOrder(a.name || '');
      const bOrder = getColumnSortOrder(b.name || '');

      if (aOrder !== bOrder) return aOrder - bOrder;
      return (a.name || '').localeCompare(b.name || '');
    })

    return allCols
  }, [activeCategories])

  const expandableCategories = React.useMemo(() => {
    return activeCategories.filter(c => Array.isArray(c.groups) && c.groups.length > 0)
  }, [activeCategories])

  const isCategoryCollapsed = (catId: string) => {
    return collapsedCategories[catId] !== undefined ? collapsedCategories[catId] : true
  }

  // Derived state: check if any expandable category in the activeSection is currently expanded
  const hasAnyCategoryExpanded = React.useMemo(() => {
    if (expandableCategories.length === 0) return false;
    return expandableCategories.some(cat => !isCategoryCollapsed(cat.id));
  }, [expandableCategories, collapsedCategories]);

  const toggleCategoryCollapse = (catId: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [catId]: !isCategoryCollapsed(catId)
    }))
  }

  const toggleAllCategories = () => {
    if (!project || !activeSection) return;
    // If any expandable categories are currently open, collapse them all (target = true).
    // If all are closed, expand them all (target = false).
    const targetCollapsedState = hasAnyCategoryExpanded;

    const newCollapsedMap: Record<string, boolean> = { ...collapsedCategories };
    expandableCategories.forEach(cat => {
      newCollapsedMap[cat.id] = targetCollapsedState;
    });
    setCollapsedCategories(newCollapsedMap);
  }

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden">
      {/* Main Data Entry Area */}
      <div className="flex-1 flex flex-col min-h-0 bg-transparent space-y-3">
        {assignedSections.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-muted-foreground p-12 text-center space-y-4 bg-background rounded-xl border border-border shadow-sm">
            <TableIcon weight="duotone" className="h-12 w-12 opacity-20" />
            <div>
              <h3 className="font-medium text-foreground text-lg">No Sections Assigned</h3>
              <p className="text-sm mt-1 max-w-md">Go back to the project dashboard and assign some sections to start entering data.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full min-h-0 space-y-3">
            {/* STICKY TOP TAB & ACTION HEADER (Fixed at Top, Does NOT Scroll Away) */}
            <div className="shrink-0 space-y-2 bg-[#F8F9FA] pb-1 pt-0.5 sticky top-0 z-30">
              {/* High-Contrast Segmented Capsule Section Tabs Track */}
              <div className="bg-slate-200/90 p-2 rounded-2xl border border-slate-300/80 shadow-inner flex flex-wrap items-center gap-1.5 max-w-full">
                {assignedSections.map((section) => {
                  const isSelected = activeSectionId === section.id
                  const categoryCount = Array.isArray(section.categories) ? section.categories.length : 0;

                  return (
                    <button
                      key={section.id}
                      onClick={() => {
                        setSelectedSectionId(section.id)
                        setViewMode('summary')
                      }}
                      className={cn(
                        "px-3.5 py-2 text-xs md:text-sm font-semibold transition-all duration-200 rounded-xl cursor-pointer select-none flex items-center gap-2",
                        isSelected
                          ? "bg-[#B5111B] text-white shadow-md shadow-red-900/30 scale-[1.02] font-bold border border-[#B5111B]"
                          : "bg-slate-100 text-slate-800 hover:bg-white hover:text-slate-950 border border-slate-300/90 shadow-xs hover:shadow-sm active:scale-95"
                      )}
                      style={{
                        backgroundColor: isSelected ? (section.accentColor || '#B5111B') : undefined,
                        borderColor: isSelected ? (section.accentColor || '#B5111B') : undefined,
                        color: isSelected ? '#FFFFFF' : undefined
                      }}
                    >
                      <span>{section.label || (section as any).name}</span>
                      {categoryCount > 0 && (
                        <span
                          className={cn(
                            "px-2 py-0.5 text-[11px] font-bold rounded-full transition-colors",
                            isSelected
                              ? "bg-white/25 text-white"
                              : "bg-slate-200 text-slate-800 border border-slate-300/80"
                          )}
                        >
                          {categoryCount}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Action Controls Row - Below Tab Line & Just Above Table */}
              <div className="flex items-center justify-between gap-2 pt-0.5 pb-0.5">
                <div className="text-xs font-semibold text-slate-500 flex items-center gap-2 pl-0.5">
                  <span className="font-bold text-slate-800">{activeSection?.label || (activeSection as any)?.name || 'Categories'}</span>
                  <span className="text-slate-300">&bull;</span>
                  <span>{activeCategories.length} {activeCategories.length === 1 ? 'Category' : 'Categories'}</span>
                  <span className="text-slate-300">&bull;</span>
                  <span className="px-1.5 py-0.5 rounded font-bold bg-slate-100 text-slate-600 text-[10.5px] border border-slate-200">
                    Template v{activeSection?.version || 1}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRecalculate}
                    disabled={isRecalculating}
                    className="text-xs h-8 rounded-lg px-3 border-slate-300 shadow-xs bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-950 font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    title="Recalculate scores and update all calculations from backend"
                  >
                    <ArrowsClockwiseIcon weight="bold" className={cn("w-3.5 h-3.5 text-primary", isRecalculating && "animate-spin")} />
                    <span>{isRecalculating ? "Recalculating..." : "Recalculate Scores"}</span>
                  </Button>
                  {viewMode === 'detailed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewMode('summary')}
                      className="text-xs h-8 rounded-lg px-3.5 border-border shadow-sm bg-background hover:bg-muted/50 text-muted-foreground hover:text-foreground cursor-pointer font-medium"
                    >
                      <ArrowLeftIcon weight="bold" className="w-3.5 h-3.5 mr-1.5" />
                      Back to Summary
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleAllCategories}
                    className="text-xs h-8 rounded-lg px-3.5 border-border shadow-sm bg-background hover:bg-muted/50 cursor-pointer font-medium"
                  >
                    <CaretUpDownIcon weight="bold" className="w-3.5 h-3.5 mr-1.5" />
                    {hasAnyCategoryExpanded ? 'Collapse All' : 'Expand All'}
                  </Button>
                </div>
              </div>
            </div>

            {/* SCROLLABLE TABLE CARD BELOW (Takes all remaining height & scrolls internally) */}
            {activeSection && (
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden pb-1">
                {viewMode === 'summary' ? (
                  /* SECTION SUMMARY VIEW (Card with internal scroll) */
                  <div className="bg-background rounded-xl border border-slate-300/90 shadow-sm flex flex-col flex-1 h-full min-h-0 overflow-hidden">
                    <div className="overflow-auto flex-1 custom-scrollbar">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-[#E9ECEF] border-b-2 border-border sticky top-0 z-20 shadow-xs">
                        <tr>
                          <th className="px-4 py-3 font-bold text-foreground border-r border-border w-[45%]">Category</th>
                          <th className="px-4 py-3 font-bold text-foreground border-r border-border w-[15%] text-center">Data</th>
                          <th className="px-4 py-3 font-bold text-foreground min-w-[240px] w-[40%]">Source</th>
                        </tr>
                      </thead>
                      <tbody>
                        <React.Fragment key={activeSection.id}>
                          {/* Section Header Row */}
                          <tr
                            className="border-b border-border cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setViewMode('detailed')}
                          >
                            <td
                              colSpan={3}
                              className="px-4 py-3 font-bold text-white text-base relative"
                              style={{ backgroundColor: activeSection.accentColor || '#B5111B' }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                  {React.createElement(getSectionIcon(activeSection.label || (activeSection as any).name, activeSection.icon), { className: "h-5 w-5" })}
                                  <span>{activeSection.label || (activeSection as any).name}</span>
                                </div>
                                <span className="text-xs opacity-90 font-normal hover:underline flex items-center gap-1">
                                  Click to view custom columns &rarr;
                                </span>
                              </div>
                            </td>
                          </tr>

                          {/* Categories and Subcategories */}
                          {activeCategories.length === 0 && (
                            <tr>
                              <td colSpan={3} className="px-4 py-4 text-center text-muted-foreground bg-muted/10">
                                No categories defined in this section.
                              </td>
                            </tr>
                          )}
                          {activeCategories.map(category => {
                            const isSingleRow = (!category.groups || category.groups.length === 0);

                            const renderRow = (nodeId: string, label: string, indent: number, isBold: boolean, description?: string) => {
                              const groupData = project.data?.[nodeId] || {}
                              const baseRecord = groupData['__base__'] || { value: '', source: '' }

                              const handleBaseChange = (field: 'value' | 'source', val: any) => {
                                let finalVal = val;
                                if (field === 'value') {
                                  if (val === '' || val === null || val === undefined) {
                                    finalVal = null;
                                  } else {
                                    const num = Number(val);
                                    finalVal = isNaN(num) ? null : Math.max(0, num);
                                  }
                                }
                                updateProjectData(project.id, nodeId, '__base__', {
                                  ...baseRecord,
                                  [field]: finalVal
                                });
                                scheduleAutoRefresh();
                              }

                              return (
                                <tr key={nodeId} className="hover:bg-muted/30 border-b border-border transition-colors">
                                  <td className={`px-4 py-2 border-r border-border align-middle ${indent === 1 ? 'pl-8' : 'pl-12'} ${isBold ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                                    <div className="max-w-[380px] lg:max-w-[460px] 2xl:max-w-[560px]">
                                      <div className={isBold ? "font-semibold text-foreground" : "font-medium text-foreground"}>
                                        {label}
                                      </div>
                                      {description && description.trim() && (
                                        <div
                                          title={description}
                                          className="text-xs text-muted-foreground mt-0.5 font-normal truncate cursor-help"
                                        >
                                          {description}
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-1 py-1 border-r border-border align-middle bg-blue-50/20 hover:bg-blue-50/40">
                                    <input
                                      type="number"
                                      min={0}
                                      onKeyDown={handleNumberKeyDown}
                                      onPaste={handleNumberPaste}
                                      placeholder="-"
                                      className="w-full h-full min-h-[32px] bg-transparent px-2 text-center text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary transition-colors border-0"
                                      value={baseRecord.value === null || baseRecord.value === undefined ? '' : String(baseRecord.value)}
                                      onChange={e => handleBaseChange('value', e.target.value)}
                                    />
                                  </td>
                                  <td className="px-2 py-1.5 align-middle min-w-[240px] bg-blue-50/20 hover:bg-blue-50/40">
                                    <DataSourceCell
                                      value={baseRecord.source || ''}
                                      onChange={val => handleBaseChange('source', val)}
                                    />
                                  </td>
                                </tr>
                              )
                            }

                            return (
                              <React.Fragment key={category.id}>
                                {isSingleRow ? (
                                  /* Category acts as single data row */
                                  renderRow(category.id, category.label, 1, true, category.description)
                                ) : (
                                  /* Category is header, groups are rows */
                                  <React.Fragment>
                                    <tr
                                      className="border-b border-border bg-muted/5 cursor-pointer hover:bg-muted/10 transition-colors"
                                      onClick={() => toggleCategoryCollapse(category.id)}
                                    >
                                      <td colSpan={3} className="px-4 py-2 pl-8 font-semibold text-foreground border-r border-border">
                                        <div className="flex items-center gap-2">
                                          <CaretRightIcon weight="bold" className={`h-4 w-4 text-muted-foreground transition-transform ${isCategoryCollapsed(category.id) ? '' : 'rotate-90'}`} />
                                          <span>{category.label}</span>
                                        </div>
                                        {category.description && category.description.trim() && (
                                          <div
                                            title={category.description}
                                            className="text-xs text-muted-foreground mt-0.5 ml-6 font-normal max-w-[380px] lg:max-w-[460px] 2xl:max-w-[560px] truncate cursor-help"
                                          >
                                            {category.description}
                                          </div>
                                        )}
                                      </td>
                                    </tr>
                                    {!isCategoryCollapsed(category.id) && category.groups.map(group => renderRow(group.id, group.label, 2, false, group.description))}
                                  </React.Fragment>
                                )}
                              </React.Fragment>
                            )
                          })}

                          {/* Section Total Row (Sticky at bottom of card scroll) */}
                          <tr className="bg-slate-100 border-t-2 border-slate-300 sticky bottom-0 z-20 shadow-md">
                            <td className="px-4 py-3 font-bold text-slate-700 text-right border-r border-slate-300 pr-8 uppercase tracking-wider text-xs bg-slate-100">
                              TOTAL
                            </td>
                            <td className="px-2 py-3 font-black text-red-600 text-center border-r border-slate-300 bg-blue-50/90 text-base">
                              {activeCategories.reduce((acc, category) => {
                                const nodes = Array.isArray(category.groups) && category.groups.length > 0 ? category.groups : [category];
                                return acc + nodes.reduce((sum, node) => {
                                  const val = project.data?.[node.id]?.['__base__']?.value;
                                  return sum + (val !== undefined && val !== null && val !== '' ? Number(val) : 0);
                                }, 0);
                              }, 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                            </td>
                            <td className="px-4 py-3 bg-slate-100"></td>
                          </tr>
                        </React.Fragment>
                      </tbody>
                    </table>
                  </div>
                </div>
                ) : (
                  /* DETAILED SECTION VIEW (CUSTOM COLUMNS) */
                  <div className="bg-background rounded-xl border border-slate-300/90 shadow-sm flex flex-col flex-1 h-full min-h-0 overflow-hidden">
                    {activeCategories.length === 0 ? (
                      <div className="text-center text-muted-foreground p-8 bg-background">
                        {isLoadingProject ? 'Loading section categories...' : 'No categories defined for this section.'}
                      </div>
                    ) : (
                      <div className="overflow-auto flex-1 custom-scrollbar">
                        <table className="w-full text-left text-sm border-collapse min-w-max">
                          <thead className="border-b border-border sticky top-0 z-20 shadow-xs">
                              <tr>
                                <th
                                  className="px-4 py-3 font-bold text-white min-w-[200px]"
                                  style={{ backgroundColor: activeSection.accentColor || '#B5111B' }}
                                >
                                  #
                                </th>
                                <th
                                  className="px-2 py-3 font-bold text-white text-center w-28 border-l border-white/20"
                                  style={{ backgroundColor: activeSection.accentColor || '#B5111B' }}
                                >
                                  Data
                                </th>
                                {sectionColumns.map(col => (
                                  <th
                                    key={col.id}
                                    className={cn(
                                      "px-2 py-3 font-bold text-white border-l border-white/20",
                                      isNotesColumn(col.name) ? "text-left min-w-[220px]" : "text-center"
                                    )}
                                    style={{ backgroundColor: activeSection.accentColor || '#B5111B' }}
                                  >
                                    {col.name}
                                  </th>
                                ))}
                                <th
                                  className="px-3 py-3 font-bold text-white text-left min-w-[240px] border-l border-white/20"
                                  style={{ backgroundColor: activeSection.accentColor || '#B5111B' }}
                                >
                                  Data Source
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {activeCategories.map(category => {
                                const groups = Array.isArray(category.groups) ? category.groups : [];
                                const columns = Array.isArray(category.columns) ? category.columns : [];
                                const hasGroups = groups.length > 0;
                                const isCollapsed = isCategoryCollapsed(category.id);

                                return (
                                  <React.Fragment key={category.id}>
                                    {hasGroups && (
                                      <tr
                                        className="bg-muted/10 border-b border-border cursor-pointer hover:bg-muted/20 transition-colors"
                                        onClick={() => toggleCategoryCollapse(category.id)}
                                      >
                                        <td colSpan={sectionColumns.length + 3} className="px-4 py-3 font-semibold text-foreground">
                                          <div className="flex items-center gap-2">
                                            <CaretRightIcon weight="bold" className={`h-4 w-4 text-muted-foreground transition-transform ${isCollapsed ? '' : 'rotate-90'}`} />
                                            <span>{category.label}</span>
                                          </div>
                                          {category.description && category.description.trim() && (
                                            <div
                                              title={category.description}
                                              className="text-xs text-muted-foreground mt-0.5 ml-6 font-normal max-w-[320px] lg:max-w-[420px] 2xl:max-w-[500px] truncate cursor-help"
                                            >
                                              {category.description}
                                            </div>
                                          )}
                                        </td>
                                      </tr>
                                    )}
                                    {(!isCollapsed || !hasGroups) && (hasGroups ? groups : [category]).map((rowNode: any) => {
                                    const groupData = project.data?.[rowNode.id] || {}
                                    const baseRecord = groupData['__base__'] || { value: '', source: '' }

                                    const evaluateRules = (col: any, sourceData: Record<string, any>) => {
                                      if (!col.conditionalRules || col.conditionalRules.length === 0) return undefined;

                                      for (const rule of col.conditionalRules) {
                                        let sourceValue: any;
                                        if (rule.ifColumnId === '__base__') {
                                          sourceValue = sourceData['__base__']?.value;
                                        } else {
                                          sourceValue = sourceData[rule.ifColumnId]?.value;
                                        }

                                        if (sourceValue === null || sourceValue === undefined || sourceValue === '') continue;

                                        let matched = false;
                                        const condValue = rule.conditionValue;

                                        switch (rule.operator) {
                                          case 'equals': matched = String(sourceValue) === String(condValue); break;
                                          case 'not_equals': matched = String(sourceValue) !== String(condValue); break;
                                          case 'greater_than': matched = Number(sourceValue) > Number(condValue); break;
                                          case 'less_than': matched = Number(sourceValue) < Number(condValue); break;
                                          case 'greater_than_or_equals': matched = Number(sourceValue) >= Number(condValue); break;
                                          case 'less_than_or_equals': matched = Number(sourceValue) <= Number(condValue); break;
                                          case 'between':
                                            if (Array.isArray(condValue) && condValue.length === 2) {
                                              matched = Number(sourceValue) >= condValue[0] && Number(sourceValue) <= condValue[1];
                                            }
                                            break;
                                        }

                                        if (matched) {
                                          return rule.resultValue;
                                        }
                                      }
                                      return undefined;
                                    }

                                    const isYnColumn = (name?: string) => /y\s*\(?1\)?\s*\/\s*n\s*\(?0\)?|y\s*\/\s*n/i.test(name || '');
                                    const isValueColumn = (name?: string) => (name || '').trim().toLowerCase() === 'value';

                                    const evaluateGroupScoringRules = (node: any, sourceData: Record<string, any>, targetCol?: any) => {
                                      const rules = node?.scoringRules;
                                      if (!Array.isArray(rules) || rules.length === 0) return undefined;

                                      for (const rule of rules) {
                                        if (targetCol) {
                                          const targetId = rule.targetColumnId;
                                          let isTarget = false;
                                          if (!targetId || targetId === '__value__' || targetId.toLowerCase() === 'value') {
                                            isTarget = isValueColumn(targetCol.name);
                                          } else if (targetId === '__yn__' || isYnColumn(targetId)) {
                                            isTarget = isYnColumn(targetCol.name);
                                          } else {
                                            isTarget = targetId === targetCol.id || (targetCol.name && targetId.trim().toLowerCase() === targetCol.name.trim().toLowerCase());
                                          }
                                          if (!isTarget) continue;
                                        }

                                        const colId = rule.ifColumnId || '__base__';
                                        let sourceVal: any;
                                        if (colId === '__base__' || colId === 'Data' || colId === 'data') {
                                          sourceVal = sourceData['__base__']?.value;
                                        } else {
                                          sourceVal = sourceData[colId]?.value;
                                          if (sourceVal === undefined) {
                                            const c = sectionColumns.find(sc => sc.id === colId || sc.name?.trim().toLowerCase() === colId.trim().toLowerCase());
                                            if (c) sourceVal = sourceData[c.id]?.value;
                                          }
                                        }

                                        if (sourceVal === null || sourceVal === undefined || sourceVal === '') continue;

                                        let matched = false;
                                        const condValue = rule.conditionValue;
                                        const numVal = Number(sourceVal);
                                        const isNum = !isNaN(numVal);

                                        let compVal = numVal;
                                        if (isNum) {
                                          const isPct = (node?.unit && String(node.unit).includes('%')) ||
                                                        (node?.label && (node.label.includes('%') || /rate|percent|absent|poverty|employed|cost burdened/i.test(node.label)));
                                          const condRef = Array.isArray(condValue)
                                            ? Math.max(Math.abs(Number(condValue[0])), Math.abs(Number(condValue[1])))
                                            : Math.abs(Number(condValue));
                                          if (isPct && condRef > 1 && Math.abs(numVal) > 0 && Math.abs(numVal) <= 1) {
                                            compVal = numVal * 100;
                                          } else if (isPct && condRef > 0 && condRef <= 1 && Math.abs(numVal) > 1) {
                                            compVal = numVal / 100;
                                          }
                                        }

                                        switch (rule.operator) {
                                          case 'equals':
                                            matched = isNum ? compVal === Number(condValue) : String(sourceVal).trim().toLowerCase() === String(condValue).trim().toLowerCase();
                                            break;
                                          case 'not_equals':
                                            matched = isNum ? compVal !== Number(condValue) : String(sourceVal).trim().toLowerCase() !== String(condValue).trim().toLowerCase();
                                            break;
                                          case 'greater_than':
                                            matched = isNum && compVal > Number(condValue);
                                            break;
                                          case 'less_than':
                                            matched = isNum && compVal < Number(condValue);
                                            break;
                                          case 'greater_than_or_equals':
                                            matched = isNum && compVal >= Number(condValue);
                                            break;
                                          case 'less_than_or_equals':
                                            matched = isNum && compVal <= Number(condValue);
                                            break;
                                          case 'between':
                                            if (Array.isArray(condValue) && condValue.length === 2 && isNum) {
                                              matched = compVal >= Number(condValue[0]) && compVal <= Number(condValue[1]);
                                            }
                                            break;
                                        }

                                        if (matched) {
                                          return Number(rule.resultValue);
                                        }
                                      }
                                      return undefined;
                                    };

                                    const ynCol = sectionColumns.find(c => isYnColumn(c.name));
                                    const valueCol = sectionColumns.find(c => isValueColumn(c.name));
                                    const ynGroupRuleVal = ynCol ? evaluateGroupScoringRules(rowNode, groupData, ynCol) : undefined;
                                    const valGroupRuleVal = valueCol ? evaluateGroupScoringRules(rowNode, groupData, valueCol) : evaluateGroupScoringRules(rowNode, groupData);

                                    const ynRecord = ynCol ? groupData[ynCol.id] : undefined;
                                    const ynRuleVal = ynCol ? (evaluateRules(ynCol, groupData) ?? ynGroupRuleVal) : ynGroupRuleVal;
                                    const currentYn = ynRuleVal !== undefined ? ynRuleVal : ynRecord?.value;
                                    const hasYn = currentYn !== null && currentYn !== undefined && currentYn !== '' && currentYn !== '-';

                                    const valRecord = valueCol ? groupData[valueCol.id] : undefined;
                                    const valRuleVal = valueCol ? (evaluateRules(valueCol, groupData) ?? valGroupRuleVal) : valGroupRuleVal;
                                    const currentVal = valRuleVal !== undefined ? valRuleVal : valRecord?.value;
                                    const hasVal = currentVal !== null && currentVal !== undefined && currentVal !== '' && currentVal !== '-';

                                    // Build context for formula evaluation
                                    const rowContext: Record<string, number> = {};
                                    rowContext['Data_Summary'] = Number(baseRecord.value) || 0;
                                    rowContext['Data'] = Number(baseRecord.value) || 0;
                                    rowContext['data'] = Number(baseRecord.value) || 0;

                                    const colsToProcess = (activeSection?.columns && activeSection.columns.length > 0) ? activeSection.columns : (category.columns || []);
                                    colsToProcess.forEach(c => {
                                      const cRecord = groupData[c.id] || {};
                                      let finalVal = cRecord.value;
                                      const ruleVal = evaluateRules(c, groupData);
                                      if (ruleVal !== undefined) finalVal = ruleVal;
                                      if ((finalVal === undefined || finalVal === null || finalVal === '') && (rowNode as any)?.columnDefaults) {
                                        finalVal = (rowNode as any).columnDefaults[c.id] ?? (rowNode as any).columnDefaults[c.name];
                                      }

                                      const safeName = c.name.replace(/[^a-zA-Z0-9_]/g, '_');
                                      if (c.type === 'boolean') {
                                        rowContext[safeName] = finalVal === true || finalVal === 'true' || finalVal === '1' || finalVal === 1 ? 1 : 0;
                                      } else {
                                        rowContext[safeName] = Number(finalVal) || 0;
                                      }
                                    });

                                    rowContext['Highest_Score'] = Number((rowNode as any)?.highestScore) || 4;
                                    rowContext['Weight'] = Number((rowNode as any)?.weight) || 2;
                                    rowContext['Weight_1_4_'] = Number((rowNode as any)?.weight) || 2;

                                    // Explicitly apply mutual exclusivity to formula context based on rowNode.scoringType
                                    const rowScoringType = (rowNode as any)?.scoringType;
                                    const isBooleanMode = rowScoringType === 'boolean' || (rowScoringType !== 'value' && hasYn && !hasVal);

                                    const ynVal = hasYn ? (currentYn === true || currentYn === 'true' || currentYn === 1 || currentYn === '1' ? 1 : Number(currentYn) || 0) : 0;
                                    const numVal = hasVal ? Number(currentVal) || 0 : 0;

                                    if (ynCol) {
                                      const ynSafeName = (ynCol.name || '').replace(/[^a-zA-Z0-9_]/g, '_');
                                      rowContext[ynSafeName] = ynVal;
                                    }
                                    if (valueCol) {
                                      const valSafeName = (valueCol.name || '').replace(/[^a-zA-Z0-9_]/g, '_');
                                      const effectiveVal = isBooleanMode ? ynVal : numVal;
                                      rowContext[valSafeName] = effectiveVal;
                                      rowContext['Value'] = effectiveVal;
                                      rowContext['value'] = effectiveVal;
                                    }

                                    const evaluateFormula = (expr: string | undefined) => {
                                      if (!expr) return '-';
                                      // If formula relies on Y/N or Value, and neither has a value, return '-'
                                      if ((expr.includes('Y_1__N_0_') || expr.includes('Value')) && !hasYn && !hasVal) {
                                        return '-';
                                      }
                                      try {
                                        let cleanExpr = expr
                                          .replace(/Y\s*\(\s*1\s*\)\s*\/\s*N\s*\(\s*0\s*\)/gi, 'Y_1__N_0_')
                                          .replace(/Weight\s*\(\s*1\s*-\s*4\s*\)/gi, 'Weight_1_4_')
                                          .replace(/Highest\s+Score/gi, 'Highest_Score');

                                        const keys = ['IF', 'MIN', 'MAX', 'ROUND', ...Object.keys(rowContext)];
                                        const values = [
                                          (c: any, a: any, b: any) => (c ? a : b),
                                          Math.min,
                                          Math.max,
                                          Math.round,
                                          ...Object.values(rowContext),
                                        ];
                                        const fn = new Function(...keys, `return Number(${cleanExpr});`);
                                        const result = fn(...values);
                                        return isNaN(result) || !isFinite(result) ? '-' : Number(result.toFixed(2));
                                      } catch (e) {
                                        return 'Err';
                                      }
                                    }

                                    const handleBaseChange = (val: string) => {
                                      let finalVal: number | null = null;
                                      if (val !== '' && val !== null && val !== undefined) {
                                        const num = Number(val);
                                        finalVal = isNaN(num) ? null : Math.max(0, num);
                                      }
                                      updateProjectData(project.id, rowNode.id, '__base__', {
                                        ...baseRecord,
                                        value: finalVal
                                      });
                                      scheduleAutoRefresh();
                                    }

                                    const handleBaseSourceChange = (val: string) => {
                                      updateProjectData(project.id, rowNode.id, '__base__', {
                                        ...baseRecord,
                                        source: val
                                      });
                                      scheduleAutoRefresh();
                                    }

                                    return (
                                      <tr key={rowNode.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-2 text-foreground font-medium border-r border-border align-middle">
                                          <div className="max-w-[280px] lg:max-w-[360px] 2xl:max-w-[440px]">
                                            <div className="font-medium text-foreground">{rowNode.label}</div>
                                            {rowNode.description && rowNode.description.trim() && (
                                              <div
                                                title={rowNode.description}
                                                className="text-xs text-muted-foreground mt-0.5 font-normal truncate cursor-help"
                                              >
                                                {rowNode.description}
                                              </div>
                                            )}
                                          </div>
                                        </td>
                                        <td className="px-1 py-1 align-middle border-r border-border">
                                          <input
                                            type="number"
                                            min={0}
                                            onKeyDown={handleNumberKeyDown}
                                            onPaste={handleNumberPaste}
                                            placeholder="-"
                                            className="w-full h-full min-h-[40px] text-center bg-transparent focus-visible:bg-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary px-2 font-medium"
                                            value={baseRecord.value === null || baseRecord.value === undefined ? '' : String(baseRecord.value)}
                                            onChange={e => handleBaseChange(e.target.value)}
                                          />
                                        </td>

                                        {sectionColumns.map(secCol => {
                                          const col = secCol;

                                          if (!col) {
                                            return (
                                              <td key={secCol.id} className="px-2 py-2 align-middle text-center border-l border-border/50 text-muted-foreground/30 font-mono text-xs">
                                                -
                                              </td>
                                            );
                                          }

                                          const record = groupData[col.id] || { value: col.type === 'boolean' ? null : '', scoreValue: null };
                                          const isThisYn = isYnColumn(col.name);
                                          const isThisValue = isValueColumn(col.name);
                                          const isClientTotalScore = /client\s*total/i.test(col.name || '');
                                          const isNotesCol = isNotesColumn(col.name);
                                          const groupRuleVal = evaluateGroupScoringRules(rowNode, groupData, col);
                                          const ruleVal = evaluateRules(col, groupData) ?? groupRuleVal;

                                          // Determine mutual exclusivity based on rowNode.scoringType
                                          const isRowBoolean = (rowNode as any)?.scoringType === 'boolean';
                                          const isRowValue = (rowNode as any)?.scoringType === 'value';
                                          let isMutuallyExclusiveDisabled = false;
                                          if (isRowBoolean) {
                                            isMutuallyExclusiveDisabled = isThisValue;
                                          } else if (isRowValue) {
                                            isMutuallyExclusiveDisabled = isThisYn;
                                          } else {
                                            // Fallback for legacy rows
                                            isMutuallyExclusiveDisabled = (isThisYn && hasVal) || (isThisValue && hasYn);
                                          }
                                          const isLocked = col.isReadOnly || ruleVal !== undefined || isMutuallyExclusiveDisabled;

                                          let displayValue = ruleVal !== undefined ? ruleVal : record.value;
                                          if (isMutuallyExclusiveDisabled) {
                                            displayValue = '';
                                          }

                                          const handleChange = (field: 'value' | 'scoreValue', val: any) => {
                                            if (isLocked) return;
                                            let finalVal = val;
                                            if (field === 'value' && col.type === 'number') {
                                              if (val === '' || val === null || val === undefined) {
                                                finalVal = null;
                                              } else {
                                                const num = Number(val);
                                                finalVal = isNaN(num) ? null : Math.max(0, num);
                                                if (isThisYn && finalVal !== null) {
                                                  finalVal = Math.min(1, finalVal);
                                                }
                                                if (col.validation && finalVal !== null) {
                                                  if (col.validation.min !== null && col.validation.min !== undefined && finalVal < col.validation.min) return;
                                                  if (col.validation.max !== null && col.validation.max !== undefined && finalVal > col.validation.max) return;
                                                }
                                              }
                                            }
                                            if (field === 'value' && col.type === 'boolean') finalVal = val === 'true' ? true : val === 'false' ? false : null;
                                            if (field === 'scoreValue') {
                                              if (val === '' || val === null || val === undefined) {
                                                finalVal = null;
                                              } else {
                                                const num = Number(val);
                                                finalVal = isNaN(num) ? null : Math.max(0, num);
                                              }
                                            }

                                            updateProjectData(project.id, rowNode.id, col.id, {
                                              ...record,
                                              [field]: finalVal
                                            });

                                            // Dynamic alternate mutual exclusivity:
                                            if (isThisYn && finalVal !== null && valueCol) {
                                              updateProjectData(project.id, rowNode.id, valueCol.id, {
                                                ...(groupData[valueCol.id] || {}),
                                                value: null,
                                                scoreValue: null
                                              });
                                            } else if (isThisValue && finalVal !== null && ynCol) {
                                              updateProjectData(project.id, rowNode.id, ynCol.id, {
                                                ...(groupData[ynCol.id] || {}),
                                                value: null,
                                                scoreValue: null
                                              });
                                            }

                                            scheduleAutoRefresh();
                                          };

                                          const notesDisplay =
                                            col.type === 'boolean' || col.type === 'select' || col.type === 'number' || col.type === 'text'
                                              ? (displayValue !== null && displayValue !== undefined ? String(displayValue) : '')
                                              : String(
                                                  evaluateFormula(
                                                    (isClientTotalScore && (rowNode as any)?.formula?.trim())
                                                      ? (rowNode as any).formula.trim()
                                                      : col.formulaExpression
                                                  ) ?? ''
                                                );

                                          return (
                                            <td
                                              key={col.id}
                                              className={cn(
                                                "px-2 py-2 align-middle border-l border-border/50",
                                                isNotesCol ? "text-left min-w-[220px]" : "text-center",
                                                isLocked ? "bg-muted/10" : ""
                                              )}
                                            >
                                              {isNotesCol ? (
                                                col.type === 'text' && !isLocked ? (
                                                  <NotesCell
                                                    value={displayValue !== null && displayValue !== undefined ? String(displayValue) : ''}
                                                    onChange={val => handleChange('value', val)}
                                                  />
                                                ) : (
                                                  <NotesChip value={notesDisplay} />
                                                )
                                              ) : col.type === 'boolean' ? (
                                                <select
                                                  className={cn(
                                                    "w-20 mx-auto rounded-md border border-input px-2 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
                                                    isMutuallyExclusiveDisabled
                                                      ? "bg-slate-100/70 text-slate-400 cursor-not-allowed opacity-60"
                                                      : isLocked
                                                      ? "bg-transparent opacity-70 cursor-not-allowed"
                                                      : "bg-background"
                                                  )}
                                                  value={isMutuallyExclusiveDisabled ? '' : (displayValue === true || displayValue === 'true' || displayValue === '1' || displayValue === 1 || (typeof displayValue === 'string' && displayValue.toLowerCase() === 'yes') ? 'true' : displayValue === false || displayValue === 'false' || displayValue === '0' || displayValue === 0 || (typeof displayValue === 'string' && displayValue.toLowerCase() === 'no') ? 'false' : '')}
                                                  onChange={e => handleChange('value', e.target.value)}
                                                  disabled={isLocked}
                                                >
                                                  <option value="">-</option>
                                                  <option value="true">Yes</option>
                                                  <option value="false">No</option>
                                                </select>
                                              ) : col.type === 'select' ? (
                                                <select
                                                  className={cn(
                                                    "w-full max-w-[120px] mx-auto rounded-md border border-input px-2 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
                                                    isMutuallyExclusiveDisabled
                                                      ? "bg-slate-100/70 text-slate-400 cursor-not-allowed opacity-60"
                                                      : isLocked
                                                      ? "bg-transparent opacity-70 cursor-not-allowed"
                                                      : "bg-background"
                                                  )}
                                                  value={isMutuallyExclusiveDisabled ? '' : (displayValue || '')}
                                                  onChange={e => handleChange('value', e.target.value)}
                                                  disabled={isLocked}
                                                >
                                                  <option value="">-</option>
                                                  {col.options?.map((opt: any, idx: number) => (
                                                    <option key={idx} value={opt.value}>{opt.label}</option>
                                                  ))}
                                                </select>
                                              ) : col.type === 'number' ? (
                                                <input
                                                  type="number"
                                                  min={col.validation?.min ?? 0}
                                                  max={isThisYn ? 1 : (col.validation?.max ?? undefined)}
                                                  onKeyDown={handleNumberKeyDown}
                                                  onPaste={handleNumberPaste}
                                                  placeholder="-"
                                                  className={cn(
                                                    "w-20 mx-auto rounded-sm border px-2 py-1 text-center text-sm font-semibold transition-all shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
                                                    isMutuallyExclusiveDisabled
                                                      ? "bg-slate-100/70 text-slate-400 cursor-not-allowed border-dashed border-slate-200 shadow-none select-none"
                                                      : isLocked
                                                      ? "bg-transparent opacity-70 cursor-not-allowed border-transparent shadow-none"
                                                      : "bg-transparent hover:border-input focus:bg-background border-transparent"
                                                  )}
                                                  value={isMutuallyExclusiveDisabled ? '' : (displayValue === null || displayValue === undefined ? '' : String(displayValue))}
                                                  onChange={e => handleChange('value', e.target.value)}
                                                  disabled={isLocked}
                                                />
                                              ) : col.type === 'text' ? (
                                                <input
                                                  type="text"
                                                  className={`w-full rounded-sm border border-transparent px-2 py-1 text-sm transition-all ${isLocked ? 'bg-transparent opacity-70 cursor-not-allowed' : 'bg-transparent hover:border-input focus:bg-background shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary'}`}
                                                  value={displayValue !== null && displayValue !== undefined ? String(displayValue) : ''}
                                                  onChange={e => handleChange('value', e.target.value)}
                                                  placeholder="..."
                                                  disabled={isLocked}
                                                />
                                              ) : (
                                                <span className={cn("font-bold px-2 py-1", isClientTotalScore ? "text-[#B5111B]" : "text-primary")}>
                                                  {evaluateFormula((isClientTotalScore && (rowNode as any)?.formula?.trim()) ? (rowNode as any).formula.trim() : col.formulaExpression)}
                                                </span>
                                              )}
                                            </td>
                                          );
                                        })}
                                        {/* Data Source Column (bound to baseRecord.source, matching Summary View) */}
                                        <td className="px-2 py-1.5 align-middle border-l border-border/50 min-w-[240px] bg-blue-50/10 hover:bg-blue-50/25">
                                          <DataSourceCell
                                            value={baseRecord.source || ''}
                                            onChange={handleBaseSourceChange}
                                          />
                                        </td>
                                      </tr>
                                    )
                                  })}
                                </React.Fragment>
                              )
                            })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
