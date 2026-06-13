import {
  buildLaunchLibraryQueryParams,
  type LaunchesQueryParams,
} from "./query-builder";
import { LaunchApiError } from "./errors";
import {
  launchSchema,
  launchTrendPageSchema,
  launchesPageSchema,
  type LaunchTrendPage,
} from "./schemas";

const API_BASE_URL =
  process.env.LAUNCH_LIBRARY_API_BASE_URL ??
  "https://ll.thespacedevs.com/2.3.0";
const BROWSER_API_BASE_URL = "/api/launch-library";

type Parser<T> = { parse: (value: unknown) => T };

async function requestJson<T>(
  path: string,
  params: URLSearchParams,
  parser: Parser<T>,
) {
  const baseUrl =
    typeof window === "undefined" ? API_BASE_URL : BROWSER_API_BASE_URL;
  const requestPath =
    typeof window === "undefined" ? path : path.replace(/\/$/, "");
  const query = params.size > 0 ? `?${params.toString()}` : "";
  const response = await fetch(`${baseUrl}${requestPath}${query}`, {
    headers: {
      accept: "application/json",
    },
    ...(typeof window === "undefined"
      ? { next: { revalidate: 300 } }
      : {}),
  });

  if (!response.ok) {
    throw new LaunchApiError(
      `Launch Library request failed with status ${response.status}.`,
      response.status,
    );
  }

  return parser.parse((await response.json()) as unknown);
}

export function fetchLaunchesPage(
  filters: LaunchesQueryParams,
  page: number,
) {
  return requestJson(
    "/launches/",
    buildLaunchLibraryQueryParams(filters, page),
    launchesPageSchema,
  );
}

export function fetchLaunchById(id: string) {
  return requestJson(
    `/launches/${encodeURIComponent(id)}/`,
    new URLSearchParams({ mode: "detailed" }),
    launchSchema,
  );
}

type LaunchYearStats = {
  year: number;
  totalLaunches: number;
  successLaunches: number;
};

export async function fetchLaunchYearStats(
  years: number[],
): Promise<LaunchYearStats[]> {
  if (years.length === 0) {
    return [];
  }

  const launches = await fetchTrendLaunches(years);

  return years.map((year) => {
    const launchesForYear = launches.filter(
      (launch) => new Date(launch.net).getUTCFullYear() === year,
    );

    return {
      year,
      totalLaunches: launchesForYear.length,
      successLaunches: launchesForYear.filter(
        (launch) => launch.status.id === 3,
      ).length,
    };
  });
}

async function fetchTrendLaunches(years: number[]) {
  const firstYear = Math.min(...years);
  const lastYear = Math.max(...years);
  const limit = 100;
  const baseParams = new URLSearchParams({
    lsp__id: "121",
    limit: String(limit),
    offset: "0",
    mode: "list",
    ordering: "net",
    net__gte: `${firstYear}-01-01T00:00:00.000Z`,
    net__lte: `${lastYear}-12-31T23:59:59.999Z`,
  });
  const firstPage = await requestJson(
    "/launches/",
    baseParams,
    launchTrendPageSchema,
  );
  const pageCount = Math.ceil(firstPage.count / limit);

  if (pageCount <= 1) {
    return firstPage.results;
  }

  const remainingPages = await Promise.all(
    Array.from({ length: pageCount - 1 }, (_, index) => {
      const params = new URLSearchParams(baseParams);
      params.set("offset", String((index + 1) * limit));

      return requestJson("/launches/", params, launchTrendPageSchema);
    }),
  );

  return [
    ...firstPage.results,
    ...remainingPages.flatMap((page: LaunchTrendPage) => page.results),
  ];
}
