import Link from "next/link";
import { getGitHubUrl } from "@/lib/marketing/github-url";

export function MarketingFooter() {
  return (
    <footer className="border-t py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row">
        <p>Replica — reflection for recurring AI workflows</p>
        <div className="flex items-center gap-4">
          <a
            href={getGitHubUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            GitHub
          </a>
          <span>MIT License</span>
          <Link href="/workflows" className="hover:text-foreground">
            App
          </Link>
        </div>
      </div>
    </footer>
  );
}
