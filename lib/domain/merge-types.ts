import type { AnalysisStatus } from "@/lib/domain/types";

export type MergeSource =
  | {
      kind: "run";
      id: string;
      workflowId: string;
      iterationId: string;
      label?: string;
      perspective?: string;
    }
  | {
      kind: "manual";
      id: string;
      label?: string;
      perspective?: string;
      content: string;
      notes?: string;
      sourceTool?: string;
    };

export interface MergeResult {
  mergedSummary: string;
  sharedPatterns: string[];
  uniqueFindings: string[];
  conflictsOrTensions: string[];
  missingInformation: string[];
  higherLevelInsight: string;
  recommendedStrategy: string;
  proposedPrompt?: string;
  nextRecommendation: string;
  reasoning: string;
  model: string;
  status: AnalysisStatus;
  errorMessage?: string;
  createdAt: string;
}

export interface MergeSession {
  id: string;
  title: string;
  userGoal?: string;
  sources: MergeSource[];
  result: MergeResult | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMergeSessionInput {
  title: string;
  userGoal?: string;
  sources: MergeSource[];
}

export function createManualSource(
  content: string,
  fields?: {
    label?: string;
    perspective?: string;
    notes?: string;
    sourceTool?: string;
  },
): MergeSource {
  return {
    kind: "manual",
    id: crypto.randomUUID(),
    content: content.trim(),
    ...fields,
  };
}

export function createRunSource(
  workflowId: string,
  iterationId: string,
  fields?: { label?: string; perspective?: string },
): MergeSource {
  return {
    kind: "run",
    id: crypto.randomUUID(),
    workflowId,
    iterationId,
    ...fields,
  };
}
