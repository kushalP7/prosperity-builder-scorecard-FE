/** FE mirror: admin-empty = licensed ESRI/CoStar/Moody leftovers (not in free API list). */

export type LicensedProvider = "ESRI" | "COSTAR" | "MOODYS_CRE"

export const LICENSED_SOURCE_LABELS: Record<LicensedProvider, string> = {
  ESRI: "ESRI/ArcGIS",
  COSTAR: "CoStar",
  MOODYS_CRE: "Moody's CRE",
}

/** Only metrics NOT covered by Census/BLS/EPA/CDC/DOT free APIs */
const ADMIN_EMPTY_PATTERNS = [
  "personal crime",
  "property crime",
  "diversity index",
  "healthy food",
  "access to healthy food",
  "retail vacancy",
  "residential property tax",
  "commercial property tax",
  "low performing",
  "k-12 performance",
  "chronic absent",
  "moody",
]

export function isAdminEmptyMetric(nodeLabel: string): boolean {
  const label = String(nodeLabel || "").toLowerCase()
  return ADMIN_EMPTY_PATTERNS.some((p) => label.includes(p))
}

export function expectedLicensedProvider(nodeLabel: string): LicensedProvider | null {
  const label = String(nodeLabel || "").toLowerCase()
  if (label.includes("retail vacancy")) return "COSTAR"
  if (label.includes("moody")) return "MOODYS_CRE"
  if (
    label.includes("personal crime") ||
    label.includes("property crime") ||
    label.includes("diversity") ||
    label.includes("healthy food")
  ) {
    return "ESRI"
  }
  return null
}
