"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { EventListPage } from "@/lib/api/event-schemas";
import { fetchEventTimeline, fetchEventsPage } from "@/lib/api/event-client";
import { getTimelineDomain, type EventListQueryParams } from "@/lib/api/event-query-builder";
import {
  filterVisibleRangeEvents,
} from "@/lib/api/event-data-utils";
import { RetryState } from "@/components/retry-state";
import { CategoryLegend } from "./category-legend";
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
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [focusRequest, setFocusRequest] = useState<{
    id: string;
    token: number;
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
  const timelineQuery = useQuery({
    queryKey: [
      "events-timeline",
      filters.status,
      filters.category,
      timelineDomain.from,
      timelineDomain.to,
    ],
    queryFn: () =>
      fetchEventTimeline({
        status: filters.status,
        category: filters.category,
        from: timelineDomain.from,
        to: timelineDomain.to,
        bucket: "day",
      }),
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
  const totalVisibleEvents = rangeQuery.data?.count ?? visibleSourceEvents.length;
  const summary = rangeQuery.data?.summary ?? initialData.summary ?? null;
  const activeSelectedEventId = useMemo(
    () =>
      selectedEventId && events.some((event) => event.id === selectedEventId)
        ? selectedEventId
        : null,
    [events, selectedEventId],
  );

  const histogram = useMemo(
    () =>
      timelineQuery.data
        ? buildHistogramFromBuckets(
          timelineQuery.data.buckets,
          timelineDomain.from,
          timelineDomain.to,
          36,
        )
        : summary?.histogram ?? [],
    [summary?.histogram, timelineDomain.from, timelineDomain.to, timelineQuery.data],
  );

  const handleTimelineChange = (
    range: Pick<EventListQueryParams, "from" | "to">,
  ) => {
    setFilters(range);
  };

  const handleViewOnMap = (id: string) => {
    setSelectedEventId(id);
    setFocusRequest({ id, token: Date.now() });
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
      <RetryState
        message="Could not load the Earth event feed."
        onRetry={() => rangeQuery.refetch()}
      />
    );
  }

  return (
    <section className="relative min-h-[calc(100dvh-8.5rem)] overflow-hidden rounded-[1.35rem] border border-[var(--border)] bg-[radial-gradient(circle_at_top,rgba(68,144,245,0.16),transparent_32rem),linear-gradient(180deg,#040910_0%,#050913_45%,#050913_100%)]">
      <div className="absolute inset-0">
        <EventsMap
          events={events}
          selectedEventId={activeSelectedEventId}
          focusRequest={focusRequest}
          isLoading={rangeQuery.isFetching}
          onSelectEvent={setSelectedEventId}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(147,197,253,0.08),transparent_24rem)]" />

      <div className="absolute left-3 right-3 top-3 z-20 md:right-[28rem]">
        <TimelineRangeSlider
          key={`${filters.from}:${filters.to}`}
          domain={timelineDomain}
          value={{ from: filters.from, to: filters.to }}
          histogram={histogram}
          eventCount={totalVisibleEvents}
          isPending={(rangeQuery.isFetching && !rangeQuery.data) || timelineQuery.isFetching}
          onChange={handleTimelineChange}
        />
      </div>

      <div className="absolute inset-x-3 bottom-3 z-20 top-[10.75rem] md:inset-y-3 md:left-auto md:w-[26rem]">
        <EventSidePanel
          events={events}
          filters={filters}
          totalCount={totalVisibleEvents}
          selectedEventId={activeSelectedEventId}
          isLoading={rangeQuery.isFetching && !rangeQuery.data}
          isSyncing={isSyncingData}
          onChangeFilters={setFilters}
          onResetFilters={resetFilters}
          onViewOnMap={handleViewOnMap}
          onSyncData={handleSyncData}
        />
      </div>

      <div className="absolute bottom-3 left-3 z-20 hidden md:block">
        <CategoryLegend />
      </div>
    </section>
  );
}

function buildHistogramFromBuckets(
  buckets: Array<{ bucket: string; count: number }>,
  from: string,
  to: string,
  bins: number,
) {
  const histogram = new Array(bins).fill(0);
  const start = new Date(`${from}T00:00:00.000Z`).getTime();
  const end = new Date(`${to}T23:59:59.999Z`).getTime();
  const total = Math.max(end - start, 1);

  for (const bucket of buckets) {
    const time = new Date(bucket.bucket).getTime();
    if (Number.isNaN(time) || time < start || time > end) {
      continue;
    }

    const ratio = (time - start) / total;
    const index = Math.min(bins - 1, Math.max(0, Math.floor(ratio * bins)));
    histogram[index] += bucket.count;
  }

  return histogram;
}
