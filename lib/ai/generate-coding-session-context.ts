import type {
  CodingSession,
  UpdateCodingSessionContextInput,
} from "@/lib/domain/coding-types";
import type { Settings } from "@/lib/domain/types";
import {
  buildCodingSessionContextMessages,
  type CodingSessionContextGenerationInput,
} from "./build-coding-session-context-messages";
import { codingSessionContextResponseSchema } from "./coding-session-context-schema";
import { callOpenAIJson, OpenAIError } from "./openai-client";

export interface GeneratedCodingSessionContext
  extends UpdateCodingSessionContextInput {
  status: "completed" | "failed";
  errorMessage?: string;
  createdAt: string;
}

export interface GenerateCodingSessionContextResult {
  generated: GeneratedCodingSessionContext;
  wasTruncated: boolean;
}

function userFriendlyErrorMessage(message: string): string {
  if (
    message === "Malformed JSON in OpenAI response" ||
    message === "OpenAI response did not match expected schema"
  ) {
    return "The model returned session context Replica could not read. Try regenerating with clearer notes.";
  }
  return message;
}

function failedGeneratedContext(
  settings: Settings,
  errorMessage: string,
): GeneratedCodingSessionContext {
  return {
    summary: "",
    goals: [],
    constraints: [],
    relevantFiles: [],
    assumptions: [],
    notes: "",
    source: "generated",
    model: settings.openaiModel,
    status: "failed",
    errorMessage,
    createdAt: new Date().toISOString(),
  };
}

export async function generateCodingSessionContext(
  session: CodingSession,
  request: CodingSessionContextGenerationInput,
  settings: Settings,
): Promise<GenerateCodingSessionContextResult> {
  if (!settings.openaiApiKey.trim()) {
    throw new OpenAIError("OpenAI API key is not configured", 401);
  }

  const { system, user, wasTruncated } = buildCodingSessionContextMessages({
    session,
    request,
  });

  try {
    const response = await callOpenAIJson(
      settings.openaiApiKey,
      settings.openaiModel,
      system,
      user,
      codingSessionContextResponseSchema,
    );

    return {
      wasTruncated,
      generated: {
        summary: response.summary,
        goals: response.goals,
        constraints: response.constraints,
        relevantFiles: response.relevantFiles,
        assumptions: response.assumptions,
        notes: response.notes,
        source: "generated",
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
          : "Session context generation failed";

    return {
      wasTruncated,
      generated: failedGeneratedContext(settings, message),
    };
  }
}
