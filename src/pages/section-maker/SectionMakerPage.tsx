"use client"

import * as React from "react"
import { useAppStore } from "@/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { Link } from "@/lib/router-compat"
import { Plus, Trash2, Pencil, Settings2, GitBranch, History, CheckCircle2 } from "lucide-react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { sortSections, sortCategories, sortGroups } from "@/lib/scorecardOrder"
import { apiClient } from "@/lib/api"
import { toast } from "@/components/ui/toast"

export default function SectionMakerPage() {
  const {
    templates,
    fetchTemplates,
    isLoadingTemplates,
    createTemplateSection,
    updateTemplateSection,
    deleteTemplateSection,
    publishNewSectionVersion,
    createTemplateCategory,
    updateTemplateCategory,
    deleteTemplateCategory,
    createTemplateGroup,
    updateTemplateGroup,
    deleteTemplateGroup,
  } = useAppStore()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    fetchTemplates()
  }, [fetchTemplates])

  const [selectedSectionId, setSelectedSectionId] = React.useState<string | null>(null)
  const [isSectionModalOpen, setIsSectionModalOpen] = React.useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = React.useState(false)
  const [isPublishVersionModalOpen, setIsPublishVersionModalOpen] = React.useState(false)
  const [isVersionHistoryModalOpen, setIsVersionHistoryModalOpen] = React.useState(false)
  const [versionChangelog, setVersionChangelog] = React.useState("")
  const [isPublishingVersion, setIsPublishingVersion] = React.useState(false)
  const [sectionVersions, setSectionVersions] = React.useState<any[]>([])
  const [isLoadingVersions, setIsLoadingVersions] = React.useState(false)
  const [isGroupModalOpen, setIsGroupModalOpen] = React.useState(false)

  const [editingSectionId, setEditingSectionId] = React.useState<string | null>(null)
  const [editingCategoryId, setEditingCategoryId] = React.useState<{ sectionId: string, categoryId: string } | null>(null)
  const [editingGroupId, setEditingGroupId] = React.useState<{ sectionId: string, categoryId: string, groupId: string } | null>(null)
  const [targetCategoryForGroup, setTargetCategoryForGroup] = React.useState<{ sectionId: string, categoryId: string } | null>(null)

  const [newSection, setNewSection] = React.useState({ label: "", description: "", accentColor: "#B5111B", icon: "Layers" })
  const [newCategory, setNewCategory] = React.useState({ sectionId: "", label: "", description: "" })
  const [newGroup, setNewGroup] = React.useState({
    label: "",
    description: "",
    weight: 2,
    highestScore: 4,
    scoringRules: [] as any[],
    configuredColumns: [] as Array<{ columnId: string; value: number }>,
    scoringType: 'value' as 'value' | 'boolean',
    formula: "Weight * Value",
    isFormulaOverridden: false
  })

  // Deduplicate and canonically sort global templates by label / name matching Excel, always picking the latest version
  const uniqueTemplates = React.useMemo(() => {
    const uniqueTemplatesMap = new Map<string, typeof templates[0]>();
    (templates || []).forEach(t => {
      const key = (t.versionGroupId || t.label || t.id || '').trim().toLowerCase();
      const existing = uniqueTemplatesMap.get(key);
      if (!existing) {
        uniqueTemplatesMap.set(key, t);
      } else {
        const tVer = t.version ?? 1;
        const existVer = existing.version ?? 1;
        // Prefer isLatest or higher version number
        if (t.isLatest || tVer > existVer) {
          uniqueTemplatesMap.set(key, t);
        }
      }
    });
    return sortSections(Array.from(uniqueTemplatesMap.values()), t => t.label || t.id || '');
  }, [templates]);

  const activeSectionId = React.useMemo(() => {
    if (!uniqueTemplates.length) return null;
    if (selectedSectionId) {
      // 1. Direct match by id
      const direct = uniqueTemplates.find(s => s.id === selectedSectionId);
      if (direct) return direct.id;
      // 2. Match by versionGroupId or label (in case a new version was published and ID changed)
      const prevSection = templates.find(t => t.id === selectedSectionId);
      const groupMatch = uniqueTemplates.find(s =>
        (prevSection?.versionGroupId && s.versionGroupId === prevSection.versionGroupId) ||
        (prevSection?.label && s.label?.trim().toLowerCase() === prevSection.label.trim().toLowerCase())
      );
      if (groupMatch) return groupMatch.id;
    }
    return uniqueTemplates[0]?.id || null;
  }, [selectedSectionId, uniqueTemplates, templates]);

  const activeSection = uniqueTemplates.find(s => s.id === activeSectionId)

  const sortedCategories = React.useMemo(() => {
    if (!activeSection?.categories) return [];
    return sortCategories(activeSection.label || '', activeSection.categories, c => c.label || '');
  }, [activeSection, activeSection?.categories, templates]);

  const currentSectionForGroup = React.useMemo(() => {
    const secId = targetCategoryForGroup?.sectionId || editingGroupId?.sectionId || activeSectionId;
    return uniqueTemplates.find(s => s.id === secId) || activeSection;
  }, [targetCategoryForGroup, editingGroupId, activeSectionId, uniqueTemplates, activeSection]);

  const availableColumnsForGroup = React.useMemo(() => {
    const colMap = new Map<string, { id: string; name: string; type: string }>();
    // Default Data column is always first (numeric base data)
    colMap.set('__base__', { id: '__base__', name: 'Data', type: 'number' });

    const isNumberType = (col: any) => String(col?.type || '').toLowerCase() === 'number';

    if (currentSectionForGroup?.columns && currentSectionForGroup.columns.length > 0) {
      currentSectionForGroup.columns.forEach((col: any) => {
        if (col.id && col.name && isNumberType(col) && !colMap.has(col.id)) {
          colMap.set(col.id, { id: col.id, name: col.name, type: 'number' });
        }
      });
    }

    if (currentSectionForGroup?.categories) {
      currentSectionForGroup.categories.forEach((cat: any) => {
        (cat.columns || []).forEach((col: any) => {
          if (col.id && col.name && isNumberType(col) && !colMap.has(col.id)) {
            colMap.set(col.id, { id: col.id, name: col.name, type: 'number' });
          }
        });
      });
    }

    return Array.from(colMap.values());
  }, [currentSectionForGroup]);

  const targetColumnsForGroup = React.useMemo(() => {
    // Only non-base columns with type === 'number' can be target outputs
    const cols = availableColumnsForGroup.filter(c => c.id !== '__base__' && String(c.type || '').toLowerCase() === 'number');
    if (cols.length === 0) {
      return [{ id: '__value__', name: 'Value', type: 'number' }];
    }
    return cols;
  }, [availableColumnsForGroup]);

  const defaultValueColId = React.useMemo(() => {
    const valCol = targetColumnsForGroup.find(c => c.name.toLowerCase() === 'value');
    return valCol ? valCol.id : (targetColumnsForGroup[0]?.id || '__value__');
  }, [targetColumnsForGroup]);

  // Selectable columns for indicator values: currently Weight (1–4) and Highest Score (expandable in the future)
  const selectableIndicatorColumns = React.useMemo(() => {
    const numericCols = targetColumnsForGroup.filter(c => c.id !== '__base__');
    const weightCol = numericCols.find(c => /weight/i.test(c.name));
    const highestCol = numericCols.find(c => /highest|max/i.test(c.name));

    const list: Array<{ id: string; name: string; validation?: any }> = [];
    if (weightCol) {
      list.push(weightCol);
    } else {
      list.push({ id: '__weight__', name: 'Weight (1–4)', validation: { min: 1, max: 4 } });
    }

    if (highestCol) {
      list.push(highestCol);
    } else {
      list.push({ id: '__highest__', name: 'Highest Score', validation: { min: 1 } });
    }

    return list;
  }, [targetColumnsForGroup]);

  // Available column tokens for row formula (standard variables + all dynamic columns in the section)
  const formulaColumnsForGroup = React.useMemo(() => {
    const list: Array<{ name: string; token: string }> = [
      { name: "Weight (1-4)", token: "Weight" },
      { name: "Value", token: "Value" },
      { name: "Y(1)/N(0)", token: "Y_1__N_0_" },
      { name: "Data", token: "Data" },
      { name: "Highest Score", token: "Highest_Score" },
    ];
    const seen = new Set(list.map(l => l.token.toLowerCase()));

    const cols = currentSectionForGroup?.columns || [];
    cols.forEach((col: any) => {
      if (col && col.name) {
        const token = col.name.replace(/[^a-zA-Z0-9_]/g, '_');
        if (!seen.has(token.toLowerCase()) && !seen.has(col.name.toLowerCase())) {
          seen.add(token.toLowerCase());
          list.push({ name: col.name, token });
        }
      }
    });

    return list;
  }, [currentSectionForGroup]);

  // Real-time formula validation for row custom formula override
  const rowFormulaValidation = React.useMemo(() => {
    if (!newGroup.isFormulaOverridden) {
      return { status: 'idle', message: '' };
    }

    const rawExpr = (newGroup.formula || "").trim();
    if (!rawExpr) {
      return { status: 'error', message: 'Formula expression cannot be empty when override is enabled.' };
    }

    const ctx: Record<string, number> = {
      data: 10,
      Data: 10,
      Value: 2,
      value: 2,
      Weight: 3,
      weight: 3,
      Weight_1_4_: 3,
      Y_1__N_0_: 1,
      YN: 1,
      Highest_Score: 8,
      Highest: 8,
    };

    (formulaColumnsForGroup || []).forEach(col => {
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
  }, [newGroup.isFormulaOverridden, newGroup.formula, formulaColumnsForGroup]);

  const getColumnRange = (col?: any) => {
    if (!col) return { min: 1, max: undefined, hasRange: false, rangeText: '' };
    if (/weight/i.test(col.name)) {
      return { min: 1, max: 4, hasRange: true, rangeText: '1–4' };
    }
    if (col.validation?.min !== null && col.validation?.max !== null && col.validation?.min !== undefined && col.validation?.max !== undefined) {
      return {
        min: col.validation.min,
        max: col.validation.max,
        hasRange: true,
        rangeText: `${col.validation.min}–${col.validation.max}`
      };
    }
    return { min: 1, max: undefined, hasRange: false, rangeText: '' };
  };

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

  const handleOpenVersionHistory = async () => {
    if (!activeSection) return
    setIsLoadingVersions(true)
    setIsVersionHistoryModalOpen(true)
    const versions = await apiClient.getSectionVersions(activeSection.id)
    setSectionVersions(versions || [])
    setIsLoadingVersions(false)
  }

  const handlePublishVersion = async () => {
    if (!activeSection) return
    setIsPublishingVersion(true)
    try {
      const newVer = await publishNewSectionVersion(activeSection.id, versionChangelog.trim() || undefined)
      if (newVer) {
        setSelectedSectionId(newVer.id)
        setIsPublishVersionModalOpen(false)
        setVersionChangelog("")
      }
    } finally {
      setIsPublishingVersion(false)
    }
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
        description: newCategory.description
      })
    } else {
      createTemplateCategory(newCategory.sectionId, {
        label: newCategory.label,
        description: newCategory.description
      })
    }
    setIsCategoryModalOpen(false)
    setEditingCategoryId(null)
    setNewCategory({ sectionId: "", label: "", description: "" })
  }

  const openEditCategory = (sectionId: string, category: any, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setNewCategory({ sectionId, label: category.label, description: category.description || "" })
    setEditingCategoryId({ sectionId, categoryId: category.id })
    setIsCategoryModalOpen(true)
  }

  const handleSaveGroup = () => {
    if (!newGroup.label || !targetCategoryForGroup) return;

    if (newGroup.isFormulaOverridden && rowFormulaValidation.status === 'error') {
      toast.error(rowFormulaValidation.message || "Please fix syntax error in formula before saving.");
      return;
    }

    const colDefaults: Record<string, number> = {};
    let finalWeight = newGroup.weight ?? 2;
    let finalHighest = newGroup.highestScore ?? 4;

    (newGroup.configuredColumns || []).forEach(entry => {
      colDefaults[entry.columnId] = entry.value;
      const col = selectableIndicatorColumns.find(c => c.id === entry.columnId);
      if (col) {
        if (/weight/i.test(col.name)) {
          finalWeight = Math.min(4, Math.max(1, entry.value));
        } else if (/highest|max/i.test(col.name)) {
          finalHighest = Math.max(1, entry.value);
        }
      }
    });

    const groupPayload = {
      label: newGroup.label,
      description: newGroup.description,
      weight: finalWeight,
      highestScore: finalHighest,
      scoringRules: (newGroup.scoringRules || []).map((r: any) => ({
        ...r,
        conditionValue: r.operator === 'between'
          ? [
            typeof r.conditionValue?.[0] === 'number' ? r.conditionValue[0] : (r.conditionValue?.[0] === '' || r.conditionValue?.[0] === undefined ? 0 : Number(r.conditionValue[0])),
            typeof r.conditionValue?.[1] === 'number' ? r.conditionValue[1] : (r.conditionValue?.[1] === '' || r.conditionValue?.[1] === undefined ? 0 : Number(r.conditionValue[1]))
          ]
          : (typeof r.conditionValue === 'number' ? r.conditionValue : (r.conditionValue === '' || r.conditionValue === undefined ? 0 : Number(r.conditionValue))),
        resultValue: typeof r.resultValue === 'number' ? r.resultValue : (r.resultValue === '' || r.resultValue === undefined ? 0 : Number(r.resultValue))
      })),
      columnDefaults: colDefaults,
      scoringType: newGroup.scoringType || 'value',
      formula: newGroup.isFormulaOverridden
        ? ((newGroup.formula || '').trim() || (newGroup.scoringType === 'boolean' ? 'Weight * Y_1__N_0_' : 'Weight * Value'))
        : null
    };

    if (editingGroupId) {
      updateTemplateGroup(editingGroupId.sectionId, editingGroupId.categoryId, editingGroupId.groupId, groupPayload);
    } else {
      createTemplateGroup(targetCategoryForGroup.sectionId, targetCategoryForGroup.categoryId, groupPayload);
    }
    setIsGroupModalOpen(false)
    setEditingGroupId(null)
    setTargetCategoryForGroup(null)
    setNewGroup({ label: "", description: "", weight: 2, highestScore: 4, scoringRules: [], configuredColumns: [], scoringType: 'value', formula: "Weight * Value", isFormulaOverridden: false })
  }

  const openEditGroup = (sectionId: string, categoryId: string, group: any, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const weightCol = selectableIndicatorColumns.find(c => /weight/i.test(c.name)) || selectableIndicatorColumns[0];
    const highestCol = selectableIndicatorColumns.find(c => /highest|max/i.test(c.name)) || selectableIndicatorColumns[1] || selectableIndicatorColumns[0];

    const entries: Array<{ columnId: string; value: number }> = [];
    if (group.columnDefaults && typeof group.columnDefaults === 'object' && Object.keys(group.columnDefaults).length > 0) {
      Object.entries(group.columnDefaults).forEach(([colId, val]) => {
        entries.push({ columnId: colId, value: Number(val) || 0 });
      });
    }

    if (entries.length === 0) {
      entries.push({ columnId: weightCol?.id || '__weight__', value: group.weight ?? 2 });
      entries.push({ columnId: highestCol?.id || '__highest__', value: group.highestScore ?? 4 });
    }

    const rowScoringType = group.scoringType || (group.highestScore === 1 ? 'boolean' : 'value');
    const defaultFormula = rowScoringType === 'boolean' ? 'Weight * Y_1__N_0_' : 'Weight * Value';
    const isCustomFormula = Boolean(group.formula && group.formula.trim() && group.formula.trim() !== defaultFormula);

    setNewGroup({
      label: group.label,
      description: group.description || "",
      weight: group.weight ?? 2,
      highestScore: group.highestScore ?? 4,
      scoringRules: Array.isArray(group.scoringRules) ? group.scoringRules : [],
      configuredColumns: entries,
      scoringType: rowScoringType,
      formula: group.formula || defaultFormula,
      isFormulaOverridden: isCustomFormula
    })
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
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border pb-5">
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <div
                    className="w-4 h-4 rounded-full shadow-xs shrink-0"
                    style={{ backgroundColor: activeSection.accentColor || '#B5111B' }}
                  />
                  <h3 className="text-2xl font-bold text-foreground tracking-tight">
                    {activeSection.label}
                  </h3>
                  <div className="inline-flex items-center gap-1.5 shrink-0">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs">
                      <GitBranch className="w-3.5 h-3.5 text-[#B5111B]" />
                      <span>v{activeSection.version || 1}</span>
                      <span className="text-[10px] text-emerald-600 font-extrabold uppercase">&bull; Active</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleOpenVersionHistory}
                      className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 font-semibold underline underline-offset-2 cursor-pointer ml-0.5 py-0.5"
                      title="View historical versions of this section"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>History</span>
                    </button>
                  </div>
                </div>
                {activeSection.description && (
                  <p className="text-sm text-muted-foreground">{activeSection.description}</p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setVersionChangelog("")
                    setIsPublishVersionModalOpen(true)
                  }}
                  className="cursor-pointer border-emerald-600/70 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 font-bold shadow-xs"
                  title="Freeze this snapshot and publish a new version for future projects"
                >
                  <GitBranch className="h-4 w-4 text-emerald-600 mr-1.5" />
                  Publish Version {(activeSection.version || 1) + 1}
                </Button>
                {activeSection.categories?.length > 0 && (
                  <Link href={`/section-maker/${activeSection.id}/categories/${activeSection.categories[0].id}`}>
                    <Button variant="outline" size="sm" className="cursor-pointer shadow-xs">
                      <Settings2 className="h-4 w-4 text-muted-foreground mr-1.5" />
                      Table Schema (Columns)
                    </Button>
                  </Link>
                )}
                <Button variant="outline" size="sm" onClick={() => openEditSection(activeSection)} className="cursor-pointer shadow-xs">
                  <Pencil className="h-4 w-4 text-muted-foreground mr-1.5" />
                  Edit Section
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteTemplateSection(activeSection.id)}
                  className="cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 shadow-xs"
                >
                  <Trash2 className="h-4 w-4 text-red-500 mr-1.5" />
                  Delete Section
                </Button>
              </div>
            </div>

            {/* Category Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedCategories.map((category) => (
                <div key={category.id} className="relative flex flex-col h-full">
                  <Card className="hover:border-primary transition-colors h-full flex flex-col">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex justify-between items-start">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-foreground">{category.label}</span>
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

                      <div className="flex-1 flex flex-col gap-2">
                        {sortGroups(category.label || '', category.groups || [], g => g.label || '').map(group => (
                          <div
                            key={group.id}
                            className="flex items-center justify-between p-2.5 rounded-md border border-border hover:border-primary/50 bg-muted/20 cursor-pointer transition-colors gap-2"
                            onClick={(e) => openEditGroup(activeSection.id, category.id, group, e)}
                          >
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-medium truncate">{group.label}</span>
                              <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
                                <span>Weight: <strong className="text-foreground">{group.weight ?? 2}</strong></span>
                                <span>&bull;</span>
                                <span>Max: <strong className="text-foreground">{group.highestScore ?? 4}</strong></span>
                                {Array.isArray(group.scoringRules) && group.scoringRules.length > 0 && (
                                  <>
                                    <span>&bull;</span>
                                    <span className="text-emerald-700 font-semibold">{group.scoringRules.length} rules</span>
                                  </>
                                )}
                              </div>
                            </div>
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

                      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-sm">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary font-semibold hover:text-primary/80 hover:bg-primary/5 p-0 h-auto cursor-pointer flex items-center"
                          onClick={(e) => {
                            e.preventDefault(); e.stopPropagation();
                            const weightCol = selectableIndicatorColumns.find(c => /weight/i.test(c.name)) || selectableIndicatorColumns[0];
                            const highestCol = selectableIndicatorColumns.find(c => /highest|max/i.test(c.name)) || selectableIndicatorColumns[1] || selectableIndicatorColumns[0];

                            setNewGroup({
                              label: "",
                              description: "",
                              weight: 2,
                              highestScore: 4,
                              scoringRules: [],
                              configuredColumns: [
                                { columnId: weightCol?.id || '__weight__', value: 2 },
                                { columnId: highestCol?.id || '__highest__', value: 4 }
                              ],
                              scoringType: 'value',
                              formula: "Weight * Value",
                              isFormulaOverridden: false
                            });
                            setEditingGroupId(null);
                            setTargetCategoryForGroup({ sectionId: activeSection.id, categoryId: category.id });
                            setIsGroupModalOpen(true);
                          }}
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          Add Sub-Category
                        </Button>
                        <span className="text-xs text-muted-foreground font-medium">
                          {(category.groups || []).length} {((category.groups || []).length === 1) ? 'item' : 'items'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}

              <Button
                variant="outline"
                className="h-auto min-h-[140px] flex flex-col items-center justify-center text-muted-foreground hover:text-foreground border-dashed cursor-pointer rounded-xl hover:border-primary transition-colors"
                onClick={() => {
                  setNewCategory({ sectionId: activeSection.id, label: "", description: "" })
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
          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveCategory} className="bg-[#B5111B] text-white hover:bg-[#9B0F17]">{editingCategoryId ? "Save Changes" : "Create Category"}</Button>
          </div>
        </div>
      </Modal>

      {/* Sub-Category Modal */}
      <Modal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        title={editingGroupId ? "Edit Sub-Category (Row)" : "Add Sub-Category (Row)"}
        className="max-w-4xl max-h-[92vh] overflow-y-auto"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Indicator Name</label>
            <input
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
              value={newGroup.label}
              onChange={e => setNewGroup({ ...newGroup, label: e.target.value })}
              placeholder="e.g. US Highway or Interstate Routes"
            />
          </div>

          {/* Indicator Scoring / Input Type Toggle */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Scoring / Input Type</span>
              <span className="text-xs text-muted-foreground font-normal">
                {newGroup.scoringType === 'boolean' ? 'Row inputs Yes/No (1/0)' : 'Row inputs numeric score (1–4)'}
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted/20 rounded-lg border border-slate-400">
              <button
                type="button"
                onClick={() => {
                  setNewGroup(prev => {
                    const isFormulaDefault = !prev.formula || prev.formula === 'Weight * Y_1__N_0_' || prev.formula === 'Weight * Value';
                    return {
                      ...prev,
                      scoringType: 'value',
                      formula: isFormulaDefault ? 'Weight * Value' : prev.formula
                    };
                  });
                }}
                className={cn(
                  "py-1.5 px-3 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-2 cursor-pointer",
                  newGroup.scoringType !== 'boolean'
                    ? "bg-[#B5111B] text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                )}
              >
                <span>Value Score (1–4)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewGroup(prev => {
                    const isFormulaDefault = !prev.formula || prev.formula === 'Weight * Value' || prev.formula === 'Weight * Y_1__N_0_';
                    return {
                      ...prev,
                      scoringType: 'boolean',
                      formula: isFormulaDefault ? 'Weight * Y_1__N_0_' : prev.formula
                    };
                  });
                }}
                className={cn(
                  "py-1.5 px-3 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-2 cursor-pointer",
                  newGroup.scoringType === 'boolean'
                    ? "bg-[#B5111B] text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                )}
              >
                <span>Yes / No (1/0)</span>
              </button>
            </div>
          </div>

          {/* Dynamic Column Configuration (Compact Horizontal Rows) */}
          <div className="space-y-2 p-3 bg-muted/10 rounded-md border border-slate-400">
            <div className="flex items-center justify-between mb-1">
              <div>
                <span className="text-sm font-medium text-foreground">Indicator Columns &amp; Values</span>
                <p className="text-xs text-muted-foreground">Select columns and assign their default values / limits for this row.</p>
              </div>
              {newGroup.configuredColumns.length < selectableIndicatorColumns.length && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer text-xs h-7"
                  onClick={() => {
                    const unselected = selectableIndicatorColumns.find(
                      c => !newGroup.configuredColumns.some(entry => entry.columnId === c.id)
                    );
                    const colToAdd = unselected || selectableIndicatorColumns[0];
                    if (!colToAdd) return;
                    const range = getColumnRange(colToAdd);
                    const defaultVal = range.hasRange ? range.min : 4;
                    setNewGroup({
                      ...newGroup,
                      configuredColumns: [...newGroup.configuredColumns, { columnId: colToAdd.id, value: defaultVal }]
                    });
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Column
                </Button>
              )}
            </div>

            <div className="space-y-2 mt-2">
              {newGroup.configuredColumns.map((entry, idx) => {
                const selectedCol = selectableIndicatorColumns.find(c => c.id === entry.columnId);
                const range = getColumnRange(selectedCol);

                return (
                  <div key={idx} className="flex items-center gap-3 bg-background p-2 rounded-md border border-slate-400 hover:border-slate-500 transition-all">
                    <div className="flex-1 min-w-[140px]">
                      <select
                        className="w-full rounded border border-input bg-background px-2.5 py-1.5 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary cursor-pointer truncate"
                        value={entry.columnId}
                        onChange={e => {
                          const newColId = e.target.value;
                          const updated = [...newGroup.configuredColumns];
                          const targetCol = selectableIndicatorColumns.find(c => c.id === newColId);
                          const newRange = getColumnRange(targetCol);
                          let val = updated[idx].value;
                          if (newRange.hasRange && newRange.min !== undefined && newRange.max !== undefined) {
                            val = Math.min(newRange.max, Math.max(newRange.min, val));
                          }
                          updated[idx] = { columnId: newColId, value: val };

                          let w = newGroup.weight;
                          let h = newGroup.highestScore;
                          if (targetCol && /weight/i.test(targetCol.name)) w = val;
                          if (targetCol && /highest|max/i.test(targetCol.name)) h = val;

                          setNewGroup({ ...newGroup, configuredColumns: updated, weight: w, highestScore: h });
                        }}
                      >
                        {selectableIndicatorColumns.map(col => (
                          <option key={col.id} value={col.id}>
                            {col.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-medium text-muted-foreground">Value:</span>
                      <input
                        type="number"
                        step="any"
                        min={range.min}
                        max={range.max}
                        className="no-spin w-24 rounded border border-input bg-background px-2 py-1 text-xs font-semibold text-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary shadow-2xs"
                        value={entry.value}
                        onChange={e => {
                          const num = Number(e.target.value);
                          let val = isNaN(num) ? 0 : num;
                          if (range.hasRange && range.min !== undefined && range.max !== undefined) {
                            val = Math.min(range.max, Math.max(range.min, val));
                          } else if (range.min !== undefined) {
                            val = Math.max(range.min, val);
                          }

                          const updated = [...newGroup.configuredColumns];
                          updated[idx] = { ...updated[idx], value: val };

                          const col = selectableIndicatorColumns.find(c => c.id === updated[idx].columnId);
                          let w = newGroup.weight;
                          let h = newGroup.highestScore;
                          if (col && /weight/i.test(col.name)) w = val;
                          if (col && /highest|max/i.test(col.name)) h = val;

                          setNewGroup({ ...newGroup, configuredColumns: updated, weight: w, highestScore: h });
                        }}
                      />
                    </div>

                    <div className="w-24 shrink-0 text-right">
                      {range.hasRange ? (
                        <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-full inline-block">
                          Range: {range.rangeText}
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground italic">No limit</span>
                      )}
                    </div>

                    {newGroup.configuredColumns.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer shrink-0"
                        onClick={() => {
                          const updated = [...newGroup.configuredColumns];
                          updated.splice(idx, 1);
                          setNewGroup({ ...newGroup, configuredColumns: updated });
                        }}
                        title="Remove column"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Row Calculation & Custom Formula Override */}
          <div className="space-y-2.5 p-3 bg-muted/10 rounded-md border border-slate-400">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-foreground">Calculation Formula</span>
                <p className="text-xs text-muted-foreground">
                  {newGroup.isFormulaOverridden
                    ? "Custom formula override is enabled for this row."
                    : `Standard calculation: ${newGroup.scoringType === 'boolean' ? 'Weight × Yes/No (1/0)' : 'Weight × Value Score (1–4)'}`}
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={Boolean(newGroup.isFormulaOverridden)}
                  onChange={e => {
                    const isChecked = e.target.checked;
                    const defaultExpr = newGroup.scoringType === 'boolean' ? 'Weight * Y_1__N_0_' : 'Weight * Value';
                    setNewGroup(prev => ({
                      ...prev,
                      isFormulaOverridden: isChecked,
                      formula: isChecked ? (prev.formula || defaultExpr) : defaultExpr
                    }));
                  }}
                  className="rounded border-slate-400 text-[#B5111B] focus:ring-[#B5111B] h-4 w-4 cursor-pointer"
                />
                <span className="text-xs font-semibold text-foreground">
                  Override Formula
                </span>
              </label>
            </div>

            {newGroup.isFormulaOverridden && (
              <div className="space-y-2 mt-2 pt-2 border-t border-border/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Custom Expression:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setNewGroup(prev => ({ ...prev, formula: '' }))}
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
                        const defaultExpr = newGroup.scoringType === 'boolean' ? 'Weight * Y_1__N_0_' : 'Weight * Value';
                        setNewGroup(prev => ({ ...prev, formula: defaultExpr }));
                      }}
                    >
                      Reset to Default
                    </Button>
                  </div>
                </div>

                <textarea
                  rows={3}
                  className="w-full min-h-[90px] rounded-md border border-input bg-background px-3 py-2 text-xs font-mono font-semibold shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary leading-relaxed resize-y"
                  value={newGroup.formula !== undefined ? newGroup.formula : (newGroup.scoringType === 'boolean' ? 'Weight * Y_1__N_0_' : 'Weight * Value')}
                  onChange={e => setNewGroup({ ...newGroup, formula: e.target.value })}
                  placeholder={newGroup.scoringType === 'boolean' ? 'e.g. Weight * Y_1__N_0_' : 'e.g. Weight * Value'}
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
                            const cur = (newGroup.formula ?? (newGroup.scoringType === 'boolean' ? 'Weight * Y_1__N_0_' : 'Weight * Value')).trim();
                            setNewGroup({ ...newGroup, formula: cur ? `${cur} ${op} ` : `${op} ` });
                          }}
                          className="px-2 py-0.5 text-xs font-bold rounded bg-muted/60 hover:bg-muted border border-border/80 text-foreground transition-all cursor-pointer shadow-2xs"
                        >
                          {op}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {formulaColumnsForGroup.map(col => (
                      <button
                        key={col.token}
                        type="button"
                        onClick={() => {
                          const cur = (newGroup.formula ?? (newGroup.scoringType === 'boolean' ? 'Weight * Y_1__N_0_' : 'Weight * Value')).trim();
                          const needsSpace = cur.length > 0 && !cur.endsWith(' ') && !['(', '*', '/', '+', '-'].includes(cur.slice(-1));
                          setNewGroup({ ...newGroup, formula: `${cur}${needsSpace ? ' ' : ''}${col.token}` });
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

                {/* Validation Status (matching Column Formula) */}
                <div className="text-xs pt-1">
                  {rowFormulaValidation.status === 'valid' && (
                    <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/20 px-2.5 py-1.5 rounded border border-emerald-200/50">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="font-medium">Valid Formula</span>
                    </div>
                  )}
                  {rowFormulaValidation.status === 'error' && (
                    <div className="text-rose-600 bg-rose-50/60 dark:bg-rose-950/20 px-2.5 py-1.5 rounded border border-rose-200/50">
                      <span className="font-medium">{rowFormulaValidation.message}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description / Notes</label>
            <textarea
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm h-16"
              value={newGroup.description}
              onChange={e => setNewGroup({ ...newGroup, description: e.target.value })}
              placeholder="e.g. STIP route data or benchmark criteria"
            />
          </div>

          {/* Conditional Scoring Rules */}
          <div className="space-y-2 p-3 bg-muted/10 rounded-md border border-slate-400">
            <div className="flex justify-between items-center mb-1">
              <div>
                <span className="text-sm font-medium text-foreground">Scoring Thresholds (IF/THEN Rules)</span>
                <p className="text-xs text-muted-foreground">Automatically calculates the Value score based on county Data input.</p>
              </div>              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer text-xs"
                onClick={() => setNewGroup({
                  ...newGroup,
                  scoringRules: [
                    ...newGroup.scoringRules,
                    {
                      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `rule_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                      ifColumnId: '__base__',
                      operator: 'between',
                      conditionValue: [0, 1],
                      targetColumnId: defaultValueColId,
                      resultValue: 0
                    }
                  ]
                })}
              >
                <Plus className="h-3 w-3 mr-1" /> Add Rule
              </Button>
            </div>

            {newGroup.scoringRules.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-1">No custom scoring rules defined. The system will use standard Excel methodology.</p>
            ) : (
              <div className="space-y-2 mt-2">
                {newGroup.scoringRules.map((rule: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-2.5 bg-background p-2.5 rounded-lg border border-slate-400 shadow-2xs hover:border-slate-500 transition-all"
                  >
                    {/* IF Condition Expression */}
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap flex-1 min-w-0">
                      <span className="text-xs font-bold text-slate-500 shrink-0">If</span>
                      <select
                        className="rounded-md border border-input bg-background px-2.5 py-1.5 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary cursor-pointer w-32 md:w-36 shrink-0 truncate shadow-2xs"
                        title={availableColumnsForGroup.find(c => c.id === (rule.ifColumnId || '__base__'))?.name || 'Data Column'}
                        value={availableColumnsForGroup.some(c => c.id === (rule.ifColumnId || '__base__')) ? (rule.ifColumnId || '__base__') : '__base__'}
                        onChange={e => {
                          const r = [...newGroup.scoringRules];
                          r[idx].ifColumnId = e.target.value;
                          setNewGroup({ ...newGroup, scoringRules: r });
                        }}
                      >
                        {availableColumnsForGroup.map(col => (
                          <option key={col.id} value={col.id} title={col.name}>
                            {col.name}
                          </option>
                        ))}
                      </select>

                      <select
                        className="rounded-md border border-input bg-background px-2.5 py-1.5 text-xs shrink-0 cursor-pointer font-semibold shadow-2xs min-w-[84px]"
                        value={rule.operator}
                        onChange={e => {
                          const r = [...newGroup.scoringRules];
                          r[idx].operator = e.target.value;
                          if (e.target.value === 'between' && !Array.isArray(r[idx].conditionValue)) {
                            r[idx].conditionValue = [0, 1];
                          }
                          setNewGroup({ ...newGroup, scoringRules: r });
                        }}
                      >
                        <option value="between">Between</option>
                        <option value="equals">=</option>
                        <option value="greater_than">&gt;</option>
                        <option value="greater_than_or_equals">&ge;</option>
                        <option value="less_than">&lt;</option>
                        <option value="less_than_or_equals">&le;</option>
                      </select>

                      {rule.operator === 'between' ? (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <input
                            type="number"
                            step="any"
                            className="no-spin w-20 sm:w-24 rounded-md border border-input bg-background px-2 py-1.5 text-xs text-center font-medium shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                            placeholder="Min"
                            value={rule.conditionValue?.[0] !== undefined ? rule.conditionValue[0] : ''}
                            onChange={e => {
                              const r = [...newGroup.scoringRules];
                              const val = e.target.value === '' ? '' : Number(e.target.value);
                              r[idx].conditionValue = [val, r[idx].conditionValue?.[1] ?? 1];
                              setNewGroup({ ...newGroup, scoringRules: r });
                            }}
                          />
                          <span className="text-xs text-muted-foreground font-semibold">to</span>
                          <input
                            type="number"
                            step="any"
                            className="no-spin w-20 sm:w-24 rounded-md border border-input bg-background px-2 py-1.5 text-xs text-center font-medium shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                            placeholder="Max"
                            value={rule.conditionValue?.[1] !== undefined ? rule.conditionValue[1] : ''}
                            onChange={e => {
                              const r = [...newGroup.scoringRules];
                              const val = e.target.value === '' ? '' : Number(e.target.value);
                              r[idx].conditionValue = [r[idx].conditionValue?.[0] ?? 0, val];
                              setNewGroup({ ...newGroup, scoringRules: r });
                            }}
                          />
                        </div>
                      ) : (
                        <input
                          type="number"
                          step="any"
                          className="no-spin w-24 sm:w-28 rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-center font-medium shrink-0 shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                          placeholder="Value"
                          value={rule.conditionValue !== undefined ? rule.conditionValue : ''}
                          onChange={e => {
                            const r = [...newGroup.scoringRules];
                            const val = e.target.value === '' ? '' : Number(e.target.value);
                            r[idx].conditionValue = val;
                            setNewGroup({ ...newGroup, scoringRules: r });
                          }}
                        />
                      )}
                    </div>

                    {/* SET Result & Delete Action */}
                    <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
                      <span className="text-xs font-bold text-slate-500 shrink-0">&rarr; Set</span>
                      <select
                        className="rounded-md border border-input bg-background px-2.5 py-1.5 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary cursor-pointer w-28 sm:w-32 shrink-0 truncate shadow-2xs"
                        title={targetColumnsForGroup.find(c => c.id === rule.targetColumnId)?.name || 'Target Column'}
                        value={targetColumnsForGroup.some(c => c.id === rule.targetColumnId) ? rule.targetColumnId : defaultValueColId}
                        onChange={e => {
                          const r = [...newGroup.scoringRules];
                          r[idx].targetColumnId = e.target.value;
                          setNewGroup({ ...newGroup, scoringRules: r });
                        }}
                      >
                        {targetColumnsForGroup.map(col => (
                          <option key={col.id} value={col.id} title={col.name}>
                            {col.name}
                          </option>
                        ))}
                      </select>
                      <span className="text-xs font-bold text-slate-500 shrink-0">to:</span>
                      <input
                        type="number"
                        step="any"
                        className="no-spin w-16 sm:w-20 rounded-md border border-input bg-background px-2 py-1.5 text-xs font-bold text-center shrink-0 shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                        placeholder="Score"
                        value={rule.resultValue !== undefined ? rule.resultValue : ''}
                        onChange={e => {
                          const r = [...newGroup.scoringRules];
                          const val = e.target.value === '' ? '' : Number(e.target.value);
                          r[idx].resultValue = val;
                          setNewGroup({ ...newGroup, scoringRules: r });
                        }}
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer shrink-0 rounded-md"
                        onClick={() => {
                          const r = [...newGroup.scoringRules];
                          r.splice(idx, 1);
                          setNewGroup({ ...newGroup, scoringRules: r });
                        }}
                        title="Delete rule"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsGroupModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveGroup} className="bg-[#B5111B] text-white hover:bg-[#9B0F17]">{editingGroupId ? "Save Changes" : "Create Sub-Category"}</Button>
          </div>
        </div>
      </Modal>

      {/* PUBLISH NEW VERSION MODAL */}
      <Modal
        isOpen={isPublishVersionModalOpen}
        onClose={() => !isPublishingVersion && setIsPublishVersionModalOpen(false)}
        title={`Publish New Version for "${activeSection?.label || 'Section'}"`}
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
              <GitBranch className="w-4 h-4 text-emerald-600" />
              <span>v{activeSection?.version || 1} &rarr; v{(activeSection?.version || 1) + 1}</span>
            </div>
            <p className="leading-relaxed">
              This will snapshot and clone the current section ({sortedCategories.length} categories, {activeSection?.columns?.length || 0} table columns) into a new active version.
            </p>
            <div className="text-[11.5px] text-emerald-900/90 font-medium space-y-1 bg-white/60 p-2.5 rounded-lg border border-emerald-100">
              <div>&bull; <strong>Existing completed projects:</strong> Remain safely locked to their historical version without breaking.</div>
              <div>&bull; <strong>New projects:</strong> Will automatically use Version {(activeSection?.version || 1) + 1}.</div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Changelog / Release Notes (Optional)</label>
            <textarea
              className="w-full rounded-xl border border-input bg-background p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary min-h-[80px]"
              placeholder="e.g. Added 2026 economic metrics, updated scoring rules..."
              value={versionChangelog}
              onChange={(e) => setVersionChangelog(e.target.value)}
              disabled={isPublishingVersion}
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-border">
            <Button
              variant="outline"
              onClick={() => setIsPublishVersionModalOpen(false)}
              disabled={isPublishingVersion}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePublishVersion}
              disabled={isPublishingVersion}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
            >
              {isPublishingVersion ? (
                "Publishing..."
              ) : (
                `Publish Version ${(activeSection?.version || 1) + 1}`
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* VERSION HISTORY MODAL */}
      <Modal
        isOpen={isVersionHistoryModalOpen}
        onClose={() => setIsVersionHistoryModalOpen(false)}
        title={`Version History — ${activeSection?.label || 'Section'}`}
      >
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {isLoadingVersions ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Loading version history...
            </div>
          ) : sectionVersions.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
              No version history available for this section.
            </div>
          ) : (
            sectionVersions.map((v) => {
              const isCurrent = v.id === activeSection?.id
              return (
                <div
                  key={v.id}
                  className={`p-3.5 rounded-xl border transition-all ${isCurrent
                    ? "bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-200"
                    : "bg-slate-50/70 border-slate-200"
                    }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-slate-900">v{v.version}</span>
                      {v.isLatest ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                          Active / Latest
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700">
                          Archived
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {v.createdAt ? new Date(v.createdAt).toLocaleDateString() : ""}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {v.changelog || "Base section snapshot"}
                  </p>

                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                    <span>{(v.categories || []).length} categories</span>
                    <span>&bull;</span>
                    <span>
                      {(v.categories || []).reduce(
                        (acc: number, cat: any) => acc + (cat.groups || []).length,
                        0
                      )}{" "}
                      sub-categories
                    </span>
                    <span>&bull;</span>
                    <span>{(v.columns || []).length} table columns</span>
                  </div>
                </div>
              )
            })
          )}

          <div className="pt-2 flex justify-end">
            <Button variant="outline" onClick={() => setIsVersionHistoryModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
