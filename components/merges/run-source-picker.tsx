"use client";

import { useEffect, useState } from "react";
import type { Iteration, Workflow } from "@/lib/domain/types";
import { createRunSource } from "@/lib/domain/merge-types";
import type { MergeSource } from "@/lib/domain/merge-types";
import { useRepositories } from "@/components/providers/repository-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MERGE_PERSPECTIVE_PRESETS } from "@/lib/domain/merge-presets";

interface RunWithWorkflow {
  iteration: Iteration;
  workflow: Workflow;
}

interface RunSourcePickerProps {
  excludedIterationIds: string[];
  onAdd: (source: MergeSource) => void;
}

export function RunSourcePicker({
  excludedIterationIds,
  onAdd,
}: RunSourcePickerProps) {
  const { workflows, iterations } = useRepositories();
  const [runs, setRuns] = useState<RunWithWorkflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [perspective, setPerspective] = useState("");
  const [label, setLabel] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const [workflowList, allIterations] = await Promise.all([
          workflows.list(),
          iterations.listAll(),
        ]);
        const workflowMap = new Map(workflowList.map((w) => [w.id, w]));
        const combined: RunWithWorkflow[] = [];

        for (const iteration of allIterations) {
          const workflow = workflowMap.get(iteration.workflowId);
          if (workflow) {
            combined.push({ iteration, workflow });
          }
        }

        combined.sort((a, b) => {
          const dateA = new Date(a.iteration.createdAt).getTime();
          const dateB = new Date(b.iteration.createdAt).getTime();
          return dateB - dateA;
        });

        if (!cancelled) setRuns(combined);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [workflows, iterations]);

  const available = runs.filter(
    (r) => !excludedIterationIds.includes(r.iteration.id),
  );

  const selected = available.find((r) => r.iteration.id === selectedId);

  function handleAdd() {
    if (!selected) return;
    onAdd(
      createRunSource(selected.workflow.id, selected.iteration.id, {
        label: label.trim() || undefined,
        perspective: perspective.trim() || undefined,
      }),
    );
    setSelectedId(null);
    setLabel("");
    setPerspective("");
  }

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="text-base">Add reflected run</CardTitle>
        <CardDescription>
          Pick a logged run from any workflow as an independent perspective.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading runs…</p>
        ) : available.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No runs available. Log runs in workflows or all selected runs are
            already added.
          </p>
        ) : (
          <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border p-2">
            {available.map(({ iteration, workflow }) => (
              <button
                key={iteration.id}
                type="button"
                onClick={() => setSelectedId(iteration.id)}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  selectedId === iteration.id
                    ? "border-primary bg-muted"
                    : "hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{workflow.name}</span>
                  <Badge variant="outline">#{iteration.sequenceNumber}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {iteration.outcome} ·{" "}
                  {new Date(iteration.createdAt).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="run-label">Label (optional)</Label>
          <Input
            id="run-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Market signals from Manus"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="run-perspective">Perspective (optional)</Label>
          <Input
            id="run-perspective"
            value={perspective}
            onChange={(e) => setPerspective(e.target.value)}
            placeholder="e.g. market research"
          />
          <div className="flex flex-wrap gap-1">
            {MERGE_PERSPECTIVE_PRESETS.map((preset) => (
              <Button
                key={preset}
                type="button"
                variant="outline"
                size="xs"
                onClick={() => setPerspective(preset)}
              >
                {preset}
              </Button>
            ))}
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          disabled={!selected}
          onClick={handleAdd}
        >
          Add run source
        </Button>
      </CardContent>
    </Card>
  );
}
