import type { Iteration, IterationAnalysis, Workflow } from "./types";

export function getLatestPromptUsed(
  workflow: Workflow,
  iterations: Iteration[],
): string {
  if (iterations.length === 0) return workflow.starterPrompt;
  const sorted = sortIterations(iterations);
  return sorted[sorted.length - 1].promptUsed;
}

export function getLatestAnalysis(
  iterations: Iteration[],
): IterationAnalysis | null {
  const sorted = sortIterations(iterations);
  for (let i = sorted.length - 1; i >= 0; i--) {
    const analysis = sorted[i].analysis;
    if (analysis?.status === "completed") return analysis;
  }
  return null;
}

export function getNextSequenceNumber(iterations: Iteration[]): number {
  if (iterations.length === 0) return 1;
  return Math.max(...iterations.map((i) => i.sequenceNumber)) + 1;
}

export function getDefaultPromptUsed(
  workflow: Workflow,
  iterations: Iteration[],
): string {
  if (iterations.length === 0) return workflow.starterPrompt;

  const sorted = sortIterations(iterations);
  const last = sorted[sorted.length - 1];
  if (last.analysis?.status === "completed") {
    return last.analysis.proposedPrompt;
  }
  return last.promptUsed;
}

export function sortIterations(iterations: Iteration[]): Iteration[] {
  return [...iterations].sort((a, b) => a.sequenceNumber - b.sequenceNumber);
}
