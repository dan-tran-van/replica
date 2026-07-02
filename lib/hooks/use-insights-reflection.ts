"use client";

import { useCallback, useState } from "react";
import type { InsightsReport } from "@/lib/insights/types";
import type { InsightsReflection } from "@/lib/ai/insights-reflection-schema";
import { generateInsightsReflection } from "@/lib/ai/insights-reflection";
import { useSettings } from "@/lib/hooks/use-settings";

export function useInsightsReflection() {
  const { settings } = useSettings();
  const [reflection, setReflection] = useState<InsightsReflection | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (report: InsightsReport) => {
      if (!settings) {
        setError("Settings not loaded");
        return;
      }
      setIsGenerating(true);
      setError(null);
      try {
        const result = await generateInsightsReflection(report, settings);
        setReflection(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to generate reflection",
        );
      } finally {
        setIsGenerating(false);
      }
    },
    [settings],
  );

  const reset = useCallback(() => {
    setReflection(null);
    setError(null);
  }, []);

  return { reflection, generate, isGenerating, error, reset };
}
