import type { LaunchesQueryParams, ResultFilter } from "@/lib/api/query-builder";
import { LaunchResult, LaunchTiming } from "@/lib/api/query-builder";
import { FilterChip } from "./filter-chip";

export function ResultChips({
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
