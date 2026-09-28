"use client"

import * as React from "react"
import { useAppStore } from "@/store"
import { Plus, Trash2, Pencil, PieChart as PieChartIcon, BarChart2, Activity, Hash, FileSpreadsheet } from "lucide-react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { AnalyticsWidget } from "@/lib/types"

export default function AnalyticsMakerPage() {
  const { templates, widgets, createWidget, updateWidget, deleteWidget } = useAppStore()
  
  const [mounted, setMounted] = React.useState(false)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [editingWidgetId, setEditingWidgetId] = React.useState<string | null>(null)
  
  const [formData, setFormData] = React.useState<Partial<AnalyticsWidget>>({
    title: "",
    description: "",
    chartType: "bar_chart",
    sectionId: "",
    categoryId: "",
    columnId: "",
    aggregation: "sum",
    customFormula: ""
  })

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleOpenModal = (widget?: AnalyticsWidget) => {
    if (widget) {
      setEditingWidgetId(widget.id)
      setFormData({ ...widget, sectionId: widget.sectionId || 'ALL' })
    } else {
      setEditingWidgetId(null)
      setFormData({
        title: "",
        description: "",
        chartType: "bar_chart",
        sectionId: templates[0]?.id || "",
        categoryId: "",
        columnId: "",
        aggregation: "sum",
        customFormula: ""
      })
    }
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!formData.title || !formData.sectionId) return

    const widgetToSave = {
      ...formData,
      sectionId: formData.sectionId === 'ALL' ? null : formData.sectionId,
      categoryId: formData.categoryId || null,
      columnId: formData.columnId || null,
    } as Omit<AnalyticsWidget, 'id'>

    if (editingWidgetId) {
      updateWidget(editingWidgetId, widgetToSave)
    } else {
      createWidget(widgetToSave)
    }
    setIsModalOpen(false)
  }

  const selectedSection = templates.find(t => t.id === formData.sectionId)
  const selectedCategory = selectedSection?.categories.find(c => c.id === formData.categoryId)

  const getChartIcon = (type: string) => {
    switch (type) {
      case 'pie_chart': return <PieChartIcon className="h-5 w-5" />
      case 'bar_chart': return <BarChart2 className="h-5 w-5" />
      case 'line_chart': return <Activity className="h-5 w-5" />
      case 'speed_gauge': return <Activity className="h-5 w-5 text-red-500" />
      case 'stat_card': return <Hash className="h-5 w-5" />
      default: return <PieChartIcon className="h-5 w-5" />
    }
  }

  return (
    <div className="space-y-6">
      {mounted && typeof document !== 'undefined' && (
        <>
          {document.getElementById("app-header-title") && createPortal(
            <>
              <h1 className="text-xl font-semibold text-foreground">Analytics Maker</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Design global chart widgets for your projects.</p>
            </>,
            document.getElementById("app-header-title")!
          )}
          {document.getElementById("app-header-actions") && createPortal(
            <Button onClick={() => handleOpenModal()}>
              <Plus className="h-4 w-4 mr-2" />
              New Widget
            </Button>,
            document.getElementById("app-header-actions")!
          )}
        </>
      )}

      {widgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-xl bg-surface/50">
          <PieChartIcon className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground">No Widgets Created</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-6">
            Create global chart and metric widgets here. You can enable them for specific projects on the project dashboard.
          </p>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Widget
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {widgets.map(widget => (
            <div key={widget.id} className="bg-surface border border-border rounded-xl p-5 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    {getChartIcon(widget.chartType)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{widget.title}</h3>
                    <p className="text-xs text-muted-foreground">{widget.description || "No description"}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenModal(widget)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => deleteWidget(widget.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-auto space-y-2 text-sm text-muted-foreground border-t pt-4">
                <div className="flex justify-between">
                  <span>Target Section:</span>
                  <span className="font-medium text-foreground truncate max-w-[150px] text-right">{!widget.sectionId ? "Whole Project" : templates.find(t => t.id === widget.sectionId)?.label || "Unknown"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Aggregation:</span>
                  <span className="font-medium text-foreground uppercase text-xs tracking-wider">{widget.aggregation}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingWidgetId ? "Edit Widget" : "Create New Widget"}>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1 pb-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Widget Title *</label>
            <input className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Quality of Life Scores" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm h-16" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Chart Type *</label>
              <select className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" value={formData.chartType} onChange={e => setFormData({ ...formData, chartType: e.target.value as any })}>
                <option value="bar_chart">Bar Chart</option>
                <option value="line_chart">Line Chart</option>
                <option value="pie_chart">Pie Chart</option>
                <option value="donut_chart">Donut Chart</option>
                <option value="area_chart">Area Chart</option>
                <option value="radar_chart">Radar Chart</option>
                <option value="heat_chart">Heat Chart</option>
                <option value="speed_gauge">Speed Gauge</option>
                <option value="stat_card">Stat Card</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Aggregation Method *</label>
              <select className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" value={formData.aggregation} onChange={e => setFormData({ ...formData, aggregation: e.target.value as any })}>
                <option value="sum">Sum</option>
                <option value="average">Average</option>
                <option value="formula">Custom Formula</option>
              </select>
            </div>
          </div>

          <div className="p-4 bg-muted/30 border rounded-lg space-y-4">
            <h4 className="text-sm font-semibold flex items-center gap-2"><FileSpreadsheet className="w-4 h-4" /> Data Source Mapping</h4>
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Section *</label>
              <select className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" value={formData.sectionId || ""} onChange={e => setFormData({ ...formData, sectionId: e.target.value, categoryId: "", columnId: "" })}>
                <option value="" disabled>Select a Section...</option>
                <option value="ALL">All Sections (Whole Project Overview)</option>
                {templates.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>

            {formData.sectionId && formData.sectionId !== 'ALL' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Filter by Category (Optional)</label>
                <select className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" value={formData.categoryId || ""} onChange={e => setFormData({ ...formData, categoryId: e.target.value, columnId: "" })}>
                  <option value="">All Categories (Aggregate across section)</option>
                  {selectedSection?.categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
            )}

            {formData.sectionId && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Column (Optional)</label>
                <select className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" value={formData.columnId || ""} onChange={e => setFormData({ ...formData, columnId: e.target.value })}>
                  <option value="">Base Data Column (Default)</option>
                  {formData.categoryId 
                    ? selectedCategory?.columns.map(c => <option key={c.id} value={c.id}>{c.name} ({c.type})</option>)
                    : selectedSection?.categories.map(cat => (
                        <optgroup key={cat.id} label={cat.label}>
                          {cat.columns.map(c => <option key={c.id} value={c.id}>{c.name} ({c.type})</option>)}
                        </optgroup>
                      ))
                  }
                </select>
              </div>
            )}
          </div>

          {formData.aggregation === 'formula' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Custom Formula</label>
              <p className="text-xs text-muted-foreground mb-1">Use standard math expressions. Will map over filtered data.</p>
              <input className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm font-mono text-blue-600" value={formData.customFormula} onChange={e => setFormData({ ...formData, customFormula: e.target.value })} placeholder="e.g. sum(Data) * 1.5" />
            </div>
          )}

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingWidgetId ? "Save Changes" : "Create Widget"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
