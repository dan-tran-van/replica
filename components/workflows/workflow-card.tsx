"use client";

import Link from "next/link";
import type { WorkflowWithCount } from "@/lib/hooks/use-workflows";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function WorkflowCard({ workflow }: { workflow: WorkflowWithCount }) {
  return (
    <Link href={`/workflows/${workflow.id}`} className="block">
      <Card
        size="sm"
        className="transition-colors hover:bg-muted/50"
      >
        <CardContent className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate font-medium">{workflow.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {workflow.iterationCount}{" "}
              {workflow.iterationCount === 1 ? "run" : "runs"} · Updated{" "}
              {formatDate(workflow.updatedAt)}
            </p>
          </div>
          <Badge variant="outline" className="shrink-0">
            Manus
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}
