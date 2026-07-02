"use client";

import type { Iteration, Workflow } from "@/lib/domain/types";
import { getLatestAnalysis } from "@/lib/domain/derive";
import { IterationCard } from "./iteration-card";
import { CopyButton } from "@/components/shared/copy-button";

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
        <section className="rounded-xl border-2 border-emerald-200 bg-emerald-50/50 p-5 dark:border-emerald-900 dark:bg-emerald-950/20">
          <h2 className="text-sm font-semibold text-emerald-900 dark:text-emerald-300">
            What to do next
          </h2>
          <p className="mt-2 text-sm text-emerald-800 dark:text-emerald-400">
            {latestAnalysis.nextRecommendation}
          </p>
          {latestAnalysis.proposedPrompt ? (
            <div className="mt-4 flex items-center gap-2">
              <CopyButton
                text={latestAnalysis.proposedPrompt}
                label="Copy latest proposed prompt"
              />
            </div>
          ) : null}
        </section>
      ) : null}

      {sorted.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
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
