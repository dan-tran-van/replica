"use client";

import { use } from "react";
import Link from "next/link";
import { useWorkflow } from "@/lib/hooks/use-workflow";
import { useIterations } from "@/lib/hooks/use-iterations";
import { LogIterationForm } from "@/components/iterations/log-iteration-form";

export default function LogIterationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: workflow, isLoading, error } = useWorkflow(id);
  const { data: iterations, isLoading: iterationsLoading } = useIterations(id);

  if (isLoading || iterationsLoading) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Loading…
      </p>
    );
  }

  if (error || !workflow) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-600 dark:text-red-400">
          {error ?? "Workflow not found"}
        </p>
        <Link href="/" className="text-sm underline">
          Back to workflows
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/workflows/${workflow.id}`}
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
        >
          ← {workflow.name}
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Log a run
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Paste your Manus output and reflect on the result. Replica will
          propose an improved prompt.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <LogIterationForm workflow={workflow} iterations={iterations} />
      </div>
    </div>
  );
}
