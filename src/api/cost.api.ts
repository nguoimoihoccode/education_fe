import { apiClient } from './client';

/** Model spend per usage source (grading, tutor, quiz…) — admin only. */
export const COST_OVERVIEW_PATH = '/costs/overview';
export const COST_SCHOOLS_PATH = '/costs/schools';

export interface CostSchoolOption {
  id: string;
  name: string;
}

export interface CostTotals {
  calls: number;
  errorCalls: number;
  inputTokens: number;
  outputTokens: number;
  knownCostMicros: number;
  knownCostUsd: number;
  unknownCostCalls: number;
  unknownReservedMicros: number;
  upperBoundCostMicros: number;
  upperBoundCostUsd: number;
}

export interface CostSource extends CostTotals {
  key: string;
  label: string;
  group: 'grading' | 'ai';
  shareOfKnownCost: number | null;
  byDay: (CostTotals & { day: string })[];
  /** Grading: one row per model role; AI features: one row per model. */
  parts: (CostTotals & { part: string })[];
}

export interface CostOverview {
  from: string;
  to: string;
  timeZone: string;
  schoolId: string | null;
  currency: 'USD';
  total: CostTotals;
  sources: CostSource[];
  byDay: (CostTotals & { day: string; bySource: Record<string, number> })[];
}

export const costApi = {
  async getOverview(from: string, to: string, schoolId?: string): Promise<CostOverview> {
    const response = await apiClient.get<CostOverview>(COST_OVERVIEW_PATH, {
      params: schoolId ? { from, to, schoolId } : { from, to },
      cache: false,
    });
    return response.data;
  },
  async listSchools(): Promise<CostSchoolOption[]> {
    const response = await apiClient.get<{ items: CostSchoolOption[] }>(COST_SCHOOLS_PATH, {
      cache: false,
    });
    return response.data.items;
  },
};
