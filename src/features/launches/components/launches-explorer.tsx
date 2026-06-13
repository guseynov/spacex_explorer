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
import type { LaunchesPage } from "@/lib/api/schemas";
import { useLaunchFilters } from "../use-launch-filters";
import { FilterBar, sortLabels } from "./filter-bar";
import { LaunchCard } from "./launch-card";
import { LaunchCardSkeleton } from "./launch-card-skeleton";
import { VirtualizedLaunchList } from "./virtualized-launch-list";
import type { InfiniteData } from "@tanstack/react-query";

export function LaunchesExplorer({
  initialData,
}: {
  initialData?: InfiniteData<LaunchesPage, number>;
}) {
  const { filters, setFilters, resetFilters } = useLaunchFilters();
  const [debouncedSearch] = useDebounce(filters.search, 300);
  const emptyResetButtonRef = useRef<HTMLButtonElement | null>(null);

  const query = useInfiniteQuery({
    queryKey: ["launches", { ...filters, search: debouncedSearch }],
    queryFn: ({ pageParam }) =>
      fetchLaunchesPage({ ...filters, search: debouncedSearch }, pageParam),
    initialPageParam: 1,
    initialData,
    getNextPageParam,
    staleTime: 60_000,
  });

  const pages = query.data?.pages ?? [];
  const launches = pages.flatMap((page) => page.results).map(toFavoriteLaunch);
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
    <div className="flex min-h-full flex-col xl:h-full xl:min-h-0">
      <div className="grid gap-5 xl:h-full xl:min-h-0 xl:grid-cols-[320px_minmax(0,1fr)] xl:items-stretch">
        <aside className="xl:h-full xl:min-h-0">
          <div className="scroll-shell xl:h-full xl:min-h-0 xl:overflow-y-auto xl:pr-1">
            <FilterBar
              filters={filters}
              onChange={setFilters}
              onClear={resetFilters}
            />
          </div>
        </aside>

        <section
          aria-busy={query.isPending || query.isFetchingNextPage}
          className="flex min-h-0 min-w-0 flex-col xl:h-full xl:max-h-full"
        >
          <header className="mb-4 flex flex-col gap-4 border-b border-[var(--border)] pb-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="app-kicker mb-2">Flight index</p>
              <h1 className="type-display text-[1.75rem] font-semibold tracking-[-0.035em] text-foreground sm:text-[2rem]">
                Launch manifest
              </h1>
              <div
                aria-live="polite"
                className="mt-1.5 text-[0.8rem] font-medium text-[var(--muted)]"
              >
                {loadingMessage}
              </div>
            </div>

            <label className="flex min-w-0 flex-col gap-1.5 text-sm text-[var(--muted)] sm:min-w-[12rem]">
              <span className="text-[0.72rem] font-medium">Order by</span>
              <select
                value={filters.sort}
                onChange={(event) =>
                  setFilters({ sort: event.target.value as SortOption })
                }
                className="control-input control-select min-h-10 w-full px-3 text-[0.82rem]"
              >
                {Object.entries(sortLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </header>
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

function getNextPageParam(
  lastPage: { next: string | null },
  allPages: Array<{ next: string | null }>,
) {
  if (!lastPage.next) {
    return undefined;
  }

  return allPages.length + 1;
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
    <div className="panel overflow-hidden">
      {launches.map((launch, index) => (
        <div
          key={launch.id}
          className={
            index < launches.length - 1
              ? "border-b border-[var(--border)]"
              : undefined
          }
        >
          <LaunchCard
            launch={launch}
            actionSlot={actionRenderer?.(launch)}
          />
        </div>
      ))}
      {hasNextPage ? (
        <div ref={sentinelRef} className="h-8" aria-hidden="true" />
      ) : (
        <p className="px-5 py-4 text-center text-sm text-[var(--muted)]">
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
      <div className="flex min-h-8 flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {activeFilters.length > 0 ? (
            activeFilters.map((label) => (
              <span
                key={label}
                className="inline-flex items-center rounded-[6px] bg-[var(--surface-muted)] px-2.5 py-1 text-[0.72rem] font-medium text-[var(--info)]"
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
            className="self-start rounded-[6px] px-2 py-1 text-[0.72rem] font-semibold text-[var(--muted)] transition-colors hover:bg-[var(--surface)] hover:text-foreground sm:self-auto"
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
