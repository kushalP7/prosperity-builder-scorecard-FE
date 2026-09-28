import { z } from "zod";

// --- Conditional Rule Engine Types ---

export const SelectOptionSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()]),
});
export type SelectOption = z.infer<typeof SelectOptionSchema>;

export const ConditionalRuleSchema = z.object({
  id: z.string(),
  ifColumnId: z.string(), // "__base__" for Data column, or a column ID
  operator: z.enum(['equals', 'not_equals', 'greater_than', 'less_than', 'greater_than_or_equals', 'less_than_or_equals', 'between']),
  conditionValue: z.union([z.string(), z.number(), z.boolean(), z.array(z.number())]).nullable(),
  resultValue: z.union([z.string(), z.number(), z.boolean()]),
});
export type ConditionalRule = z.infer<typeof ConditionalRuleSchema>;

// --- Scoring Engine Types ---

export const ThresholdRuleSchema = z.object({
  kind: z.literal('threshold'),
  threshold: z.number(),
  direction: z.enum(['above', 'below']),
  points: z.number(),
});

export const BenchmarkRangeRuleSchema = z.object({
  kind: z.literal('benchmark_range'),
  ranges: z.array(z.object({
    min: z.number().nullable(),
    max: z.number().nullable(),
    points: z.number(),
  })),
});

export const BooleanRuleSchema = z.object({
  kind: z.literal('boolean'),
  truePoints: z.number(),
  falsePoints: z.number(),
});

export const ManualRuleSchema = z.object({
  kind: z.literal('manual'),
  maxPoints: z.number(),
});

export const FormulaRuleSchema = z.object({
  kind: z.literal('formula'),
  expression: z.string(), 
  maxPoints: z.number(),
});

export const ScoringRuleSchema = z.discriminatedUnion('kind', [
  ThresholdRuleSchema,
  BenchmarkRangeRuleSchema,
  BooleanRuleSchema,
  ManualRuleSchema,
  FormulaRuleSchema,
]);

export type ScoringRule = z.infer<typeof ScoringRuleSchema>;

// --- Template (Structure Maker) Types ---

export const TemplateColumnSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['number', 'boolean', 'text', 'formula', 'select']),
  unit: z.string().optional(),
  weight: z.number().default(1),
  isBonus: z.boolean().default(false),
  scoringRule: ScoringRuleSchema,
  formulaExpression: z.string().optional(),
  
  // Advanced Settings
  isReadOnly: z.boolean().default(false),
  options: z.array(SelectOptionSchema).optional(),
  validation: z.object({
    min: z.number().nullable().optional(),
    max: z.number().nullable().optional(),
  }).optional(),
  conditionalRules: z.array(ConditionalRuleSchema).default([]),
});
export type TemplateColumn = z.infer<typeof TemplateColumnSchema>;

export const TemplateGroupSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
  takesValues: z.boolean().default(false),
  columns: z.array(TemplateColumnSchema).default([]),
});
export type TemplateGroup = z.infer<typeof TemplateGroupSchema>;

export const TemplateCategorySchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
  takesValues: z.boolean().default(false),
  columns: z.array(TemplateColumnSchema).default([]),
  groups: z.array(TemplateGroupSchema).default([]),
});
export type TemplateCategory = z.infer<typeof TemplateCategorySchema>;

export const TemplateSectionSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
  accentColor: z.string().optional(),
  icon: z.string().optional(),
  categories: z.array(TemplateCategorySchema).default([]),
});
export type TemplateSection = z.infer<typeof TemplateSectionSchema>;

// --- Analytics Widgets ---

export const AnalyticsWidgetSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  chartType: z.enum(['speed_gauge', 'bar_chart', 'line_chart', 'pie_chart', 'stat_card', 'area_chart', 'radar_chart', 'donut_chart', 'heat_chart']),
  sectionId: z.string().nullable().optional(), // If null, aggregates across all sections
  categoryId: z.string().nullable().optional(), // If null, aggregates across the whole section
  columnId: z.string().nullable().optional(), // If null, uses the base Data column
  aggregation: z.enum(['sum', 'average', 'formula']),
  customFormula: z.string().optional(),
});
export type AnalyticsWidget = z.infer<typeof AnalyticsWidgetSchema>;

// --- Project Data Types ---

export const DataRecordSchema = z.object({
  value: z.union([z.number(), z.boolean(), z.string(), z.null()]),
  source: z.string().optional(),
  notes: z.string().optional(),
  scoreValue: z.number().optional().nullable(),
});
export type DataRecord = z.infer<typeof DataRecordSchema>;

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  clientName: z.string(),
  year: z.number(),
  image: z.string().optional(),
  assignedSections: z.array(TemplateSectionSchema).default([]),
  enabledWidgets: z.array(z.string()).optional(),
  dashboardLayout: z.any().optional(),
  data: z.record(z.string(), z.record(z.string(), DataRecordSchema)).default({}),
});
export type Project = z.infer<typeof ProjectSchema>;

// --- Settings ---

export const RatingBandSchema = z.object({
  label: z.string(),
  min: z.number(),
  max: z.number(),
  color: z.string(),
});
export type RatingBand = z.infer<typeof RatingBandSchema>;

export const AppSettingsSchema = z.object({
  companyProfile: z.object({
    name: z.string(),
    logoUrl: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
  }),
  ratingBands: z.array(RatingBandSchema),
});
export type AppSettings = z.infer<typeof AppSettingsSchema>;
