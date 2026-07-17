"use client";

import Link from "next/link";
import { forwardRef } from "react";
import type { Route } from "next";
import {
  Bookmark,
  GitCompare,
  MoveUpRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { FavoriteEvent } from "@/lib/api/event-schemas";
import {
  formatEventDateOnly,
  getEventStatusLabel,
} from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { getEventCategoryColor } from "../event-map-utils";
import { getEventSourceDisplayName } from "../event-display";
import { getEventCategoryIcon } from "./event-category-icon";

type EventCardData = FavoriteEvent;

type EventListCardProps = {
  event: EventCardData;
  selected?: boolean;
  saved?: boolean;
  compared?: boolean;
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
      onViewOnMap,
      onToggleSave,
      onToggleCompare,
      detailHref,
      actionSlot,
    },
    ref,
  ) {
    const Icon = getEventCategoryIcon(event.categoryId);
    const categoryColor = getEventCategoryColor(event.categoryId);
    const statusLabel = getEventStatusLabel(event.status);
    const hasMapLocation = Boolean(event.primaryCoordinate);

    return (
      <Card
        ref={ref}
        role="article"
        className={cn(
          "transition-colors",
          selected
            ? "border-[var(--brand)] bg-[var(--brand-soft)]"
            : "border-border bg-card",
        )}
      >
        <CardContent className="grid gap-4 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
            <Badge
              className="gap-1"
              style={{
                color: categoryColor,
                borderColor: `${categoryColor}40`,
                backgroundColor: `${categoryColor}14`,
              }}
            >
              <Icon className="h-3 w-3" />
              {event.categoryLabel}
            </Badge>
            <Badge
              variant={event.status === "active" ? "success" : "secondary"}
            >
              {statusLabel}
            </Badge>
            {selected ? (
              <Badge variant="secondary">
                On map
              </Badge>
            ) : null}
            </div>

            <div className="space-y-1.5">
            <h2 className="line-clamp-2 text-base font-semibold leading-6 text-foreground">
              {event.title}
            </h2>
            <p className="text-sm text-muted-foreground">
              {formatEventDateOnly(event.latestDate)} · {getEventSourceDisplayName(event.sourceLabel)}
            </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:max-w-[18rem] sm:justify-end">
            {onViewOnMap ? (
              <Button
                type="button"
                size="sm"
                variant={hasMapLocation ? "default" : "secondary"}
                disabled={!hasMapLocation}
                title={hasMapLocation ? undefined : "This event does not have a map point."}
                onClick={() => {
                  if (!hasMapLocation) {
                    return;
                  }

                  onViewOnMap();
                }}
              >
                <MoveUpRight className="h-3.5 w-3.5" />
                {hasMapLocation ? "Map" : "No map point"}
              </Button>
            ) : null}

            {detailHref ? (
              <Button asChild variant="secondary" size="sm">
                <Link href={detailHref}>
                  View details
                </Link>
              </Button>
            ) : null}

            {onToggleSave ? (
              <Button
                type="button"
                variant={saved ? "destructive" : "secondary"}
                size="sm"
                aria-pressed={saved}
                onClick={onToggleSave}
              >
                <Bookmark className="h-3.5 w-3.5" />
                {saved ? "Saved" : "Save"}
              </Button>
            ) : null}

            {onToggleCompare ? (
              <Button
                type="button"
                variant={compared ? "default" : "secondary"}
                size="sm"
                aria-pressed={compared}
                onClick={onToggleCompare}
              >
                <GitCompare className="h-3.5 w-3.5" />
                {compared ? "Compared" : "Compare"}
              </Button>
            ) : null}

            {actionSlot}
          </div>
        </CardContent>
      </Card>
    );
  },
);
