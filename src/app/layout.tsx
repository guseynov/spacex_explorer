import type { Metadata } from "next";
import {
  Barlow_Condensed,
  Inter,
  JetBrains_Mono,
} from "next/font/google";
import "maplibre-gl/dist/maplibre-gl.css";
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
    default: "Earth Event Explorer",
    template: "%s | Earth Event Explorer",
  },
  description:
    "Explore NASA EONET natural events through a DB-backed, map-first Earth observation dashboard.",
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
            <div className="flex min-h-0 w-full flex-1 flex-col px-3 pb-3 sm:px-4 sm:pb-4 lg:px-5 lg:pb-5">
              <CompareBanner />
              <main className="min-h-0 flex-1 overflow-hidden pt-3 sm:pt-4">
                {children}
              </main>
            </div>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
