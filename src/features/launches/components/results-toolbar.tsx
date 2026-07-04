import {
  getActiveLaunchFilterLabels,
  type LaunchesQueryParams,
} from "@/lib/api/query-builder";

export function ResultsToolbar({
  filters,
  onReset,
}: {
  filters: LaunchesQueryParams;
  onReset: () => void;
}) {
  const activeFilters = getActiveLaunchFilterLabels(filters);

  return (
    <div className="flex flex-col gap-4 px-0 py-0">
      <div className="flex min-h-8 flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {activeFilters.length > 0 ? (
            activeFilters.map((label) => (
              <span
                key={label}
                className="type-mono inline-flex items-center rounded-[3px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-2.5 py-1 text-[0.62rem] font-medium uppercase tracking-[0.08em] text-[var(--info)]"
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
            className="button-secondary type-mono self-start px-2.5 py-1.5 text-[0.62rem] font-medium uppercase tracking-[0.1em] text-[var(--muted)] sm:self-auto"
          >
            Reset all filters
          </button>
        ) : null}
      </div>
    </div>
  );
}
