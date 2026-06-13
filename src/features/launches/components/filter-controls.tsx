import { CalendarRange, RotateCcw, SlidersHorizontal } from "lucide-react";
import type { LaunchesQueryParams } from "@/lib/api/query-builder";
import { DateField } from "./date-field";
import { ResultChips } from "./result-chips";
import { SearchField } from "./search-field";
import { TimingChips } from "./timing-chips";

export function FilterControls({
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
