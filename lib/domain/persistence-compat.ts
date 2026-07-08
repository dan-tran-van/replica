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
