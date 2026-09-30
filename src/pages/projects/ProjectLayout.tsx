"use client"

import * as React from "react"
import { useAppStore } from "@/store"
import { Link, usePathname, useRouter, useParams } from "@/lib/router-compat"
import { Outlet } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { ArrowLeft, CheckCircle2, Plus, Layers, ShieldCheck } from "lucide-react"

export default function ProjectLayout({
  children,
}: {
  children?: React.ReactNode
}) {
  const routeParams = useParams<{ id: string }>()
  const id = routeParams.id || ""
  const pathname = usePathname()
  const router = useRouter()

  const { projects, templates, assignSectionToProject } = useAppStore()
  const project = projects.find(p => p.id === id)

  const [isAssignModalOpen, setIsAssignModalOpen] = React.useState(false)

  React.useEffect(() => {
    // If we land on the base route, redirect to data
    if (pathname === `/projects/${id}`) {
      router.replace(`/projects/${id}/data`)
    }
  }, [pathname, id, router])

  if (!project) return <div className="p-8">Project not found</div>



  const handleAssignSection = (templateId: string) => {
    assignSectionToProject(project.id, templateId)
    setIsAssignModalOpen(false)
  }

  // Deduplicate global templates by label / name
  const uniqueTemplatesMap = new Map<string, typeof templates[0]>();
  (templates || []).forEach(t => {
    const key = (t.label || t.id || '').trim().toLowerCase();
    if (key && !uniqueTemplatesMap.has(key)) {
      uniqueTemplatesMap.set(key, t);
    }
  });
  const uniqueTemplates = Array.from(uniqueTemplatesMap.values());

  // Find assigned section keys (matching by normalized label or ID)
  const assignedKeys = new Set(
    (project.assignedSections || []).map(as => (as.label || as.id || '').trim().toLowerCase())
  );

  // Available templates are unique templates that are NOT assigned to this project
  const availableTemplates = uniqueTemplates.filter(t => {
    const key = (t.label || t.id || '').trim().toLowerCase();
    return !assignedKeys.has(key);
  });

  // Deduplicate assigned sections display
  const uniqueAssignedSectionsMap = new Map<string, typeof project.assignedSections[0]>();
  (project.assignedSections || []).forEach(s => {
    const key = (s.label || s.id || '').trim().toLowerCase();
    if (key && !uniqueAssignedSectionsMap.has(key)) {
      uniqueAssignedSectionsMap.set(key, s);
    }
  });
  const uniqueAssignedSections = Array.from(uniqueAssignedSectionsMap.values());

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/projects"
              className="p-2 -ml-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors flex items-center justify-center shrink-0"
              title="Back to Projects"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{project.name}</h2>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  project.status === 'PUBLISHED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : project.status === 'IN_REVIEW'
                    ? 'bg-purple-50 text-purple-700 border-purple-300'
                    : project.status === 'CALCULATED'
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : project.status === 'INGESTION_RUNNING'
                    ? 'bg-cyan-50 text-cyan-700 border-cyan-300'
                    : 'bg-amber-50 text-amber-700 border-amber-300'
                }`}>
                  {project.status || 'INTAKE_PENDING'}
                </span>
                {project.bypassPayments !== false && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    Payment Bypass Active
                  </span>
                )}
              </div>
              <p className="text-muted-foreground mt-1 text-xs">Client: {project.clientName} &bull; {project.year} &bull; {project.packageType || 'Standard Scorecard'}</p>
            </div>
          </div>
          <Button onClick={() => setIsAssignModalOpen(true)} size="sm" variant="outline">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Assign Section
          </Button>
        </div>

        {/* Phase Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-border/80 mt-5 pt-1 overflow-x-auto">
          <Link
            href={`/projects/${id}/data`}
            className={cn(
              "px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 -mb-px flex items-center gap-2 whitespace-nowrap",
              pathname.includes('/data')
                ? "border-emerald-600 text-emerald-700 bg-emerald-50/50"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            Executive Scorecard
          </Link>
          <Link
            href={`/projects/${id}/intake`}
            className={cn(
              "px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 -mb-px flex items-center gap-2 whitespace-nowrap",
              pathname.includes('/intake')
                ? "border-emerald-600 text-emerald-700 bg-emerald-50/50"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
            )}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Phase 2: Client Intake (90+ Data Points)
          </Link>
          <Link
            href={`/projects/${id}/calibration`}
            className={cn(
              "px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 -mb-px flex items-center gap-2 whitespace-nowrap",
              pathname.includes('/calibration')
                ? "border-emerald-600 text-emerald-700 bg-emerald-50/50"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
            )}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Phase 3 & 4: Calibration & Release
          </Link>
        </div>

      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        {children || <Outlet />}
      </div>

      {/* Assign Modal */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Assign Global Section">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Select a template to clone into this project. Once cloned, changes to the global template will not affect this project.
          </p>

          <div className="max-h-[60vh] overflow-y-auto pr-1.5 space-y-5">
            {/* Available Templates */}
            <div className="space-y-2.5">
              <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Available Sections ({availableTemplates.length})
              </h5>

              {availableTemplates.length === 0 && (
                <div className="p-6 text-center border border-dashed rounded-xl text-muted-foreground bg-muted/20 text-sm">
                  All global sections have already been assigned to this project.
                </div>
              )}

              {availableTemplates.map(template => (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-3.5 bg-background border border-border/80 rounded-xl hover:border-[#B5111B]/60 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: template.accentColor || '#B5111B' }}
                    />
                    <div>
                      <h4 className="font-bold text-foreground text-sm group-hover:text-[#B5111B] transition-colors">
                        {template.label}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {template.categories.length} {template.categories.length === 1 ? 'category' : 'categories'}
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleAssignSection(template.id)}
                    className="bg-[#B5111B] text-white hover:bg-[#9B0F17] h-8 px-4 text-xs font-bold rounded-lg shadow-sm cursor-pointer"
                  >
                    Assign
                  </Button>
                </div>
              ))}
            </div>

            {/* Already Assigned Sections */}
            {uniqueAssignedSections.length > 0 && (
              <div className="pt-3 border-t border-border/70 space-y-2.5">
                <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Already Assigned ({uniqueAssignedSections.length})
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {uniqueAssignedSections.map(s => (
                    <div
                      key={s.id}
                      className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200/60 text-xs font-semibold text-emerald-950"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="truncate">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}
