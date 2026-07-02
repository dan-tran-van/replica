"use client";

import type { Iteration, Workflow } from "@/lib/domain/types";
import { getLatestAnalysis } from "@/lib/domain/derive";
import { IterationCard } from "./iteration-card";
import { CopyButton } from "@/components/shared/copy-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface IterationTimelineProps {
  workflow: Workflow;
  iterations: Iteration[];
  onAnalysisUpdated?: () => void;
}

export function IterationTimeline({
  workflow,
  iterations,
  onAnalysisUpdated,
}: IterationTimelineProps) {
  const latestAnalysis = getLatestAnalysis(iterations);
  const sorted = [...iterations].sort(
    (a, b) => b.sequenceNumber - a.sequenceNumber,
  );

  return (
    <div className="space-y-6">
      {latestAnalysis ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-sm text-primary">
              What to do next
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {latestAnalysis.nextRecommendation}
            </p>
            {latestAnalysis.proposedPrompt ? (
              <CopyButton
                text={latestAnalysis.proposedPrompt}
                label="Copy latest proposed prompt"
              />
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No runs logged yet. Run your starter prompt in Manus, then log the
          results.
        </p>
      ) : (
        <ul className="space-y-3">
          {sorted.map((iteration, index) => (
            <li key={iteration.id}>
              <IterationCard
                iteration={iteration}
                workflow={workflow}
                priorIterations={iterations.filter(
                  (i) => i.sequenceNumber < iteration.sequenceNumber,
                )}
                defaultExpanded={index === 0}
                onAnalysisUpdated={onAnalysisUpdated}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
