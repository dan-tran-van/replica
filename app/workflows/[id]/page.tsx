"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getLatestPromptUsed } from "@/lib/domain/derive";
import { useWorkflow } from "@/lib/hooks/use-workflow";
import { useIterations } from "@/lib/hooks/use-iterations";
import { IterationTimeline } from "@/components/iterations/iteration-timeline";
import { CopyButton } from "@/components/shared/copy-button";

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
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Loading workflow…
      </p>
    );
  }

  if (error || !workflow) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-600 dark:text-red-400">
          {error ?? "Workflow not found"}
        </p>
        <Link href="/" className="text-sm text-zinc-600 underline">
          Back to workflows
        </Link>
      </div>
    );
  }

  const latestPromptUsed = getLatestPromptUsed(workflow, iterations);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
          >
            ← Workflows
          </Link>
          <h1 className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            {workflow.name}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Manus Scheduled · {iterations.length}{" "}
            {iterations.length === 1 ? "run" : "runs"}
          </p>
        </div>
        <Link
          href={`/workflows/${workflow.id}/log`}
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Log a run
        </Link>
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Starter prompt
          </h2>
          <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap font-mono text-xs text-zinc-700 dark:text-zinc-300">
            {workflow.starterPrompt}
          </pre>
          <div className="mt-2">
            <CopyButton text={workflow.starterPrompt} label="Copy starter" />
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Latest prompt used
          </h2>
          <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap font-mono text-xs text-zinc-700 dark:text-zinc-300">
            {latestPromptUsed}
          </pre>
          <div className="mt-2">
            <CopyButton text={latestPromptUsed} label="Copy latest" />
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          History
        </h2>
        <IterationTimeline
          workflow={workflow}
          iterations={iterations}
          onAnalysisUpdated={() => void refetchIterations()}
        />
      </section>

      <section className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
          >
            Delete workflow
          </button>
        ) : (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40">
            <p className="text-sm text-red-800 dark:text-red-300">
              Delete this workflow and all {iterations.length} runs? This cannot
              be undone.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={isDeleting}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
              >
                {isDeleting ? "Deleting…" : "Yes, delete"}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
