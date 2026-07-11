import type {
  CodingAttempt,
  CodingAttemptOutcome,
  CodingRecommendedMode,
  CodingSession,
} from "@/lib/domain/coding-types";
import { truncate, truncateUserMessage } from "@/lib/utils/truncate";
import { formatCodingSessionContext } from "./format-coding-session-context";

const FIELD_TRUNCATE = 1800;
const HISTORY_TRUNCATE = 4200;

export interface CodingPromptGenerationInput {
  featureTaskDescription: string;
  goal: string;
  relevantContext: string;
  constraints: string;
  filesComponents: string;
  preferredTool: string;
  notesOrConcerns: string;
}

export const CODING_PROMPT_GENERATION_SYSTEM_PROMPT = `You are a prompt design advisor for external AI coding tools.

Replica does not execute code, does not inspect files directly, and does not integrate with editors, IDEs, Cursor, Codex, Claude Code, VS Code, ChatGPT, or any external coding agent. The user will copy your generated prompt into a tool they run elsewhere.

Your job:
1. Recommend the best mode for the next external coding run.
2. Produce a ready-to-copy coding prompt for the user's external tool that is detailed enough to guide a coding agent without being vague.
3. Include concrete next actions and a retry checklist.
4. Explain why the prompt may reduce token waste, without claiming measured savings.
5. Use saved session context as grounding material for every generation in this session.

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

Respond with JSON only:
{
  "recommendedMode": "plan | implement | debug | test | refactor | review | explain | investigate | continue | verify",
  "recommendedModeRationale": "short rationale for the recommended mode",
  "generatedPrompt": "copy-ready prompt for the user's external coding tool",
  "nextActions": ["concrete next actions for the human"],
  "retryChecklist": ["checks before or after running externally"],
  "tokenWasteReductionReason": "why this may reduce token waste"
}

Keep the generated prompt specific, bounded, and practical.
The generatedPrompt must be substantial and structured. Include:
- a clear role and objective
- the relevant session context and task details
- constraints and non-goals
- files/components to inspect when known
- an ordered workflow for the external coding tool
- expected deliverables
- validation or checks to run when applicable
- instructions to avoid unrelated rewrites
- a stopping point or question to ask if context is insufficient

Do not generate a short generic prompt unless the user's input is truly minimal.`;

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

function formatAttemptSummary(attempt: CodingAttempt, index: number): string {
  const parts = [
    `Attempt ${index + 1}`,
    `Source: ${attempt.source}`,
    `Status: ${attempt.status}`,
    `Outcome: ${OUTCOME_LABELS[attempt.outcome]}`,
  ];

  if (attempt.recommendedMode) {
    parts.push(`Recommended mode: ${MODE_LABELS[attempt.recommendedMode]}`);
  }
  if (attempt.resultSummary) {
    parts.push(`Result summary: ${truncate(attempt.resultSummary, 600)}`);
  }
  if (attempt.outcomeNotes) {
    parts.push(`Outcome notes: ${truncate(attempt.outcomeNotes, 600)}`);
  }

  return parts.join("\n");
}

export function buildCodingPromptGenerationMessages(input: {
  session: CodingSession;
  request: CodingPromptGenerationInput;
}): { system: string; user: string; wasTruncated: boolean } {
  const history = input.session.attempts
    .map((attempt, index) => formatAttemptSummary(attempt, index))
    .join("\n\n");

  const userParts = [
    "## Session task",
    truncate(input.session.taskDescription, FIELD_TRUNCATE),
    "",
    "## Saved session context",
    formatCodingSessionContext(input.session.sessionContext),
    "",
    "## Feature/task description",
    truncate(input.request.featureTaskDescription, FIELD_TRUNCATE),
    "",
    "## Goal",
    truncate(input.request.goal || "(not specified)", FIELD_TRUNCATE),
    "",
    "## Relevant context",
    truncate(input.request.relevantContext || "(not specified)", FIELD_TRUNCATE),
    "",
    "## Constraints",
    truncate(input.request.constraints || "(not specified)", FIELD_TRUNCATE),
    "",
    "## Files/components involved",
    truncate(input.request.filesComponents || "(not specified)", FIELD_TRUNCATE),
    "",
    "## Preferred external tool",
    truncate(input.request.preferredTool || "(not specified)", FIELD_TRUNCATE),
    "",
    "## Notes or concerns",
    truncate(input.request.notesOrConcerns || "(not specified)", FIELD_TRUNCATE),
    "",
    "## Same-session history",
    truncate(history || "(none)", HISTORY_TRUNCATE),
  ];

  const rawUser = userParts.join("\n");
  const { content, wasTruncated } = truncateUserMessage(rawUser);

  return {
    system: CODING_PROMPT_GENERATION_SYSTEM_PROMPT,
    user: content,
    wasTruncated,
  };
}
