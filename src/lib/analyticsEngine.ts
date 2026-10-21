import { Project, AnalyticsWidget, TemplateSection } from './types';

export interface ChartDataPoint {
  name: string;
  value: number;
}

export function evaluateWidgetData(
  widget: AnalyticsWidget,
  project: Project,
  templates: TemplateSection[]
): ChartDataPoint[] {
  const dataPoints: ChartDataPoint[] = [];
  const colId = widget.columnId || '__base__';

  if (!widget.sectionId) {
    // Aggregate by Section across the whole project
    for (const section of (project.assignedSections || [])) {
      const sectionTemplate = (templates || []).find(t => t.id === section.id) || section;
      if (!sectionTemplate || !Array.isArray(sectionTemplate.categories)) continue;

      let sectionTotal = 0;
      let count = 0;

      for (const category of sectionTemplate.categories) {
        const groups = (category.groups && category.groups.length > 0) ? category.groups : [category];
        for (const group of groups) {
          let val = project.data?.[group.id]?.[colId]?.value;
          if (val === undefined || val === null) {
            val = project.data?.[group.id]?.['__base__']?.scoreValue ?? project.data?.[group.id]?.['__base__']?.value;
          }
          if (typeof val === 'number') {
            sectionTotal += val;
            count++;
          }
        }
      }

      let finalValue = 0;
      if (widget.aggregation === 'sum') {
        finalValue = sectionTotal;
      } else if (widget.aggregation === 'average' && count > 0) {
        finalValue = sectionTotal / count;
      }

      dataPoints.push({
        name: section.label,
        value: Number(finalValue.toFixed(2))
      });
    }
    return dataPoints;
  }

  let projectSection = (project.assignedSections || []).find(s => s.id === widget.sectionId);
  if (!projectSection && widget.title) {
    projectSection = (project.assignedSections || []).find(s =>
      widget.title.toLowerCase().includes(s.label.toLowerCase()) ||
      s.label.toLowerCase().includes(widget.title.toLowerCase())
    );
  }

  const sectionTemplate = (templates || []).find(t => t.id === (projectSection?.id || widget.sectionId)) || projectSection;

  if (!sectionTemplate || !projectSection || !Array.isArray(sectionTemplate.categories)) {
    return [];
  }

  if (!widget.categoryId) {
    // Aggregate by Category
    for (const category of sectionTemplate.categories) {
      let categoryTotal = 0;
      let count = 0;
      
      const groups = (category.groups && category.groups.length > 0) ? category.groups : [category];
      
      const columnSums: Record<string, number> = {};

      for (const group of groups) {
        const groupData = project.data?.[group.id];
        if (!groupData) continue;

        let val = groupData[colId]?.value;
        if (val === undefined && colId) {
          const firstCategory = sectionTemplate.categories[0];
          const targetColName = firstCategory?.columns?.find(c => c.id === colId)?.name;
          if (targetColName) {
            const catCol = category.columns?.find(c => c.name === targetColName);
            if (catCol) {
              val = groupData[catCol.id]?.value;
            }
          }
        }

        // Smart fallback by widget title
        if (val === undefined || val === null) {
          const isValueOverview = widget.title?.toLowerCase().includes('value') || widget.title?.toLowerCase().includes('overview');
          const isScoreBreakdown = widget.title?.toLowerCase().includes('score') || widget.title?.toLowerCase().includes('breakdown');
          if (isValueOverview) {
            const valCol = category.columns?.find(c => c.name.toLowerCase() === 'value');
            if (valCol && groupData[valCol.id]?.value !== undefined) {
              val = groupData[valCol.id]?.value;
            }
          } else if (isScoreBreakdown) {
            const scoreCol = category.columns?.find(c => c.name.toLowerCase().includes('client total score'));
            if (scoreCol && groupData[scoreCol.id]?.value !== undefined) {
              val = groupData[scoreCol.id]?.value;
            }
          }
        }

        // Fallback to __base__ when specific column has no explicit value
        if (val === undefined || val === null) {
          val = groupData['__base__']?.scoreValue ?? groupData['__base__']?.value;
        }

        const numVal = typeof val === 'number' ? val : (typeof val === 'string' && !isNaN(Number(val)) ? Number(val) : null);
        if (numVal !== null) {
          categoryTotal += numVal;
          count++;
        }

        // Map all other numerical columns dynamically so the frontend can calculate ratios
        for (const [key, dataObj] of Object.entries(groupData)) {
          if (key !== '__base__' && typeof dataObj.value === 'number') {
            const colDef = category.columns?.find(c => c.id === key);
            if (colDef) {
              columnSums[colDef.name] = (columnSums[colDef.name] || 0) + dataObj.value;
            }
          }
        }
      }

      let finalValue = 0;
      if (widget.aggregation === 'sum') {
        finalValue = categoryTotal;
      } else if (widget.aggregation === 'average' && count > 0) {
        finalValue = categoryTotal / count;
      } else {
        finalValue = categoryTotal;
      }

      const point: any = {
        name: category.label,
        value: Number(finalValue.toFixed(2))
      };

      for (const [colName, sumVal] of Object.entries(columnSums)) {
        point[colName] = sumVal;
      }

      dataPoints.push(point as ChartDataPoint);
    }
  } else {
    // Filtered to a specific Category, so aggregate by Group
    const category = sectionTemplate.categories.find(c => c.id === widget.categoryId);
    if (!category) return [];

    const groups = category.groups.length > 0 ? category.groups : [category];

    for (const group of groups) {
      const point: any = { name: group.label };
      const groupData = project.data?.[group.id];

      if (groupData) {
        let subMetricsValues: number[] = [];
        
        // Always set the actual requested value
        let val = groupData[colId]?.value;
        if (val === undefined || val === null) {
          const isValueOverview = widget.title?.toLowerCase().includes('value') || widget.title?.toLowerCase().includes('overview');
          const isScoreBreakdown = widget.title?.toLowerCase().includes('score') || widget.title?.toLowerCase().includes('breakdown');
          if (isValueOverview) {
            const valCol = category.columns?.find(c => c.name.toLowerCase() === 'value');
            if (valCol && groupData[valCol.id]?.value !== undefined) {
              val = groupData[valCol.id]?.value;
            }
          } else if (isScoreBreakdown) {
            const scoreCol = category.columns?.find(c => c.name.toLowerCase().includes('client total score'));
            if (scoreCol && groupData[scoreCol.id]?.value !== undefined) {
              val = groupData[scoreCol.id]?.value;
            }
          }
        }
        if (val === undefined || val === null) {
          val = groupData['__base__']?.scoreValue ?? groupData['__base__']?.value;
        }
        const numVal = typeof val === 'number' ? val : (typeof val === 'string' && !isNaN(Number(val)) ? Number(val) : 0);
        point.value = numVal;
        
        // Also map all other numerical columns dynamically
        for (const [key, dataObj] of Object.entries(groupData)) {
          if (key !== '__base__' && typeof dataObj.value === 'number') {
            const colDef = category.columns.find(c => c.id === key);
            if (colDef) {
              point[colDef.name] = dataObj.value;
              subMetricsValues.push(dataObj.value);
            }
          }
        }
        
        if (subMetricsValues.length > 0) {
          point.trendline = Math.max(...subMetricsValues) + 10;
        }
      } else {
        point.value = 0;
      }
      
      dataPoints.push(point as ChartDataPoint);
    }
  }

  return dataPoints;
}

export function calculateGaugeValue(dataPoints: ChartDataPoint[], aggregation: string): number {
  if (dataPoints.length === 0) return 0;
  
  const sum = dataPoints.reduce((acc, dp) => acc + dp.value, 0);
  
  if (aggregation === 'average') {
    return sum / dataPoints.length;
  }
  return sum;
}
