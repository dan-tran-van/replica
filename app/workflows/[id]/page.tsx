"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getLatestPromptUsed } from "@/lib/domain/derive";
import { useWorkflow } from "@/lib/hooks/use-workflow";
import { useIterations } from "@/lib/hooks/use-iterations";
import { IterationTimeline } from "@/components/iterations/iteration-timeline";
import { CopyButton } from "@/components/shared/copy-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function WorkflowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: workflow, isLoading, error, remove } = useWorkflow(id);
  const {
    data: iterations,
    isLoading: iterationsLoading,
    refetch: refetchIterations,
  } = useIterations(id);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await remove();
      router.push("/");
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading || iterationsLoading) {
    return <p className="text-sm text-muted-foreground">Loading workflow…</p>;
  }

  if (error || !workflow) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">{error ?? "Workflow not found"}</p>
        <Button variant="link" asChild className="h-auto p-0">
          <Link href="/">Back to workflows</Link>
        </Button>
      </div>
    );
  }

  const latestPromptUsed = getLatestPromptUsed(workflow, iterations);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Button variant="link" asChild className="h-auto p-0 text-muted-foreground">
            <Link href="/">← Workflows</Link>
          </Button>
          <h1 className="mt-2 text-xl font-semibold">{workflow.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manus Scheduled · {iterations.length}{" "}
            {iterations.length === 1 ? "run" : "runs"}
          </p>
        </div>
        <Button asChild>
          <Link href={`/workflows/${workflow.id}/log`}>Log a run</Link>
        </Button>
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Starter prompt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <pre className="max-h-32 overflow-auto whitespace-pre-wrap font-mono text-xs text-muted-foreground">
              {workflow.starterPrompt}
            </pre>
            <CopyButton text={workflow.starterPrompt} label="Copy starter" />
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Latest prompt used
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <pre className="max-h-32 overflow-auto whitespace-pre-wrap font-mono text-xs text-muted-foreground">
              {latestPromptUsed}
            </pre>
            <CopyButton text={latestPromptUsed} label="Copy latest" />
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold">History</h2>
        <IterationTimeline
          workflow={workflow}
          iterations={iterations}
          onAnalysisUpdated={() => void refetchIterations()}
        />
      </section>

      <section className="border-t pt-6">
        {!showDeleteConfirm ? (
          <Button
            type="button"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete workflow
          </Button>
        ) : (
          <Alert variant="destructive">
            <AlertDescription>
              Delete this workflow and all {iterations.length} runs? This cannot
              be undone.
            </AlertDescription>
            <div className="mt-3 flex gap-2">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => void handleDelete()}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting…" : "Yes, delete"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          </Alert>
        )}
      </section>
    </div>
  );
}
