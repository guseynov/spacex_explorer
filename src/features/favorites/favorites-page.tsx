"use client";

import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { SectionHeading } from "@/components/section-heading";
import { LaunchCard } from "@/features/launches/components/launch-card";
import { useFavorites } from "./favorites-context";

export function FavoritesPage() {
  const { items, hasHydrated, removeFavorite } = useFavorites();
  const pageContent = renderFavoritesContent(
    hasHydrated,
    items,
    removeFavorite,
  );

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Bookmarks"
        title="Favorite launches"
        description="Your saved missions live locally in this browser, ready for quick revisits."
      />
      {pageContent}
    </div>
  );
}

function renderFavoritesContent(
  hasHydrated: boolean,
  items: ReturnType<typeof useFavorites>["items"],
  removeFavorite: ReturnType<typeof useFavorites>["removeFavorite"],
) {
  if (!hasHydrated) {
    return (
      <div className="panel px-6 py-10 text-[var(--muted)]">
        Loading saved launches...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="No saved launches yet"
        description="Save launches from the explorer or detail pages to build your shortlist."
        action={
          <Link
            href="/"
            className="button-primary inline-flex px-5 py-3 text-sm font-semibold transition"
          >
            Explore launches
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {items.map((launch) => (
        <LaunchCard
          key={launch.id}
          launch={launch}
          actionSlot={
            <button
              type="button"
              onClick={() => removeFavorite(launch.id)}
              className="button-secondary px-4 py-2 text-sm font-semibold transition hover:border-[var(--danger)] hover:text-[var(--danger)]"
            >
              Remove
            </button>
          }
        />
      ))}
    </div>
  );
}
