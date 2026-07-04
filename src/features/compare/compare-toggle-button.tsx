"use client";

import clsx from "clsx";
import { Columns3Icon } from "lucide-react";
import type { FavoriteLaunch } from "@/lib/api/schemas";
import { useCompare } from "./compare-context";

export function CompareToggleButton({
  launch,
}: {
  launch: FavoriteLaunch;
}) {
  const { items, isSelected, toggleCompare } = useCompare();
  const selected = isSelected(launch.id);
  const label = selected
    ? "Remove from compare"
    : items.length >= 2
      ? "Replace compare selection"
      : "Add to compare";

  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={label}
      onClick={() => toggleCompare(launch)}
      className={clsx(
        "type-mono inline-flex items-center gap-1.5 text-[0.64rem] font-medium uppercase tracking-[0.1em] transition-colors",
        selected
          ? "text-[var(--accent-strong)]"
          : "text-[var(--muted)] hover:text-[var(--foreground)]",
      )}
    >
      <Columns3Icon className="h-3.5 w-3.5" />
      {selected ? "Selected" : "Compare"}
    </button>
  );
}
