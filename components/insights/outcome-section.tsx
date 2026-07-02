import type { OutcomeSummary } from "@/lib/insights/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatBar } from "./stat-bar";
import { MiniTrend } from "./mini-trend";

interface OutcomeSectionProps {
  outcomes: OutcomeSummary;
}

const adherenceLabels = {
  yes: "When followed",
  partially: "When partially followed",
  no: "When not followed",
} as const;

export function OutcomeSection({ outcomes }: OutcomeSectionProps) {
  const { total, counts, percentages, outcomeByAdherence, weeklySuccessTrend } =
    outcomes;

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Outcome trends</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No runs logged yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Outcome trends</CardTitle>
        <CardDescription>
          How your runs turned out — and whether following recommendations
          helps.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <StatBar
          total={total}
          segments={[
            {
              label: "Success",
              value: counts.success,
              colorClass: "bg-primary",
            },
            {
              label: "Partial",
              value: counts.partial,
              colorClass: "bg-primary/50",
            },
            {
              label: "Failure",
              value: counts.failure,
              colorClass: "bg-muted-foreground/40",
            },
          ]}
        />

        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-2xl font-semibold">{percentages.success}%</p>
            <p className="text-xs text-muted-foreground">Success</p>
          </div>
          <div>
            <p className="text-2xl font-semibold">{percentages.partial}%</p>
            <p className="text-xs text-muted-foreground">Partial</p>
          </div>
          <div>
            <p className="text-2xl font-semibold">{percentages.failure}%</p>
            <p className="text-xs text-muted-foreground">Failure</p>
          </div>
        </div>

        {outcomeByAdherence.some((o) => o.total > 0) ? (
          <div className="space-y-3">
            <p className="text-sm font-medium">Success rate by adherence</p>
            <ul className="space-y-2">
              {outcomeByAdherence
                .filter((o) => o.total > 0)
                .map((o) => (
                  <li
                    key={o.adherence}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">
                      {adherenceLabels[o.adherence]}
                    </span>
                    <span className="font-medium">
                      {o.successRate}% success ({o.total} runs)
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        ) : null}

        {weeklySuccessTrend.length >= 2 ? (
          <div>
            <p className="mb-2 text-sm font-medium">Weekly success rate</p>
            <MiniTrend
              points={weeklySuccessTrend.map((t) => ({
                period: t.period,
                value: t.successRate,
                total: t.total,
              }))}
              valueLabel="success"
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
