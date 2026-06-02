import type { FavoriteLaunch } from "./schemas";

export const PAGE_SIZE = 12;

export const LaunchTiming = {
  All: "all",
  Upcoming: "upcoming",
  Past: "past",
} as const;

export const LaunchResult = {
  All: "all",
  Success: "success",
  Failure: "failure",
} as const;

export const LaunchSortOption = {
  DateDesc: "date_desc",
  DateAsc: "date_asc",
  NameAsc: "name_asc",
  NameDesc: "name_desc",
} as const;

export const timingOptions = Object.values(LaunchTiming);
export const resultOptions = Object.values(LaunchResult);
export const sortOptions = Object.values(LaunchSortOption);

export type TimingFilter = (typeof timingOptions)[number];
export type ResultFilter = (typeof resultOptions)[number];
export type SortOption = (typeof sortOptions)[number];

export type LaunchesQueryParams = {
  timing: TimingFilter;
  result: ResultFilter;
  from: string;
  to: string;
  sort: SortOption;
  search: string;
};

type LaunchesQueryInput = Partial<Record<keyof LaunchesQueryParams, string>>;
type LaunchSort = { date_utc: "asc" | "desc" } | { name: "asc" | "desc" };

export const defaultLaunchFilters: LaunchesQueryParams = {
  timing: LaunchTiming.All,
  result: LaunchResult.All,
  from: "",
  to: "",
  sort: LaunchSortOption.DateDesc,
  search: "",
};

export function escapeMissionSearch(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isTimingFilter(value: string | null): value is TimingFilter {
  return timingOptions.includes((value ?? "") as TimingFilter);
}

function isResultFilter(value: string | null): value is ResultFilter {
  return resultOptions.includes((value ?? "") as ResultFilter);
}

function isSortOption(value: string | null): value is SortOption {
  return sortOptions.includes((value ?? "") as SortOption);
}

export function normalizeLaunchFilters(
  partial: LaunchesQueryInput,
): LaunchesQueryParams {
  const requestedTiming = partial.timing ?? null;
  const requestedResult = partial.result ?? null;
  const requestedSort = partial.sort ?? null;

  const timing: TimingFilter = isTimingFilter(requestedTiming)
    ? requestedTiming
    : defaultLaunchFilters.timing;
  const result: ResultFilter = isResultFilter(requestedResult)
    ? requestedResult
    : defaultLaunchFilters.result;

  const normalizedResult =
    timing === LaunchTiming.Upcoming ? LaunchResult.All : result;

  return {
    timing,
    result: normalizedResult,
    from: partial.from ?? "",
    to: partial.to ?? "",
    sort: isSortOption(requestedSort)
      ? requestedSort
      : defaultLaunchFilters.sort,
    search: partial.search?.trim() ?? "",
  };
}

export function parseLaunchSearchParams(
  searchParams: URLSearchParams,
): LaunchesQueryParams {
  return normalizeLaunchFilters({
    timing: searchParams.get("timing") ?? undefined,
    result: searchParams.get("result") ?? undefined,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    search: searchParams.get("search") ?? undefined,
  });
}

export function stringifyLaunchSearchParams(
  filters: LaunchesQueryParams,
) {
  const params = new URLSearchParams();

  if (filters.timing !== defaultLaunchFilters.timing) {
    params.set("timing", filters.timing);
  }

  if (filters.result !== defaultLaunchFilters.result) {
    params.set("result", filters.result);
  }

  if (filters.from) {
    params.set("from", filters.from);
  }

  if (filters.to) {
    params.set("to", filters.to);
  }

  if (filters.sort !== defaultLaunchFilters.sort) {
    params.set("sort", filters.sort);
  }

  if (filters.search) {
    params.set("search", filters.search);
  }

  return params;
}

export function buildLaunchesQueryPayload(
  filters: LaunchesQueryParams,
  page: number,
  limit = PAGE_SIZE,
) {
  const query: Record<string, unknown> = {};
  const dateUtcQuery: Record<string, string> = {};

  if (filters.timing === LaunchTiming.Upcoming) {
    query.upcoming = true;
  }

  if (filters.timing === LaunchTiming.Past) {
    query.upcoming = false;
  }

  if (filters.result === LaunchResult.Success) {
    query.success = true;
  }

  if (filters.result === LaunchResult.Failure) {
    query.success = false;
  }

  if (filters.from || filters.to) {
    if (filters.from) {
      dateUtcQuery.$gte = new Date(`${filters.from}T00:00:00.000Z`).toISOString();
    }

    if (filters.to) {
      dateUtcQuery.$lte = new Date(`${filters.to}T23:59:59.999Z`).toISOString();
    }
  }

  if (Object.keys(dateUtcQuery).length > 0) {
    query.date_utc = dateUtcQuery;
  }

  if (filters.search) {
    query.name = {
      $regex: escapeMissionSearch(filters.search),
      $options: "i",
    };
  }

  const sort = getLaunchSort(filters.sort);

  return {
    query,
    options: {
      page,
      limit,
      sort,
    },
  };
}

function getLaunchSort(sort: SortOption): LaunchSort {
  switch (sort) {
    case LaunchSortOption.DateAsc:
      return { date_utc: "asc" };
    case LaunchSortOption.NameAsc:
      return { name: "asc" };
    case LaunchSortOption.NameDesc:
      return { name: "desc" };
    case LaunchSortOption.DateDesc:
    default:
      return { date_utc: "desc" };
  }
}

export function isLaunchUpcoming(dateUtc: string, now = new Date()) {
  return new Date(dateUtc).getTime() > now.getTime();
}

export function toFavoriteLaunch(launch: {
  id: string;
  name: string;
  date_utc: string;
  success: boolean | null;
  upcoming: boolean;
  rocket: string;
  launchpad: string;
  links: {
    patch: {
      small: string | null;
      large: string | null;
    };
  };
}): FavoriteLaunch {
  return {
    id: launch.id,
    name: launch.name,
    date_utc: launch.date_utc,
    success: launch.success,
    upcoming: launch.upcoming,
    patch: launch.links.patch.small ?? launch.links.patch.large,
    rocketId: launch.rocket,
    launchpadId: launch.launchpad,
  };
}
