import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { SectionHeading } from "@/components/section-heading";
import { LaunchStatusBadges } from "@/components/status-badge";
import { fetchLaunchById } from "@/lib/api/client";
import { formatLaunchDate, formatLaunchDateLocal } from "@/lib/formatters";

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
          title="Compare two launches"
          description="Select two missions from the explorer or favorites view, then open this page to compare them side by side."
        />
        <EmptyState
          title="Choose two different launches"
          description="The compare view needs two distinct launch IDs in the URL."
          action={
            <Link
              href="/"
              className="button-primary inline-flex px-5 py-3 text-sm font-semibold transition"
            >
              Back to launches
            </Link>
          }
        />
      </div>
    );
  }

  const [left, right] = await Promise.all([
    loadComparisonColumn(leftId),
    loadComparisonColumn(rightId),
  ]);

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Compare"
        title="Two-launch comparison"
        description="Review mission timing, outcome, hardware, and launch site details across both launches."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <CompareColumn data={left} />
        <CompareColumn data={right} />
      </div>
    </div>
  );
}

async function loadComparisonColumn(launchId: string) {
  return fetchLaunchById(launchId);
}

function CompareColumn({
  data,
}: {
  data: Awaited<ReturnType<typeof loadComparisonColumn>>;
}) {
  const launch = data;
  const rocket = launch.rocket.configuration;
  const launchpad = launch.pad;
  const flightNumber =
    launch.agency_launch_attempt_count ?? launch.orbital_launch_attempt_count;

  return (
    <section className="panel px-6 py-6">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <LaunchStatusBadges net={launch.net} statusId={launch.status.id} />
          {flightNumber ? (
            <span className="text-[0.82rem] font-medium text-[var(--muted)]">
              SpaceX launch {flightNumber}
            </span>
          ) : null}
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
            {launch.name}
          </h2>
          <p className="text-sm leading-6 text-[var(--muted)]">
            {launch.mission?.description ||
              launch.failreason ||
              "No mission summary is available for this launch."}
          </p>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <Metric label="UTC" value={formatLaunchDate(launch.net)} />
          <Metric label="Local" value={formatLaunchDateLocal(launch.net)} />
          <Metric label="Rocket" value={rocket.full_name || rocket.name} />
          <Metric
            label="Launchpad"
            value={launchpad?.name ?? "Unavailable"}
          />
        </dl>

        <div className="grid gap-3">
          <DetailLine
            label="Rocket details"
            value={`${rocket.manufacturer?.name ?? "SpaceX"}${
              rocket.variant ? ` · ${rocket.variant}` : ""
            }`}
          />
          <DetailLine
            label="Launchpad details"
            value={
              launchpad
                ? launchpad.location?.name ??
                  launchpad.country?.name ??
                  "Location unavailable"
                : "Unavailable"
            }
          />
        </div>
      </div>
    </section>
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
    <div className="metric-tile p-4">
      <dt className="text-[0.75rem] font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
        {label}
      </dt>
      <dd className="mt-2 text-sm leading-6 text-foreground">{value}</dd>
    </div>
  );
}

function DetailLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1 border-t border-[var(--border)] pt-3">
      <p className="text-[0.75rem] font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
        {label}
      </p>
      <p className="text-sm leading-6 text-[var(--muted)]">{value}</p>
    </div>
  );
}
