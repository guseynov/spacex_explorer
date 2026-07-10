"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { Route } from "next";
import type { Event } from "@/lib/api/event-schemas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fetchEventById } from "@/lib/api/event-client";
import { toFavoriteEvent } from "@/lib/api/event-query-builder";
import {
  formatEventDateLocal,
  formatEventDateTime,
  formatMagnitude,
  getEventStatusLabel,
} from "@/lib/formatters";
import { useCompare } from "@/features/compare/compare-context";
import { useFavorites } from "@/features/favorites/favorites-context";
import { EventListCard } from "./event-list-card";

export function EventDetailScreen({
  eventId,
  initialEvent,
}: {
  eventId: string;
  initialEvent: Event;
}) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const { toggleCompare, isSelected } = useCompare();
  const query = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => fetchEventById(eventId),
    initialData: initialEvent,
  });

  const event = query.data;
  const favoriteEvent = toFavoriteEvent(event);

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <Button asChild variant="ghost" className="w-fit px-0 text-[0.72rem] uppercase tracking-[0.14em]">
        <Link href={"/" as Route}>Back to explorer</Link>
      </Button>

      <Card className="overflow-hidden bg-card/96">
        <CardContent className="p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>
                {event.categoryLabel}
              </Badge>
              <Badge variant="secondary">
                {getEventStatusLabel(event.status)}
              </Badge>
              <span className="text-[0.66rem] uppercase tracking-[0.14em] text-muted-foreground">
                Event ID {event.id}
              </span>
            </div>
            <div className="space-y-3">
              <h1 className="text-balance text-[2.3rem] font-semibold leading-none tracking-[-0.02em] text-foreground sm:text-[3rem]">
                {event.title}
              </h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground">
                {event.description ?? "No event summary is available for this record."}
              </p>
            </div>
          </div>

          <EventListCard
            event={favoriteEvent}
            saved={isFavorite(event.id)}
            compared={isSelected(event.id)}
            onToggleSave={() => toggleFavorite(favoriteEvent)}
            onToggleCompare={() => toggleCompare(favoriteEvent)}
            detailHref={`/events/${event.id}` as Route}
          />
        </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Card className="bg-card/96">
          <CardContent className="px-5 py-5">
          <h2 className="text-lg font-semibold text-foreground">Event profile</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <Metric label="Latest observed UTC" value={formatEventDateTime(event.latestDate)} />
            <Metric label="Latest observed local" value={formatEventDateLocal(event.latestDate)} />
            <Metric label="Closed at" value={event.closedAt ? formatEventDateTime(event.closedAt) : "Still active"} />
            <Metric label="Coordinates" value={event.coordinateLabel ?? "Unavailable"} />
            <Metric label="Source" value={event.sourceLabel} />
            <Metric label="Magnitude" value={formatMagnitude(event.magnitudeValue, event.magnitudeUnit)} />
          </dl>
          </CardContent>
        </Card>

        <Card className="bg-card/96">
          <CardContent className="px-5 py-5">
          <h2 className="text-lg font-semibold text-foreground">Sources</h2>
          <div className="mt-4 space-y-3">
            {event.sources.length === 0 ? (
              <p className="text-sm text-muted-foreground">No external source links available.</p>
            ) : (
              event.sources.map((source) => (
                <a
                  key={`${source.id}-${source.url ?? "source"}`}
                  href={source.url ?? undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm text-foreground/90 transition-colors hover:border-primary/25 hover:bg-secondary hover:text-foreground"
                >
                  <span>{source.title ?? source.id}</span>
                  <span className="text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
                    {source.id}
                  </span>
                </a>
              ))
            )}
          </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/96">
        <CardContent className="px-5 py-5">
        <h2 className="text-lg font-semibold text-foreground">Observed geometries</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {event.geometries.map((geometry, index) => (
            <div
              key={`${geometry.date}-${index}`}
              className="rounded-xl border border-border bg-secondary/50 px-4 py-4"
            >
              <div className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {geometry.type}
              </div>
              <div className="mt-2 text-sm font-medium text-foreground">
                {formatEventDateTime(geometry.date)}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {geometry.primaryCoordinate
                  ? `${geometry.primaryCoordinate[1].toFixed(2)}, ${geometry.primaryCoordinate[0].toFixed(2)}`
                  : "Coordinates unavailable"}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {formatMagnitude(geometry.magnitudeValue, geometry.magnitudeUnit)}
              </div>
            </div>
          ))}
        </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-secondary/50 px-4 py-4">
      <div className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 text-sm text-foreground/90">{value}</div>
    </div>
  );
}
