import type {
  CodingAttempt,
  CodingReflection,
  CodingSession,
} from "@/lib/domain/coding-types";
import type { Settings } from "@/lib/domain/types";
import { createFailedCodingReflection } from "@/lib/domain/persistence-compat";
import { buildCodingReflectionMessages } from "./build-coding-reflection-messages";
import { codingReflectionResponseSchema } from "./coding-reflection-schema";
import { callOpenAIJson, OpenAIError } from "./openai-client";

export interface GenerateCodingReflectionResult {
  reflection: CodingReflection;
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

export async function generateCodingReflection(
  session: CodingSession,
  attempt: CodingAttempt,
  settings: Settings,
): Promise<GenerateCodingReflectionResult> {
  if (!settings.openaiApiKey.trim()) {
    throw new OpenAIError("OpenAI API key is not configured", 401);
  }

  const { system, user, wasTruncated } = buildCodingReflectionMessages({
    session,
    attempt,
  });

  try {
    const response = await callOpenAIJson(
      settings.openaiApiKey,
      settings.openaiModel,
      system,
      user,
      codingReflectionResponseSchema,
    );

    return {
      wasTruncated,
      reflection: {
        summary: response.summary,
        whatWentWrong: response.whatWentWrong,
        missingContext: response.missingContext,
        recommendedMode: response.recommendedMode,
        recommendedModeRationale: response.recommendedModeRationale,
        betterNextPrompt: response.betterNextPrompt,
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
          : "Coding reflection failed";

    return {
      wasTruncated,
      reflection: createFailedCodingReflection(settings, message),
    };
  }
}
