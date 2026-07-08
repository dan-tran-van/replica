import Link from "next/link";
import type { MergeSession } from "@/lib/domain/merge-types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MergeSessionCardProps {
  session: MergeSession;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function MergeSessionCard({ session }: MergeSessionCardProps) {
  const status = session.result?.status;
  const preview =
    session.result?.status === "completed"
      ? session.result.mergedSummary
      : status === "failed"
        ? session.result?.errorMessage ?? "Merge failed"
        : "No result yet";

  return (
    <Link href={`/merges/${session.id}`}>
      <Card className="transition-colors hover:bg-muted/30">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base">{session.title}</CardTitle>
            {status === "failed" ? (
              <Badge variant="destructive">Failed</Badge>
            ) : status === "completed" ? (
              <Badge variant="secondary">Merged</Badge>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="line-clamp-2 text-sm text-muted-foreground">{preview}</p>
          <p className="text-xs text-muted-foreground">
            {session.sources.length} source
            {session.sources.length === 1 ? "" : "s"} · {formatDate(session.updatedAt)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
