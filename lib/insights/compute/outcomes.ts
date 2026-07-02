import type { Iteration, Outcome, RecommendationAdherence } from "@/lib/domain/types";
import type { OutcomeByAdherence, OutcomeSummary, OutcomeTrendPoint } from "../types";

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

function pct(count: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((count / total) * 100);
}

function emptyOutcomes(): Record<Outcome, number> {
  return { success: 0, partial: 0, failure: 0 };
}

export function computeOutcomeSummary(iterations: Iteration[]): OutcomeSummary {
  const counts = emptyOutcomes();
  for (const iteration of iterations) {
    counts[iteration.outcome]++;
  }
  const total = iterations.length;

  const adherenceValues: Exclude<RecommendationAdherence, "not_applicable">[] = [
    "yes",
    "partially",
    "no",
  ];

  const outcomeByAdherence: OutcomeByAdherence[] = adherenceValues.map(
    (adherence) => {
      const matched = iterations.filter(
        (i) => i.followedPriorRecommendation === adherence,
      );
      const outcomes = emptyOutcomes();
      for (const iteration of matched) {
        outcomes[iteration.outcome]++;
      }
      const matchedTotal = matched.length;
      return {
        adherence,
        total: matchedTotal,
        successRate: pct(outcomes.success, matchedTotal),
        outcomes,
      };
    },
  );

  const byWeek = new Map<string, { success: number; total: number }>();
  for (const iteration of iterations) {
    const period = getIsoWeek(iteration.createdAt);
    const point = byWeek.get(period) ?? { success: 0, total: 0 };
    point.total++;
    if (iteration.outcome === "success") point.success++;
    byWeek.set(period, point);
  }

  const weeklySuccessTrend: OutcomeTrendPoint[] = [...byWeek.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, { success, total: weekTotal }]) => ({
      period,
      successRate: pct(success, weekTotal),
      total: weekTotal,
    }));

  return {
    counts,
    percentages: {
      success: pct(counts.success, total),
      partial: pct(counts.partial, total),
      failure: pct(counts.failure, total),
    },
    total,
    outcomeByAdherence,
    weeklySuccessTrend,
  };
}
