"use client";

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
  const mobileSummary = getMobileFilterSummary(filters);
  const hasMobileSummary = mobileSummary.length > 0;
  const hasAnyFilters = hasActiveFilters(filters);

  return (
    <>
      <form
        className="flex flex-col gap-3 xl:hidden"
        onSubmit={(event) => event.preventDefault()}
      >
        <section className="control-shell px-4 py-4">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-[0.92rem] font-semibold tracking-[-0.01em] text-[var(--info)]">
                Find launches
              </p>
            </div>
            {hasAnyFilters ? (
              <button
                type="button"
                onClick={onClear}
                className="button-secondary shrink-0 px-3 py-2 text-sm font-semibold transition"
              >
                Reset
              </button>
            ) : null}
          </div>
          <div className="flex flex-col gap-6">
            <SearchField filters={filters} onChange={onChange} />
            <div className="flex flex-col gap-3.5">
              <span className="text-[0.78rem] font-medium text-[var(--muted)]">
                Timing
              </span>
              <TimingChips filters={filters} onChange={onChange} />
            </div>
          </div>
        </section>

        <details className="control-shell group overflow-hidden">
          <summary className="flex cursor-pointer list-none flex-col gap-3 px-4 py-4 [&::-webkit-details-marker]:hidden">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[0.92rem] font-semibold tracking-[-0.01em] text-[var(--info)]">
                More filters
              </p>
              <div className="text-sm font-medium text-[var(--muted)]">
                <span className="group-open:hidden">Open</span>
                <span className="hidden group-open:inline">Close</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {hasMobileSummary ? (
                mobileSummary.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--background-strong)] px-3 py-1.5 text-[0.82rem] font-medium text-[var(--info)]"
                  >
                    {item}
                  </span>
                ))
              ) : (
                <span className="text-[0.82rem] text-[var(--muted)]">No extra filters applied yet.</span>
              )}
            </div>
          </summary>
          <div className="flex flex-col gap-5 border-t border-[var(--border)] px-4 py-4">
            <p className="text-[0.88rem] font-semibold tracking-[-0.01em] text-foreground">
              Result and date
            </p>
            <FilterFields
              filters={filters}
              onChange={onChange}
              fieldNames={["result", "from", "to"]}
            />
            {hasMobileSummary ? (
              <button
                type="button"
                onClick={onClear}
                className="button-secondary min-h-11 w-full px-4 py-3 text-sm font-semibold transition"
              >
                Clear extra filters
              </button>
            ) : null}
          </div>
        </details>
      </form>

      <details
        className="control-shell group hidden overflow-hidden xl:block xl:w-fit xl:max-w-full xl:transition-[width] xl:duration-200 xl:ease-out xl:open:w-full"
        open
      >
        <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-5 sm:px-6 [&::-webkit-details-marker]:hidden">
          <p className="text-[0.92rem] font-semibold tracking-[-0.01em] text-[var(--info)]">
            Launch filters
          </p>
          <div className="shrink-0 text-sm font-medium text-[var(--muted)]">
            <span className="group-open:hidden">Show</span>
            <span className="hidden group-open:inline">Hide</span>
          </div>
        </summary>

        <form
          className="flex flex-col gap-6 border-t border-[var(--border)] px-5 py-5 sm:px-6"
          onSubmit={(event) => event.preventDefault()}
        >
          <section className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-[0.95rem] font-semibold tracking-[-0.01em] text-foreground">
                Find a launch
              </h2>
              <button
                type="button"
                onClick={onClear}
                className="button-secondary px-4 py-2 text-sm font-semibold transition"
              >
                Reset
              </button>
            </div>
            <SearchField filters={filters} onChange={onChange} />
            <div className="flex flex-col gap-3.5">
              <span className="text-[0.78rem] font-medium text-[var(--muted)]">
                Timing
              </span>
              <TimingChips filters={filters} onChange={onChange} />
            </div>
          </section>

          <section className="flex flex-col gap-4 border-t border-[var(--border)] pt-5">
            <h2 className="text-[0.95rem] font-semibold tracking-[-0.01em] text-foreground">
              Refine the set
            </h2>
            <FilterFields
              filters={filters}
              onChange={onChange}
              fieldNames={["result", "from", "to"]}
            />
          </section>
        </form>
      </details>
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
    <label className="flex flex-col gap-4">
      <span className="text-[0.78rem] font-medium text-[var(--muted)]">
        Mission search
      </span>
      <input
        type="search"
        name="search"
        value={filters.search}
        onChange={(event) => onChange({ search: event.target.value })}
        placeholder="Enter a mission name"
        className="control-input w-full px-4 py-3 text-sm"
      />
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
          onChange({
            timing: LaunchTiming.Upcoming,
            result: LaunchResult.All,
          })}
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

function FilterFields({
  filters,
  onChange,
  fieldNames = ["result", "from", "to"],
}: {
  filters: LaunchesQueryParams;
  onChange: (next: Partial<LaunchesQueryParams>) => void;
  fieldNames?: Array<"result" | "from" | "to">;
}) {
  const showField = (name: (typeof fieldNames)[number]) => fieldNames.includes(name);

  return (
    <div className="grid gap-6">
      {showField("result") ? (
        <div className="flex flex-col gap-4">
          <span className="text-[0.78rem] font-medium text-[var(--muted)]">
            Result
          </span>
          <div className="grid grid-cols-3 gap-2">
            <FilterChip
              active={filters.result === LaunchResult.All}
              disabled={filters.timing === LaunchTiming.Upcoming}
              onClick={() => onChange({ result: LaunchResult.All })}
            >
              All
            </FilterChip>
            <FilterChip
              active={filters.result === LaunchResult.Success}
              disabled={filters.timing === LaunchTiming.Upcoming}
              onClick={() => onChange({ result: LaunchResult.Success as ResultFilter })}
            >
              Success
            </FilterChip>
            <FilterChip
              active={filters.result === LaunchResult.Failure}
              disabled={filters.timing === LaunchTiming.Upcoming}
              onClick={() => onChange({ result: LaunchResult.Failure as ResultFilter })}
            >
              Failure
            </FilterChip>
          </div>
        </div>
      ) : null}

      {showField("from") || showField("to") ? (
        <div className="flex flex-col gap-4">
          <span className="text-[0.78rem] font-medium text-[var(--muted)]">
            Launch window
          </span>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {showField("from") ? (
              <label className="flex flex-col gap-4">
                <span className="text-[0.76rem] font-medium text-[var(--muted)]">
                  From
                </span>
                <input
                  type="date"
                  value={filters.from}
                  onChange={(event) => onChange({ from: event.target.value })}
                  className="control-input w-full px-4 py-3 text-sm"
                />
              </label>
            ) : null}
            {showField("to") ? (
              <label className="flex flex-col gap-4">
                <span className="text-[0.76rem] font-medium text-[var(--muted)]">
                  To
                </span>
                <input
                  type="date"
                  value={filters.to}
                  onChange={(event) => onChange({ to: event.target.value })}
                  className="control-input w-full px-4 py-3 text-sm"
                />
              </label>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
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

function getMobileFilterSummary(filters: LaunchesQueryParams) {
  const items: string[] = [];

  if (filters.result === LaunchResult.Success) {
    items.push("Success");
  } else if (filters.result === LaunchResult.Failure) {
    items.push("Failure");
  }

  if (filters.from || filters.to) {
    items.push("Date range");
  }

  return items;
}

export const sortLabels = {
  [LaunchSortOption.DateDesc]: "Newest first",
  [LaunchSortOption.DateAsc]: "Oldest first",
  [LaunchSortOption.NameAsc]: "Mission name: A-Z",
  [LaunchSortOption.NameDesc]: "Mission name: Z-A",
} as const;
