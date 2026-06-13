import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import type { FavoriteLaunch } from "@/lib/api/schemas";
import { formatLaunchDate } from "@/lib/formatters";
import { LaunchStatusBadges } from "@/components/status-badge";
import { CalendarIcon } from "@/components/ui/icons";
import { ArrowUpRight } from "lucide-react";

export function LaunchCard({
  launch,
  actionSlot,
}: {
  launch: FavoriteLaunch;
  actionSlot?: React.ReactNode;
}) {
  let patchContent = (
    <span className="text-xs font-medium text-[var(--muted)]">
      N/A
    </span>
  );

  if (launch.imageUrl) {
    patchContent = (
      <Image
        src={launch.imageUrl}
        alt={`${launch.name} mission image`}
        width={72}
        height={72}
        className="h-full w-full object-cover"
        unoptimized
      />
    );
  }

  let actionContent: React.ReactNode = null;

  if (actionSlot) {
    actionContent = actionSlot;
  }

  return (
    <article className="launch-row group px-4 py-4 sm:px-5">
      <div className="relative z-10 flex h-full flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Link
          href={`/launches/${launch.id}` as Route}
          aria-label={`Open details for ${launch.name}`}
          className="flex min-w-0 flex-1 gap-4 text-left focus-visible:outline-none"
        >
          <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-[var(--surface-muted)] ring-1 ring-inset ring-[var(--border)]">
            {patchContent}
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-center gap-2.5">
            <LaunchStatusBadges
              net={launch.net}
              statusId={launch.status.id}
            />
            <div className="min-w-0 space-y-1.5">
              <div className="flex min-w-0 items-center gap-2">
                <h2 className="launch-title min-w-0 text-[1.15rem] font-semibold tracking-[-0.025em] text-foreground transition-colors group-hover:text-[var(--accent-strong)] sm:text-[1.3rem]">
                  {launch.name}
                </h2>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-[var(--muted)] transition-colors group-hover:text-[var(--accent-strong)]" />
              </div>
              <div className="flex flex-col gap-2 text-[0.82rem] text-[var(--muted)] sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4">
                <p className="flex items-center gap-2 font-medium text-[var(--info)]">
                  <CalendarIcon className="h-4 w-4" />
                  {formatLaunchDate(launch.net)}
                </p>
              </div>
            </div>
          </div>
        </Link>

        <div className="relative z-20 flex w-full items-stretch pointer-events-auto lg:w-auto lg:justify-end lg:pl-4">
          {actionContent}
        </div>
      </div>
    </article>
  );
}
