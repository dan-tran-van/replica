"use client";

import { useState } from "react";
import Link from "next/link";
import type { MergeResult, MergeSession } from "@/lib/domain/merge-types";
import { resolveMergeSources } from "@/lib/domain/resolve-merge-sources";
import { generateMergeReflection } from "@/lib/ai/generate-merge-reflection";
import { useRepositories } from "@/components/providers/repository-provider";
import { useSettings } from "@/lib/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  MergeResultListSection,
  MergeResultSection,
} from "./merge-result-section";

interface MergeResultViewProps {
  session: MergeSession;
  onUpdated: () => void;
}

export function MergeResultView({ session, onUpdated }: MergeResultViewProps) {
  const repos = useRepositories();
  const { settings, hasApiKey } = useSettings();
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);
  const [wasTruncated, setWasTruncated] = useState(false);

  const result = session.result;

  async function handleRetry() {
    if (!settings || !hasApiKey) return;
    setIsRetrying(true);
    setRetryError(null);

    try {
      const { resolved, missingRunIds } = await resolveMergeSources(
        repos,
        session.sources,
      );
      if (missingRunIds.length > 0) {
        setRetryError(
          "One or more source runs were deleted. Create a new merge.",
        );
        return;
      }

      const { result: newResult, wasTruncated: truncated } =
        await generateMergeReflection(
          resolved,
          session.userGoal,
          settings,
        );

      await repos.mergeSessions.updateResult(session.id, newResult);
      setWasTruncated(truncated);
      onUpdated();
    } catch (err) {
      setRetryError(err instanceof Error ? err.message : "Retry failed");
    } finally {
      setIsRetrying(false);
    }
  }

  if (!result) {
    return (
      <Alert>
        <AlertTitle>No merge result</AlertTitle>
        <AlertDescription>
          This session has no generated result yet.
        </AlertDescription>
      </Alert>
    );
  }

  if (result.status === "failed") {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTitle>Merge failed</AlertTitle>
          <AlertDescription>
            {result.errorMessage ?? "An unknown error occurred."}
          </AlertDescription>
        </Alert>
        {!hasApiKey ? (
          <Alert>
            <AlertDescription>
              Add your API key in{" "}
              <Link href="/settings" className="underline">
                Settings
              </Link>{" "}
              to retry.
            </AlertDescription>
          </Alert>
        ) : (
          <Button onClick={() => void handleRetry()} disabled={isRetrying}>
            {isRetrying ? "Retrying…" : "Retry merge"}
          </Button>
        )}
        {retryError ? (
          <Alert variant="destructive">
            <AlertDescription>{retryError}</AlertDescription>
          </Alert>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {wasTruncated ? (
        <Alert>
          <AlertDescription>
            Some source content was truncated due to length limits.
          </AlertDescription>
        </Alert>
      ) : null}

      {retryError ? (
        <Alert variant="destructive">
          <AlertDescription>{retryError}</AlertDescription>
        </Alert>
      ) : null}

      <CompletedMergeResult result={result} />

      <div className="flex flex-wrap gap-2 pt-2">
        {hasApiKey ? (
          <Button
            variant="outline"
            onClick={() => void handleRetry()}
            disabled={isRetrying}
          >
            {isRetrying ? "Regenerating…" : "Regenerate merge"}
          </Button>
        ) : null}
        <Button variant="outline" asChild>
          <Link href="/merges/new">New merge</Link>
        </Button>
      </div>
    </div>
  );
}

function CompletedMergeResult({ result }: { result: MergeResult }) {
  return (
    <>
      <MergeResultSection
        title="Merged Summary"
        copyText={result.mergedSummary}
        copyLabel="Copy summary"
      >
        <p className="text-sm text-muted-foreground">{result.mergedSummary}</p>
      </MergeResultSection>

      <MergeResultListSection
        title="Shared Patterns"
        items={result.sharedPatterns}
      />

      <MergeResultListSection
        title="Unique Findings"
        items={result.uniqueFindings}
      />

      <MergeResultListSection
        title="Conflicts / Tensions"
        items={result.conflictsOrTensions}
      />

      <MergeResultListSection
        title="Missing Information"
        items={result.missingInformation}
      />

      <MergeResultSection
        title="Higher-Level Insight"
        copyText={result.higherLevelInsight}
        copyLabel="Copy insight"
      >
        <p className="text-sm text-muted-foreground">
          {result.higherLevelInsight}
        </p>
      </MergeResultSection>

      <MergeResultSection
        title="Recommended Strategy"
        copyText={result.recommendedStrategy}
        copyLabel="Copy strategy"
      >
        <p className="text-sm text-muted-foreground">
          {result.recommendedStrategy}
        </p>
      </MergeResultSection>

      {result.proposedPrompt ? (
        <MergeResultSection
          title="Proposed Prompt"
          copyText={result.proposedPrompt}
          copyLabel="Copy prompt"
        >
          <pre className="overflow-x-auto rounded-xl bg-muted p-4 font-mono text-xs whitespace-pre-wrap">
            {result.proposedPrompt}
          </pre>
        </MergeResultSection>
      ) : null}

      <MergeResultSection
        title="Next Recommendation"
        copyText={result.nextRecommendation}
        copyLabel="Copy recommendation"
      >
        <p className="text-sm text-muted-foreground">
          {result.nextRecommendation}
        </p>
      </MergeResultSection>

      <MergeResultSection title="Reasoning">
        <p className="text-sm text-muted-foreground">{result.reasoning}</p>
      </MergeResultSection>
    </>
  );
}
