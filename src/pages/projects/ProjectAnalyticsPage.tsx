"use client"

import * as React from "react"
import { useParams } from "@/lib/router-compat"
import { useAppStore } from "@/store"
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard"

export default function ProjectAnalyticsPage() {
  const routeParams = useParams<{ id: string }>()
  const id = routeParams.id || ""
  const { fetchProjects, fetchWidgets, fetchTemplates, projects, widgets, templates } = useAppStore()

  React.useEffect(() => {
    if (projects.length === 0) fetchProjects();
    if (widgets.length === 0) fetchWidgets();
    if (templates.length === 0) fetchTemplates();
  }, [fetchProjects, fetchWidgets, fetchTemplates, projects.length, widgets.length, templates.length]);
  
  return <AnalyticsDashboard projectId={id} />
}
