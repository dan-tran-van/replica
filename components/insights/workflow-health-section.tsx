import Link from "next/link";
import type { WorkflowHealthItem } from "@/lib/insights/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OutcomeBadge } from "@/components/shared/outcome-badge";

const statusLabels: Record<WorkflowHealthItem["status"], string> = {
  healthy: "On track",
  stalled: "Might need attention",
  struggling: "Repeated struggles",
  new: "Not started",
};

const statusVariants: Record<
  WorkflowHealthItem["status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  healthy: "outline",
  stalled: "secondary",
  struggling: "destructive",
  new: "outline",
};

interface WorkflowHealthSectionProps {
  items: WorkflowHealthItem[];
}

export function WorkflowHealthSection({ items }: WorkflowHealthSectionProps) {
  const attention = items.filter(
    (i) => i.status === "stalled" || i.status === "struggling",
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow health</CardTitle>
        <CardDescription>
          A gentle check-in on each workflow — not a scorecard.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {attention.length > 0 ? (
          <p className="text-sm text-muted-foreground">
            {attention.length} workflow{attention.length === 1 ? "" : "s"} may
            need a look.
          </p>
        ) : null}

        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.workflowId}>
              <Card size="sm">
                <CardContent className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{item.workflowName}</span>
                      <Badge variant={statusVariants[item.status]}>
                        {statusLabels[item.status]}
                      </Badge>
                      {item.latestOutcome ? (
                        <OutcomeBadge outcome={item.latestOutcome} />
                      ) : null}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.iterationCount}{" "}
                      {item.iterationCount === 1 ? "run" : "runs"}
                      {item.adherenceRate !== null
                        ? ` · ${item.adherenceRate}% adherence`
                        : ""}
                      {" · "}
                      Updated{" "}
                      {new Date(item.lastUpdated).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/workflows/${item.workflowId}`}>Open</Link>
                  </Button>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
