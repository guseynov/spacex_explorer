import type { Metadata } from "next";
import {
  Barlow_Condensed,
  Inter,
  JetBrains_Mono,
} from "next/font/google";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";
import { AppProviders } from "./providers";

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
          <main className="relative z-10 min-h-dvh overflow-hidden">
            {children}
          </main>
        </AppProviders>
      </body>
    </html>
  );
}
