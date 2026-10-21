"use client"

import * as React from "react"
import { useAppStore } from "@/store"
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard"
import { FolderOpen, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function GlobalAnalyticsPage() {
  const { projects, fetchProjects, fetchWidgets, fetchTemplates, isLoadingProjects } = useAppStore()
  const [selectedProjectId, setSelectedProjectId] = React.useState<string>("")

  React.useEffect(() => {
    fetchProjects()
    fetchWidgets()
    fetchTemplates()
  }, [fetchProjects, fetchWidgets, fetchTemplates])

  // Auto-select the first project if none is selected
  React.useEffect(() => {
    if (!selectedProjectId && projects.length > 0) {
      setSelectedProjectId(projects[0].id)
    }
  }, [projects, selectedProjectId])

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <h2 className="text-xl font-bold text-foreground">Global Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">Select a project to view its real-time analytics.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:max-w-md md:ml-auto">
          <div className="relative flex-1 min-w-0">
            <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <select
              className="w-full pl-10 pr-10 py-2.5 bg-background border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              disabled={isLoadingProjects}
            >
              <option value="" disabled>{isLoadingProjects ? "Loading projects..." : "Select a project..."}</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
            </div>
          </div>
          <Button variant="outline" className="gap-2 shrink-0 rounded-xl h-[42px] border-border shadow-sm bg-background">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {isLoadingProjects ? (
        <div className="bg-surface rounded-2xl border border-border p-8 shadow-sm animate-pulse space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="space-y-2">
              <div className="h-6 w-48 bg-slate-200 rounded-md" />
              <div className="h-4 w-32 bg-slate-100 rounded-md" />
            </div>
            <div className="h-10 w-24 bg-slate-200 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-28 bg-slate-100 rounded-xl" />
            ))}
          </div>
        </div>
      ) : selectedProjectId ? (
        <AnalyticsDashboard projectId={selectedProjectId} />
      ) : (
        <div className="flex items-center justify-center p-12 bg-surface/50 border border-dashed rounded-2xl">
          <p className="text-muted-foreground">Please select a project to view its dashboard.</p>
        </div>
      )}
    </div>
  )
}
