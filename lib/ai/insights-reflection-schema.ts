import { z } from "zod";

export const insightsReflectionSchema = z.object({
  patterns: z.array(z.string()).min(1).max(4),
  habitsThatSlow: z.array(z.string()).min(1).max(3),
  habitsThatHelp: z.array(z.string()).min(1).max(3),
  replicaUsageChanges: z.array(z.string()).min(1).max(3),
  highestLeverageImprovement: z.string().min(1),
  timelineHighlights: z.array(z.string()).min(1).max(4),
});

export type InsightsReflection = z.infer<typeof insightsReflectionSchema>;
