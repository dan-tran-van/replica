import type { MergeResult } from "@/lib/domain/merge-types";
import type { ResolvedMergeSource } from "@/lib/domain/resolve-merge-sources";
import type { Settings } from "@/lib/domain/types";
import { buildMergeMessages } from "./build-merge-messages";
import { callOpenAIJson, OpenAIError } from "./openai-client";
import { mergeReflectionResponseSchema } from "./merge-reflection-schema";

export interface GenerateMergeReflectionResult {
  result: MergeResult;
  wasTruncated: boolean;
}

function emptyFailedResult(
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

export async function generateMergeReflection(
  resolved: ResolvedMergeSource[],
  userGoal: string | undefined,
  settings: Settings,
): Promise<GenerateMergeReflectionResult> {
  if (!settings.openaiApiKey.trim()) {
    throw new OpenAIError("OpenAI API key is not configured", 401);
  }

  const { system, user, wasTruncated } = buildMergeMessages({
    resolved,
    userGoal,
  });

  try {
    const response = await callOpenAIJson(
      settings.openaiApiKey,
      settings.openaiModel,
      system,
      user,
      mergeReflectionResponseSchema,
    );

    return {
      wasTruncated,
      result: {
        mergedSummary: response.mergedSummary,
        sharedPatterns: response.sharedPatterns,
        uniqueFindings: response.uniqueFindings,
        conflictsOrTensions: response.conflictsOrTensions,
        missingInformation: response.missingInformation,
        higherLevelInsight: response.higherLevelInsight,
        recommendedStrategy: response.recommendedStrategy,
        proposedPrompt: response.proposedPrompt?.trim() || undefined,
        nextRecommendation: response.nextRecommendation,
        reasoning: response.reasoning,
        model: settings.openaiModel,
        status: "completed",
        createdAt: new Date().toISOString(),
      },
    };
  } catch (err) {
    const message =
      err instanceof OpenAIError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Merge failed";

    return {
      wasTruncated,
      result: emptyFailedResult(settings, message),
    };
  }
}
