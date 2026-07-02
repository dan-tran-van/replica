import { Badge } from "@/components/ui/badge";

const stack = [
  "Next.js 16",
  "React 19",
  "TypeScript",
  "Tailwind CSS v4",
  "shadcn/ui",
  "IndexedDB (idb)",
  "Zod",
  "OpenAI API",
];

export function TechStackSection() {
  return (
    <section className="border-t py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Tech stack</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Modern, lightweight, and fully client-side for the core app.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {stack.map((item) => (
            <Badge key={item} variant="outline">
              {item}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  );
}
