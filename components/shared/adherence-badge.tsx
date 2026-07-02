import type { RecommendationAdherence } from "@/lib/domain/types";
import { Badge } from "@/components/ui/badge";

const labels: Record<Exclude<RecommendationAdherence, "not_applicable">, string> = {
  yes: "Followed recommendation",
  partially: "Partially followed",
  no: "Did not follow",
};

const variants: Record<
  Exclude<RecommendationAdherence, "not_applicable">,
  "default" | "secondary" | "destructive"
> = {
  yes: "default",
  partially: "secondary",
  no: "destructive",
};

export function AdherenceBadge({
  adherence,
}: {
  adherence: RecommendationAdherence;
}) {
  if (adherence === "not_applicable") return null;

  return (
    <Badge variant={variants[adherence]}>{labels[adherence]}</Badge>
  );
}

export function adherenceLabel(
  adherence: RecommendationAdherence,
): string | null {
  if (adherence === "not_applicable") return null;
  return labels[adherence];
}
