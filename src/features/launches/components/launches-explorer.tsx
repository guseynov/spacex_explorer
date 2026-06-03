"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef, type RefObject } from "react";
import { useDebounce } from "use-debounce";
import { EmptyState } from "@/components/empty-state";
import { RetryState } from "@/components/retry-state";
import { FavoriteToggleButton } from "@/features/favorites/favorite-toggle-button";
import { CompareToggleButton } from "@/features/compare/compare-toggle-button";
import { fetchLaunchesPage } from "@/lib/api/client";
import {
  defaultLaunchFilters,
  LaunchResult,
  LaunchSortOption,
  LaunchTiming,
  type LaunchesQueryParams,
  type SortOption,
  toFavoriteLaunch,
} from "@/lib/api/query-builder";
import { useLaunchFilters } from "../use-launch-filters";
import { FilterBar, sortLabels } from "./filter-bar";
import { LaunchCard } from "./launch-card";
import { LaunchCardSkeleton } from "./launch-card-skeleton";
import { VirtualizedLaunchList } from "./virtualized-launch-list";

export function LaunchesExplorer() {
  const { filters, setFilters, resetFilters } = useLaunchFilters();
  const [debouncedSearch] = useDebounce(filters.search, 300);
  const emptyResetButtonRef = useRef<HTMLButtonElement | null>(null);

  const query = useInfiniteQuery({
    queryKey: ["launches", { ...filters, search: debouncedSearch }],
    queryFn: ({ pageParam }) =>
      fetchLaunchesPage({ ...filters, search: debouncedSearch }, pageParam),
    initialPageParam: 1,
    getNextPageParam,
    staleTime: 60_000,
  });

  const pages = query.data?.pages ?? [];
  const launches = pages.flatMap((page) => page.docs).map(toFavoriteLaunch);
  const retryInitialLoad = () => query.refetch();
  const loadNextPage = () => query.fetchNextPage();
  const activeFilterCount = countActiveFilters(filters);
  const loadingMessage = query.isPending
    ? "Loading launch list..."
    : activeFilterCount > 0
      ? `${launches.length} launch${launches.length === 1 ? "" : "es"} shown, ${activeFilterCount} filter${activeFilterCount === 1 ? "" : "s"} active`
      : `${launches.length} launch${launches.length === 1 ? "" : "es"} shown`;

  useEffect(() => {
    if (!query.data || query.isPending || query.isFetchingNextPage) {
      return;
    }

    if (launches.length === 0) {
      emptyResetButtonRef.current?.focus();
    }
  }, [launches.length, query.data, query.isFetchingNextPage, query.isPending]);

  return (
    <div className="flex min-h-full flex-col gap-8 xl:h-full xl:min-h-0">
      <div className="grid gap-6 xl:h-full xl:min-h-0 xl:grid-cols-[380px_minmax(0,1fr)] xl:items-stretch">
        <aside className="xl:h-full xl:min-h-0">
          <div className="scroll-shell xl:h-full xl:min-h-0 xl:overflow-y-auto xl:pr-3">
            <FilterBar
              filters={filters}
              onChange={setFilters}
              onClear={resetFilters}
            />
          </div>
        </aside>

        <section
          aria-busy={query.isPending || query.isFetchingNextPage}
          className="flex min-h-0 min-w-0 flex-col gap-4 xl:h-full xl:max-h-full"
        >
          <div className="flex flex-col gap-3 border-b border-[var(--border)] pb-3 lg:flex-row lg:items-center lg:justify-between">
            <div
              aria-live="polite"
              className="pr-4 text-[0.8rem] font-medium text-[var(--muted)]"
            >
              {loadingMessage}
            </div>

            <label className="flex min-w-0 flex-col gap-1.5 text-sm text-[var(--muted)] sm:min-w-[13.5rem]">
              <span className="text-[0.74rem] font-medium uppercase tracking-[0.12em]">
                Sort list
              </span>
              <select
                value={filters.sort}
                onChange={(event) =>
                  setFilters({ sort: event.target.value as SortOption })
                }
                className="control-input control-select w-full px-4 py-2.5 text-sm"
              >
                {Object.entries(sortLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {query.isError ? (
            <RetryState
              message="The launch feed could not be loaded. Check your connection and retry."
              onRetry={retryInitialLoad}
              buttonId="launches-retry-button"
            />
          ) : (
            <ExplorerContent
              launches={launches}
              query={query}
              filters={filters}
              resetFilters={resetFilters}
              loadNextPage={loadNextPage}
              emptyResetButtonRef={emptyResetButtonRef}
            />
          )}
        </section>
      </div>
    </div>
  );
}

function getNextPageParam(lastPage: {
  hasNextPage: boolean;
  nextPage: number | null;
}) {
  if (!lastPage.hasNextPage) {
    return undefined;
  }

  return lastPage.nextPage ?? undefined;
}

function ExplorerContent({
  launches,
  query,
  filters,
  resetFilters,
  loadNextPage,
  emptyResetButtonRef,
}: {
  launches: ReturnType<typeof toFavoriteLaunch>[];
  query: Pick<
    ReturnType<typeof useInfiniteQuery>,
    "isPending" | "isFetchNextPageError" | "hasNextPage" | "isFetchingNextPage"
  >;
  filters: LaunchesQueryParams;
  resetFilters: () => void;
  loadNextPage: () => void;
  emptyResetButtonRef: RefObject<HTMLButtonElement | null>;
}) {
  if (query.isPending) {
    return (
      <div className="space-y-4">
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
            <div className="flex flex-col gap-3 sm:flex-row">
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
            <div className="flex flex-col gap-3 sm:flex-row">
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
      {renderFetchNextPageError(query.isFetchNextPageError, loadNextPage)}
    </div>
  );
}

function MobileLaunchList({
  launches,
  actionRenderer,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: {
  launches: ReturnType<typeof toFavoriteLaunch>[];
  actionRenderer?: (launch: ReturnType<typeof toFavoriteLaunch>) => React.ReactNode;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || !hasNextPage || isFetchingNextPage) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage && hasNextPage) {
          onLoadMore();
        }
      },
      {
        root: null,
        rootMargin: "600px 0px",
        threshold: 0,
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, launches.length, onLoadMore]);

  return (
    <div className="space-y-4">
      {launches.map((launch) => (
        <LaunchCard
          key={launch.id}
          launch={launch}
          actionSlot={actionRenderer?.(launch)}
        />
      ))}
      {hasNextPage ? (
        <div ref={sentinelRef} className="h-8" aria-hidden="true" />
      ) : (
        <p className="px-1 py-4 text-center text-sm text-[var(--muted)]">
          You&apos;ve reached the end of the current launch results.
        </p>
      )}
    </div>
  );
}

function ResultsToolbar({
  filters,
  onReset,
}: {
  filters: LaunchesQueryParams;
  onReset: () => void;
}) {
  const activeFilters = getActiveFilterLabels(filters);

  return (
    <div className="flex flex-col gap-4 px-0 py-0">
      <div className="flex flex-col gap-3 pt-4 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {activeFilters.length > 0 ? (
            activeFilters.map((label) => (
              <span
                key={label}
                className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[0.82rem] font-medium text-[var(--info)]"
              >
                {label}
              </span>
            ))
          ) : null}
        </div>

        {activeFilters.length > 0 ? (
          <button
            type="button"
            onClick={onReset}
            className="button-secondary mt-2 self-start px-4 py-2 text-sm font-semibold transition sm:mt-1 sm:self-auto"
          >
            Reset all filters
          </button>
        ) : null}
      </div>
    </div>
  );
}

function renderFetchNextPageError(
  isFetchNextPageError: boolean,
  loadNextPage: () => void,
) {
  if (!isFetchNextPageError) {
    return null;
  }

  return (
    <div className="panel px-5 py-4 text-sm text-[var(--muted)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>We could not load more launches.</p>
        <button
          type="button"
          onClick={loadNextPage}
          className="button-secondary px-4 py-2 font-semibold transition"
        >
          Load more again
        </button>
      </div>
    </div>
  );
}

function getActiveFilterLabels(filters: LaunchesQueryParams) {
  const labels: string[] = [];

  if (filters.search) {
    labels.push(`Mission: ${filters.search}`);
  }

  if (filters.timing === LaunchTiming.Upcoming) {
    labels.push("Upcoming");
  } else if (filters.timing === LaunchTiming.Past) {
    labels.push("Past");
  }

  if (filters.result === LaunchResult.Success) {
    labels.push("Result: success");
  } else if (filters.result === LaunchResult.Failure) {
    labels.push("Result: failure");
  }

  if (filters.from || filters.to) {
    labels.push(
      `Dates: ${filters.from || "Any start"} to ${filters.to || "Any end"}`,
    );
  }

  if (filters.sort !== LaunchSortOption.DateDesc) {
    labels.push(`Sort: ${sortLabels[filters.sort]}`);
  }

  return labels;
}

function countActiveFilters(filters: LaunchesQueryParams) {
  let count = 0;

  if (filters.search !== defaultLaunchFilters.search) {
    count += 1;
  }

  if (filters.timing !== defaultLaunchFilters.timing) {
    count += 1;
  }

  if (filters.result !== defaultLaunchFilters.result) {
    count += 1;
  }

  if (filters.from || filters.to) {
    count += 1;
  }

  if (filters.sort !== defaultLaunchFilters.sort) {
    count += 1;
  }

  return count;
}
