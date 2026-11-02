"use client"

import * as React from "react"
import { useAppStore } from "@/store"
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard"
import { FolderOpenIcon, DownloadSimpleIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Dropdown } from "@/components/ui/dropdown"
import { isCustomerRole } from "@/lib/permissions"

export default function GlobalAnalyticsPage() {
  const { projects, fetchProjects, fetchWidgets, fetchTemplates, isLoadingProjects, currentUser } = useAppStore()
  const [selectedProjectId, setSelectedProjectId] = React.useState<string>("")
  const isCustomer = isCustomerRole(currentUser?.role)

  // Dashboards only render for published scorecards
  const publishedProjects = React.useMemo(
    () =>
      projects.filter(
        (p) => String((p as any).status || "").toUpperCase() === "PUBLISHED",
      ),
    [projects],
  )

  React.useEffect(() => {
    fetchProjects()
    fetchWidgets()
    fetchTemplates()
  }, [fetchProjects, fetchWidgets, fetchTemplates])

  // Auto-select the first published project if none is selected
  React.useEffect(() => {
    if (!selectedProjectId && publishedProjects.length > 0) {
      setSelectedProjectId(publishedProjects[0].id)
    }
  }, [publishedProjects, selectedProjectId])

  // Drop selection if project left the published list
  React.useEffect(() => {
    if (
      selectedProjectId &&
      publishedProjects.length > 0 &&
      !publishedProjects.some((p) => p.id === selectedProjectId)
    ) {
      setSelectedProjectId(publishedProjects[0].id)
    }
    if (selectedProjectId && publishedProjects.length === 0) {
      setSelectedProjectId("")
    }
  }, [publishedProjects, selectedProjectId])

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {isCustomer ? "My Dashboard" : "Global Dashboard"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isCustomer
              ? "Analytics for your scorecard projects only."
              : "Select a project to view its real-time analytics."}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:max-w-md md:ml-auto">
          <Dropdown
            fullWidth
            size="md"
            className="flex-1 min-w-0"
            value={selectedProjectId}
            onChange={setSelectedProjectId}
            disabled={isLoadingProjects || publishedProjects.length === 0}
            placeholder={
              isLoadingProjects
                ? "Loading projects..."
                : publishedProjects.length === 0
                  ? "No published projects"
                  : "Select a project..."
            }
            icon={<FolderOpenIcon weight="duotone" className="h-4 w-4" />}
            options={publishedProjects.map((project) => ({
              value: project.id,
              label: project.name,
            }))}
            menuClassName="max-h-80"
            buttonClassName="py-2.5 text-sm rounded-xl"
          />
          <Button variant="outline" className="gap-2 shrink-0 rounded-xl h-[42px] border-border shadow-sm bg-background">
            <DownloadSimpleIcon weight="bold" className="h-4 w-4" />
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
          <p className="text-muted-foreground">
            {publishedProjects.length === 0
              ? "No published projects yet. Publish a scorecard to view its dashboard."
              : "Please select a project to view its dashboard."}
          </p>
        </div>
      )}
    </div>
  )
}
