import type {
  CodingAttemptOutcome,
  CodingAttemptSource,
  CodingAttemptStatus,
  CodingRecommendedMode,
  CodingSessionStatus,
} from "@/lib/domain/coding-types";

export const CODING_MODE_LABELS: Record<CodingRecommendedMode, string> = {
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

export const CODING_ATTEMPT_STATUS_LABELS: Record<
  CodingAttemptStatus,
  string
> = {
  failed: "Failed",
  needsImprovement: "Needs improvement",
  completed: "Completed",
};

export const CODING_OUTCOME_LABELS: Record<CodingAttemptOutcome, string> = {
  unknown: "Unknown",
  notRun: "Not run yet",
  helpful: "Helpful",
  partiallyHelpful: "Partially helpful",
  fixed: "Fixed the problem",
  notHelpful: "Not helpful",
  madeWorse: "Made things worse",
};

export const CODING_SESSION_STATUS_LABELS: Record<CodingSessionStatus, string> =
  {
    active: "Active",
    resolved: "Resolved",
  };

export const CODING_ATTEMPT_SOURCE_LABELS: Record<CodingAttemptSource, string> =
  {
    manual: "Manual",
    generatedFromDescription: "Generated from description",
    generatedFromReflection: "Generated from reflection",
  };
