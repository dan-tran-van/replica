"use client";

import { use } from "react";
import Link from "next/link";
import { useMergeSession } from "@/lib/hooks/use-merge-session";
import { MergeResultView } from "@/components/merges/merge-result-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function MergeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session, isLoading, error, refetch } = useMergeSession(id);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading merge…</p>;
  }

  if (error || !session) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">
          {error ?? "Merge session not found"}
        </p>
        <Button variant="outline" asChild>
          <Link href="/merges">Back to merges</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="link" className="h-auto p-0" asChild>
          <Link href="/merges">← Merges</Link>
        </Button>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold">{session.title}</h1>
          {session.result?.status === "completed" ? (
            <Badge variant="secondary">Merged</Badge>
          ) : session.result?.status === "failed" ? (
            <Badge variant="destructive">Failed</Badge>
          ) : null}
        </div>
        {session.userGoal ? (
          <p className="mt-2 text-sm text-muted-foreground">{session.userGoal}</p>
        ) : null}
        <p className="mt-1 text-xs text-muted-foreground">
          {session.sources.length} independent source
          {session.sources.length === 1 ? "" : "s"} ·{" "}
          {new Date(session.updatedAt).toLocaleString()}
        </p>
      </div>

      <MergeResultView session={session} onUpdated={() => void refetch()} />
    </div>
  );
}
