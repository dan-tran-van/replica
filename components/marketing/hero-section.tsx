import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getGitHubUrl } from "@/lib/marketing/github-url";

export function HeroSection() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
          Improve long-running AI workflows through reflection, not more prompts.
        </h1>
        <p className="mt-6 text-base text-muted-foreground sm:text-lg">
          Replica records runs, captures your reflections, and proposes better
          prompts for the next iteration. It works alongside tools you already
          use—Manus Scheduled Tasks, and any recurring AI workflow you run
          externally.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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
      </div>
    </section>
  );
}
