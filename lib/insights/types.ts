import type {
  Iteration,
  Outcome,
  RecommendationAdherence,
  Workflow,
} from "@/lib/domain/types";

export interface InsightsDataset {
  workflows: Workflow[];
  iterations: Iteration[];
  iterationsByWorkflowId: Map<string, Iteration[]>;
  generatedAt: string;
}

export interface AdherenceTrendPoint {
  period: string;
  yes: number;
  partially: number;
  no: number;
  total: number;
}

export interface AdherenceSummary {
  yes: number;
  partially: number;
  no: number;
  totalApplicable: number;
  percentages: {
    yes: number;
    partially: number;
    no: number;
  };
  trend: AdherenceTrendPoint[];
  hasEnoughTrendData: boolean;
}

export interface OutcomeByAdherence {
  adherence: Exclude<RecommendationAdherence, "not_applicable">;
  total: number;
  successRate: number;
  outcomes: Record<Outcome, number>;
}

export interface OutcomeTrendPoint {
  period: string;
  successRate: number;
  total: number;
}

export interface OutcomeSummary {
  counts: Record<Outcome, number>;
  percentages: Record<Outcome, number>;
  total: number;
  outcomeByAdherence: OutcomeByAdherence[];
  weeklySuccessTrend: OutcomeTrendPoint[];
}

export interface ThemeFrequency {
  id: string;
  label: string;
  count: number;
  example: string | null;
}

export type WorkflowHealthStatus = "healthy" | "stalled" | "struggling" | "new";

export interface WorkflowHealthItem {
  workflowId: string;
  workflowName: string;
  iterationCount: number;
  latestOutcome: Outcome | null;
  adherenceRate: number | null;
  lastUpdated: string;
  status: WorkflowHealthStatus;
}

export type TimelineEntryKind =
  | "first_success_after_failure"
  | "adherence_improved"
  | "milestone_iterations"
  | "repeated_non_adherence"
  | "success_rate_improved";

export interface TimelineEntry {
  date: string;
  text: string;
  kind: TimelineEntryKind;
}

export interface InsightsReport {
  dataset: InsightsDataset;
  adherence: AdherenceSummary;
  outcomes: OutcomeSummary;
  recommendationThemes: ThemeFrequency[];
  reflectionThemes: ThemeFrequency[];
  workflowHealth: WorkflowHealthItem[];
  timeline: TimelineEntry[];
  isEarlyData: boolean;
  hasApplicableAdherence: boolean;
}
