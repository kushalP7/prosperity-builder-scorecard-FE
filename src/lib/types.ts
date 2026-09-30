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

export type ProjectStatus = 
  | 'ONBOARDING'
  | 'INTAKE_PENDING'
  | 'INGESTION_RUNNING'
  | 'CALCULATED'
  | 'IN_REVIEW'
  | 'PUBLISHED'
  | 'ARCHIVED';

export type MilestoneType = 'INITIAL_40' | 'MID_30' | 'FINAL_30';
export type PaymentStatusType = 'PENDING' | 'PAID' | 'BYPASSED' | 'FAILED';

export interface PaymentMilestone {
  id: string;
  projectId: string;
  milestoneType: MilestoneType;
  amountDue: number;
  percentage: number;
  status: PaymentStatusType;
  paymentMethod: string;
  provider: string;
  transactionReference?: string;
  clearedAt?: string;
}

export interface QuestionDefinition {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'textarea';
  unit?: string;
  placeholder?: string;
  options?: string[];
  helpText?: string;
}

export interface CategoryQuestionGroup {
  categoryKey: string;
  categoryLabel: string;
  description: string;
  questions: QuestionDefinition[];
}

export interface QuestionnaireSubmission {
  id: string;
  projectId: string;
  status: 'DRAFT' | 'SUBMITTED' | 'VERIFIED';
  completedPointsCount: number;
  totalPointsCount: number;
  percentageCompleted?: number;
  answersPayload: Record<string, {
    value: any;
    unit?: string;
    notes?: string;
    documentUrl?: string;
    updatedAt?: string;
  }>;
  submittedAt?: string;
  categories?: CategoryQuestionGroup[];
}

export interface ExternalDataStaging {
  id: string;
  projectId: string;
  source: string;
  categoryKey: string;
  metricKey: string;
  metricLabel: string;
  rawResponse?: any;
  extractedValue?: number;
  unit?: string;
  ingestionStatus: 'FETCHED' | 'PARSED' | 'ERROR';
}

export interface CategoryScore {
  categoryKey: string;
  categoryLabel: string;
  totalClientPoints: number;
  totalMaxPoints: number;
  scorePercentage: number;
  scoreTenScale: number;
  rank: number;
  metricsCount: number;
}

export interface ScorecardRollup {
  id: string;
  projectId: string;
  overallScoreTenScale: number;
  overallScorePercentage: number;
  performanceBand: 'Poor' | 'Average' | 'Good' | 'Excellent';
  categoryScores: CategoryScore[];
  isCalibrated: boolean;
  calibrationNotes?: string;
  analystOverrides?: Record<string, any>;
}

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  clientName: z.string(),
  clientEmail: z.string().optional(),
  jurisdictionType: z.string().optional(),
  year: z.number(),
  status: z.enum(['ONBOARDING', 'INTAKE_PENDING', 'INGESTION_RUNNING', 'CALCULATED', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED']).optional(),
  packageType: z.string().optional(),
  totalProjectValue: z.number().optional(),
  bypassPayments: z.boolean().optional(),
  image: z.string().optional(),
  assignedSections: z.array(TemplateSectionSchema).default([]),
  enabledWidgets: z.array(z.string()).optional(),
  dashboardLayout: z.any().optional(),
  data: z.record(z.string(), z.record(z.string(), DataRecordSchema)).default({}),
  paymentMilestones: z.array(z.any()).optional(),
  questionnaireSubmission: z.any().optional(),
  rollup: z.any().optional(),
});

export type Project = {
  id: string;
  name: string;
  clientName: string;
  clientEmail?: string;
  jurisdictionType?: string;
  year: number;
  status?: ProjectStatus;
  packageType?: string;
  totalProjectValue?: number;
  bypassPayments?: boolean;
  image?: string;
  assignedSections: z.infer<typeof TemplateSectionSchema>[];
  enabledWidgets?: string[];
  dashboardLayout?: any;
  data: Record<string, Record<string, DataRecord>>;
  paymentMilestones?: any[];
  questionnaireSubmission?: any;
  rollup?: any;
};

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
