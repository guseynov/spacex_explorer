import Link from "next/link";
import type { Route } from "next";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompare } from "@/features/compare/compare-context";
import { EventListCard } from "@/features/events/components/event-list-card";
import type { useFavorites } from "./favorites-context";

export function FavoritesContent({
  hasHydrated,
  items,
  removeFavorite,
}: {
  hasHydrated: boolean;
  items: ReturnType<typeof useFavorites>["items"];
  removeFavorite: ReturnType<typeof useFavorites>["removeFavorite"];
}) {
  const { isSelected, toggleCompare } = useCompare();

  if (!hasHydrated) {
    return (
      <div className="space-y-3 border border-border bg-card/40 p-5">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-28 rounded-sm" />
          <Skeleton className="h-28 rounded-sm" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="No saved events yet"
        description="Save events from the explorer or detail pages to build your shortlist."
        action={
          <Button asChild>
            <Link href="/">Explore events</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {items.map((event) => (
        <EventListCard
          key={event.id}
          event={event}
          saved
          compared={isSelected(event.id)}
          onToggleSave={() => removeFavorite(event.id)}
          onToggleCompare={() => toggleCompare(event)}
          detailHref={`/events/${event.id}` as Route}
        />
      ))}
    </div>
  );
}
