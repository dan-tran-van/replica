import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getGitHubUrl } from "@/lib/marketing/github-url";

export function MarketingHeader() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight"
        >
          Replica
        </Link>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <a
              href={getGitHubUrl()}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </Button>
          <Button size="sm" asChild>
            <Link href="/workflows">Get Started</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
