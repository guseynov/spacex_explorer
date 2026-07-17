import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";
import { AppProviders } from "./providers";
import { SiteHeader } from "@/components/site-header";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-atlas",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://earth-event-atlas.local"),
  title: {
    default: "Earth Event Atlas",
    template: "%s | Earth Event Atlas",
  },
  description:
    "Explore natural events across the planet and through time with data from NASA EONET.",
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
      className={inter.variable}
    >
      <body className="min-h-dvh overflow-x-hidden bg-background text-foreground">
        <AppProviders>
          <SiteHeader />
          <main className="min-h-[calc(100dvh-3.5rem)]">
            {children}
          </main>
        </AppProviders>
      </body>
    </html>
  );
}
