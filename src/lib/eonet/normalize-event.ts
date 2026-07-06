import type {
  EonetCategoryRaw,
  EonetEventRaw,
  EonetGeometryRaw,
  EonetSourceRaw,
  NormalizedEonetEvent,
} from "./types";
import {
  buildCoordinateHash,
  extractRepresentativeCoordinate,
} from "./geometry";

export function normalizeEonetEvent(event: EonetEventRaw): NormalizedEonetEvent {
  const categories = (event.categories ?? []).map(normalizeCategory);
  const sources = (event.sources ?? []).map(normalizeSource);
  const geometries = normalizeGeometries(event.geometry ?? []);
  const latestGeometry = getLatestGeometry(geometries);
  const firstObservedAt = getFirstObservedAt(geometries);
  const latestObservedAt = latestGeometry?.observedAt ?? parseDateOnly(event.closed);
  const primaryCoordinate =
    latestGeometry?.longitude != null && latestGeometry?.latitude != null
      ? [latestGeometry.longitude, latestGeometry.latitude] as const
      : getFirstCoordinate(geometries);
  const primaryCategory = categories[0] ?? null;
  const primarySource = sources[0] ?? null;
  const description = normalizeText(event.description);
  const searchText = buildSearchText(event, categories, sources, geometries);

  return {
    id: event.id,
    title: event.title,
    description: description ?? null,
    link: normalizeText(event.link),
    status: event.closed ? "closed" : "active",
    closedAt: parseDateOnly(event.closed),
    firstObservedAt,
    latestObservedAt,
    primaryCategoryId: primaryCategory?.id ?? null,
    primaryCategoryTitle: primaryCategory?.title ?? null,
    primarySourceId: primarySource?.id ?? null,
    primarySourceTitle: primarySource?.title ?? primarySource?.id ?? null,
    primaryLongitude: primaryCoordinate?.[0] ?? null,
    primaryLatitude: primaryCoordinate?.[1] ?? null,
    searchText,
    raw: event,
    upstreamUpdatedAt: latestObservedAt ?? parseDateOnly(event.closed),
    categories,
    sources,
    geometries,
  };
}

function normalizeGeometries(geometries: EonetGeometryRaw[]) {
  return geometries
    .map((geometry) => {
      const observedAt = parseDateOnly(geometry.date);
      const coordinate = extractRepresentativeCoordinate(geometry.coordinates);
      const geometryType = normalizeText(geometry.type);

      return {
        observedAt,
        geometryType,
        longitude: coordinate?.[0] ?? null,
        latitude: coordinate?.[1] ?? null,
        magnitudeValue: geometry.magnitudeValue ?? null,
        magnitudeUnit: normalizeText(geometry.magnitudeUnit),
        magnitudeDescription: normalizeText(geometry.magnitudeDescription),
        coordinateHash: buildCoordinateHash({
          geometryType,
          observedAt: observedAt?.toISOString() ?? null,
          coordinate,
          magnitudeValue: geometry.magnitudeValue ?? null,
          magnitudeUnit: normalizeText(geometry.magnitudeUnit),
        }),
        raw: geometry,
      };
    })
    .filter((geometry, index, values) => (
      values.findIndex((candidate) => candidate.coordinateHash === geometry.coordinateHash) === index
    ));
}

function normalizeCategory(category: EonetCategoryRaw) {
  return {
    id: category.id,
    title: category.title,
    description: normalizeText(category.description),
    raw: category,
  };
}

function normalizeSource(source: EonetSourceRaw) {
  return {
    id: source.id,
    title: normalizeText(source.title),
    sourceUrl: normalizeText(source.url),
    raw: source,
  };
}

function buildSearchText(
  event: EonetEventRaw,
  categories: ReturnType<typeof normalizeCategory>[],
  sources: ReturnType<typeof normalizeSource>[],
  geometries: ReturnType<typeof normalizeGeometries>,
) {
  return [
    event.title,
    event.description,
    ...categories.flatMap((category) => [category.id, category.title, category.description]),
    ...sources.flatMap((source) => [source.id, source.title, source.sourceUrl]),
    ...geometries.flatMap((geometry) => [
      geometry.geometryType,
      geometry.magnitudeDescription,
      geometry.magnitudeUnit,
      geometry.observedAt?.toISOString(),
      geometry.longitude?.toFixed(4),
      geometry.latitude?.toFixed(4),
    ]),
  ]
    .filter(Boolean)
    .map((value) => value!.toLowerCase())
    .join(" ");
}

function getLatestGeometry(
  geometries: ReturnType<typeof normalizeGeometries>,
) {
  return [...geometries].sort((left, right) => {
    const leftTime = left.observedAt?.getTime() ?? 0;
    const rightTime = right.observedAt?.getTime() ?? 0;

    return rightTime - leftTime;
  })[0] ?? null;
}

function getFirstObservedAt(
  geometries: ReturnType<typeof normalizeGeometries>,
) {
  const first = [...geometries]
    .map((geometry) => geometry.observedAt)
    .filter((value): value is Date => Boolean(value))
    .sort((left, right) => left.getTime() - right.getTime())[0];

  return first ?? null;
}

function getFirstCoordinate(
  geometries: ReturnType<typeof normalizeGeometries>,
) {
  const geometry = geometries.find(
    (value) => value.longitude != null && value.latitude != null,
  );

  return geometry?.longitude != null && geometry?.latitude != null
    ? [geometry.longitude, geometry.latitude] as const
    : null;
}

function parseDateOnly(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeText(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  return trimmed || null;
}
