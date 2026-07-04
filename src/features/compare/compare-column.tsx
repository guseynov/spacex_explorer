import { LaunchStatusBadges } from "@/components/launch-status-badges";
import type { Launch } from "@/lib/api/schemas";
import { formatLaunchDate, formatLaunchDateLocal } from "@/lib/formatters";
import { DetailLine } from "./detail-line";
import { Metric } from "./metric";

export function CompareColumn({
  data: launch,
}: {
  data: Launch;
}) {
  const rocket = launch.rocket.configuration;
  const launchpad = launch.pad;

  return (
    <section className="panel panel-strong px-6 py-6">
      <div className="space-y-4">
        <p className="app-kicker">Event profile</p>
        <div className="flex flex-wrap items-center gap-3">
          <LaunchStatusBadges net={launch.net} statusId={launch.status.id} />
          <span className="type-mono text-[0.68rem] font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
            {launch.id}
          </span>
        </div>

        <div className="space-y-3">
          <h2 className="type-display text-[2rem] font-semibold leading-none tracking-[0.01em] text-foreground">
            {launch.name}
          </h2>
          <p className="text-sm leading-6 text-[var(--info)]/72">
            {launch.mission?.description ||
              launch.failreason ||
              "No event summary is available for this record."}
          </p>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <Metric label="Observed UTC" value={formatLaunchDate(launch.net)} />
          <Metric label="Local" value={formatLaunchDateLocal(launch.net)} />
          <Metric label="Category" value={rocket.full_name || rocket.name} />
          <Metric label="Source" value={launchpad?.name ?? "Unavailable"} />
        </dl>

        <div className="grid gap-3">
          <DetailLine
            label="Category details"
            value={`${rocket.manufacturer?.name ?? "NASA EONET"}${
              rocket.variant ? ` · ${rocket.variant}` : ""
            }`}
          />
          <DetailLine
            label="Latest geometry"
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
