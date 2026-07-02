import { Card, CardContent } from "@/components/ui/card";

interface InsightsEmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function InsightsEmptyState({
  title,
  description,
  action,
}: InsightsEmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="px-6 py-12 text-center">
        <h2 className="text-base font-medium">{title}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
        {action ? <div className="mt-6">{action}</div> : null}
      </CardContent>
    </Card>
  );
}

export function EarlyDataNotice() {
  return (
    <p className="rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
      Early data — patterns may shift as you log more runs.
    </p>
  );
}
