import type {
  Iteration,
  IterationAnalysis,
  Settings,
  Workflow,
} from "@/lib/domain/types";
import { buildAnalysisMessages } from "./build-analysis-messages";
import { callOpenAI, OpenAIError } from "./openai-client";

export interface AnalyzeIterationResult {
  analysis: IterationAnalysis;
  wasTruncated: boolean;
}

export async function analyzeIteration(
  workflow: Workflow,
  priorIterations: Iteration[],
  currentIteration: Iteration,
  settings: Settings,
): Promise<AnalyzeIterationResult> {
  if (!settings.openaiApiKey.trim()) {
    throw new OpenAIError("OpenAI API key is not configured", 401);
  }

  const { system, user, wasTruncated } = buildAnalysisMessages({
    workflow,
    priorIterations,
    currentIteration,
  });

  try {
    const response = await callOpenAI(
      settings.openaiApiKey,
      settings.openaiModel,
      system,
      user,
    );

    return {
      wasTruncated,
      analysis: {
        proposedPrompt: response.proposedPrompt,
        reasoning: response.reasoning,
        nextRecommendation: response.nextRecommendation,
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
          : "Analysis failed";

    return {
      wasTruncated,
      analysis: {
        proposedPrompt: "",
        reasoning: "",
        nextRecommendation: "",
        model: settings.openaiModel,
        status: "failed",
        errorMessage: message,
        createdAt: new Date().toISOString(),
      },
    };
  }
}
