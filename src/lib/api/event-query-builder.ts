import { formatISO, subDays } from "date-fns";
import type { Event, FavoriteEvent } from "./event-schemas";

export const EVENT_PAGE_SIZE = 1000;
export const DEFAULT_TIMELINE_DAYS = 90;
export const TIMELINE_DOMAIN_START = "2018-01-01";

export const EventStatusFilter = {
  All: "all",
  Active: "active",
  Closed: "closed",
} as const;

export const EventSortOption = {
  Newest: "newest",
  Oldest: "oldest",
  Title: "title",
  Severity: "severity",
  Category: "category",
} as const;

export const eventStatusOptions = Object.values(EventStatusFilter);
export const eventSortOptions = Object.values(EventSortOption);

export const eventCategoryOptions = [
  { value: "all", label: "All categories" },
  { value: "wildfires", label: "Wildfires" },
  { value: "severeStorms", label: "Severe storms" },
  { value: "floods", label: "Floods" },
  { value: "volcanoes", label: "Volcanoes" },
  { value: "seaLakeIce", label: "Sea and lake ice" },
  { value: "drought", label: "Drought" },
  { value: "dustHaze", label: "Dust and haze" },
  { value: "earthquakes", label: "Earthquakes" },
  { value: "landslides", label: "Landslides" },
  { value: "manmade", label: "Manmade" },
] as const;

export type EventStatusFilterValue =
  (typeof eventStatusOptions)[number];
export type EventSortOptionValue =
  (typeof eventSortOptions)[number];

export type EventListQueryParams = {
  status: EventStatusFilterValue;
  category: string;
  from: string;
  to: string;
  sort: EventSortOptionValue;
  search: string;
};

type EventListQueryInput = Partial<Record<keyof EventListQueryParams, string>>;

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function createDefaultEventFilters(now = new Date()): EventListQueryParams {
  return {
    status: EventStatusFilter.All,
    category: "all",
    from: toDateOnly(subDays(now, DEFAULT_TIMELINE_DAYS)),
    to: toDateOnly(now),
    sort: EventSortOption.Newest,
    search: "",
  };
}

export function createBaseEventFilters(
  partial: Partial<Pick<EventListQueryParams, "status" | "category">> = {},
  now = new Date(),
): EventListQueryParams {
  const defaults = createDefaultEventFilters(now);
  const domain = getTimelineDomain(now);

  return {
    status: isEventStatusFilter(partial.status) ? partial.status : defaults.status,
    category: partial.category?.trim() || defaults.category,
    from: domain.min,
    to: domain.max,
    sort: EventSortOption.Newest,
    search: "",
  };
}

export function getTimelineDomain(now = new Date()) {
  return {
    min: TIMELINE_DOMAIN_START,
    max: toDateOnly(now),
  };
}

export function normalizeEventDateRange(
  from: string | undefined,
  to: string | undefined,
  now = new Date(),
) {
  const defaults = createDefaultEventFilters(now);
  const domain = getTimelineDomain(now);
  const safeFrom = isDateOnlyString(from) ? from : defaults.from;
  const safeTo = isDateOnlyString(to) ? to : defaults.to;
  const ordered = safeFrom <= safeTo
    ? { from: safeFrom, to: safeTo }
    : { from: safeTo, to: safeFrom };

  return {
    from: clampDateOnly(ordered.from, domain.min, domain.max),
    to: clampDateOnly(ordered.to, domain.min, domain.max),
  };
}

export function normalizeEventFilters(
  partial: EventListQueryInput,
  now = new Date(),
): EventListQueryParams {
  const defaults = createDefaultEventFilters(now);
  const range = normalizeEventDateRange(partial.from, partial.to, now);

  return {
    status: isEventStatusFilter(partial.status) ? partial.status : defaults.status,
    category: partial.category?.trim() || defaults.category,
    from: range.from,
    to: range.to,
    sort: isEventSortOption(partial.sort) ? partial.sort : defaults.sort,
    search: partial.search?.trim() ?? "",
  };
}

export function parseEventSearchParams(
  searchParams: URLSearchParams,
  now = new Date(),
) {
  return normalizeEventFilters(
    {
      status: searchParams.get("status") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
      sort: searchParams.get("sort") ?? undefined,
      search: searchParams.get("search") ?? undefined,
    },
    now,
  );
}

export function stringifyEventSearchParams(
  filters: EventListQueryParams,
  now = new Date(),
) {
  const params = new URLSearchParams();
  const defaults = createDefaultEventFilters(now);

  if (filters.status !== defaults.status) {
    params.set("status", filters.status);
  }
  if (filters.category !== defaults.category) {
    params.set("category", filters.category);
  }
  if (filters.from !== defaults.from) {
    params.set("from", filters.from);
  }
  if (filters.to !== defaults.to) {
    params.set("to", filters.to);
  }
  if (filters.sort !== defaults.sort) {
    params.set("sort", filters.sort);
  }
  if (filters.search) {
    params.set("search", filters.search);
  }

  return params;
}

export function countActiveEventFilters(filters: EventListQueryParams) {
  return getActiveEventFilterLabels(filters).length;
}

export function getActiveEventFilterLabels(filters: EventListQueryParams) {
  const defaults = createDefaultEventFilters();
  const labels: string[] = [];

  if (filters.search) {
    labels.push(`Search: ${filters.search}`);
  }
  if (filters.status !== defaults.status) {
    labels.push(`Status: ${getEventStatusLabel(filters.status)}`);
  }
  if (filters.category !== defaults.category) {
    labels.push(`Category: ${getEventCategoryLabel(filters.category)}`);
  }
  if (filters.from !== defaults.from || filters.to !== defaults.to) {
    labels.push(`Dates: ${filters.from} to ${filters.to}`);
  }
  if (filters.sort !== defaults.sort) {
    labels.push(`Sort: ${getEventSortLabel(filters.sort)}`);
  }

  return labels;
}

export function buildEonetQueryParams(filters: EventListQueryParams) {
  const params = new URLSearchParams({
    limit: String(EVENT_PAGE_SIZE),
  });

  if (filters.status === EventStatusFilter.Active) {
    params.set("status", "open");
  } else if (filters.status === EventStatusFilter.Closed) {
    params.set("status", "closed");
  } else {
    params.set("status", "all");
  }

  if (filters.category !== "all") {
    params.set("category", filters.category);
  }

  params.set("start", filters.from);
  params.set("end", filters.to);

  return params;
}

export function getEventCategoryLabel(category: string) {
  return eventCategoryOptions.find((option) => option.value === category)?.label
    ?? category;
}

export function getEventStatusLabel(status: EventStatusFilterValue) {
  switch (status) {
    case EventStatusFilter.Active:
      return "Open";
    case EventStatusFilter.Closed:
      return "Closed";
    case EventStatusFilter.All:
    default:
      return "All";
  }
}

export function getEventSortLabel(sort: EventSortOptionValue) {
  switch (sort) {
    case EventSortOption.Oldest:
      return "Oldest first";
    case EventSortOption.Title:
      return "Title";
    case EventSortOption.Severity:
      return "Severity";
    case EventSortOption.Category:
      return "Category";
    case EventSortOption.Newest:
    default:
      return "Newest first";
  }
}

export function toFavoriteEvent(event: Event): FavoriteEvent {
  return {
    id: event.id,
    title: event.title,
    description: event.description ?? null,
    status: event.status,
    latestDate: event.latestDate,
    categoryId: event.categoryId,
    categoryLabel: event.categoryLabel,
    sourceLabel: event.sourceLabel,
    coordinateLabel: event.coordinateLabel ?? null,
    primaryCoordinate: event.primaryCoordinate,
    magnitudeValue: event.magnitudeValue,
    magnitudeUnit: event.magnitudeUnit ?? null,
  };
}

function toDateOnly(value: Date) {
  return formatISO(value, { representation: "date" });
}

function isEventStatusFilter(value: string | undefined): value is EventStatusFilterValue {
  return eventStatusOptions.includes((value ?? "") as EventStatusFilterValue);
}

function isEventSortOption(value: string | undefined): value is EventSortOptionValue {
  return eventSortOptions.includes((value ?? "") as EventSortOptionValue);
}

function isDateOnlyString(value: string | undefined): value is string {
  return Boolean(value && DATE_ONLY_PATTERN.test(value));
}

function clampDateOnly(value: string, min: string, max: string) {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }

  return value;
}
