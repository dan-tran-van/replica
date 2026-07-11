import type { CodingSessionContext } from "@/lib/domain/coding-types";
import { truncate } from "@/lib/utils/truncate";

const CONTEXT_FIELD_TRUNCATE = 1400;

function formatList(title: string, items: string[]): string[] {
  if (items.length === 0) return [];
  return [title, ...items.map((item) => `- ${truncate(item, CONTEXT_FIELD_TRUNCATE)}`)];
}

export function formatCodingSessionContext(
  context: CodingSessionContext | null,
): string {
  if (!context) return "(none)";

  const parts = [
    "Summary",
    truncate(context.summary || "(not specified)", CONTEXT_FIELD_TRUNCATE),
    "",
    ...formatList("Goals", context.goals),
    "",
    ...formatList("Constraints", context.constraints),
    "",
    ...formatList("Relevant files/components", context.relevantFiles),
    "",
    ...formatList("Assumptions", context.assumptions),
    "",
    "Notes",
    truncate(context.notes || "(not specified)", CONTEXT_FIELD_TRUNCATE),
  ];

  return parts.filter((part, index, all) => part || all[index - 1]).join("\n");
}
