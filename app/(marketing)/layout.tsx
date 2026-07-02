import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <MarketingHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4">{children}</main>
      <MarketingFooter />
    </>
  );
}
