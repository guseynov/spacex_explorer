import type { Event, EventListPage } from "./event-schemas";
import {
  EventSortOption,
  EventStatusFilter,
  type EventListQueryParams,
  type EventSortOptionValue,
} from "./event-query-builder";

type TimelineDomain = {
  from: string;
  to: string;
};

export function filterEventsForExplorer(
  events: Event[],
  filters: Pick<EventListQueryParams, "from" | "to" | "search" | "sort">,
) {
  return sortEvents(
    events.filter((event) =>
      isEventWithinDateRange(event, filters.from, filters.to)
      && matchesEventSearch(event, filters.search),
    ),
    filters.sort,
  );
}

export function filterVisibleRangeEvents(
  events: Event[],
  filters: Pick<EventListQueryParams, "search" | "sort"> &
    Partial<Pick<EventListQueryParams, "category" | "status">>,
) {
  return sortEvents(
    events.filter((event) =>
      matchesEventSearch(event, filters.search)
      && (!filters.category || filters.category === "all" || event.categoryId === filters.category)
      && (!filters.status || filters.status === EventStatusFilter.All || event.status === filters.status)
    ),
    filters.sort,
  );
}

export function filterEventsForTimeline(
  events: Event[],
  filters: Pick<EventListQueryParams, "search">,
) {
  return events.filter((event) => matchesEventSearch(event, filters.search));
}

export function buildEventHistogram(
  events: EventListPage["results"],
  domain: TimelineDomain,
  bins: number,
) {
  const values = new Array(bins).fill(0);
  const start = new Date(domain.from).getTime();
  const end = new Date(domain.to).getTime();
  const total = Math.max(end - start, 1);

  for (const event of events) {
    const current = new Date(event.latestDate).getTime();

    if (Number.isNaN(current) || current < start || current > end) {
      continue;
    }

    const ratio = (current - start) / total;
    const index = Math.min(bins - 1, Math.max(0, Math.floor(ratio * bins)));
    values[index] += 1;
  }

  return values;
}

export function sortEvents(events: Event[], sort: EventSortOptionValue) {
  return [...events].sort((left, right) => compareEvents(left, right, sort));
}

export function compareEvents(
  left: Event,
  right: Event,
  sort: EventSortOptionValue,
) {
  switch (sort) {
    case EventSortOption.Oldest:
      return Date.parse(left.latestDate) - Date.parse(right.latestDate);
    case EventSortOption.Title:
      return left.title.localeCompare(right.title, undefined, {
        sensitivity: "base",
      });
    case EventSortOption.Category:
      return left.categoryLabel.localeCompare(right.categoryLabel, undefined, {
        sensitivity: "base",
      });
    case EventSortOption.Severity:
      return (right.magnitudeValue ?? -1) - (left.magnitudeValue ?? -1);
    case EventSortOption.Newest:
    default:
      return Date.parse(right.latestDate) - Date.parse(left.latestDate);
  }
}

export function matchesEventSearch(event: Event, search: string) {
  if (!search) {
    return true;
  }

  const normalizedSearch = search.trim().toLowerCase();
  const fields = [
    event.title,
    event.description,
    event.categoryLabel,
    event.sourceLabel,
    event.coordinateLabel,
    ...event.categories.map((category) => category.title),
    ...event.sources.flatMap((source) => [source.id, source.title, source.url]),
  ];

  return fields.some((value) => value?.toLowerCase().includes(normalizedSearch));
}

export function isEventWithinDateRange(
  event: Event,
  from: string,
  to: string,
) {
  const eventDay = event.latestDate.slice(0, 10);

  return eventDay >= from && eventDay <= to;
}
