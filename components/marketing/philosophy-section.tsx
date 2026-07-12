export function PhilosophySection() {
  return (
    <section className="border-t py-16">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight">Why Replica</h2>
        <div className="mt-6 space-y-4 text-sm text-muted-foreground">
          <p>
            Recurring AI workflows need memory. More prompts, more agents, and
            more automation do not help if every run starts without the lessons
            from the last one.
          </p>
          <p>
            Replica turns repeated attempts into a usable reflection loop: what
            ran, what happened, what changed, and what should improve before the
            next prompt.
          </p>
          <p>
            It is <span className="font-medium text-foreground">not</span> a
            backend, scheduler, agent runner, or cloud sync service. It is the
            local record you use alongside the tools that actually run your AI
            workflows.
          </p>
        </div>
      </div>
    </section>
  );
}
