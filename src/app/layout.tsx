import type { Metadata } from "next";
import {
  Barlow_Condensed,
  Inter,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";
import { AppProviders } from "./providers";
import { SiteHeader } from "@/components/site-header";
import { CompareBanner } from "@/features/compare/compare-banner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://eonet-explorer.local"),
  title: {
    default: "EONET Explorer",
    template: "%s | EONET Explorer",
  },
  description:
    "Explore live NASA EONET natural events with server-side filtering, typed data fetching, and saved favorites.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${jetBrainsMono.variable} ${barlowCondensed.variable}`}
    >
      <body className="relative min-h-dvh overflow-x-hidden text-foreground">
        <AppProviders>
          <div className="relative z-10 flex min-h-dvh flex-col">
            <SiteHeader />
            <div className="mx-auto flex min-h-0 w-full max-w-[1400px] flex-1 flex-col px-4 sm:px-6 lg:px-8">
              <CompareBanner />
              <main className="min-h-0 flex-1 overflow-x-hidden py-6 sm:py-8">
                {children}
              </main>
            </div>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
