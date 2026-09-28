"use client"

import * as React from "react"
import { useAppStore } from "@/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { Link } from "@/lib/router-compat"
import { Plus, Trash2, Pencil } from "lucide-react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

export default function SectionMakerPage() {
  const { templates, createTemplateSection, updateTemplateSection, deleteTemplateSection, createTemplateCategory, updateTemplateCategory, deleteTemplateCategory, createTemplateGroup, updateTemplateGroup, deleteTemplateGroup } = useAppStore()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  const [selectedSectionId, setSelectedSectionId] = React.useState<string | null>(null)
  const [isSectionModalOpen, setIsSectionModalOpen] = React.useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = React.useState(false)
  const [isGroupModalOpen, setIsGroupModalOpen] = React.useState(false)

  const [editingSectionId, setEditingSectionId] = React.useState<string | null>(null)
  const [editingCategoryId, setEditingCategoryId] = React.useState<{ sectionId: string, categoryId: string } | null>(null)
  const [editingGroupId, setEditingGroupId] = React.useState<{ sectionId: string, categoryId: string, groupId: string } | null>(null)
  const [targetCategoryForGroup, setTargetCategoryForGroup] = React.useState<{ sectionId: string, categoryId: string } | null>(null)

  const [newSection, setNewSection] = React.useState({ label: "", description: "", accentColor: "#B5111B", icon: "Layers" })
  const [newCategory, setNewCategory] = React.useState({ sectionId: "", label: "", description: "", takesValues: false })
  const [newGroup, setNewGroup] = React.useState({ label: "", description: "", takesValues: false })

  // Deduplicate global templates by label / name
  const uniqueTemplatesMap = new Map<string, typeof templates[0]>();
  (templates || []).forEach(t => {
    const key = (t.label || t.id || '').trim().toLowerCase();
    if (key && !uniqueTemplatesMap.has(key)) {
      uniqueTemplatesMap.set(key, t);
    }
  });
  const uniqueTemplates = Array.from(uniqueTemplatesMap.values());

  const activeSectionId = selectedSectionId && uniqueTemplates.some(s => s.id === selectedSectionId)
    ? selectedSectionId
    : (uniqueTemplates[0]?.id || null)

  const activeSection = uniqueTemplates.find(s => s.id === activeSectionId)

  const handleSaveSection = () => {
    if (!newSection.label) return;
    if (editingSectionId) {
      updateTemplateSection(editingSectionId, {
        label: newSection.label,
        description: newSection.description,
        accentColor: newSection.accentColor,
        icon: newSection.icon
      })
    } else {
      createTemplateSection({
        label: newSection.label,
        description: newSection.description,
        accentColor: newSection.accentColor,
        icon: newSection.icon
      })
    }
    setIsSectionModalOpen(false)
    setEditingSectionId(null)
    setNewSection({ label: "", description: "", accentColor: "#B5111B", icon: "Layers" })
  }

  const openEditSection = (section: any) => {
    setNewSection({ label: section.label, description: section.description || "", accentColor: section.accentColor || "#B5111B", icon: section.icon || "Layers" })
    setEditingSectionId(section.id)
    setIsSectionModalOpen(true)
  }

  const handleSaveCategory = () => {
    if (!newCategory.label || !newCategory.sectionId) return;
    if (editingCategoryId) {
      updateTemplateCategory(editingCategoryId.sectionId, editingCategoryId.categoryId, {
        label: newCategory.label,
        description: newCategory.description,
        takesValues: newCategory.takesValues
      })
    } else {
      createTemplateCategory(newCategory.sectionId, {
        label: newCategory.label,
        description: newCategory.description,
        takesValues: newCategory.takesValues
      })
    }
    setIsCategoryModalOpen(false)
    setEditingCategoryId(null)
    setNewCategory({ sectionId: "", label: "", description: "", takesValues: false })
  }

  const openEditCategory = (sectionId: string, category: any, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setNewCategory({ sectionId, label: category.label, description: category.description || "", takesValues: category.takesValues })
    setEditingCategoryId({ sectionId, categoryId: category.id })
    setIsCategoryModalOpen(true)
  }

  const handleSaveGroup = () => {
    if (!newGroup.label || !targetCategoryForGroup) return;
    if (editingGroupId) {
      updateTemplateGroup(editingGroupId.sectionId, editingGroupId.categoryId, editingGroupId.groupId, newGroup)
    } else {
      createTemplateGroup(targetCategoryForGroup.sectionId, targetCategoryForGroup.categoryId, newGroup)
    }
    setIsGroupModalOpen(false)
    setEditingGroupId(null)
    setTargetCategoryForGroup(null)
    setNewGroup({ label: "", description: "", takesValues: false })
  }

  const openEditGroup = (sectionId: string, categoryId: string, group: any, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setNewGroup({ label: group.label, description: group.description || "", takesValues: group.takesValues })
    setEditingGroupId({ sectionId, categoryId, groupId: group.id })
    setTargetCategoryForGroup({ sectionId, categoryId })
    setIsGroupModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {mounted && document.getElementById('app-header-title') && createPortal(
        <>
          <h1 className="text-xl font-bold tracking-tight">Global Section Maker</h1>
        </>,
        document.getElementById('app-header-title')!
      )}

      {mounted && document.getElementById('app-header-actions') && createPortal(
        <Button onClick={() => {
          setNewSection({ label: "", description: "", accentColor: "#B5111B", icon: "Layers" })
          setEditingSectionId(null)
          setIsSectionModalOpen(true)
        }}
        className="bg-[#B5111B] text-white hover:bg-[#9B0F17] font-semibold px-4 py-2 rounded-lg shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Section Template
        </Button>,
        document.getElementById('app-header-actions')!
      )}

      <div className="space-y-4">
        {/* High-Contrast Segmented Capsule Section Tabs Track (Matching Project Data Page) */}
        {uniqueTemplates.length > 0 && (
          <div className="bg-slate-200/90 p-2 rounded-2xl border border-slate-300/80 shadow-inner flex flex-wrap items-center gap-1.5 max-w-full">
            {uniqueTemplates.map((section) => {
              const isSelected = activeSectionId === section.id
              const categoryCount = section.categories.length;

              return (
                <button
                  key={section.id}
                  onClick={() => setSelectedSectionId(section.id)}
                  className={cn(
                    "px-3.5 py-2 text-xs md:text-sm font-semibold transition-all duration-200 rounded-xl cursor-pointer select-none flex items-center gap-2",
                    isSelected
                      ? "bg-[#B5111B] text-white shadow-md shadow-red-900/30 scale-[1.02] font-bold border border-[#B5111B]"
                      : "bg-slate-100 text-slate-800 hover:bg-white hover:text-slate-950 border border-slate-300/90 shadow-xs hover:shadow-sm active:scale-95"
                  )}
                  style={{
                    backgroundColor: isSelected ? (section.accentColor || '#B5111B') : undefined,
                    borderColor: isSelected ? (section.accentColor || '#B5111B') : undefined,
                    color: isSelected ? '#FFFFFF' : undefined
                  }}
                >
                  <span>{section.label}</span>
                  {categoryCount > 0 && (
                    <span
                      className={cn(
                        "px-2 py-0.5 text-[11px] font-bold rounded-full transition-colors",
                        isSelected
                          ? "bg-white/25 text-white"
                          : "bg-slate-200 text-slate-800 border border-slate-300/80"
                      )}
                    >
                      {categoryCount}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {uniqueTemplates.length === 0 ? (
          <div className="p-8 text-center border border-dashed rounded-lg text-muted-foreground">
            No sections created yet. Create one to get started.
          </div>
        ) : activeSection ? (
          /* ACTIVE SECTION CONTENT CARD */
          <div className="bg-background rounded-xl border border-border p-4 md:p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
                  <div
                    className="w-4 h-4 rounded-full shadow-xs"
                    style={{ backgroundColor: activeSection.accentColor || '#B5111B' }}
                  />
                  {activeSection.label}
                </h3>
                {activeSection.description && (
                  <p className="text-sm text-muted-foreground mt-1">{activeSection.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEditSection(activeSection)} className="cursor-pointer">
                  <Pencil className="h-4 w-4 text-muted-foreground mr-1.5" />
                  Edit Section
                </Button>
                <Button variant="outline" size="sm" onClick={() => deleteTemplateSection(activeSection.id)} className="cursor-pointer">
                  <Trash2 className="h-4 w-4 text-red-500 mr-1.5" />
                  Delete Section
                </Button>
              </div>
            </div>

            {/* Category Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeSection.categories.map((category) => (
                <div key={category.id} className="relative flex flex-col h-full">
                  <Card className="hover:border-primary transition-colors h-full flex flex-col">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex justify-between items-start">
                        <div className="flex flex-col gap-1 cursor-pointer" onClick={() => window.location.href = `/section-maker/${activeSection.id}/categories/${category.id}`}>
                          <span className="hover:text-primary transition-colors">{category.label}</span>
                          {category.takesValues && (
                            <span className="w-fit text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                              Takes Data
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 cursor-pointer" onClick={(e) => openEditCategory(activeSection.id, category, e)}>
                            <Pencil className="h-3 w-3 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 cursor-pointer" onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteTemplateCategory(activeSection.id, category.id); }}>
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {category.description || "No description provided."}
                      </p>

                      {!category.takesValues && (
                        <div className="flex-1 flex flex-col gap-2">
                          {category.groups.map(group => (
                            <div key={group.id} className="flex items-center justify-between p-2 rounded-md border border-border hover:border-primary/50 bg-muted/20 cursor-pointer transition-colors" onClick={() => window.location.href = `/section-maker/${activeSection.id}/categories/${category.id}`}>
                              <span className="text-sm font-medium">{group.label}</span>
                              <div className="flex gap-1 shrink-0">
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-background cursor-pointer" onClick={(e) => openEditGroup(activeSection.id, category.id, group, e)}>
                                  <Pencil className="h-3 w-3 text-muted-foreground" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-background cursor-pointer" onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteTemplateGroup(activeSection.id, category.id, group.id); }}>
                                  <Trash2 className="h-3 w-3 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-sm">
                        {!category.takesValues ? (
                          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground p-0 h-auto cursor-pointer" onClick={(e) => {
                            e.preventDefault(); e.stopPropagation();
                            setNewGroup({ label: "", description: "", takesValues: false })
                            setEditingGroupId(null)
                            setTargetCategoryForGroup({ sectionId: activeSection.id, categoryId: category.id })
                            setIsGroupModalOpen(true)
                          }}>
                            <Plus className="h-3 w-3 mr-1" />
                            Add Sub-Category
                          </Button>
                        ) : (
                          <div />
                        )}
                        <Link href={`/section-maker/${activeSection.id}/categories/${category.id}`} className="text-primary font-semibold hover:underline">
                          Build Schema &rarr;
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}

              <Button
                variant="outline"
                className="h-auto min-h-[140px] flex flex-col items-center justify-center text-muted-foreground hover:text-foreground border-dashed cursor-pointer rounded-xl hover:border-primary transition-colors"
                onClick={() => {
                  setNewCategory({ sectionId: activeSection.id, label: "", description: "", takesValues: false })
                  setEditingCategoryId(null)
                  setIsCategoryModalOpen(true)
                }}
              >
                <Plus className="h-6 w-6 mb-2 text-[#B5111B]" />
                <span className="font-semibold text-foreground">Add Category</span>
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Edit/Create Section Modal */}
      <Modal isOpen={isSectionModalOpen} onClose={() => setIsSectionModalOpen(false)} title={editingSectionId ? "Edit Section Template" : "Add Section Template"}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Section Label</label>
            <input
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              value={newSection.label}
              onChange={e => setNewSection({ ...newSection, label: e.target.value })}
              placeholder="e.g. Accessibility & Transportation"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary h-20"
              value={newSection.description}
              onChange={e => setNewSection({ ...newSection, description: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Accent Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                className="w-12 h-9 rounded-md border border-input cursor-pointer"
                value={newSection.accentColor}
                onChange={e => setNewSection({ ...newSection, accentColor: e.target.value })}
              />
              <input
                type="text"
                className="flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                value={newSection.accentColor}
                onChange={e => setNewSection({ ...newSection, accentColor: e.target.value })}
              />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsSectionModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveSection} className="bg-[#B5111B] text-white hover:bg-[#9B0F17]">{editingSectionId ? "Save Changes" : "Create Section"}</Button>
          </div>
        </div>
      </Modal>

      {/* Edit/Create Category Modal */}
      <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title={editingCategoryId ? "Edit Category" : "Add Category"}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Category Label</label>
            <input
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              value={newCategory.label}
              onChange={e => setNewCategory({ ...newCategory, label: e.target.value })}
              placeholder="e.g. Accessibility & Transportation"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary h-20"
              value={newCategory.description}
              onChange={e => setNewCategory({ ...newCategory, description: e.target.value })}
            />
          </div>
          <div className="space-y-2 pt-2 border-t border-border mt-4">
            <label className="flex items-center gap-3 cursor-pointer p-3 bg-muted/20 border border-border rounded-md hover:bg-muted/40 transition-colors">
              <input
                type="checkbox"
                className="w-5 h-5 accent-primary"
                checked={newCategory.takesValues}
                onChange={e => setNewCategory({ ...newCategory, takesValues: e.target.checked })}
              />
              <div className="flex flex-col">
                <span className="font-medium text-foreground">Takes Values?</span>
                <span className="text-xs text-muted-foreground">If checked, this category acts as a table where you define columns. If unchecked, it acts as a folder to hold sub-categories.</span>
              </div>
            </label>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveCategory} className="bg-[#B5111B] text-white hover:bg-[#9B0F17]">{editingCategoryId ? "Save Changes" : "Create Category"}</Button>
          </div>
        </div>
      </Modal>

      {/* Sub-Category Modal */}
      <Modal isOpen={isGroupModalOpen} onClose={() => setIsGroupModalOpen(false)} title={editingGroupId ? "Edit Sub-Category" : "Add Sub-Category"}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Name</label>
            <input
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
              value={newGroup.label}
              onChange={e => setNewGroup({ ...newGroup, label: e.target.value })}
              placeholder="e.g. Major Routes"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm h-20"
              value={newGroup.description}
              onChange={e => setNewGroup({ ...newGroup, description: e.target.value })}
            />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsGroupModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveGroup} className="bg-[#B5111B] text-white hover:bg-[#9B0F17]">{editingGroupId ? "Save Changes" : "Create Sub-Category"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
