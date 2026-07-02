import type { Settings } from "@/lib/domain/types";
import type { InsightsReport } from "@/lib/insights/types";
import { buildInsightsReflectionMessages } from "./build-insights-reflection-messages";
import {
  insightsReflectionSchema,
  type InsightsReflection,
} from "./insights-reflection-schema";
import { callOpenAIJson, OpenAIError } from "./openai-client";

export async function generateInsightsReflection(
  report: InsightsReport,
  settings: Settings,
): Promise<InsightsReflection> {
  if (!settings.openaiApiKey.trim()) {
    throw new OpenAIError("OpenAI API key is not configured", 401);
  }

  const { system, user } = buildInsightsReflectionMessages(report);

  return callOpenAIJson(
    settings.openaiApiKey,
    settings.openaiModel,
    system,
    user,
    insightsReflectionSchema,
  );
}
