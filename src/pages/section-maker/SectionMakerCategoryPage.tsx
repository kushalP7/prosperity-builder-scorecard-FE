"use client"

import * as React from "react"
import { useAppStore } from "@/store"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { Link, useParams } from "@/lib/router-compat"
import { ArrowLeft, Plus, Settings2, Trash2, Pencil } from "lucide-react"

export default function SectionMakerCategoryPage() {
  const routeParams = useParams<{ sectionId: string; categoryId: string }>()
  const sectionId = routeParams.sectionId || ""
  const categoryId = routeParams.categoryId || ""
  const { templates, createTemplateGroup, updateTemplateGroup, deleteTemplateGroup, createTemplateColumn, updateTemplateColumn, deleteTemplateColumn } = useAppStore()
  
  const [isGroupModalOpen, setIsGroupModalOpen] = React.useState(false)
  const [isColumnModalOpen, setIsColumnModalOpen] = React.useState(false)
  
  const [editingGroupId, setEditingGroupId] = React.useState<string | null>(null)
  const [editingColumnId, setEditingColumnId] = React.useState<string | null>(null)
  
  const [newGroup, setNewGroup] = React.useState({ label: "", description: "", takesValues: false })
  const [targetGroupId, setTargetGroupId] = React.useState<string | null>(null)
  
  const [newColumn, setNewColumn] = React.useState<any>({ 
    name: "", 
    type: "number",
    unit: "",
    weight: 1,
    isBonus: false,
    formulaExpression: "",
    isReadOnly: false,
    options: [],
    validation: { min: null, max: null },
    conditionalRules: []
  })

  const section = templates.find(s => s.id === sectionId)
  const category = section?.categories.find(c => c.id === categoryId)

  if (!section || !category) return <div className="p-8">Not found</div>

  const handleSaveGroup = () => {
    if (!newGroup.label) return;
    if (editingGroupId) {
      updateTemplateGroup(sectionId, categoryId, editingGroupId, newGroup)
    } else {
      createTemplateGroup(sectionId, categoryId, newGroup)
    }
    setIsGroupModalOpen(false)
    setEditingGroupId(null)
    setNewGroup({ label: "", description: "", takesValues: false })
  }

  const openEditGroup = (group: any) => {
    setNewGroup({ label: group.label, description: group.description || "", takesValues: group.takesValues })
    setEditingGroupId(group.id)
    setIsGroupModalOpen(true)
  }

  const handleSaveColumn = () => {
    if (!newColumn.name) return;
    // Clean up options if not a select
    const colToSave = { ...newColumn };
    if (colToSave.type !== 'select') {
      delete colToSave.options;
    }
    if (colToSave.type !== 'number') {
      delete colToSave.validation;
    }
    
    if (editingColumnId) {
      updateTemplateColumn(sectionId, categoryId, targetGroupId, editingColumnId, colToSave as any)
    } else {
      createTemplateColumn(sectionId, categoryId, targetGroupId, {
        ...colToSave,
        scoringRule: { kind: 'manual', maxPoints: 10 }
      } as any)
    }
    setIsColumnModalOpen(false)
    setEditingColumnId(null)
    setTargetGroupId(null)
    setNewColumn({ name: "", type: "number", unit: "", weight: 1, isBonus: false, formulaExpression: "", isReadOnly: false, options: [], validation: { min: null, max: null }, conditionalRules: [] })
  }

  const openEditColumn = (groupId: string | null, col: any) => {
    setNewColumn({ 
      name: col.name, 
      type: col.type, 
      unit: col.unit || "", 
      weight: col.weight || 1, 
      isBonus: col.isBonus || false,
      formulaExpression: col.formulaExpression || "",
      isReadOnly: col.isReadOnly || false,
      options: col.options || [],
      validation: col.validation || { min: null, max: null },
      conditionalRules: col.conditionalRules || []
    })
    setEditingColumnId(col.id)
    setTargetGroupId(groupId)
    setIsColumnModalOpen(true)
  }

  const renderColumnList = (columns: any[], groupId: string | null) => {
    return (
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 font-semibold text-muted-foreground">Column Name</th>
              <th className="px-4 py-3 font-semibold text-muted-foreground">Type</th>
              <th className="px-4 py-3 font-semibold text-muted-foreground">Unit</th>
              <th className="px-4 py-3 font-semibold text-muted-foreground">Weight</th>
              <th className="px-4 py-3 font-semibold text-muted-foreground w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {columns.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No columns defined yet. Click "Add Column" to build the schema.
                </td>
              </tr>
            )}
            {columns.map(col => (
              <tr key={col.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-medium text-foreground">
                  {col.name}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{col.type}</td>
                <td className="px-4 py-3 text-muted-foreground">{col.unit || '-'}</td>
                <td className="px-4 py-3 text-muted-foreground">{col.weight}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditColumn(groupId, col)}>
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => deleteTemplateColumn(sectionId, categoryId, groupId, col.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/section-maker" className="text-sm text-muted-foreground hover:text-primary flex items-center mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Section Maker
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight">{category.label}</h2>
              {category.takesValues && (
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider">
                  Takes Data (Table)
                </span>
              )}
            </div>
            <p className="text-muted-foreground mt-1">{category.description}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => {
              setNewColumn({ 
                name: "", 
                type: "number", 
                unit: "", 
                weight: 1, 
                isBonus: false, 
                formulaExpression: "",
                isReadOnly: false,
                options: [],
                validation: { min: null, max: null },
                conditionalRules: []
              })
              setEditingColumnId(null)
              setTargetGroupId(null)
              setIsColumnModalOpen(true)
            }}>
              <Settings2 className="h-4 w-4 mr-2" />
              Add Column
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div>
              <h3 className="text-lg font-semibold">Table Schema (Columns)</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Define horizontal columns for this category's table.</p>
            </div>
          </div>
          {renderColumnList(category.columns, null)}
        </div>
      </div>

      {/* Sub-Category Modal */}
      <Modal isOpen={isGroupModalOpen} onClose={() => setIsGroupModalOpen(false)} title={editingGroupId ? "Edit Sub-Category" : "Add Sub-Category"}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Name</label>
            <input 
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
              value={newGroup.label}
              onChange={e => setNewGroup({...newGroup, label: e.target.value})}
              placeholder="e.g. Major Routes"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea 
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm h-20"
              value={newGroup.description}
              onChange={e => setNewGroup({...newGroup, description: e.target.value})}
            />
          </div>
          <div className="space-y-2 pt-2 border-t border-border mt-4">
            <label className="flex items-center gap-3 cursor-pointer p-3 bg-muted/20 border border-border rounded-md hover:bg-muted/40 transition-colors">
              <input 
                type="checkbox" 
                className="w-5 h-5 accent-primary"
                checked={newGroup.takesValues}
                onChange={e => setNewGroup({...newGroup, takesValues: e.target.checked})}
              />
              <div className="flex flex-col">
                <span className="font-medium text-foreground">Takes Values?</span>
                <span className="text-xs text-muted-foreground">If checked, this sub-category will act as a table and you can define columns for it.</span>
              </div>
            </label>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsGroupModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveGroup}>{editingGroupId ? "Save Changes" : "Create Sub-Category"}</Button>
          </div>
        </div>
      </Modal>

      {/* Column Maker Modal */}
      <Modal isOpen={isColumnModalOpen} onClose={() => setIsColumnModalOpen(false)} title={editingColumnId ? "Edit Column" : "Column Maker"} className="max-w-4xl">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Column Name</label>
            <input 
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
              value={newColumn.name}
              onChange={e => setNewColumn({...newColumn, name: e.target.value})}
              placeholder="e.g. Traffic Volume"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Data Type</label>
              <select 
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                value={newColumn.type}
                onChange={e => setNewColumn({...newColumn, type: e.target.value as any})}
              >
                <option value="number">Numeric</option>
                <option value="boolean">Yes/No</option>
                <option value="text">Text</option>
                <option value="formula">Formula</option>
                <option value="select">Dropdown Select</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Unit</label>
              <input 
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                value={newColumn.unit}
                onChange={e => setNewColumn({...newColumn, unit: e.target.value})}
                placeholder="e.g. %, count, miles"
              />
            </div>
          </div>
          {newColumn.type === 'formula' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Formula Expression</label>
              <input 
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm font-mono text-xs"
                value={newColumn.formulaExpression}
                onChange={e => setNewColumn({...newColumn, formulaExpression: e.target.value})}
                placeholder="e.g. data * 1.5"
              />
              <p className="text-xs text-muted-foreground">Reference other columns by exact name (non-alphanumeric characters replaced with underscores). Use <code>data</code> for the base Data value.</p>
            </div>
          )}
          
          {newColumn.type === 'select' && (
            <div className="space-y-2 p-3 bg-muted/10 rounded-md border border-border">
              <label className="text-sm font-medium text-foreground flex justify-between items-center">
                Select Options
                <Button variant="outline" size="sm" onClick={() => setNewColumn({...newColumn, options: [...newColumn.options, { label: '', value: '' }]})}>Add Option</Button>
              </label>
              <div className="space-y-2">
                {newColumn.options.map((opt: any, idx: number) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input className="flex-1 rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-sm" placeholder="Label" value={opt.label} onChange={e => { const newOpts = [...newColumn.options]; newOpts[idx].label = e.target.value; setNewColumn({...newColumn, options: newOpts}) }} />
                    <input className="flex-1 rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-sm" placeholder="Value" value={opt.value} onChange={e => { const newOpts = [...newColumn.options]; newOpts[idx].value = e.target.value; setNewColumn({...newColumn, options: newOpts}) }} />
                    <Button variant="ghost" size="sm" className="px-2 text-red-500" onClick={() => { const newOpts = [...newColumn.options]; newOpts.splice(idx, 1); setNewColumn({...newColumn, options: newOpts}) }}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {newColumn.type === 'number' && (
            <div className="grid grid-cols-2 gap-4 p-3 bg-muted/10 rounded-md border border-border">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Min Value (Optional)</label>
                <input type="number" className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm" value={newColumn.validation.min === null ? '' : newColumn.validation.min} onChange={e => setNewColumn({...newColumn, validation: {...newColumn.validation, min: e.target.value ? Number(e.target.value) : null}})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Max Value (Optional)</label>
                <input type="number" className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm" value={newColumn.validation.max === null ? '' : newColumn.validation.max} onChange={e => setNewColumn({...newColumn, validation: {...newColumn.validation, max: e.target.value ? Number(e.target.value) : null}})} />
              </div>
            </div>
          )}
          
          <div className="space-y-2 p-3 bg-muted/10 rounded-md border border-border">
            <label className="flex items-center gap-2 cursor-pointer mb-2">
              <input type="checkbox" className="w-4 h-4 accent-primary" checked={newColumn.isReadOnly} onChange={e => setNewColumn({...newColumn, isReadOnly: e.target.checked})} />
              <span className="text-sm font-medium">Is Read-Only? (User cannot manually enter data)</span>
            </label>
            
            <label className="text-sm font-medium text-foreground flex justify-between items-center mt-4">
              Conditional Assignment Rules
              <Button variant="outline" size="sm" onClick={() => setNewColumn({...newColumn, conditionalRules: [...newColumn.conditionalRules, { id: Math.random().toString(), ifColumnId: '__base__', operator: 'equals', conditionValue: '', resultValue: '' }]})}>Add Rule</Button>
            </label>
            <p className="text-xs text-muted-foreground mb-2">Automatically set this column's value based on another column.</p>
            <div className="space-y-2">
              {newColumn.conditionalRules.map((rule: any, idx: number) => (
                <div key={idx} className="flex gap-2 items-center flex-wrap bg-background p-2 rounded-md border border-border">
                  <span className="text-xs">If</span>
                  <select className="rounded border px-1 py-1 text-xs" value={rule.ifColumnId} onChange={e => { const r = [...newColumn.conditionalRules]; r[idx].ifColumnId = e.target.value; setNewColumn({...newColumn, conditionalRules: r}) }}>
                    <option value="__base__">Data (Base)</option>
                    {category.columns.filter(c => c.id !== editingColumnId).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <select className="rounded border px-1 py-1 text-xs" value={rule.operator} onChange={e => { const r = [...newColumn.conditionalRules]; r[idx].operator = e.target.value; setNewColumn({...newColumn, conditionalRules: r}) }}>
                    <option value="equals">=</option>
                    <option value="not_equals">!=</option>
                    <option value="greater_than">&gt;</option>
                    <option value="greater_than_or_equals">&gt;=</option>
                    <option value="less_than">&lt;</option>
                    <option value="less_than_or_equals">&lt;=</option>
                    <option value="between">Between</option>
                  </select>
                  
                  {rule.operator === 'between' ? (
                    <div className="flex items-center gap-1">
                      <input className="w-16 rounded border px-1 py-1 text-xs" placeholder="Min" value={rule.conditionValue?.[0] ?? ''} onChange={e => { const r = [...newColumn.conditionalRules]; r[idx].conditionValue = [Number(e.target.value), r[idx].conditionValue?.[1] || 0]; setNewColumn({...newColumn, conditionalRules: r}) }} />
                      <span>-</span>
                      <input className="w-16 rounded border px-1 py-1 text-xs" placeholder="Max" value={rule.conditionValue?.[1] ?? ''} onChange={e => { const r = [...newColumn.conditionalRules]; r[idx].conditionValue = [r[idx].conditionValue?.[0] || 0, Number(e.target.value)]; setNewColumn({...newColumn, conditionalRules: r}) }} />
                    </div>
                  ) : (
                    <input className="w-20 rounded border px-1 py-1 text-xs" placeholder="Value" value={rule.conditionValue ?? ''} onChange={e => { const r = [...newColumn.conditionalRules]; r[idx].conditionValue = e.target.value; setNewColumn({...newColumn, conditionalRules: r}) }} />
                  )}
                  
                  <span className="text-xs">then set to</span>
                  <input className="w-20 rounded border px-1 py-1 text-xs" placeholder="Result" value={rule.resultValue} onChange={e => { const r = [...newColumn.conditionalRules]; r[idx].resultValue = e.target.value; setNewColumn({...newColumn, conditionalRules: r}) }} />
                  
                  <Button variant="ghost" size="sm" className="px-2 py-0 h-6 text-red-500 ml-auto" onClick={() => { const r = [...newColumn.conditionalRules]; r.splice(idx, 1); setNewColumn({...newColumn, conditionalRules: r}) }}><Trash2 className="h-3 w-3" /></Button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsColumnModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveColumn}>{editingColumnId ? "Save Changes" : "Create Column"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
