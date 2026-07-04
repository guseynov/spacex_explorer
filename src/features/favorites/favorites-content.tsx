import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { LaunchCard } from "@/features/launches/components/launch-card";
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
  if (!hasHydrated) {
    return (
      <div className="panel panel-strong px-6 py-10 text-[var(--muted)]">
        Loading saved events...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="No saved events yet"
        description="Save events from the explorer or detail pages to build your shortlist."
        action={
          <Link
            href="/"
            className="button-primary inline-flex px-5 py-3 text-sm font-semibold transition"
          >
            Explore events
          </Link>
        }
      />
    );
  }

  return (
    <div className="launch-list-shell overflow-hidden rounded-[0.5rem]">
      {items.map((launch, index) => (
        <div
          key={launch.id}
          className={
            index === items.length - 1
              ? undefined
              : "border-b border-[var(--border)]"
          }
        >
          <LaunchCard
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
        </div>
      ))}
    </div>
  );
}
