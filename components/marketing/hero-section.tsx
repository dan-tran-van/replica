import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getGitHubUrl } from "@/lib/marketing/github-url";

const flowPreview = [
  {
    label: "Remember",
    title: "Run saved",
    detail: "Prompt, output, outcome, notes",
  },
  {
    label: "Reflect",
    title: "Pattern found",
    detail: "Missing context, tensions, next actions",
  },
  {
    label: "Improve",
    title: "Next prompt",
    detail: "Copy the sharper retry back out",
  },
];

export function HeroSection() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <p className="replica-fade-up text-sm font-medium text-primary">
          Remember. Reflect. Improve.
        </p>
        <h1 className="replica-fade-up replica-stagger-1 mt-3 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
          A reflection layer for recurring AI workflows.
        </h1>
        <p className="replica-fade-up replica-stagger-2 mt-6 text-base text-muted-foreground sm:text-lg">
          Replica remembers external AI runs, reflects on what happened, and
          helps improve the next prompt. It stays local-first, browser-only, and
          copy-only so you keep control of every change.
        </p>
        <div className="replica-fade-up replica-stagger-3 mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/workflows">Get Started</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a
              href={getGitHubUrl()}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub
            </a>
          </Button>
        </div>
        <div className="replica-fade-up replica-stagger-4 mt-4 text-sm text-muted-foreground">
          Use Replica for{" "}
          <Link href="/coding" className="hover:text-foreground">
            coding retries
          </Link>
          ,{" "}
          <Link href="/merges" className="hover:text-foreground">
            merge reflections
          </Link>
          , and{" "}
          <Link href="/insights" className="hover:text-foreground">
            cross-workflow insights
          </Link>
          .
        </div>

        <div className="replica-fade-up replica-stagger-5 replica-flow-line mt-12 grid gap-3 text-left sm:grid-cols-3">
          {flowPreview.map((item) => (
            <div
              key={item.label}
              className="relative z-10 rounded-2xl border bg-background p-4 shadow-sm"
            >
              <p className="text-xs font-medium text-primary">{item.label}</p>
              <h2 className="mt-2 text-sm font-medium">{item.title}</h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
