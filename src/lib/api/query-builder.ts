import type { FavoriteLaunch, Launch } from "./schemas";

export const PAGE_SIZE = 12;
export const DEFAULT_RECENT_DAYS = 90;

export const LaunchTiming = {
  All: "all",
  Upcoming: "upcoming",
  Past: "past",
} as const;

export const EventCategory = {
  All: "all",
} as const;

export const LaunchSortOption = {
  DateDesc: "date_desc",
  DateAsc: "date_asc",
  NameAsc: "name_asc",
  NameDesc: "name_desc",
} as const;

export const timingOptions = Object.values(LaunchTiming);
export const sortOptions = Object.values(LaunchSortOption);

export type TimingFilter = (typeof timingOptions)[number];
export type SortOption = (typeof sortOptions)[number];

export const eventCategoryOptions = [
  { value: EventCategory.All, label: "All categories" },
  { value: "wildfires", label: "Wildfires" },
  { value: "severeStorms", label: "Severe storms" },
  { value: "floods", label: "Floods" },
  { value: "earthquakes", label: "Earthquakes" },
  { value: "volcanoes", label: "Volcanoes" },
  { value: "landslides", label: "Landslides" },
  { value: "drought", label: "Drought" },
  { value: "snow", label: "Snow" },
  { value: "tempExtremes", label: "Temperature extremes" },
  { value: "dustHaze", label: "Dust and haze" },
  { value: "seaLakeIce", label: "Sea and lake ice" },
  { value: "waterColor", label: "Water color" },
  { value: "manmade", label: "Manmade" },
] as const;

export type LaunchesQueryParams = {
  timing: TimingFilter;
  category: string;
  from: string;
  to: string;
  sort: SortOption;
  search: string;
};

type LaunchesQueryInput = Partial<Record<keyof LaunchesQueryParams, string>>;

export const defaultLaunchFilters: LaunchesQueryParams = {
  timing: LaunchTiming.All,
  category: EventCategory.All,
  from: "",
  to: "",
  sort: LaunchSortOption.DateDesc,
  search: "",
};

function isTimingFilter(value: string | null): value is TimingFilter {
  return timingOptions.includes((value ?? "") as TimingFilter);
}

function isSortOption(value: string | null): value is SortOption {
  return sortOptions.includes((value ?? "") as SortOption);
}

export function normalizeLaunchFilters(
  partial: LaunchesQueryInput,
): LaunchesQueryParams {
  const requestedTiming = partial.timing ?? null;
  const requestedSort = partial.sort ?? null;

  return {
    timing: isTimingFilter(requestedTiming)
      ? requestedTiming
      : defaultLaunchFilters.timing,
    category: partial.category?.trim() || defaultLaunchFilters.category,
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
    category: searchParams.get("category") ?? undefined,
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
  if (filters.category !== defaultLaunchFilters.category) {
    params.set("category", filters.category);
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

export function countActiveLaunchFilters(filters: LaunchesQueryParams) {
  return getActiveLaunchFilterLabels(filters).length;
}

export function getActiveLaunchFilterLabels(filters: LaunchesQueryParams) {
  const labels: string[] = [];

  if (filters.search) {
    labels.push(`Search: ${filters.search}`);
  }

  if (filters.timing === LaunchTiming.Upcoming) {
    labels.push("State: active");
  } else if (filters.timing === LaunchTiming.Past) {
    labels.push("State: closed");
  }

  if (filters.category !== EventCategory.All) {
    labels.push(`Category: ${getEventCategoryLabel(filters.category)}`);
  }

  if (filters.from || filters.to) {
    labels.push(
      `Dates: ${filters.from || "Any start"} to ${filters.to || "Any end"}`,
    );
  }

  if (filters.sort !== LaunchSortOption.DateDesc) {
    labels.push(`Sort: ${getLaunchSortLabel(filters.sort)}`);
  }

  return labels;
}

export function buildEonetQueryParams(
  filters: LaunchesQueryParams,
  now = new Date(),
) {
  const params = new URLSearchParams({
    limit: "1000",
  });
  const hasDateRange = Boolean(filters.from || filters.to);

  if (filters.timing === LaunchTiming.Upcoming) {
    params.set("status", "open");
  } else if (filters.timing === LaunchTiming.Past) {
    params.set("status", "closed");
  } else {
    params.set("status", "all");
  }

  if (filters.category !== EventCategory.All) {
    params.set("category", filters.category);
  }

  if (hasDateRange) {
    if (filters.from) {
      params.set("start", filters.from);
    }
    if (filters.to) {
      params.set("end", filters.to);
    }
  } else if (filters.timing !== LaunchTiming.Upcoming) {
    params.set("days", String(DEFAULT_RECENT_DAYS));
  } else {
    const oneYearAgo = new Date(now);
    oneYearAgo.setUTCFullYear(now.getUTCFullYear() - 1);
    params.set("start", oneYearAgo.toISOString().slice(0, 10));
  }

  return params;
}

function getLaunchSortLabel(sort: SortOption) {
  switch (sort) {
    case LaunchSortOption.DateAsc:
      return "Oldest first";
    case LaunchSortOption.NameAsc:
      return "Event title: A-Z";
    case LaunchSortOption.NameDesc:
      return "Event title: Z-A";
    case LaunchSortOption.DateDesc:
    default:
      return "Newest first";
  }
}

export function getEventCategoryLabel(category: string) {
  return eventCategoryOptions.find((option) => option.value === category)?.label
    ?? category;
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
    rocketName:
      launch.rocket?.configuration?.full_name ??
      launch.rocket?.configuration?.name ??
      "Uncategorized",
    padName: launch.pad?.name ?? undefined,
    locationName:
      launch.pad?.location?.name ??
      launch.pad?.country?.name ??
      undefined,
    flightNumber: null,
  };
}
