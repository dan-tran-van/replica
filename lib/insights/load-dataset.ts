import type { Repositories } from "@/lib/repositories/types";
import type { InsightsDataset } from "./types";

export async function loadInsightsDataset(
  repos: Repositories,
): Promise<InsightsDataset> {
  const [workflows, iterations] = await Promise.all([
    repos.workflows.list(),
    repos.iterations.listAll(),
  ]);

  const iterationsByWorkflowId = new Map<string, typeof iterations>();
  for (const workflow of workflows) {
    iterationsByWorkflowId.set(workflow.id, []);
  }
  for (const iteration of iterations) {
    const list = iterationsByWorkflowId.get(iteration.workflowId) ?? [];
    list.push(iteration);
    iterationsByWorkflowId.set(iteration.workflowId, list);
  }
  for (const [workflowId, list] of iterationsByWorkflowId) {
    list.sort((a, b) => a.sequenceNumber - b.sequenceNumber);
    iterationsByWorkflowId.set(workflowId, list);
  }

  return {
    workflows,
    iterations,
    iterationsByWorkflowId,
    generatedAt: new Date().toISOString(),
  };
}
