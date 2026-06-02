import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { SectionHeading } from "@/components/section-heading";
import { LaunchStatusBadges } from "@/components/status-badge";
import { fetchLaunchById, fetchLaunchpadById, fetchRocketById } from "@/lib/api/client";
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
  const launch = await fetchLaunchById(launchId);
  const [rocketResult, launchpadResult] = await Promise.allSettled([
    fetchRocketById(launch.rocket),
    fetchLaunchpadById(launch.launchpad),
  ]);

  return {
    launch,
    rocket: rocketResult.status === "fulfilled" ? rocketResult.value : null,
    launchpad:
      launchpadResult.status === "fulfilled" ? launchpadResult.value : null,
  };
}

function CompareColumn({
  data,
}: {
  data: Awaited<ReturnType<typeof loadComparisonColumn>>;
}) {
  const { launch, rocket, launchpad } = data;

  return (
    <section className="panel px-6 py-6">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <LaunchStatusBadges upcoming={launch.upcoming} success={launch.success} />
          <span className="text-[0.82rem] font-medium text-[var(--muted)]">
            Flight {launch.flight_number}
          </span>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
            {launch.name}
          </h2>
          <p className="text-sm leading-6 text-[var(--muted)]">
            {launch.details ?? "No mission summary is available for this launch."}
          </p>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <Metric label="UTC" value={formatLaunchDate(launch.date_utc)} />
          <Metric label="Local" value={formatLaunchDateLocal(launch.date_local)} />
          <Metric label="Rocket" value={rocket?.name ?? "Unavailable"} />
          <Metric
            label="Launchpad"
            value={launchpad?.full_name ?? "Unavailable"}
          />
        </dl>

        <div className="grid gap-3">
          <DetailLine
            label="Rocket details"
            value={rocket ? `${rocket.company} · ${rocket.country}` : "Unavailable"}
          />
          <DetailLine
            label="Launchpad details"
            value={
              launchpad
                ? `${launchpad.locality}, ${launchpad.region}`
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
