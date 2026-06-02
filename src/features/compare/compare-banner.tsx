"use client";

import Link from "next/link";
import type { Route } from "next";
import { useCompare } from "./compare-context";

export function CompareBanner() {
  const { items, hasHydrated, clearCompare } = useCompare();

  if (!hasHydrated || items.length === 0) {
    return null;
  }

  const compareHref =
    items.length === 2
      ? (`/compare?left=${items[0].id}&right=${items[1].id}` as unknown as Route)
      : null;

  return (
    <div className="mt-4 panel panel-strong px-5 py-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <p className="text-[0.78rem] font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
            Compare mode
          </p>
          <p className="text-sm leading-6 text-[var(--muted)]">
            {items.length === 1
              ? "Pick one more launch to open the side-by-side comparison."
              : "Two launches are selected and ready to compare."}
          </p>
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <span
                key={item.id}
                className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[0.82rem] font-medium text-[var(--info)]"
              >
                {item.name}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {compareHref ? (
            <Link
              href={compareHref}
              className="button-primary inline-flex px-4 py-2 text-sm font-semibold transition"
            >
              Compare selected
            </Link>
          ) : null}
          <button
            type="button"
            onClick={clearCompare}
            className="button-secondary px-4 py-2 text-sm font-semibold transition"
          >
            Clear compare
          </button>
        </div>
      </div>
    </div>
  );
}
