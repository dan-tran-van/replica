import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const modes = [
  {
    title: "Coding",
    badge: "Retry loop",
    eyebrow: "Remember failed attempts",
    description:
      "Reduce wasted AI coding tokens by turning messy attempts into sharper next prompts.",
    href: "/coding",
    cta: "Open Coding",
    points: [
      "Generate a first prompt for a task",
      "Reflect on failed external coding attempts",
      "Copy retry checklists and better next prompts",
    ],
  },
  {
    title: "Merge",
    badge: "Synthesis",
    eyebrow: "Reflect across sources",
    description:
      "Combine independent AI perspectives into one clearer understanding.",
    href: "/merges",
    cta: "Open Merges",
    points: [
      "Merge reflected runs and pasted outputs",
      "Surface shared patterns and conflicts",
      "Turn missing information into strategy",
    ],
  },
  {
    title: "Insight",
    badge: "Patterns",
    eyebrow: "Improve from history",
    description:
      "See what your workflow history is teaching you across repeated runs.",
    href: "/insights",
    cta: "Open Insights",
    points: [
      "Review timeline, outcomes, and adherence",
      "Find recommendation and reflection themes",
      "Track workflow health over time",
    ],
  },
];

export function ModesSection() {
  return (
    <section className="border-t py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            Three ways to improve the next run
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Coding, Merge, and Insight are distinct surfaces for the same local
            reflection loop.
          </p>
        </div>

        <div className="mt-10 space-y-4">
          {modes.map((mode, index) => (
            <section
              key={mode.title}
              aria-labelledby={`${mode.title.toLowerCase()}-mode-title`}
              className="rounded-2xl border bg-card p-5 text-card-foreground transition-colors hover:bg-muted/30 sm:p-6"
            >
              <div className="grid gap-5 md:grid-cols-[0.85fr_1.15fr] md:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{mode.badge}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {mode.eyebrow}
                    </span>
                  </div>
                  <h3
                    id={`${mode.title.toLowerCase()}-mode-title`}
                    className="mt-3 text-xl font-semibold tracking-tight"
                  >
                    {index + 1}. {mode.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {mode.description}
                  </p>
                  <Button variant="outline" size="sm" className="mt-4" asChild>
                    <Link href={mode.href}>{mode.cta}</Link>
                  </Button>
                </div>

                <ul className="space-y-2 text-sm text-muted-foreground">
                  {mode.points.map((point) => (
                    <li key={point} className="flex gap-2">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
