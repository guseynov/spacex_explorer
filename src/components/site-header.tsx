"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Bookmark, GitCompareArrows, Info, Menu } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useCompare } from "@/features/compare/compare-context";
import { useFavorites } from "@/features/favorites/favorites-context";

const navLinks = [
  { href: "/" as Route, label: "Explore", icon: BrandMark },
  { href: "/favorites" as Route, label: "Saved", icon: Bookmark },
  {
    href: "/compare" as unknown as Route,
    label: "Compare",
    icon: GitCompareArrows,
  },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { items: savedItems } = useFavorites();
  const { items: compareItems } = useCompare();
  const isActive = (href: (typeof navLinks)[number]["href"]) =>
    pathname === href;
  const compareHref =
    compareItems.length === 2
      ? (`/compare?left=${encodeURIComponent(compareItems[0].id)}&right=${encodeURIComponent(compareItems[1].id)}` as Route)
      : ("/compare" as Route);
  const getLinkHref = (href: (typeof navLinks)[number]["href"]) =>
    href === "/compare" ? compareHref : href;

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-border bg-background">
      <div className="flex h-full w-full items-center gap-3 px-3 sm:px-4 lg:px-5">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 rounded-md text-[var(--brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <BrandMark className="size-8" />
          <span className="text-[0.96rem] font-semibold tracking-[-0.015em] text-foreground sm:text-base">
            Earth Event Atlas
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="hidden min-w-0 flex-1 justify-center md:flex"
        >
          <ul className="flex h-full items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const count =
                link.href === "/favorites"
                  ? savedItems.length
                  : link.href === "/compare"
                    ? compareItems.length
                    : 0;
              return (
                <li key={link.href}>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "relative h-14 rounded-none border-x-0 border-t-0 px-3 text-sm font-medium",
                      isActive(link.href)
                        ? "border-b-2 border-b-[var(--brand)] text-foreground"
                        : "border-b-2 border-b-transparent text-muted-foreground",
                    )}
                  >
                    <Link href={getLinkHref(link.href)}>
                      <Icon className="size-4" />
                      {link.label}
                      {count > 0 ? (
                        <span className="flex size-5 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[0.68rem] font-semibold text-[var(--brand-strong)]">
                          {count}
                        </span>
                      ) : null}
                    </Link>
                  </Button>
                </li>
              );
            })}
          </ul>
        </nav>

        <a
          href="https://eonet.gsfc.nasa.gov/"
          target="_blank"
          rel="noreferrer"
          className="ml-auto hidden items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground lg:flex"
        >
          Data from NASA EONET
        </a>

        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              aria-label={
                mobileMenuOpen ? "Close navigation" : "Open navigation"
              }
              className="ml-auto md:hidden"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-card md:hidden">
            <SheetHeader>
              <div className="flex items-center gap-3 text-[var(--brand)]">
                <BrandMark />
                <SheetTitle>Earth Event Atlas</SheetTitle>
              </div>
              <SheetDescription>
                Natural events, mapped over time.
              </SheetDescription>
            </SheetHeader>
            <nav aria-label="Primary mobile" className="mt-4">
              <ul className="grid gap-2">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <li key={link.href}>
                      <Button
                        asChild
                        variant={isActive(link.href) ? "default" : "ghost"}
                        className="h-11 w-full justify-start"
                      >
                        <Link
                          href={getLinkHref(link.href)}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Icon className="h-4 w-4" />
                          {link.label}
                        </Link>
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <a
              href="https://eonet.gsfc.nasa.gov/"
              target="_blank"
              rel="noreferrer"
              className="mt-auto flex items-start gap-3 border-t border-border pt-4 text-sm leading-6 text-muted-foreground"
            >
              <Info className="mt-1 size-4 shrink-0 text-[var(--brand)]" />
              Independent explorer using NASA EONET data. This project is not
              affiliated with or endorsed by NASA.
            </a>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
