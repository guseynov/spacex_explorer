import {
  buildLaunchesQueryPayload,
  defaultLaunchFilters,
  LaunchResult,
  LaunchSortOption,
  LaunchTiming,
  type LaunchesQueryParams,
} from "./query-builder";
import { SpaceXApiError } from "./errors";
import {
  launchSchema,
  launchesPageSchema,
  launchpadSchema,
  rocketSchema,
} from "./schemas";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SPACEX_API_BASE_URL ??
  process.env.SPACEX_API_BASE_URL ??
  "https://api.spacexdata.com/v4";

async function requestJson<T>(
  path: string,
  init: RequestInit,
  parser: { parse: (value: unknown) => T },
) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new SpaceXApiError(
      `SpaceX API request failed with status ${response.status}.`,
      response.status,
    );
  }

  const json = (await response.json()) as unknown;

  return parser.parse(json);
}

export function fetchLaunchesPage(
  filters: LaunchesQueryParams,
  page: number,
) {
  return requestJson(
    "/launches/query",
    {
      method: "POST",
      body: JSON.stringify(buildLaunchesQueryPayload(filters, page)),
    },
    launchesPageSchema,
  );
}

type LaunchYearStats = {
  year: number;
  totalLaunches: number;
  successLaunches: number;
};

function buildYearFilters(
  year: number,
  result: (typeof LaunchResult)[keyof typeof LaunchResult],
) {
  return {
    ...defaultLaunchFilters,
    timing: LaunchTiming.All,
    result,
    from: `${year}-01-01`,
    to: `${year}-12-31`,
    sort: LaunchSortOption.DateDesc,
    search: "",
  } satisfies LaunchesQueryParams;
}

async function fetchLaunchCountForYear(
  year: number,
  result: (typeof LaunchResult)[keyof typeof LaunchResult],
) {
  const page = await requestJson(
    "/launches/query",
    {
      method: "POST",
      body: JSON.stringify(
        buildLaunchesQueryPayload(buildYearFilters(year, result), 1, 1),
      ),
    },
    launchesPageSchema,
  );

  return page.totalDocs;
}

export async function fetchLaunchYearStats(
  years: number[],
): Promise<LaunchYearStats[]> {
  return Promise.all(
    years.map(async (year) => {
      const [totalLaunches, successLaunches] = await Promise.all([
        fetchLaunchCountForYear(year, LaunchResult.All),
        fetchLaunchCountForYear(year, LaunchResult.Success),
      ]);

      return {
        year,
        totalLaunches,
        successLaunches,
      };
    }),
  );
}

export function fetchLaunchById(id: string) {
  return requestJson(`/launches/${id}`, { method: "GET" }, launchSchema);
}

export function fetchRocketById(id: string) {
  return requestJson(`/rockets/${id}`, { method: "GET" }, rocketSchema);
}

export function fetchLaunchpadById(id: string) {
  return requestJson(`/launchpads/${id}`, { method: "GET" }, launchpadSchema);
}
