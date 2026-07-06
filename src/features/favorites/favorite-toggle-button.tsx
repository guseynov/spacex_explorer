"use client";

import clsx from "clsx";
import type { FavoriteEvent } from "@/lib/api/event-schemas";
import { useFavorites } from "./favorites-context";
import { BookmarkIcon } from "@/components/ui/icons";

export function FavoriteToggleButton({
  event,
}: {
  event: FavoriteEvent;
}) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = isFavorite(event.id);
  const ariaLabel = saved
    ? "Remove from favorites"
    : "Add to favorites";
  const buttonLabel = saved ? "Saved" : "Save";
  const buttonClasses = saved
    ? "text-[var(--danger)]"
    : "text-[var(--muted)] hover:text-[var(--foreground)]";

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={ariaLabel}
      onClick={() => toggleFavorite(event)}
      className={clsx(
        "type-mono inline-flex items-center gap-1.5 text-[0.64rem] font-medium uppercase tracking-[0.1em] transition-colors",
        buttonClasses,
      )}
    >
      <BookmarkIcon className="h-3.5 w-3.5" />
      {buttonLabel}
    </button>
  );
}
