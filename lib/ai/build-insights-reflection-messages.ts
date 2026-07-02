import type { InsightsReport } from "@/lib/insights/types";
import { truncate } from "@/lib/utils/truncate";

export const INSIGHTS_REFLECTION_SYSTEM_PROMPT = `You are a reflective advisor helping someone understand patterns in how they use Replica — a tool for improving AI prompts through repeated runs and reflection.

You receive summarized analytics across all their workflows. Your job is to produce a concise, honest meta-reflection on their decision-making habits — not a motivational essay.

Respond with JSON only:
{
  "patterns": ["2-4 observable patterns across workflows"],
  "habitsThatSlow": ["1-3 habits that slow progress"],
  "habitsThatHelp": ["1-3 habits that consistently help"],
  "replicaUsageChanges": ["1-3 concrete changes to how they use Replica"],
  "highestLeverageImprovement": "single sentence — the one change with highest leverage",
  "timelineHighlights": ["2-4 journal-style bullets synthesizing their learning arc"]
}

Guidelines:
- Be specific; reference adherence rates, outcome patterns, and themes when relevant
- Distinguish ignored recommendations from followed-but-wrong recommendations
- Focus on decision-making and how they use Replica, not generic productivity advice
- Keep each string to 1-2 sentences max
- Tone: calm, reflective, direct — like a thoughtful coach reviewing a journal`;

export function buildInsightsReflectionMessages(
  report: InsightsReport,
): { system: string; user: string } {
  const { adherence, outcomes, workflowHealth, timeline } = report;

  const exampleObservations = report.dataset.iterations
    .map((i) => i.observations.trim())
    .filter(Boolean)
    .slice(-5)
    .map((o) => truncate(o, 200));

  const exampleRecommendations = report.dataset.iterations
    .filter((i) => i.analysis?.status === "completed")
    .map((i) => truncate(i.analysis!.nextRecommendation, 200))
    .slice(-5);

  const healthSummary = workflowHealth
    .map((w) => `${w.workflowName}: ${w.status} (${w.iterationCount} runs)`)
    .join("\n");

  const userParts = [
    "## Adherence summary",
    `Followed: ${adherence.percentages.yes}% (${adherence.yes}/${adherence.totalApplicable})`,
    `Partially: ${adherence.percentages.partially}% (${adherence.partially}/${adherence.totalApplicable})`,
    `Not followed: ${adherence.percentages.no}% (${adherence.no}/${adherence.totalApplicable})`,
    "",
    "## Outcome summary",
    `Success: ${outcomes.percentages.success}% | Partial: ${outcomes.percentages.partial}% | Failure: ${outcomes.percentages.failure}%`,
    "",
    "## Outcomes when recommendations were followed",
    ...outcomes.outcomeByAdherence.map(
      (o) =>
        `${o.adherence}: ${o.successRate}% success rate (${o.total} runs)`,
    ),
    "",
    "## Top recommendation themes",
    ...report.recommendationThemes
      .slice(0, 5)
      .map((t) => `- ${t.label}: ${t.count} mentions`),
    "",
    "## Top reflection themes",
    ...report.reflectionThemes
      .slice(0, 5)
      .map((t) => `- ${t.label}: ${t.count} mentions`),
    "",
    "## Workflow health",
    healthSummary || "(no workflows)",
    "",
    "## Learning timeline (rule-generated)",
    ...timeline.map((t) => `- ${t.text}`),
    "",
    "## Sample observations",
    ...exampleObservations.map((o) => `- "${o}"`),
    "",
    "## Sample recommendations",
    ...exampleRecommendations.map((r) => `- "${r}"`),
  ];

  const user = userParts.join("\n").slice(0, 8000);

  return { system: INSIGHTS_REFLECTION_SYSTEM_PROMPT, user };
}
