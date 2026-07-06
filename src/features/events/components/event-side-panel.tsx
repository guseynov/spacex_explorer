"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronUp, ListFilter } from "lucide-react";
import type {
  Event,
  EventListPage,
} from "@/lib/api/event-schemas";
import {
  countActiveEventFilters,
  toFavoriteEvent,
  type EventListQueryParams,
} from "@/lib/api/event-query-builder";
import { EmptyState } from "@/components/empty-state";
import { useFavorites } from "@/features/favorites/favorites-context";
import { useCompare } from "@/features/compare/compare-context";
import { EventFilters } from "./event-filters";
import { EventListCard } from "./event-list-card";

type EventSidePanelProps = {
  events: Event[];
  filters: EventListQueryParams;
  totalCount: EventListPage["count"];
  selectedEventId: string | null;
  isLoading?: boolean;
  isSyncing?: boolean;
  onChangeFilters: (updates: Partial<EventListQueryParams>) => void;
  onResetFilters: () => void;
  onViewOnMap: (id: string) => void;
  onSyncData?: () => Promise<void> | void;
};

export function EventSidePanel({
  events,
  filters,
  totalCount,
  selectedEventId,
  isLoading = false,
  isSyncing = false,
  onChangeFilters,
  onResetFilters,
  onViewOnMap,
  onSyncData,
}: EventSidePanelProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isSelected, toggleCompare } = useCompare();
  const [mobileOpen, setMobileOpen] = useState(true);
  const cardRefs = useRef(new Map<string, HTMLDivElement>());
  const activeFilterCount = countActiveEventFilters(filters);
  const panelOpen = mobileOpen || selectedEventId !== null;

  useEffect(() => {
    if (!selectedEventId) {
      return;
    }

    cardRefs.current.get(selectedEventId)?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [selectedEventId]);

  const body = useMemo(() => {
    if (isLoading && events.length === 0) {
      return (
        <div className="space-y-3 p-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-44 animate-pulse rounded-[1rem] border border-[var(--border)] bg-[rgba(255,255,255,0.04)]"
            />
          ))}
        </div>
      );
    }

    if (events.length === 0) {
      const description =
        totalCount === 0
          ? "No mirrored events are cached yet. Run the backend sync once, then the map and timeline will load from the local copy."
          : "Try widening the timeline or clearing one of the active filters.";

      return (
        <EmptyState
          title="No events found for this period"
          description={description}
          action={
            <div className="flex flex-wrap items-center justify-center gap-3">
              {totalCount === 0 && onSyncData ? (
                <button
                  type="button"
                  onClick={() => void onSyncData()}
                  disabled={isSyncing}
                  className="button-primary inline-flex px-4 py-3 text-sm font-semibold disabled:opacity-60"
                >
                  {isSyncing ? "Syncing data" : "Sync backend mirror"}
                </button>
              ) : null}
              <button
                type="button"
                onClick={onResetFilters}
                className="button-secondary inline-flex px-4 py-3 text-sm font-semibold"
              >
                Reset filters
              </button>
            </div>
          }
        />
      );
    }

    return (
      <div className="space-y-3 p-1">
        {events.map((event) => (
          <EventListCard
            key={event.id}
            ref={(node) => {
              if (node) {
                cardRefs.current.set(event.id, node);
              } else {
                cardRefs.current.delete(event.id);
              }
            }}
            event={toFavoriteEvent(event)}
            selected={selectedEventId === event.id}
            saved={isFavorite(event.id)}
            compared={isSelected(event.id)}
            onSelect={() => onViewOnMap(event.id)}
            onViewOnMap={() => onViewOnMap(event.id)}
            onToggleSave={() => toggleFavorite(toFavoriteEvent(event))}
            onToggleCompare={() => toggleCompare(toFavoriteEvent(event))}
            detailHref={`/events/${event.id}` as Route}
          />
        ))}
      </div>
    );
  }, [
    events,
    isFavorite,
    isLoading,
    isSelected,
    onResetFilters,
    onViewOnMap,
    onSyncData,
    isSyncing,
    totalCount,
    selectedEventId,
    toggleCompare,
    toggleFavorite,
  ]);

  return (
    <div
      className="panel-strong flex h-full flex-col overflow-hidden rounded-[1.15rem] border border-[var(--border)] bg-[rgba(5,9,19,0.92)]"
      data-open={mobileOpen}
    >
      <button
        type="button"
        onClick={() => setMobileOpen((current) => !current)}
        className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-4 text-left md:pointer-events-none"
      >
        <div>
          <div className="type-mono text-[0.58rem] uppercase tracking-[0.18em] text-[var(--muted)]">
            Events in selected period
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[var(--info)]">
            <span>{events.length} shown</span>
            <span className="text-[var(--muted)]">/ {totalCount} loaded</span>
            {activeFilterCount > 0 ? (
              <span className="rounded-full border border-[rgba(147,197,253,0.2)] bg-[rgba(68,144,245,0.12)] px-2 py-1 type-mono text-[0.56rem] uppercase tracking-[0.14em] text-[var(--accent-strong)]">
                {activeFilterCount} active
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2 text-[var(--muted)] md:hidden">
          <ListFilter className="h-4 w-4" />
          <ChevronUp
            className="h-4 w-4 transition-transform"
            style={{ transform: mobileOpen ? "rotate(0deg)" : "rotate(180deg)" }}
          />
        </div>
      </button>

      <div className={panelOpen ? "flex min-h-0 flex-1 flex-col" : "hidden md:flex md:min-h-0 md:flex-1 md:flex-col"}>
        <div className="border-b border-[var(--border)] px-4 py-4">
          <EventFilters
            filters={filters}
            onChange={onChangeFilters}
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
          {body}
        </div>

        <div className="border-t border-[var(--border)] px-4 py-3">
          <Link
            href="/favorites"
            className="type-mono text-[0.64rem] uppercase tracking-[0.14em] text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          >
            Review saved events
          </Link>
        </div>
      </div>
    </div>
  );
}
