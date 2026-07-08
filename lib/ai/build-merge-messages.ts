import type {
  ResolvedManualSource,
  ResolvedMergeSource,
  ResolvedRunSource,
} from "@/lib/domain/resolve-merge-sources";
import { truncate, truncateUserMessage } from "@/lib/utils/truncate";

const FIELD_TRUNCATE = 1500;
const SOURCE_TRUNCATE = 4000;

export const MERGE_REFLECTION_SYSTEM_PROMPT = `You are a synthesis advisor helping someone merge independent AI perspectives into one higher-level understanding.

Replica does NOT execute workflows or run external tools. The user ran prompts elsewhere and is comparing what different sources discovered in parallel — NOT sequential history from one workflow.

Your job:
1. Treat each source as an independent clone/perspective exploring a related concern from a different angle.
2. Compare what each source discovered.
3. Identify shared patterns across sources.
4. Identify unique findings that only one source noticed.
5. Identify conflicts, tensions, or disagreements between sources.
6. Identify missing information or unresolved concerns.
7. Produce a higher-level insight that none of the individual sources fully captured alone.
8. Recommend ONE practical strategy (not a list of parallel actions).
9. Optionally produce a proposedPrompt the user can copy into an external AI tool.
10. Give one concrete nextRecommendation for what the human should do next.
11. Explain your synthesis briefly in reasoning.

Do not claim Replica executed anything. Preserve human control — the user decides what to run next.

Respond with JSON only:
{
  "mergedSummary": "2-4 sentence synthesis of the merged understanding",
  "sharedPatterns": ["patterns multiple sources agree on"],
  "uniqueFindings": ["findings only one source noticed"],
  "conflictsOrTensions": ["disagreements or tensions between sources"],
  "missingInformation": ["gaps or unresolved questions"],
  "higherLevelInsight": "insight none of the sources fully captured alone",
  "recommendedStrategy": "one practical strategy",
  "proposedPrompt": "optional prompt for external AI tool (omit if not helpful)",
  "nextRecommendation": "single concrete next step for the human",
  "reasoning": "brief explanation of synthesis logic"
}

Guidelines:
- Use empty arrays when a category has nothing meaningful to report.
- Be specific; reference source perspectives when helpful.
- Keep list items to 1-2 sentences max.
- Tone: calm, direct, like a thoughtful coach comparing expert memos.`;

function sourceHeading(source: ResolvedMergeSource, index: number): string {
  const parts = [`Source ${index + 1}`];
  const meta = source.source;
  if (meta.perspective) parts.push(meta.perspective);
  if (meta.label) parts.push(meta.label);
  if (meta.kind === "manual" && meta.sourceTool) parts.push(meta.sourceTool);
  return parts.join(" — ");
}

function formatRunSource(resolved: ResolvedRunSource): string {
  const { workflow, iteration, source } = resolved;
  const lines = [
    `Type: reflected run`,
    `Workflow: ${workflow.name}`,
    `Run #${iteration.sequenceNumber}, Outcome: ${iteration.outcome}`,
  ];
  if (source.perspective) lines.push(`Perspective: ${source.perspective}`);
  if (source.label) lines.push(`Label: ${source.label}`);

  lines.push(
    `Prompt used:\n${truncate(iteration.promptUsed, FIELD_TRUNCATE)}`,
    `Observations:\n${truncate(iteration.observations, FIELD_TRUNCATE)}`,
    `External output:\n${truncate(iteration.manusOutput, FIELD_TRUNCATE)}`,
  );

  if (iteration.analysis?.status === "completed") {
    lines.push(
      `Replica prior analysis — proposed prompt:\n${truncate(iteration.analysis.proposedPrompt, FIELD_TRUNCATE)}`,
      `Replica prior analysis — reasoning:\n${truncate(iteration.analysis.reasoning, FIELD_TRUNCATE)}`,
      `Replica prior analysis — next recommendation:\n${truncate(iteration.analysis.nextRecommendation, FIELD_TRUNCATE)}`,
    );
  }

  return truncate(lines.join("\n\n"), SOURCE_TRUNCATE);
}

function formatManualSource(resolved: ResolvedManualSource): string {
  const { source } = resolved;
  const lines = [`Type: manual paste`];
  if (source.perspective) lines.push(`Perspective: ${source.perspective}`);
  if (source.label) lines.push(`Label: ${source.label}`);
  if (source.sourceTool) lines.push(`Source tool: ${source.sourceTool}`);
  if (source.notes) {
    lines.push(`Notes:\n${truncate(source.notes, FIELD_TRUNCATE)}`);
  }
  lines.push(`Content:\n${truncate(source.content, FIELD_TRUNCATE)}`);
  return truncate(lines.join("\n\n"), SOURCE_TRUNCATE);
}

export function buildMergeMessages(input: {
  resolved: ResolvedMergeSource[];
  userGoal?: string;
}): { system: string; user: string; wasTruncated: boolean } {
  const userParts = [
    "## Merge goal",
    input.userGoal?.trim() || "(not specified)",
    "",
  ];

  input.resolved.forEach((resolved, index) => {
    userParts.push(`## ${sourceHeading(resolved, index)}`);
    if ("workflow" in resolved) {
      userParts.push(formatRunSource(resolved));
    } else {
      userParts.push(formatManualSource(resolved));
    }
    userParts.push("");
  });

  const rawUser = userParts.join("\n");
  const { content, wasTruncated } = truncateUserMessage(rawUser);

  return {
    system: MERGE_REFLECTION_SYSTEM_PROMPT,
    user: content,
    wasTruncated,
  };
}
