"use client";

import Link from "next/link";
import type { IterationAnalysis } from "@/lib/domain/types";
import { CopyButton } from "@/components/shared/copy-button";

interface AnalysisPanelProps {
  analysis: IterationAnalysis;
  wasTruncated?: boolean;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function AnalysisPanel({
  analysis,
  wasTruncated,
  onRetry,
  isRetrying,
}: AnalysisPanelProps) {
  if (analysis.status === "failed") {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40">
        <p className="text-sm font-medium text-red-800 dark:text-red-300">
          Analysis failed
        </p>
        <p className="mt-1 text-sm text-red-700 dark:text-red-400">
          {analysis.errorMessage ?? "An unknown error occurred."}
        </p>
        {onRetry ? (
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={onRetry}
              disabled={isRetrying}
              className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-800 transition-colors hover:bg-red-100 disabled:opacity-50 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
            >
              {isRetrying ? "Retrying…" : "Retry analysis"}
            </button>
            <Link
              href="/settings"
              className="text-sm text-red-700 underline dark:text-red-400"
            >
              Check API key
            </Link>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900/50">
      {wasTruncated ? (
        <p className="text-xs text-amber-700 dark:text-amber-400">
          Context was truncated due to length limits. Analysis may be less
          precise.
        </p>
      ) : null}

      <div>
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            Proposed prompt
          </h4>
          <CopyButton text={analysis.proposedPrompt} label="Copy prompt" />
        </div>
        <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap rounded-md border border-zinc-200 bg-white p-3 font-mono text-xs text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200">
          {analysis.proposedPrompt}
        </pre>
      </div>

      <div>
        <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Reasoning
        </h4>
        <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">
          {analysis.reasoning}
        </p>
      </div>

      <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/40">
        <h4 className="text-sm font-medium text-emerald-900 dark:text-emerald-300">
          What to do next
        </h4>
        <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-400">
          {analysis.nextRecommendation}
        </p>
      </div>
    </div>
  );
}
