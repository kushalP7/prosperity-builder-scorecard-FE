"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
} from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  FileQuestion,
} from "lucide-react"
import { Dropdown } from "@/components/ui/dropdown"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  totalItems?: number
  page?: number
  pageSize?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
  isLoading?: boolean
  emptyMessage?: string
  emptySubtext?: string
  emptyAction?: React.ReactNode
  sorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void
  className?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  totalItems,
  page = 1,
  pageSize = 10,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  isLoading = false,
  emptyMessage = "No records found",
  emptySubtext = "No records match your active search terms and filter criteria.",
  emptyAction,
  sorting,
  onSortingChange,
  className = "",
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    enableSortingRemoval: false,
    state: {
      sorting: sorting || [],
    },
    onSortingChange: (updater) => {
      if (onSortingChange) {
        const next = typeof updater === "function" ? updater(sorting || []) : updater
        onSortingChange(next)
      }
    },
  })

  const total = totalItems !== undefined ? totalItems : data.length
  const computedTotalPages = totalPages !== undefined ? totalPages : Math.max(1, Math.ceil(total / pageSize))
  const startItem = total > 0 ? (page - 1) * pageSize + 1 : 0
  const endItem = Math.min(total, page * pageSize)

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Table Container Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs relative">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/75 backdrop-blur-[1px] z-20 flex flex-col items-center justify-center gap-2 animate-in fade-in duration-150">
            <Loader2 className="w-7 h-7 text-[#B5111B] animate-spin" />
            <span className="text-xs font-bold text-slate-700">Updating records...</span>
          </div>
        )}

        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          <table className="w-full text-left border-collapse min-w-[720px]">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider"
                >
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort()
                    const sortDirection = header.column.getIsSorted()

                    return (
                      <th
                        key={header.id}
                        className={`py-3 px-4 select-none ${canSort ? "cursor-pointer hover:bg-slate-100/70 transition-colors" : ""
                          }`}
                        onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      >
                        <div className="flex items-center gap-1.5">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {canSort && (
                            <span className="text-slate-400">
                              {sortDirection === "asc" ? (
                                <ArrowUp className="w-3.5 h-3.5 text-[#B5111B]" />
                              ) : sortDirection === "desc" ? (
                                <ArrowDown className="w-3.5 h-3.5 text-[#B5111B]" />
                              ) : (
                                <ArrowUpDown className="w-3 h-3 text-slate-300" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    )
                  })}
                </tr>
              ))}
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {data.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2.5 max-w-sm mx-auto">
                      <FileQuestion className="w-10 h-10 text-slate-300" />
                      <p className="text-sm font-bold text-slate-800">{emptyMessage}</p>
                      {emptySubtext && <p className="text-xs text-slate-500">{emptySubtext}</p>}
                      {emptyAction && <div className="pt-2">{emptyAction}</div>}
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-3 px-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 px-1 pt-1">
        {/* Showing Items and Per-page */}
        <div className="flex items-center gap-3 flex-wrap">
          <span>
            Showing <strong className="text-slate-700">{startItem}</strong> to{" "}
            <strong className="text-slate-700">{endItem}</strong> of{" "}
            <strong className="text-slate-700">{total}</strong> records
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

        {/* Page Nav Buttons */}
        {computedTotalPages > 1 && onPageChange && (
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

            {Array.from({ length: computedTotalPages }, (_, i) => i + 1).map((pg) => {
              if (
                computedTotalPages <= 7 ||
                pg === 1 ||
                pg === computedTotalPages ||
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
              if (pg === 2 || pg === computedTotalPages - 1) {
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
              disabled={page >= computedTotalPages || isLoading}
              onClick={() => onPageChange(page + 1)}
              className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition shadow-2xs cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
