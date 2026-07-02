const steps = [
  {
    number: "1",
    title: "Run externally",
    description:
      "Execute your prompt in Manus, another agent, or any recurring AI workflow.",
  },
  {
    number: "2",
    title: "Log the run",
    description:
      "Paste the output, outcome, observations, and the prompt you actually used.",
  },
  {
    number: "3",
    title: "Reflect & analyze",
    description:
      "Replica proposes an improved prompt, reasoning, and a next recommendation.",
  },
  {
    number: "4",
    title: "Copy & iterate",
    description:
      "Copy the proposal back to your tool. No auto-updates—you stay in control.",
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
          A simple reflection loop for workflows that run again and again.
        </p>
        <ol className="relative mt-12 space-y-8 border-l border-border pl-8">
          {steps.map((step) => (
            <li key={step.number} className="relative">
              <span className="absolute -left-[2.35rem] flex size-7 items-center justify-center rounded-full border bg-background text-xs font-medium">
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
