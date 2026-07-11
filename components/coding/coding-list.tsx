"use client";

import Link from "next/link";
import { useCodingSessions } from "@/lib/hooks/use-coding-sessions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { CODING_SESSION_STATUS_LABELS } from "./coding-labels";

export function CodingList() {
  const { data, isLoading, error } = useCodingSessions();

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading coding…</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">
            Reduce wasted AI coding tokens
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate a first prompt for a new coding task, or improve a failed
            coding attempt.
          </p>
        </div>
        <Button asChild>
          <Link href="/coding/new">New session</Link>
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Replica helps your next external AI coding run start smarter.
      </p>

      {data.length === 0 ? (
        <EmptyState
          title="No coding sessions yet"
          description="Describe a new coding task to generate a first prompt, or paste a messy external attempt and generate a sharper next prompt."
          action={
            <Button asChild>
              <Link href="/coding/new">Create your first session</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {data.map((session) => (
            <Card key={session.id} size="sm">
              <CardHeader>
                <CardTitle>{session.title}</CardTitle>
                <CardDescription>
                  {session.taskDescription || "No task description"}
                </CardDescription>
                <CardAction>
                  <Badge
                    variant={
                      session.status === "resolved" ? "default" : "secondary"
                    }
                  >
                    {CODING_SESSION_STATUS_LABELS[session.status]}
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  {session.attempts.length} attempt
                  {session.attempts.length === 1 ? "" : "s"} ·{" "}
                  {new Date(session.updatedAt).toLocaleString()}
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/coding/${session.id}`}>Open</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
