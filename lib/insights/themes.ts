export interface ThemeConfig {
  id: string;
  label: string;
  keywords: string[];
}

export const RECOMMENDATION_THEMES: ThemeConfig[] = [
  {
    id: "validate",
    label: "Validate with users",
    keywords: ["validate", "user", "feedback", "interview", "test"],
  },
  {
    id: "research",
    label: "Do more research",
    keywords: ["research", "investigate", "explore", "gather", "learn"],
  },
  {
    id: "simplify",
    label: "Simplify scope",
    keywords: ["simplify", "narrow", "scope", "smaller", "reduce"],
  },
  {
    id: "prompt",
    label: "Improve prompt",
    keywords: ["prompt", "rewrite", "clarify", "instruction"],
  },
  {
    id: "evidence",
    label: "Collect more evidence",
    keywords: ["evidence", "data", "metric", "measure", "log"],
  },
];

export const REFLECTION_THEMES: ThemeConfig[] = [
  {
    id: "validation_gap",
    label: "Need more validation",
    keywords: ["validation", "validate", "users", "feedback"],
  },
  {
    id: "too_early",
    label: "Built too early",
    keywords: ["too early", "premature", "rushed"],
  },
  {
    id: "polish",
    label: "Need polishing",
    keywords: ["polish", "refine", "quality", "rough"],
  },
  {
    id: "distribution",
    label: "Distribution problem",
    keywords: ["distribution", "reach", "audience", "marketing"],
  },
];
