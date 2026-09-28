"use client"

import * as React from "react"
import { AlertTriangle, Trash2, Loader2, X } from "lucide-react"

export interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  description?: string
  itemName?: string
  confirmText?: string
  cancelText?: string
  variant?: "danger" | "warning"
  isLoading?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description = "Are you sure you want to proceed? This action can be undone by an administrator.",
  itemName,
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmDialogProps) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, isLoading, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
        onClick={() => {
          if (!isLoading) onClose()
        }}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-50 w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Close "X" Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer disabled:opacity-50"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          {/* Icon Badge */}
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
              variant === "danger"
                ? "bg-rose-50 text-[#B5111B] ring-8 ring-rose-50/60"
                : "bg-amber-50 text-amber-600 ring-8 ring-amber-50/60"
            }`}
          >
            {variant === "danger" ? (
              <Trash2 className="w-7 h-7" />
            ) : (
              <AlertTriangle className="w-7 h-7" />
            )}
          </div>

          {/* Title */}
          <h3 className="text-base font-black text-slate-900 tracking-tight mb-2">
            {title}
          </h3>

          {/* Description */}
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mb-2">
            {description}
          </p>

          {/* Item Name highlight if present */}
          {itemName && (
            <div className="w-full my-2 px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 truncate">
              &ldquo;{itemName}&rdquo;
            </div>
          )}

          {/* Action Buttons */}
          <div className="w-full grid grid-cols-2 gap-3 mt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer disabled:opacity-50"
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`w-full px-4 py-2.5 rounded-xl text-white text-xs font-black transition flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-60 ${
                variant === "danger"
                  ? "bg-[#B5111B] hover:bg-[#8F0D15] shadow-rose-900/10"
                  : "bg-amber-600 hover:bg-amber-700 shadow-amber-900/10"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>{confirmText}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
