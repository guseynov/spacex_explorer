import type { LaunchesQueryParams } from "@/lib/api/query-builder";
import { LaunchResult, LaunchTiming } from "@/lib/api/query-builder";
import { FilterChip } from "./filter-chip";

export function TimingChips({
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
