"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import type {
  CodingAttempt,
  CodingAttemptOutcome,
  CodingAttemptStatus,
  CodingSession,
  CreateCodingAttemptInput,
} from "@/lib/domain/coding-types";
import {
  CODING_ATTEMPT_STATUSES,
} from "@/lib/domain/coding-types";
import { generateCodingReflection } from "@/lib/ai/generate-coding-reflection";
import { useRepositories } from "@/components/providers/repository-provider";
import { useSettings } from "@/lib/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CopyButton } from "@/components/shared/copy-button";
import {
  CODING_ATTEMPT_STATUS_LABELS,
  CODING_MODE_LABELS,
  CODING_OUTCOME_LABELS,
  CODING_SESSION_STATUS_LABELS,
} from "./coding-labels";

interface CodingSessionViewProps {
  session: CodingSession;
  onUpdated: () => void;
}

type AttemptFormState = CreateCodingAttemptInput;

const EMPTY_FORM: AttemptFormState = {
  toolUsed: "",
  originalPrompt: "",
  aiOutput: "",
  errorOutput: "",
  developerNotes: "",
  resultSummary: "",
  status: "needsImprovement",
};

const OUTCOME_OPTIONS: CodingAttemptOutcome[] = [
  "notRun",
  "helpful",
  "partiallyHelpful",
  "fixed",
  "notHelpful",
  "madeWorse",
];

export function CodingSessionView({
  session,
  onUpdated,
}: CodingSessionViewProps) {
  const repos = useRepositories();
  const { settings, hasApiKey } = useSettings();
  const formRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<AttemptFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [generatingAttemptId, setGeneratingAttemptId] = useState<string | null>(
    null,
  );
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [truncatedAttemptId, setTruncatedAttemptId] = useState<string | null>(
    null,
  );

  function updateForm<K extends keyof AttemptFormState>(
    key: K,
    value: AttemptFormState[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function hasSupportingContext(input: AttemptFormState): boolean {
    return Boolean(
      input.aiOutput.trim() ||
        input.errorOutput.trim() ||
        input.developerNotes.trim() ||
        input.resultSummary.trim(),
    );
  }

  async function handleAddAttempt(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!form.originalPrompt.trim()) {
      setFormError("Original prompt is required.");
      return;
    }
    if (!hasSupportingContext(form)) {
      setFormError(
        "Add AI output, error output, developer notes, or a result summary before saving.",
      );
      return;
    }

    setIsSaving(true);
    try {
      await repos.codingSessions.addAttempt(session.id, form);
      setForm(EMPTY_FORM);
      onUpdated();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to save coding attempt",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleGenerate(attempt: CodingAttempt) {
    if (!settings || !hasApiKey) return;

    setGenerationError(null);
    setGeneratingAttemptId(attempt.id);
    setTruncatedAttemptId(null);

    try {
      const { reflection, wasTruncated } = await generateCodingReflection(
        session,
        attempt,
        settings,
      );
      await repos.codingSessions.updateAttemptReflection(
        session.id,
        attempt.id,
        reflection,
      );
      if (wasTruncated) {
        setTruncatedAttemptId(attempt.id);
      }
      onUpdated();
    } catch (err) {
      setGenerationError(
        err instanceof Error ? err.message : "Failed to generate reflection",
      );
    } finally {
      setGeneratingAttemptId(null);
    }
  }

  function prefillNextAttempt(attempt: CodingAttempt) {
    const reflection = attempt.generatedReflection;
    if (!reflection || reflection.status !== "completed") return;

    setForm({
      toolUsed: attempt.toolUsed,
      originalPrompt: reflection.betterNextPrompt,
      aiOutput: "",
      errorOutput: "",
      developerNotes: "",
      resultSummary: "",
      status: "needsImprovement",
      basedOnAttemptId: attempt.id,
      recommendedMode: reflection.recommendedMode,
    });
    setFormError(null);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="space-y-8">
      <div>
        <Button variant="link" className="h-auto p-0" asChild>
          <Link href="/coding">← Coding</Link>
        </Button>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold">{session.title}</h1>
          <Badge
            variant={session.status === "resolved" ? "default" : "secondary"}
          >
            {CODING_SESSION_STATUS_LABELS[session.status]}
          </Badge>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {session.taskDescription}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {session.attempts.length} attempt
          {session.attempts.length === 1 ? "" : "s"} ·{" "}
          {new Date(session.updatedAt).toLocaleString()}
        </p>
      </div>

      <Alert>
        <AlertDescription>
          Replica does not replace your coding tool. It helps your next attempt
          start smarter.
        </AlertDescription>
      </Alert>

      <div ref={formRef}>
        <Card>
          <CardHeader>
            <CardTitle>Add attempt</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => void handleAddAttempt(e)} className="space-y-5">
              {form.basedOnAttemptId ? (
                <Alert>
                  <AlertDescription>
                    Prefilled from a generated next prompt. It will be saved
                    only after you submit this form.
                  </AlertDescription>
                </Alert>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="coding-tool">Tool used</Label>
                  <Input
                    id="coding-tool"
                    value={form.toolUsed}
                    onChange={(e) => updateForm("toolUsed", e.target.value)}
                    placeholder="e.g. external AI coding tool"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coding-status">Attempt status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(value) =>
                      updateForm("status", value as CodingAttemptStatus)
                    }
                  >
                    <SelectTrigger id="coding-status" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CODING_ATTEMPT_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {CODING_ATTEMPT_STATUS_LABELS[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {form.recommendedMode ? (
                <div className="space-y-2">
                  <Label>Suggested mode for this run</Label>
                  <Badge variant="secondary">
                    {CODING_MODE_LABELS[form.recommendedMode]}
                  </Badge>
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="coding-prompt">Original prompt</Label>
                <Textarea
                  id="coding-prompt"
                  value={form.originalPrompt}
                  onChange={(e) =>
                    updateForm("originalPrompt", e.target.value)
                  }
                  rows={7}
                  placeholder="Paste the prompt you gave the external coding tool."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coding-output">AI output</Label>
                <Textarea
                  id="coding-output"
                  value={form.aiOutput}
                  onChange={(e) => updateForm("aiOutput", e.target.value)}
                  rows={5}
                  placeholder="Paste the useful or messy output from the attempt."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coding-errors">Error output</Label>
                <Textarea
                  id="coding-errors"
                  value={form.errorOutput}
                  onChange={(e) => updateForm("errorOutput", e.target.value)}
                  rows={4}
                  placeholder="Paste terminal errors, failing checks, browser errors, or stack traces."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="coding-notes">Developer notes</Label>
                  <Textarea
                    id="coding-notes"
                    value={form.developerNotes}
                    onChange={(e) =>
                      updateForm("developerNotes", e.target.value)
                    }
                    rows={4}
                    placeholder="What did you notice? What context was missing?"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coding-summary">Result summary</Label>
                  <Textarea
                    id="coding-summary"
                    value={form.resultSummary}
                    onChange={(e) =>
                      updateForm("resultSummary", e.target.value)
                    }
                    rows={4}
                    placeholder="Briefly summarize what happened."
                  />
                </div>
              </div>

              {formError ? (
                <Alert variant="destructive">
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              ) : null}

              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving…" : "Save attempt"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold">Attempt history</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate reflections manually after saving an attempt.
          </p>
        </div>

        {!hasApiKey ? (
          <Alert>
            <AlertTitle>OpenAI API key required for reflection</AlertTitle>
            <AlertDescription>
              Add your key in{" "}
              <Link href="/settings" className="underline">
                Settings
              </Link>{" "}
              before generating a better next prompt.
            </AlertDescription>
          </Alert>
        ) : null}

        {generationError ? (
          <Alert variant="destructive">
            <AlertDescription>{generationError}</AlertDescription>
          </Alert>
        ) : null}

        {session.attempts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No attempts yet. Save one above to start reflecting.
          </p>
        ) : (
          <div className="space-y-4">
            {[...session.attempts].reverse().map((attempt, reverseIndex) => (
              <AttemptCard
                key={attempt.id}
                sessionId={session.id}
                attempt={attempt}
                attemptNumber={session.attempts.length - reverseIndex}
                canGenerate={hasApiKey}
                isGenerating={generatingAttemptId === attempt.id}
                wasTruncated={truncatedAttemptId === attempt.id}
                onGenerate={() => void handleGenerate(attempt)}
                onUseAsNextAttempt={() => prefillNextAttempt(attempt)}
                onUpdated={onUpdated}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface AttemptCardProps {
  sessionId: string;
  attempt: CodingAttempt;
  attemptNumber: number;
  canGenerate: boolean;
  isGenerating: boolean;
  wasTruncated: boolean;
  onGenerate: () => void;
  onUseAsNextAttempt: () => void;
  onUpdated: () => void;
}

function AttemptCard({
  sessionId,
  attempt,
  attemptNumber,
  canGenerate,
  isGenerating,
  wasTruncated,
  onGenerate,
  onUseAsNextAttempt,
  onUpdated,
}: AttemptCardProps) {
  const reflection = attempt.generatedReflection;

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2">
          Attempt {attemptNumber}
          <Badge variant="outline">
            {CODING_ATTEMPT_STATUS_LABELS[attempt.status]}
          </Badge>
          {attempt.recommendedMode ? (
            <Badge variant="secondary">
              {CODING_MODE_LABELS[attempt.recommendedMode]}
            </Badge>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {attempt.toolUsed || "Tool not specified"} ·{" "}
            {new Date(attempt.createdAt).toLocaleString()}
          </p>
          {attempt.basedOnAttemptId ? (
            <p className="text-xs text-muted-foreground">
              Based on a generated prompt from an earlier attempt.
            </p>
          ) : null}
          <pre className="overflow-x-auto rounded-lg bg-muted p-3 font-mono text-xs whitespace-pre-wrap">
            {attempt.originalPrompt}
          </pre>
        </div>

        {reflection?.status === "failed" ? (
          <Alert variant="destructive">
            <AlertTitle>Reflection failed</AlertTitle>
            <AlertDescription>
              {reflection.errorMessage ?? "An unknown error occurred."}
            </AlertDescription>
          </Alert>
        ) : null}

        {reflection?.status === "completed" ? (
          <ReflectionView
            attempt={attempt}
            onUseAsNextAttempt={onUseAsNextAttempt}
          />
        ) : (
          <Button
            type="button"
            onClick={onGenerate}
            disabled={!canGenerate || isGenerating}
          >
            {isGenerating ? "Generating…" : "Generate better next prompt"}
          </Button>
        )}

        {wasTruncated ? (
          <Alert>
            <AlertDescription>
              Some attempt history was truncated due to length limits.
            </AlertDescription>
          </Alert>
        ) : null}

        <AttemptFeedback
          sessionId={sessionId}
          attempt={attempt}
          onUpdated={onUpdated}
        />
      </CardContent>
    </Card>
  );
}

function ReflectionView({
  attempt,
  onUseAsNextAttempt,
}: {
  attempt: CodingAttempt;
  onUseAsNextAttempt: () => void;
}) {
  const reflection = attempt.generatedReflection;
  if (!reflection || reflection.status !== "completed") return null;

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="space-y-2">
        <Badge variant="secondary">
          Recommended next run mode:{" "}
          {CODING_MODE_LABELS[reflection.recommendedMode]}
        </Badge>
        <p className="text-sm text-muted-foreground">
          {reflection.recommendedModeRationale}
        </p>
      </div>

      <ReflectionText title="Summary" text={reflection.summary} />
      <ReflectionList title="What went wrong" items={reflection.whatWentWrong} />
      <ReflectionList title="Missing context" items={reflection.missingContext} />

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-medium">Better next prompt</h3>
          <CopyButton
            text={reflection.betterNextPrompt}
            label="Copy prompt"
          />
        </div>
        <pre className="overflow-x-auto rounded-lg bg-muted p-3 font-mono text-xs whitespace-pre-wrap">
          {reflection.betterNextPrompt}
        </pre>
        <Button type="button" variant="outline" onClick={onUseAsNextAttempt}>
          Use this as next attempt
        </Button>
      </div>

      <ReflectionList title="Next actions" items={reflection.nextActions} />
      <ReflectionList title="Retry checklist" items={reflection.retryChecklist} />
      <ReflectionText
        title="Why this may reduce token waste"
        text={reflection.tokenWasteReductionReason}
      />
    </div>
  );
}

function ReflectionText({ title, text }: { title: string; text: string }) {
  if (!text) return null;
  return (
    <div className="space-y-1">
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function ReflectionList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-1">
      <h3 className="text-sm font-medium">{title}</h3>
      <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function AttemptFeedback({
  sessionId,
  attempt,
  onUpdated,
}: {
  sessionId: string;
  attempt: CodingAttempt;
  onUpdated: () => void;
}) {
  const repos = useRepositories();
  const [outcome, setOutcome] = useState<CodingAttemptOutcome>(
    attempt.outcome === "unknown" ? "notRun" : attempt.outcome,
  );
  const [outcomeNotes, setOutcomeNotes] = useState(attempt.outcomeNotes);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setIsSaving(true);
    setSaved(false);
    setError(null);
    try {
      await repos.codingSessions.updateAttemptOutcome(sessionId, attempt.id, {
        outcome,
        outcomeNotes,
      });
      setSaved(true);
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save feedback");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-3 border-t pt-4">
      <div className="space-y-2">
        <Label>After running this suggested prompt, what happened?</Label>
        <Select
          value={outcome}
          onValueChange={(value) => {
            setOutcome(value as CodingAttemptOutcome);
            setSaved(false);
          }}
        >
          <SelectTrigger className="w-full sm:w-72">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {OUTCOME_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {CODING_OUTCOME_LABELS[option]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`outcome-notes-${attempt.id}`}>Notes after running</Label>
        <Textarea
          id={`outcome-notes-${attempt.id}`}
          value={outcomeNotes}
          onChange={(e) => {
            setOutcomeNotes(e.target.value);
            setSaved(false);
          }}
          rows={3}
          placeholder="What changed after running the suggested prompt externally?"
        />
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void handleSave()}
          disabled={isSaving}
        >
          {isSaving ? "Saving…" : "Save feedback"}
        </Button>
        {saved ? <span className="text-sm text-primary">Saved</span> : null}
      </div>
    </div>
  );
}
