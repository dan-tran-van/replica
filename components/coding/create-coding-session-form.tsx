"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRepositories } from "@/components/providers/repository-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function CreateCodingSessionForm() {
  const router = useRouter();
  const { codingSessions } = useRepositories();
  const [title, setTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!taskDescription.trim()) {
      setError("Task description is required.");
      return;
    }

    setIsSaving(true);
    try {
      const session = await codingSessions.create({
        title,
        taskDescription,
      });
      router.push(`/coding/${session.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create coding session",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
      <div>
        <Button variant="link" className="h-auto p-0" asChild>
          <Link href="/coding">← Coding</Link>
        </Button>
        <h1 className="mt-2 text-xl font-semibold">New Coding Session</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Turn failed attempts into better next prompts.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="coding-title">Title</Label>
        <Input
          id="coding-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Fix checkout webhook failure"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="coding-task">Task description</Label>
        <Textarea
          id="coding-task"
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          rows={5}
          placeholder="What were you trying to get the coding tool to accomplish?"
          required
        />
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving…" : "Create session"}
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/coding">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
