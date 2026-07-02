"use client";

import Link from "next/link";
import { useInsights } from "@/lib/hooks/use-insights";
import { useInsightsReflection } from "@/lib/hooks/use-insights-reflection";
import { useSettings } from "@/lib/hooks/use-settings";
import { Button } from "@/components/ui/button";
import {
  EarlyDataNotice,
  InsightsEmptyState,
} from "./insights-empty-state";
import { TimelineSection } from "./timeline-section";
import { AiReflectionSection } from "./ai-reflection-section";
import { AdherenceSection } from "./adherence-section";
import { OutcomeSection } from "./outcome-section";
import { ThemeSection } from "./theme-section";
import { WorkflowHealthSection } from "./workflow-health-section";

export function InsightsPage() {
  const { report, summary, isLoading, error } = useInsights();
  const { reflection, generate, isGenerating, error: reflectionError } =
    useInsightsReflection();
  const { hasApiKey } = useSettings();

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading insights…</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  if (!report || !summary) {
    return null;
  }

  if (summary.workflowCount === 0) {
    return (
      <InsightsEmptyState
        title="No workflows yet"
        description="Create a workflow and log a few runs to start discovering patterns across your prompt improvement journey."
        action={
          <Button asChild>
            <Link href="/workflows">Create a workflow</Link>
          </Button>
        }
      />
    );
  }

  if (summary.iterationCount === 0) {
    return (
      <InsightsEmptyState
        title="No runs logged yet"
        description="Log your first run in a workflow, then come back to see cross-workflow patterns."
        action={
          <Button asChild>
            <Link href="/workflows">Go to workflows</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Insights</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Patterns across {summary.workflowCount} workflow
          {summary.workflowCount === 1 ? "" : "s"} and{" "}
          {summary.iterationCount} logged run
          {summary.iterationCount === 1 ? "" : "s"}.
        </p>
      </div>

      {summary.isEarlyData ? <EarlyDataNotice /> : null}

      <TimelineSection entries={report.timeline} />

      <AiReflectionSection
        report={report}
        reflection={reflection}
        isGenerating={isGenerating}
        error={reflectionError}
        onGenerate={() => void generate(report)}
        hasApiKey={hasApiKey}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <AdherenceSection adherence={report.adherence} />
        <OutcomeSection outcomes={report.outcomes} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ThemeSection
          title="Recommendation patterns"
          description="Recurring themes in what Replica suggests you do next."
          themes={report.recommendationThemes}
          emptyMessage="No recommendation themes detected yet."
        />
        <ThemeSection
          title="Reflection patterns"
          description="Recurring themes in your observations."
          themes={report.reflectionThemes}
          emptyMessage="Add observations when logging runs to surface patterns."
        />
      </div>

      <WorkflowHealthSection items={report.workflowHealth} />
    </div>
  );
}
