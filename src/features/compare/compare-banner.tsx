"use client";

import { useRouter } from "next/navigation";
import type { Route } from "next";
import { useCompare } from "./compare-context";

export function CompareBanner() {
  const router = useRouter();
  const { items, hasHydrated, clearCompare } = useCompare();

  if (!hasHydrated || items.length === 0) {
    return null;
  }

  const compareHref =
    items.length === 2
      ? (`/compare?left=${items[0].id}&right=${items[1].id}` as Route)
      : null;

  return (
    <div className="mt-4 rounded-[10px] border border-[rgba(255,90,54,0.24)] bg-[var(--accent-soft)] px-4 py-3">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <p className="type-mono text-[0.72rem] font-semibold text-[var(--accent-strong)]">
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
                className="inline-flex items-center rounded-[6px] bg-[var(--surface)] px-2.5 py-1 text-[0.76rem] font-medium text-[var(--info)]"
              >
                {item.name}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {compareHref ? (
            <button
              type="button"
              onClick={() => router.push(compareHref)}
              className="button-primary inline-flex items-center justify-center px-4 py-2 text-sm font-semibold leading-none transition"
            >
              Compare selected
            </button>
          ) : null}
          <button
            type="button"
            onClick={clearCompare}
            className="button-secondary inline-flex items-center justify-center px-4 py-2 text-sm font-semibold leading-none transition"
          >
            Clear compare
          </button>
        </div>
      </div>
    </div>
  );
}
