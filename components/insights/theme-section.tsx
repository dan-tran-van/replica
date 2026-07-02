import type { ThemeFrequency } from "@/lib/insights/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ThemeSectionProps {
  title: string;
  description: string;
  themes: ThemeFrequency[];
  emptyMessage: string;
}

export function ThemeSection({
  title,
  description,
  themes,
  emptyMessage,
}: ThemeSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {themes.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <ul className="space-y-4">
            {themes.map((theme) => (
              <li key={theme.id} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{theme.label}</span>
                  <Badge variant="secondary">{theme.count}</Badge>
                </div>
                {theme.example ? (
                  <p className="text-xs text-muted-foreground italic">
                    &ldquo;{theme.example}&rdquo;
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
