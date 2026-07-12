const steps = [
  {
    number: "1",
    title: "Remember",
    description:
      "Save the prompt, output, outcome, observations, and source context from work you ran elsewhere.",
  },
  {
    number: "2",
    title: "Reflect",
    description:
      "Use structured notes and optional AI analysis to identify what changed, failed, or conflicted.",
  },
  {
    number: "3",
    title: "Improve",
    description:
      "Copy the next prompt, retry checklist, merge strategy, or recommendation back to your external tool.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="border-t py-16">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-2xl font-semibold tracking-tight">
          How it works
        </h2>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          The same loop powers workflows, coding retries, merge reflections, and
          insights.
        </p>
        <ol className="relative mt-12 space-y-8 border-l border-border pl-8">
          {steps.map((step, index) => (
            <li key={step.number} className="relative">
              <span
                className="replica-marker-pulse absolute -left-[2.35rem] flex size-7 items-center justify-center rounded-full border bg-background text-xs font-medium"
                style={{ animationDelay: `${index * 180}ms` }}
              >
                {step.number}
              </span>
              <h3 className="font-medium">{step.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
