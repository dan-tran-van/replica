"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRepositories } from "@/components/providers/repository-provider";
import { loadInsightsDataset } from "@/lib/insights/load-dataset";
import { computeInsightsReport } from "@/lib/insights/compute";
import type { InsightsReport } from "@/lib/insights/types";

export function useInsights() {
  const repos = useRepositories();
  const [report, setReport] = useState<InsightsReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const dataset = await loadInsightsDataset(repos);
      setReport(computeInsightsReport(dataset));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load insights");
    } finally {
      setIsLoading(false);
    }
  }, [repos]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const dataset = await loadInsightsDataset(repos);
        if (!cancelled) {
          setReport(computeInsightsReport(dataset));
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load insights",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [repos]);

  const summary = useMemo(() => {
    if (!report) return null;
    return {
      workflowCount: report.dataset.workflows.length,
      iterationCount: report.dataset.iterations.length,
      isEarlyData: report.isEarlyData,
      hasApplicableAdherence: report.hasApplicableAdherence,
    };
  }, [report]);

  return { report, summary, isLoading, error, refetch };
}
