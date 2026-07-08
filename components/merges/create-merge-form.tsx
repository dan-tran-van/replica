"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MergeSource } from "@/lib/domain/merge-types";
import { resolveMergeSources } from "@/lib/domain/resolve-merge-sources";
import { generateMergeReflection } from "@/lib/ai/generate-merge-reflection";
import { useRepositories } from "@/components/providers/repository-provider";
import { useSettings } from "@/lib/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ManualSourceForm } from "./manual-source-form";
import { MergeSourceCard } from "./merge-source-card";
import { RunSourcePicker } from "./run-source-picker";

type FormStatus = "idle" | "saving" | "merging" | "error";

interface RunMeta {
  workflowName: string;
  runNumber: number;
}

export function CreateMergeForm() {
  const router = useRouter();
  const repos = useRepositories();
  const { settings, hasApiKey } = useSettings();

  const [title, setTitle] = useState("");
  const [userGoal, setUserGoal] = useState("");
  const [sources, setSources] = useState<MergeSource[]>([]);
  const [runMeta, setRunMeta] = useState<Record<string, RunMeta>>({});
  const [status, setStatus] = useState<FormStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRunMeta() {
      const runSources = sources.filter(
        (s): s is MergeSource & { kind: "run" } => s.kind === "run",
      );
      if (runSources.length === 0) {
        setRunMeta({});
        return;
      }

      const entries = await Promise.all(
        runSources.map(async (source) => {
          const [workflow, iteration] = await Promise.all([
            repos.workflows.get(source.workflowId),
            repos.iterations.get(source.iterationId),
          ]);
          if (!workflow || !iteration) return null;
          return [
            source.id,
            {
              workflowName: workflow.name,
              runNumber: iteration.sequenceNumber,
            },
          ] as const;
        }),
      );

      if (cancelled) return;

      const meta: Record<string, RunMeta> = {};
      for (const entry of entries) {
        if (entry) meta[entry[0]] = entry[1];
      }
      setRunMeta(meta);
    }

    void loadRunMeta();
    return () => {
      cancelled = true;
    };
  }, [sources, repos.workflows, repos.iterations]);

  function addSource(source: MergeSource) {
    setSources((prev) => [...prev, source]);
  }

  function removeSource(sourceId: string) {
    setSources((prev) => prev.filter((s) => s.id !== sourceId));
  }

  const excludedIterationIds = sources
    .filter((s): s is MergeSource & { kind: "run" } => s.kind === "run")
    .map((s) => s.iterationId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    if (sources.length < 2) {
      setError("Add at least 2 independent sources to merge.");
      return;
    }

    if (!hasApiKey || !settings) {
      setError("Add your OpenAI API key in Settings before generating a merge.");
      return;
    }

    const { resolved, missingRunIds } = await resolveMergeSources(repos, sources);
    if (missingRunIds.length > 0) {
      setError(
        "One or more selected runs were deleted. Remove them and try again.",
      );
      return;
    }

    if (resolved.length < 2) {
      setError("At least 2 valid sources are required.");
      return;
    }

    setStatus("saving");
    try {
      const session = await repos.mergeSessions.create({
        title: title.trim(),
        userGoal: userGoal.trim() || undefined,
        sources,
      });

      setStatus("merging");
      const { result } = await generateMergeReflection(
        resolved,
        userGoal.trim() || undefined,
        settings,
      );

      await repos.mergeSessions.updateResult(session.id, result);
      router.push(`/merges/${session.id}`);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to create merge");
    }
  }

  const isSubmitting = status === "saving" || status === "merging";

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
      <div>
        <Button variant="link" className="h-auto p-0" asChild>
          <Link href="/merges">← Merges</Link>
        </Button>
        <h1 className="mt-2 text-xl font-semibold">New Merge</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Combine independent perspectives—not sequential history from one
          workflow.
        </p>
      </div>

      {!hasApiKey ? (
        <Alert>
          <AlertTitle>OpenAI API key required</AlertTitle>
          <AlertDescription>
            Add your key in{" "}
            <Link href="/settings" className="underline">
              Settings
            </Link>{" "}
            to generate a merge.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="merge-title">Title</Label>
        <Input
          id="merge-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Q3 launch decision"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="merge-goal">Merge goal (optional)</Label>
        <p className="text-xs text-muted-foreground">
          What decision or concern should these sources help resolve?
        </p>
        <Textarea
          id="merge-goal"
          value={userGoal}
          onChange={(e) => setUserGoal(e.target.value)}
          rows={3}
          placeholder="e.g. Decide whether to prioritize speed or depth for the next iteration"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Sources ({sources.length})</Label>
          {sources.length >= 6 ? (
            <p className="text-xs text-muted-foreground">
              Many sources may be truncated for the model.
            </p>
          ) : null}
        </div>

        {sources.length > 0 ? (
          <div className="space-y-2">
            {sources.map((source) => (
              <MergeSourceCard
                key={source.id}
                source={source}
                workflowName={
                  source.kind === "run"
                    ? runMeta[source.id]?.workflowName
                    : undefined
                }
                runNumber={
                  source.kind === "run"
                    ? runMeta[source.id]?.runNumber
                    : undefined
                }
                onRemove={() => removeSource(source.id)}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Add at least 2 sources below.
          </p>
        )}
      </div>

      <RunSourcePicker
        excludedIterationIds={excludedIterationIds}
        onAdd={addSource}
      />

      <ManualSourceForm onAdd={addSource} />

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" disabled={isSubmitting || sources.length < 2}>
        {status === "saving"
          ? "Saving…"
          : status === "merging"
            ? "Merging…"
            : "Generate Merge"}
      </Button>
    </form>
  );
}
