"use client"

import * as React from "react"
import { useAppStore } from "@/store"
import { Link, usePathname, useRouter, useParams } from "@/lib/router-compat"
import { Outlet } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { ArrowLeft, CheckCircle2, Plus, Layers } from "lucide-react"

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
              <h2 className="text-3xl font-bold tracking-tight text-foreground">{project.name}</h2>
              <p className="text-muted-foreground mt-1">Client: {project.clientName} &bull; {project.year}</p>
            </div>
          </div>
          <Button onClick={() => setIsAssignModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Assign Section
          </Button>
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
