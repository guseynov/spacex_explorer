"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { RetryState } from "@/components/retry-state";
import { SectionHeading } from "@/components/section-heading";
import { LaunchStatusBadges } from "@/components/status-badge";
import { fetchLaunchById } from "@/lib/api/client";
import { CompareToggleButton } from "@/features/compare/compare-toggle-button";
import type { Launch, LaunchLink } from "@/lib/api/schemas";
import { toFavoriteLaunch } from "@/lib/api/query-builder";
import { formatLaunchDate, formatLaunchDateLocal } from "@/lib/formatters";
import { FavoriteToggleButton } from "@/features/favorites/favorite-toggle-button";
import { LaunchCardSkeleton } from "./launch-card-skeleton";

export function LaunchDetailScreen({
  launchId,
  initialLaunch,
}: {
  launchId: string;
  initialLaunch?: Launch;
}) {
  const launchQuery = useQuery({
    queryKey: ["launch", launchId],
    queryFn: () => fetchLaunchById(launchId),
    initialData: initialLaunch,
    staleTime: 60_000,
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
  const rocket = launch.rocket.configuration;
  const pad = launch.pad;
  const externalLinks = getExternalLinks(launch);
  const galleryImages = getGalleryImages(launch);
  const flightNumber =
    launch.agency_launch_attempt_count ?? launch.orbital_launch_attempt_count;

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
            <LaunchStatusBadges net={launch.net} statusId={launch.status.id} />
            {flightNumber ? (
              <span className="text-[0.82rem] font-medium text-[var(--muted)]">
                SpaceX launch {flightNumber}
              </span>
            ) : null}
          </div>

          <dl className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-[0.78rem] font-medium text-[var(--muted)]">
                UTC
              </dt>
              <dd className="mt-2 text-lg font-medium text-foreground">
                {formatLaunchDate(launch.net)}
              </dd>
            </div>
            <div>
              <dt className="text-[0.78rem] font-medium text-[var(--muted)]">
                Your local time
              </dt>
              <dd className="mt-2 text-lg font-medium text-foreground">
                {formatLaunchDateLocal(launch.net)}
              </dd>
            </div>
          </dl>

          <div className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
              Mission notes
            </h2>
            <p className="max-w-3xl text-base leading-7 text-[var(--muted)]">
              {launch.mission?.description ||
                launch.failreason ||
                "No mission summary is available for this launch."}
            </p>
          </div>

          {renderExternalLinks(externalLinks)}
        </section>

        <div className="space-y-6">
          <InfoPanel title="Rocket">
            <p className="text-lg font-medium text-foreground">
              {rocket.full_name || rocket.name}
            </p>
            <p className="text-sm text-[var(--muted)]">
              {rocket.manufacturer?.name ?? "SpaceX"}
              {rocket.variant ? ` · ${rocket.variant}` : ""}
            </p>
            <p className="text-sm leading-6 text-[var(--muted)]">
              {rocket.description || "No rocket description is available."}
            </p>
          </InfoPanel>

          <InfoPanel title="Launchpad">
            {pad ? (
              <>
                <p className="text-lg font-medium text-foreground">
                  {pad.name}
                </p>
                <p className="text-sm text-[var(--muted)]">
                  {pad.location?.name ?? pad.country?.name ?? "Location unavailable"}
                </p>
                <p className="text-sm leading-6 text-[var(--muted)]">
                  {pad.description ||
                    pad.location?.description ||
                    "No launchpad description is available."}
                </p>
              </>
            ) : (
              <p className="text-sm text-[var(--muted)]">
                Launchpad data is unavailable for this mission.
              </p>
            )}
          </InfoPanel>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Mission gallery
        </h2>
        {renderGallery(launch.name, galleryImages)}
      </section>
    </div>
  );
}

function InfoPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="panel px-6 py-6">
      <h2 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
        {title}
      </h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function getExternalLinks(launch: Launch): [string, string][] {
  const infoUrls = extractUrls([
    ...(launch.info_urls ?? []),
    ...(launch.mission?.info_urls ?? []),
  ]);
  const videoUrls = extractUrls([
    ...(launch.vid_urls ?? []),
    ...(launch.mission?.vid_urls ?? []),
  ]);

  return [
    ...infoUrls.map((url): [string, string] => [getInfoLinkLabel(url), url]),
    ...videoUrls.map((url): [string, string] => ["Webcast", url]),
  ];
}

function getInfoLinkLabel(url: string) {
  if (/wikipedia\.org/i.test(url)) {
    return "Wikipedia";
  }
  if (/press|kit|\.pdf/i.test(url)) {
    return "Press kit";
  }
  return "Article";
}

function extractUrls(links: LaunchLink[]) {
  return uniqueUrls(
    links.map((link) => (typeof link === "string" ? link : link.url)),
  );
}

function getGalleryImages(launch: Launch) {
  return uniqueUrls([
    launch.image?.image_url,
    launch.infographic?.image_url,
    launch.mission?.image?.image_url,
    ...(launch.mission_patches ?? []).map((patch) => patch.image_url),
    ...(launch.program ?? []).flatMap((program) =>
      (program.mission_patches ?? []).map((patch) => patch.image_url),
    ),
  ]);
}

function uniqueUrls(values: Array<string | null | undefined>) {
  return [
    ...new Set(
      values.filter((value): value is string => Boolean(value)),
    ),
  ];
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
        {externalLinks.map(([label, href], index) => (
          <a
            key={`${label}-${href}-${index}`}
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

function renderGallery(launchName: string, images: string[]) {
  if (images.length === 0) {
    return (
      <div className="panel px-6 py-8 text-[var(--muted)]">
        No mission gallery is available for this launch.
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
            alt={`${launchName} mission image ${index + 1}`}
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
