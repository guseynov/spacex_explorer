import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft, ArrowUpRight, GitCompareArrows } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EventCategoryIcon } from "@/features/events/components/event-category-icon";
import { getEventSourceDisplayName } from "@/features/events/event-display";
import type { Event } from "@/lib/api/event-schemas";
import { queryEventStoreById } from "@/lib/api/event-store";
import { formatEventDateTime, formatMagnitude, getEventStatusLabel } from "@/lib/formatters";

type CompareId = string | null;

export async function ComparePage({
  leftId,
  rightId,
}: {
  leftId: CompareId;
  rightId: CompareId;
}) {
  if (!leftId || !rightId || leftId === rightId) {
    return (
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <SectionHeading
          eyebrow="Compare workspace"
          title="Compare two events"
          description="Add two different events from Explore or Saved to inspect their timing, source, location, and reported magnitude."
        />
        <EmptyState
          title="Choose two events first"
          description="Your comparison tray needs two distinct events before this workspace can open."
          action={
            <Button asChild>
              <Link href="/">Explore events</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const [left, right] = await Promise.all([
    queryEventStoreById(leftId),
    queryEventStoreById(rightId),
  ]);

  if (!left || !right) {
    return (
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <SectionHeading
          eyebrow="Compare workspace"
          title="One record is unavailable"
          description="A selected event may have been removed from the local mirror or its identifier may no longer resolve."
        />
        <EmptyState
          title="Choose another pair"
          description="Return to the explorer and add two available records to the comparison."
          action={<Button asChild><Link href="/">Explore events</Link></Button>}
        />
      </div>
    );
  }

  const metrics = getComparisonMetrics(left, right);

  return (
    <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <Button asChild variant="ghost" size="sm" className="w-fit px-0 text-muted-foreground hover:bg-transparent hover:text-foreground">
        <Link href={"/" as Route}><ArrowLeft aria-hidden="true" /> Back to explorer</Link>
      </Button>
      <SectionHeading
        eyebrow="Compare workspace"
        title="Event comparison"
        description="A field-by-field view of two records. Values reflect the latest observation available in the EONET feed."
      />

      <div className="overflow-hidden border border-border bg-card/40">
        <div className="grid grid-cols-[minmax(5.5rem,0.55fr)_repeat(2,minmax(0,1fr))] border-b border-border bg-card">
          <div className="flex items-center justify-center border-r border-border p-4 text-primary">
            <GitCompareArrows aria-hidden="true" className="size-5" />
            <span className="sr-only">Compared fields</span>
          </div>
          <EventColumnHeader event={left} />
          <EventColumnHeader event={right} />
        </div>

        <dl>
          {metrics.map((metric) => (
            <div key={metric.label} className="grid grid-cols-[minmax(5.5rem,0.55fr)_repeat(2,minmax(0,1fr))] border-b border-border last:border-b-0">
              <dt className="border-r border-border bg-card/55 px-3 py-4 text-xs font-medium text-muted-foreground sm:px-4">
                {metric.label}
              </dt>
              <dd className="border-r border-border px-3 py-4 text-sm text-foreground sm:px-5">{metric.left}</dd>
              <dd className="px-3 py-4 text-sm text-foreground sm:px-5">{metric.right}</dd>
            </div>
          ))}
        </dl>
      </div>

      <p className="text-xs leading-5 text-muted-foreground">
        Earth Event Atlas presents source records for exploration. Dates, coordinates, and magnitudes are not independently verified.
      </p>
    </div>
  );
}

function EventColumnHeader({ event }: { event: Event }) {
  return (
    <div className="min-w-0 border-r border-border p-4 last:border-r-0 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge><EventCategoryIcon categoryId={event.categoryId} className="size-3.5" />{event.categoryLabel}</Badge>
        <Badge variant="secondary">{getEventStatusLabel(event.status)}</Badge>
      </div>
      <h2 className="line-clamp-3 text-sm font-semibold leading-5 text-foreground sm:text-lg sm:leading-6">{event.title}</h2>
      <Button asChild variant="ghost" size="sm" className="mt-3 h-auto px-0 text-primary hover:bg-transparent">
        <Link href={`/events/${event.id}` as Route}>View record <ArrowUpRight aria-hidden="true" /></Link>
      </Button>
    </div>
  );
}

function getComparisonMetrics(left: Event, right: Event) {
  return [
    { label: "Latest observed", left: formatEventDateTime(left.latestDate), right: formatEventDateTime(right.latestDate) },
    { label: "Source", left: getEventSourceDisplayName(left.sourceLabel), right: getEventSourceDisplayName(right.sourceLabel) },
    { label: "Coordinates", left: left.coordinateLabel ?? "Unavailable", right: right.coordinateLabel ?? "Unavailable" },
    { label: "Magnitude", left: formatMagnitude(left.magnitudeValue, left.magnitudeUnit), right: formatMagnitude(right.magnitudeValue, right.magnitudeUnit) },
    { label: "Observations", left: String(left.geometries.length), right: String(right.geometries.length) },
    { label: "Event ID", left: left.id, right: right.id },
  ];
}
