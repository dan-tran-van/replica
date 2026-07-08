import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { RepositoryProvider } from "@/components/providers/repository-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Replica — Improve AI workflows through reflection",
  description:
    "Record runs, capture reflections, and propose better prompts for recurring AI workflows. Local-first, browser-only.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased font-sans">
      <body className="flex min-h-full flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <RepositoryProvider>
            {children}
            <Toaster />
          </RepositoryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
