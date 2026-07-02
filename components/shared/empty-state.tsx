import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="px-6 py-10 text-center">
        <h2 className="text-base font-medium">{title}</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
        {action ? <div className="mt-6">{action}</div> : null}
      </CardContent>
    </Card>
  );
}
