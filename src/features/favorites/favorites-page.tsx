"use client";

import { SectionHeading } from "@/components/section-heading";
import { useFavorites } from "./favorites-context";
import { FavoritesContent } from "./favorites-content";

export function FavoritesPage() {
  const { items, hasHydrated, removeFavorite } = useFavorites();

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Bookmarks"
        title="Favorite launches"
        description="Your saved missions live locally in this browser, ready for quick revisits."
      />
      <FavoritesContent
        hasHydrated={hasHydrated}
        items={items}
        removeFavorite={removeFavorite}
      />
    </div>
  );
}
