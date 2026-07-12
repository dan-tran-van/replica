import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const modes = [
  {
    title: "Coding",
    badge: "Retry loop",
    loopWord: "Remember",
    eyebrow: "Remember failed attempts",
    detailLabel: "External coding run",
    description:
      "Reduce wasted AI coding tokens by turning messy attempts into sharper next prompts.",
    summary:
      "Replica keeps the prompt, output, notes, and outcome together so the next coding attempt starts with context instead of guesswork.",
    localNote: "Saved locally with the rest of your coding session history.",
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
    loopWord: "Reflect",
    eyebrow: "Reflect across sources",
    detailLabel: "Independent perspectives",
    description:
      "Combine independent AI perspectives into one clearer understanding.",
    summary:
      "Replica compares runs and pasted outputs to surface shared patterns, tensions, missing information, and a usable strategy.",
    localNote: "Sources and generated merge results stay in browser storage.",
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
    loopWord: "Improve",
    eyebrow: "Improve from history",
    detailLabel: "Workflow memory",
    description:
      "See what your workflow history is teaching you across repeated runs.",
    summary:
      "Replica turns logged runs into timeline, adherence, outcome, theme, and workflow-health signals you can use before the next iteration.",
    localNote: "Insights are computed from local workflow and iteration data.",
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
    <section className="border-t">
      <div className="mx-auto max-w-5xl px-0">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="pt-16 text-2xl font-semibold tracking-tight">
            Three ways to improve the next run
          </h2>
          <p className="mt-3 pb-12 text-sm text-muted-foreground">
            Coding, Merge, and Insight are distinct surfaces for the same local
            reflection loop.
          </p>
        </div>

        <div className="snap-y snap-proximity">
          {modes.map((mode, index) => (
            <section
              key={mode.title}
              aria-labelledby={`${mode.title.toLowerCase()}-mode-title`}
              className="grid min-h-[calc(100svh-3.5rem)] snap-start scroll-mt-14 place-items-center border-t py-12 sm:py-16"
            >
              <div className="grid w-full gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{mode.badge}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {mode.eyebrow}
                    </span>
                  </div>
                  <h3
                    id={`${mode.title.toLowerCase()}-mode-title`}
                    className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl"
                  >
                    {index + 1}. {mode.title}
                  </h3>
                  <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                    {mode.description}
                  </p>
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    {mode.summary}
                  </p>
                  <Button variant="outline" className="mt-6" asChild>
                    <Link href={mode.href}>{mode.cta}</Link>
                  </Button>
                </div>

                <div className="rounded-2xl border bg-card p-5 text-card-foreground shadow-sm sm:p-6">
                  <div className="flex items-center justify-between gap-4 border-b pb-4">
                    <div>
                      <p className="text-xs font-medium text-primary">
                        {mode.loopWord}
                      </p>
                      <h4 className="mt-1 text-base font-medium">
                        {mode.detailLabel}
                      </h4>
                    </div>
                    <span className="rounded-4xl border bg-muted px-3 py-1 text-xs text-muted-foreground">
                      Local-first
                    </span>
                  </div>
                  <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
                    {mode.points.map((point) => (
                      <li key={point} className="flex gap-3">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 rounded-xl bg-muted p-4 text-xs leading-5 text-muted-foreground">
                    {mode.localNote}
                  </p>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
