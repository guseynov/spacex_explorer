import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { ArrowUpRight, Globe, Link2, Tags } from "lucide-react";
import { CalendarIcon } from "@/components/ui/icons";
import {
  formatLaunchDate,
  getLaunchOutcomeLabel,
  getLaunchOutcomeTone,
  LaunchStatusTone,
} from "@/lib/formatters";
import type { FavoriteLaunch } from "@/lib/api/schemas";

const statusAccent = {
  [LaunchStatusTone.Upcoming]: "var(--warning)",
  [LaunchStatusTone.Past]: "var(--muted)",
  [LaunchStatusTone.Success]: "var(--success)",
  [LaunchStatusTone.Failure]: "var(--danger)",
  [LaunchStatusTone.Pending]: "var(--muted)",
} as const;

export function LaunchCard({
  launch,
  actionSlot,
}: {
  launch: FavoriteLaunch;
  actionSlot?: React.ReactNode;
}) {
  const tone = getLaunchOutcomeTone(launch.net, launch.status.id);
  const accent = statusAccent[tone];
  const eventCode = launch.id.replace(/^EONET_/, "E-");

  const patchContent = launch.imageUrl ? (
    <Image
      src={launch.imageUrl}
      alt={`${launch.name} event image`}
      width={640}
      height={360}
      className="h-full w-full object-cover"
      unoptimized
    />
  ) : (
    <span className="type-display px-6 text-center text-[1.35rem] font-semibold tracking-[0.01em] text-[var(--info)]">
      {launch.rocketName ?? "NASA EONET event"}
    </span>
  );

  return (
    <article
      className="overflow-hidden rounded-[0.375rem] border bg-[rgba(15,21,36,0.92)]"
      style={{ borderColor: accent }}
    >
      <Link
        href={`/launches/${launch.id}` as Route}
        aria-label={`Open details for ${launch.name}`}
        className="block focus-visible:outline-none"
      >
        <div className="relative flex h-[138px] w-full items-center justify-center overflow-hidden bg-[var(--surface-muted)]">
          {patchContent}
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(11,16,28,0.92)] via-[rgba(11,16,28,0.14)] to-transparent" />
          <span
            className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-[3px] border px-2 py-1 type-mono text-[0.56rem] font-medium uppercase tracking-[0.1em]"
            style={{
              borderColor: `${accent}40`,
              backgroundColor: `${accent}14`,
              color: accent,
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: accent }}
            />
            {getLaunchOutcomeLabel(launch.net, launch.status.id)}
          </span>
          <span className="absolute right-4 bottom-4 type-mono text-[0.62rem] font-medium uppercase tracking-[0.1em] text-[var(--muted)]">
            {eventCode}
          </span>
        </div>
      </Link>

      <div className="space-y-4 px-4 py-4">
        <Link
          href={`/launches/${launch.id}` as Route}
          className="block min-w-0 space-y-2 focus-visible:outline-none"
        >
          <div className="flex min-w-0 items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="type-display text-[1.1rem] font-semibold leading-tight tracking-[0.01em] text-foreground transition-colors hover:text-[var(--accent-strong)]">
                {launch.name}
              </h2>
            </div>
            <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-[var(--muted)]" />
          </div>

          <p className="type-mono flex items-center gap-2 text-[0.66rem] font-medium uppercase tracking-[0.1em] text-[var(--muted)]">
            <CalendarIcon className="h-3.5 w-3.5" />
            {formatLaunchDate(launch.net)}
          </p>
        </Link>

        <dl className="space-y-2">
          <div className="flex items-center gap-2 text-[0.74rem] text-[var(--info)]">
            <Tags className="h-3.5 w-3.5 shrink-0 text-[var(--muted)]" />
            <dt className="type-mono w-9 shrink-0 text-[0.58rem] font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
              Cat
            </dt>
            <dd className="ml-auto text-right">{launch.rocketName ?? "Uncategorized"}</dd>
          </div>
          <div className="flex items-center gap-2 text-[0.74rem] text-[var(--info)]">
            <Link2 className="h-3.5 w-3.5 shrink-0 text-[var(--muted)]" />
            <dt className="type-mono w-9 shrink-0 text-[0.58rem] font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
              Src
            </dt>
            <dd className="ml-auto text-right">{launch.padName ?? "Unavailable"}</dd>
          </div>
          <div className="flex items-center gap-2 text-[0.74rem] text-[var(--info)]">
            <Globe className="h-3.5 w-3.5 shrink-0 text-[var(--muted)]" />
            <dt className="type-mono w-9 shrink-0 text-[0.58rem] font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
              Geo
            </dt>
            <dd className="ml-auto text-right">{launch.locationName ?? "Unavailable"}</dd>
          </div>
        </dl>

        <div className="border-t border-[var(--border)] pt-3">
          {actionSlot}
        </div>
      </div>
    </article>
  );
}
