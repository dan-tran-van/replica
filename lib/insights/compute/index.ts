import type { InsightsDataset, InsightsReport } from "../types";
import { RECOMMENDATION_THEMES, REFLECTION_THEMES } from "../themes";
import { computeAdherenceSummary } from "./adherence";
import { computeOutcomeSummary } from "./outcomes";
import { countThemeMatches } from "./themes";
import { computeLearningTimeline } from "./timeline";
import { computeWorkflowHealth } from "./workflow-health";

export function computeInsightsReport(dataset: InsightsDataset): InsightsReport {
  const recommendationTexts = dataset.iterations
    .filter((i) => i.analysis?.status === "completed")
    .map((i) => i.analysis!.nextRecommendation);

  const reflectionTexts = dataset.iterations
    .map((i) => i.observations.trim())
    .filter(Boolean);

  const applicableCount = dataset.iterations.filter(
    (i) => i.followedPriorRecommendation !== "not_applicable",
  ).length;

  return {
    dataset,
    adherence: computeAdherenceSummary(dataset.iterations),
    outcomes: computeOutcomeSummary(dataset.iterations),
    recommendationThemes: countThemeMatches(
      recommendationTexts,
      RECOMMENDATION_THEMES,
    ),
    reflectionThemes: countThemeMatches(reflectionTexts, REFLECTION_THEMES),
    workflowHealth: computeWorkflowHealth(dataset),
    timeline: computeLearningTimeline(dataset),
    isEarlyData: dataset.iterations.length <= 2,
    hasApplicableAdherence: applicableCount >= 3,
  };
}
