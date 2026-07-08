import { Card, CardContent } from "@/components/ui/card";

interface MergeEmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function MergeEmptyState({
  title,
  description,
  action,
}: MergeEmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <h2 className="text-base font-medium">{title}</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
        {action ? <div className="mt-6">{action}</div> : null}
      </CardContent>
    </Card>
  );
}
