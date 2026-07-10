"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronUp, ListFilter, SlidersHorizontal } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type {
  Event,
  EventListPage,
} from "@/lib/api/event-schemas";
import {
  countActiveEventFilters,
  toFavoriteEvent,
  type EventListQueryParams,
} from "@/lib/api/event-query-builder";
import { cn } from "@/lib/utils";
import { useCompare } from "@/features/compare/compare-context";
import { useFavorites } from "@/features/favorites/favorites-context";
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
  const [filtersOpen, setFiltersOpen] = useState(false);
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
              className="h-44 animate-pulse rounded-xl border border-border bg-secondary/60"
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
                <Button
                  type="button"
                  onClick={() => void onSyncData()}
                  disabled={isSyncing}
                >
                  {isSyncing ? "Syncing data" : "Sync backend mirror"}
                </Button>
              ) : null}
              <Button type="button" variant="secondary" onClick={onResetFilters}>
                Reset filters
              </Button>
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
    <Card className="flex h-full flex-col overflow-hidden bg-card/96" data-open={mobileOpen}>
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm text-foreground/90">
          <span>{events.length} shown</span>
          <span className="text-muted-foreground">/ {totalCount} loaded</span>
          {activeFilterCount > 0 ? (
            <Badge className="px-2 py-1 text-[0.56rem]">
              {activeFilterCount} active
            </Badge>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="rounded-full px-3 text-[0.68rem] uppercase tracking-[0.12em]"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filters
                {activeFilterCount > 0 ? (
                  <Badge className="h-5 min-w-5 rounded-full px-1.5 py-0 text-[0.56rem]">
                    {activeFilterCount}
                  </Badge>
                ) : null}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-[30rem] bg-card/98 p-0">
              <SheetHeader className="border-b border-border px-6 py-5 pr-14">
                <SheetTitle>Filter events</SheetTitle>
                <SheetDescription>
                  Narrow the visible event list by search term, sort order, status, and category.
                </SheetDescription>
              </SheetHeader>

              <div className="flex min-h-0 flex-1 flex-col">
                <ScrollArea className="min-h-0 flex-1">
                  <div className="px-6 py-5">
                    <EventFilters
                      filters={filters}
                      onChange={onChangeFilters}
                    />
                  </div>
                </ScrollArea>

                <Separator />

                <div className="flex items-center justify-between gap-3 px-6 py-4">
                  <div className="text-sm text-muted-foreground">
                    {activeFilterCount > 0
                      ? `${activeFilterCount} filters active`
                      : "No filters applied"}
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      onResetFilters();
                      setFiltersOpen(false);
                    }}
                  >
                    Reset filters
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen((current) => !current)}
            className="rounded-full text-muted-foreground md:hidden"
            aria-label={mobileOpen ? "Collapse event list" : "Expand event list"}
          >
            <ListFilter className="h-4 w-4" />
            <ChevronUp
              className="absolute h-4 w-4 transition-transform"
              style={{ transform: mobileOpen ? "rotate(0deg)" : "rotate(180deg)" }}
            />
          </Button>
        </div>
      </div>

      <Separator />

      <div className={cn(panelOpen ? "flex min-h-0 flex-1 flex-col" : "hidden md:flex md:min-h-0 md:flex-1 md:flex-col")}>
        <ScrollArea className="min-h-0 flex-1 px-3 py-3">
          {body}
        </ScrollArea>

        <Separator />

        <div className="px-4 py-3">
          <Button
            asChild
            variant="ghost"
            className="w-full justify-start px-0 text-[0.72rem] uppercase tracking-[0.14em]"
          >
            <Link href="/favorites">Review saved events</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
