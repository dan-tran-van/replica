import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <Link
          href="/workflows"
          className="text-sm font-semibold tracking-tight"
        >
          Replica
        </Link>
        <nav className="flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/workflows">Workflows</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/coding">Coding</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/merges">Merges</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/insights">Insights</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/settings">Settings</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
