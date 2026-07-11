import { z } from "zod";

export const codingSessionContextResponseSchema = z.object({
  summary: z.string().min(1),
  goals: z.array(z.string()).min(0).max(8),
  constraints: z.array(z.string()).min(0).max(8),
  relevantFiles: z.array(z.string()).min(0).max(12),
  assumptions: z.array(z.string()).min(0).max(8),
  notes: z.string().min(0),
});

export type CodingSessionContextResponse = z.infer<
  typeof codingSessionContextResponseSchema
>;
