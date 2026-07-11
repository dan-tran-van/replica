"use client";

import { use } from "react";
import Link from "next/link";
import { useCodingSession } from "@/lib/hooks/use-coding-session";
import { CodingSessionView } from "@/components/coding/coding-session-view";
import { Button } from "@/components/ui/button";

export default function CodingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session, isLoading, error, refetch } = useCodingSession(id);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading coding…</p>;
  }

  if (error || !session) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">
          {error ?? "Coding session not found"}
        </p>
        <Button variant="outline" asChild>
          <Link href="/coding">Back to coding</Link>
        </Button>
      </div>
    );
  }

  return (
    <CodingSessionView session={session} onUpdated={() => void refetch()} />
  );
}
