import { LaunchResult, LaunchSortOption, LaunchTiming, type LaunchesQueryParams } from "@/lib/api/query-builder";
import { sortLabels } from "./filter-bar";

export function ResultsToolbar({
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
