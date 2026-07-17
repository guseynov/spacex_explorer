"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft, ArrowUpRight, Bookmark, BookmarkCheck, GitCompareArrows } from "lucide-react";
import type { Event } from "@/lib/api/event-schemas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchEventById } from "@/lib/api/event-client";
import { toFavoriteEvent } from "@/lib/api/event-query-builder";
import {
  formatEventDateLocal,
  formatEventDateTime,
  formatMagnitude,
  getEventStatusLabel,
} from "@/lib/formatters";
import { useCompare } from "@/features/compare/compare-context";
import { getEventSourceDisplayName } from "@/features/events/event-display";
import { useFavorites } from "@/features/favorites/favorites-context";
import { EventCategoryIcon } from "./event-category-icon";

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
  const saved = isFavorite(event.id);
  const compared = isSelected(event.id);
  const savedEvent = toFavoriteEvent(event);
  const observations = event.geometries.slice(-12).reverse();

  return (
    <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <Button asChild variant="ghost" size="sm" className="w-fit px-0 text-muted-foreground hover:bg-transparent hover:text-foreground">
        <Link href={"/" as Route}><ArrowLeft aria-hidden="true" /> Back to explorer</Link>
      </Button>

      <header className="border-b border-border pb-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge><EventCategoryIcon categoryId={event.categoryId} className="size-3.5" />{event.categoryLabel}</Badge>
              <Badge variant="secondary">{getEventStatusLabel(event.status)}</Badge>
              <span className="text-xs text-muted-foreground">Record {event.id}</span>
            </div>
            <h1 className="text-balance text-3xl font-semibold leading-tight tracking-[-0.03em] text-foreground sm:text-5xl">
              {event.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
              {event.description ?? "No event summary is included in this source record."}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              type="button"
              variant={saved ? "secondary" : "outline"}
              onClick={() => toggleFavorite(savedEvent)}
            >
              {saved ? <BookmarkCheck aria-hidden="true" /> : <Bookmark aria-hidden="true" />}
              {saved ? "Saved" : "Save event"}
            </Button>
            <Button
              type="button"
              variant={compared ? "secondary" : "outline"}
              onClick={() => toggleCompare(savedEvent)}
            >
              <GitCompareArrows aria-hidden="true" />
              {compared ? "In comparison" : "Add to compare"}
            </Button>
          </div>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(18rem,0.75fr)]">
        <section aria-labelledby="record-profile-heading">
          <h2 id="record-profile-heading" className="text-lg font-semibold text-foreground">Record profile</h2>
          <dl className="mt-4 grid border-l border-t border-border sm:grid-cols-2">
            <Metric label="Latest observed · UTC" value={formatEventDateTime(event.latestDate)} />
            <Metric label="Latest observed · local" value={formatEventDateLocal(event.latestDate)} />
            <Metric label="Feed closure" value={event.closedAt ? formatEventDateTime(event.closedAt) : "Not marked closed"} />
            <Metric label="Coordinates" value={event.coordinateLabel ?? "Unavailable"} />
            <Metric label="Primary source" value={getEventSourceDisplayName(event.sourceLabel)} />
            <Metric label="Reported magnitude" value={formatMagnitude(event.magnitudeValue, event.magnitudeUnit)} />
          </dl>
        </section>

        <section aria-labelledby="sources-heading">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="sources-heading" className="text-lg font-semibold text-foreground">Source links</h2>
            <span className="text-xs text-muted-foreground">{event.sources.length} available</span>
          </div>
          <div className="mt-4 border-t border-border">
            {event.sources.length === 0 ? (
              <p className="border-b border-border py-4 text-sm text-muted-foreground">No external links are included.</p>
            ) : (
              event.sources.map((source) => {
                const label = source.title ?? getEventSourceDisplayName(source.id);
                return source.url ? (
                  <a
                    key={`${source.id}-${source.url}`}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex min-h-12 items-center justify-between gap-4 border-b border-border py-3 text-sm text-foreground transition-colors hover:text-primary"
                  >
                    <span>{label}</span>
                    <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
                  </a>
                ) : (
                  <div key={`${source.id}-source`} className="flex min-h-12 items-center border-b border-border py-3 text-sm text-muted-foreground">{label}</div>
                );
              })
            )}
          </div>
        </section>
      </div>

      <section aria-labelledby="observations-heading" className="border-t border-border pt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="observations-heading" className="text-lg font-semibold text-foreground">Recent observations</h2>
            <p className="mt-1 text-sm text-muted-foreground">Showing the latest {observations.length} of {event.geometries.length} geometries.</p>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto border border-border">
          <table className="w-full min-w-[680px] border-collapse text-left text-sm">
            <thead className="bg-card text-xs font-medium text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Observed · UTC</th>
                <th className="px-4 py-3 font-medium">Geometry</th>
                <th className="px-4 py-3 font-medium">Coordinates</th>
                <th className="px-4 py-3 font-medium">Magnitude</th>
              </tr>
            </thead>
            <tbody>
              {observations.map((geometry, index) => (
                <tr key={`${geometry.date}-${index}`} className="border-t border-border text-foreground">
                  <td className="whitespace-nowrap px-4 py-3">{formatEventDateTime(geometry.date)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{geometry.type}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {geometry.primaryCoordinate
                      ? `${geometry.primaryCoordinate[1].toFixed(2)}, ${geometry.primaryCoordinate[0].toFixed(2)}`
                      : "Unavailable"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatMagnitude(geometry.magnitudeValue, geometry.magnitudeUnit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="border-t border-border pt-5 text-xs leading-5 text-muted-foreground">
        Data provided by NASA EONET and its listed sources. Earth Event Atlas is an independent explorer and is not affiliated with or endorsed by NASA.
      </p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-r border-border bg-card/35 px-4 py-4">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-2 text-sm text-foreground">{value}</dd>
    </div>
  );
}
