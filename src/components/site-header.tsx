"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";
import {
  BarChart3,
  Bookmark,
  Columns3,
  Menu,
  Radio,
  Rocket,
  X,
} from "lucide-react";

const navLinks = [
  { href: "/" as Route, label: "Launches", icon: Rocket },
  { href: "/trends" as Route, label: "Trends", icon: BarChart3 },
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
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[rgba(7,9,12,0.92)] backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 w-full max-w-[1600px] items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--accent)] text-[var(--accent-ink)]">
            <Rocket className="h-[18px] w-[18px]" strokeWidth={2.2} />
            <span className="absolute -right-1 -bottom-1 h-2.5 w-2.5 rounded-full border-2 border-[var(--background)] bg-[var(--success)]" />
          </span>
          <span className="flex items-baseline gap-1.5">
            <span className="type-display text-[0.98rem] font-semibold tracking-[-0.02em] text-foreground">
              SpaceX
            </span>
            <span className="type-mono text-[0.72rem] font-medium text-[var(--muted)]">
              Explorer
            </span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden min-w-0 flex-1 lg:block">
          <ul className="flex items-center justify-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={clsx(
                      "flex min-h-10 items-center gap-2 rounded-[8px] px-3.5 text-[0.84rem] font-medium transition-colors",
                      isActive(link.href)
                        ? "bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                        : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto hidden items-center gap-2 text-[0.72rem] font-medium text-[var(--muted)] sm:flex">
          <Radio className="h-3.5 w-3.5 text-[var(--success)]" />
          <span>Launch Library online</span>
        </div>

        <button
          type="button"
          aria-expanded={mobileMenuOpen}
          aria-controls="primary-navigation"
          aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
          onClick={() => setMobileMenuOpen((value) => !value)}
          className="button-secondary ml-auto inline-flex h-10 w-10 items-center justify-center lg:hidden"
        >
          {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      <nav
        id="primary-navigation"
        aria-label="Primary mobile"
        className={clsx(
          "border-t border-[var(--border)] bg-[var(--background-strong)] px-4 py-3 lg:hidden",
          mobileMenuOpen ? "block" : "hidden",
        )}
      >
        <ul className="grid grid-cols-2 gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={clsx(
                    "flex min-h-11 items-center gap-2.5 rounded-[8px] px-3 text-sm font-medium",
                    isActive(link.href)
                      ? "bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                      : "bg-[var(--surface)] text-[var(--muted)]",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
