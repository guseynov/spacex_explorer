"use client";

import { Button } from "@/components/ui/button";
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

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-pressed={saved}
      aria-label={ariaLabel}
      onClick={() => toggleFavorite(event)}
      className={saved ? "text-[var(--danger)]" : ""}
    >
      <BookmarkIcon className="h-3.5 w-3.5" />
      {buttonLabel}
    </Button>
  );
}
