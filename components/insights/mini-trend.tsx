interface MiniTrendPoint {
  period: string;
  value: number;
  total: number;
}

interface MiniTrendProps {
  points: MiniTrendPoint[];
  valueLabel?: string;
}

export function MiniTrend({ points, valueLabel = "value" }: MiniTrendProps) {
  if (points.length < 2) {
    return (
      <p className="text-sm text-muted-foreground">
        Not enough weeks of data for a trend yet.
      </p>
    );
  }

  const maxValue = Math.max(...points.map((p) => p.value), 1);

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-1.5 h-16">
        {points.map((point) => {
          const height = Math.max((point.value / maxValue) * 100, 8);
          return (
            <div
              key={point.period}
              className="flex flex-1 flex-col items-center gap-1"
            >
              <div
                className="w-full rounded-t-sm bg-primary/70 transition-all"
                style={{ height: `${height}%` }}
                title={`${point.period}: ${point.value}% ${valueLabel} (${point.total} runs)`}
              />
              <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                {point.period.slice(-3)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
