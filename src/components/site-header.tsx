"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Bookmark,
  Columns3,
  Globe2,
  Menu,
  Radio,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

const navLinks = [
  { href: "/" as Route, label: "Events", icon: Globe2 },
  { href: "/favorites" as Route, label: "Favorites", icon: Bookmark },
  {
    href: "/compare" as unknown as Route,
    label: "Compare",
    icon: Columns3,
  },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isActive = (href: (typeof navLinks)[number]["href"]) => pathname === href;

  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-background/84 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 w-full max-w-[1400px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-primary/30 bg-primary/12 text-[var(--accent-strong)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <Globe2 className="h-[16px] w-[16px]" strokeWidth={2.1} />
            <span className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full border border-background bg-[var(--success)]" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-[1.02rem] font-semibold tracking-[0.01em] text-foreground">
              NASA Earth
            </span>
            <span className="text-[0.64rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Event Explorer
            </span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden min-w-0 flex-1 lg:block">
          <ul className="flex items-center gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <Button
                    asChild
                    variant={isActive(link.href) ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "rounded-full px-3.5 text-[0.68rem] uppercase tracking-[0.12em]",
                      !isActive(link.href) && "text-muted-foreground",
                    )}
                  >
                    <Link href={link.href}>
                      <Icon className="h-3.5 w-3.5" />
                      {link.label}
                    </Link>
                  </Button>
                </li>
              );
            })}
          </ul>
        </nav>

        <Badge variant="secondary" className="ml-auto hidden rounded-full px-3 py-2 text-[0.62rem] sm:flex">
          <Radio className="h-3.5 w-3.5 text-[var(--success)]" />
          <span>EONET feed online</span>
        </Badge>

        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
              className="ml-auto rounded-full lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-card/98 lg:hidden">
            <SheetHeader>
              <SheetTitle>Navigation</SheetTitle>
              <SheetDescription>
                Move between the event explorer, favorites, and compare view.
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
                        variant={isActive(link.href) ? "default" : "secondary"}
                        className="h-11 w-full justify-start rounded-xl text-[0.74rem] uppercase tracking-[0.12em]"
                      >
                        <Link href={link.href} onClick={() => setMobileMenuOpen(false)}>
                          <Icon className="h-4 w-4" />
                          {link.label}
                        </Link>
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
