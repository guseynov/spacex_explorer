"use client";

import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useDebounce } from "use-debounce";
import { RetryState } from "@/components/retry-state";
import { fetchLaunchesPage } from "@/lib/api/client";
import {
  countActiveLaunchFilters,
  type SortOption,
  toFavoriteLaunch,
} from "@/lib/api/query-builder";
import type { LaunchesPage } from "@/lib/api/schemas";
import { useLaunchFilters } from "../use-launch-filters";
import { FilterBar } from "./filter-bar";
import { sortLabels } from "./sort-labels";
import { ExplorerContent } from "./explorer-content";

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
  const activeFilterCount = countActiveLaunchFilters(filters);
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
