"use client";

import Link from "next/link";
import type { WorkflowWithCount } from "@/lib/hooks/use-workflows";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function WorkflowCard({ workflow }: { workflow: WorkflowWithCount }) {
  return (
    <Link
      href={`/workflows/${workflow.id}`}
      className="block rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate font-medium text-zinc-900 dark:text-zinc-50">
            {workflow.name}
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {workflow.iterationCount}{" "}
            {workflow.iterationCount === 1 ? "run" : "runs"} · Updated{" "}
            {formatDate(workflow.updatedAt)}
          </p>
        </div>
        <span className="shrink-0 text-xs text-zinc-400">Manus</span>
      </div>
    </Link>
  );
}
