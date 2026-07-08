import type { MergeSource } from "@/lib/domain/merge-types";
import type { Iteration, Workflow } from "@/lib/domain/types";
import type { Repositories } from "@/lib/repositories/types";

export type ResolvedRunSource = {
  source: MergeSource & { kind: "run" };
  workflow: Workflow;
  iteration: Iteration;
};

export type ResolvedManualSource = {
  source: MergeSource & { kind: "manual" };
};

export type ResolvedMergeSource = ResolvedRunSource | ResolvedManualSource;

export interface ResolveMergeSourcesResult {
  resolved: ResolvedMergeSource[];
  missingRunIds: string[];
}

export async function resolveMergeSources(
  repos: Repositories,
  sources: MergeSource[],
): Promise<ResolveMergeSourcesResult> {
  const resolved: ResolvedMergeSource[] = [];
  const missingRunIds: string[] = [];

  for (const source of sources) {
    if (source.kind === "manual") {
      resolved.push({ source });
      continue;
    }

    const [workflow, iteration] = await Promise.all([
      repos.workflows.get(source.workflowId),
      repos.iterations.get(source.iterationId),
    ]);

    if (
      !workflow ||
      !iteration ||
      iteration.workflowId !== source.workflowId
    ) {
      missingRunIds.push(source.iterationId);
      continue;
    }

    resolved.push({ source, workflow, iteration });
  }

  return { resolved, missingRunIds };
}
