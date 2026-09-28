import * as React from "react"
import { cn } from "@/lib/utils"

interface ScoreGaugeProps {
  score: number // 0 to 100
  size?: "small" | "medium" | "hero"
  label?: string
  className?: string
  bands?: { min: number, max: number, label: string, color: string }[]
}

export function ScoreGauge({
  score,
  size = "medium",
  label,
  className,
  bands = [
    { min: 0, max: 20, label: 'Poor', color: '#B5101A' },
    { min: 21, max: 70, label: 'Average', color: '#E08A15' },
    { min: 71, max: 90, label: 'Good', color: '#4B8B3B' },
    { min: 91, max: 100, label: 'Excellent', color: '#1F6F4A' }
  ]
}: ScoreGaugeProps) {
  const boundedScore = Math.min(Math.max(score, 0), 100)
  const currentBand = bands.find(b => boundedScore >= b.min && boundedScore <= b.max) || bands[0]

  const dimensions = {
    small: { w: 120, h: 70, stroke: 8, cx: 60, cy: 60, r: 50 },
    medium: { w: 240, h: 130, stroke: 16, cx: 120, cy: 120, r: 100 },
    hero: { w: 400, h: 220, stroke: 24, cx: 200, cy: 200, r: 170 },
  }[size]

  const { w, h, stroke, cx, cy, r } = dimensions
  
  // Angle calculations for a 180 degree arc
  const circumference = Math.PI * r
  
  // Path for the background track
  const trackPath = `M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`

  // Calculate needle rotation (0 to 180 degrees)
  const rotation = (boundedScore / 100) * 180 - 90

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className="relative" style={{ width: w, height: h }}>
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="overflow-visible"
          role="meter"
          aria-valuenow={boundedScore}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <defs>
            <linearGradient id={`gradient-${size}`} x1="0%" y1="0%" x2="100%" y2="0%">
              {bands.map((band, i) => (
                <stop key={i} offset={`${(band.max / 100) * 100}%`} stopColor={band.color} />
              ))}
            </linearGradient>
          </defs>

          {/* Background track */}
          <path
            d={trackPath}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={stroke}
            strokeLinecap="round"
          />

          {/* Value arc */}
          <path
            d={trackPath}
            fill="none"
            stroke={`url(#gradient-${size})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={circumference - (boundedScore / 100) * circumference}
            className="transition-all duration-1000 ease-out"
          />

          {/* Needle */}
          <g style={{ transform: `rotate(${rotation}deg)`, transformOrigin: `${cx}px ${cy}px`, transition: 'transform 1s cubic-bezier(0.22, 1, 0.36, 1)' }}>
            <circle cx={cx} cy={cy} r={stroke * 0.8} fill="var(--color-ink)" />
            <polygon points={`${cx - stroke*0.4},${cy} ${cx + stroke*0.4},${cy} ${cx},${cy - r + stroke}`} fill="var(--color-ink)" />
          </g>
        </svg>
        
        {/* Score Text */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center translate-y-1/3">
          <span className={cn(
            "font-bold tabular-nums tracking-tighter",
            size === 'hero' ? 'text-6xl' : size === 'medium' ? 'text-4xl' : 'text-xl'
          )} style={{ color: currentBand?.color }}>
            {score.toFixed(0)}
          </span>
          {label && (
            <span className={cn(
              "font-medium uppercase text-muted-foreground mt-1",
              size === 'hero' ? 'text-lg' : size === 'medium' ? 'text-sm' : 'text-[10px]'
            )}>
              {label}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
