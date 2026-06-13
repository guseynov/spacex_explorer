import { LaunchStatusBadges } from "@/components/launch-status-badges";
import type { Launch } from "@/lib/api/schemas";
import { formatLaunchDate, formatLaunchDateLocal } from "@/lib/formatters";
import { DetailLine } from "./detail-line";
import { Metric } from "./metric";

export function CompareColumn({
  data,
}: {
  data: Launch;
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
