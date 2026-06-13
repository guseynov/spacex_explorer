import { Search } from "lucide-react";
import type { LaunchesQueryParams } from "@/lib/api/query-builder";

export function SearchField({
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
