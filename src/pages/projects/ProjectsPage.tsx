"use client"

import * as React from "react"
import { useAppStore } from "@/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { Spinner, SkeletonCard } from "@/components/ui/loader"
import { Folder, Plus, Trash2, Pencil, Database, Image as ImageIcon, X, Upload } from "lucide-react"
import { Link } from "@/lib/router-compat"
import { createPortal } from "react-dom"
import { usePermission } from "@/lib/permissions"

export default function ProjectsPage() {
  const { projects, fetchProjects, isLoadingProjects, createProject, updateProject, deleteProject, loadSampleData, isLoading } = useAppStore()
  const canCreate = usePermission('create_project')
  const canEdit = usePermission('edit_project_metadata')
  const canDelete = usePermission('delete_project')
  const [mounted, setMounted] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    setMounted(true)
    fetchProjects()
  }, [fetchProjects])

  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [editingProjectId, setEditingProjectId] = React.useState<string | null>(null)
  const [newProject, setNewProject] = React.useState<{ name: string; clientName: string; year: number; image?: string }>({
    name: "",
    clientName: "",
    year: new Date().getFullYear(),
    image: ""
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert("Image size should be less than 3MB.")
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewProject(prev => ({ ...prev, image: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setNewProject(prev => ({ ...prev, image: "" }))
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSaveProject = async () => {
    if (!newProject.name || !newProject.clientName) return;
    setIsSubmitting(true)

    if (editingProjectId) {
      await updateProject(editingProjectId, {
        name: newProject.name,
        clientName: newProject.clientName,
        year: newProject.year,
        image: newProject.image
      })
    } else {
      await createProject({
        name: newProject.name,
        clientName: newProject.clientName,
        year: newProject.year,
        image: newProject.image,
        enabledWidgets: []
      })
    }

    setIsSubmitting(false)
    setIsModalOpen(false)
    setEditingProjectId(null)
    setNewProject({ name: "", clientName: "", year: new Date().getFullYear(), image: "" })
  }

  const openEditModal = (project: any) => {
    setNewProject({
      name: project.name,
      clientName: project.clientName,
      year: project.year,
      image: project.image || ""
    })
    setEditingProjectId(project.id)
    setIsModalOpen(true)
  }

  const openCreateModal = () => {
    setNewProject({ name: "", clientName: "", year: new Date().getFullYear(), image: "" })
    setEditingProjectId(null)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {mounted && document.getElementById('app-header-title') && createPortal(
        <>
          <h1 className="text-xl font-bold tracking-tight">Projects</h1>
        </>,
        document.getElementById('app-header-title')!
      )}

      {mounted && document.getElementById('app-header-actions') && createPortal(
        <div className="flex items-center gap-2">
          {canCreate && (
            <>
              <Button variant="outline" onClick={() => loadSampleData()} disabled={isLoading}>
                {isLoading ? <Spinner className="mr-2 h-4 w-4" /> : <Database className="h-4 w-4 mr-2" />}
                Load Sample Data
              </Button>
              <Button onClick={openCreateModal}>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </>
          )}
        </div>,
        document.getElementById('app-header-actions')!
      )}

      {(isLoading || isLoadingProjects) && projects.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : projects.length === 0 ? (
        <div className="p-12 text-center border border-dashed rounded-lg text-muted-foreground">
          No projects yet. Create one to start an assessment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="group hover:border-primary transition-colors flex flex-col overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <Link href={`/projects/${project.id}/data`} className="flex-1 hover:underline">
                    <div className="flex items-center gap-3">
                      {project.image ? (
                        <img
                          src={project.image}
                          alt={project.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0 shadow-sm"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          <Folder className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      )}
                      <CardTitle className="text-lg leading-tight text-primary">{project.name}</CardTitle>
                    </div>
                  </Link>
                  <div className="flex items-center">
                    {canEdit && (
                      <button
                        onClick={() => openEditModal(project)}
                        title="Edit Project Details"
                        className="text-muted-foreground hover:text-primary transition-colors p-1 mr-1 cursor-pointer"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => deleteProject(project.id)}
                        title="Delete Project (Admin only)"
                        className="text-muted-foreground hover:text-red-500 transition-colors p-1 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-sm text-muted-foreground mb-4">Client: {project.clientName}</p>

                <div className="mt-auto flex justify-between items-center text-xs text-muted-foreground border-t border-border pt-4">
                  <span>{project.year}</span>
                  <span>{(project.assignedSections || []).length} sections assigned</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProjectId ? "Edit Project" : "Create New Project"}>
        <div className="space-y-4">
          {/* Project Image Upload Field & Live Preview */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Project Image / Logo</label>
            <div className="flex items-center gap-4">
              {newProject.image ? (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0 group">
                  <img src={newProject.image} alt="Project Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white p-0.5 rounded-full transition-colors"
                    title="Remove Image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 shrink-0">
                  <ImageIcon className="w-6 h-6" />
                </div>
              )}
              <div className="flex flex-col gap-1.5 flex-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="project-image-input"
                />
                <label
                  htmlFor="project-image-input"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-input bg-background hover:bg-accent text-xs font-semibold cursor-pointer w-fit transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{newProject.image ? "Change Image" : "Upload Image"}</span>
                </label>
                <span className="text-[11px] text-muted-foreground">PNG, JPG or WebP (Max 3MB)</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Project Name</label>
            <input
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              value={newProject.name}
              onChange={e => setNewProject({ ...newProject, name: e.target.value })}
              placeholder="e.g. Town of Wake Forest, NC, 2026"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Client Name</label>
            <input
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              value={newProject.clientName}
              onChange={e => setNewProject({ ...newProject, clientName: e.target.value })}
              placeholder="e.g. Wake Forest"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Year</label>
            <input
              type="number"
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              value={newProject.year}
              onChange={e => setNewProject({ ...newProject, year: parseInt(e.target.value) || new Date().getFullYear() })}
            />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveProject} disabled={isSubmitting}>
              {isSubmitting && <Spinner className="mr-2 h-4 w-4" />}
              {editingProjectId ? "Save Changes" : "Create Project"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
