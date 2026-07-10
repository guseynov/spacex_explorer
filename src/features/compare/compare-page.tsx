import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fetchEventById } from "@/lib/api/event-client";
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
      <div className="space-y-8">
        <SectionHeading
          eyebrow="Compare"
          title="Compare two events"
          description="Select two EONET events from the explorer or favorites view, then open this page to compare them side by side."
        />
        <EmptyState
          title="Choose two different events"
          description="The compare view needs two distinct event IDs in the URL."
          action={
            <Button asChild>
              <Link href="/">Back to events</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const [left, right] = await Promise.all([
    fetchEventById(leftId),
    fetchEventById(rightId),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Compare"
        title="Two-event comparison"
        description="Review event timing, category, source, and latest geometry details across both selected records."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {[left, right].map((event) => (
          <Card key={event.id} className="bg-card/96">
            <CardContent className="px-6 py-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>
                  {event.categoryLabel}
                </Badge>
                <Badge variant="secondary">
                  {getEventStatusLabel(event.status)}
                </Badge>
              </div>
              <div>
                <p className="text-[0.66rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {event.id}
                </p>
                <h2 className="mt-2 text-[1.6rem] font-semibold leading-tight text-foreground">
                  {event.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {event.description ?? "No event description available."}
                </p>
              </div>
            </div>

            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <Metric label="Latest observed" value={formatEventDateTime(event.latestDate)} />
              <Metric label="Source" value={event.sourceLabel} />
              <Metric label="Coordinates" value={event.coordinateLabel ?? "Unavailable"} />
              <Metric label="Magnitude" value={formatMagnitude(event.magnitudeValue, event.magnitudeUnit)} />
            </dl>
            </CardContent>
          </Card>
        ))}
      </div>
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
