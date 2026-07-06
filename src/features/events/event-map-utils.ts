import type { Event } from "@/lib/api/event-schemas";

export const EVENT_CATEGORY_COLORS: Record<string, string> = {
  wildfires: "#ff7a33",
  severeStorms: "#8b5cf6",
  floods: "#38bdf8",
  volcanoes: "#ef4444",
  seaLakeIce: "#bfe5ff",
  drought: "#facc15",
  dustHaze: "#d9a15d",
  earthquakes: "#a78bfa",
  landslides: "#9a6c3c",
  manmade: "#94a3b8",
  uncategorized: "#7f96b7",
};

export const CATEGORY_LEGEND_ITEMS = [
  { id: "wildfires", label: "Wildfires" },
  { id: "severeStorms", label: "Storms" },
  { id: "floods", label: "Floods" },
  { id: "volcanoes", label: "Volcanoes" },
  { id: "seaLakeIce", label: "Sea & lake ice" },
  { id: "drought", label: "Drought" },
  { id: "dustHaze", label: "Dust & haze" },
] as const;

type EventFeature = {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    id: string;
    title: string;
    categoryId: string;
    categoryLabel: string;
    markerColor: string;
    status: Event["status"];
    latestDate: string;
    sourceLabel: string;
    coordinateLabel: string | null;
  };
};

export type EventFeatureCollection = {
  type: "FeatureCollection";
  features: EventFeature[];
};

export function getEventCategoryColor(categoryId: string) {
  return EVENT_CATEGORY_COLORS[categoryId] ?? EVENT_CATEGORY_COLORS.uncategorized;
}

export function createEventFeatureCollection(
  events: Event[],
): EventFeatureCollection {
  return {
    type: "FeatureCollection",
    features: events.flatMap((event) =>
      event.primaryCoordinate
        ? [
            {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: event.primaryCoordinate,
              },
              properties: {
                id: event.id,
                title: event.title,
                categoryId: event.categoryId,
                categoryLabel: event.categoryLabel,
                markerColor: getEventCategoryColor(event.categoryId),
                status: event.status,
                latestDate: event.latestDate,
                sourceLabel: event.sourceLabel,
                coordinateLabel: event.coordinateLabel ?? null,
              },
            } satisfies EventFeature,
          ]
        : [],
    ),
  };
}

export function getEventBounds(events: Event[]) {
  const coordinates = events
    .map((event) => event.primaryCoordinate)
    .filter((coordinate): coordinate is [number, number] => Boolean(coordinate));

  if (coordinates.length === 0) {
    return null;
  }

  const longitudes = coordinates.map(([longitude]) => longitude);
  const latitudes = coordinates.map(([, latitude]) => latitude);

  return [
    Math.min(...longitudes),
    Math.min(...latitudes),
    Math.max(...longitudes),
    Math.max(...latitudes),
  ] as [number, number, number, number];
}
