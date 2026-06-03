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
        "inline-flex w-full items-center justify-center gap-2 border px-3.5 py-2 text-[0.86rem] font-medium transition sm:w-auto",
        selected ? "button-primary" : "button-secondary",
      )}
    >
      <Columns3Icon className="h-4 w-4" />
      {selected ? "In compare" : "Compare"}
    </button>
  );
}
