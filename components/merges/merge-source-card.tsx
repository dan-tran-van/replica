import type { MergeSource } from "@/lib/domain/merge-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MergeSourceCardProps {
  source: MergeSource;
  workflowName?: string;
  runNumber?: number;
  onRemove: () => void;
}

export function MergeSourceCard({
  source,
  workflowName,
  runNumber,
  onRemove,
}: MergeSourceCardProps) {
  const title =
    source.label ||
    (source.kind === "run"
      ? `${workflowName ?? "Workflow"} · Run #${runNumber ?? "?"}`
      : source.sourceTool || "Manual paste");

  const subtitle =
    source.kind === "run"
      ? [source.perspective, "Reflected run"].filter(Boolean).join(" · ")
      : [source.perspective, source.sourceTool].filter(Boolean).join(" · ");

  return (
    <Card size="sm">
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-sm">{title}</CardTitle>
            <Badge variant="outline">
              {source.kind === "run" ? "Run" : "Manual"}
            </Badge>
          </div>
          {subtitle ? (
            <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
          Remove
        </Button>
      </CardHeader>
      {source.kind === "manual" ? (
        <CardContent>
          <p className="line-clamp-3 font-mono text-xs text-muted-foreground">
            {source.content.slice(0, 120)}
            {source.content.length > 120 ? "…" : ""}
          </p>
        </CardContent>
      ) : null}
    </Card>
  );
}
