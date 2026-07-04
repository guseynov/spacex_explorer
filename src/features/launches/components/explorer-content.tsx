"use client";

import type { RefObject } from "react";
import { EmptyState } from "@/components/empty-state";
import { CompareToggleButton } from "@/features/compare/compare-toggle-button";
import { FavoriteToggleButton } from "@/features/favorites/favorite-toggle-button";
import { toFavoriteLaunch } from "@/lib/api/query-builder";
import { FetchNextPageError } from "./fetch-next-page-error";
import { LaunchCard } from "./launch-card";
import { LaunchCardSkeleton } from "./launch-card-skeleton";

export function ExplorerContent({
  launches,
  query,
  resetFilters,
  loadNextPage,
  emptyResetButtonRef,
  viewMode,
}: {
  launches: ReturnType<typeof toFavoriteLaunch>[];
  query: {
    isPending: boolean;
    isFetchNextPageError: boolean;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
  };
  resetFilters: () => void;
  loadNextPage: () => void;
  emptyResetButtonRef: RefObject<HTMLButtonElement | null>;
  viewMode: "grid" | "list";
}) {
  if (query.isPending) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <LaunchCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (launches.length === 0) {
    return (
      <EmptyState
        title="No events match these filters"
        description="Try a broader date range, switch event state, or search for a different category or source."
        action={
          <button
            ref={emptyResetButtonRef}
            id="launches-empty-reset"
            type="button"
            onClick={resetFilters}
            className="button-primary inline-flex rounded-[4px] border border-[rgba(68,144,245,0.34)] bg-[rgba(68,144,245,0.12)] px-5 py-3 text-sm font-semibold transition"
          >
            Reset filters
          </button>
        }
      />
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <div
        className={
          viewMode === "list"
            ? "grid grid-cols-1 gap-4"
            : "grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4"
        }
      >
        {launches.map((launch) => (
          <LaunchCard
            key={launch.id}
            launch={launch}
            actionSlot={
              <div className="flex items-center justify-between gap-4">
                <FavoriteToggleButton launch={launch} />
                <CompareToggleButton launch={launch} />
              </div>
            }
          />
        ))}
      </div>

      {query.hasNextPage ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={loadNextPage}
            disabled={query.isFetchingNextPage}
            className="button-secondary type-mono min-h-11 min-w-[11rem] rounded-[4px] border border-[var(--border)] px-5 text-[0.68rem] font-medium uppercase tracking-[0.12em] text-[var(--muted)] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {query.isFetchingNextPage ? "Loading..." : "Load more events"}
          </button>
        </div>
      ) : (
        <p className="type-mono text-center text-[0.68rem] font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
          You&apos;ve reached the end of the current event results.
        </p>
      )}

      <FetchNextPageError
        isFetchNextPageError={query.isFetchNextPageError}
        loadNextPage={loadNextPage}
      />
    </div>
  );
}
