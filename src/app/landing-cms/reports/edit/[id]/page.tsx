"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { ReportForm } from "@/components/cms/ReportForm"

export default function EditReportPage() {
  const params = useParams()
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id

  return <ReportForm reportId={id} />
}
