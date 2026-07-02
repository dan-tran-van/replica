"use client";

import { useState } from "react";
import type { Iteration, Workflow } from "@/lib/domain/types";
import { adherenceLabel, AdherenceBadge } from "@/components/shared/adherence-badge";
import { OutcomeBadge } from "@/components/shared/outcome-badge";
import { AnalysisPanel } from "./analysis-panel";
import { analyzeIteration } from "@/lib/ai/analyze-iteration";
import { useRepositories } from "@/components/providers/repository-provider";
import { useSettings } from "@/lib/hooks/use-settings";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    localAnalysis === null || localAnalysis.status === "failed";

  const adherenceText = adherenceLabel(iteration.followedPriorRecommendation);

  return (
    <Card size="sm">
      <CardHeader className="p-0 px-4">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-between gap-3 py-3 text-left"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">
              Run #{iteration.sequenceNumber}
            </span>
            <OutcomeBadge outcome={iteration.outcome} />
            <AdherenceBadge adherence={iteration.followedPriorRecommendation} />
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {new Date(iteration.createdAt).toLocaleDateString()}
          </span>
        </button>
      </CardHeader>

      {expanded ? (
        <CardContent className="space-y-4 border-t pt-4">
          {adherenceText ? (
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Followed prior recommendation
              </h4>
              <p className="mt-1 text-sm">{adherenceText}</p>
            </div>
          ) : null}

          <div>
            <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Prompt used
            </h4>
            <pre className="mt-1 whitespace-pre-wrap font-mono text-xs text-muted-foreground">
              {iteration.promptUsed}
            </pre>
          </div>

          <div>
            <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Observations
            </h4>
            <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
              {iteration.observations || "(none)"}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Manus output
            </h4>
            <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap font-mono text-xs text-muted-foreground">
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
            <Card size="sm" className="border-dashed">
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Analysis pending or not yet run.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void handleRetry()}
                  disabled={isRetrying || !settings?.openaiApiKey}
                >
                  {isRetrying ? "Analyzing…" : "Run analysis"}
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      ) : null}
    </Card>
  );
}
