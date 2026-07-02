import type { InsightsDataset, WorkflowHealthItem, WorkflowHealthStatus } from "../types";

const STALLED_DAYS = 30;

function daysSince(isoDate: string): number {
  const then = new Date(isoDate).getTime();
  const now = Date.now();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

function computeStatus(
  iterationCount: number,
  lastUpdated: string,
  outcomes: string[],
): WorkflowHealthStatus {
  if (iterationCount === 0) return "new";
  if (daysSince(lastUpdated) > STALLED_DAYS) return "stalled";

  if (iterationCount >= 3) {
    const lastThree = outcomes.slice(-3);
    const allFailure = lastThree.length === 3 && lastThree.every((o) => o === "failure");
    const failureRate =
      outcomes.filter((o) => o === "failure").length / outcomes.length;
    if (allFailure || failureRate >= 0.6) return "struggling";
  }

  return "healthy";
}

export function computeWorkflowHealth(
  dataset: InsightsDataset,
): WorkflowHealthItem[] {
  return dataset.workflows.map((workflow) => {
    const iterations = dataset.iterationsByWorkflowId.get(workflow.id) ?? [];
    const applicable = iterations.filter(
      (i) => i.followedPriorRecommendation !== "not_applicable",
    );
    const yesCount = applicable.filter(
      (i) => i.followedPriorRecommendation === "yes",
    ).length;

    const outcomes = iterations.map((i) => i.outcome);
    const latest = iterations[iterations.length - 1];

    return {
      workflowId: workflow.id,
      workflowName: workflow.name,
      iterationCount: iterations.length,
      latestOutcome: latest?.outcome ?? null,
      adherenceRate:
        applicable.length > 0
          ? Math.round((yesCount / applicable.length) * 100)
          : null,
      lastUpdated: workflow.updatedAt,
      status: computeStatus(iterations.length, workflow.updatedAt, outcomes),
    };
  });
}
