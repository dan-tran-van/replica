"use client";

import { useState } from "react";
import type { Iteration, Workflow } from "@/lib/domain/types";
import { OutcomeBadge } from "@/components/shared/outcome-badge";
import { AnalysisPanel } from "./analysis-panel";
import { analyzeIteration } from "@/lib/ai/analyze-iteration";
import { useRepositories } from "@/components/providers/repository-provider";
import { useSettings } from "@/lib/hooks/use-settings";

interface IterationCardProps {
  iteration: Iteration;
  workflow: Workflow;
  priorIterations: Iteration[];
  defaultExpanded?: boolean;
  onAnalysisUpdated?: () => void;
}

export function IterationCard({
  iteration,
  workflow,
  priorIterations,
  defaultExpanded = false,
  onAnalysisUpdated,
}: IterationCardProps) {
  const { iterations: iterationRepo } = useRepositories();
  const { settings } = useSettings();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [isRetrying, setIsRetrying] = useState(false);
  const [localAnalysis, setLocalAnalysis] = useState(iteration.analysis);

  async function handleRetry() {
    if (!settings) return;
    setIsRetrying(true);
    try {
      const result = await analyzeIteration(
        workflow,
        priorIterations,
        iteration,
        settings,
      );
      await iterationRepo.updateAnalysis(iteration.id, result.analysis);
      setLocalAnalysis(result.analysis);
      onAnalysisUpdated?.();
    } finally {
      setIsRetrying(false);
    }
  }

  const needsRetry =
    localAnalysis === null ||
    localAnalysis.status === "failed";

  return (
    <article className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            Run #{iteration.sequenceNumber}
          </span>
          <OutcomeBadge outcome={iteration.outcome} />
        </div>
        <span className="text-xs text-zinc-400">
          {new Date(iteration.createdAt).toLocaleDateString()}
        </span>
      </button>

      {expanded ? (
        <div className="space-y-4 border-t border-zinc-200 px-4 py-4 dark:border-zinc-800">
          <div>
            <h4 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Prompt used
            </h4>
            <pre className="mt-1 whitespace-pre-wrap font-mono text-xs text-zinc-700 dark:text-zinc-300">
              {iteration.promptUsed}
            </pre>
          </div>

          <div>
            <h4 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Observations
            </h4>
            <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">
              {iteration.observations || "(none)"}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Manus output
            </h4>
            <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap font-mono text-xs text-zinc-700 dark:text-zinc-300">
              {iteration.manusOutput}
            </pre>
          </div>

          {localAnalysis ? (
            <AnalysisPanel
              analysis={localAnalysis}
              onRetry={needsRetry ? () => void handleRetry() : undefined}
              isRetrying={isRetrying}
            />
          ) : (
            <div className="rounded-lg border border-dashed border-zinc-300 p-4 dark:border-zinc-700">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Analysis pending or not yet run.
              </p>
              <button
                type="button"
                onClick={() => void handleRetry()}
                disabled={isRetrying || !settings?.openaiApiKey}
                className="mt-2 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium disabled:opacity-50 dark:border-zinc-600"
              >
                {isRetrying ? "Analyzing…" : "Run analysis"}
              </button>
            </div>
          )}
        </div>
      ) : null}
    </article>
  );
}
