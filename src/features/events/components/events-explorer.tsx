"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, List, Map } from "lucide-react";
import type { EventListPage } from "@/lib/api/event-schemas";
import { fetchEventsPage } from "@/lib/api/event-client";
import { getTimelineDomain, type EventListQueryParams } from "@/lib/api/event-query-builder";
import {
  filterVisibleRangeEvents,
} from "@/lib/api/event-data-utils";
import { RetryState } from "@/components/retry-state";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { EventsMap } from "./events-map";
import { EventSidePanel } from "./event-side-panel";
import { TimelineRangeSlider } from "./timeline-range-slider";
import { useEventFilters } from "../use-event-filters";

type EventsExplorerProps = {
  initialData: EventListPage;
  initialRangeFilters: EventListQueryParams;
};

export function EventsExplorer({
  initialData,
  initialRangeFilters,
}: EventsExplorerProps) {
  const { filters, setFilters, resetFilters } = useEventFilters();
  const [mobileView, setMobileView] = useState<"map" | "list">("map");
  const [focusRequest, setFocusRequest] = useState<{
    id: string;
    token: number;
    scopeToken: symbol;
  } | null>(null);
  const [searchedArea, setSearchedArea] = useState<{
    scopeToken: symbol;
    eventIds: string[];
  } | null>(null);
  const [isSyncingData, setIsSyncingData] = useState(false);
  const timelineDomain = useMemo(() => {
    const domain = getTimelineDomain();

    return {
      from: domain.min,
      to: domain.max,
    };
  }, []);
  const rangeFilters = useMemo(
    () => ({
      ...filters,
      search: "",
      sort: "newest" as const,
    }),
    [filters],
  );
  const currentRangeKey = [
    rangeFilters.status,
    rangeFilters.category,
    rangeFilters.from,
    rangeFilters.to,
  ].join(":");
  const initialRangeKey = [
    initialRangeFilters.status,
    initialRangeFilters.category,
    initialRangeFilters.from,
    initialRangeFilters.to,
  ].join(":");
  const rangeQuery = useQuery({
    queryKey: [
      "events-range",
      rangeFilters.status,
      rangeFilters.category,
      rangeFilters.from,
      rangeFilters.to,
    ],
    queryFn: () => fetchEventsPage(rangeFilters, 1),
    initialData: currentRangeKey === initialRangeKey ? initialData : undefined,
    placeholderData: (previousData) => previousData,
    staleTime: 300_000,
    gcTime: 900_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const visibleSourceEvents = useMemo(
    () => rangeQuery.data?.results ?? initialData.results ?? [],
    [initialData.results, rangeQuery.data],
  );
  const events = useMemo(
    () => filterVisibleRangeEvents(visibleSourceEvents, filters),
    [filters, visibleSourceEvents],
  );
  const mapScopeToken = useMemo(
    () => Symbol([
      filters.status,
      filters.category,
      filters.from,
      filters.to,
      filters.search,
    ].join(":")),
    [
      filters.status,
      filters.category,
      filters.from,
      filters.to,
      filters.search,
    ],
  );
  const activeFocusRequest = useMemo(
    () => focusRequest?.scopeToken === mapScopeToken
      ? { id: focusRequest.id, token: focusRequest.token }
      : null,
    [focusRequest, mapScopeToken],
  );
  const totalFilteredEvents = rangeQuery.isPlaceholderData
    ? events.length
    : rangeQuery.data?.count ?? visibleSourceEvents.length;
  const mirrorEventCount =
    rangeQuery.data?.summary?.mirrorCount
    ?? initialData.summary?.mirrorCount
    ?? 0;
  const activeSelectedEventId = useMemo(
    () =>
      activeFocusRequest
      && events.some((event) => event.id === activeFocusRequest.id)
        ? activeFocusRequest.id
        : null,
    [activeFocusRequest, events],
  );
  const searchedAreaEventIds = searchedArea?.scopeToken === mapScopeToken
    ? searchedArea.eventIds
    : null;
  const searchedAreaEventIdSet = useMemo(
    () => searchedAreaEventIds ? new Set(searchedAreaEventIds) : null,
    [searchedAreaEventIds],
  );
  const eventsInSearchedArea = useMemo(
    () => searchedAreaEventIdSet
      ? events.filter((event) => searchedAreaEventIdSet.has(event.id))
      : events,
    [events, searchedAreaEventIdSet],
  );
  const handleSearchArea = useCallback((eventIds: string[]) => {
    setSearchedArea((previousArea) => {
      if (
        previousArea?.scopeToken === mapScopeToken
        && previousArea.eventIds.length === eventIds.length
        && previousArea.eventIds.every((id, index) => id === eventIds[index])
      ) {
        return previousArea;
      }

      return {
        scopeToken: mapScopeToken,
        eventIds,
      };
    });
  }, [mapScopeToken]);

  const handleTimelineChange = (
    range: Pick<EventListQueryParams, "from" | "to">,
  ) => {
    setFilters(range);
  };

  const selectAndCenterEvent = (id: string) => {
    setFocusRequest((previousRequest) => ({
      id,
      token: (previousRequest?.token ?? 0) + 1,
      scopeToken: mapScopeToken,
    }));
  };

  const handleViewOnMap = (id: string) => {
    selectAndCenterEvent(id);
    setMobileView("map");
  };

  const handleSyncData = async () => {
    if (isSyncingData) {
      return;
    }

    setIsSyncingData(true);

    try {
      const response = await fetch("/api/events/sync", {
        method: "POST",
        headers: {
          accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Sync failed with status ${response.status}.`);
      }

      window.location.reload();
    } finally {
      setIsSyncingData(false);
    }
  };

  if (rangeQuery.error && !rangeQuery.data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <RetryState
          message="Could not load the Earth event feed."
          onRetry={() => rangeQuery.refetch()}
        />
      </div>
    );
  }

  return (
    <section className="relative h-[calc(100dvh-3.5rem)] overflow-hidden bg-background">
      <div className="absolute inset-0 lg:right-[25rem]">
        <EventsMap
          events={events}
          selectedEventId={activeSelectedEventId}
          focusRequest={activeFocusRequest}
          fitScopeToken={mapScopeToken}
          isLoading={rangeQuery.isFetching}
          onSelectEvent={selectAndCenterEvent}
          onSearchArea={handleSearchArea}
        />
      </div>

      <div className="absolute bottom-4 left-[var(--map-overlay-gutter)] right-[26rem] z-20 hidden lg:block">
        <TimelineRangeSlider
          key={`${filters.from}:${filters.to}`}
          domain={timelineDomain}
          value={{ from: filters.from, to: filters.to }}
          eventCount={totalFilteredEvents}
          isPending={rangeQuery.isFetching && !rangeQuery.data}
          onChange={handleTimelineChange}
        />
      </div>

      <div
        className={cn(
          "absolute inset-0 z-20 bg-[var(--panel)] lg:left-auto lg:w-[25rem] lg:border-l lg:border-border",
          mobileView === "list" ? "block" : "hidden lg:block",
        )}
      >
        <EventSidePanel
          events={eventsInSearchedArea}
          filters={filters}
          totalCount={totalFilteredEvents}
          mirrorCount={mirrorEventCount}
          selectedEventId={activeSelectedEventId}
          isLoading={rangeQuery.isFetching && !rangeQuery.data}
          isSyncing={isSyncingData}
          isMapAreaFiltered={searchedAreaEventIds !== null}
          onChangeFilters={setFilters}
          onResetFilters={resetFilters}
          onViewOnMap={handleViewOnMap}
          onSyncData={handleSyncData}
        />
      </div>

      <div className="absolute bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-lg border border-border bg-[var(--panel-strong)] p-1 shadow-lg lg:hidden">
        <Button
          type="button"
          variant={mobileView === "map" ? "default" : "ghost"}
          size="sm"
          aria-pressed={mobileView === "map"}
          onClick={() => setMobileView("map")}
        >
          <Map className="size-4" />
          Map
        </Button>
        <Button
          type="button"
          variant={mobileView === "list" ? "default" : "ghost"}
          size="sm"
          aria-pressed={mobileView === "list"}
          onClick={() => setMobileView("list")}
        >
          <List className="size-4" />
          List
          <span className="tabular-nums">
            {eventsInSearchedArea.length.toLocaleString()}
          </span>
        </Button>
        <Sheet>
          <SheetTrigger asChild>
            <Button type="button" variant="ghost" size="sm">
              <CalendarDays className="size-4" />
              Time
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="gap-3 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <SheetHeader className="px-1 pr-10">
              <SheetTitle>Choose a date range</SheetTitle>
              <SheetDescription>
                The map and results update when the range changes.
              </SheetDescription>
            </SheetHeader>
            <TimelineRangeSlider
              key={`mobile:${filters.from}:${filters.to}`}
              domain={timelineDomain}
              value={{ from: filters.from, to: filters.to }}
              eventCount={totalFilteredEvents}
              isPending={rangeQuery.isFetching && !rangeQuery.data}
              onChange={handleTimelineChange}
            />
          </SheetContent>
        </Sheet>
      </div>
    </section>
  );
}
