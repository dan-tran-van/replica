import type { Iteration, Workflow } from "@/lib/domain/types";
import {
  getLatestPromptUsed,
  getPriorRecommendation,
  getRecommendationRespondedTo,
} from "@/lib/domain/derive";
import { truncate, truncateUserMessage } from "@/lib/utils/truncate";

const PRIOR_ITERATION_LIMIT = 10;
const FIELD_TRUNCATE = 500;

export const SYSTEM_PROMPT = `You are a prompt improvement advisor for scheduled AI tasks (Manus Scheduled Tasks).

Your job is to help the user evolve their prompt over repeated runs. You receive:
- The original starter prompt
- The prompt actually used in the latest run
- The Manus output from the latest run
- The user's reflection (outcome + observations)
- Whether the user followed your prior nextRecommendation (yes / partially / no / not applicable)
- A history of prior iterations including adherence feedback

Respond with JSON only, matching this schema:
{
  "proposedPrompt": "The full updated prompt the user should copy into Manus for the next run",
  "reasoning": "Why you made these changes, referencing patterns from reflections and history",
  "nextRecommendation": "One concrete next action for the user (e.g. run in Manus, tweak a specific section, log another run)"
}

Guidelines:
- Preserve what is working; make targeted improvements based on user feedback
- The proposed prompt must be complete and ready to paste — not a diff or partial edit
- Reference specific observations from the user when explaining changes
- Keep nextRecommendation actionable, singular, and small enough that a user can realistically follow it before their next log
- Do not execute tasks or pretend to run Manus

Recommendation adherence feedback:
- When followedPriorRecommendation is "no" or "partially", prioritize understanding why in your reasoning and adjust nextRecommendation to be clearer, smaller, and more likely to be followed
- Avoid repeating recommendations the user consistently ignores unless their observations explain a new reason to retry
- When followedPriorRecommendation is "yes" but outcome is "failure" or "partial", the recommendation may have been followed but was wrong — distinguish "bad advice" from "ignored advice" in your reasoning`;

function formatAdherence(value: Iteration["followedPriorRecommendation"]): string {
  if (value === "not_applicable") return "n/a";
  return value;
}

interface BuildMessagesInput {
  workflow: Workflow;
  priorIterations: Iteration[];
  currentIteration: Iteration;
}

export function buildAnalysisMessages({
  workflow,
  priorIterations,
  currentIteration,
}: BuildMessagesInput): {
  system: string;
  user: string;
  wasTruncated: boolean;
} {
  const allPriorToCurrent = priorIterations;
  const latestPromptUsed = getLatestPromptUsed(workflow, [
    ...allPriorToCurrent,
    currentIteration,
  ]);

  const priorRecommendationForCurrent = getPriorRecommendation(allPriorToCurrent);

  const sortedPrior = [...priorIterations].sort(
    (a, b) => a.sequenceNumber - b.sequenceNumber,
  );

  const omittedCount = Math.max(0, sortedPrior.length - PRIOR_ITERATION_LIMIT);
  const visiblePrior = sortedPrior.slice(-PRIOR_ITERATION_LIMIT);

  const priorSections = visiblePrior
    .map((iteration) => {
      const proposed =
        iteration.analysis?.status === "completed"
          ? iteration.analysis.proposedPrompt
          : "(no analysis)";
      const respondedTo = getRecommendationRespondedTo(
        iteration,
        sortedPrior,
      );
      const respondedToLine = respondedTo
        ? `Prior nextRecommendation: ${truncate(respondedTo, FIELD_TRUNCATE)}`
        : "Prior nextRecommendation: (none)";
      return `### Iteration ${iteration.sequenceNumber}
Prompt used: ${truncate(iteration.promptUsed, FIELD_TRUNCATE)}
Outcome: ${iteration.outcome}
Followed prior recommendation: ${formatAdherence(iteration.followedPriorRecommendation)}
${respondedToLine}
Observations: ${truncate(iteration.observations, FIELD_TRUNCATE)}
Prior proposed prompt: ${truncate(proposed, FIELD_TRUNCATE)}`;
    })
    .join("\n\n");

  const userParts = [
    `## Starter prompt (original)\n${workflow.starterPrompt}`,
    `## Latest prompt used (before this run)\n${latestPromptUsed}`,
    `## Current iteration (#${currentIteration.sequenceNumber})`,
    `Prompt used: ${currentIteration.promptUsed}`,
    `Outcome: ${currentIteration.outcome}`,
    `Followed prior recommendation: ${formatAdherence(currentIteration.followedPriorRecommendation)}`,
    priorRecommendationForCurrent
      ? `(The recommendation they were responding to: "${priorRecommendationForCurrent}")`
      : "(No prior recommendation for this run)",
    `Observations: ${currentIteration.observations}`,
    `Manus output:\n${currentIteration.manusOutput}`,
  ];

  if (priorSections) {
    userParts.push(`## Prior iterations\n${priorSections}`);
  }

  if (omittedCount > 0) {
    userParts.push(
      `(${omittedCount} earlier iteration${omittedCount === 1 ? "" : "s"} omitted)`,
    );
  }

  const { content, wasTruncated } = truncateUserMessage(userParts.join("\n\n"));

  return { system: SYSTEM_PROMPT, user: content, wasTruncated };
}
