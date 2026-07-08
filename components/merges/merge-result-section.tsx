import { CopyButton } from "@/components/shared/copy-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface MergeResultSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  copyText?: string;
  copyLabel?: string;
}

export function MergeResultSection({
  title,
  description,
  children,
  copyText,
  copyLabel,
}: MergeResultSectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            {description ? (
              <CardDescription>{description}</CardDescription>
            ) : null}
          </div>
          {copyText ? (
            <CopyButton text={copyText} label={copyLabel ?? "Copy"} />
          ) : null}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

interface MergeResultListSectionProps {
  title: string;
  items: string[];
  emptyMessage?: string;
}

export function MergeResultListSection({
  title,
  items,
  emptyMessage = "None identified",
}: MergeResultListSectionProps) {
  return (
    <MergeResultSection title={title}>
      {items.length > 0 ? (
        <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      )}
    </MergeResultSection>
  );
}
