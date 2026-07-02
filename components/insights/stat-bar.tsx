interface StatBarSegment {
  label: string;
  value: number;
  colorClass: string;
}

interface StatBarProps {
  segments: StatBarSegment[];
  total: number;
}

export function StatBar({ segments, total }: StatBarProps) {
  if (total === 0) {
    return (
      <p className="text-sm text-muted-foreground">Not enough data yet.</p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex h-3 overflow-hidden rounded-full bg-muted">
        {segments.map((segment) => {
          const width = (segment.value / total) * 100;
          if (width === 0) return null;
          return (
            <div
              key={segment.label}
              className={segment.colorClass}
              style={{ width: `${width}%` }}
              title={`${segment.label}: ${segment.value}`}
            />
          );
        })}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
        {segments.map((segment) => (
          <li key={segment.label} className="flex items-center gap-1.5">
            <span
              className={`inline-block size-2 rounded-full ${segment.colorClass}`}
            />
            {segment.label}: {segment.value} (
            {Math.round((segment.value / total) * 100)}%)
          </li>
        ))}
      </ul>
    </div>
  );
}
