export type WorkflowType = "manus-scheduled";

export type Outcome = "success" | "partial" | "failure";

export type AnalysisStatus = "completed" | "failed";

export interface Workflow {
  id: string;
  name: string;
  starterPrompt: string;
  workflowType: WorkflowType;
  createdAt: string;
  updatedAt: string;
}

export interface IterationAnalysis {
  proposedPrompt: string;
  reasoning: string;
  nextRecommendation: string;
  model: string;
  status: AnalysisStatus;
  errorMessage?: string;
  createdAt: string;
}

export interface Iteration {
  id: string;
  workflowId: string;
  sequenceNumber: number;
  promptUsed: string;
  manusOutput: string;
  outcome: Outcome;
  observations: string;
  analysis: IterationAnalysis | null;
  createdAt: string;
}

export interface Settings {
  id: "app-settings";
  openaiApiKey: string;
  openaiModel: string;
}

export const SETTINGS_ID = "app-settings" as const;

export const DEFAULT_SETTINGS: Settings = {
  id: SETTINGS_ID,
  openaiApiKey: "",
  openaiModel: "gpt-4o-mini",
};

export const OPENAI_MODELS = [
  { value: "gpt-4o-mini", label: "GPT-4o mini (recommended)" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4.1-mini", label: "GPT-4.1 mini" },
] as const;

export interface CreateWorkflowInput {
  name: string;
  starterPrompt: string;
}

export interface CreateIterationInput {
  workflowId: string;
  promptUsed: string;
  manusOutput: string;
  outcome: Outcome;
  observations: string;
}
