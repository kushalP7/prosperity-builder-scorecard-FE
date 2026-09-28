"use client"

import * as React from "react"
import { use } from "react"
import { useAppStore } from "@/store"
import { PieChart as PieChartIcon, Settings2, Hash, AlertCircle, Wallet, ShoppingCart, Users, DollarSign, Target, ArrowUpRight, ArrowDownRight, ChevronDown, MoreVertical, ShieldAlert, ShieldCheck, Siren, Map, Building2, Wrench, Activity, AlertTriangle, FileText, CheckCircle2, Shield, Flame, Crosshair, Bus, Palette, GraduationCap, Briefcase, ShoppingBag, Heart, Landmark, Home, Trees, Compass, Leaf, TrendingUp, Cpu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { evaluateWidgetData, calculateGaugeValue } from "@/lib/analyticsEngine"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, ComposedChart, Label } from 'recharts'

const COLORS = ['#5C090E', '#8F0D15', '#B5111B', '#C44149', '#D37076', '#334155', '#475569', '#64748B', '#94A3B8', '#CBD5E1'];

const getWidgetDescription = (widget: any) => {
  if (widget?.description) return widget.description;
  const title = widget?.title || "";
  const lower = title.toLowerCase();

  if (lower.includes("accessibility") || lower.includes("transportation")) {
    return "Evaluation of public transit access, pedestrian routes, average commute times, and regional mobility options.";
  }
  if (lower.includes("arts") || lower.includes("culture")) {
    return "Analysis of public art installations, cultural venues, event programming, and creative sector employment.";
  }
  if (lower.includes("crime") || lower.includes("safety")) {
    return "Assessment of violent & property crime rates, officer-to-resident ratio, and community safety indicators.";
  }
  if (lower.includes("education")) {
    return "Overview of K-12 school performance, graduation rates, college attainment, and educational resources.";
  }
  if (lower.includes("employment") || lower.includes("labor")) {
    return "Metrics on unemployment rate, wage growth, workforce training programs, and job creation density.";
  }
  if (lower.includes("goods") || lower.includes("services")) {
    return "Distribution of essential retail access, grocery stores, personal services, and commercial vitality.";
  }
  if (lower.includes("healthcare") || lower.includes("wellness")) {
    return "Breakdown of hospital facilities, health factor indices, mental healthcare access, and medical services.";
  }
  if (lower.includes("historic") || lower.includes("preservation")) {
    return "Distribution of landmark designations, historic districts, registered buildings, and tour map assets.";
  }
  if (lower.includes("housing")) {
    return "Indicators covering housing supply, affordability, home values, rental rate stability, and residential zoning.";
  }
  if (lower.includes("infrastructure")) {
    return "Evaluation of water/sanitation grid, power reliability, broadband connectivity, and public works.";
  }
  if (lower.includes("open space") || lower.includes("recreation")) {
    return "Acreage breakdown for parks, active trails, sports facilities, playgrounds, and community green space.";
  }
  if (lower.includes("planning") || lower.includes("land use")) {
    return "Comprehensive land use zoning, commercial property tax values, vacant land availability, and agricultural districts.";
  }

  if (title.includes("Overview")) {
    return `${title.replace(" Value Overview", "").replace(" Overview", "")} core metric performance and indicator values.`;
  }
  if (title.includes("Breakdown")) {
    return `${title.replace(" Score Breakdown", "").replace(" Breakdown", "")} detailed sub-indicator score distribution and weighted share.`;
  }
  return "Comprehensive evaluation across key community performance indicators.";
};

const SCORE_GRADIENT_STOPS: Array<{ pct: number; color: string }> = [
  { pct: 0, color: '#ef4444' },
  { pct: 0.35, color: '#f97316' },
  { pct: 0.7, color: '#f59e0b' },
  { pct: 1, color: '#22c55e' },
];

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace('#', '');
  return [
    parseInt(normalized.substring(0, 2), 16),
    parseInt(normalized.substring(2, 4), 16),
    parseInt(normalized.substring(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function interpolateHexColor(from: string, to: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(from);
  const [r2, g2, b2] = hexToRgb(to);
  return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}

function getScoreColor(score: number, max: number = 10): string {
  const t = Math.min(Math.max(score / max, 0), 1);
  for (let i = 0; i < SCORE_GRADIENT_STOPS.length - 1; i++) {
    const current = SCORE_GRADIENT_STOPS[i];
    const next = SCORE_GRADIENT_STOPS[i + 1];
    if (t >= current.pct && t <= next.pct) {
      const localT = (t - current.pct) / (next.pct - current.pct);
      return interpolateHexColor(current.color, next.color, localT);
    }
  }
  return SCORE_GRADIENT_STOPS[SCORE_GRADIENT_STOPS.length - 1].color;
}

function hexToRgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface/90 backdrop-blur-md border border-border/50 p-3 rounded-xl shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
        <p className="font-semibold text-foreground mb-2 text-sm">{label || 'Value'}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-3 text-sm">
            <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: entry.color || entry.fill }} />
            <span className="text-muted-foreground capitalize font-medium">{entry.name}:</span>
            <span className="font-bold text-foreground ml-auto">{Number(entry.value).toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const getScoreCardTheme = (score: number) => {
  if (score >= 8.5) {
    return {
      cardBg: '#f0fdf4',
      cardBorder: '#bbf7d0',
      iconBg: '#15803d',
      iconBorder: '#166534',
      iconColor: '#ffffff',
      titleColor: '#14532d',
      scoreColor: '#15803d',
      scaleColor: '#166534',
    }
  }
  if (score >= 7.0) {
    return {
      cardBg: '#f7fee7',
      cardBorder: '#d9f99d',
      iconBg: '#4d7c0f',
      iconBorder: '#3f6212',
      iconColor: '#ffffff',
      titleColor: '#365314',
      scoreColor: '#4d7c0f',
      scaleColor: '#3f6212',
    }
  }
  if (score >= 5.5) {
    return {
      cardBg: '#fffbeb',
      cardBorder: '#fef08a',
      iconBg: '#d97706',
      iconBorder: '#b45309',
      iconColor: '#ffffff',
      titleColor: '#713f12',
      scoreColor: '#a16207',
      scaleColor: '#854d0e',
    }
  }
  if (score >= 4.0) {
    return {
      cardBg: '#fff7ed',
      cardBorder: '#fed7aa',
      iconBg: '#ea580c',
      iconBorder: '#c2410c',
      iconColor: '#ffffff',
      titleColor: '#7c2d12',
      scoreColor: '#c2410c',
      scaleColor: '#9a3412',
    }
  }
  return {
    cardBg: '#fef2f2',
    cardBorder: '#fecaca',
    iconBg: '#dc2626',
    iconBorder: '#b91c1c',
    iconColor: '#ffffff',
    titleColor: '#7f1d1d',
    scoreColor: '#b91c1c',
    scaleColor: '#991b1b',
  }
}

export function AnalyticsDashboard({ projectId }: { projectId: string }) {
  const { projects, widgets, templates, toggleProjectWidget, updateDashboardLayout } = useAppStore()
  const [isConfigOpen, setIsConfigOpen] = React.useState(false)
  const [hoveredRoseSlice, setHoveredRoseSlice] = React.useState<{ widgetId: string; name: string; value: number; percent: string; color: string; x: number; y: number } | null>(null)

  const project = projects.find(p => p.id === projectId)


  if (!project) return <div className="p-8">Project not found</div>

  const enabledWidgets = widgets.filter(w => project.enabledWidgets?.includes(w.id))
  const statCards = enabledWidgets.filter(w => w.chartType === 'stat_card');
  const otherChartsRaw = enabledWidgets.filter(w => w.chartType !== 'stat_card');

  const sectionScores = statCards.map(widget => {
    const data = evaluateWidgetData(widget, project, templates);
    let totalClient = 0;
    let totalHighest = 0;
    let hasBoth = false;
    data.forEach((dp: any) => {
      if (typeof dp['Client Total Score'] === 'number' && typeof dp['Highest Score'] === 'number') {
        totalClient += dp['Client Total Score'];
        totalHighest += dp['Highest Score'];
        hasBoth = true;
      }
    });
    const finalScore = hasBoth && totalHighest > 0 ? (totalClient / totalHighest) * 10 : (data[0]?.value || 0);
    return {
      name: widget.title.replace(' Score', '').trim(),
      score: Number(finalScore.toFixed(1))
    };
  });

  const overallScore = sectionScores.length > 0
    ? sectionScores.reduce((a, b) => a + b.score, 0) / sectionScores.length
    : 0;

  const statCardsSortedByScore = statCards
    .map((widget, index) => ({ widget, score: sectionScores[index]?.score ?? 0 }))
    .sort((a, b) => b.score - a.score);

  const overallGaugeWidget = {
    id: 'overall-gauge',
    title: 'Overall Score',
    chartType: 'speed_gauge',
    categoryId: 'none',
    aggregation: 'none'
  } as any;
  const otherChartsWithData = otherChartsRaw.map(widget => ({
    widget,
    data: evaluateWidgetData(widget, project, templates)
  }));

  // Standard category section ordering
  const CATEGORY_ORDER = [
    'Accessibility & Transportation',
    'Arts & Culture',
    'Crime & Public Safety',
    'Education',
    'Employment & Labor',
    'Goods & Services',
    'Healthcare & Wellness',
    'Historic Preservation',
    'Housing',
    'Infrastructure',
    'Open Space & Recreation',
    'Planning & Land Use',
  ];

  const getCategoryFromTitle = (title: string) => {
    for (const cat of CATEGORY_ORDER) {
      if (title.toLowerCase().includes(cat.toLowerCase())) {
        return cat;
      }
    }
    return 'Other';
  };

  const groupedCategoryCharts = React.useMemo(() => {
    const charts = [...otherChartsWithData];
    return charts.sort((a, b) => {
      const catA = getCategoryFromTitle(a.widget.title);
      const catB = getCategoryFromTitle(b.widget.title);

      const indexA = CATEGORY_ORDER.indexOf(catA);
      const indexB = CATEGORY_ORDER.indexOf(catB);

      const posA = indexA !== -1 ? indexA : 999;
      const posB = indexB !== -1 ? indexB : 999;

      if (posA !== posB) {
        return posA - posB;
      }

      // Within same category, put 'Value Overview' first, then 'Score Breakdown'
      const isOverviewA = a.widget.title.includes('Overview');
      const isOverviewB = b.widget.title.includes('Overview');

      if (isOverviewA && !isOverviewB) return -1;
      if (!isOverviewA && isOverviewB) return 1;

      return a.widget.title.localeCompare(b.widget.title);
    });
  }, [otherChartsWithData]);

  const renderWidget = (widget: any) => {
    const data = evaluateWidgetData(widget, project, templates)

    if (data.length === 0) {
      return (
        <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-md border border-dashed">
          <AlertCircle className="h-6 w-6 mb-2 opacity-50" />
          <span className="text-sm">No data available</span>
        </div>
      )
    }

    const getWidgetTheme = (title: string) => {
      const lower = title.toLowerCase();

      if (lower.includes('accessibility') || lower.includes('transportation')) {
        return { icon: Bus, color: '#3b82f6', bg: 'bg-blue-500/10 text-blue-600 border-blue-500/20' };
      }
      if (lower.includes('arts') || lower.includes('culture')) {
        return { icon: Palette, color: '#8b5cf6', bg: 'bg-purple-500/10 text-purple-600 border-purple-500/20' };
      }
      if (lower.includes('crime') || lower.includes('safety')) {
        return { icon: Siren, color: '#ef4444', bg: 'bg-red-500/10 text-red-600 border-red-500/20' };
      }
      if (lower.includes('education')) {
        return { icon: GraduationCap, color: '#6366f1', bg: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' };
      }
      if (lower.includes('employment') || lower.includes('labor')) {
        return { icon: Briefcase, color: '#f59e0b', bg: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
      }
      if (lower.includes('goods') || lower.includes('services')) {
        return { icon: ShoppingBag, color: '#10b981', bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' };
      }
      if (lower.includes('healthcare') || lower.includes('wellness')) {
        return { icon: Heart, color: '#ec4899', bg: 'bg-rose-500/10 text-rose-600 border-rose-500/20' };
      }
      if (lower.includes('historic') || lower.includes('preservation')) {
        return { icon: Landmark, color: '#06b6d4', bg: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20' };
      }
      if (lower.includes('housing')) {
        return { icon: Home, color: '#2563eb', bg: 'bg-sky-500/10 text-sky-600 border-sky-500/20' };
      }
      if (lower.includes('infrastructure')) {
        return { icon: Building2, color: '#f97316', bg: 'bg-orange-500/10 text-orange-600 border-orange-500/20' };
      }
      if (lower.includes('open space') || lower.includes('recreation')) {
        return { icon: Trees, color: '#16a34a', bg: 'bg-green-500/10 text-green-600 border-green-500/20' };
      }
      if (lower.includes('planning') || lower.includes('land use')) {
        return { icon: Map, color: '#7c3aed', bg: 'bg-violet-500/10 text-violet-600 border-violet-500/20' };
      }
      if (lower.includes('sustainability') || lower.includes('environment')) {
        return { icon: Leaf, color: '#10b981', bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' };
      }
      if (lower.includes('economic') || lower.includes('vitality') || lower.includes('growth')) {
        return { icon: TrendingUp, color: '#f59e0b', bg: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
      }
      if (lower.includes('digital') || lower.includes('smart city')) {
        return { icon: Cpu, color: '#06b6d4', bg: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20' };
      }
      if (lower.includes('community') || lower.includes('equity')) {
        return { icon: Users, color: '#ec4899', bg: 'bg-rose-500/10 text-rose-600 border-rose-500/20' };
      }

      const themes = [
        { icon: Target, color: '#b5111a', bg: 'bg-red-500/10 text-red-600 border-red-500/20' },
        { icon: Wallet, color: '#6366f1', bg: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' },
        { icon: ShoppingCart, color: '#3b82f6', bg: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
        { icon: Users, color: '#10b981', bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
        { icon: DollarSign, color: '#f59e0b', bg: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
        { icon: PieChartIcon, color: '#8b5cf6', bg: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
        { icon: Activity, color: '#ec4899', bg: 'bg-rose-500/10 text-rose-600 border-rose-500/20' }
      ];
      let hash = 0;
      for (let i = 0; i < title.length; i++) {
        hash = title.charCodeAt(i) + ((hash << 5) - hash);
      }
      return themes[Math.abs(hash) % themes.length];
    }

    const theme = getWidgetTheme(widget.title || "");
    const ThemeIcon = theme.icon;

    const getPreciseSectionScoreOutOf10 = (originalVal: number) => {
      if (!widget.categoryId && data.length > 0) {
        let totalClient = 0;
        let totalHighest = 0;
        let hasBoth = false;
        data.forEach((dp: any) => {
          if (typeof dp['Client Total Score'] === 'number' && typeof dp['Highest Score'] === 'number') {
            totalClient += dp['Client Total Score'];
            totalHighest += dp['Highest Score'];
            hasBoth = true;
          }
        });
        if (hasBoth && totalHighest > 0) {
          return Math.min(10, (totalClient / totalHighest) * 10);
        }
      }
      return Math.min(10, originalVal);
    };

    if (widget.chartType === 'stat_card') {
      let val = calculateGaugeValue(data, widget.aggregation);
      val = getPreciseSectionScoreOutOf10(val);

      const cleanTitle = widget.title.endsWith(' Score') ? widget.title.slice(0, -6) : widget.title;
      const cardTheme = getScoreCardTheme(val);

      return (
        <div className="flex flex-col w-full h-full min-w-0 overflow-hidden justify-between gap-3">
          {/* Top Row: Icon Box with Fill & Score */}
          <div className="flex items-center justify-between w-full min-w-0">
            <div
              className="p-2.5 rounded-xl border shrink-0 flex items-center justify-center shadow-2xs"
              style={{
                backgroundColor: cardTheme.iconBg,
                color: cardTheme.iconColor,
                borderColor: cardTheme.iconBorder,
              }}
            >
              <ThemeIcon className="h-5 w-5" />
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-xl sm:text-2xl font-black tracking-tight leading-none" style={{ color: cardTheme.scoreColor }}>
                {val.toLocaleString(undefined, { maximumFractionDigits: 1 })}
              </span>
              <span className="text-xs font-extrabold ml-0.5" style={{ color: cardTheme.scaleColor }}>/ 10</span>
            </div>
          </div>

          {/* Bottom Row: Uppercase Title */}
          <span className="mt-2 text-xs font-black uppercase tracking-wider leading-tight line-clamp-2 break-words" style={{ color: cardTheme.titleColor }}>
            {cleanTitle}
          </span>
        </div>
      )
    }

    if (widget.chartType === 'speed_gauge') {
      let val = calculateGaugeValue(data, widget.aggregation);
      val = getPreciseSectionScoreOutOf10(val);

      const maxVal = 10;
      const normalizedVal = Math.min(Math.max(val, 0), maxVal);
      const rotation = -90 + (normalizedVal / maxVal) * 180;
      const gradId = `gaugeGrad_${widget.id}`;

      return (
        <div className="h-[280px] w-full flex flex-col items-center justify-center relative p-2">
          <svg viewBox="0 0 200 155" className="w-full h-full max-h-[250px]">
            <defs>
              <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="40%" stopColor="#f97316" />
                <stop offset="70%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>

            {/* Background Arc */}
            <path
              d="M 25 90 A 75 75 0 0 1 175 90"
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="18"
              strokeLinecap="round"
            />

            {/* Gradient Gauge Arc */}
            <path
              d="M 25 90 A 75 75 0 0 1 175 90"
              fill="none"
              stroke={`url(#${gradId})`}
              strokeWidth="18"
              strokeLinecap="round"
            />

            {/* Needle */}
            <g transform={`rotate(${rotation}, 100, 90)`} className="transition-transform duration-1000 ease-out">
              <path d="M 97.5 90 L 100 24 L 102.5 90 Z" fill="#1f2937" />
              <circle cx="100" cy="90" r="7" fill="#1f2937" />
              <circle cx="100" cy="90" r="3" fill="#ffffff" />
            </g>

            {/* Score Text Positioned Cleanly Below Pivot */}
            <text x="100" y="132" textAnchor="middle" className="text-4xl font-black fill-foreground font-sans drop-shadow-sm">
              {val.toLocaleString(undefined, { maximumFractionDigits: 1 })}
              <tspan fontSize="16" fill="#64748b" fontWeight="600" dx="4">/ 10</tspan>
            </text>
          </svg>
        </div>
      )
    }

    const donutData = data.map((d: any) => {
      const val = d.value !== undefined ? d.value : (d['Client Total Score'] !== undefined ? d['Client Total Score'] : 0);
      return {
        name: d.name || 'Indicator',
        value: Number(val) || 0
      };
    });

    const total = donutData.reduce((sum, d) => sum + Number(d.value || 0), 0);

    const renderLegend = (props: any) => {
      const { payload } = props;
      return (
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 pt-2 px-1 w-full">
          {payload.map((entry: any, index: number) => {
            const val = entry.payload.value;
            const pct = total > 0 ? ((val / total) * 100).toFixed(0) : '0';
            return (
              <div key={`item-${index}`} className="flex items-center gap-1.5 text-xs bg-muted/20 px-2.5 py-1 rounded-md border border-border/30 max-w-full shadow-2xs">
                <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: entry.color }}></span>
                <span className="text-muted-foreground font-medium text-[11px] truncate max-w-[130px]" title={entry.value}>{entry.value}</span>
                <span className="font-bold text-foreground text-[11px] shrink-0">{pct}%</span>
                <span className="text-muted-foreground text-[10px] shrink-0 font-mono">({val.toLocaleString(undefined, { maximumFractionDigits: 1 })})</span>
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div className="flex-1 w-full min-h-[320px] flex flex-col items-center justify-center relative mt-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <Pie
              data={donutData}
              cx="50%"
              cy="44%"
              innerRadius={65}
              outerRadius={95}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={2}
              stroke="none"
              strokeWidth={0}
              animationDuration={1000}
            >
              {donutData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
              <Label
                content={({ viewBox }) => {
                  const { cx, cy } = viewBox as any;
                  return (
                    <g>
                      <text x={cx} y={cy - 6} textAnchor="middle" dominantBaseline="central" className="text-[10px] fill-muted-foreground font-semibold uppercase tracking-wider font-sans">
                        TOTAL
                      </text>
                      <text x={cx} y={cy + 8} textAnchor="middle" dominantBaseline="central" className="text-xl font-black fill-foreground font-sans">
                        {total.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                      </text>
                    </g>
                  );
                }}
              />
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={renderLegend} verticalAlign="bottom" align="center" wrapperStyle={{ width: '100%', paddingBottom: '0px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">


      {enabledWidgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center border border-dashed border-border/60 rounded-3xl bg-surface/30 backdrop-blur-sm">
          <div className="p-4 bg-muted/30 rounded-full mb-4">
            <PieChartIcon className="h-10 w-10 text-muted-foreground opacity-50" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Dashboard is Empty</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-2 mb-8 leading-relaxed">
            You haven't enabled any widgets for this project yet. Click below to select widgets created in the Analytics Maker.
          </p>
          <Button onClick={() => setIsConfigOpen(true)} variant="outline" className="rounded-full px-8 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
            <Settings2 className="h-4 w-4 mr-2" />
            Select Widgets
          </Button>
        </div>
      ) : (
        <div className="w-full flex flex-col gap-6">
          {/* ROW 1: Overall Project Score Gauge (Left) + Rating Cards Grid (Right) */}
          <div className="grid grid-cols-12 gap-6 items-stretch">
            {/* Overall Project Score Card */}
            <div className="col-span-12 xl:col-span-3 bg-background rounded-2xl shadow-sm flex flex-col justify-center items-center p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none z-10" />
              <div className="relative z-20 w-full max-w-sm mx-auto flex flex-col justify-center items-center gap-4">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-center mb-1">Overall Project Score</h2>
                  <p className="text-xs text-center text-muted-foreground">Aggregated performance across all core metrics</p>
                </div>
                {(() => {
                  const val = overallScore;
                  const maxVal = 10;
                  const normalizedVal = Math.min(Math.max(val, 0), maxVal);
                  const rotation = -90 + (normalizedVal / maxVal) * 180;

                  return (
                    <div className="h-[200px] w-full flex flex-col items-center justify-center relative p-2">
                      <svg viewBox="0 0 200 155" className="w-full h-full max-h-[190px]">
                        <defs>
                          <linearGradient id="overallGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ef4444" />
                            <stop offset="35%" stopColor="#f97316" />
                            <stop offset="70%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#22c55e" />
                          </linearGradient>
                        </defs>
                        <path d="M 25 90 A 75 75 0 0 1 175 90" fill="none" stroke="#f1f5f9" strokeWidth="18" strokeLinecap="round" />
                        <path d="M 25 90 A 75 75 0 0 1 175 90" fill="none" stroke="url(#overallGaugeGrad)" strokeWidth="18" strokeLinecap="round" />
                        <g transform={`rotate(${rotation}, 100, 90)`} className="transition-transform duration-1000 ease-out">
                          <path d="M 97.5 90 L 100 24 L 102.5 90 Z" fill="#1f2937" />
                          <circle cx="100" cy="90" r="7" fill="#1f2937" />
                          <circle cx="100" cy="90" r="3" fill="#ffffff" />
                        </g>
                        <text x="100" y="132" textAnchor="middle" className="text-4xl font-black fill-foreground font-sans drop-shadow-sm">
                          {val.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                          <tspan fontSize="16" fill="#64748b" fontWeight="600" dx="4">/ 10</tspan>
                        </text>
                      </svg>
                    </div>
                  )
                })()}
              </div>
            </div>

            {/* Rating Cards Grid (Expanded to fill row 1) */}
            <div className="col-span-12 xl:col-span-9 bg-background rounded-2xl shadow-sm p-5 flex flex-col justify-center">
              {statCards.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4 gap-3.5">
                  {statCardsSortedByScore.map(({ widget, score }) => {
                    const cardTheme = getScoreCardTheme(score);
                    return (
                      <div
                        key={widget.id}
                        className="group rounded-2xl transition-all duration-300 hover:-translate-y-0.5 flex flex-col overflow-hidden relative cursor-default border p-3.5 shadow-2xs"
                        style={{
                          backgroundColor: cardTheme.cardBg,
                          borderColor: cardTheme.cardBorder,
                        }}
                      >
                        <div className="relative z-20 flex flex-col h-full justify-between">
                          {renderWidget(widget)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ROW 2: Top Performing Modules (Green) + Lowest Performing Modules (Red) */}
          <div className="grid grid-cols-12 gap-6 items-stretch">
            {/* Top Performing Modules Rose Chart Card */}
            <div className="col-span-12 lg:col-span-6 bg-background rounded-2xl shadow-sm flex flex-col p-6 relative overflow-hidden min-h-[340px]">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none z-10" />
              <div className="relative z-20 w-full h-full flex flex-col gap-2">
                <div>
                  <h2 className="text-[15px] font-bold tracking-tight">Top Performing Modules</h2>
                  <p className="text-xs text-muted-foreground leading-tight mt-0.5">Highest scoring sections</p>
                </div>
                <div className="flex-1 w-full min-h-[260px] flex items-center justify-center select-none pt-2">
                  {(() => {
                    const sliceData = [...sectionScores].sort((a, b) => b.score - a.score).slice(0, 5);
                    const totalCount = sliceData.length;
                    if (totalCount === 0) return null;

                    const maxVal = Math.max(...sliceData.map(d => Number(d.score) || 1));
                    const minRadius = 40;
                    const maxRadius = 105;
                    const innerRadius = 20;
                    const cx = 120;
                    const cy = 110;
                    const gapDeg = 8;

                    const colors = [
                      ['#14532d', '#15803d'],
                      ['#15803d', '#16a34a'],
                      ['#16a34a', '#22c55e'],
                      ['#22c55e', '#4ade80'],
                      ['#34d399', '#a7f3d0'],
                    ];

                    const totalSum = sliceData.reduce((sum, item) => sum + (Number(item.score) || 0), 0);

                    return (
                      <div className="w-full h-full relative flex flex-col items-center justify-center">
                        <svg viewBox="0 0 240 220" className="w-full h-full max-h-[240px] relative z-10">
                          <defs>
                            {colors.map((c, i) => (
                              <linearGradient key={`topGreenGrad_${i}`} id={`topGreenGrad_${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={c[0]} />
                                <stop offset="100%" stopColor={c[1]} />
                              </linearGradient>
                            ))}
                            <filter id="topGreenShadow" x="-20%" y="-20%" width="140%" height="140%">
                              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0f172a" floodOpacity="0.2" />
                            </filter>
                          </defs>

                          <circle cx={cx} cy={cy} r={maxRadius} fill="none" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                          <circle cx={cx} cy={cy} r={minRadius + (maxRadius - minRadius) * 0.5} fill="none" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />

                          {sliceData.map((d, i) => {
                            const val = Number(d.score) || 0;
                            const normalizedRatio = val / maxVal;
                            const r = minRadius + normalizedRatio * (maxRadius - minRadius);

                            const startDeg = (i * 360) / totalCount - 90 + gapDeg / 2;
                            const endDeg = ((i + 1) * 360) / totalCount - 90 - gapDeg / 2;
                            const midDeg = (startDeg + endDeg) / 2;

                            const startRad = (startDeg * Math.PI) / 180;
                            const endRad = (endDeg * Math.PI) / 180;
                            const midRad = (midDeg * Math.PI) / 180;

                            const x_o1 = cx + r * Math.cos(startRad);
                            const y_o1 = cy + r * Math.sin(startRad);
                            const x_o2 = cx + r * Math.cos(endRad);
                            const y_o2 = cy + r * Math.sin(endRad);

                            const x_i2 = cx + innerRadius * Math.cos(endRad);
                            const y_i2 = cy + innerRadius * Math.sin(endRad);
                            const x_i1 = cx + innerRadius * Math.cos(startRad);
                            const y_i1 = cy + innerRadius * Math.sin(startRad);

                            const largeArcFlag = endDeg - startDeg > 180 ? 1 : 0;
                            const pathD = `M ${x_o1} ${y_o1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x_o2} ${y_o2} L ${x_i2} ${y_i2} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x_i1} ${y_i1} Z`;

                            const r_txt = innerRadius + (r - innerRadius) * 0.55;
                            const x_txt = cx + r_txt * Math.cos(midRad);
                            const y_txt = cy + r_txt * Math.sin(midRad);

                            const pct = totalSum > 0 ? ((val / totalSum) * 100).toFixed(0) : '0';
                            const isHovered = hoveredRoseSlice?.widgetId === 'top_modules' && hoveredRoseSlice?.name === d.name;

                            return (
                              <g
                                key={`top_rose_slice_${i}`}
                                className="transition-all duration-300 cursor-pointer"
                                filter="url(#topGreenShadow)"
                                onMouseEnter={() => setHoveredRoseSlice({
                                  widgetId: 'top_modules',
                                  name: d.name,
                                  value: val,
                                  percent: pct,
                                  color: colors[i % colors.length][0],
                                  x: x_txt,
                                  y: y_txt
                                })}
                                onMouseLeave={() => setHoveredRoseSlice(null)}
                              >
                                <path
                                  d={pathD}
                                  fill={`url(#topGreenGrad_${i % colors.length})`}
                                  stroke="#ffffff"
                                  strokeWidth={isHovered ? "2.5" : "1.5"}
                                  style={{
                                    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                                    transformOrigin: `${cx}px ${cy}px`,
                                    filter: isHovered ? 'brightness(1.1)' : 'none'
                                  }}
                                  className="transition-all duration-300"
                                />
                                <text x={x_txt} y={y_txt - 6} textAnchor="middle" dominantBaseline="central" className="fill-white font-black text-xs drop-shadow-md font-sans pointer-events-none transition-all duration-300">
                                  {isHovered ? val.toLocaleString(undefined, { maximumFractionDigits: 1 }) : `0${i + 1}`}
                                </text>
                                <text x={x_txt} y={y_txt + 6} textAnchor="middle" dominantBaseline="central" className="fill-white/90 font-bold text-[8px] drop-shadow-sm font-sans pointer-events-none">
                                  {d.name.length > 8 ? `${d.name.slice(0, 8)}.` : d.name}
                                </text>
                              </g>
                            );
                          })}
                        </svg>

                        {hoveredRoseSlice && hoveredRoseSlice.widgetId === 'top_modules' && (
                          <div
                            className="absolute z-[100] pointer-events-none transition-all duration-200 ease-out transform -translate-x-1/2 -translate-y-full mb-3"
                            style={{
                              left: `${Math.min(Math.max((hoveredRoseSlice.x / 240) * 100, 18), 82)}%`,
                              top: `${Math.min(Math.max((hoveredRoseSlice.y / 220) * 100, 20), 85)}%`
                            }}
                          >
                            <div className="bg-white text-slate-900 border border-border/80 shadow-2xl rounded-xl p-3 flex flex-col gap-1 min-w-[130px] animate-in fade-in zoom-in-95 duration-150">
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: hoveredRoseSlice.color }} />
                                <span className="font-bold text-xs tracking-tight truncate">{hoveredRoseSlice.name}</span>
                              </div>
                              <div className="flex items-baseline justify-between gap-3 text-xs pt-1 border-t border-border/40 mt-0.5">
                                <span className="text-muted-foreground text-[10px] uppercase tracking-wider font-medium">Score</span>
                                <span className="font-black text-emerald-700">{hoveredRoseSlice.value.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
                              </div>
                              <div className="flex items-baseline justify-between gap-3 text-xs">
                                <span className="text-muted-foreground text-[10px] uppercase tracking-wider font-medium">Share</span>
                                <span className="font-bold text-emerald-600">{hoveredRoseSlice.percent}%</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Lowest Performing Modules Rose Chart Card */}
            <div className="col-span-12 lg:col-span-6 bg-background rounded-2xl shadow-sm flex flex-col p-6 relative overflow-hidden min-h-[340px]">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none z-10" />
              <div className="relative z-20 w-full h-full flex flex-col gap-2">
                <div>
                  <h2 className="text-[15px] font-bold tracking-tight">Lowest Performing Modules</h2>
                  <p className="text-xs text-muted-foreground leading-tight mt-0.5">Lowest scoring sections</p>
                </div>
                <div className="flex-1 w-full min-h-[260px] flex items-center justify-center select-none pt-2">
                  {(() => {
                    const sliceData = [...sectionScores].sort((a, b) => a.score - b.score).slice(0, 5);
                    const totalCount = sliceData.length;
                    if (totalCount === 0) return null;

                    const maxVal = Math.max(...sliceData.map(d => Number(d.score) || 1));
                    const minRadius = 40;
                    const maxRadius = 105;
                    const innerRadius = 20;
                    const cx = 120;
                    const cy = 110;
                    const gapDeg = 8;

                    const colors = [
                      ['#7f1d1d', '#991b1b'],
                      ['#991b1b', '#b91c1c'],
                      ['#b91c1c', '#dc2626'],
                      ['#dc2626', '#ef4444'],
                      ['#f87171', '#fca5a5'],
                    ];

                    const totalSum = sliceData.reduce((sum, item) => sum + (Number(item.score) || 0), 0);

                    return (
                      <div className="w-full h-full relative flex flex-col items-center justify-center">
                        <svg viewBox="0 0 240 220" className="w-full h-full max-h-[240px] relative z-10">
                          <defs>
                            {colors.map((c, i) => (
                              <linearGradient key={`lowestRedGrad_${i}`} id={`lowestRedGrad_${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={c[0]} />
                                <stop offset="100%" stopColor={c[1]} />
                              </linearGradient>
                            ))}
                            <filter id="lowestRedShadow" x="-20%" y="-20%" width="140%" height="140%">
                              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0f172a" floodOpacity="0.2" />
                            </filter>
                          </defs>

                          <circle cx={cx} cy={cy} r={maxRadius} fill="none" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                          <circle cx={cx} cy={cy} r={minRadius + (maxRadius - minRadius) * 0.5} fill="none" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />

                          {sliceData.map((d, i) => {
                            const val = Number(d.score) || 0;
                            const normalizedRatio = val / maxVal;
                            const r = minRadius + normalizedRatio * (maxRadius - minRadius);

                            const startDeg = (i * 360) / totalCount - 90 + gapDeg / 2;
                            const endDeg = ((i + 1) * 360) / totalCount - 90 - gapDeg / 2;
                            const midDeg = (startDeg + endDeg) / 2;

                            const startRad = (startDeg * Math.PI) / 180;
                            const endRad = (endDeg * Math.PI) / 180;
                            const midRad = (midDeg * Math.PI) / 180;

                            const x_o1 = cx + r * Math.cos(startRad);
                            const y_o1 = cy + r * Math.sin(startRad);
                            const x_o2 = cx + r * Math.cos(endRad);
                            const y_o2 = cy + r * Math.sin(endRad);

                            const x_i2 = cx + innerRadius * Math.cos(endRad);
                            const y_i2 = cy + innerRadius * Math.sin(endRad);
                            const x_i1 = cx + innerRadius * Math.cos(startRad);
                            const y_i1 = cy + innerRadius * Math.sin(startRad);

                            const largeArcFlag = endDeg - startDeg > 180 ? 1 : 0;
                            const pathD = `M ${x_o1} ${y_o1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x_o2} ${y_o2} L ${x_i2} ${y_i2} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x_i1} ${y_i1} Z`;

                            const r_txt = innerRadius + (r - innerRadius) * 0.55;
                            const x_txt = cx + r_txt * Math.cos(midRad);
                            const y_txt = cy + r_txt * Math.sin(midRad);

                            const pct = totalSum > 0 ? ((val / totalSum) * 100).toFixed(0) : '0';
                            const isHovered = hoveredRoseSlice?.widgetId === 'lowest_modules' && hoveredRoseSlice?.name === d.name;

                            return (
                              <g
                                key={`lowest_rose_slice_${i}`}
                                className="transition-all duration-300 cursor-pointer"
                                filter="url(#lowestRedShadow)"
                                onMouseEnter={() => setHoveredRoseSlice({
                                  widgetId: 'lowest_modules',
                                  name: d.name,
                                  value: val,
                                  percent: pct,
                                  color: colors[i % colors.length][0],
                                  x: x_txt,
                                  y: y_txt
                                })}
                                onMouseLeave={() => setHoveredRoseSlice(null)}
                              >
                                <path
                                  d={pathD}
                                  fill={`url(#lowestRedGrad_${i % colors.length})`}
                                  stroke="#ffffff"
                                  strokeWidth={isHovered ? "2.5" : "1.5"}
                                  style={{
                                    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                                    transformOrigin: `${cx}px ${cy}px`,
                                    filter: isHovered ? 'brightness(1.1)' : 'none'
                                  }}
                                  className="transition-all duration-300"
                                />
                                <text x={x_txt} y={y_txt - 6} textAnchor="middle" dominantBaseline="central" className="fill-white font-black text-xs drop-shadow-md font-sans pointer-events-none transition-all duration-300">
                                  {isHovered ? val.toLocaleString(undefined, { maximumFractionDigits: 1 }) : `0${i + 1}`}
                                </text>
                                <text x={x_txt} y={y_txt + 6} textAnchor="middle" dominantBaseline="central" className="fill-white/90 font-bold text-[8px] drop-shadow-sm font-sans pointer-events-none">
                                  {d.name.length > 8 ? `${d.name.slice(0, 8)}.` : d.name}
                                </text>
                              </g>
                            );
                          })}
                        </svg>

                        {hoveredRoseSlice && hoveredRoseSlice.widgetId === 'lowest_modules' && (
                          <div
                            className="absolute z-[100] pointer-events-none transition-all duration-200 ease-out transform -translate-x-1/2 -translate-y-full mb-3"
                            style={{
                              left: `${Math.min(Math.max((hoveredRoseSlice.x / 240) * 100, 18), 82)}%`,
                              top: `${Math.min(Math.max((hoveredRoseSlice.y / 220) * 100, 20), 85)}%`
                            }}
                          >
                            <div className="bg-white text-slate-900 border border-border/80 shadow-2xl rounded-xl p-3 flex flex-col gap-1 min-w-[130px] animate-in fade-in zoom-in-95 duration-150">
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: hoveredRoseSlice.color }} />
                                <span className="font-bold text-xs tracking-tight truncate">{hoveredRoseSlice.name}</span>
                              </div>
                              <div className="flex items-baseline justify-between gap-3 text-xs pt-1 border-t border-border/40 mt-0.5">
                                <span className="text-muted-foreground text-[10px] uppercase tracking-wider font-medium">Score</span>
                                <span className="font-black text-rose-700">{hoveredRoseSlice.value.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
                              </div>
                              <div className="flex items-baseline justify-between gap-3 text-xs">
                                <span className="text-muted-foreground text-[10px] uppercase tracking-wider font-medium">Share</span>
                                <span className="font-bold text-rose-600">{hoveredRoseSlice.percent}%</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* ROW 3+: Category Section Charts Grid (Grouped by Category: Value Overview then Score Breakdown) */}
          {groupedCategoryCharts.length > 0 && (
            <div className="grid grid-cols-12 gap-6 mt-2">
              {groupedCategoryCharts.map(({ widget, data }) => {
                return (
                  <div
                    key={widget.id}
                    className="col-span-12 lg:col-span-6 group bg-background rounded-2xl shadow-sm transition-all duration-300 flex flex-col min-h-[460px] overflow-hidden relative cursor-default"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none z-10" />
                    <div className="relative z-20 flex flex-col h-full p-6">
                      <div className="mb-6 pr-4 flex justify-between items-center">
                        <div>
                          <h3 className="font-bold text-foreground text-base tracking-tight line-clamp-1">{widget.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{getWidgetDescription(widget)}</p>
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col justify-center min-h-0">
                        {renderWidget(widget)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <Modal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} title="Configure Project Dashboard">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1 pb-4">
          <p className="text-sm text-muted-foreground mb-4">
            Select which global widgets you want to display on this project's dashboard.
          </p>

          {widgets.length === 0 ? (
            <div className="text-sm text-center py-8 text-muted-foreground">
              No global widgets available. Create them in the Analytics Maker first.
            </div>
          ) : (
            <div className="space-y-3">
              {widgets.map(widget => (
                <label key={widget.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/30 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    className="mt-1 accent-primary w-4 h-4"
                    checked={project.enabledWidgets?.includes(widget.id)}
                    onChange={(e) => toggleProjectWidget(project.id, widget.id, e.target.checked)}
                  />
                  <div>
                    <h4 className="font-medium text-sm">{widget.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Type: {widget.chartType.replace('_', ' ')}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <Button onClick={() => setIsConfigOpen(false)}>Done</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
