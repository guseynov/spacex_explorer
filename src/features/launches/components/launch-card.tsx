import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import type { FavoriteLaunch } from "@/lib/api/schemas";
import { formatLaunchDate } from "@/lib/formatters";
import { LaunchStatusBadges } from "@/components/status-badge";
import { CalendarIcon } from "@/components/ui/icons";

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

  if (launch.patch) {
    patchContent = (
      <Image
        src={launch.patch}
        alt={`${launch.name} mission patch`}
        width={64}
        height={64}
        className="h-full w-full object-cover"
        unoptimized
      />
    );
  }

  let actionContent: React.ReactNode = null;

  if (actionSlot) {
    actionContent = <div className="shrink-0">{actionSlot}</div>;
  }

  return (
    <article className="group relative px-5 py-5 transition-colors hover:bg-[var(--surface-strong)] sm:px-6">
      <div className="relative z-10 flex h-full flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Link
          href={`/launches/${launch.id}` as Route}
          aria-label={`Open details for ${launch.name}`}
          className="flex min-w-0 flex-1 gap-4 text-left focus-visible:outline-none"
        >
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--surface-strong)]">
            {patchContent}
          </div>

          <div className="flex min-w-0 flex-col gap-3.5">
            <LaunchStatusBadges upcoming={launch.upcoming} success={launch.success} />
            <div className="flex flex-col gap-2.5">
              <h2 className="text-[1.5rem] font-semibold tracking-[-0.028em] text-foreground transition group-hover:text-[var(--accent-strong)] sm:text-[1.65rem]">
                {launch.name}
              </h2>
              <div className="flex flex-col gap-2 text-[0.94rem] text-[var(--muted)] sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4">
                <p className="flex items-center gap-2 font-medium text-[var(--info)]">
                  <CalendarIcon className="h-4 w-4" />
                  {formatLaunchDate(launch.date_utc)}
                </p>
              </div>
            </div>
          </div>
        </Link>

        <div className="relative z-20 flex items-center justify-end pointer-events-auto lg:pl-4">
          {actionContent}
        </div>
      </div>
    </article>
  );
}
