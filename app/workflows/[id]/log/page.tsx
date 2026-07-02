"use client";

import { use } from "react";
import Link from "next/link";
import { useWorkflow } from "@/lib/hooks/use-workflow";
import { useIterations } from "@/lib/hooks/use-iterations";
import { LogIterationForm } from "@/components/iterations/log-iteration-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LogIterationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: workflow, isLoading, error } = useWorkflow(id);
  const { data: iterations, isLoading: iterationsLoading } = useIterations(id);

  if (isLoading || iterationsLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (error || !workflow) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">
          {error ?? "Workflow not found"}
        </p>
        <Button variant="link" asChild className="h-auto p-0">
          <Link href="/">Back to workflows</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="link" asChild className="h-auto p-0 text-muted-foreground">
          <Link href={`/workflows/${workflow.id}`}>← {workflow.name}</Link>
        </Button>
        <h1 className="mt-2 text-xl font-semibold">Log a run</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste your Manus output and reflect on the result. Replica will
          propose an improved prompt.
        </p>
      </div>

      <Card>
        <CardContent>
          <LogIterationForm workflow={workflow} iterations={iterations} />
        </CardContent>
      </Card>
    </div>
  );
}
