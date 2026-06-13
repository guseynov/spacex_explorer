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
        "inline-flex min-h-10 w-full items-center justify-center gap-2 border px-3 py-2 text-[0.78rem] font-semibold transition sm:w-auto",
        buttonClasses,
      )}
    >
      <BookmarkIcon className="h-4 w-4" />
      {buttonLabel}
    </button>
  );
}
