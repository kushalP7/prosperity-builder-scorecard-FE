"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import { useLocation } from "react-router-dom"
import { useAppStore } from "@/store"
import { cn } from "@/lib/utils"

export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return <Loader2 className={`animate-spin text-current ${className}`} />
}

export interface RoseLoaderProps {
  message?: string
  fullScreen?: boolean
  className?: string
  size?: "sm" | "md" | "lg"
}

export function RoseLoader({
  message = "Loading...",
  fullScreen = false,
  className,
  size = "md",
}: RoseLoaderProps) {
  const sizeClasses = {
    sm: {
      ring: "w-12 h-12 border-2",
      badge: "w-8 h-8 p-1",
      glow: "-inset-1.5",
      text: "text-xs",
    },
    md: {
      ring: "w-20 h-20 border-[3px]",
      badge: "w-12 h-12 p-2",
      glow: "-inset-2.5",
      text: "text-sm",
    },
    lg: {
      ring: "w-24 h-24 border-[4px]",
      badge: "w-14 h-14 p-2.5",
      glow: "-inset-3",
      text: "text-base",
    },
  }[size]

  const loaderContent = (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className="relative flex items-center justify-center">
        {/* Subtle Ambient Glow */}
        <div
          className={cn(
            "absolute rounded-full bg-[#B5111B]/25 blur-xl animate-pulse pointer-events-none",
            sizeClasses.glow
          )}
        />

        {/* Outer Spinning Brand Ring */}
        <div
          className={cn(
            "rounded-full border-[#B5111B]/20 border-t-[#B5111B] border-r-[#B5111B]/70 animate-spin",
            sizeClasses.ring
          )}
        />

        {/* Central Rose Icon Badge with Gentle Breathing Scale */}
        <div
          className={cn(
            "absolute rounded-full bg-white shadow-lg border border-slate-200/90 flex items-center justify-center overflow-hidden animate-pulse",
            sizeClasses.badge
          )}
        >
          <img
            src="/icon.png"
            alt="Rose Associates"
            className="w-full h-full object-contain select-none pointer-events-none"
          />
        </div>
      </div>
    </div>
  )

  if (fullScreen) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300"
      >
        {loaderContent}
      </div>
    )
  }

  return loaderContent
}

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full p-8">
      <RoseLoader size="md" />
    </div>
  )
}

/**
 * Global loader that monitors route changes and active backend store operations
 */
export function GlobalRoseLoader() {
  const location = useLocation()
  const { isLoading } = useAppStore()
  const [routeLoading, setRouteLoading] = React.useState(false)
  const prevPathRef = React.useRef(location.pathname)

  // Trigger brief, smooth loader animation on route/page transition
  React.useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      prevPathRef.current = location.pathname
      setRouteLoading(true)
      const timer = setTimeout(() => {
        setRouteLoading(false)
      }, 350)
      return () => clearTimeout(timer)
    }
  }, [location.pathname])

  const visible = routeLoading || isLoading

  if (!visible) return null

  return (
    <RoseLoader
      fullScreen
      size="md"
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4 animate-pulse">
      <div className="h-5 bg-muted rounded w-2/3"></div>
      <div className="h-4 bg-muted rounded w-1/3"></div>
      <div className="space-y-2 pt-2">
        <div className="h-3 bg-muted rounded w-full"></div>
        <div className="h-3 bg-muted rounded w-4/5"></div>
      </div>
      <div className="h-9 bg-muted rounded-lg w-full pt-4"></div>
    </div>
  )
}

export function SkeletonTable() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden animate-pulse">
      <div className="h-12 bg-muted/60 border-b border-border"></div>
      <div className="p-4 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/6"></div>
            <div className="h-4 bg-muted rounded w-1/4"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
