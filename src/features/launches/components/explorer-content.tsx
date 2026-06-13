import { EmptyState } from "@/components/empty-state";
import { FavoriteToggleButton } from "@/features/favorites/favorite-toggle-button";
import { CompareToggleButton } from "@/features/compare/compare-toggle-button";
import { toFavoriteLaunch, type LaunchesQueryParams } from "@/lib/api/query-builder";
import { LaunchCardSkeleton } from "./launch-card-skeleton";
import { MobileLaunchList } from "./mobile-launch-list";
import { ResultsToolbar } from "./results-toolbar";
import { VirtualizedLaunchList } from "./virtualized-launch-list";
import { FetchNextPageError } from "./fetch-next-page-error";
import type { RefObject } from "react";

export function ExplorerContent({
  launches,
  query,
  filters,
  resetFilters,
  loadNextPage,
  emptyResetButtonRef,
}: {
  launches: ReturnType<typeof toFavoriteLaunch>[];
  query: {
    isPending: boolean;
    isFetchNextPageError: boolean;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
  };
  filters: LaunchesQueryParams;
  resetFilters: () => void;
  loadNextPage: () => void;
  emptyResetButtonRef: RefObject<HTMLButtonElement | null>;
}) {
  if (query.isPending) {
    return (
      <div className="panel overflow-hidden">
        {Array.from({ length: 4 }, (_, index) => (
          <LaunchCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (launches.length === 0) {
    return (
      <EmptyState
        title="No launches match these filters"
        description="Try a broader date range, clear one of the extra filters, or search for a different mission."
        action={
          <button
            ref={emptyResetButtonRef}
            id="launches-empty-reset"
            type="button"
            onClick={resetFilters}
            className="button-primary inline-flex px-5 py-3 text-sm font-semibold transition"
          >
            Reset filters
          </button>
        }
      />
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-0 xl:h-full xl:max-h-full">
      <ResultsToolbar filters={filters} onReset={resetFilters} />
      <div className="md:hidden">
        <MobileLaunchList
          launches={launches}
          actionRenderer={(launch) => (
            <div className="flex w-full gap-2 sm:w-auto">
              <FavoriteToggleButton launch={launch} />
              <CompareToggleButton launch={launch} />
            </div>
          )}
          hasNextPage={Boolean(query.hasNextPage)}
          isFetchingNextPage={query.isFetchingNextPage}
          onLoadMore={loadNextPage}
        />
      </div>
      <div className="hidden md:flex xl:min-h-0 xl:flex-1">
        <VirtualizedLaunchList
          launches={launches}
          actionRenderer={(launch) => (
            <div className="flex w-full gap-2 sm:w-auto">
              <FavoriteToggleButton launch={launch} />
              <CompareToggleButton launch={launch} />
            </div>
          )}
          hasNextPage={Boolean(query.hasNextPage)}
          isFetchingNextPage={query.isFetchingNextPage}
          onLoadMore={loadNextPage}
          footer={
            !query.hasNextPage ? (
              <p className="px-1 py-4 text-center text-sm text-[var(--muted)]">
                You&apos;ve reached the end of the current launch results.
              </p>
            ) : undefined
          }
        />
      </div>
      {query.isFetchingNextPage ? (
        <p className="loading-more-indicator text-center text-[0.95rem] text-[var(--muted)] italic">
          Loading more launches...
        </p>
      ) : null}
      <FetchNextPageError
        isFetchNextPageError={query.isFetchNextPageError}
        loadNextPage={loadNextPage}
      />
    </div>
  );
}
