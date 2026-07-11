import type { AnalysisStatus } from "@/lib/domain/types";

export const CODING_RECOMMENDED_MODES = [
  "plan",
  "implement",
  "debug",
  "test",
  "refactor",
  "review",
  "explain",
  "investigate",
  "continue",
  "verify",
] as const;

export type CodingRecommendedMode = (typeof CODING_RECOMMENDED_MODES)[number];

export const CODING_ATTEMPT_OUTCOMES = [
  "unknown",
  "notRun",
  "helpful",
  "partiallyHelpful",
  "fixed",
  "notHelpful",
  "madeWorse",
] as const;

export type CodingAttemptOutcome = (typeof CODING_ATTEMPT_OUTCOMES)[number];

export const CODING_ATTEMPT_STATUSES = [
  "failed",
  "needsImprovement",
  "completed",
] as const;

export type CodingAttemptStatus = (typeof CODING_ATTEMPT_STATUSES)[number];

export const CODING_ATTEMPT_SOURCES = [
  "manual",
  "generatedFromDescription",
  "generatedFromReflection",
] as const;

export type CodingAttemptSource = (typeof CODING_ATTEMPT_SOURCES)[number];

export type CodingSessionStatus = "active" | "resolved";

export const CODING_SESSION_CONTEXT_SOURCES = ["manual", "generated"] as const;

export type CodingSessionContextSource =
  (typeof CODING_SESSION_CONTEXT_SOURCES)[number];

export interface CodingSessionContext {
  summary: string;
  goals: string[];
  constraints: string[];
  relevantFiles: string[];
  assumptions: string[];
  notes: string;
  source: CodingSessionContextSource;
  model?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CodingReflection {
  summary: string;
  whatWentWrong: string[];
  missingContext: string[];
  recommendedMode: CodingRecommendedMode;
  recommendedModeRationale: string;
  betterNextPrompt: string;
  nextActions: string[];
  retryChecklist: string[];
  tokenWasteReductionReason: string;
  model: string;
  status: AnalysisStatus;
  errorMessage?: string;
  createdAt: string;
}

export interface CodingAttempt {
  id: string;
  toolUsed: string;
  originalPrompt: string;
  aiOutput: string;
  errorOutput: string;
  developerNotes: string;
  resultSummary: string;
  status: CodingAttemptStatus;
  generatedReflection: CodingReflection | null;
  createdAt: string;
  outcome: CodingAttemptOutcome;
  outcomeNotes: string;
  basedOnAttemptId?: string;
  recommendedMode?: CodingRecommendedMode;
  source: CodingAttemptSource;
}

export interface CodingSession {
  id: string;
  title: string;
  taskDescription: string;
  createdAt: string;
  updatedAt: string;
  status: CodingSessionStatus;
  sessionContext: CodingSessionContext | null;
  attempts: CodingAttempt[];
}

export interface CreateCodingSessionInput {
  title: string;
  taskDescription: string;
}

export interface CreateCodingAttemptInput {
  toolUsed: string;
  originalPrompt: string;
  aiOutput: string;
  errorOutput: string;
  developerNotes: string;
  resultSummary: string;
  status: CodingAttemptStatus;
  basedOnAttemptId?: string;
  recommendedMode?: CodingRecommendedMode;
  source?: CodingAttemptSource;
}

export interface UpdateCodingAttemptOutcomeInput {
  outcome: CodingAttemptOutcome;
  outcomeNotes: string;
}

export interface UpdateCodingAttemptInput {
  toolUsed: string;
  originalPrompt: string;
  aiOutput: string;
  errorOutput: string;
  developerNotes: string;
  resultSummary: string;
  status: CodingAttemptStatus;
  recommendedMode?: CodingRecommendedMode;
  source?: CodingAttemptSource;
}

export interface UpdateCodingSessionContextInput {
  summary: string;
  goals: string[];
  constraints: string[];
  relevantFiles: string[];
  assumptions: string[];
  notes: string;
  source?: CodingSessionContextSource;
  model?: string;
}
