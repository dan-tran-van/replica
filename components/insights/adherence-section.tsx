import type { AdherenceSummary } from "@/lib/insights/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatBar } from "./stat-bar";
import { MiniTrend } from "./mini-trend";

interface AdherenceSectionProps {
  adherence: AdherenceSummary;
}

export function AdherenceSection({ adherence }: AdherenceSectionProps) {
  const { totalApplicable, percentages, trend, hasEnoughTrendData } = adherence;

  if (totalApplicable === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommendation adherence</CardTitle>
          <CardDescription>
            Whether you followed Replica&apos;s prior recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Log a second run to start tracking adherence.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommendation adherence</CardTitle>
        <CardDescription>
          When Replica suggested a next step, did you follow it?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {totalApplicable < 3 ? (
          <p className="text-xs text-muted-foreground">
            Based on {totalApplicable} applicable run
            {totalApplicable === 1 ? "" : "s"} — percentages may shift.
          </p>
        ) : null}

        <StatBar
          total={totalApplicable}
          segments={[
            {
              label: "Followed",
              value: adherence.yes,
              colorClass: "bg-primary",
            },
            {
              label: "Partially",
              value: adherence.partially,
              colorClass: "bg-primary/50",
            },
            {
              label: "Not followed",
              value: adherence.no,
              colorClass: "bg-muted-foreground/40",
            },
          ]}
        />

        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-2xl font-semibold">{percentages.yes}%</p>
            <p className="text-xs text-muted-foreground">Followed</p>
          </div>
          <div>
            <p className="text-2xl font-semibold">{percentages.partially}%</p>
            <p className="text-xs text-muted-foreground">Partially</p>
          </div>
          <div>
            <p className="text-2xl font-semibold">{percentages.no}%</p>
            <p className="text-xs text-muted-foreground">Not followed</p>
          </div>
        </div>

        {hasEnoughTrendData ? (
          <div>
            <p className="mb-2 text-sm font-medium">Trend over time</p>
            <MiniTrend
              points={trend.map((t) => ({
                period: t.period,
                value:
                  t.total > 0 ? Math.round((t.yes / t.total) * 100) : 0,
                total: t.total,
              }))}
              valueLabel="followed"
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
