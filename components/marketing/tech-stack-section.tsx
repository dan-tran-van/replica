import { Badge } from "@/components/ui/badge";

const stack = [
  "Next.js 16",
  "React 19",
  "TypeScript",
  "Tailwind CSS v4",
  "shadcn/ui",
  "IndexedDB (idb)",
  "Browser-only storage",
  "Zod",
  "OpenAI API",
];

const proof = [
  "IndexedDB",
  "Browser storage",
  "Self-hostable",
  "Vercel deployable",
];

export function TechStackSection() {
  return (
    <section className="border-t py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Tech stack</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Modern, lightweight, and fully client-side for workflows, coding
          sessions, merge sessions, settings, and insights.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {stack.map((item) => (
            <Badge key={item} variant="outline">
              {item}
            </Badge>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {proof.map((item) => (
            <span
              key={item}
              className="rounded-4xl border bg-muted px-3 py-1 text-xs text-muted-foreground"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
