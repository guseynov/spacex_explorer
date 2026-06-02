"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";
import { Menu, X } from "lucide-react";
import { RocketIcon } from "./ui/icons";

const navLinks = [
  { href: "/" as Route, label: "Launches" },
  { href: "/trends" as Route, label: "Trends" },
  { href: "/favorites" as Route, label: "Favorites" },
  { href: "/compare" as unknown as Route, label: "Compare" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isActive = (href: (typeof navLinks)[number]["href"]) => pathname === href;

  return (
    <header className="sticky top-0 z-20 pt-4 sm:pt-5">
      <div className="panel panel-strong px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-3 text-foreground"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--foreground)]">
              <RocketIcon className="h-5 w-5" />
            </span>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate text-[1.02rem] font-semibold tracking-[-0.01em]">
                SpaceX
              </span>
              <span className="text-[0.82rem] font-medium text-[var(--muted)]">
                Explorer
              </span>
            </span>
          </Link>

          <button
            type="button"
            aria-expanded={mobileMenuOpen}
            aria-controls="primary-navigation"
            onClick={() => setMobileMenuOpen((value) => !value)}
            className="inline-flex min-h-11 items-center gap-2 rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-medium text-foreground transition-colors hover:bg-[var(--surface-strong)] sm:hidden"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            Menu
          </button>
        </div>

        <div className="mt-4 hidden sm:block">
          <nav aria-label="Primary">
            <ul className="grid w-full grid-cols-4 gap-1.5 rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-1.5 sm:min-w-[19.5rem]">
              {navLinks.map((link) => (
                <li key={link.href} className="flex">
                  <Link
                    href={link.href}
                    style={
                      isActive(link.href)
                        ? {
                            backgroundColor: "var(--foreground)",
                            color: "var(--background)",
                            borderColor: "var(--foreground)",
                          }
                        : undefined
                    }
                    className={clsx(
                      "flex min-h-11 w-full items-center justify-center rounded-[10px] px-5 text-[0.95rem] font-medium transition-colors",
                      isActive(link.href)
                        ? "border"
                        : "text-[var(--muted)] hover:bg-[var(--surface-strong)] hover:text-foreground",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div
          id="primary-navigation"
          className={clsx(
            "mt-4 sm:hidden",
            mobileMenuOpen ? "block" : "hidden",
          )}
        >
          <nav aria-label="Primary mobile">
            <ul className="grid gap-2 rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    style={
                      isActive(link.href)
                        ? {
                            backgroundColor: "var(--foreground)",
                            color: "var(--background)",
                            borderColor: "var(--foreground)",
                          }
                        : undefined
                    }
                    className={clsx(
                      "flex min-h-11 w-full items-center rounded-[10px] px-4 text-[0.95rem] font-medium transition-colors",
                      isActive(link.href)
                        ? "border"
                        : "text-[var(--muted)] hover:bg-[var(--surface-strong)] hover:text-foreground",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
