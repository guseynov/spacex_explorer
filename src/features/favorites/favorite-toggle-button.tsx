"use client";

import clsx from "clsx";
import type { FavoriteLaunch } from "@/lib/api/schemas";
import { useFavorites } from "./favorites-context";
import { BookmarkIcon } from "@/components/ui/icons";

export function FavoriteToggleButton({
  launch,
}: {
  launch: FavoriteLaunch;
}) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = isFavorite(launch.id);
  const ariaLabel = saved
    ? "Remove from favorites"
    : "Add to favorites";
  const buttonLabel = saved ? "Saved" : "Save";
  const buttonClasses = saved
    ? "button-primary"
    : "button-secondary";

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={ariaLabel}
      onClick={() => toggleFavorite(launch)}
      className={clsx(
        "inline-flex items-center gap-2 border px-3.5 py-2 text-[0.86rem] font-medium transition",
        buttonClasses,
      )}
    >
      <BookmarkIcon className="h-4 w-4" />
      {buttonLabel}
    </button>
  );
}
