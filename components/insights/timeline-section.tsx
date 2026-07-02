import type { TimelineEntry } from "@/lib/insights/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TimelineSectionProps {
  entries: TimelineEntry[];
}

export function TimelineSection({ entries }: TimelineSectionProps) {
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle>Learning timeline</CardTitle>
        <CardDescription>
          Moments that stood out across your workflows.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Keep logging runs — your learning story will appear here.
          </p>
        ) : (
          <ol className="space-y-4">
            {entries.map((entry, index) => (
              <li key={`${entry.date}-${index}`} className="flex gap-3">
                <time
                  dateTime={entry.date}
                  className="shrink-0 text-xs text-muted-foreground pt-0.5 w-20"
                >
                  {new Date(entry.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </time>
                <p className="text-sm">{entry.text}</p>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
