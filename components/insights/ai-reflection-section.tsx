"use client";

import Link from "next/link";
import type { InsightsReport } from "@/lib/insights/types";
import type { InsightsReflection } from "@/lib/ai/insights-reflection-schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AiReflectionSectionProps {
  report: InsightsReport;
  reflection: InsightsReflection | null;
  isGenerating: boolean;
  error: string | null;
  onGenerate: () => void;
  hasApiKey: boolean;
}

export function AiReflectionSection({
  report,
  reflection,
  isGenerating,
  error,
  onGenerate,
  hasApiKey,
}: AiReflectionSectionProps) {
  const canGenerate =
    hasApiKey &&
    (report.hasApplicableAdherence || report.dataset.iterations.length >= 5);

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <CardTitle>AI reflection</CardTitle>
        <CardDescription>
          A concise meta-reflection on how you use Replica — generated on
          demand.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasApiKey ? (
          <Alert>
            <AlertDescription>
              Add your OpenAI API key in{" "}
              <Link href="/settings" className="underline">
                Settings
              </Link>{" "}
              to generate a reflection.
            </AlertDescription>
          </Alert>
        ) : !canGenerate ? (
          <p className="text-sm text-muted-foreground">
            Log a few more runs (or adherence answers) before generating a
            reflection.
          </p>
        ) : (
          <Button onClick={onGenerate} disabled={isGenerating}>
            {isGenerating ? "Generating…" : "Generate reflection"}
          </Button>
        )}

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {reflection ? (
          <div className="space-y-5 pt-2">
            <ReflectionList title="Patterns I see" items={reflection.patterns} />
            <ReflectionList
              title="What slows me down"
              items={reflection.habitsThatSlow}
            />
            <ReflectionList
              title="What helps"
              items={reflection.habitsThatHelp}
            />
            <ReflectionList
              title="How to use Replica differently"
              items={reflection.replicaUsageChanges}
            />
            <div>
              <p className="text-sm font-medium text-primary">
                Highest leverage improvement
              </p>
              <p className="mt-1 text-sm">{reflection.highestLeverageImprovement}</p>
            </div>
            <ReflectionList
              title="Learning highlights"
              items={reflection.timelineHighlights}
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ReflectionList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div>
      <p className="text-sm font-medium">{title}</p>
      <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
