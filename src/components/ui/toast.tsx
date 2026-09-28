"use client"

import * as React from "react"
import { CheckCircle2, AlertCircle, Info, Loader2, X } from "lucide-react"

export type ToastType = "success" | "error" | "info" | "loading"

export interface ToastItem {
  id: string
  type: ToastType
  message: string
  duration?: number
}

type ToastListener = (toasts: ToastItem[]) => void

class ToastManager {
  private toasts: ToastItem[] = []
  private listeners: Set<ToastListener> = new Set()

  subscribe(listener: ToastListener) {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify() {
    this.listeners.forEach((listener) => listener([...this.toasts]))
  }

  show(type: ToastType, message: string, duration = 4000): string {
    const id = `t_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const newToast: ToastItem = { id, type, message, duration }
    
    // Replace any existing loading toast if adding success/error
    if (type === "success" || type === "error") {
      this.toasts = this.toasts.filter((t) => t.type !== "loading")
    }

    this.toasts.push(newToast)
    this.notify()

    if (duration > 0 && type !== "loading") {
      setTimeout(() => {
        this.dismiss(id)
      }, duration)
    }

    return id
  }

  dismiss(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id)
    this.notify()
  }

  success(message: string, duration = 4000) {
    return this.show("success", message, duration)
  }

  error(message: string, duration = 5000) {
    return this.show("error", message, duration)
  }

  info(message: string, duration = 4000) {
    return this.show("info", message, duration)
  }

  loading(message: string): string {
    return this.show("loading", message, 0)
  }
}

export const toast = new ToastManager()

export function ToastContainer() {
  const [toasts, setToasts] = React.useState<ToastItem[]>([])

  React.useEffect(() => {
    return toast.subscribe(setToasts)
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 md:px-0">
      {toasts.map((item) => (
        <div
          key={item.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all transform translate-y-0 animate-in fade-in slide-in-from-bottom-5 ${
            item.type === "success"
              ? "bg-emerald-950/90 text-emerald-100 border-emerald-800/60 backdrop-blur-md"
              : item.type === "error"
              ? "bg-red-950/90 text-red-100 border-red-800/60 backdrop-blur-md"
              : item.type === "loading"
              ? "bg-slate-900/90 text-slate-100 border-slate-700/60 backdrop-blur-md"
              : "bg-blue-950/90 text-blue-100 border-blue-800/60 backdrop-blur-md"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {item.type === "success" && (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            )}
            {item.type === "error" && (
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
            )}
            {item.type === "info" && (
              <Info className="h-5 w-5 text-blue-400 shrink-0" />
            )}
            {item.type === "loading" && (
              <Loader2 className="h-5 w-5 text-primary animate-spin shrink-0" />
            )}
            <span className="truncate">{item.message}</span>
          </div>

          <button
            onClick={() => toast.dismiss(item.id)}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
