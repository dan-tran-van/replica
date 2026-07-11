import type {
  CodingAttempt,
  CodingAttemptOutcome,
  CodingRecommendedMode,
  CodingSession,
} from "@/lib/domain/coding-types";
import { truncate, truncateUserMessage } from "@/lib/utils/truncate";
import { formatCodingSessionContext } from "./format-coding-session-context";

const FIELD_TRUNCATE = 1800;
const HISTORY_TRUNCATE = 5200;

export interface CodingSessionContextGenerationInput {
  notes: string;
}

export const CODING_SESSION_CONTEXT_SYSTEM_PROMPT = `You create reusable session context for Replica Coding.

Replica is local-first and does not inspect code directly. The user will provide a Coding session task, optional notes, and same-session attempt history. Your job is to distill reusable context that should improve future prompt generation inside this one session.

Create context that is concise but specific:
- capture the durable task background
- identify goals, constraints, relevant files/components, assumptions, and useful notes
- preserve concrete details from previous attempts and outcomes
- do not invent files or facts that are not present
- if evidence is missing, record it as an assumption instead of pretending it is known

Respond with JSON only:
{
  "summary": "reusable 2-5 sentence context summary",
  "goals": ["durable goals for this session"],
  "constraints": ["scope limits or requirements future prompts should honor"],
  "relevantFiles": ["known files, components, routes, or modules"],
  "assumptions": ["assumptions or unknowns future prompts should verify"],
  "notes": "extra reusable notes for future prompt generation"
}`;

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

function formatAttempt(attempt: CodingAttempt, index: number): string {
  const parts = [
    `Attempt ${index + 1}`,
    `Source: ${attempt.source}`,
    `Status: ${attempt.status}`,
    `Outcome: ${OUTCOME_LABELS[attempt.outcome]}`,
  ];

  if (attempt.recommendedMode) {
    parts.push(`Recommended mode: ${MODE_LABELS[attempt.recommendedMode]}`);
  }
  if (attempt.originalPrompt) {
    parts.push(`Prompt: ${truncate(attempt.originalPrompt, 800)}`);
  }
  if (attempt.resultSummary) {
    parts.push(`Result summary: ${truncate(attempt.resultSummary, 600)}`);
  }
  if (attempt.developerNotes) {
    parts.push(`Developer notes: ${truncate(attempt.developerNotes, 600)}`);
  }
  if (attempt.outcomeNotes) {
    parts.push(`Outcome notes: ${truncate(attempt.outcomeNotes, 600)}`);
  }
  if (attempt.generatedReflection?.status === "completed") {
    parts.push(
      `Reflection summary: ${truncate(
        attempt.generatedReflection.summary,
        600,
      )}`,
      `Better prompt: ${truncate(
        attempt.generatedReflection.betterNextPrompt,
        800,
      )}`,
    );
  }

  return parts.join("\n");
}

export function buildCodingSessionContextMessages(input: {
  session: CodingSession;
  request: CodingSessionContextGenerationInput;
}): { system: string; user: string; wasTruncated: boolean } {
  const history = input.session.attempts
    .map((attempt, index) => formatAttempt(attempt, index))
    .join("\n\n");

  const userParts = [
    "## Session title",
    truncate(input.session.title, FIELD_TRUNCATE),
    "",
    "## Session task",
    truncate(input.session.taskDescription, FIELD_TRUNCATE),
    "",
    "## Existing saved context",
    formatCodingSessionContext(input.session.sessionContext),
    "",
    "## User notes for context generation",
    truncate(input.request.notes || "(none)", FIELD_TRUNCATE),
    "",
    "## Same-session attempt history",
    truncate(history || "(none)", HISTORY_TRUNCATE),
  ];

  const rawUser = userParts.join("\n");
  const { content, wasTruncated } = truncateUserMessage(rawUser);

  return {
    system: CODING_SESSION_CONTEXT_SYSTEM_PROMPT,
    user: content,
    wasTruncated,
  };
}
