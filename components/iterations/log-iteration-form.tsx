"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Outcome, Iteration, Workflow } from "@/lib/domain/types";
import { getDefaultPromptUsed, getNextSequenceNumber } from "@/lib/domain/derive";
import { analyzeIteration } from "@/lib/ai/analyze-iteration";
import { useRepositories } from "@/components/providers/repository-provider";
import { useSettings } from "@/lib/hooks/use-settings";

type FormStatus = "idle" | "saving" | "analyzing" | "done" | "error";

interface LogIterationFormProps {
  workflow: Workflow;
  iterations: Iteration[];
}

function LogIterationFormFields({
  workflow,
  iterations,
}: LogIterationFormProps) {
  const router = useRouter();
  const { workflows, iterations: iterationRepo } = useRepositories();
  const { settings, hasApiKey } = useSettings();

  const defaultPromptUsed = getDefaultPromptUsed(workflow, iterations);
  const [promptUsed, setPromptUsed] = useState(defaultPromptUsed);
  const [manusOutput, setManusOutput] = useState("");
  const [outcome, setOutcome] = useState<Outcome>("partial");
  const [observations, setObservations] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!promptUsed.trim() || !manusOutput.trim()) {
      setError("Prompt used and Manus output are required.");
      return;
    }

    if (!hasApiKey) {
      setError("Add your OpenAI API key in Settings before logging a run.");
      return;
    }

    if (!settings) return;

    setStatus("saving");
    setError(null);

    try {
      const sequenceNumber = getNextSequenceNumber(iterations);
      const iteration = await iterationRepo.create(
        {
          workflowId: workflow.id,
          promptUsed,
          manusOutput,
          outcome,
          observations,
        },
        sequenceNumber,
      );

      await workflows.touch(workflow.id);

      setStatus("analyzing");

      const result = await analyzeIteration(
        workflow,
        iterations,
        iteration,
        settings,
      );

      await iterationRepo.updateAnalysis(iteration.id, result.analysis);
      setStatus("done");
      router.push(`/workflows/${workflow.id}`);
      router.refresh();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to save iteration");
    }
  }

  const isBusy = status === "saving" || status === "analyzing";

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
      {!hasApiKey ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/40">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Add your OpenAI API key in{" "}
            <Link href="/settings" className="underline">
              Settings
            </Link>{" "}
            to analyze runs. Your key stays in this browser only.
          </p>
        </div>
      ) : null}

      <div>
        <label
          htmlFor="prompt-used"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Prompt used in Manus
        </label>
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          What you actually ran — may differ from Replica&apos;s last suggestion.
        </p>
        <textarea
          id="prompt-used"
          value={promptUsed}
          onChange={(e) => setPromptUsed(e.target.value)}
          rows={6}
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>

      <div>
        <label
          htmlFor="manus-output"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Manus output
        </label>
        <textarea
          id="manus-output"
          value={manusOutput}
          onChange={(e) => setManusOutput(e.target.value)}
          rows={10}
          placeholder="Paste the output from Manus..."
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>

      <div>
        <label
          htmlFor="outcome"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Outcome
        </label>
        <select
          id="outcome"
          value={outcome}
          onChange={(e) => setOutcome(e.target.value as Outcome)}
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        >
          <option value="success">Success — output met expectations</option>
          <option value="partial">Partial — useful but needs improvement</option>
          <option value="failure">Failure — did not work as intended</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="observations"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Observations
        </label>
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          What worked, what didn&apos;t, what to change next.
        </p>
        <textarea
          id="observations"
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          rows={4}
          placeholder="e.g. Summary was too long, missed the key metric..."
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      {status === "analyzing" ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Analyzing run and proposing prompt improvements…
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isBusy}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {status === "saving"
            ? "Saving…"
            : status === "analyzing"
              ? "Analyzing…"
              : "Save & analyze"}
        </button>
        <Link
          href={`/workflows/${workflow.id}`}
          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

export function LogIterationForm({ workflow, iterations }: LogIterationFormProps) {
  const formKey = `${workflow.id}-${iterations.length}-${iterations.at(-1)?.id ?? "new"}`;

  return (
    <LogIterationFormFields
      key={formKey}
      workflow={workflow}
      iterations={iterations}
    />
  );
}
