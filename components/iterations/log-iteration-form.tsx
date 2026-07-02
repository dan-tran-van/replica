"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type {
  Iteration,
  Outcome,
  RecommendationAdherence,
  Workflow,
} from "@/lib/domain/types";
import {
  getDefaultPromptUsed,
  getNextSequenceNumber,
  getPriorRecommendation,
  requiresAdherenceQuestion,
} from "@/lib/domain/derive";
import { analyzeIteration } from "@/lib/ai/analyze-iteration";
import { useRepositories } from "@/components/providers/repository-provider";
import { useSettings } from "@/lib/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type FormStatus = "idle" | "saving" | "analyzing" | "done" | "error";

interface LogIterationFormProps {
  workflow: Workflow;
  iterations: Iteration[];
}

function LogIterationFormFields({
  workflow,
  iterations,
}: LogIterationFormProps) {
  const router = useRouter();
  const { workflows, iterations: iterationRepo } = useRepositories();
  const { settings, hasApiKey } = useSettings();

  const priorRecommendation = getPriorRecommendation(iterations);
  const showAdherenceQuestion = requiresAdherenceQuestion(iterations);

  const defaultPromptUsed = getDefaultPromptUsed(workflow, iterations);
  const [promptUsed, setPromptUsed] = useState(defaultPromptUsed);
  const [manusOutput, setManusOutput] = useState("");
  const [outcome, setOutcome] = useState<Outcome>("partial");
  const [observations, setObservations] = useState("");
  const [adherence, setAdherence] = useState<RecommendationAdherence | "">("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!promptUsed.trim() || !manusOutput.trim()) {
      setError("Prompt used and Manus output are required.");
      return;
    }

    if (showAdherenceQuestion && !adherence) {
      setError("Please indicate whether you followed the prior recommendation.");
      return;
    }

    if (!hasApiKey) {
      setError("Add your OpenAI API key in Settings before logging a run.");
      return;
    }

    if (!settings) return;

    const followedPriorRecommendation: RecommendationAdherence =
      showAdherenceQuestion
        ? (adherence as RecommendationAdherence)
        : "not_applicable";

    setStatus("saving");
    setError(null);

    try {
      const sequenceNumber = getNextSequenceNumber(iterations);
      const iteration = await iterationRepo.create(
        {
          workflowId: workflow.id,
          promptUsed,
          manusOutput,
          outcome,
          observations,
          followedPriorRecommendation,
        },
        sequenceNumber,
      );

      await workflows.touch(workflow.id);

      setStatus("analyzing");

      const result = await analyzeIteration(
        workflow,
        iterations,
        iteration,
        settings,
      );

      await iterationRepo.updateAnalysis(iteration.id, result.analysis);
      setStatus("done");
      router.push(`/workflows/${workflow.id}`);
      router.refresh();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to save iteration");
    }
  }

  const isBusy = status === "saving" || status === "analyzing";

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
      {!hasApiKey ? (
        <Alert>
          <AlertTitle>API key required</AlertTitle>
          <AlertDescription>
            Add your OpenAI API key in{" "}
            <Link href="/settings" className="underline">
              Settings
            </Link>{" "}
            to analyze runs. Your key stays in this browser only.
          </AlertDescription>
        </Alert>
      ) : null}

      {showAdherenceQuestion && priorRecommendation ? (
        <Card>
          <CardHeader>
            <CardTitle>Did you follow the last recommendation?</CardTitle>
            <CardDescription>
              This helps Replica improve future recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <blockquote className="border-l-2 border-primary pl-3 text-sm text-muted-foreground">
              {priorRecommendation}
            </blockquote>
            <RadioGroup
              value={adherence}
              onValueChange={(value) =>
                setAdherence(value as RecommendationAdherence)
              }
              className="gap-3"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="yes" id="adherence-yes" />
                <Label htmlFor="adherence-yes">Yes</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="partially" id="adherence-partially" />
                <Label htmlFor="adherence-partially">Partially</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id="adherence-no" />
                <Label htmlFor="adherence-no">No</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="prompt-used">Prompt used in Manus</Label>
        <p className="text-xs text-muted-foreground">
          What you actually ran — may differ from Replica&apos;s last suggestion.
        </p>
        <Textarea
          id="prompt-used"
          value={promptUsed}
          onChange={(e) => setPromptUsed(e.target.value)}
          rows={6}
          className="font-mono"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="manus-output">Manus output</Label>
        <Textarea
          id="manus-output"
          value={manusOutput}
          onChange={(e) => setManusOutput(e.target.value)}
          rows={10}
          placeholder="Paste the output from Manus..."
          className="font-mono"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="outcome">Outcome</Label>
        <Select
          value={outcome}
          onValueChange={(value) => setOutcome(value as Outcome)}
        >
          <SelectTrigger id="outcome" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="success">
              Success — output met expectations
            </SelectItem>
            <SelectItem value="partial">
              Partial — useful but needs improvement
            </SelectItem>
            <SelectItem value="failure">
              Failure — did not work as intended
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="observations">Observations</Label>
        <p className="text-xs text-muted-foreground">
          What worked, what didn&apos;t, what to change next.
        </p>
        <Textarea
          id="observations"
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          rows={4}
          placeholder="e.g. Summary was too long, missed the key metric..."
        />
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {status === "analyzing" ? (
        <p className="text-sm text-muted-foreground">
          Analyzing run and proposing prompt improvements…
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isBusy}>
          {status === "saving"
            ? "Saving…"
            : status === "analyzing"
              ? "Analyzing…"
              : "Save & analyze"}
        </Button>
        <Button variant="ghost" asChild>
          <Link href={`/workflows/${workflow.id}`}>Cancel</Link>
        </Button>
      </div>
    </form>
  );
}

export function LogIterationForm({ workflow, iterations }: LogIterationFormProps) {
  const formKey = `${workflow.id}-${iterations.length}-${iterations.at(-1)?.id ?? "new"}`;

  return (
    <LogIterationFormFields
      key={formKey}
      workflow={workflow}
      iterations={iterations}
    />
  );
}
