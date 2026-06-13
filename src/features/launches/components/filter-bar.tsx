"use client";

import { CalendarRange, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import {
  defaultLaunchFilters,
  LaunchResult,
  LaunchSortOption,
  LaunchTiming,
  type LaunchesQueryParams,
  type ResultFilter,
} from "@/lib/api/query-builder";

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

function FilterControls({
  filters,
  onChange,
  onClear,
  hasAnyFilters,
  showHeader,
}: {
  filters: LaunchesQueryParams;
  onChange: (next: Partial<LaunchesQueryParams>) => void;
  onClear: () => void;
  hasAnyFilters: boolean;
  showHeader: boolean;
}) {
  return (
    <>
      {showHeader ? (
      <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-4 py-4 sm:px-5">
        <div className="flex gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[var(--accent-soft)] text-[var(--accent-strong)]">
            <SlidersHorizontal className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-[0.9rem] font-semibold text-foreground">Query console</h2>
            <p className="mt-0.5 text-[0.75rem] text-[var(--muted)]">
              Narrow the launch manifest
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClear}
          disabled={!hasAnyFilters}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-[8px] px-2.5 text-[0.76rem] font-semibold text-[var(--muted)] transition-colors hover:bg-[var(--surface-strong)] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-35"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>
      ) : hasAnyFilters ? (
        <div className="flex justify-end border-t border-[var(--border)] px-4 py-2">
          <button
            type="button"
            onClick={onClear}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-[8px] px-2.5 text-[0.76rem] font-semibold text-[var(--muted)] transition-colors hover:bg-[var(--surface-strong)] hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset filters
          </button>
        </div>
      ) : null}

      <div className="space-y-5 px-4 py-5 sm:px-5">
        <SearchField filters={filters} onChange={onChange} />

        <fieldset className="space-y-2.5">
          <legend className="mb-2.5 text-[0.75rem] font-medium text-[var(--muted)]">
            Mission timing
          </legend>
          <TimingChips filters={filters} onChange={onChange} />
        </fieldset>
      </div>

      <div className="space-y-5 border-t border-[var(--border)] bg-[rgba(255,255,255,0.012)] px-4 py-5 sm:px-5">
        <fieldset className="space-y-2.5">
          <legend className="mb-2.5 text-[0.75rem] font-medium text-[var(--muted)]">
            Mission outcome
          </legend>
          <ResultChips filters={filters} onChange={onChange} />
        </fieldset>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[0.75rem] font-medium text-[var(--muted)]">
            <CalendarRange className="h-3.5 w-3.5" />
            Launch window
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
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
        </div>
      </div>
    </>
  );
}

function SearchField({
  filters,
  onChange,
}: {
  filters: LaunchesQueryParams;
  onChange: (next: Partial<LaunchesQueryParams>) => void;
}) {
  return (
    <label className="block space-y-2.5">
      <span className="text-[0.75rem] font-medium text-[var(--muted)]">Mission search</span>
      <span className="relative block">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
        <input
          type="search"
          name="search"
          value={filters.search}
          onChange={(event) => onChange({ search: event.target.value })}
          placeholder="Search mission name"
          className="control-input min-h-11 w-full pr-4 pl-10 text-sm"
        />
      </span>
    </label>
  );
}

function TimingChips({
  filters,
  onChange,
}: {
  filters: LaunchesQueryParams;
  onChange: (next: Partial<LaunchesQueryParams>) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <FilterChip
        active={filters.timing === LaunchTiming.All}
        onClick={() => onChange({ timing: LaunchTiming.All })}
      >
        All
      </FilterChip>
      <FilterChip
        active={filters.timing === LaunchTiming.Upcoming}
        onClick={() =>
          onChange({ timing: LaunchTiming.Upcoming, result: LaunchResult.All })
        }
      >
        Upcoming
      </FilterChip>
      <FilterChip
        active={filters.timing === LaunchTiming.Past}
        onClick={() => onChange({ timing: LaunchTiming.Past })}
      >
        Past
      </FilterChip>
    </div>
  );
}

function ResultChips({
  filters,
  onChange,
}: {
  filters: LaunchesQueryParams;
  onChange: (next: Partial<LaunchesQueryParams>) => void;
}) {
  const disabled = filters.timing === LaunchTiming.Upcoming;

  return (
    <div className="grid grid-cols-3 gap-2">
      <FilterChip
        active={filters.result === LaunchResult.All}
        disabled={disabled}
        onClick={() => onChange({ result: LaunchResult.All })}
      >
        All
      </FilterChip>
      <FilterChip
        active={filters.result === LaunchResult.Success}
        disabled={disabled}
        onClick={() => onChange({ result: LaunchResult.Success as ResultFilter })}
      >
        Success
      </FilterChip>
      <FilterChip
        active={filters.result === LaunchResult.Failure}
        disabled={disabled}
        onClick={() => onChange({ result: LaunchResult.Failure as ResultFilter })}
      >
        Failure
      </FilterChip>
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-[0.7rem] font-medium text-[var(--muted)]">{label}</span>
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="control-input min-h-11 w-full px-3 text-[0.82rem]"
      />
    </label>
  );
}

function FilterChip({
  active,
  disabled = false,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={active}
      data-active={active ? "true" : "false"}
      onClick={onClick}
      className={`filter-chip ${active ? "filter-chip-active" : ""}`}
    >
      {children}
    </button>
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
