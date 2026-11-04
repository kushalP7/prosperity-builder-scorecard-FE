"use client"

import * as React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts"
import { DownloadSimpleIcon, SpinnerGapIcon } from "@phosphor-icons/react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { evaluateWidgetData } from "@/lib/analyticsEngine"
import type { AnalyticsWidget, Project, TemplateSection } from "@/lib/types"
import { cn } from "@/lib/utils"

const COLORS = [
  "#5C090E",
  "#8F0D15",
  "#B5111B",
  "#C44149",
  "#D37076",
  "#334155",
  "#475569",
  "#64748B",
  "#94A3B8",
  "#CBD5E1",
]

type ChartPoint = { name: string; value: number; color: string }

function toDonutData(widget: AnalyticsWidget | null, raw: any[]): ChartPoint[] {
  if (!widget) return []
  return raw.map((d: any, index: number) => {
    let val = d.value
    if (val === undefined || val === null || val === 0) {
      if (widget.title.includes("Score Breakdown") && typeof d["Client Total Score"] === "number") {
        val = d["Client Total Score"]
      } else if (
        (widget.title.includes("Value Overview") || widget.title.includes("Overview")) &&
        typeof d["Value"] === "number"
      ) {
        val = d["Value"]
      }
    }
    return {
      name: String(d.name || "Indicator"),
      value: Number(val) || 0,
      color: COLORS[index % COLORS.length],
    }
  })
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

function drawDonutPanel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  title: string,
  subtitle: string,
  data: ChartPoint[],
) {
  const pad = 24
  const cardH = 520
  // Card
  ctx.fillStyle = "#FFFFFF"
  ctx.strokeStyle = "#E2E8F0"
  ctx.lineWidth = 1
  roundRect(ctx, x, y, width, cardH, 16)
  ctx.fill()
  ctx.stroke()

  // Titles
  ctx.fillStyle = "#0F172A"
  ctx.font = "bold 16px Helvetica, Arial, sans-serif"
  ctx.textAlign = "left"
  ctx.textBaseline = "top"
  ctx.fillText(title, x + pad, y + pad, width - pad * 2)

  ctx.fillStyle = "#64748B"
  ctx.font = "12px Helvetica, Arial, sans-serif"
  ctx.fillText(subtitle, x + pad, y + pad + 24, width - pad * 2)

  const total = data.reduce((s, d) => s + d.value, 0)
  const pieData = data.filter((d) => d.value > 0)
  const cx = x + width / 2
  const cy = y + 170
  const outerR = 78
  const innerR = 48

  if (pieData.length === 0) {
    ctx.beginPath()
    ctx.arc(cx, cy, outerR, 0, Math.PI * 2)
    ctx.fillStyle = "#E2E8F0"
    ctx.fill()
    ctx.beginPath()
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2)
    ctx.fillStyle = "#FFFFFF"
    ctx.fill()
  } else {
    let angle = -Math.PI / 2
    const gap = pieData.length > 1 ? 0.04 : 0
    pieData.forEach((slice) => {
      const sweep = (slice.value / total) * Math.PI * 2 - gap
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, outerR, angle, angle + Math.max(sweep, 0.01))
      ctx.closePath()
      ctx.fillStyle = slice.color
      ctx.fill()
      angle += (slice.value / total) * Math.PI * 2
    })
    ctx.beginPath()
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2)
    ctx.fillStyle = "#FFFFFF"
    ctx.fill()
  }

  ctx.fillStyle = "#94A3B8"
  ctx.font = "600 10px Helvetica, Arial, sans-serif"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText("TOTAL", cx, cy - 10)
  ctx.fillStyle = "#0F172A"
  ctx.font = "800 22px Helvetica, Arial, sans-serif"
  ctx.fillText(total.toLocaleString(undefined, { maximumFractionDigits: 1 }), cx, cy + 12)

  // Legend rows
  let ly = y + 280
  const legendX = x + pad
  const legendW = width - pad * 2
  ctx.textAlign = "left"
  ctx.textBaseline = "middle"

  data.forEach((entry) => {
    const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0
    const rowH = 22
    if (ly + rowH > y + cardH - 16) return

    // pill background
    roundRect(ctx, legendX, ly, legendW, rowH, 6)
    ctx.fillStyle = "#F8FAFC"
    ctx.fill()
    ctx.strokeStyle = "#E2E8F0"
    ctx.stroke()

    // color dot
    ctx.beginPath()
    ctx.arc(legendX + 12, ly + rowH / 2, 4, 0, Math.PI * 2)
    ctx.fillStyle = entry.color
    ctx.fill()

    const label = entry.name.length > 34 ? `${entry.name.slice(0, 33)}…` : entry.name
    ctx.fillStyle = "#475569"
    ctx.font = "500 11px Helvetica, Arial, sans-serif"
    ctx.fillText(label, legendX + 22, ly + rowH / 2)

    const right = `${pct}%  (${entry.value.toLocaleString(undefined, { maximumFractionDigits: 1 })})`
    ctx.fillStyle = "#0F172A"
    ctx.font = "bold 11px Helvetica, Arial, sans-serif"
    ctx.textAlign = "right"
    ctx.fillText(right, legendX + legendW - 10, ly + rowH / 2)
    ctx.textAlign = "left"

    ly += rowH + 6
  })
}

/** Build a clean side-by-side PNG without html2canvas (avoids Tailwind/oklch corruption). */
function renderCategoryChartsPng(
  categoryLabel: string,
  overviewData: ChartPoint[],
  breakdownData: ChartPoint[],
): string {
  const width = 1200
  const height = 580
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas unsupported")

  ctx.fillStyle = "#FFFFFF"
  ctx.fillRect(0, 0, width, height)

  const gap = 24
  const panelW = (width - gap * 3) / 2
  drawDonutPanel(
    ctx,
    gap,
    20,
    panelW,
    `${categoryLabel} Value Overview`,
    "Core metric performance and indicator values",
    overviewData,
  )
  drawDonutPanel(
    ctx,
    gap * 2 + panelW,
    20,
    panelW,
    `${categoryLabel} Score Breakdown`,
    "Sub-indicator score distribution and weighted share",
    breakdownData,
  )

  return canvas.toDataURL("image/png")
}

function DonutPanel({
  title,
  subtitle,
  data,
}: {
  title: string
  subtitle: string
  data: ChartPoint[]
}) {
  const total = data.reduce((sum, d) => sum + Number(d.value || 0), 0)
  const pieData = data.filter((d) => d.value > 0)

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs p-5 sm:p-6 flex flex-col min-h-[420px]">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug">{title}</h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{subtitle}</p>
      </div>

      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-xs text-slate-400 font-medium min-h-[220px]">
          No chart data for this category yet.
        </div>
      ) : (
        <>
          <div className="w-full h-[220px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData.length > 0 ? pieData : [{ name: "None", value: 1, color: "#E2E8F0" }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={92}
                  dataKey="value"
                  paddingAngle={pieData.length > 1 ? 2 : 0}
                  stroke="none"
                  isAnimationActive={false}
                >
                  {(pieData.length > 0 ? pieData : [{ color: "#E2E8F0" }]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      const { cx, cy } = viewBox as any
                      return (
                        <g>
                          <text
                            x={cx}
                            y={cy - 8}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill="#94A3B8"
                            style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.06em" }}
                          >
                            TOTAL
                          </text>
                          <text
                            x={cx}
                            y={cy + 12}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill="#0F172A"
                            style={{ fontSize: 22, fontWeight: 800 }}
                          >
                            {total.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                          </text>
                        </g>
                      )
                    }}
                  />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 content-start">
            {data.map((entry, index) => {
              const pct = total > 0 ? ((entry.value / total) * 100).toFixed(0) : "0"
              return (
                <div
                  key={`leg-${index}-${entry.name}`}
                  className="inline-flex items-center gap-1.5 text-xs bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/80 shadow-2xs max-w-full"
                  title={`${entry.name}: ${pct}% (${entry.value})`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-slate-600 font-medium text-[11px] whitespace-nowrap">
                    {entry.name}
                  </span>
                  <span className="font-bold text-slate-900 text-[11px] shrink-0">{pct}%</span>
                  <span className="text-slate-400 text-[10px] shrink-0 font-mono">
                    ({entry.value.toLocaleString(undefined, { maximumFractionDigits: 1 })})
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export function CategoryChartsModal({
  open,
  onClose,
  categoryLabel,
  project,
  templates,
  widgets,
}: {
  open: boolean
  onClose: () => void
  categoryLabel: string
  project: Project | null | undefined
  templates: TemplateSection[]
  widgets: AnalyticsWidget[]
}) {
  const [downloading, setDownloading] = React.useState(false)

  const section = React.useMemo(() => {
    const label = String(categoryLabel || "").toLowerCase()
    return (project?.assignedSections || []).find((s: any) => {
      const sl = String(s.label || "").toLowerCase()
      return sl === label || label.includes(sl) || sl.includes(label)
    })
  }, [project, categoryLabel])

  const { overviewWidget, breakdownWidget, overviewData, breakdownData } = React.useMemo(() => {
    if (!project || !categoryLabel) {
      return {
        overviewWidget: null as AnalyticsWidget | null,
        breakdownWidget: null as AnalyticsWidget | null,
        overviewData: [] as ChartPoint[],
        breakdownData: [] as ChartPoint[],
      }
    }

    const sectionId = section?.id
    const label = categoryLabel.toLowerCase()
    const forCategory = (widgets || []).filter((w) => {
      if (w.chartType === "stat_card" || (w.title && w.title.endsWith(" Score"))) return false
      if (sectionId && w.sectionId && w.sectionId === sectionId) return true
      return String(w.title || "").toLowerCase().includes(label)
    })

    const overview =
      forCategory.find((w) => /value overview/i.test(w.title || "")) ||
      forCategory.find((w) => /overview/i.test(w.title || "") && !/breakdown/i.test(w.title || "")) ||
      null
    const breakdown =
      forCategory.find((w) => /score breakdown/i.test(w.title || "")) ||
      forCategory.find((w) => /breakdown/i.test(w.title || "")) ||
      null

    return {
      overviewWidget: overview,
      breakdownWidget: breakdown,
      overviewData: overview
        ? toDonutData(overview, evaluateWidgetData(overview, project, templates))
        : [],
      breakdownData: breakdown
        ? toDonutData(breakdown, evaluateWidgetData(breakdown, project, templates))
        : [],
    }
  }, [project, templates, widgets, categoryLabel, section])

  const handleDownloadPng = () => {
    setDownloading(true)
    try {
      const dataUrl = renderCategoryChartsPng(categoryLabel, overviewData, breakdownData)
      const link = document.createElement("a")
      const safe = String(categoryLabel || "category")
        .replace(/[^a-zA-Z0-9._-]+/g, "_")
        .slice(0, 60)
      link.download = `${safe}-charts.png`
      link.href = dataUrl
      link.click()
      toast.success("Chart image downloaded")
    } catch (err) {
      console.error(err)
      toast.error("Could not download chart image")
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={`${categoryLabel} - Charts`}
      className="max-w-6xl w-[min(96vw,72rem)] max-h-[92vh] overflow-y-auto !gap-3"
    >
      <div className="space-y-4 -mt-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
            Value Overview and Score Breakdown for this assigned category (same logic as Analytics).
          </p>
          <Button
            size="sm"
            onClick={handleDownloadPng}
            disabled={downloading}
            className="h-9 px-3 text-xs font-semibold bg-[#B5111B] hover:bg-[#8F0D15] text-white shrink-0"
          >
            {downloading ? (
              <SpinnerGapIcon className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <DownloadSimpleIcon weight="bold" className="w-3.5 h-3.5 mr-1.5" />
            )}
            Download PNG
          </Button>
        </div>

        <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-5 bg-white rounded-xl")}>
          <DonutPanel
            title={`${categoryLabel} Value Overview`}
            subtitle="Core metric performance and indicator values"
            data={overviewData}
          />
          <DonutPanel
            title={`${categoryLabel} Score Breakdown`}
            subtitle="Sub-indicator score distribution and weighted share"
            data={breakdownData}
          />
        </div>

        {!overviewWidget && !breakdownWidget && (
          <p className="text-xs text-amber-700 font-medium">
            No Analytics widgets found for this category. Ensure widgets exist for this section in
            Analytics Maker.
          </p>
        )}
      </div>
    </Modal>
  )
}
