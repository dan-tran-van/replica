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
      "Workflows, coding sessions, merges, settings, and iterations stay in your browser.",
    badge: "Privacy",
  },
  {
    title: "IndexedDB storage",
    description:
      "Structured local stores persist your history per deployment origin without cloud sync.",
    badge: "Storage",
  },
  {
    title: "BYOK AI assistance",
    description:
      "Your OpenAI key lives in browser storage and powers optional prompt, reflection, and merge assistance.",
    badge: "AI",
  },
  {
    title: "Copy-only control",
    description:
      "Replica proposes prompts and strategies, but you decide what to run in your external tool.",
    badge: "Control",
  },
  {
    title: "Self-hosted on Vercel",
    description:
      "Deploy it like a normal Next.js app without adding hosted databases, queues, or auth services.",
    badge: "Hosting",
  },
  {
    title: "No cloud sync",
    description:
      "Each deployment origin has isolated local storage; data does not migrate between hosts automatically.",
    badge: "Boundary",
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
          Cross-cutting guarantees that keep the reflection loop local and
          controlled.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              size="sm"
              className="replica-card-lift replica-fade-up"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                  <Badge
                    variant="secondary"
                    className="transition-colors group-hover/card:bg-primary group-hover/card:text-primary-foreground"
                  >
                    {feature.badge}
                  </Badge>
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
