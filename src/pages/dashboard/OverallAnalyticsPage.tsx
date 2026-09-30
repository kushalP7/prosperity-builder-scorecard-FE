"use client"

import * as React from "react"
import { useAppStore } from "@/store"
import { OverallAnalyticsDashboard } from "@/components/OverallAnalyticsDashboard"

export default function OverallAnalyticsPage() {
  const { fetchProjects, fetchWidgets } = useAppStore()

  React.useEffect(() => {
    fetchProjects()
    fetchWidgets()
  }, [fetchProjects, fetchWidgets])

  return <OverallAnalyticsDashboard />
}
