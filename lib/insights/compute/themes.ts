import type { ThemeConfig } from "../themes";
import type { ThemeFrequency } from "../types";

export function countThemeMatches(
  texts: string[],
  themes: ThemeConfig[],
): ThemeFrequency[] {
  const results: ThemeFrequency[] = [];

  for (const theme of themes) {
    let count = 0;
    let example: string | null = null;

    for (const text of texts) {
      const lower = text.toLowerCase();
      const matched = theme.keywords.some((keyword) =>
        lower.includes(keyword.toLowerCase()),
      );
      if (matched) {
        count++;
        if (!example) {
          example =
            text.length > 120 ? `${text.slice(0, 120)}…` : text;
        }
      }
    }

    if (count > 0) {
      results.push({
        id: theme.id,
        label: theme.label,
        count,
        example,
      });
    }
  }

  return results.sort((a, b) => b.count - a.count);
}
