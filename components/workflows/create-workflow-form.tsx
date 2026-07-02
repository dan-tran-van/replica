"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRepositories } from "@/components/providers/repository-provider";

export function CreateWorkflowForm({ onCreated }: { onCreated?: () => void }) {
  const router = useRouter();
  const { workflows } = useRepositories();
  const [name, setName] = useState("");
  const [starterPrompt, setStarterPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !starterPrompt.trim()) {
      setError("Name and starter prompt are required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const workflow = await workflows.create({
        name: name.trim(),
        starterPrompt,
      });
      onCreated?.();
      router.push(`/workflows/${workflow.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create workflow");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <div>
        <label
          htmlFor="workflow-name"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Workflow name
        </label>
        <input
          id="workflow-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Weekly research digest"
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>

      <div>
        <label
          htmlFor="starter-prompt"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Starter prompt
        </label>
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          Copy this into Manus Scheduled for your first run.
        </p>
        <textarea
          id="starter-prompt"
          value={starterPrompt}
          onChange={(e) => setStarterPrompt(e.target.value)}
          rows={8}
          placeholder="Enter the prompt you'll run in Manus..."
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {isSubmitting ? "Creating…" : "Create workflow"}
      </button>
    </form>
  );
}
