import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { AppHeader } from "@/components/shared/app-header";
import { RepositoryProvider } from "@/components/providers/repository-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { cn } from "@/lib/utils";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Replica — Prompt reflection for Manus",
  description:
    "Improve your Manus Scheduled prompts through repeated execution, reflection, and iteration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        outfit.variable,
      )}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <RepositoryProvider>
            <AppHeader />
            <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
              {children}
            </main>
            <Toaster />
          </RepositoryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
