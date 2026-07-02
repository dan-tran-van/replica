import { z } from "zod";

export const analysisResponseSchema = z.object({
  proposedPrompt: z.string().min(1),
  reasoning: z.string().min(1),
  nextRecommendation: z.string().min(1),
});

export type AnalysisResponse = z.infer<typeof analysisResponseSchema>;
