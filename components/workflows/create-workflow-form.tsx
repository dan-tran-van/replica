"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRepositories } from "@/components/providers/repository-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function CreateWorkflowForm({ onCreated }: { onCreated?: () => void }) {
  const router = useRouter();
  const { workflows } = useRepositories();
  const [name, setName] = useState("");
  const [starterPrompt, setStarterPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !starterPrompt.trim()) {
      setError("Name and starter prompt are required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const workflow = await workflows.create({
        name: name.trim(),
        starterPrompt,
      });
      onCreated?.();
      router.push(`/workflows/${workflow.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create workflow");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="workflow-name">Workflow name</Label>
        <Input
          id="workflow-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Weekly research digest"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="starter-prompt">Starter prompt</Label>
        <p className="text-xs text-muted-foreground">
          Copy this into Manus Scheduled for your first run.
        </p>
        <Textarea
          id="starter-prompt"
          value={starterPrompt}
          onChange={(e) => setStarterPrompt(e.target.value)}
          rows={8}
          placeholder="Enter the prompt you'll run in Manus..."
          className="font-mono"
        />
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating…" : "Create workflow"}
      </Button>
    </form>
  );
}
