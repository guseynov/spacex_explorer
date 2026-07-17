"use client";

import { useEffect, useState } from "react";
import {
  eventCategoryOptions,
  EventSortOption,
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
  showQueryControls?: boolean;
  showCategory?: boolean;
};

export function EventFilters({
  filters,
  onChange,
  showQueryControls = true,
  showCategory = true,
}: EventFiltersProps) {
  return (
    <div className="space-y-4">
      {showQueryControls ? <div className="grid gap-3">
        <label className="grid gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Search
          </span>
          <EventSearchField
            key={filters.search}
            initialValue={filters.search}
            onCommit={(search) => onChange({ search })}
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">
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
              {eventSortOptions.filter((option) => option !== EventSortOption.Severity).map((option) => (
                <SelectItem key={option} value={option}>
                  {getEventSortLabel(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      </div> : null}

      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground">
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
                  ? "Open"
                  : "Closed"}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {showCategory ? <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground">
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
      </div> : null}
    </div>
  );
}

type EventSearchInputProps = {
  initialValue: string;
  onCommit: (search: string) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
};

export function EventSearchField({
  initialValue,
  onCommit,
  className,
  disabled = false,
  placeholder = "Search events",
}: EventSearchInputProps) {
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
      disabled={disabled}
      value={draftSearch}
      onChange={(event) => setDraftSearch(event.target.value)}
      placeholder={placeholder}
      className={className}
    />
  );
}
