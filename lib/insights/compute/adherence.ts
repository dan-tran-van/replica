import type { Iteration } from "@/lib/domain/types";
import type { AdherenceSummary, AdherenceTrendPoint } from "../types";

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

export function computeAdherenceSummary(iterations: Iteration[]): AdherenceSummary {
  const applicable = iterations.filter(
    (i) => i.followedPriorRecommendation !== "not_applicable",
  );

  const yes = applicable.filter((i) => i.followedPriorRecommendation === "yes").length;
  const partially = applicable.filter(
    (i) => i.followedPriorRecommendation === "partially",
  ).length;
  const no = applicable.filter((i) => i.followedPriorRecommendation === "no").length;
  const totalApplicable = applicable.length;

  const byWeek = new Map<string, AdherenceTrendPoint>();
  for (const iteration of applicable) {
    const period = getIsoWeek(iteration.createdAt);
    const point = byWeek.get(period) ?? {
      period,
      yes: 0,
      partially: 0,
      no: 0,
      total: 0,
    };
    if (iteration.followedPriorRecommendation === "yes") point.yes++;
    if (iteration.followedPriorRecommendation === "partially") point.partially++;
    if (iteration.followedPriorRecommendation === "no") point.no++;
    point.total++;
    byWeek.set(period, point);
  }

  const trend = [...byWeek.values()].sort((a, b) =>
    a.period.localeCompare(b.period),
  );
  const bucketsWithData = trend.filter((t) => t.total > 0).length;

  return {
    yes,
    partially,
    no,
    totalApplicable,
    percentages: {
      yes: pct(yes, totalApplicable),
      partially: pct(partially, totalApplicable),
      no: pct(no, totalApplicable),
    },
    trend,
    hasEnoughTrendData: bucketsWithData >= 2,
  };
}
