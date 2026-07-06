"use client";

import Link from "next/link";
import { forwardRef } from "react";
import type { Route } from "next";
import clsx from "clsx";
import {
  Activity,
  Bookmark,
  Cloud,
  Droplets,
  Flame,
  GitCompare,
  Mountain,
  MoveUpRight,
  Snowflake,
  Wind,
  Zap,
} from "lucide-react";
import type { FavoriteEvent } from "@/lib/api/event-schemas";
import {
  formatEventDateTime,
  formatMagnitude,
  getEventStatusLabel,
} from "@/lib/formatters";
import { getEventCategoryColor } from "../event-map-utils";

type EventCardData = FavoriteEvent;

type EventListCardProps = {
  event: EventCardData;
  selected?: boolean;
  saved?: boolean;
  compared?: boolean;
  onSelect?: () => void;
  onViewOnMap?: () => void;
  onToggleSave?: () => void;
  onToggleCompare?: () => void;
  detailHref?: Route;
  actionSlot?: React.ReactNode;
};

export const EventListCard = forwardRef<HTMLDivElement, EventListCardProps>(
  function EventListCard(
    {
      event,
      selected = false,
      saved = false,
      compared = false,
      onSelect,
      onViewOnMap,
      onToggleSave,
      onToggleCompare,
      detailHref,
      actionSlot,
    },
    ref,
  ) {
    const Icon = getCategoryIcon(event.categoryId);
    const categoryColor = getEventCategoryColor(event.categoryId);
    const statusLabel = getEventStatusLabel(event.status);

    return (
      <article
        ref={ref}
        role="article"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(eventKey) => {
          if (eventKey.key === "Enter" || eventKey.key === " ") {
            eventKey.preventDefault();
            onSelect?.();
          }
        }}
        className={clsx(
          "group rounded-[1rem] border px-4 py-4 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
          selected
            ? "border-[rgba(147,197,253,0.42)] bg-[rgba(8,16,30,0.94)] shadow-[0_0_0_1px_rgba(147,197,253,0.18),0_0_40px_rgba(68,144,245,0.18)]"
            : "border-[var(--border)] bg-[rgba(8,14,26,0.82)] hover:border-[rgba(147,197,253,0.2)] hover:bg-[rgba(11,18,32,0.92)]",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[0.62rem] font-medium uppercase tracking-[0.14em]"
                style={{
                  color: categoryColor,
                  borderColor: `${categoryColor}40`,
                  backgroundColor: `${categoryColor}14`,
                }}
              >
                <Icon className="h-3 w-3" />
                {event.categoryLabel}
              </span>
              <span
                className={clsx(
                  "inline-flex rounded-full border px-2.5 py-1 type-mono text-[0.58rem] font-medium uppercase tracking-[0.14em]",
                  event.status === "active"
                    ? "border-[rgba(74,222,128,0.24)] bg-[rgba(74,222,128,0.12)] text-[var(--success)]"
                    : "border-[rgba(148,163,184,0.18)] bg-[rgba(148,163,184,0.08)] text-[var(--muted)]",
                )}
              >
                {statusLabel}
              </span>
            </div>

            <div>
              <h2 className="text-[1rem] font-semibold leading-tight text-foreground">
                {event.title}
              </h2>
              {event.description ? (
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--info)]/72">
                  {event.description}
                </p>
              ) : null}
            </div>
          </div>

          <div className="type-mono shrink-0 text-[0.58rem] uppercase tracking-[0.16em] text-[var(--muted)]">
            {selected ? "Selected" : "Event"}
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-sm text-[var(--info)]/76">
          <div>
            <dt className="type-mono text-[0.56rem] uppercase tracking-[0.14em] text-[var(--muted)]">
              Latest
            </dt>
            <dd>{formatEventDateTime(event.latestDate)}</dd>
          </div>
          <div>
            <dt className="type-mono text-[0.56rem] uppercase tracking-[0.14em] text-[var(--muted)]">
              Source
            </dt>
            <dd>{event.sourceLabel}</dd>
          </div>
          <div>
            <dt className="type-mono text-[0.56rem] uppercase tracking-[0.14em] text-[var(--muted)]">
              Coordinates
            </dt>
            <dd>{event.coordinateLabel ?? "Unavailable"}</dd>
          </div>
          <div>
            <dt className="type-mono text-[0.56rem] uppercase tracking-[0.14em] text-[var(--muted)]">
              Magnitude
            </dt>
            <dd>{formatMagnitude(event.magnitudeValue, event.magnitudeUnit)}</dd>
          </div>
        </dl>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {onViewOnMap ? (
            <button
              type="button"
              onClick={(actionEvent) => {
                actionEvent.stopPropagation();
                onViewOnMap();
              }}
              className="button-primary inline-flex items-center gap-1.5 px-3 py-2 text-[0.68rem] font-medium uppercase tracking-[0.12em]"
            >
              <MoveUpRight className="h-3.5 w-3.5" />
              View on map
            </button>
          ) : null}

          {onToggleSave ? (
            <button
              type="button"
              aria-pressed={saved}
              onClick={(actionEvent) => {
                actionEvent.stopPropagation();
                onToggleSave();
              }}
              className={clsx(
                "button-secondary inline-flex items-center gap-1.5 px-3 py-2 text-[0.68rem] font-medium uppercase tracking-[0.12em]",
                saved && "border-[rgba(248,113,113,0.28)] text-[var(--danger)]",
              )}
            >
              <Bookmark className="h-3.5 w-3.5" />
              {saved ? "Saved" : "Save"}
            </button>
          ) : null}

          {onToggleCompare ? (
            <button
              type="button"
              aria-pressed={compared}
              onClick={(actionEvent) => {
                actionEvent.stopPropagation();
                onToggleCompare();
              }}
              className={clsx(
                "button-secondary inline-flex items-center gap-1.5 px-3 py-2 text-[0.68rem] font-medium uppercase tracking-[0.12em]",
                compared && "border-[rgba(147,197,253,0.3)] text-[var(--accent-strong)]",
              )}
            >
              <GitCompare className="h-3.5 w-3.5" />
              {compared ? "Selected" : "Compare"}
            </button>
          ) : null}

          {detailHref ? (
            <Link
              href={detailHref}
              onClick={(actionEvent) => actionEvent.stopPropagation()}
              className="button-secondary inline-flex items-center gap-1.5 px-3 py-2 text-[0.68rem] font-medium uppercase tracking-[0.12em]"
            >
              Open details
            </Link>
          ) : null}

          {actionSlot}
        </div>
      </article>
    );
  },
);

function getCategoryIcon(categoryId: string) {
  switch (categoryId) {
    case "wildfires":
      return Flame;
    case "severeStorms":
      return Cloud;
    case "floods":
      return Droplets;
    case "volcanoes":
      return Mountain;
    case "seaLakeIce":
      return Snowflake;
    case "dustHaze":
      return Wind;
    case "earthquakes":
      return Activity;
    default:
      return Zap;
  }
}
