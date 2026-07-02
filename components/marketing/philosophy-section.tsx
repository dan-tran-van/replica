export function PhilosophySection() {
  return (
    <section className="border-t py-16">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight">Why Replica</h2>
        <div className="mt-6 space-y-4 text-sm text-muted-foreground">
          <p>
            Recurring AI workflows often repeat the same mistakes. More prompts,
            more agents, and more automation do not fix that—they add noise.
            What helps is structured reflection: what ran, what happened, what
            you noticed, and what to try next.
          </p>
          <p>
            Replica is not an execution engine. It does not schedule tasks, run
            agents, or sync to the cloud. It is a reflection layer you use
            alongside the tools that actually run your workflows. You keep
            control of every prompt change through a deliberate copy-only loop.
          </p>
          <p>
            Over time, your iteration history becomes a record of how your
            workflows evolved—grounded in real runs and your own observations,
            not guesswork.
          </p>
        </div>
      </div>
    </section>
  );
}
