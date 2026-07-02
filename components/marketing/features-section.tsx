import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    title: "Local-first, browser-only",
    description:
      "All data stays in your browser. No backend, no cloud sync, no account required.",
    badge: "Privacy",
  },
  {
    title: "IndexedDB storage",
    description:
      "Workflows, iterations, and settings persist locally between sessions.",
    badge: "Storage",
  },
  {
    title: "Run logging",
    description:
      "Capture Manus output, outcomes, observations, and the prompt you used each time.",
    badge: "Core loop",
  },
  {
    title: "AI analysis (BYOK)",
    description:
      "OpenAI proposes improved prompts, reasoning, and next recommendations from your reflections.",
    badge: "AI",
  },
  {
    title: "Copy-only loop",
    description:
      "You decide what to run next. Replica never auto-updates your canonical prompt.",
    badge: "Control",
  },
  {
    title: "Full prompt history",
    description:
      "Every iteration stores the prompt used—complete history per workflow, not a version system.",
    badge: "History",
  },
  {
    title: "Recommendation adherence",
    description:
      "Track whether you followed prior recommendations—yes, partially, no, or not applicable.",
    badge: "Insights",
  },
  {
    title: "Cross-workflow Insights",
    description:
      "Themes, timeline, workflow health, and optional AI-generated personal reflection.",
    badge: "Analytics",
  },
];

export function FeaturesSection() {
  return (
    <section className="border-t py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-2xl font-semibold tracking-tight">
          Features
        </h2>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Built for recurring workflows you run outside Replica.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {features.map((feature) => (
            <Card key={feature.title} size="sm">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                  <Badge variant="secondary">{feature.badge}</Badge>
                </div>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
