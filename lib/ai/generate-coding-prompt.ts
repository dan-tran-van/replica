import type {
  CodingRecommendedMode,
  CodingSession,
} from "@/lib/domain/coding-types";
import type { Settings } from "@/lib/domain/types";
import {
  buildCodingPromptGenerationMessages,
  type CodingPromptGenerationInput,
} from "./build-coding-prompt-generation-messages";
import { codingPromptGenerationResponseSchema } from "./coding-prompt-generation-schema";
import { callOpenAIJson, OpenAIError } from "./openai-client";

export interface GeneratedCodingPrompt {
  recommendedMode: CodingRecommendedMode;
  recommendedModeRationale: string;
  generatedPrompt: string;
  nextActions: string[];
  retryChecklist: string[];
  tokenWasteReductionReason: string;
  model: string;
  status: "completed" | "failed";
  errorMessage?: string;
  createdAt: string;
}

export interface GenerateCodingPromptResult {
  generated: GeneratedCodingPrompt;
  wasTruncated: boolean;
}

function userFriendlyErrorMessage(message: string): string {
  if (
    message === "Malformed JSON in OpenAI response" ||
    message === "OpenAI response did not match expected schema"
  ) {
    return "The model returned a response Replica could not read. Try regenerating or add clearer context.";
  }
  return message;
}

function failedGeneratedPrompt(
  settings: Settings,
  errorMessage: string,
): GeneratedCodingPrompt {
  return {
    recommendedMode: "investigate",
    recommendedModeRationale: "",
    generatedPrompt: "",
    nextActions: [],
    retryChecklist: [],
    tokenWasteReductionReason: "",
    model: settings.openaiModel,
    status: "failed",
    errorMessage,
    createdAt: new Date().toISOString(),
  };
}

export async function generateCodingPrompt(
  session: CodingSession,
  request: CodingPromptGenerationInput,
  settings: Settings,
): Promise<GenerateCodingPromptResult> {
  if (!settings.openaiApiKey.trim()) {
    throw new OpenAIError("OpenAI API key is not configured", 401);
  }

  const { system, user, wasTruncated } = buildCodingPromptGenerationMessages({
    session,
    request,
  });

  try {
    const response = await callOpenAIJson(
      settings.openaiApiKey,
      settings.openaiModel,
      system,
      user,
      codingPromptGenerationResponseSchema,
    );

    return {
      wasTruncated,
      generated: {
        recommendedMode: response.recommendedMode,
        recommendedModeRationale: response.recommendedModeRationale,
        generatedPrompt: response.generatedPrompt,
        nextActions: response.nextActions,
        retryChecklist: response.retryChecklist,
        tokenWasteReductionReason: response.tokenWasteReductionReason,
        model: settings.openaiModel,
        status: "completed",
        createdAt: new Date().toISOString(),
      },
    };
  } catch (err) {
    const message =
      err instanceof OpenAIError
        ? userFriendlyErrorMessage(err.message)
        : err instanceof Error
          ? err.message
          : "Prompt generation failed";

    return {
      wasTruncated,
      generated: failedGeneratedPrompt(settings, message),
    };
  }
}
