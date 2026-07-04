import { type LaunchesQueryParams, stringifyLaunchSearchParams } from "./query-builder";
import { LaunchApiError } from "./errors";
import {
  launchSchema,
  launchTrendPageSchema,
  launchesPageSchema,
} from "./schemas";
import {
  fetchEonetEventById,
  fetchEonetEventsPage,
  fetchEonetTrendEvents,
} from "./eonet-source";

const BROWSER_API_BASE_URL = "/api/events";

type Parser<T> = { parse: (value: unknown) => T };

async function requestBrowserJson<T>(path: string, parser: Parser<T>) {
  const response = await fetch(`${BROWSER_API_BASE_URL}${path}`, {
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new LaunchApiError(
      `Launch request failed with status ${response.status}.`,
      response.status,
    );
  }

  return parser.parse((await response.json()) as unknown);
}

export function fetchLaunchesPage(
  filters: LaunchesQueryParams,
  page: number,
) {
  if (typeof window === "undefined") {
    return fetchEonetEventsPage(filters, page);
  }

  const params = stringifyLaunchSearchParams(filters);
  params.set("page", String(page));

  return requestBrowserJson(
    `/launches?${params.toString()}`,
    launchesPageSchema,
  );
}

export function fetchLaunchById(id: string) {
  if (typeof window === "undefined") {
    return fetchEonetEventById(id);
  }

  return requestBrowserJson(
    `/launches/${encodeURIComponent(id)}`,
    launchSchema,
  );
}

type LaunchYearStats = {
  year: number;
  totalLaunches: number;
  successLaunches: number;
};

export async function fetchLaunchYearStats(): Promise<LaunchYearStats[]> {
  const launches = await fetchEonetTrendEvents();
  const parsed = launchTrendPageSchema.parse({
    count: launches.length,
    next: null,
    previous: null,
    results: launches,
  });
  const statsByYear = new Map<number, LaunchYearStats>();

  for (const launch of parsed.results) {
    const year = new Date(launch.net).getUTCFullYear();
    const existing = statsByYear.get(year);

    if (existing) {
      existing.totalLaunches += 1;
      existing.successLaunches += launch.status.id === 2 ? 1 : 0;
      continue;
    }

    statsByYear.set(year, {
      year,
      totalLaunches: 1,
      successLaunches: launch.status.id === 2 ? 1 : 0,
    });
  }

  return [...statsByYear.values()].sort((left, right) => left.year - right.year);
}
