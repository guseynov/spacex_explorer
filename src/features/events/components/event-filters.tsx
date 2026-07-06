"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";
import {
  eventCategoryOptions,
  eventSortOptions,
  EventStatusFilter,
  getEventCategoryLabel,
  getEventSortLabel,
  type EventListQueryParams,
} from "@/lib/api/event-query-builder";

type EventFiltersProps = {
  filters: EventListQueryParams;
  onChange: (updates: Partial<EventListQueryParams>) => void;
};

export function EventFilters({ filters, onChange }: EventFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        <label className="grid gap-1.5">
          <span className="type-mono text-[0.6rem] uppercase tracking-[0.16em] text-[var(--muted)]">
            Search
          </span>
          <EventSearchInput
            key={filters.search}
            initialValue={filters.search}
            onCommit={(search) => onChange({ search })}
          />
        </label>

        <label className="grid gap-1.5">
          <span className="type-mono text-[0.6rem] uppercase tracking-[0.16em] text-[var(--muted)]">
            Sort
          </span>
          <select
            aria-label="Sort events"
            value={filters.sort}
            onChange={(event) =>
              onChange({ sort: event.target.value as EventListQueryParams["sort"] })
            }
            className="control-input control-select min-h-11 w-full px-3 text-sm"
          >
            {eventSortOptions.map((option) => (
              <option key={option} value={option}>
                {getEventSortLabel(option)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="space-y-2">
        <div className="type-mono text-[0.6rem] uppercase tracking-[0.16em] text-[var(--muted)]">
          Status
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            EventStatusFilter.All,
            EventStatusFilter.Active,
            EventStatusFilter.Closed,
          ].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => onChange({ status })}
              className={clsx(
                "filter-chip",
                filters.status === status && "filter-chip-active",
              )}
            >
              {status === EventStatusFilter.All
                ? "All"
                : status === EventStatusFilter.Active
                  ? "Active"
                  : "Closed"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="type-mono text-[0.6rem] uppercase tracking-[0.16em] text-[var(--muted)]">
          Category
        </div>
        <div className="flex flex-wrap gap-2">
          {eventCategoryOptions.map((category) => (
            <button
              key={category.value}
              type="button"
              onClick={() => onChange({ category: category.value })}
              className={clsx(
                "filter-chip",
                filters.category === category.value && "filter-chip-active",
              )}
              title={getEventCategoryLabel(category.value)}
            >
              {category.value === "all"
                ? "All"
                : category.label.replace("All categories", "All")}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

type EventSearchInputProps = {
  initialValue: string;
  onCommit: (search: string) => void;
};

function EventSearchInput({ initialValue, onCommit }: EventSearchInputProps) {
  const [draftSearch, setDraftSearch] = useState(initialValue);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (draftSearch !== initialValue) {
        onCommit(draftSearch);
      }
    }, 180);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [draftSearch, initialValue, onCommit]);

  return (
    <input
      aria-label="Event search"
      value={draftSearch}
      onChange={(event) => setDraftSearch(event.target.value)}
      placeholder="Search events"
      className="control-input min-h-11 w-full px-3 text-sm"
    />
  );
}
