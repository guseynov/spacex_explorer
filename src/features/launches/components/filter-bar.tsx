"use client";

import {
  defaultLaunchFilters,
  LaunchSortOption,
  type LaunchesQueryParams,
} from "@/lib/api/query-builder";
import { FilterControls } from "./filter-controls";
import { SlidersHorizontal } from "lucide-react";

export function FilterBar({
  filters,
  onChange,
  onClear,
}: {
  filters: LaunchesQueryParams;
  onChange: (next: Partial<LaunchesQueryParams>) => void;
  onClear: () => void;
}) {
  const hasAnyFilters = hasActiveFilters(filters);

  return (
    <>
      <details className="control-shell group overflow-hidden xl:hidden">
        <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 px-4 [&::-webkit-details-marker]:hidden">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[var(--accent-soft)] text-[var(--accent-strong)]">
              <SlidersHorizontal className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-[0.9rem] font-semibold text-foreground">Filter launches</h2>
              <p className="mt-0.5 text-[0.72rem] text-[var(--muted)]">
                {hasAnyFilters ? "Filters are active" : "Search, timing, outcome, dates"}
              </p>
            </div>
          </div>
          <span className="text-[0.76rem] font-semibold text-[var(--muted)] group-open:hidden">
            Open
          </span>
          <span className="hidden text-[0.76rem] font-semibold text-[var(--accent-strong)] group-open:inline">
            Close
          </span>
        </summary>
        <form onSubmit={(event) => event.preventDefault()}>
          <FilterControls
            filters={filters}
            onChange={onChange}
            onClear={onClear}
            hasAnyFilters={hasAnyFilters}
            showHeader={false}
          />
        </form>
      </details>

      <form
        className="control-shell hidden overflow-hidden xl:block"
        onSubmit={(event) => event.preventDefault()}
      >
        <FilterControls
          filters={filters}
          onChange={onChange}
          onClear={onClear}
          hasAnyFilters={hasAnyFilters}
          showHeader
        />
      </form>
    </>
  );
}

function hasActiveFilters(filters: LaunchesQueryParams) {
  return (
    filters.search !== defaultLaunchFilters.search ||
    filters.timing !== defaultLaunchFilters.timing ||
    filters.result !== defaultLaunchFilters.result ||
    filters.from !== defaultLaunchFilters.from ||
    filters.to !== defaultLaunchFilters.to ||
    filters.sort !== defaultLaunchFilters.sort
  );
}

export const sortLabels = {
  [LaunchSortOption.DateDesc]: "Newest first",
  [LaunchSortOption.DateAsc]: "Oldest first",
  [LaunchSortOption.NameAsc]: "Mission name: A-Z",
  [LaunchSortOption.NameDesc]: "Mission name: Z-A",
} as const;
