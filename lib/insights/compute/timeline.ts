import type { Iteration } from "@/lib/domain/types";
import type { InsightsDataset, TimelineEntry } from "../types";

const MAX_ENTRIES = 8;

function getIsoWeek(isoDate: string): string {
  const date = new Date(isoDate);
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  const weekNumber =
    1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  return `${date.getFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}

export function computeLearningTimeline(
  dataset: InsightsDataset,
): TimelineEntry[] {
  const entries: TimelineEntry[] = [];
  const { workflows, iterationsByWorkflowId, iterations } = dataset;

  for (const workflow of workflows) {
    const workflowIterations = iterationsByWorkflowId.get(workflow.id) ?? [];

    for (let i = 1; i < workflowIterations.length; i++) {
      const current = workflowIterations[i];
      const prior = workflowIterations[i - 1];
      if (prior.outcome === "failure" && current.outcome === "success") {
        entries.push({
          date: current.createdAt,
          text: `I got my first success in "${workflow.name}" after earlier struggles.`,
          kind: "first_success_after_failure",
        });
        break;
      }
    }

    if (workflowIterations.length >= 5) {
      const fifth = workflowIterations[4];
      entries.push({
        date: fifth.createdAt,
        text: `"${workflow.name}" reached five logged runs — enough history to see real patterns.`,
        kind: "milestone_iterations",
      });
    }
  }

  const applicable = iterations
    .filter((i) => i.followedPriorRecommendation !== "not_applicable")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const byWeek = new Map<string, Iteration[]>();
  for (const iteration of applicable) {
    const week = getIsoWeek(iteration.createdAt);
    const list = byWeek.get(week) ?? [];
    list.push(iteration);
    byWeek.set(week, list);
  }

  for (const [week, weekIterations] of byWeek) {
    const yesCount = weekIterations.filter(
      (i) => i.followedPriorRecommendation === "yes",
    ).length;
    if (weekIterations.length >= 2 && yesCount / weekIterations.length >= 0.5) {
      entries.push({
        date: weekIterations[weekIterations.length - 1].createdAt,
        text: `During week ${week}, I followed recommendations more consistently than before.`,
        kind: "adherence_improved",
      });
      break;
    }
  }

  let consecutiveNo = 0;
  for (const iteration of applicable) {
    if (iteration.followedPriorRecommendation === "no") {
      consecutiveNo++;
      if (consecutiveNo >= 3) {
        entries.push({
          date: iteration.createdAt,
          text:
            "I ignored recommendations three times in a row — Replica's advice may not match how I actually work.",
          kind: "repeated_non_adherence",
        });
        break;
      }
    } else {
      consecutiveNo = 0;
    }
  }

  const sorted = [...iterations].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );
  if (sorted.length >= 4) {
    const midpoint = Math.floor(sorted.length / 2);
    const firstHalf = sorted.slice(0, midpoint);
    const secondHalf = sorted.slice(midpoint);
    const firstRate =
      firstHalf.filter((i) => i.outcome === "success").length / firstHalf.length;
    const secondRate =
      secondHalf.filter((i) => i.outcome === "success").length / secondHalf.length;
    if (secondRate > firstRate + 0.15) {
      entries.push({
        date: secondHalf[secondHalf.length - 1].createdAt,
        text: "My success rate improved in the second half of my logged runs.",
        kind: "success_rate_improved",
      });
    }
  }

  return entries
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, MAX_ENTRIES);
}
