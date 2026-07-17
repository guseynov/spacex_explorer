"use client";

import { useEffect, useMemo, useState, type WheelEvent } from "react";
import Link from "next/link";
import { ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import { List, type RowComponentProps, useListRef } from "react-window";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Event, EventListPage } from "@/lib/api/event-schemas";
import {
  eventSortOptions,
  EventStatusFilter,
  getEventSortLabel,
  type EventListQueryParams,
} from "@/lib/api/event-query-builder";
import { formatEventDateOnly } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { getEventSourceDisplayName } from "../event-display";
import { getEventCategoryColor } from "../event-map-utils";
import { EventSearchField, EventFilters } from "./event-filters";
import { EventCategoryIcon } from "./event-category-icon";
import { EventCategoryPicker } from "./event-category-picker";

type EventSidePanelProps = {
  events: Event[];
  filters: EventListQueryParams;
  totalCount: EventListPage["count"];
  mirrorCount: number;
  selectedEventId: string | null;
  isLoading?: boolean;
  isSyncing?: boolean;
  isMapAreaFiltered?: boolean;
  onChangeFilters: (updates: Partial<EventListQueryParams>) => void;
  onResetFilters: () => void;
  onViewOnMap: (id: string) => void;
  onSyncData?: () => Promise<void> | void;
};

export function EventSidePanel({
  events,
  filters,
  totalCount,
  mirrorCount,
  selectedEventId,
  isLoading = false,
  isSyncing = false,
  isMapAreaFiltered = false,
  onChangeFilters,
  onResetFilters,
  onViewOnMap,
  onSyncData,
}: EventSidePanelProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const listRef = useListRef(null);
  const categorySelected = filters.category !== "all";
  const statusFilterActive = filters.status !== EventStatusFilter.All;
  const eventIndexById = useMemo(
    () => new Map(events.map((event, index) => [event.id, index])),
    [events],
  );
  const selectedEventIndex = selectedEventId
    ? eventIndexById.get(selectedEventId)
    : undefined;
  const hasEventsOutsideSearchedArea =
    isMapAreaFiltered && events.length === 0 && totalCount > 0;
  const rowProps = useMemo<ResultRowProps>(
    () => ({ events, selectedEventId, onSelectEvent: onViewOnMap }),
    [events, onViewOnMap, selectedEventId],
  );

  useEffect(() => {
    if (selectedEventIndex === undefined) {
      return;
    }

    listRef.current?.scrollToRow({
      index: selectedEventIndex,
      align: "smart",
      behavior: "instant",
    });
  }, [listRef, selectedEventIndex]);

  const handlePanelWheel = (event: WheelEvent<HTMLElement>) => {
    const panelElement = event.currentTarget;
    const listElement = listRef.current?.element;
    const scrollingDown = event.deltaY > 0;
    const panelCanScroll = scrollingDown
      ? panelElement.scrollTop + panelElement.clientHeight <
        panelElement.scrollHeight
      : panelElement.scrollTop > 0;

    if (
      !listElement ||
      listElement.contains(event.target as Node) ||
      panelCanScroll ||
      Math.abs(event.deltaY) <= Math.abs(event.deltaX)
    ) {
      return;
    }

    listElement.scrollBy({ top: event.deltaY, behavior: "auto" });
    event.preventDefault();
  };

  return (
    <aside
      aria-label="Event results"
      tabIndex={0}
      onWheel={handlePanelWheel}
      className="flex h-full min-h-0 flex-col overflow-x-hidden overflow-y-auto overscroll-contain bg-[var(--panel)] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
    >
      <EventCategoryPicker
        value={filters.category}
        onChange={(category) => onChangeFilters({ category, search: "" })}
      />

      <div className="shrink-0 space-y-3 border-b border-border px-3 py-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <EventSearchField
            key={filters.search}
            initialValue={filters.search}
            onCommit={(search) => onChangeFilters({ search })}
            className="pl-9"
            disabled={!categorySelected}
            placeholder={
              categorySelected ? "Search events" : "Choose a category first"
            }
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="mr-auto min-w-0 tabular-nums text-sm text-foreground">
            {categorySelected ? (
              <>
                <span className="font-semibold">
                  {events.length.toLocaleString()}
                </span>
                <span className="text-muted-foreground">
                  {isMapAreaFiltered
                    ? ` in area · ${totalCount.toLocaleString()} total`
                    : ` of ${totalCount.toLocaleString()} events`}
                </span>
              </>
            ) : (
              <span className="text-xs font-medium text-muted-foreground">
                Choose a category
              </span>
            )}
          </div>

          <Select
            value={filters.sort}
            disabled={!categorySelected}
            onValueChange={(value) =>
              onChangeFilters({ sort: value as EventListQueryParams["sort"] })
            }
          >
            <SelectTrigger
              aria-label="Sort events"
              className="h-9 w-[9.75rem] text-xs"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {eventSortOptions
                .filter((option) => option !== "severity")
                .map((option) => (
                  <SelectItem key={option} value={option}>
                    {getEventSortLabel(option)}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="relative"
              >
                <SlidersHorizontal className="size-4" />
                <span className="hidden sm:inline">Filters</span>
                {statusFilterActive ? (
                  <span className="flex size-5 items-center justify-center rounded-full bg-[var(--brand)] text-[0.68rem] text-primary-foreground">
                    1
                  </span>
                ) : null}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-[min(24rem,calc(100vw-1.5rem))] p-4"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-foreground">
                    Filter events
                  </h2>
                  <p className="mt-1 text-sm leading-5 text-muted-foreground">
                    Show open, closed, or all source records.
                  </p>
                </div>
                {statusFilterActive ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      onChangeFilters({ status: EventStatusFilter.All })
                    }
                  >
                    Reset
                  </Button>
                ) : null}
              </div>
              <EventFilters
                filters={filters}
                onChange={onChangeFilters}
                showQueryControls={false}
                showCategory={false}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="min-h-64 flex-1 shrink-0">
        {!categorySelected ? (
          <CategorySelectionPrompt />
        ) : isLoading && events.length === 0 ? (
          <ResultsSkeleton />
        ) : events.length === 0 ? (
          <EmptyState
            title="No events in this area"
            description={
              mirrorCount === 0
                ? "The local event mirror is empty. Sync it once to load the map and timeline."
                : hasEventsOutsideSearchedArea
                  ? "No events are in the searched map area. Move the map, then choose Search in this area."
                  : "No mirrored events match this category, status, and date range. Try a wider date range or reset the filters."
            }
            action={
              mirrorCount === 0 ? (
                onSyncData ? (
                  <Button
                    type="button"
                    disabled={isSyncing}
                    onClick={() => void onSyncData()}
                  >
                    {isSyncing ? "Syncing events" : "Sync event data"}
                  </Button>
                ) : undefined
              ) : hasEventsOutsideSearchedArea ? undefined : (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onResetFilters}
                >
                  Reset filters
                </Button>
              )
            }
          />
        ) : (
          <List
            aria-label="Scrollable event list"
            tabIndex={0}
            listRef={listRef}
            rowComponent={EventResultRow}
            rowCount={events.length}
            rowHeight={92}
            rowProps={rowProps}
            overscanCount={4}
            defaultHeight={560}
            className="event-results-scroll h-full outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
          />
        )}
      </div>
    </aside>
  );
}

type ResultRowProps = {
  events: Event[];
  selectedEventId: string | null;
  onSelectEvent: (id: string) => void;
};

function EventResultRow({
  index,
  style,
  ariaAttributes,
  events,
  selectedEventId,
  onSelectEvent,
}: RowComponentProps<ResultRowProps>) {
  const event = events[index];
  const selected = event.id === selectedEventId;
  const categoryColor = getEventCategoryColor(event.categoryId);

  return (
    <div style={style} {...ariaAttributes} className="px-2 pt-2">
      <div
        className={cn(
          "group flex h-[84px] w-full items-center gap-3 rounded-lg border px-3 text-left transition-colors",
          selected
            ? "border-[var(--brand)] bg-[var(--brand-soft)]"
            : "border-transparent bg-transparent hover:border-border hover:bg-[var(--surface-strong)]",
        )}
      >
        <button
          type="button"
          aria-label={`Select ${event.title}`}
          aria-pressed={selected}
          onClick={() => onSelectEvent(event.id)}
          className="flex min-w-0 flex-1 items-center gap-3 self-stretch text-left focus-visible:outline-none"
        >
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-md"
            style={{
              color: categoryColor,
              backgroundColor: `${categoryColor}12`,
            }}
          >
            <EventCategoryIcon
              categoryId={event.categoryId}
              className="size-[1.1rem]"
            />
          </span>
          <span className="min-w-0 flex-1">
            <span className="line-clamp-2 text-sm font-semibold leading-5 text-foreground">
              {event.title}
            </span>
            <span className="mt-1 flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
              <time
                dateTime={event.latestDate}
                className="shrink-0 whitespace-nowrap tabular-nums"
              >
                {formatEventDateOnly(event.latestDate)}
              </time>
              <span aria-hidden="true" className="shrink-0">
                ·
              </span>
              <span
                className="min-w-0 flex-1 truncate"
                title={getEventSourceDisplayName(event.sourceLabel)}
              >
                {getEventSourceDisplayName(event.sourceLabel)}
              </span>
            </span>
          </span>
        </button>
        <Link
          href={`/events/${encodeURIComponent(event.id)}`}
          aria-label={`View details for ${event.title}`}
          title="View event details"
          className="flex size-10 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronRight
            className={cn(
              "size-4 transition-transform",
              selected && "translate-x-0.5 text-[var(--brand)]",
            )}
          />
        </Link>
      </div>
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="space-y-2 p-2" aria-label="Loading events">
      {Array.from({ length: 7 }).map((_, index) => (
        <div
          key={index}
          className="h-[84px] animate-pulse rounded-lg bg-[var(--surface-strong)]"
        />
      ))}
    </div>
  );
}

function CategorySelectionPrompt() {
  return (
    <div className="flex h-full min-h-40 items-center justify-center px-6 py-10 text-center">
      <div className="max-w-64">
        <div aria-hidden="true" className="text-2xl">
          🗺️
        </div>
        <h2 className="mt-3 text-sm font-semibold text-foreground">
          Choose what to explore
        </h2>
        <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
          Select a category above to load its events. The map remains available
          for a global overview.
        </p>
      </div>
    </div>
  );
}
