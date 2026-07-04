"use client";

import { RotateCcw, SlidersHorizontal } from "lucide-react";
import {
  countActiveLaunchFilters,
  eventCategoryOptions,
  LaunchTiming,
  type LaunchesQueryParams,
} from "@/lib/api/query-builder";
import { DateField } from "./date-field";
import { FilterChip } from "./filter-chip";
import { SearchField } from "./search-field";

export function FilterBar({
  filters,
  onChange,
  onClear,
}: {
  filters: LaunchesQueryParams;
  onChange: (next: Partial<LaunchesQueryParams>) => void;
  onClear: () => void;
}) {
  const hasAnyFilters = countActiveLaunchFilters(filters) > 0;

  return (
    <>
      <details className="control-shell group overflow-hidden xl:hidden">
        <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 px-4 [&::-webkit-details-marker]:hidden">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] border border-[rgba(68,144,245,0.24)] bg-[rgba(68,144,245,0.12)] text-[var(--accent-strong)]">
              <SlidersHorizontal className="h-4 w-4" />
            </span>
            <div>
              <h2 className="type-display text-[1.02rem] font-semibold tracking-[0.01em] text-foreground">
                Event filters
              </h2>
              <p className="mt-0.5 text-[0.72rem] text-[var(--muted)]">
                {hasAnyFilters ? "Query modifiers active" : "Search, state, category, dates"}
              </p>
            </div>
          </div>
          <span className="type-mono text-[0.68rem] font-medium uppercase tracking-[0.12em] text-[var(--muted)] group-open:hidden">
            Open
          </span>
          <span className="type-mono hidden text-[0.68rem] font-medium uppercase tracking-[0.12em] text-[var(--accent-strong)] group-open:inline">
            Close
          </span>
        </summary>

        <form
          className="space-y-4 px-4 pb-4"
          onSubmit={(event) => event.preventDefault()}
        >
          <SearchField filters={filters} onChange={onChange} />

          <fieldset className="space-y-2">
            <legend className="type-mono text-[0.66rem] font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
              Event state
            </legend>
            <div className="grid grid-cols-3 gap-2">
              <FilterChip
                active={filters.timing === LaunchTiming.All}
                onClick={() => onChange({ timing: LaunchTiming.All })}
              >
                All
              </FilterChip>
              <FilterChip
                active={filters.timing === LaunchTiming.Upcoming}
                onClick={() => onChange({ timing: LaunchTiming.Upcoming })}
              >
                Active
              </FilterChip>
              <FilterChip
                active={filters.timing === LaunchTiming.Past}
                onClick={() => onChange({ timing: LaunchTiming.Past })}
              >
                Closed
              </FilterChip>
            </div>
          </fieldset>

          <label className="block space-y-2.5">
            <span className="type-mono text-[0.66rem] font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
              Category
            </span>
            <select
              value={filters.category}
              onChange={(event) => onChange({ category: event.target.value })}
              className="control-input control-select min-h-11 w-full px-3 text-sm"
            >
              {eventCategoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <DateField
              label="From"
              value={filters.from}
              onChange={(from) => onChange({ from })}
            />
            <DateField
              label="To"
              value={filters.to}
              onChange={(to) => onChange({ to })}
            />
          </div>

          {hasAnyFilters ? (
            <button
              type="button"
              onClick={onClear}
              className="button-secondary type-mono inline-flex min-h-9 items-center gap-1.5 rounded-[4px] border border-[var(--border)] px-3 text-[0.66rem] font-medium uppercase tracking-[0.1em] text-[var(--muted)]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset filters
            </button>
          ) : null}
        </form>
      </details>

      <form
        className="hidden space-y-4 xl:block"
        onSubmit={(event) => event.preventDefault()}
      >
        <SearchField filters={filters} onChange={onChange} />

        <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="type-mono text-[0.66rem] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
              State
            </span>
            <FilterChip
              active={filters.timing === LaunchTiming.All}
              onClick={() => onChange({ timing: LaunchTiming.All })}
            >
              All
            </FilterChip>
            <FilterChip
              active={filters.timing === LaunchTiming.Upcoming}
              onClick={() => onChange({ timing: LaunchTiming.Upcoming })}
            >
              Active
            </FilterChip>
            <FilterChip
              active={filters.timing === LaunchTiming.Past}
              onClick={() => onChange({ timing: LaunchTiming.Past })}
            >
              Closed
            </FilterChip>
          </div>

          <label className="flex min-w-0 items-center gap-2 text-sm text-[var(--muted)]">
            <span className="type-mono text-[0.66rem] font-medium uppercase tracking-[0.14em]">
              Category
            </span>
            <select
              value={filters.category}
              onChange={(event) => onChange({ category: event.target.value })}
              className="control-input control-select min-h-10 min-w-[13rem] px-3 text-[0.78rem]"
            >
              {eventCategoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap items-end gap-2">
            <span className="type-mono mb-2 text-[0.66rem] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
              Dates
            </span>
            <div className="w-[10.5rem]">
              <DateField
                label="From"
                value={filters.from}
                onChange={(from) => onChange({ from })}
              />
            </div>
            <div className="w-[10.5rem]">
              <DateField
                label="To"
                value={filters.to}
                onChange={(to) => onChange({ to })}
              />
            </div>
          </div>

          {hasAnyFilters ? (
            <button
              type="button"
              onClick={onClear}
              className="button-secondary type-mono ml-auto inline-flex min-h-10 items-center gap-1.5 rounded-[4px] border border-[var(--border)] px-3 text-[0.66rem] font-medium uppercase tracking-[0.1em] text-[var(--muted)]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          ) : null}
        </div>
      </form>
    </>
  );
}
