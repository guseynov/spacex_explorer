import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "./providers";
import { SiteHeader } from "@/components/site-header";
import { CompareBanner } from "@/features/compare/compare-banner";

export const metadata: Metadata = {
  metadataBase: new URL("https://spacex-explorer.local"),
  title: {
    default: "SpaceX Explorer",
    template: "%s | SpaceX Explorer",
  },
  description:
    "Explore SpaceX launches with server-side filtering, typed data fetching, and saved favorites.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="relative min-h-dvh overflow-x-hidden text-foreground xl:h-dvh xl:overflow-hidden">
        <AppProviders>
          <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[1440px] flex-col px-4 sm:px-6 lg:px-8 xl:h-dvh xl:overflow-hidden">
            <SiteHeader />
            <CompareBanner />
            <main className="min-h-0 flex-1 overflow-x-hidden pt-6 pb-0 sm:pt-8 xl:overflow-hidden">
              {children}
            </main>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
