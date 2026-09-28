"use client"

import * as React from "react"
import { useParams } from "@/lib/router-compat"
import { useAppStore } from "@/store"
import {
  FileSpreadsheet,
  ChevronRight,
  ChevronsUpDown,
  Bus,
  Palette,
  ShieldCheck,
  Activity,
  Building2,
  FolderKanban,
  ArrowLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const getSectionIcon = (label: string, iconName?: string) => {
  const l = label.toLowerCase();
  if (l.includes('transport') || l.includes('access')) return Bus;
  if (l.includes('art') || l.includes('culture')) return Palette;
  if (l.includes('crime') || l.includes('safety') || l.includes('public')) return ShieldCheck;
  if (l.includes('health')) return Activity;
  if (l.includes('housing') || l.includes('land')) return Building2;
  return FolderKanban;
}

export default function ProjectDataPage() {
  const routeParams = useParams<{ id: string }>()
  const id = routeParams.id || ""
  const { projects, updateProjectData } = useAppStore()

  const project = projects.find(p => p.id === id)
  const [selectedSectionId, setSelectedSectionId] = React.useState<string | null>(null)
  const [viewMode, setViewMode] = React.useState<'summary' | 'detailed'>('summary')
  const [collapsedCategories, setCollapsedCategories] = React.useState<Record<string, boolean>>({})
  const [isAllCollapsed, setIsAllCollapsed] = React.useState(true)

  if (!project) return <div>Project not found</div>

  const activeSectionId = selectedSectionId && project.assignedSections.some(s => s.id === selectedSectionId)
    ? selectedSectionId
    : (project.assignedSections[0]?.id || null)

  const activeSection = project.assignedSections.find(s => s.id === activeSectionId)

  const expandableCategories = React.useMemo(() => {
    if (!activeSection) return [];
    return activeSection.categories.filter(c => c.groups.length > 0);
  }, [activeSection]);

  const isCategoryCollapsed = (catId: string) => {
    return collapsedCategories[catId] !== undefined ? collapsedCategories[catId] : true
  }

  // Derived state: check if any expandable category in the activeSection is currently expanded
  const hasAnyCategoryExpanded = React.useMemo(() => {
    if (expandableCategories.length === 0) return false;
    return expandableCategories.some(cat => !isCategoryCollapsed(cat.id));
  }, [expandableCategories, collapsedCategories]);

  const toggleCategoryCollapse = (catId: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [catId]: !isCategoryCollapsed(catId)
    }))
  }

  const toggleAllCategories = () => {
    if (!project || !activeSection) return;
    // If any expandable categories are currently open, collapse them all (target = true).
    // If all are closed, expand them all (target = false).
    const targetCollapsedState = hasAnyCategoryExpanded;

    const newCollapsedMap: Record<string, boolean> = { ...collapsedCategories };
    expandableCategories.forEach(cat => {
      newCollapsedMap[cat.id] = targetCollapsedState;
    });
    setCollapsedCategories(newCollapsedMap);
  }

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden">
      {/* Main Data Entry Area */}
      <div className="flex-1 flex flex-col min-h-0 bg-transparent space-y-3">
        {project.assignedSections.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-muted-foreground p-12 text-center space-y-4 bg-background rounded-xl border border-border shadow-sm">
            <FileSpreadsheet className="h-12 w-12 opacity-20" />
            <div>
              <h3 className="font-medium text-foreground text-lg">No Sections Assigned</h3>
              <p className="text-sm mt-1 max-w-md">Go back to the project dashboard and assign some sections to start entering data.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full min-h-0 space-y-3">
            {/* STICKY TOP TAB & ACTION HEADER (Fixed at Top, Does NOT Scroll Away) */}
            <div className="shrink-0 space-y-2 bg-[#F8F9FA] pb-1 pt-0.5 sticky top-0 z-30">
              {/* High-Contrast Segmented Capsule Section Tabs Track */}
              <div className="bg-slate-200/90 p-2 rounded-2xl border border-slate-300/80 shadow-inner flex flex-wrap items-center gap-1.5 max-w-full">
                {project.assignedSections.map((section) => {
                  const isSelected = activeSectionId === section.id
                  const categoryCount = section.categories.length;

                  return (
                    <button
                      key={section.id}
                      onClick={() => {
                        setSelectedSectionId(section.id)
                        setViewMode('summary')
                      }}
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

              {/* Action Controls Row - Below Tab Line & Just Above Table */}
              <div className="flex items-center justify-end gap-2 pt-0.5 pb-0.5">
                {viewMode === 'detailed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode('summary')}
                    className="text-xs h-8 rounded-lg px-3.5 border-border shadow-sm bg-background hover:bg-muted/50 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                    Back to Summary
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleAllCategories}
                  className="text-xs h-8 rounded-lg px-3.5 border-border shadow-sm bg-background hover:bg-muted/50 cursor-pointer"
                >
                  <ChevronsUpDown className="w-3.5 h-3.5 mr-1.5" />
                  {hasAnyCategoryExpanded ? 'Collapse All' : 'Expand All'}
                </Button>
              </div>
            </div>

            {/* SCROLLABLE TABLE CARD BELOW (Takes all remaining height & scrolls internally) */}
            {activeSection && (
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden pb-1">
                {viewMode === 'summary' ? (
                  /* SECTION SUMMARY VIEW (Card with internal scroll) */
                  <div className="bg-background rounded-xl border border-slate-300/90 shadow-sm flex flex-col flex-1 h-full min-h-0 overflow-hidden">
                    <div className="overflow-auto flex-1 custom-scrollbar">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-[#E9ECEF] border-b-2 border-border sticky top-0 z-20 shadow-xs">
                        <tr>
                          <th className="px-4 py-3 font-bold text-foreground border-r border-border w-[50%]">Category</th>
                          <th className="px-4 py-3 font-bold text-foreground border-r border-border w-[25%] text-center">Data</th>
                          <th className="px-4 py-3 font-bold text-foreground w-[25%]">Source</th>
                        </tr>
                      </thead>
                      <tbody>
                        <React.Fragment key={activeSection.id}>
                          {/* Section Header Row */}
                          <tr
                            className="border-b border-border cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setViewMode('detailed')}
                          >
                            <td
                              colSpan={3}
                              className="px-4 py-3 font-bold text-white text-base relative"
                              style={{ backgroundColor: activeSection.accentColor || '#B5111B' }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                  {React.createElement(getSectionIcon(activeSection.label, activeSection.icon), { className: "h-5 w-5" })}
                                  <span>{activeSection.label}</span>
                                </div>
                                <span className="text-xs opacity-90 font-normal hover:underline flex items-center gap-1">
                                  Click to view custom columns &rarr;
                                </span>
                              </div>
                            </td>
                          </tr>

                          {/* Categories and Subcategories */}
                          {activeSection.categories.length === 0 && (
                            <tr>
                              <td colSpan={3} className="px-4 py-4 text-center text-muted-foreground bg-muted/10">
                                No categories defined in this section.
                              </td>
                            </tr>
                          )}
                          {activeSection.categories.map(category => {
                            const isSingleRow = category.groups.length === 0;

                            const renderRow = (nodeId: string, label: string, indent: number, isBold: boolean) => {
                              const groupData = project.data?.[nodeId] || {}
                              const baseRecord = groupData['__base__'] || { value: '', source: '' }

                              const handleBaseChange = (field: 'value' | 'source', val: any) => {
                                let finalVal = val;
                                if (field === 'value') finalVal = val === '' ? null : Number(val);
                                updateProjectData(project.id, nodeId, '__base__', {
                                  ...baseRecord,
                                  [field]: finalVal
                                })
                              }

                              return (
                                <tr key={nodeId} className="hover:bg-muted/30 border-b border-border transition-colors">
                                  <td className={`px-4 py-2 border-r border-border align-middle ${indent === 1 ? 'pl-8' : 'pl-12'} ${isBold ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                                    {label}
                                  </td>
                                  <td className="px-1 py-1 border-r border-border align-middle bg-blue-50/20 hover:bg-blue-50/40">
                                    <input
                                      type="number"
                                      className="w-full h-full min-h-[32px] bg-transparent px-2 text-center text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary transition-colors border-0"
                                      value={baseRecord.value === null ? '' : String(baseRecord.value)}
                                      onChange={e => handleBaseChange('value', e.target.value)}
                                    />
                                  </td>
                                  <td className="px-1 py-1 align-middle bg-blue-50/20 hover:bg-blue-50/40">
                                    <input
                                      type="text"
                                      className="w-full h-full min-h-[32px] bg-transparent px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary transition-colors border-0"
                                      value={baseRecord.source || ''}
                                      onChange={e => handleBaseChange('source', e.target.value)}
                                      placeholder="Source..."
                                    />
                                  </td>
                                </tr>
                              )
                            }

                            return (
                              <React.Fragment key={category.id}>
                                {isSingleRow ? (
                                  /* Category acts as single data row */
                                  renderRow(category.id, category.label, 1, true)
                                ) : (
                                  /* Category is header, groups are rows */
                                  <React.Fragment>
                                    <tr
                                      className="border-b border-border bg-muted/5 cursor-pointer hover:bg-muted/10 transition-colors"
                                      onClick={() => toggleCategoryCollapse(category.id)}
                                    >
                                      <td colSpan={3} className="px-4 py-2 pl-8 font-semibold text-foreground border-r border-border">
                                        <div className="flex items-center gap-2">
                                          <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isCategoryCollapsed(category.id) ? '' : 'rotate-90'}`} />
                                          {category.label}
                                        </div>
                                      </td>
                                    </tr>
                                    {!isCategoryCollapsed(category.id) && category.groups.map(group => renderRow(group.id, group.label, 2, false))}
                                  </React.Fragment>
                                )}
                              </React.Fragment>
                            )
                          })}

                          {/* Section Total Row (Sticky at bottom of card scroll) */}
                          <tr className="bg-slate-100 border-t-2 border-slate-300 sticky bottom-0 z-20 shadow-md">
                            <td className="px-4 py-3 font-bold text-slate-700 text-right border-r border-slate-300 pr-8 uppercase tracking-wider text-xs bg-slate-100">
                              TOTAL
                            </td>
                            <td className="px-2 py-3 font-black text-red-600 text-center border-r border-slate-300 bg-blue-50/90 text-base">
                              {activeSection.categories.reduce((acc, category) => {
                                const nodes = category.groups.length > 0 ? category.groups : [category];
                                return acc + nodes.reduce((sum, node) => {
                                  const val = project.data?.[node.id]?.['__base__']?.value;
                                  return sum + (val !== undefined && val !== null && val !== '' ? Number(val) : 0);
                                }, 0);
                              }, 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                            </td>
                            <td className="px-4 py-3 bg-slate-100"></td>
                          </tr>
                        </React.Fragment>
                      </tbody>
                    </table>
                  </div>
                </div>
                ) : (
                  /* DETAILED SECTION VIEW (CUSTOM COLUMNS) */
                  <div className="space-y-6">
                    {/* Section Categories */}
                    <div className="space-y-8">
                      {activeSection.categories.length === 0 && (
                        <div className="text-center text-muted-foreground p-8 bg-background rounded-lg border border-border shadow-sm">
                          No categories defined for this section.
                        </div>
                      )}
                      {activeSection.categories.length > 0 && (
                        <div className="border border-slate-300 rounded-xl overflow-hidden bg-background shadow-sm flex flex-col flex-1 h-full min-h-0">
                          <div className="overflow-auto flex-1 custom-scrollbar">
                            <table className="w-full text-left text-sm">
                              <thead className="border-b border-border sticky top-0 z-20 shadow-xs">
                              <tr>
                                <th
                                  className="px-4 py-3 font-bold text-white min-w-[200px]"
                                  style={{ backgroundColor: activeSection.accentColor || '#B5111B' }}
                                >
                                  #
                                </th>
                                <th
                                  className="px-2 py-3 font-bold text-white text-center w-28 border-l border-white/20"
                                  style={{ backgroundColor: activeSection.accentColor || '#B5111B' }}
                                >
                                  Data
                                </th>
                                {activeSection.categories[0].columns.map(col => (
                                  <th
                                    key={col.id}
                                    className="px-2 py-3 font-bold text-white text-center border-l border-white/20"
                                    style={{ backgroundColor: activeSection.accentColor || '#B5111B' }}
                                  >
                                    {col.name}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {activeSection.categories.map(category => (
                                <React.Fragment key={category.id}>
                                  {category.groups.length > 0 && (
                                    <tr
                                      className="bg-muted/10 border-b border-border cursor-pointer hover:bg-muted/20 transition-colors"
                                      onClick={() => {
                                        setCollapsedCategories(prev => ({
                                          ...prev,
                                          [category.id]: !prev[category.id]
                                        }))
                                      }}
                                    >
                                      <td colSpan={category.columns.length + 2} className="px-4 py-3 font-semibold text-foreground">
                                        <div className="flex items-center gap-2">
                                          <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${collapsedCategories[category.id] ? '' : 'rotate-90'}`} />
                                          {category.label}
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                  {(!collapsedCategories[category.id] || category.groups.length === 0) && (category.groups.length > 0 ? category.groups : [category]).map((rowNode: any) => {
                                    const groupData = project.data?.[rowNode.id] || {}
                                    const baseRecord = groupData['__base__'] || { value: '', source: '' }

                                    const evaluateRules = (col: any, sourceData: Record<string, any>) => {
                                      if (!col.conditionalRules || col.conditionalRules.length === 0) return undefined;

                                      for (const rule of col.conditionalRules) {
                                        let sourceValue: any;
                                        if (rule.ifColumnId === '__base__') {
                                          sourceValue = sourceData['__base__']?.value;
                                        } else {
                                          sourceValue = sourceData[rule.ifColumnId]?.value;
                                        }

                                        if (sourceValue === null || sourceValue === undefined || sourceValue === '') continue;

                                        let matched = false;
                                        const condValue = rule.conditionValue;

                                        switch (rule.operator) {
                                          case 'equals': matched = String(sourceValue) === String(condValue); break;
                                          case 'not_equals': matched = String(sourceValue) !== String(condValue); break;
                                          case 'greater_than': matched = Number(sourceValue) > Number(condValue); break;
                                          case 'less_than': matched = Number(sourceValue) < Number(condValue); break;
                                          case 'greater_than_or_equals': matched = Number(sourceValue) >= Number(condValue); break;
                                          case 'less_than_or_equals': matched = Number(sourceValue) <= Number(condValue); break;
                                          case 'between':
                                            if (Array.isArray(condValue) && condValue.length === 2) {
                                              matched = Number(sourceValue) >= condValue[0] && Number(sourceValue) <= condValue[1];
                                            }
                                            break;
                                        }

                                        if (matched) {
                                          return rule.resultValue;
                                        }
                                      }
                                      return undefined;
                                    }

                                    // Build context for formula evaluation
                                    const rowContext: Record<string, number> = {};
                                    rowContext['Data_Summary'] = Number(baseRecord.value) || 0;
                                    rowContext['Data'] = Number(baseRecord.value) || 0;
                                    rowContext['data'] = Number(baseRecord.value) || 0;

                                    category.columns.forEach(c => {
                                      const cRecord = groupData[c.id] || {};
                                      let finalVal = cRecord.value;
                                      const ruleVal = evaluateRules(c, groupData);
                                      if (ruleVal !== undefined) finalVal = ruleVal;

                                      const safeName = c.name.replace(/[^a-zA-Z0-9_]/g, '_');
                                      if (c.type === 'boolean') {
                                        rowContext[safeName] = finalVal === true || finalVal === 'true' || finalVal === '1' || finalVal === 1 ? 1 : 0;
                                      } else {
                                        rowContext[safeName] = Number(finalVal) || 0;
                                      }
                                    });

                                    const evaluateFormula = (expr: string | undefined) => {
                                      if (!expr) return '-';
                                      try {
                                        const keys = Object.keys(rowContext);
                                        const values = Object.values(rowContext);
                                        const fn = new Function(...keys, `return Number(${expr});`);
                                        const result = fn(...values);
                                        return isNaN(result) || !isFinite(result) ? '-' : Number(result.toFixed(2));
                                      } catch (e) {
                                        return 'Err';
                                      }
                                    }

                                    const handleBaseChange = (val: string) => {
                                      updateProjectData(project.id, rowNode.id, '__base__', {
                                        ...baseRecord,
                                        value: val === '' ? null : Number(val)
                                      })
                                    }

                                    return (
                                      <tr key={rowNode.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-2 text-foreground font-medium border-r border-border align-middle">
                                          {rowNode.label}
                                        </td>
                                        <td className="px-1 py-1 align-middle border-r border-border">
                                          <input
                                            type="number"
                                            className="w-full h-full min-h-[40px] text-center bg-transparent focus-visible:bg-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary px-2 font-medium"
                                            value={baseRecord.value === null ? '' : String(baseRecord.value)}
                                            onChange={e => handleBaseChange(e.target.value)}
                                            placeholder="-"
                                          />
                                        </td>

                                        {category.columns.map(col => {
                                          const record = groupData[col.id] || { value: col.type === 'boolean' ? null : '', scoreValue: null }

                                          const ruleVal = evaluateRules(col, groupData);
                                          const isLocked = col.isReadOnly || ruleVal !== undefined;
                                          let displayValue = ruleVal !== undefined ? ruleVal : record.value;

                                          const handleChange = (field: 'value' | 'scoreValue', val: any) => {
                                            if (isLocked) return;
                                            let finalVal = val;
                                            if (field === 'value' && col.type === 'number') {
                                              finalVal = val === '' ? null : Number(val);
                                              if (col.validation && finalVal !== null) {
                                                if (col.validation.min !== null && col.validation.min !== undefined && finalVal < col.validation.min) return;
                                                if (col.validation.max !== null && col.validation.max !== undefined && finalVal > col.validation.max) return;
                                              }
                                            }
                                            if (field === 'value' && col.type === 'boolean') finalVal = val === 'true' ? true : val === 'false' ? false : null;
                                            if (field === 'scoreValue') finalVal = val === '' ? null : Number(val);

                                            updateProjectData(project.id, rowNode.id, col.id, {
                                              ...record,
                                              [field]: finalVal
                                            })
                                          }

                                          return (
                                            <td key={col.id} className={`px-2 py-2 align-middle text-center border-l border-border/50 ${isLocked ? 'bg-muted/10' : ''}`}>
                                              {col.type === 'boolean' ? (
                                                <select
                                                  className={`w-20 mx-auto rounded-md border border-input px-2 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary ${isLocked ? 'bg-transparent opacity-70 cursor-not-allowed' : 'bg-background'}`}
                                                  value={displayValue === true || displayValue === 'true' || displayValue === '1' || displayValue === 1 || (typeof displayValue === 'string' && displayValue.toLowerCase() === 'yes') ? 'true' : displayValue === false || displayValue === 'false' || displayValue === '0' || displayValue === 0 || (typeof displayValue === 'string' && displayValue.toLowerCase() === 'no') ? 'false' : ''}
                                                  onChange={e => handleChange('value', e.target.value)}
                                                  disabled={isLocked}
                                                >
                                                  <option value="">-</option>
                                                  <option value="true">Yes</option>
                                                  <option value="false">No</option>
                                                </select>
                                              ) : col.type === 'select' ? (
                                                <select
                                                  className={`w-full max-w-[120px] mx-auto rounded-md border border-input px-2 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary ${isLocked ? 'bg-transparent opacity-70 cursor-not-allowed' : 'bg-background'}`}
                                                  value={displayValue || ''}
                                                  onChange={e => handleChange('value', e.target.value)}
                                                  disabled={isLocked}
                                                >
                                                  <option value="">Select...</option>
                                                  {col.options?.map((opt: any, idx: number) => (
                                                    <option key={idx} value={opt.value}>{opt.label}</option>
                                                  ))}
                                                </select>
                                              ) : col.type === 'number' ? (
                                                <input
                                                  type="number"
                                                  className={`w-20 mx-auto rounded-sm border border-transparent px-2 py-1 text-center text-sm font-semibold transition-all ${isLocked ? 'bg-transparent opacity-70 cursor-not-allowed' : 'bg-transparent hover:border-input focus:bg-background shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary'}`}
                                                  value={displayValue === null || displayValue === undefined ? '' : String(displayValue)}
                                                  onChange={e => handleChange('value', e.target.value)}
                                                  disabled={isLocked}
                                                  min={col.validation?.min ?? undefined}
                                                  max={col.validation?.max ?? undefined}
                                                />
                                              ) : col.type === 'text' ? (
                                                <input
                                                  type="text"
                                                  className={`w-full rounded-sm border border-transparent px-2 py-1 text-sm transition-all ${isLocked ? 'bg-transparent opacity-70 cursor-not-allowed' : 'bg-transparent hover:border-input focus:bg-background shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary'}`}
                                                  value={displayValue !== null && displayValue !== undefined ? String(displayValue) : ''}
                                                  onChange={e => handleChange('value', e.target.value)}
                                                  placeholder="..."
                                                  disabled={isLocked}
                                                />
                                              ) : (
                                                <span className="font-bold text-primary px-2 py-1">
                                                  {evaluateFormula(col.formulaExpression)}
                                                </span>
                                              )}
                                            </td>
                                          )
                                        })}
                                      </tr>
                                    )
                                  })}
                                </React.Fragment>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
