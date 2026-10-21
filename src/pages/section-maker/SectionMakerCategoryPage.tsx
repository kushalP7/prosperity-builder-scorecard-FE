"use client"

import * as React from "react"
import { useAppStore } from "@/store"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { Link, useParams } from "@/lib/router-compat"
import { ArrowLeft, Plus, Settings2, Trash2, Pencil, CheckCircle2 } from "lucide-react"
import { sortColumns } from "@/lib/scorecardOrder"

export default function SectionMakerCategoryPage() {
  const routeParams = useParams<{ sectionId: string; categoryId: string }>()
  const sectionId = routeParams.sectionId || ""
  const categoryId = routeParams.categoryId || ""
  const { templates, fetchTemplates, isLoadingTemplates, createTemplateGroup, updateTemplateGroup, deleteTemplateGroup, createTemplateColumn, updateTemplateColumn, deleteTemplateColumn } = useAppStore()

  React.useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const [isGroupModalOpen, setIsGroupModalOpen] = React.useState(false)
  const [isColumnModalOpen, setIsColumnModalOpen] = React.useState(false)

  const [editingGroupId, setEditingGroupId] = React.useState<string | null>(null)
  const [editingColumnId, setEditingColumnId] = React.useState<string | null>(null)

  const [newGroup, setNewGroup] = React.useState({ label: "", description: "" })
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
  const category = section?.categories?.find(c => c.id === categoryId)

  const activeColumns = React.useMemo(() => {
    const raw = (section?.columns && section.columns.length > 0) ? section.columns : (category?.columns || [])
    return sortColumns(raw, (c: any) => c.name || '')
  }, [section?.columns, category?.columns])

  const availableColumns = React.useMemo(() => {
    return activeColumns.filter((c: any) => c.id !== editingColumnId && c.type === 'number')
  }, [activeColumns, editingColumnId])

  const formulaTokens = React.useMemo(() => {
    const list: Array<{ name: string; token: string }> = [
      { name: "Weight (1-4)", token: "Weight" },
      { name: "Value", token: "Value" },
      { name: "Y(1)/N(0)", token: "Y_1__N_0_" },
      { name: "Data", token: "Data" },
      { name: "Highest Score", token: "Highest_Score" },
    ];
    const seen = new Set(list.map(l => l.token.toLowerCase()));

    activeColumns.filter((c: any) => c.id !== editingColumnId).forEach((c: any) => {
      if (c && c.name) {
        const token = c.name.replace(/[^a-zA-Z0-9_]/g, '_');
        if (!seen.has(token.toLowerCase()) && !seen.has(c.name.toLowerCase())) {
          seen.add(token.toLowerCase());
          list.push({ name: c.name, token });
        }
      }
    });

    return list;
  }, [activeColumns, editingColumnId]);

  const validationResult = React.useMemo(() => {
    const rawExpr = (newColumn.formulaExpression || "").trim();
    if (!rawExpr) {
      return { status: 'idle', message: 'Enter a formula expression or click the column tokens above.' };
    }

    const ctx: Record<string, number> = {
      data: 10,
      Data: 10,
      Value: 2,
      value: 2,
      Weight: 3,
      weight: 3,
      Weight_1_4_: 3,
      Weight__1_4_: 3,
      Y_1__N_0_: 1,
      YN: 1,
      Highest_Score: 8,
      Highest: 8,
    };

    (formulaTokens || []).forEach(col => {
      if (ctx[col.token] === undefined) {
        ctx[col.token] = 2;
      }
    });

    try {
      let cleanExpr = rawExpr
        .replace(/Y\s*\(\s*1\s*\)\s*\/\s*N\s*\(\s*0\s*\)/gi, 'Y_1__N_0_')
        .replace(/Weight\s*\(\s*1\s*-\s*4\s*\)/gi, 'Weight_1_4_')
        .replace(/Highest\s+Score/gi, 'Highest_Score');

      const keys = ['IF', 'MIN', 'MAX', 'ROUND', ...Object.keys(ctx)];
      const values = [
        (c: any, a: any, b: any) => (c ? a : b),
        Math.min,
        Math.max,
        Math.round,
        ...Object.values(ctx),
      ];

      const fn = new Function(...keys, `return Number(${cleanExpr});`);
      const result = fn(...values);

      if (typeof result !== 'number' || isNaN(result)) {
        return { status: 'error', message: 'Result is NaN. Check operators and column variables.' };
      }
      if (!isFinite(result)) {
        return { status: 'error', message: 'Result is Infinite (division by zero).' };
      }
      return {
        status: 'valid',
        result: Number(result.toFixed(2)),
        message: 'Valid formula'
      };
    } catch (err: any) {
      return {
        status: 'error',
        message: err?.message || 'Syntax error in formula expression.'
      };
    }
  }, [newColumn.formulaExpression, formulaTokens]);

  if (isLoadingTemplates && (!section || !category)) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!section || !category) {
    return (
      <div className="p-8 max-w-md mx-auto text-center space-y-4">
        <h2 className="text-xl font-bold">Category Not Found</h2>
        <p className="text-sm text-muted-foreground">
          The requested section or category could not be found.
        </p>
        <Link href="/section-maker">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Section Maker
          </Button>
        </Link>
      </div>
    )
  }

  const handleSaveGroup = () => {
    if (!newGroup.label) return;
    if (editingGroupId) {
      updateTemplateGroup(sectionId, categoryId, editingGroupId, newGroup)
    } else {
      createTemplateGroup(sectionId, categoryId, newGroup)
    }
    setIsGroupModalOpen(false)
    setEditingGroupId(null)
    setNewGroup({ label: "", description: "" })
  }

  const openEditGroup = (group: any) => {
    setNewGroup({ label: group.label, description: group.description || "" })
    setEditingGroupId(group.id)
    setIsGroupModalOpen(true)
  }

  const handleSaveColumn = () => {
    if (!newColumn.name) return;
    if (newColumn.type === 'formula' && validationResult.status === 'error') {
      return;
    }
    // Clean up options if not a select
    const colToSave = {
      ...newColumn,
      isReadOnly: newColumn.type === 'formula' ? true : newColumn.isReadOnly,
    };
    if (colToSave.type !== 'select') {
      delete colToSave.options;
    }
    if (colToSave.type !== 'number') {
      delete colToSave.validation;
    }

    if (editingColumnId) {
      // Check if column name changed and cascade rename in any formula columns in this section/category
      const cols = (section?.columns && section.columns.length > 0) ? section.columns : (category?.columns || []);
      const oldCol = cols.find((c: any) => c.id === editingColumnId);
      if (oldCol && oldCol.name && oldCol.name !== colToSave.name) {
        const oldSafeName = oldCol.name.replace(/[^a-zA-Z0-9_]/g, '_');
        const newSafeName = colToSave.name.replace(/[^a-zA-Z0-9_]/g, '_');
        if (oldSafeName !== newSafeName) {
          const escapedOld = oldSafeName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`\\b${escapedOld}\\b`, 'g');

          cols.forEach((c: any) => {
            if (c.id !== editingColumnId && c.type === 'formula' && c.formulaExpression && regex.test(c.formulaExpression)) {
              const updatedExpr = c.formulaExpression.replace(regex, newSafeName);
              updateTemplateColumn(sectionId, categoryId, targetGroupId, c.id, {
                ...c,
                formulaExpression: updatedExpr,
              });
            }
          });
        }
      }

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
              <h2 className="text-2xl font-bold tracking-tight">
                {section?.label ? `${section.label} - Table Schema (Columns)` : category.label}
              </h2>
            </div>
            <p className="text-muted-foreground mt-1">
              Define horizontal columns for this section's category tables.
            </p>
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
              <p className="text-sm text-muted-foreground mt-0.5">Shared horizontal columns for all categories in this section.</p>
            </div>
          </div>
          {renderColumnList(activeColumns, null)}
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
              onChange={e => setNewColumn({ ...newColumn, name: e.target.value })}
              placeholder="e.g. Traffic Volume"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Data Type</label>
              <select
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                value={newColumn.type}
                onChange={e => setNewColumn({ ...newColumn, type: e.target.value as any })}
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
                onChange={e => setNewColumn({ ...newColumn, unit: e.target.value })}
                placeholder="e.g. %, count, miles"
              />
            </div>
          </div>
          {newColumn.type === 'formula' && (
            <div className="space-y-2.5 p-3.5 bg-muted/10 rounded-md border border-slate-400">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-foreground">Calculation Formula</span>
                  <p className="text-xs text-muted-foreground">
                    Custom formula expression used to calculate this column.
                  </p>
                </div>
              </div>

              <div className="space-y-2 mt-2 pt-2 border-t border-border/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Custom Expression:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setNewColumn((prev: any) => ({ ...prev, formulaExpression: '' }))}
                      className="text-[11px] text-muted-foreground hover:text-red-500 px-2 py-0.5 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="cursor-pointer text-[11px] h-6 px-2"
                      onClick={() => {
                        setNewColumn((prev: any) => ({ ...prev, formulaExpression: 'Weight * Value' }));
                      }}
                    >
                      Reset to Default
                    </Button>
                  </div>
                </div>

                <textarea
                  rows={3}
                  className="w-full min-h-[90px] rounded-md border border-input bg-background px-3 py-2 text-xs font-mono font-semibold shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary leading-relaxed resize-y"
                  value={newColumn.formulaExpression || ''}
                  onChange={e => setNewColumn({ ...newColumn, formulaExpression: e.target.value })}
                  placeholder="e.g. Weight * Value"
                />

                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-muted-foreground">Available Column Tokens:</span>
                    <div className="flex items-center gap-1">
                      {['+', '-', '*', '/', '(', ')'].map(op => (
                        <button
                          key={op}
                          type="button"
                          onClick={() => {
                            const cur = (newColumn.formulaExpression || '').trim();
                            setNewColumn({ ...newColumn, formulaExpression: cur ? `${cur} ${op} ` : `${op} ` });
                          }}
                          className="px-2 py-0.5 text-xs font-bold rounded bg-muted/60 hover:bg-muted border border-border/80 text-foreground transition-all cursor-pointer shadow-2xs"
                        >
                          {op}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {formulaTokens.map(col => (
                      <button
                        key={col.token}
                        type="button"
                        onClick={() => {
                          const cur = (newColumn.formulaExpression || '').trim();
                          const needsSpace = cur.length > 0 && !cur.endsWith(' ') && !['(', '*', '/', '+', '-'].includes(cur.slice(-1));
                          setNewColumn({ ...newColumn, formulaExpression: `${cur}${needsSpace ? ' ' : ''}${col.token}` });
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-background border border-slate-300 hover:border-slate-500 hover:bg-muted/30 transition-all cursor-pointer shadow-2xs"
                        title={`Click to insert: ${col.token}`}
                      >
                        <span className="text-[#B5111B] font-semibold font-mono">{col.token}</span>
                        {col.name !== col.token && <span className="text-[10px] text-muted-foreground">({col.name})</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Validation Status */}
                <div className="text-xs pt-1">
                  {validationResult.status === 'valid' && (
                    <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/20 px-2.5 py-1.5 rounded border border-emerald-200/50">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="font-medium">Valid Formula</span>
                    </div>
                  )}
                  {validationResult.status === 'error' && (
                    <div className="text-rose-600 bg-rose-50/60 dark:bg-rose-950/20 px-2.5 py-1.5 rounded border border-rose-200/50">
                      <span className="font-medium">{validationResult.message}</span>
                    </div>
                  )}
                  {validationResult.status === 'idle' && (
                    <p className="text-muted-foreground text-[11px]">
                      Reference other columns by clicking the column buttons or operators above.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {newColumn.type === 'select' && (
            <div className="space-y-2 p-3 bg-muted/10 rounded-md border border-border">
              <label className="text-sm font-medium text-foreground flex justify-between items-center">
                Select Options
                <Button variant="outline" size="sm" onClick={() => setNewColumn({ ...newColumn, options: [...newColumn.options, { label: '', value: '' }] })}>Add Option</Button>
              </label>
              <div className="space-y-2">
                {newColumn.options.map((opt: any, idx: number) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input className="flex-1 rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-sm" placeholder="Label" value={opt.label} onChange={e => { const newOpts = [...newColumn.options]; newOpts[idx].label = e.target.value; setNewColumn({ ...newColumn, options: newOpts }) }} />
                    <input className="flex-1 rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-sm" placeholder="Value" value={opt.value} onChange={e => { const newOpts = [...newColumn.options]; newOpts[idx].value = e.target.value; setNewColumn({ ...newColumn, options: newOpts }) }} />
                    <Button variant="ghost" size="sm" className="px-2 text-red-500" onClick={() => { const newOpts = [...newColumn.options]; newOpts.splice(idx, 1); setNewColumn({ ...newColumn, options: newOpts }) }}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {newColumn.type === 'number' && (
            <div className="grid grid-cols-2 gap-4 p-3 bg-muted/10 rounded-md border border-border">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Min Value (Optional)</label>
                <input type="number" className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm" value={newColumn.validation.min === null ? '' : newColumn.validation.min} onChange={e => setNewColumn({ ...newColumn, validation: { ...newColumn.validation, min: e.target.value ? Number(e.target.value) : null } })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Max Value (Optional)</label>
                <input type="number" className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm" value={newColumn.validation.max === null ? '' : newColumn.validation.max} onChange={e => setNewColumn({ ...newColumn, validation: { ...newColumn.validation, max: e.target.value ? Number(e.target.value) : null } })} />
              </div>
            </div>
          )}

          <div className="space-y-2 p-3 bg-muted/10 rounded-md border border-border">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-primary" checked={newColumn.isReadOnly} onChange={e => setNewColumn({ ...newColumn, isReadOnly: e.target.checked })} />
              <span className="text-sm font-medium">Is Read-Only? (User cannot manually enter data)</span>
            </label>
            <p className="text-xs text-muted-foreground mt-1">
              Note: Scoring logic and threshold rules are managed directly on each Sub-Category (Row).
            </p>
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
