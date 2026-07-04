"use client";

import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import { LayoutGrid, List } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
import { ExplorerContent } from "./explorer-content";
import { FilterBar } from "./filter-bar";
import { sortLabels } from "./sort-labels";

export function LaunchesExplorer({
  initialData,
}: {
  initialData?: InfiniteData<LaunchesPage, number>;
}) {
  const { filters, setFilters, resetFilters } = useLaunchFilters();
  const [debouncedSearch] = useDebounce(filters.search, 300);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
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
    ? "Loading event list..."
    : activeFilterCount > 0
      ? `${launches.length} events shown, ${activeFilterCount} filters active`
      : `${launches.length} events shown`;

  useEffect(() => {
    if (!query.data || query.isPending || query.isFetchingNextPage) {
      return;
    }

    if (launches.length === 0) {
      emptyResetButtonRef.current?.focus();
    }
  }, [launches.length, query.data, query.isFetchingNextPage, query.isPending]);

  return (
    <section
      aria-busy={query.isPending || query.isFetchingNextPage}
      className="flex min-h-full min-w-0 flex-col xl:h-full xl:min-h-0"
    >
      <header className="mb-6 flex flex-col gap-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="app-kicker mb-3">NASA EONET Earth Events</p>
            <h1 className="type-display text-[2.35rem] font-semibold leading-none tracking-[0.01em] text-foreground sm:text-[3rem]">
              Earth Event Explorer
            </h1>
          </div>

          <div className="flex items-center gap-2 self-start rounded-[4px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] p-1">
            <button
              type="button"
              aria-pressed={viewMode === "grid"}
              aria-label="Grid view"
              onClick={() => setViewMode("grid")}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-[3px] transition-colors ${
                viewMode === "grid"
                  ? "bg-[rgba(68,144,245,0.12)] text-[var(--accent-strong)]"
                  : "text-[var(--muted)]"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-pressed={viewMode === "list"}
              aria-label="List view"
              onClick={() => setViewMode("list")}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-[3px] transition-colors ${
                viewMode === "list"
                  ? "bg-[rgba(68,144,245,0.12)] text-[var(--accent-strong)]"
                  : "text-[var(--muted)]"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        <FilterBar
          filters={filters}
          onChange={setFilters}
          onClear={resetFilters}
        />

        <div className="flex flex-col gap-3 border-b border-[var(--border)] pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div
            aria-live="polite"
            className="type-mono text-[0.72rem] font-medium uppercase tracking-[0.12em] text-[var(--muted)]"
          >
            {loadingMessage}
          </div>

          <label className="flex min-w-0 items-center gap-2 text-sm text-[var(--muted)]">
            <span className="type-mono text-[0.66rem] font-medium uppercase tracking-[0.12em]">
              Sort
            </span>
            <select
              value={filters.sort}
              onChange={(event) =>
                setFilters({ sort: event.target.value as SortOption })
              }
              className="control-input control-select min-h-10 min-w-[11rem] px-3 text-[0.78rem]"
            >
              {Object.entries(sortLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      {query.isError ? (
        <RetryState
          message="The EONET event feed could not be loaded. Check your connection and retry."
          onRetry={retryInitialLoad}
          buttonId="launches-retry-button"
        />
      ) : (
        <ExplorerContent
          launches={launches}
          query={query}
          resetFilters={resetFilters}
          loadNextPage={loadNextPage}
          emptyResetButtonRef={emptyResetButtonRef}
          viewMode={viewMode}
        />
      )}
    </section>
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
