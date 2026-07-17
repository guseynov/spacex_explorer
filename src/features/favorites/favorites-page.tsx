"use client";

import { SectionHeading } from "@/components/section-heading";
import { useFavorites } from "./favorites-context";
import { FavoritesContent } from "./favorites-content";

export function FavoritesPage() {
  const { items, hasHydrated, removeFavorite } = useFavorites();

  return (
    <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <SectionHeading
        eyebrow="Your collection"
        title="Saved events"
        description="Keep a local shortlist of events to revisit or compare. Saved events stay in this browser."
      />
      <FavoritesContent
        hasHydrated={hasHydrated}
        items={items}
        removeFavorite={removeFavorite}
      />
    </div>
  );
}
