"use client"

import * as React from "react"
import { useParams } from "@/lib/router-compat"
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard"

export default function ProjectAnalyticsPage() {
  const routeParams = useParams<{ id: string }>()
  const id = routeParams.id || ""
  
  return <AnalyticsDashboard projectId={id} />
}
