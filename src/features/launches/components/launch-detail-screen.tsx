"use client";

import Image from "next/image";
import { useQueries, useQuery } from "@tanstack/react-query";
import { RetryState } from "@/components/retry-state";
import { SectionHeading } from "@/components/section-heading";
import { LaunchStatusBadges } from "@/components/status-badge";
import {
  fetchLaunchById,
  fetchLaunchpadById,
  fetchRocketById,
} from "@/lib/api/client";
import { CompareToggleButton } from "@/features/compare/compare-toggle-button";
import type { Launch, Launchpad, Rocket } from "@/lib/api/schemas";
import { toFavoriteLaunch } from "@/lib/api/query-builder";
import { formatLaunchDate, formatLaunchDateLocal } from "@/lib/formatters";
import { FavoriteToggleButton } from "@/features/favorites/favorite-toggle-button";
import { LaunchCardSkeleton } from "./launch-card-skeleton";

export function LaunchDetailScreen({
  launchId,
  initialLaunch,
  initialRocket,
  initialLaunchpad,
}: {
  launchId: string;
  initialLaunch?: Launch;
  initialRocket?: Rocket;
  initialLaunchpad?: Launchpad;
}) {
  const launchQuery = useQuery({
    queryKey: ["launch", launchId],
    queryFn: () => fetchLaunchById(launchId),
    initialData: initialLaunch,
    staleTime: 60_000,
  });

  const [rocketQuery, launchpadQuery] = useQueries({
    queries: [
      {
        queryKey: ["rocket", launchQuery.data?.rocket],
        queryFn: () => fetchRocketById(launchQuery.data!.rocket),
        enabled: Boolean(launchQuery.data?.rocket),
        initialData: initialRocket,
        staleTime: 300_000,
      },
      {
        queryKey: ["launchpad", launchQuery.data?.launchpad],
        queryFn: () => fetchLaunchpadById(launchQuery.data!.launchpad),
        enabled: Boolean(launchQuery.data?.launchpad),
        initialData: initialLaunchpad,
        staleTime: 300_000,
      },
    ],
  });

  if (launchQuery.isPending) {
    return (
      <div className="space-y-4">
        <LaunchCardSkeleton />
        <LaunchCardSkeleton />
        <LaunchCardSkeleton />
      </div>
    );
  }

  if (launchQuery.isError) {
    return (
      <RetryState
        message="The launch detail could not be loaded. Retry to request the mission data again."
        onRetry={() => launchQuery.refetch()}
      />
    );
  }

  const launch = launchQuery.data;
  const externalLinks = [
    ["Article", launch.links.article],
    ["Wikipedia", launch.links.wikipedia],
    ["Webcast", launch.links.webcast],
    ["Press kit", launch.links.presskit],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));
  const detailsText =
    launch.details ?? "No mission summary is available for this launch.";

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Launch detail"
        title={launch.name}
        description="Mission summary, supporting hardware, and launch site context for this SpaceX flight."
        action={
          <div className="flex flex-col gap-3 sm:flex-row">
            <FavoriteToggleButton launch={toFavoriteLaunch(launch)} />
            <CompareToggleButton launch={toFavoriteLaunch(launch)} />
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="panel px-6 py-6">
          <div className="flex flex-wrap items-center gap-3">
            <LaunchStatusBadges upcoming={launch.upcoming} success={launch.success} />
            <span className="text-[0.82rem] font-medium text-[var(--muted)]">
              Flight {launch.flight_number}
            </span>
          </div>

          <dl className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-[0.78rem] font-medium text-[var(--muted)]">
                UTC
              </dt>
              <dd className="mt-2 text-lg font-medium text-foreground">
                {formatLaunchDate(launch.date_utc)}
              </dd>
            </div>
            <div>
              <dt className="text-[0.78rem] font-medium text-[var(--muted)]">
                Local time
              </dt>
              <dd className="mt-2 text-lg font-medium text-foreground">
                {formatLaunchDateLocal(launch.date_local)}
              </dd>
            </div>
          </dl>

          <div className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
              Mission notes
            </h2>
            <p className="max-w-3xl text-base leading-7 text-[var(--muted)]">
              {detailsText}
            </p>
          </div>

          {renderExternalLinks(externalLinks)}
        </section>

        <div className="space-y-6">
          <DetailPanel
            title="Rocket"
            query={rocketQuery}
            loadingMessage="Loading rocket data..."
            retryLabel="Retry rocket data"
            renderContent={(data) => (
              <div className="mt-4 space-y-3">
                <p className="text-lg font-medium text-foreground">
                  {data.name}
                </p>
                <p className="text-sm text-[var(--muted)]">
                  {data.company} · {data.country}
                </p>
                <p className="text-sm leading-6 text-[var(--muted)]">
                  {data.description}
                </p>
              </div>
            )}
          />

          <DetailPanel
            title="Launchpad"
            query={launchpadQuery}
            loadingMessage="Loading launchpad data..."
            retryLabel="Retry launchpad data"
            renderContent={(data) => (
              <div className="mt-4 space-y-3">
                <p className="text-lg font-medium text-foreground">
                  {data.full_name}
                </p>
                <p className="text-sm text-[var(--muted)]">
                  {data.locality}, {data.region}
                </p>
                <p className="text-sm leading-6 text-[var(--muted)]">
                  {data.details}
                </p>
              </div>
            )}
          />
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Flickr gallery
        </h2>
        {renderGallery(launch.name, launch.links.flickr.original)}
      </section>
    </div>
  );
}

function renderExternalLinks(externalLinks: [string, string][]) {
  if (externalLinks.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 space-y-3">
      <h2 className="text-xl font-semibold tracking-tight text-foreground">
        External links
      </h2>
      <div className="flex flex-wrap gap-3">
        {externalLinks.map(([label, href]) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="button-secondary px-4 py-2 text-sm font-semibold transition"
          >
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}

type DetailQueryState<T> = {
  data?: T;
  isPending: boolean;
  isError: boolean;
  refetch: () => void;
};

function DetailPanel<T>({
  title,
  query,
  loadingMessage,
  retryLabel,
  renderContent,
}: {
  title: string;
  query: DetailQueryState<T>;
  loadingMessage: string;
  retryLabel: string;
  renderContent: (data: T) => React.ReactNode;
}) {
  let content: React.ReactNode = null;

  if (query.isPending) {
    content = <div className="mt-4 text-[var(--muted)]">{loadingMessage}</div>;
  } else if (query.isError) {
    content = (
      <button
        type="button"
        onClick={() => query.refetch()}
        className="button-secondary mt-4 px-4 py-2 text-sm font-semibold transition"
      >
        {retryLabel}
      </button>
    );
  } else if (query.data) {
    content = renderContent(query.data);
  } else {
    content = (
      <div className="mt-4 text-[var(--muted)]">
        Supporting data is unavailable for this launch.
      </div>
    );
  }

  return (
    <section className="panel px-6 py-6">
      <h2 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
        {title}
      </h2>
      {content}
    </section>
  );
}

function renderGallery(launchName: string, images: string[]) {
  if (images.length === 0) {
    return (
      <div className="panel px-6 py-8 text-[var(--muted)]">
        No Flickr gallery is available for this launch.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {images.map((image, index) => (
        <div
          key={image}
          className="overflow-hidden border border-[var(--border)] bg-[var(--surface)] p-2"
        >
          <Image
            src={image}
            alt={`${launchName} Flickr image ${index + 1}`}
            width={720}
            height={480}
            className="h-72 w-full object-cover"
            unoptimized
          />
        </div>
      ))}
    </div>
  );
}
