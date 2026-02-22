import { z } from 'zod';

export const ProjectInfoSchema = z.object({
  area: z.number().nonnegative(),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format" }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format" }),
  pnu: z.string().regex(/^\d{19}$/, { message: "PNU는 19자리 숫자여야 합니다." }),
  serviceKey: z.string(),
  startYear: z.number().int().min(1900).max(2100),
  endYear: z.number().int().min(1900).max(2100),
}).refine(data => {
  if (!data.startDate || !data.endDate) return true;
  return new Date(data.endDate) >= new Date(data.startDate);
}, { message: "개발종료일은 개발시작일 이후여야 합니다.", path: ["endDate"] });

export type ProjectInfo = z.infer<typeof ProjectInfoSchema>;

export const LandPriceInfoSchema = z.object({
  startPrice: z.number().nonnegative(),
  endPrice: z.number().nonnegative(),
  normalIncrease: z.number().nonnegative(),
  rate: z.number().min(0).max(1), // 0.25 or 0.20
});

export type LandPriceInfo = z.infer<typeof LandPriceInfoSchema>;

export const CostInfoSchema = z.object({
  construction: z.number().nonnegative(),
  survey: z.number().nonnegative(),
  design: z.number().nonnegative(),
  management: z.number().nonnegative(),
  donation: z.number().nonnegative(),
  other: z.number().nonnegative(),
});

export type CostInfo = z.infer<typeof CostInfoSchema>;

export const VariableFactorsSchema = z.record(z.string(), z.union([z.string(), z.number()]));

// Dynamic key signature for the 32 variables
export type VariableFactors = z.infer<typeof VariableFactorsSchema>;

export const AppStateSchema = z.object({
  project: ProjectInfoSchema,
  landPrice: LandPriceInfoSchema,
  costs: CostInfoSchema,
  variables: VariableFactorsSchema,
});

export type AppState = z.infer<typeof AppStateSchema>;

export interface CalculationResult {
  totalCost: number;
  devProfit: number;
  levyAmount: number;
}

export interface VariableConfig {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'radio';
  options?: string[]; // For select/radio
  suffix?: string;
  group: string; // For UI grouping
}