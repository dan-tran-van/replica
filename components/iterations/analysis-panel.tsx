"use client";

import Link from "next/link";
import type { IterationAnalysis } from "@/lib/domain/types";
import { CopyButton } from "@/components/shared/copy-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      <Alert variant="destructive">
        <AlertTitle>Analysis failed</AlertTitle>
        <AlertDescription>
          {analysis.errorMessage ?? "An unknown error occurred."}
        </AlertDescription>
        {onRetry ? (
          <div className="mt-3 flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRetry}
              disabled={isRetrying}
            >
              {isRetrying ? "Retrying…" : "Retry analysis"}
            </Button>
            <Link href="/settings" className="text-sm underline">
              Check API key
            </Link>
          </div>
        ) : null}
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {wasTruncated ? (
        <Alert>
          <AlertDescription>
            Context was truncated due to length limits. Analysis may be less
            precise.
          </AlertDescription>
        </Alert>
      ) : null}

      <Card size="sm">
        <CardHeader className="flex-row items-center justify-between gap-2">
          <CardTitle className="text-sm">Proposed prompt</CardTitle>
          <CopyButton text={analysis.proposedPrompt} label="Copy prompt" />
        </CardHeader>
        <CardContent>
          <pre className="max-h-48 overflow-auto whitespace-pre-wrap font-mono text-xs text-muted-foreground">
            {analysis.proposedPrompt}
          </pre>
        </CardContent>
      </Card>

      <div>
        <h4 className="text-sm font-medium">Reasoning</h4>
        <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
          {analysis.reasoning}
        </p>
      </div>

      <Card size="sm" className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-sm text-primary">
            What to do next
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {analysis.nextRecommendation}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
