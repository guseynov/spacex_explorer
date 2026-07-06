"use client";

import { SectionHeading } from "@/components/section-heading";
import { useFavorites } from "./favorites-context";
import { FavoritesContent } from "./favorites-content";

export function FavoritesPage() {
  const { items, hasHydrated, removeFavorite } = useFavorites();

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Bookmarks"
        title="Favorite events"
        description="Your saved EONET events live locally in this browser, ready for quick revisits."
      />
      <FavoritesContent
        hasHydrated={hasHydrated}
        items={items}
        removeFavorite={removeFavorite}
      />
    </div>
  );
}
