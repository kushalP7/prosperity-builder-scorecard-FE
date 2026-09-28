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
    for (const section of project.assignedSections) {
      const sectionTemplate = templates.find(t => t.id === section.id);
      if (!sectionTemplate) continue;

      let sectionTotal = 0;
      let count = 0;

      for (const category of sectionTemplate.categories) {
        const groups = category.groups.length > 0 ? category.groups : [category];
        for (const group of groups) {
          const val = project.data[group.id]?.[colId]?.value;
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

  const sectionTemplate = templates.find(t => t.id === widget.sectionId);
  const projectSection = project.assignedSections.find(s => s.id === widget.sectionId);

  if (!sectionTemplate || !projectSection) {
    return [];
  }

  if (!widget.categoryId) {
    // Aggregate by Category
    for (const category of sectionTemplate.categories) {
      let categoryTotal = 0;
      let count = 0;
      
      const groups = category.groups.length > 0 ? category.groups : [category];
      
      const columnSums: Record<string, number> = {};

      for (const group of groups) {
        const groupData = project.data[group.id];
        if (!groupData) continue;

        const firstCategory = sectionTemplate.categories[0];
        let val = groupData[colId]?.value;
        if (val === undefined && colId && firstCategory) {
          const targetColName = firstCategory.columns.find(c => c.id === colId)?.name;
          if (targetColName) {
            const catCol = category.columns.find(c => c.name === targetColName);
            if (catCol) {
              val = groupData[catCol.id]?.value;
            }
          }
        }

        if (typeof val === 'number') {
          categoryTotal += val;
          count++;
        }

        // Map all other numerical columns dynamically so the frontend can calculate ratios
        for (const [key, dataObj] of Object.entries(groupData)) {
          if (key !== '__base__' && typeof dataObj.value === 'number') {
            const colDef = category.columns.find(c => c.id === key);
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
      const groupData = project.data[group.id];

      if (groupData) {
        let subMetricsValues: number[] = [];
        
        // Always set the actual requested value
        const val = groupData[colId]?.value;
        point.value = typeof val === 'number' ? val : 0;
        
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
