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
  Globe2,
  Menu,
  Radio,
  X,
} from "lucide-react";

const navLinks = [
  { href: "/" as Route, label: "Events", icon: Globe2 },
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
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[rgba(7,11,20,0.82)] backdrop-blur-xl">
      <div className="mx-auto flex min-h-14 w-full max-w-[1400px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-[4px] border border-[rgba(147,197,253,0.22)] bg-[rgba(68,144,245,0.14)] text-[var(--accent-strong)]">
            <Globe2 className="h-[16px] w-[16px]" strokeWidth={2.1} />
            <span className="absolute -right-1 -bottom-1 h-2.5 w-2.5 rounded-full border border-[var(--background)] bg-[var(--success)]" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="type-display text-[1.12rem] font-semibold tracking-[0.02em] text-foreground">
              NASA Earth
            </span>
            <span className="type-mono text-[0.6rem] font-medium uppercase tracking-[0.18em] text-[var(--muted)]">
              Explorer
            </span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden min-w-0 flex-1 lg:block">
          <ul className="flex items-center gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={clsx(
                      "type-mono flex min-h-9 items-center gap-2 rounded-[4px] px-3 text-[0.68rem] font-medium uppercase tracking-[0.12em] transition-colors",
                      isActive(link.href)
                        ? "border border-[rgba(68,144,245,0.34)] bg-[rgba(68,144,245,0.12)] text-[var(--accent-strong)]"
                        : "border border-transparent text-[var(--muted)] hover:border-[var(--border)] hover:bg-[rgba(255,255,255,0.03)] hover:text-[var(--info)]",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto hidden items-center gap-2 rounded-[4px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-3 py-2 type-mono text-[0.62rem] font-medium uppercase tracking-[0.12em] text-[var(--muted)] sm:flex">
          <Radio className="h-3.5 w-3.5 text-[var(--success)]" />
          <span>EONET feed online</span>
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
          "border-t border-[var(--border)] bg-[rgba(7,11,20,0.95)] px-4 py-3 lg:hidden",
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
                    "type-mono flex min-h-11 items-center gap-2.5 rounded-[4px] border px-3 text-[0.68rem] font-medium uppercase tracking-[0.12em]",
                    isActive(link.href)
                      ? "border-[rgba(68,144,245,0.34)] bg-[rgba(68,144,245,0.12)] text-[var(--accent-strong)]"
                      : "border-[var(--border)] bg-[rgba(255,255,255,0.03)] text-[var(--muted)]",
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
