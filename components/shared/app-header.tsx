import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight"
        >
          Replica
        </Link>
        <nav>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/settings">Settings</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
