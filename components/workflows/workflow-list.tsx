"use client";

import { useState } from "react";
import { WorkflowCard } from "./workflow-card";
import { CreateWorkflowForm } from "./create-workflow-form";
import { EmptyState } from "@/components/shared/empty-state";
import { useWorkflows } from "@/lib/hooks/use-workflows";

export function WorkflowList() {
  const { data, isLoading, error, refetch } = useWorkflows();
  const [showCreate, setShowCreate] = useState(false);

  if (isLoading) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Loading workflows…
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Workflows
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Improve your Manus Scheduled prompts through reflection.
          </p>
        </div>
        {data.length > 0 ? (
          <button
            type="button"
            onClick={() => setShowCreate((v) => !v)}
            className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {showCreate ? "Cancel" : "New workflow"}
          </button>
        ) : null}
      </div>

      {showCreate || data.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-4 text-sm font-medium text-zinc-900 dark:text-zinc-50">
            Create a workflow
          </h2>
          <CreateWorkflowForm
            onCreated={() => {
              setShowCreate(false);
              void refetch();
            }}
          />
        </div>
      ) : null}

      {data.length === 0 && !showCreate ? (
        <EmptyState
          title="No workflows yet"
          description="Create a workflow with your starter prompt, run it in Manus, then come back to log the results."
          action={
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              Create your first workflow
            </button>
          }
        />
      ) : null}

      {data.length > 0 ? (
        <ul className="space-y-3">
          {data.map((workflow) => (
            <li key={workflow.id}>
              <WorkflowCard workflow={workflow} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
