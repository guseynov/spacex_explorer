"use client";

import { useEffect, useState } from "react";
import {
  eventCategoryOptions,
  eventSortOptions,
  EventStatusFilter,
  getEventCategoryLabel,
  getEventSortLabel,
  type EventListQueryParams,
} from "@/lib/api/event-query-builder";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type EventFiltersProps = {
  filters: EventListQueryParams;
  onChange: (updates: Partial<EventListQueryParams>) => void;
};

export function EventFilters({ filters, onChange }: EventFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        <label className="grid gap-1.5">
          <span className="text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Search
          </span>
          <EventSearchInput
            key={filters.search}
            initialValue={filters.search}
            onCommit={(search) => onChange({ search })}
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Sort
          </span>
          <Select
            value={filters.sort}
            onValueChange={(value) =>
              onChange({ sort: value as EventListQueryParams["sort"] })
            }
          >
            <SelectTrigger aria-label="Sort events">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {eventSortOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {getEventSortLabel(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      </div>

      <div className="space-y-2">
        <div className="text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Status
        </div>
        <ToggleGroup
          type="single"
          value={filters.status}
          onValueChange={(status) => {
            if (status) {
              onChange({ status: status as EventListQueryParams["status"] });
            }
          }}
        >
          {[
            EventStatusFilter.All,
            EventStatusFilter.Active,
            EventStatusFilter.Closed,
          ].map((status) => (
            <ToggleGroupItem
              key={status}
              value={status}
            >
              {status === EventStatusFilter.All
                ? "All"
                : status === EventStatusFilter.Active
                  ? "Active"
                  : "Closed"}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="space-y-2">
        <div className="text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Category
        </div>
        <ToggleGroup
          type="single"
          value={filters.category}
          onValueChange={(category) => {
            if (category) {
              onChange({ category: category as EventListQueryParams["category"] });
            }
          }}
        >
          {eventCategoryOptions.map((category) => (
            <ToggleGroupItem
              key={category.value}
              value={category.value}
              title={getEventCategoryLabel(category.value)}
            >
              {category.value === "all"
                ? "All"
                : category.label.replace("All categories", "All")}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
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
    <Input
      aria-label="Event search"
      value={draftSearch}
      onChange={(event) => setDraftSearch(event.target.value)}
      placeholder="Search events"
    />
  );
}
