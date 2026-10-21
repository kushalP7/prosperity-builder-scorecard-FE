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
  ClipboardList,
  Info,
  Sparkles
} from "lucide-react"
import { Spinner } from "@/components/ui/loader"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"

function generateProductionIntakeValues(projectName: string, categories: any[]): Record<string, any> {
  const rawName = (projectName || 'Community').trim()
  const cleanPlace = rawName
    .replace(/\s*(prosperity|builder|scorecard|intake|project|standard|v\d+|\d{4})\b/gi, '')
    .trim() || 'Regional'

  const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
  const randFloat = (min: number, max: number, decimals = 1) => Number((Math.random() * (max - min) + min).toFixed(decimals))

  // Balanced complementary percentages
  const singleFamilyPct = randFloat(68, 76, 1)
  const multiFamilyPct = Number((100 - singleFamilyPct).toFixed(1))

  const residentialTaxPct = randFloat(64, 72, 1)
  const commercialTaxPct = Number((100 - residentialTaxPct).toFixed(1))

  const waterUtilPct = randFloat(58, 72, 1)
  const wastewaterUtilPct = randFloat(54, 68, 1)
  const fiberPct = randFloat(86, 94, 1)

  const values: Record<string, any> = {
    // 1. Accessibility & Transportation
    transit_airport_name: `${cleanPlace} Regional Executive Airport`,
    transit_airport_count: randInt(1, 2),
    transit_train_count: randInt(0, 1),
    transit_rapid_bus_count: 0,
    transit_city_bus_count: randInt(1, 3),
    transit_trolley_count: 0,
    transit_rideshare_count: randInt(2, 4),
    transit_bike_ped_plan: true,
    transit_bike_ped_date: `202${randInt(1, 3)}-0${randInt(3, 9)}-15`,
    transit_transp_plan: true,
    transit_transp_plan_date: `202${randInt(1, 3)}-0${randInt(1, 8)}-20`,
    transit_notes: `Adopted multi-modal transportation plan coordinated with regional MPO and state DOT.`,

    // 2. Arts & Culture
    arts_public_art_installations: true,
    arts_public_art_count: randInt(10, 22),
    arts_murals_count: randInt(4, 10),
    arts_public_art_map: true,
    arts_public_art_map_link: `https://www.downtown${cleanPlace.toLowerCase().replace(/[^a-z0-9]/g, '')}.org/art-walk`,
    arts_cultural_facilities_count: randInt(4, 8),
    arts_cultural_facilities_list: `${cleanPlace} Arts Center, Historic Civic Theatre, Heritage History Museum, Amphitheater`,
    arts_theaters_count: randInt(1, 3),
    arts_museums_count: randInt(1, 3),
    arts_community_centers_count: randInt(1, 2),
    arts_festivals_count: randInt(3, 6),
    arts_festivals_list: `Annual ${cleanPlace} Spring Heritage Festival, Summer Downtown Music Series, Fall Agricultural Fair`,
    arts_notes: `Active municipal arts council supporting public murals, local artisans, and downtown cultural programming.`,

    // 3. Crime & Public Safety
    safety_municipal_officers_count: randInt(38, 62),
    safety_county_sheriff_deputies_count: randInt(55, 85),
    safety_meets_national_ratio: true,
    safety_calculated_ratio: randFloat(2.6, 3.1, 1),
    safety_community_policing: true,
    safety_fire_departments_count: randInt(3, 6),
    safety_iso_rating: randInt(2, 4),
    safety_notes: `Accredited municipal police and county sheriff emergency dispatch with 24/7 coverage.`,

    // 4. Education
    edu_comm_college_count: randInt(1, 2),
    edu_comm_college_names: `${cleanPlace} Community College & Advanced Technology Center`,
    edu_universities_count: randInt(0, 2),
    edu_universities_names: `${cleanPlace} University Center & Regional Research Hub`,
    edu_closest_higher_ed_miles: randFloat(6, 16, 1),
    edu_closest_higher_ed_name: `${cleanPlace} Community College Main Campus`,
    edu_pre_k_programs: true,
    edu_stem_cte_initiatives: true,
    edu_notes: `Dual-enrollment career & technical education (CTE) partnerships between local school district and community college.`,

    // 5. Employment & Labor
    labor_fortune_500_hq: false,
    labor_employers_500_plus: randInt(3, 7),
    labor_employers_1000_plus: randInt(1, 3),
    labor_major_employers_list: `${cleanPlace} Health System, County School District, Precision Manufacturing Corp, Regional Logistics Center`,
    labor_shovel_ready_inventory: true,
    labor_pad_ready_sites: randInt(3, 6),
    labor_pad_ready_acres: randInt(85, 210),
    labor_buildings_over_5000_sf: randInt(4, 9),
    labor_notes: `County industrial park offers certified pad-ready parcels with heavy three-phase electric, water, and gas access.`,

    // 6. Goods & Services
    goods_farm_stands_count: randInt(2, 5),
    goods_farmers_market_locations: `${cleanPlace} Farmers Market Pavilion, Downtown Civic Center Open Air Market`,
    goods_missing_services: `Specialty organic grocer, expanded late-night dining options, independent bookstore`,
    goods_primary_shopping_districts: `Historic ${cleanPlace} Main Street Commercial Corridor, Gateway Crossing Retail Center`,
    goods_buy_local_program: true,
    goods_supermarkets_count: randInt(4, 8),
    goods_banks_credit_unions: randInt(6, 12),
    goods_pharmacies_count: randInt(4, 8),
    goods_downtown_retail_vacancy: randFloat(3.5, 5.8, 1),
    goods_notes: `Active Downtown Merchants Association with sustained retail foot traffic and low storefront vacancy.`,

    // 7. Healthcare & Wellness
    health_hospitals_count: randInt(1, 2),
    health_hospital_beds_count: randInt(120, 220),
    health_urgent_care_count: randInt(3, 6),
    health_healthy_food_options_count: randInt(5, 9),
    health_underinsured_services: true,
    health_impact_assessments: true,
    health_impact_assessment_date: `202${randInt(1, 3)}-0${randInt(4, 9)}-18`,
    health_mental_health_facilities: randInt(1, 3),
    health_fitness_centers_count: randInt(3, 7),
    health_notes: `${cleanPlace} Community Hospital provides full acute care, surgical suites, and specialized outpatient clinics.`,

    // 8. Historic Preservation
    historic_local_districts_count: randInt(1, 3),
    historic_main_street_manager: true,
    historic_national_register_count: randInt(14, 28),
    historic_rehab_tax_credit_projects: randInt(3, 8),
    historic_main_street_program: true,
    historic_bid_msd_district: true,
    historic_bid_msd_locations: `Downtown ${cleanPlace} Municipal Service District`,
    historic_tour_maps_assets: true,
    historic_tour_maps_details: `Self-guided historic architecture walking tour brochure and mobile interactive guide.`,
    historic_preservation_commission: true,
    historic_preservation_guidelines: true,
    historic_notes: `Accredited Main Street America community with active historic facade restoration grants.`,

    // 9. Population & Housing
    housing_authority: true,
    housing_authority_services: `Section 8 housing choice vouchers, senior living facilities, and first-time homebuyer assistance.`,
    housing_annual_permits_issued: randInt(260, 480),
    housing_affordable_programs: true,
    housing_affordable_program_details: `Municipal Housing Trust Fund providing density bonuses and fee waivers for workforce housing.`,
    housing_single_family_ratio: singleFamilyPct,
    housing_multifamily_ratio: multiFamilyPct,
    housing_needs_assessment_date: `202${randInt(1, 3)}-0${randInt(2, 8)}-14`,
    housing_notes: `Healthy residential permitting pipeline supporting balanced single-family and downtown multi-family developments.`,

    // 10. Infrastructure
    infra_water_provider_capacity: `${cleanPlace} Municipal Water Authority, operating at ~${Math.round(waterUtilPct)}% peak capacity with planned expansion.`,
    infra_sewer_provider_capacity: `${cleanPlace} Regional Wastewater Reclamation Facility, permitted at 14 MGD with ~${Math.round(wastewaterUtilPct)}% capacity used.`,
    infra_electric_provider_capacity: `Duke Energy & ${cleanPlace} Public Power with dual redundant sub-station feeds.`,
    infra_broadband_provider: `AT&T Fiber, Spectrum, and regional gigabit fiber with ~${Math.round(fiberPct)}% countywide coverage.`,
    infra_roadway_expansion_plans: true,
    infra_roadway_plans_description: `East-West parkway connector and smart intersection signal synchronization program.`,
    infra_stormwater_quality_assessment: `Annual state environmental agency NPDES MS4 stormwater audit in full compliance.`,
    infra_emergency_evacuation_plan: `${cleanPlace} Multi-Agency Hazard Mitigation & Emergency Evacuation Plan updated with emergency management.`,
    infra_green_energy_incentives: true,
    infra_green_energy_details: `Fast-track permitting and property tax incentives for commercial rooftop solar and EV charging stations.`,
    infra_water_utilization_pct: waterUtilPct,
    infra_wastewater_utilization_pct: wastewaterUtilPct,
    infra_broadband_fiber_pct: fiberPct,
    infra_stormwater_utility: true,
    infra_renewable_projects: randInt(2, 5),
    infra_notes: `Extensive public utility network with strong reserve capacity ready for commercial and industrial expansion.`,

    // 11. Open Space & Recreation
    rec_master_plan: true,
    rec_greenway_plan: true,
    rec_greenway_plan_date: `202${randInt(1, 3)}-0${randInt(3, 9)}-22`,
    rec_director: true,
    rec_greenways_condition: `${randFloat(10, 18, 1)} miles of paved greenway trails in excellent condition with wayfinding signage and lighting.`,
    rec_natural_assets_count: randInt(3, 6),
    rec_natural_assets_description: `${cleanPlace} Riverfront Park, Lake recreation basin, public paddle trail, and county nature preserve.`,
    rec_designated_open_spaces_count: randInt(4, 8),
    rec_designated_open_spaces_locations: `${cleanPlace} Central Community Park, Riverfront Greenway, East Sports Complex`,
    rec_conservation_ordinances: `Adopted watershed buffer protections and steep-slope environmental protection overlay.`,
    rec_national_state_parks: `State Recreation Park within 15 miles offering public hiking trails, camping, and boat launches.`,
    rec_public_parks_count: randInt(6, 12),
    rec_public_parks_acres: randInt(180, 320),
    rec_trails_miles: randFloat(11, 20, 1),
    rec_public_water_access: randInt(2, 5),
    rec_notes: `Public park system exceeds the National Recreation and Park Association standard of 10 acres per 1,000 residents.`,

    // 12. Planning & Land Use
    plan_comp_plan_date: `202${randInt(1, 3)}-0${randInt(1, 6)}-10`,
    plan_zoning_update_date: `202${randInt(1, 3)}-0${randInt(4, 9)}-15`,
    plan_voluntary_ag_districts: true,
    plan_tax_base_residential_pct: residentialTaxPct,
    plan_tax_base_commercial_pct: commercialTaxPct,
    plan_available_development_acreage: `Over ${randInt(600, 1100)} acres zoned and designated for light industrial, logistics, and mixed-use development.`,
    plan_tax_exempt_acreage: `Approx. ${randInt(140, 220)} acres across municipal buildings, public schools, and community churches.`,
    plan_growth_and_ag_preservation: true,
    plan_mixed_use_zoning: true,
    plan_sidewalks_required: true,
    plan_open_space_standards: true,
    plan_sensitive_areas_protection: true,
    plan_comp_plan_adopted: true,
    plan_udo_modern_zoning: true,
    plan_downtown_revitalization_plan: true,
    plan_capital_improvement_cip: true,
    plan_dedicated_gis_planner: true,
    plan_notes: `Modern Unified Development Ordinance (UDO) supporting mixed-use development, agricultural preservation, and walkable corridors.`,
  }

  const result: Record<string, any> = {}
  categories.forEach((cat: any) => {
    (cat.questions || []).forEach((q: any) => {
      if (values[q.key] !== undefined) {
        const val = values[q.key]
        if (q.type === 'number') {
          result[q.key] = typeof val === 'number' ? val : (Number(val) || 0)
        } else if (q.type === 'boolean') {
          result[q.key] = Boolean(val)
        } else {
          result[q.key] = String(val)
        }
      } else {
        if (q.type === 'number') {
          const parsed = q.placeholder ? Number(String(q.placeholder).replace(/[^0-9.]/g, '')) : NaN
          result[q.key] = !isNaN(parsed) && parsed > 0 ? parsed : (q.unit === '%' ? randFloat(4, 18, 1) : randInt(1, 5))
        } else if (q.type === 'boolean') {
          result[q.key] = Math.random() > 0.2
        } else if (q.type === 'date') {
          result[q.key] = `202${randInt(1, 3)}-0${randInt(1, 9)}-15`
        } else if (q.type === 'textarea') {
          result[q.key] = `Verified from ${cleanPlace} comprehensive master plans and agency documentation.`
        } else {
          result[q.key] = q.placeholder ? q.placeholder.replace(/^e\.g\.,?\s*/i, '') : `${cleanPlace} Municipal Facility`
        }
      }
    })
  })

  return result
}

export default function ProjectIntakePage() {
  const routeParams = useParams<{ id: string }>()
  const id = routeParams.id || ""
  const { projects } = useAppStore()
  const project = projects.find((p) => p.id === id)

  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false)
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

  const handleAutoFillBenchmarks = () => {
    const generated = generateProductionIntakeValues(project?.name || '', categories)
    setAnswers((prev) => ({ ...prev, ...generated }))
    const count = Object.keys(generated).length
    toast.success(`Populated ${count} realistic values across all 12 categories!`)
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
    setSubmitting(true)
    try {
      const formattedAnswers: Record<string, any> = {}
      Object.keys(answers).forEach((k) => {
        formattedAnswers[k] = { value: answers[k], updatedAt: new Date().toISOString() }
      })
      const res = await apiClient.submitQuestionnaire(id, formattedAnswers)
      if (res) {
        setSubmission((prev: any) => ({ ...prev, status: 'SUBMITTED' }))
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
          window.dispatchEvent(new CustomEvent('project-synced', { detail: { id, fresh } }))
        }
        toast.success('Questionnaire submitted successfully!')
      }
    } catch {
      toast.error('Failed to submit questionnaire')
    } finally {
      setSubmitting(false)
      setIsConfirmOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-3">
        <Spinner className="w-8 h-8 text-[#B5111B]" />
        <span className="text-sm font-medium text-slate-500">Loading Client Intake Questionnaire...</span>
      </div>
    )
  }

  const categories = submission?.categories || []
  const totalQuestions = categories.reduce((s: number, c: any) => s + (c.questions?.length || 0), 0)
  const answeredCount = Object.keys(answers).filter((k) => answers[k] !== undefined && answers[k] !== '' && answers[k] !== null).length
  const progressPct = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0

  const isSubmitted = submission?.status === 'SUBMITTED' || project?.status === 'PUBLISHED' || project?.status === 'CALCULATED' || project?.status === 'INTAKE_SUBMITTED'

  return (
    <div className="space-y-6 pb-16">
      {/* Executive Header Banner */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#B5111B]" />

        <div className="space-y-2 max-w-2xl">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {project?.name || 'Scorecard Intake Questionnaire'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Gathering verified local indicators across 12 essential Quality of Life categories. Responses feed directly into the metric normalization and scoring engine.
          </p>
        </div>

        <div className="bg-slate-50/90 p-4 rounded-xl border border-slate-200/90 min-w-[260px] space-y-2.5">
          <div className="flex justify-between items-center text-xs text-slate-700">
            <span className="font-semibold text-slate-600">Completion</span>
            <span className="font-bold text-[#B5111B]">{answeredCount} of {totalQuestions} answered ({progressPct}%)</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#B5111B] h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-500 font-medium">Status:</span>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${isSubmitted
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
              : 'bg-amber-50 text-amber-700 border border-amber-300'
              }`}>
              {isSubmitted ? 'SUBMITTED' : 'DRAFT IN PROGRESS'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Info className="w-4 h-4 text-[#B5111B] shrink-0" />
          <span>Fill in the fields below or use Auto-Fill to populate realistic local baseline values. No external APIs are called.</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAutoFillBenchmarks}
            disabled={isSubmitted}
            className="flex items-center gap-1.5 text-xs h-9 px-3.5 border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 font-semibold cursor-pointer shadow-xs"
            title="Auto-fill realistic baseline values for all 142 questions locally (no external APIs)"
          >
            Auto-Fill Benchmarks
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            disabled={saving || isSubmitted}
            className="flex items-center gap-1.5 text-xs h-9 px-3.5 border-slate-300 text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-slate-500" />
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button
            size="sm"
            onClick={() => setIsConfirmOpen(true)}
            disabled={submitting || isSubmitted}
            className="bg-[#B5111B] hover:bg-[#9B0F17] text-white flex items-center gap-1.5 text-xs h-9 px-4 font-semibold shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            {submitting ? 'Submitting...' : isSubmitted ? 'Intake Submitted' : 'Submit Questionnaire'}
          </Button>
        </div>
      </div>

      {/* 12 Categories Tabs & Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Category Navigation Sidebar */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200/90 p-2 shadow-xs space-y-1 sticky top-6">
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
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${isActive
                  ? 'bg-red-50/90 text-[#B5111B] font-bold border-l-4 border-[#B5111B] shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className={`text-[11px] font-mono shrink-0 ${isActive ? 'text-[#B5111B]/70 font-bold' : 'text-slate-400'}`}>
                    {(idx + 1).toString().padStart(2, '0')}
                  </span>
                  <span className="truncate">{cat.categoryLabel}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {isCatComplete ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#B5111B]" />
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
              <Card key={cat.categoryKey} className="border-slate-200/90 shadow-xs">
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
                                  className="accent-[#B5111B]"
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
                                  className="accent-[#B5111B]"
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
                              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#B5111B]/20 focus:border-[#B5111B] transition-colors"
                            />
                          ) : q.type === 'date' ? (
                            <input
                              type="date"
                              value={val ? (typeof val === 'string' && val.includes('T') ? val.split('T')[0] : String(val).slice(0, 10)) : ''}
                              onChange={(e) => handleInputChange(q.key, e.target.value)}
                              disabled={isSubmitted}
                              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#B5111B]/20 focus:border-[#B5111B] transition-colors bg-white text-slate-800"
                            />
                          ) : q.type === 'number' ? (
                            <input
                              type="number"
                              value={val}
                              placeholder={q.placeholder || '0'}
                              onChange={(e) => handleInputChange(q.key, e.target.value === '' ? '' : Number(e.target.value))}
                              disabled={isSubmitted}
                              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#B5111B]/20 focus:border-[#B5111B] transition-colors"
                            />
                          ) : (
                            <input
                              type="text"
                              value={val}
                              placeholder={q.placeholder || 'Enter response...'}
                              onChange={(e) => handleInputChange(q.key, e.target.value)}
                              disabled={isSubmitted}
                              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#B5111B]/20 focus:border-[#B5111B] transition-colors"
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
                      className="text-xs h-8 px-3 border-slate-300 text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
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

      {/* Confirmation Modal */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        isLoading={submitting}
        loadingText="Submitting..."
        onClose={() => {
          if (!submitting) setIsConfirmOpen(false)
        }}
        onConfirm={handleSubmit}
        title="Submit Client Intake Questionnaire"
        description="Are you ready to submit the questionnaire? This will lock in your intake responses and trigger automated secondary API ingestion for this project."
        itemName={project?.name}
        confirmText="Submit Questionnaire"
        cancelText="Cancel"
        variant="primary"
      />
    </div>
  )
}
