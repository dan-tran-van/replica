import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SelfHostSection() {
  return (
    <section className="border-t py-16">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-2xl font-semibold tracking-tight">
          Self-host in minutes
        </h2>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          No server secrets. Your OpenAI key lives in browser storage and is
          sent only to OpenAI from your device.
        </p>
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-base">Quick start</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <pre className="overflow-x-auto rounded-xl bg-muted p-4 text-xs">
              <code>{`git clone <your-repo>
cd replica
pnpm install
pnpm dev`}</code>
            </pre>
            <p className="text-sm text-muted-foreground">
              Open the app, add your API key in Settings, and create your first
              workflow. Each deployment origin has isolated IndexedDB storage—data
              does not migrate between hosts automatically.
            </p>
            <Button asChild>
              <Link href="/workflows">Open the app</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
