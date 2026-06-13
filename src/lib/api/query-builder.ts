import type { FavoriteLaunch, Launch } from "./schemas";

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

export const defaultLaunchFilters: LaunchesQueryParams = {
  timing: LaunchTiming.All,
  result: LaunchResult.All,
  from: "",
  to: "",
  sort: LaunchSortOption.DateDesc,
  search: "",
};

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

  return {
    timing,
    result: timing === LaunchTiming.Upcoming ? LaunchResult.All : result,
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

export function stringifyLaunchSearchParams(filters: LaunchesQueryParams) {
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

export function buildLaunchLibraryQueryParams(
  filters: LaunchesQueryParams,
  page: number,
  limit = PAGE_SIZE,
  now = new Date(),
) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(Math.max(page - 1, 0) * limit),
    mode: "normal",
    ordering: getLaunchLibraryOrdering(filters.sort),
  });
  const fromCandidates: Date[] = [];
  const toCandidates: Date[] = [];

  if (filters.from) {
    fromCandidates.push(new Date(`${filters.from}T00:00:00.000Z`));
  }
  if (filters.to) {
    toCandidates.push(new Date(`${filters.to}T23:59:59.999Z`));
  }
  if (filters.timing === LaunchTiming.Upcoming) {
    fromCandidates.push(now);
  }
  if (filters.timing === LaunchTiming.Past) {
    toCandidates.push(now);
  }

  if (fromCandidates.length > 0) {
    params.set(
      "net__gte",
      new Date(Math.max(...fromCandidates.map((date) => date.getTime()))).toISOString(),
    );
  }
  if (toCandidates.length > 0) {
    params.set(
      "net__lte",
      new Date(Math.min(...toCandidates.map((date) => date.getTime()))).toISOString(),
    );
  }
  if (filters.result === LaunchResult.Success) {
    params.set("status", "3");
  }
  if (filters.result === LaunchResult.Failure) {
    params.set("status__ids", "4,7");
  }
  if (filters.search) {
    params.set("search", filters.search);
  }

  return params;
}

function getLaunchLibraryOrdering(sort: SortOption) {
  switch (sort) {
    case LaunchSortOption.DateAsc:
      return "net";
    case LaunchSortOption.NameAsc:
      return "name";
    case LaunchSortOption.NameDesc:
      return "-name";
    case LaunchSortOption.DateDesc:
    default:
      return "-net";
  }
}

export function toFavoriteLaunch(launch: Launch): FavoriteLaunch {
  return {
    id: launch.id,
    name: launch.name,
    net: launch.net,
    status: launch.status,
    imageUrl:
      launch.image?.thumbnail_url ??
      launch.image?.image_url ??
      null,
  };
}
