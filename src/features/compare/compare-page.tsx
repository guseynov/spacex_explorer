import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { SectionHeading } from "@/components/section-heading";
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
            <Link
              href="/"
              className="button-primary inline-flex px-5 py-3 text-sm font-semibold transition"
            >
              Back to events
            </Link>
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
          <section key={event.id} className="panel panel-strong rounded-[1.15rem] px-6 py-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[rgba(147,197,253,0.2)] bg-[rgba(68,144,245,0.12)] px-3 py-1 type-mono text-[0.58rem] uppercase tracking-[0.14em] text-[var(--accent-strong)]">
                  {event.categoryLabel}
                </span>
                <span className="rounded-full border border-[rgba(255,255,255,0.08)] px-3 py-1 type-mono text-[0.58rem] uppercase tracking-[0.14em] text-[var(--info)]/82">
                  {getEventStatusLabel(event.status)}
                </span>
              </div>
              <div>
                <p className="type-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--muted)]">
                  {event.id}
                </p>
                <h2 className="mt-2 text-[1.6rem] font-semibold leading-tight text-foreground">
                  {event.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[var(--info)]/74">
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
          </section>
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
    <div className="rounded-[0.95rem] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-4 py-4">
      <div className="type-mono text-[0.56rem] uppercase tracking-[0.14em] text-[var(--muted)]">
        {label}
      </div>
      <div className="mt-2 text-sm text-[var(--info)]">{value}</div>
    </div>
  );
}
