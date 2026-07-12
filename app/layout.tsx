import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { RepositoryProvider } from "@/components/providers/repository-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Replica - Remember. Reflect. Improve.",
  description:
    "A reflection layer for recurring AI workflows. Remember external runs, reflect on outcomes, and improve the next prompt. Local-first, browser-only.",
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
