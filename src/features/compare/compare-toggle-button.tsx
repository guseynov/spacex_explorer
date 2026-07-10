"use client";

import { Columns3Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FavoriteEvent } from "@/lib/api/event-schemas";
import { useCompare } from "./compare-context";

export function CompareToggleButton({
  event,
}: {
  event: FavoriteEvent;
}) {
  const { items, isSelected, toggleCompare } = useCompare();
  const selected = isSelected(event.id);
  const label = selected
    ? "Remove from compare"
    : items.length >= 2
      ? "Replace compare selection"
      : "Add to compare";

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-pressed={selected}
      aria-label={label}
      onClick={() => toggleCompare(event)}
      className={selected ? "text-[var(--accent-strong)]" : ""}
    >
      <Columns3Icon className="h-3.5 w-3.5" />
      {selected ? "Selected" : "Compare"}
    </Button>
  );
}
