import type { Outcome } from "@/lib/domain/types";
import { Badge } from "@/components/ui/badge";

const variants: Record<Outcome, "default" | "secondary" | "destructive"> = {
  success: "default",
  partial: "secondary",
  failure: "destructive",
};

const labels: Record<Outcome, string> = {
  success: "Success",
  partial: "Partial",
  failure: "Failure",
};

export function OutcomeBadge({ outcome }: { outcome: Outcome }) {
  return <Badge variant={variants[outcome]}>{labels[outcome]}</Badge>;
}
