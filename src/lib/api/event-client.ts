import {
  EVENT_PAGE_SIZE,
  stringifyEventSearchParams,
  type EventListQueryParams,
} from "./event-query-builder";
import { EventApiError } from "./errors";
import {
  eventListPageSchema,
  eventSchema,
} from "./event-schemas";

const BROWSER_API_BASE_URL = "/api/events";

type Parser<T> = { parse: (value: unknown) => T };

async function requestBrowserJson<T>(path: string, parser: Parser<T>) {
  const response = await fetch(`${BROWSER_API_BASE_URL}${path}`, {
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new EventApiError(
      `Event request failed with status ${response.status}.`,
      response.status,
    );
  }

  return parser.parse((await response.json()) as unknown);
}

export function fetchEventsPage(filters: EventListQueryParams, page: number) {
  const params = stringifyEventSearchParams(filters);
  params.set("page", String(page));
  params.set("limit", String(EVENT_PAGE_SIZE));

  return requestBrowserJson(`?${params.toString()}`, eventListPageSchema);
}

export function fetchEventById(id: string) {
  return requestBrowserJson(`/${encodeURIComponent(id)}`, eventSchema);
}

export function fetchEventTimeline(
  filters: Pick<EventListQueryParams, "status" | "category" | "from" | "to"> & {
    bucket?: "day" | "week" | "month";
  },
) {
  const params = new URLSearchParams({
    from: filters.from,
    to: filters.to,
    status: filters.status,
    category: filters.category,
    bucket: filters.bucket ?? "day",
  });

  return requestBrowserJson(
    `/timeline?${params.toString()}`,
    {
      parse: (value: unknown) => value as {
        bucket: "day" | "week" | "month";
        range: { from: string; to: string };
        buckets: Array<{ bucket: string; count: number }>;
        source: "database";
      },
    },
  );
}
