import {
  CODING_ATTEMPT_OUTCOMES,
  CODING_ATTEMPT_SOURCES,
  CODING_ATTEMPT_STATUSES,
  CODING_RECOMMENDED_MODES,
  CODING_SESSION_CONTEXT_SOURCES,
  type CodingAttempt,
  type CodingAttemptOutcome,
  type CodingAttemptSource,
  type CodingAttemptStatus,
  type CodingRecommendedMode,
  type CodingReflection,
  type CodingSession,
  type CodingSessionContext,
  type CodingSessionContextSource,
} from "@/lib/domain/coding-types";
import {
  DEFAULT_SETTINGS,
  SETTINGS_ID,
  type Iteration,
  type IterationAnalysis,
  type RecommendationAdherence,
  type Settings,
  type Workflow,
} from "@/lib/domain/types";
import type { MergeResult, MergeSession, MergeSource } from "@/lib/domain/merge-types";

const ISO_EPOCH = new Date(0).toISOString();
const ADHERENCE_VALUES: RecommendationAdherence[] = [
  "yes",
  "partially",
  "no",
  "not_applicable",
];

const CODING_DEFAULT_MODE: CodingRecommendedMode = "investigate";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function readOptionalString(value: unknown): string | undefined {
  const text = readString(value);
  return text || undefined;
}

function readIsoString(value: unknown, fallback = ISO_EPOCH): string {
  if (typeof value !== "string") return fallback;
  return Number.isNaN(Date.parse(value)) ? fallback : value;
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => readString(item)).filter(Boolean);
}

function readAdherence(value: unknown): RecommendationAdherence {
  return typeof value === "string" && ADHERENCE_VALUES.includes(value as RecommendationAdherence)
    ? (value as RecommendationAdherence)
    : "not_applicable";
}

function readCodingRecommendedMode(value: unknown): CodingRecommendedMode {
  return typeof value === "string" &&
    CODING_RECOMMENDED_MODES.includes(value as CodingRecommendedMode)
    ? (value as CodingRecommendedMode)
    : CODING_DEFAULT_MODE;
}

function readOptionalCodingRecommendedMode(
  value: unknown,
): CodingRecommendedMode | undefined {
  return typeof value === "string" &&
    CODING_RECOMMENDED_MODES.includes(value as CodingRecommendedMode)
    ? (value as CodingRecommendedMode)
    : undefined;
}

function readCodingAttemptStatus(value: unknown): CodingAttemptStatus {
  return typeof value === "string" &&
    CODING_ATTEMPT_STATUSES.includes(value as CodingAttemptStatus)
    ? (value as CodingAttemptStatus)
    : "needsImprovement";
}

function readCodingAttemptOutcome(value: unknown): CodingAttemptOutcome {
  return typeof value === "string" &&
    CODING_ATTEMPT_OUTCOMES.includes(value as CodingAttemptOutcome)
    ? (value as CodingAttemptOutcome)
    : "unknown";
}

function readCodingAttemptSource(value: unknown): CodingAttemptSource {
  return typeof value === "string" &&
    CODING_ATTEMPT_SOURCES.includes(value as CodingAttemptSource)
    ? (value as CodingAttemptSource)
    : "manual";
}

function readCodingSessionContextSource(
  value: unknown,
): CodingSessionContextSource {
  return typeof value === "string" &&
    CODING_SESSION_CONTEXT_SOURCES.includes(value as CodingSessionContextSource)
    ? (value as CodingSessionContextSource)
    : "manual";
}

function normalizeAnalysis(value: unknown): IterationAnalysis | null {
  if (!isRecord(value)) return null;

  const status = value.status === "failed" ? "failed" : "completed";
  return {
    proposedPrompt: readString(value.proposedPrompt),
    reasoning: readString(value.reasoning),
    nextRecommendation: readString(value.nextRecommendation),
    model: readString(value.model, "unknown"),
    status,
    errorMessage: readOptionalString(value.errorMessage),
    createdAt: readIsoString(value.createdAt),
  };
}

export function normalizeCodingReflectionRecord(
  value: unknown,
): CodingReflection | null {
  if (!isRecord(value)) return null;

  const status = value.status === "failed" ? "failed" : "completed";
  return {
    summary: readString(value.summary),
    whatWentWrong: readStringArray(value.whatWentWrong),
    missingContext: readStringArray(value.missingContext),
    recommendedMode: readCodingRecommendedMode(value.recommendedMode),
    recommendedModeRationale: readString(value.recommendedModeRationale),
    betterNextPrompt: readString(value.betterNextPrompt),
    nextActions: readStringArray(value.nextActions),
    retryChecklist: readStringArray(value.retryChecklist),
    tokenWasteReductionReason: readString(value.tokenWasteReductionReason),
    model: readString(value.model, "unknown"),
    status,
    errorMessage: readOptionalString(value.errorMessage),
    createdAt: readIsoString(value.createdAt),
  };
}

function normalizeCodingAttemptRecord(value: unknown): CodingAttempt | null {
  if (!isRecord(value)) return null;

  const id = readString(value.id);
  if (!id) return null;

  return {
    id,
    toolUsed: readString(value.toolUsed),
    originalPrompt: readString(value.originalPrompt),
    aiOutput: readString(value.aiOutput),
    errorOutput: readString(value.errorOutput),
    developerNotes: readString(value.developerNotes),
    resultSummary: readString(value.resultSummary),
    status: readCodingAttemptStatus(value.status),
    generatedReflection:
      value.generatedReflection === null
        ? null
        : normalizeCodingReflectionRecord(value.generatedReflection),
    createdAt: readIsoString(value.createdAt),
    outcome: readCodingAttemptOutcome(value.outcome),
    outcomeNotes: readString(value.outcomeNotes),
    basedOnAttemptId: readOptionalString(value.basedOnAttemptId),
    recommendedMode: readOptionalCodingRecommendedMode(value.recommendedMode),
    source: readCodingAttemptSource(value.source),
  };
}

export function normalizeCodingSessionContextRecord(
  value: unknown,
): CodingSessionContext | null {
  if (!isRecord(value)) return null;

  const summary = readString(value.summary);
  const notes = readString(value.notes);
  const goals = readStringArray(value.goals);
  const constraints = readStringArray(value.constraints);
  const relevantFiles = readStringArray(value.relevantFiles);
  const assumptions = readStringArray(value.assumptions);

  if (
    !summary &&
    !notes &&
    goals.length === 0 &&
    constraints.length === 0 &&
    relevantFiles.length === 0 &&
    assumptions.length === 0
  ) {
    return null;
  }

  const createdAt = readIsoString(value.createdAt);
  return {
    summary,
    goals,
    constraints,
    relevantFiles,
    assumptions,
    notes,
    source: readCodingSessionContextSource(value.source),
    model: readOptionalString(value.model),
    createdAt,
    updatedAt: readIsoString(value.updatedAt, createdAt),
  };
}

export function normalizeMergeResultRecord(value: unknown): MergeResult | null {
  if (!isRecord(value)) return null;

  const status = value.status === "failed" ? "failed" : "completed";
  const mergedSummary = readString(value.mergedSummary);
  const higherLevelInsight = readString(value.higherLevelInsight);
  const recommendedStrategy = readString(value.recommendedStrategy);
  const nextRecommendation = readString(value.nextRecommendation);

  return {
    mergedSummary:
      mergedSummary ||
      higherLevelInsight ||
      recommendedStrategy ||
      nextRecommendation,
    sharedPatterns: readStringArray(value.sharedPatterns),
    uniqueFindings: readStringArray(value.uniqueFindings),
    conflictsOrTensions: readStringArray(value.conflictsOrTensions),
    missingInformation: readStringArray(value.missingInformation),
    higherLevelInsight,
    recommendedStrategy,
    proposedPrompt: readOptionalString(value.proposedPrompt),
    nextRecommendation,
    reasoning: readString(value.reasoning),
    model: readString(value.model, "unknown"),
    status,
    errorMessage: readOptionalString(value.errorMessage),
    createdAt: readIsoString(value.createdAt),
  };
}

function normalizeMergeSource(value: unknown): MergeSource | null {
  if (!isRecord(value)) return null;

  const id = readString(value.id);
  if (!id) return null;

  if (value.kind === "run") {
    const workflowId = readString(value.workflowId);
    const iterationId = readString(value.iterationId);
    if (!workflowId || !iterationId) return null;

    return {
      kind: "run",
      id,
      workflowId,
      iterationId,
      label: readOptionalString(value.label),
      perspective: readOptionalString(value.perspective),
    };
  }

  if (value.kind === "manual") {
    const content = readString(value.content);
    if (!content) return null;

    return {
      kind: "manual",
      id,
      content,
      label: readOptionalString(value.label),
      perspective: readOptionalString(value.perspective),
      notes: readOptionalString(value.notes),
      sourceTool: readOptionalString(value.sourceTool),
    };
  }

  return null;
}

export function normalizeWorkflowRecord(value: unknown): Workflow | null {
  if (!isRecord(value)) return null;

  const id = readString(value.id);
  if (!id) return null;

  const createdAt = readIsoString(value.createdAt);
  return {
    id,
    name: readString(value.name, "Untitled workflow"),
    starterPrompt: readString(value.starterPrompt),
    workflowType: "manus-scheduled",
    createdAt,
    updatedAt: readIsoString(value.updatedAt, createdAt),
  };
}

export function normalizeIterationRecord(value: unknown): Iteration | null {
  if (!isRecord(value)) return null;

  const id = readString(value.id);
  const workflowId = readString(value.workflowId);
  if (!id || !workflowId) return null;

  return {
    id,
    workflowId,
    sequenceNumber:
      typeof value.sequenceNumber === "number" &&
      Number.isFinite(value.sequenceNumber)
        ? value.sequenceNumber
        : 0,
    promptUsed: readString(value.promptUsed),
    manusOutput: readString(value.manusOutput),
    outcome:
      value.outcome === "success" ||
      value.outcome === "partial" ||
      value.outcome === "failure"
        ? value.outcome
        : "partial",
    observations: readString(value.observations),
    followedPriorRecommendation: readAdherence(
      value.followedPriorRecommendation,
    ),
    analysis: normalizeAnalysis(value.analysis),
    createdAt: readIsoString(value.createdAt),
  };
}

export function normalizeSettingsRecord(value: unknown): Settings {
  if (!isRecord(value)) {
    return { ...DEFAULT_SETTINGS };
  }

  return {
    id: SETTINGS_ID,
    openaiApiKey: readString(value.openaiApiKey),
    openaiModel: readString(value.openaiModel, DEFAULT_SETTINGS.openaiModel),
  };
}

export function normalizeMergeSessionRecord(value: unknown): MergeSession | null {
  if (!isRecord(value)) return null;

  const id = readString(value.id);
  if (!id) return null;

  const createdAt = readIsoString(value.createdAt);
  const updatedAt = readIsoString(value.updatedAt, createdAt);
  const sources = Array.isArray(value.sources)
    ? value.sources
        .map((source) => normalizeMergeSource(source))
        .filter((source): source is MergeSource => source !== null)
    : [];

  return {
    id,
    title: readString(value.title, "Untitled merge"),
    userGoal: readOptionalString(value.userGoal),
    sources,
    result: value.result === null ? null : normalizeMergeResultRecord(value.result),
    createdAt,
    updatedAt,
  };
}

export function normalizeCodingSessionRecord(
  value: unknown,
): CodingSession | null {
  if (!isRecord(value)) return null;

  const id = readString(value.id);
  if (!id) return null;

  const createdAt = readIsoString(value.createdAt);
  const attempts = Array.isArray(value.attempts)
    ? value.attempts
        .map((attempt) => normalizeCodingAttemptRecord(attempt))
        .filter((attempt): attempt is CodingAttempt => attempt !== null)
    : [];

  return {
    id,
    title: readString(value.title, "Untitled coding session"),
    taskDescription: readString(value.taskDescription),
    createdAt,
    updatedAt: readIsoString(value.updatedAt, createdAt),
    status: value.status === "resolved" ? "resolved" : "active",
    sessionContext: normalizeCodingSessionContextRecord(value.sessionContext),
    attempts,
  };
}

export function createFailedMergeResult(
  settings: Settings,
  errorMessage: string,
): MergeResult {
  return {
    mergedSummary: "",
    sharedPatterns: [],
    uniqueFindings: [],
    conflictsOrTensions: [],
    missingInformation: [],
    higherLevelInsight: "",
    recommendedStrategy: "",
    proposedPrompt: undefined,
    nextRecommendation: "",
    reasoning: "",
    model: settings.openaiModel,
    status: "failed",
    errorMessage,
    createdAt: new Date().toISOString(),
  };
}

export function createFailedCodingReflection(
  settings: Settings,
  errorMessage: string,
): CodingReflection {
  return {
    summary: "",
    whatWentWrong: [],
    missingContext: [],
    recommendedMode: CODING_DEFAULT_MODE,
    recommendedModeRationale: "",
    betterNextPrompt: "",
    nextActions: [],
    retryChecklist: [],
    tokenWasteReductionReason: "",
    model: settings.openaiModel,
    status: "failed",
    errorMessage,
    createdAt: new Date().toISOString(),
  };
}
