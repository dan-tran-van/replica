import type { Outcome } from "@/lib/domain/types";

const styles: Record<Outcome, string> = {
  success:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  partial:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  failure: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

const labels: Record<Outcome, string> = {
  success: "Success",
  partial: "Partial",
  failure: "Failure",
};

export function OutcomeBadge({ outcome }: { outcome: Outcome }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[outcome]}`}
    >
      {labels[outcome]}
    </span>
  );
}
