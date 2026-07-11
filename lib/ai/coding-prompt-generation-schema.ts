import { z } from "zod";
import { CODING_RECOMMENDED_MODES } from "@/lib/domain/coding-types";

export const codingPromptGenerationResponseSchema = z.object({
  recommendedMode: z.enum(CODING_RECOMMENDED_MODES),
  recommendedModeRationale: z.string().min(1),
  generatedPrompt: z.string().min(1),
  nextActions: z.array(z.string()).min(0).max(8),
  retryChecklist: z.array(z.string()).min(0).max(8),
  tokenWasteReductionReason: z.string().min(1),
});

export type CodingPromptGenerationResponse = z.infer<
  typeof codingPromptGenerationResponseSchema
>;
