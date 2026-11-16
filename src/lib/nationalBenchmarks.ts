/**
 * Display-only national / US benchmarks for client-facing Nation | Local tables.
 * Does NOT feed scoring — scoring stays in the BE engine / Master Excel.
 */

export type NationLocalRow = {
  metric: string
  nation: string
  localData: string
  source?: string
}

/**
 * Split a legacy label that embedded scoring rules into clean label + scoringNotes.
 * e.g. "Commute Time If 'Data' 0-20 = 4; …" → { label: "Commute Time", scoringNotes: "If 'Data' …" }
 */
export function splitLabelAndScoringNotes(text: string | undefined | null): {
  label: string
  scoringNotes: string
} {
  const raw = String(text || "").trim()
  if (!raw) return { label: "", scoringNotes: "" }
  const match = raw.match(/^(.*?)(\bIf\b[\s\S]*)$/i)
  if (!match) return { label: raw, scoringNotes: "" }
  const label = match[1].replace(/[\s\-–—,.;:]+$/g, "").trim()
  const scoringNotes = match[2].trim()
  if (!label) return { label: raw, scoringNotes: "" }
  return { label, scoringNotes }
}

/** Strip proprietary threshold / formula snippets from labels & descriptions (legacy safety net). */
export function stripFormulaText(text: string | undefined | null): string {
  if (!text) return ""
  const { label } = splitLabelAndScoringNotes(text)
  if (label && label !== String(text).trim()) return label
  let s = String(text)
  // "If 'Data' …" / "If Data …" scoring rules
  s = s.replace(/\bIf\s+'?Data'?\s*[^=\n]{0,160}/gi, "")
  s = s.replace(/\bIf\s+(Index|above|below|within|>|<|≥|≤)[^\n.]{0,120}/gi, "")
  s = s.replace(/\bValue\s*=\s*\d+/gi, "")
  s = s.replace(/\bNone\s*=\s*\d+[;\s]*/gi, "")
  s = s.replace(/\d+\s*-\s*\d+\s*=\s*\d+/g, "")
  s = s.replace(/[;=]\s*\d+(\s*[;,])?/g, " ")
  s = s.replace(/\s{2,}/g, " ").replace(/^[\s\-–—,.:;]+|[\s\-–—,.:;]+$/g, "")
  return s.trim()
}

const BENCHMARKS: { match: RegExp; nation: string }[] = [
  // Accessibility & Transportation
  { match: /w\/?o\s*vehicle|without\s*vehicle|households?\s*w/i, nation: "8.3% (ACS)" },
  { match: /commute\s*time/i, nation: "26.7 min" },
  { match: /officer|staffing|2\.8/i, nation: "2.8 / 1,000" },

  // Crime (index, US avg = 100)
  { match: /personal\s*crime/i, nation: "US Avg = 100" },
  { match: /property\s*crime/i, nation: "US Avg = 100" },

  // Education
  { match: /bachelor/i, nation: "22.3%" },
  { match: /graduate|phd/i, nation: "13.9%" },
  { match: /associate/i, nation: "9.5%" },
  { match: /some\s*college/i, nation: "17.7%" },
  { match: /high\s*school|diploma/i, nation: "23%" },

  // Employment & Labor
  { match: /labor\s*force|participation/i, nation: "63.0%" },
  { match: /unemploy/i, nation: "4.3%" },
  { match: /average\s*hh\s*income|household\s*income/i, nation: "$107,008" },
  { match: /median\s*income/i, nation: "$72,603" },
  { match: /per\s*capita/i, nation: "$41,310" },

  // Population & Housing
  { match: /renter|rent\s*burden|above\s*30%/i, nation: "51.9%" },
  { match: /median\s*home|home\s*value|housing\s*value/i, nation: "$308,943" },
  { match: /median\s*rent|gross\s*rent/i, nation: "$1,964/mo" },
  { match: /median\s*year|year\s*built/i, nation: "1979" },
  { match: /owner.?occup/i, nation: "35.1%" },

  // Healthcare
  { match: /poverty/i, nation: "12.4%" },
  { match: /uninsured|without\s*insurance/i, nation: "14.9%" },
]

export function lookupNationalBenchmark(label: string): string {
  const text = String(label || "")
  for (const b of BENCHMARKS) {
    if (b.match.test(text)) return b.nation
  }
  return "-"
}

export function formatLocalDataValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "-"
  if (typeof value === "boolean") return value ? "Yes" : "No"
  if (typeof value === "number") {
    return Number.isInteger(value)
      ? String(value)
      : value.toLocaleString(undefined, { maximumFractionDigits: 2 })
  }
  const s = String(value).trim()
  return s || "-"
}

/** Prefer __base__ data input; fall back to common column names. */
export function localDataForGroup(
  projectData: Record<string, any> | undefined,
  groupId: string,
): { localData: string; source: string } {
  const groupData = projectData?.[groupId] || {}
  const base = groupData["__base__"] || {}
  let raw = base.value
  if (raw === undefined || raw === null || raw === "") {
    for (const key of Object.keys(groupData)) {
      const name = String(key).toLowerCase()
      if (name === "data" || name.includes("local")) {
        raw = groupData[key]?.value
        if (raw !== undefined && raw !== null && raw !== "") break
      }
    }
  }
  return {
    localData: formatLocalDataValue(raw),
    source: String(base.source || "").trim(),
  }
}

type CategoryLike = {
  id: string
  label: string
  description?: string
  scoringNotes?: string | null
  groups?: Array<{ id: string; label: string; description?: string; scoringNotes?: string | null }>
}

/**
 * Build Metric | Nation | Local rows for a category (or section's categories).
 * Header-only categories with groups expand to group rows.
 */
export function buildCategoryComparisonRows(
  category: CategoryLike,
  projectData: Record<string, any> | undefined,
): NationLocalRow[] {
  const rows: NationLocalRow[] = []
  const groups = Array.isArray(category.groups) && category.groups.length > 0 ? category.groups : null

  if (!groups) {
    const clean = stripFormulaText(category.label) || category.label
    const { localData, source } = localDataForGroup(projectData, category.id)
    rows.push({
      metric: clean,
      nation: lookupNationalBenchmark(`${category.label} ${category.description || ""}`),
      localData,
      source,
    })
    return rows
  }

  for (const g of groups) {
    const clean = stripFormulaText(g.label) || g.label
    const { localData, source } = localDataForGroup(projectData, g.id)
    rows.push({
      metric: clean,
      nation: lookupNationalBenchmark(`${g.label} ${g.description || ""} ${category.label}`),
      localData,
      source,
    })
  }
  return rows
}

export function buildSectionComparisonRows(
  section: { categories?: CategoryLike[] },
  projectData: Record<string, any> | undefined,
): NationLocalRow[] {
  const cats = Array.isArray(section.categories) ? section.categories : []
  return cats.flatMap((c) => buildCategoryComparisonRows(c, projectData))
}
