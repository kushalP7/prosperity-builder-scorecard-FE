"use client"

import type { NationLocalRow } from "@/lib/nationalBenchmarks"

interface CategoryNationLocalTableProps {
  rows: NationLocalRow[]
  /** When true, also show Source column (Executive Scorecard client view). */
  showSource?: boolean
  categoryTitle?: string
  className?: string
}

export function CategoryNationLocalTable({
  rows,
  showSource = false,
  categoryTitle,
  className = "",
}: CategoryNationLocalTableProps) {
  if (!rows.length) {
    return (
      <div className={`rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 ${className}`}>
        No subcategory data available for this category yet.
      </div>
    )
  }

  return (
    <div className={`rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm ${className}`}>
      {categoryTitle && (
        <div className="px-4 py-2.5 bg-[#B5111B] text-white text-sm font-bold tracking-tight">
          {categoryTitle}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-[#B5111B] text-white">
              <th className="px-3 py-2.5 font-bold border-r border-red-800/40 w-[40%]">
                {categoryTitle ? "Metric" : "Metric"}
              </th>
              <th className="px-3 py-2.5 font-bold border-r border-red-800/40 w-[25%] text-center">
                Nation
              </th>
              <th className={`px-3 py-2.5 font-bold text-center ${showSource ? "border-r border-red-800/40 w-[20%]" : "w-[35%]"}`}>
                Local Data
              </th>
              {showSource && (
                <th className="px-3 py-2.5 font-bold w-[30%]">Source</th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={`${row.metric}-${i}`}
                className="border-b border-slate-200 last:border-0 hover:bg-slate-50/80"
              >
                <td className="px-3 py-2 border-r border-slate-100 text-slate-800 font-medium align-middle">
                  {row.metric}
                </td>
                <td className="px-3 py-2 border-r border-slate-100 text-slate-600 text-center align-middle">
                  {row.nation}
                </td>
                <td className={`px-3 py-2 text-slate-900 font-semibold text-center align-middle ${showSource ? "border-r border-slate-100" : ""}`}>
                  {row.localData}
                </td>
                {showSource && (
                  <td className="px-3 py-2 text-slate-600 text-xs align-middle">
                    {row.source?.trim() ? row.source : "—"}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
