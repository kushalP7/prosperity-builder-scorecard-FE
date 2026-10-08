"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Dropdown } from "@/components/ui/dropdown"

export interface PaginationProps {
  page: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
  isLoading?: boolean
  className?: string
}

export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  isLoading = false,
  className = "",
}: PaginationProps) {
  const startItem = totalItems > 0 ? (page - 1) * pageSize + 1 : 0
  const endItem = Math.min(totalItems, page * pageSize)

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 px-1 pt-3 pb-2 ${className}`}
    >
      {/* Counter and Page Size */}
      <div className="flex items-center gap-3 flex-wrap">
        <span>
          Showing <strong className="text-slate-700">{startItem}</strong> to{" "}
          <strong className="text-slate-700">{endItem}</strong> of{" "}
          <strong className="text-slate-700">{totalItems}</strong> records
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
            <span className="font-semibold text-slate-500">Per page:</span>
            <Dropdown
              value={String(pageSize)}
              disabled={isLoading}
              direction="up"
              onChange={(val) => onPageSizeChange(Number(val))}
              options={pageSizeOptions.map((opt) => ({
                value: String(opt),
                label: String(opt),
              }))}
              size="sm"
              className="inline-block"
              buttonClassName="py-1 px-2.5 text-xs font-bold rounded-lg border-slate-200"
              menuClassName="min-w-[70px]"
            />
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5 self-center sm:self-auto">
          <button
            type="button"
            disabled={page <= 1 || isLoading}
            onClick={() => onPageChange(page - 1)}
            className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition shadow-2xs cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => {
            if (
              totalPages <= 7 ||
              pg === 1 ||
              pg === totalPages ||
              (pg >= page - 1 && pg <= page + 1)
            ) {
              const isActive = pg === page
              return (
                <button
                  key={pg}
                  type="button"
                  disabled={isLoading}
                  onClick={() => onPageChange(pg)}
                  className={`w-8 h-8 rounded-full text-xs font-bold transition flex items-center justify-center cursor-pointer ${isActive
                      ? "bg-[#B5111B] text-white shadow-xs"
                      : "hover:bg-slate-100 text-slate-700 bg-transparent"
                    }`}
                >
                  {pg}
                </button>
              )
            }
            if (pg === 2 || pg === totalPages - 1) {
              return (
                <span key={pg} className="px-1 text-slate-400 text-xs font-bold">
                  ...
                </span>
              )
            }
            return null
          })}

          <button
            type="button"
            disabled={page >= totalPages || isLoading}
            onClick={() => onPageChange(page + 1)}
            className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition shadow-2xs cursor-pointer"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
