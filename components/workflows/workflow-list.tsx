"use client";

import { useState } from "react";
import { WorkflowCard } from "./workflow-card";
import { CreateWorkflowForm } from "./create-workflow-form";
import { EmptyState } from "@/components/shared/empty-state";
import { useWorkflows } from "@/lib/hooks/use-workflows";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function WorkflowList() {
  const { data, isLoading, error, refetch } = useWorkflows();
  const [showCreate, setShowCreate] = useState(false);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading workflows…</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Workflows</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Improve recurring AI workflows through reflection—including Manus
            Scheduled Tasks and any external agent you run on a schedule.
          </p>
        </div>
        {data.length > 0 ? (
          <Button
            type="button"
            variant={showCreate ? "outline" : "default"}
            onClick={() => setShowCreate((v) => !v)}
          >
            {showCreate ? "Cancel" : "New workflow"}
          </Button>
        ) : null}
      </div>

      {showCreate || data.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Create a workflow</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateWorkflowForm
              onCreated={() => {
                setShowCreate(false);
                void refetch();
              }}
            />
          </CardContent>
        </Card>
      ) : null}

      {data.length === 0 && !showCreate ? (
        <EmptyState
          title="No workflows yet"
          description="Create a workflow with your starter prompt, run it in Manus, then come back to log the results."
          action={
            <Button type="button" onClick={() => setShowCreate(true)}>
              Create your first workflow
            </Button>
          }
        />
      ) : null}

      {data.length > 0 ? (
        <ul className="space-y-3">
          {data.map((workflow) => (
            <li key={workflow.id}>
              <WorkflowCard workflow={workflow} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
