import { z } from "zod";
import { CODING_RECOMMENDED_MODES } from "@/lib/domain/coding-types";

export const codingReflectionResponseSchema = z.object({
  summary: z.string().min(1),
  whatWentWrong: z.array(z.string()).min(0).max(8),
  missingContext: z.array(z.string()).min(0).max(8),
  recommendedMode: z.enum(CODING_RECOMMENDED_MODES),
  recommendedModeRationale: z.string().min(1),
  betterNextPrompt: z.string().min(1),
  nextActions: z.array(z.string()).min(0).max(8),
  retryChecklist: z.array(z.string()).min(0).max(8),
  tokenWasteReductionReason: z.string().min(1),
});

export type CodingReflectionResponse = z.infer<
  typeof codingReflectionResponseSchema
>;
