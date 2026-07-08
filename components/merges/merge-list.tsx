"use client";

import Link from "next/link";
import { useMergeSessions } from "@/lib/hooks/use-merge-sessions";
import { Button } from "@/components/ui/button";
import { MergeEmptyState } from "./merge-empty-state";
import { MergeSessionCard } from "./merge-session-card";

export function MergeList() {
  const { data, isLoading, error } = useMergeSessions();

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading merges…</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Merge Reflections</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Synthesize independent AI perspectives into one understanding.
          </p>
        </div>
        <Button asChild>
          <Link href="/merges/new">New Merge</Link>
        </Button>
      </div>

      {data.length === 0 ? (
        <MergeEmptyState
          title="No merges yet"
          description="Combine reflected runs and pasted AI outputs from different tools into one synthesized reflection."
          action={
            <Button asChild>
              <Link href="/merges/new">Create your first merge</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {data.map((session) => (
            <MergeSessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}
