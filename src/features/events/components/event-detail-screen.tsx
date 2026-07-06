"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { Route } from "next";
import type { Event } from "@/lib/api/event-schemas";
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
      <Link
        href={"/" as Route}
        className="type-mono text-[0.66rem] uppercase tracking-[0.14em] text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
      >
        Back to explorer
      </Link>

      <section className="panel-strong overflow-hidden rounded-[1.15rem] border border-[var(--border)] p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[rgba(147,197,253,0.2)] bg-[rgba(68,144,245,0.12)] px-3 py-1 type-mono text-[0.58rem] uppercase tracking-[0.14em] text-[var(--accent-strong)]">
                {event.categoryLabel}
              </span>
              <span className="rounded-full border border-[rgba(255,255,255,0.08)] px-3 py-1 type-mono text-[0.58rem] uppercase tracking-[0.14em] text-[var(--info)]/82">
                {getEventStatusLabel(event.status)}
              </span>
              <span className="type-mono text-[0.58rem] uppercase tracking-[0.14em] text-[var(--muted)]">
                Event ID {event.id}
              </span>
            </div>
            <div className="space-y-3">
              <h1 className="text-balance text-[2.3rem] font-semibold leading-none tracking-[-0.02em] text-foreground sm:text-[3rem]">
                {event.title}
              </h1>
              <p className="max-w-3xl text-base leading-7 text-[var(--info)]/76">
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
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <section className="panel rounded-[1.15rem] px-5 py-5">
          <h2 className="text-lg font-semibold text-foreground">Event profile</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <Metric label="Latest observed UTC" value={formatEventDateTime(event.latestDate)} />
            <Metric label="Latest observed local" value={formatEventDateLocal(event.latestDate)} />
            <Metric label="Closed at" value={event.closedAt ? formatEventDateTime(event.closedAt) : "Still active"} />
            <Metric label="Coordinates" value={event.coordinateLabel ?? "Unavailable"} />
            <Metric label="Source" value={event.sourceLabel} />
            <Metric label="Magnitude" value={formatMagnitude(event.magnitudeValue, event.magnitudeUnit)} />
          </dl>
        </section>

        <section className="panel rounded-[1.15rem] px-5 py-5">
          <h2 className="text-lg font-semibold text-foreground">Sources</h2>
          <div className="mt-4 space-y-3">
            {event.sources.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No external source links available.</p>
            ) : (
              event.sources.map((source) => (
                <a
                  key={`${source.id}-${source.url ?? "source"}`}
                  href={source.url ?? undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-[0.9rem] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm text-[var(--info)] transition-colors hover:border-[rgba(147,197,253,0.22)] hover:text-foreground"
                >
                  <span>{source.title ?? source.id}</span>
                  <span className="type-mono text-[0.58rem] uppercase tracking-[0.14em] text-[var(--muted)]">
                    {source.id}
                  </span>
                </a>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="panel rounded-[1.15rem] px-5 py-5">
        <h2 className="text-lg font-semibold text-foreground">Observed geometries</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {event.geometries.map((geometry, index) => (
            <div
              key={`${geometry.date}-${index}`}
              className="rounded-[0.95rem] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-4 py-4"
            >
              <div className="type-mono text-[0.56rem] uppercase tracking-[0.14em] text-[var(--muted)]">
                {geometry.type}
              </div>
              <div className="mt-2 text-sm font-medium text-foreground">
                {formatEventDateTime(geometry.date)}
              </div>
              <div className="mt-2 text-sm text-[var(--info)]/72">
                {geometry.primaryCoordinate
                  ? `${geometry.primaryCoordinate[1].toFixed(2)}, ${geometry.primaryCoordinate[0].toFixed(2)}`
                  : "Coordinates unavailable"}
              </div>
              <div className="mt-2 text-sm text-[var(--info)]/72">
                {formatMagnitude(geometry.magnitudeValue, geometry.magnitudeUnit)}
              </div>
            </div>
          ))}
        </div>
      </section>
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
    <div className="rounded-[0.95rem] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-4 py-4">
      <div className="type-mono text-[0.56rem] uppercase tracking-[0.14em] text-[var(--muted)]">
        {label}
      </div>
      <div className="mt-2 text-sm text-[var(--info)]">{value}</div>
    </div>
  );
}
