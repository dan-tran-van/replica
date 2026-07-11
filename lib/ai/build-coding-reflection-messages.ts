import type {
  CodingAttempt,
  CodingAttemptOutcome,
  CodingRecommendedMode,
  CodingSession,
} from "@/lib/domain/coding-types";
import { truncate, truncateUserMessage } from "@/lib/utils/truncate";

const FIELD_TRUNCATE = 1800;
const ATTEMPT_TRUNCATE = 5200;

export const CODING_REFLECTION_SYSTEM_PROMPT = `You are a coding-attempt reflection advisor.

Replica does not replace the user's coding tool and does not integrate with editors, IDEs, Cursor, Codex, Claude Code, VS Code, or any external coding agent. The user runs coding attempts elsewhere, then pastes the task, prompt, output, errors, and notes into Replica.

Your job:
1. Explain what likely went wrong in the pasted coding attempt.
2. Identify missing context that would have made the external coding tool more effective.
3. Recommend the best mode for the next external coding tool run.
4. Write a sharper next prompt the user can copy into that external tool.
5. Give concrete next actions and a retry checklist.
6. Explain why the recommendation may reduce token waste, without claiming measured token savings.
7. Learn from previous same-session outcomes.

Recommended modes:
- plan: ask the coding tool to inspect and plan before editing.
- implement: ask it to make the actual change.
- debug: ask it to diagnose an error or failing behavior.
- test: ask it to add or run tests/checks.
- refactor: ask it to improve structure without changing behavior.
- review: ask it to review code or previous changes.
- explain: ask it to explain behavior or code before changing it.
- investigate: ask it to inspect codebase context before deciding.
- continue: ask it to continue from a previous partial result.
- verify: ask it to confirm behavior, run checks, prevent regressions, or decide whether to stop.

History rules:
- If a previous suggestion was not helpful or made things worse, explicitly change strategy.
- If a previous suggestion partially helped, preserve what worked and narrow the next prompt.
- If the problem was fixed, recommend verify, cleanup, tests, documentation, or review instead of more implementation.
- Do not repeat a prior generated prompt unless the outcome shows it fixed the problem and verification is the next step.

Respond with JSON only:
{
  "summary": "2-4 sentence summary",
  "whatWentWrong": ["specific issues with the attempt"],
  "missingContext": ["context the next prompt should include"],
  "recommendedMode": "plan | implement | debug | test | refactor | review | explain | investigate | continue | verify",
  "recommendedModeRationale": "short rationale for the recommended mode",
  "betterNextPrompt": "copy-ready prompt for the user's external coding tool",
  "nextActions": ["concrete next actions for the human"],
  "retryChecklist": ["checks before or after retrying externally"],
  "tokenWasteReductionReason": "why this may reduce token waste"
}

Keep the prompt practical and direct. Do not claim Replica executed code or measured token usage.`;

const OUTCOME_LABELS: Record<CodingAttemptOutcome, string> = {
  unknown: "Unknown",
  notRun: "Not run yet",
  helpful: "Helpful",
  partiallyHelpful: "Partially helpful",
  fixed: "Fixed the problem",
  notHelpful: "Not helpful",
  madeWorse: "Made things worse",
};

const MODE_LABELS: Record<CodingRecommendedMode, string> = {
  plan: "Plan",
  implement: "Implement",
  debug: "Debug",
  test: "Test",
  refactor: "Refactor",
  review: "Review",
  explain: "Explain",
  investigate: "Investigate",
  continue: "Continue",
  verify: "Verify",
};

function formatAttempt(
  attempt: CodingAttempt,
  index: number,
  currentAttemptId: string,
): string {
  const lines = [
    `Attempt ${index + 1}${attempt.id === currentAttemptId ? " (current)" : ""}`,
    `Status: ${attempt.status}`,
    `Tool used: ${attempt.toolUsed || "(not specified)"}`,
    `Outcome after running suggested prompt: ${OUTCOME_LABELS[attempt.outcome]}`,
  ];

  if (attempt.basedOnAttemptId) {
    lines.push(`Based on attempt id: ${attempt.basedOnAttemptId}`);
  }
  if (attempt.recommendedMode) {
    lines.push(`Stored recommended mode: ${MODE_LABELS[attempt.recommendedMode]}`);
  }
  if (attempt.outcomeNotes) {
    lines.push(
      `Notes after running:\n${truncate(attempt.outcomeNotes, FIELD_TRUNCATE)}`,
    );
  }

  lines.push(
    `Original prompt:\n${truncate(attempt.originalPrompt, FIELD_TRUNCATE)}`,
  );

  if (attempt.aiOutput) {
    lines.push(`AI output:\n${truncate(attempt.aiOutput, FIELD_TRUNCATE)}`);
  }
  if (attempt.errorOutput) {
    lines.push(`Error output:\n${truncate(attempt.errorOutput, FIELD_TRUNCATE)}`);
  }
  if (attempt.developerNotes) {
    lines.push(
      `Developer notes:\n${truncate(attempt.developerNotes, FIELD_TRUNCATE)}`,
    );
  }
  if (attempt.resultSummary) {
    lines.push(
      `Result summary:\n${truncate(attempt.resultSummary, FIELD_TRUNCATE)}`,
    );
  }
  if (attempt.generatedReflection?.status === "completed") {
    lines.push(
      `Prior reflection recommended mode: ${
        MODE_LABELS[attempt.generatedReflection.recommendedMode]
      }`,
      `Prior reflection better prompt:\n${truncate(
        attempt.generatedReflection.betterNextPrompt,
        FIELD_TRUNCATE,
      )}`,
      `Prior reflection rationale:\n${truncate(
        attempt.generatedReflection.recommendedModeRationale,
        FIELD_TRUNCATE,
      )}`,
    );
  }

  return truncate(lines.join("\n\n"), ATTEMPT_TRUNCATE);
}

export function buildCodingReflectionMessages(input: {
  session: CodingSession;
  attempt: CodingAttempt;
}): { system: string; user: string; wasTruncated: boolean } {
  const userParts = [
    "## Coding task",
    truncate(input.session.taskDescription, FIELD_TRUNCATE),
    "",
    "## Session status",
    input.session.status,
    "",
    "## Attempts in this session",
  ];

  input.session.attempts.forEach((attempt, index) => {
    userParts.push(formatAttempt(attempt, index, input.attempt.id), "");
  });

  const rawUser = userParts.join("\n");
  const { content, wasTruncated } = truncateUserMessage(rawUser);

  return {
    system: CODING_REFLECTION_SYSTEM_PROMPT,
    user: content,
    wasTruncated,
  };
}
