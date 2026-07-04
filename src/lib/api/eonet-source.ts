import {
  buildEonetQueryParams,
  LaunchSortOption,
  type LaunchesQueryParams,
  PAGE_SIZE,
} from "./query-builder";
import { LaunchApiError } from "./errors";
import { launchSchema, launchesPageSchema, type Launch } from "./schemas";

const EONET_API_BASE_URL =
  process.env.NASA_EONET_API_BASE_URL ??
  "https://eonet.gsfc.nasa.gov/api/v3";

type EonetCategory = {
  id: string;
  title: string;
  description?: string | null;
};

type EonetSource = {
  id: string;
  url?: string | null;
};

type EonetGeometry = {
  date?: string | null;
  magnitudeValue?: number | null;
  magnitudeUnit?: string | null;
  type?: string | null;
  coordinates?: number[] | null;
};

type EonetEvent = {
  id: string;
  title: string;
  description?: string | null;
  link?: string | null;
  closed?: string | null;
  categories?: EonetCategory[];
  sources?: EonetSource[];
  geometry?: EonetGeometry[];
};

type EonetEventsResponse = {
  events?: EonetEvent[];
};

export async function fetchEonetEventsPage(
  filters: LaunchesQueryParams,
  page: number,
) {
  const events = await fetchFilteredEvents(filters);
  const startIndex = Math.max(page - 1, 0) * PAGE_SIZE;
  const pageResults = events.slice(startIndex, startIndex + PAGE_SIZE).map(mapEventToLaunch);

  return launchesPageSchema.parse({
    count: events.length,
    next: startIndex + PAGE_SIZE < events.length ? String(page + 1) : null,
    previous: page > 1 ? String(page - 1) : null,
    results: pageResults,
  });
}

export async function fetchEonetEventById(id: string) {
  const event = await fetchEonetJson<EonetEvent>(`/events/${encodeURIComponent(id)}`);

  return launchSchema.parse(mapEventToLaunch(event));
}

export async function fetchEonetTrendEvents() {
  const now = new Date();
  const startYear = now.getUTCFullYear() - 4;
  const params = new URLSearchParams({
    status: "all",
    start: `${startYear}-01-01`,
    end: now.toISOString().slice(0, 10),
    limit: "5000",
  });
  const response = await fetchEonetJson<EonetEventsResponse>(`/events?${params.toString()}`);

  return (response.events ?? []).map((event) => ({
    net: getLatestGeometry(event.geometry)?.date ?? event.closed ?? now.toISOString(),
    status: toEventStatus(event),
  }));
}

async function fetchFilteredEvents(filters: LaunchesQueryParams) {
  const params = buildEonetQueryParams(filters);
  const response = await fetchEonetJson<EonetEventsResponse>(`/events?${params.toString()}`);
  const events = response.events ?? [];

  return events
    .filter((event) => matchesSearch(event, filters.search))
    .sort((left, right) => compareEvents(left, right, filters.sort));
}

async function fetchEonetJson<T>(path: string) {
  const response = await fetch(`${EONET_API_BASE_URL}${path}`, {
    headers: {
      accept: "application/json",
    },
    next: {
      revalidate: 300,
    },
  });

  if (!response.ok) {
    throw new LaunchApiError(
      `EONET request failed with status ${response.status}.`,
      response.status,
    );
  }

  return (await response.json()) as T;
}

function matchesSearch(event: EonetEvent, search: string) {
  if (!search) {
    return true;
  }

  const normalizedSearch = search.trim().toLowerCase();
  const fields = [
    event.title,
    event.description,
    ...(event.categories ?? []).map((category) => category.title),
    ...(event.sources ?? []).flatMap((source) => [source.id, source.url]),
  ];

  return fields.some((value) => value?.toLowerCase().includes(normalizedSearch));
}

function compareEvents(left: EonetEvent, right: EonetEvent, sort: LaunchesQueryParams["sort"]) {
  if (sort === LaunchSortOption.NameAsc || sort === LaunchSortOption.NameDesc) {
    const comparison = left.title.localeCompare(right.title, undefined, {
      sensitivity: "base",
    });

    return sort === LaunchSortOption.NameAsc ? comparison : comparison * -1;
  }

  const leftDate = Date.parse(getLatestGeometry(left.geometry)?.date ?? left.closed ?? "");
  const rightDate = Date.parse(getLatestGeometry(right.geometry)?.date ?? right.closed ?? "");

  if (sort === LaunchSortOption.DateAsc) {
    return leftDate - rightDate;
  }

  return rightDate - leftDate;
}

function mapEventToLaunch(event: EonetEvent): Launch {
  const primaryCategory = event.categories?.[0];
  const primarySource = event.sources?.[0];
  const latestGeometry = getLatestGeometry(event.geometry);
  const inferredCountry = inferCountryFromTitle(event.title);
  const coordinates = formatCoordinates(latestGeometry?.coordinates);
  const geometrySummary = buildGeometrySummary(latestGeometry);
  const sourceLabel = primarySource?.id
    ? `Source: ${primarySource.id}`
    : "Source record";
  const sourceUrl = primarySource?.url ?? null;

  return {
    id: event.id,
    name: event.title,
    net: latestGeometry?.date ?? event.closed ?? new Date().toISOString(),
    status: toEventStatus(event),
    image: null,
    infographic: null,
    failreason: geometrySummary,
    agency_launch_attempt_count: null,
    orbital_launch_attempt_count: null,
    mission: {
      name: event.title,
      description: buildEventDescription(event, latestGeometry),
      image: null,
      info_urls: sourceUrl ? [sourceUrl] : [],
      vid_urls: [],
    },
    rocket: {
      id: primaryCategory?.id ?? "uncategorized",
      configuration: {
        id: primaryCategory?.id ?? "uncategorized",
        name: primaryCategory?.title ?? "Uncategorized",
        full_name: primaryCategory?.title ?? "Uncategorized",
        variant: event.closed ? "Closed event" : "Active event",
        description:
          primaryCategory?.description ??
          "Natural event tracked in NASA's EONET catalog.",
        maiden_flight: latestGeometry?.date ?? null,
        successful_launches: null,
        total_launch_count: null,
        manufacturer: primarySource
          ? {
              name: primarySource.id,
              country: [],
            }
          : null,
        image: null,
      },
    },
    pad: {
      id: event.id,
      name: sourceLabel,
      active: !event.closed,
      description: sourceUrl ?? geometrySummary,
      map_image: null,
      total_launch_count: null,
      orbital_launch_attempt_count: null,
      image: null,
      location: {
        name: coordinates ?? "Coordinates unavailable",
        description: geometrySummary,
        timezone_name: null,
        country: inferredCountry,
      },
      country: inferredCountry,
    },
    info_urls: sourceUrl ? [sourceUrl] : [],
    vid_urls: [],
    mission_patches: [],
    program: [],
  };
}

function toEventStatus(event: Pick<EonetEvent, "closed">) {
  if (event.closed) {
    return {
      id: 2,
      name: "Closed Event",
      abbrev: "Closed",
      description: "The event has concluded.",
    };
  }

  return {
    id: 1,
    name: "Active Event",
    abbrev: "Active",
    description: "The event is still open.",
  };
}

function getLatestGeometry(geometry: EonetGeometry[] | undefined) {
  if (!geometry || geometry.length === 0) {
    return null;
  }

  return [...geometry].sort((left, right) =>
    Date.parse(right.date ?? "") - Date.parse(left.date ?? ""),
  )[0] ?? null;
}

function buildEventDescription(event: EonetEvent, geometry: EonetGeometry | null) {
  const summary = [
    event.description,
    event.categories?.length
      ? `Categories: ${event.categories.map((category) => category.title).join(", ")}.`
      : null,
    geometry ? `Latest observed ${buildGeometrySummary(geometry)}.` : null,
    event.sources?.length
      ? `Sources: ${event.sources.map((source) => source.id).join(", ")}.`
      : null,
  ].filter(Boolean);

  return summary.join(" ");
}

function buildGeometrySummary(geometry: EonetGeometry | null) {
  if (!geometry) {
    return null;
  }

  const parts = [
    geometry.type ? `${geometry.type} geometry` : null,
    geometry.magnitudeValue != null
      ? `magnitude ${geometry.magnitudeValue}${geometry.magnitudeUnit ? ` ${geometry.magnitudeUnit}` : ""}`
      : null,
    geometry.date ? `at ${geometry.date}` : null,
  ].filter(Boolean);

  return parts.join(" · ") || null;
}

function formatCoordinates(coordinates: number[] | null | undefined) {
  if (!coordinates || coordinates.length < 2) {
    return null;
  }

  const [longitude, latitude] = coordinates;

  return `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
}

function inferCountryFromTitle(title: string) {
  const match = title.match(/\sin\s([A-Za-z.'\- ]+?)(?:\s\d.*)?$/);

  if (!match?.[1]) {
    return null;
  }

  return {
    name: match[1].trim(),
  };
}
