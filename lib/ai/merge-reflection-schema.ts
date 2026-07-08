import { z } from "zod";

export const mergeReflectionResponseSchema = z.object({
  mergedSummary: z.string().min(1),
  sharedPatterns: z.array(z.string()).min(0).max(8),
  uniqueFindings: z.array(z.string()).min(0).max(8),
  conflictsOrTensions: z.array(z.string()).min(0).max(6),
  missingInformation: z.array(z.string()).min(0).max(6),
  higherLevelInsight: z.string().min(1),
  recommendedStrategy: z.string().min(1),
  proposedPrompt: z.string().optional(),
  nextRecommendation: z.string().min(1),
  reasoning: z.string().min(1),
});

export type MergeReflectionResponse = z.infer<
  typeof mergeReflectionResponseSchema
>;
