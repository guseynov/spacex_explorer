import { createHash } from "node:crypto";
import type { EonetCoordinateNode } from "./types";

export type EonetCoordinate = readonly [number, number];

export function collectCoordinatePairs(
  coordinates: EonetCoordinateNode | null | undefined,
): EonetCoordinate[] {
  if (coordinates == null || typeof coordinates === "number") {
    return [];
  }

  if (isCoordinatePair(coordinates)) {
    return isValidCoordinatePair(coordinates)
      ? [[coordinates[0], coordinates[1]]]
      : [];
  }

  return coordinates.flatMap((value) => collectCoordinatePairs(value));
}

export function extractRepresentativeCoordinate(
  coordinates: EonetCoordinateNode | null | undefined,
): EonetCoordinate | null {
  const pairs = collectCoordinatePairs(coordinates);

  if (pairs.length === 0) {
    return null;
  }

  if (pairs.length === 1) {
    return pairs[0];
  }

  const longitudes = pairs.map(([longitude]) => longitude);
  const latitudes = pairs.map(([, latitude]) => latitude);

  return [
    averageWrappedLongitude(longitudes),
    (Math.min(...latitudes) + Math.max(...latitudes)) / 2,
  ];
}

export function isValidCoordinatePair(
  coordinates: readonly [number, number],
): coordinates is EonetCoordinate {
  const [longitude, latitude] = coordinates;

  return Number.isFinite(longitude)
    && Number.isFinite(latitude)
    && longitude >= -180
    && longitude <= 180
    && latitude >= -90
    && latitude <= 90;
}

export function buildCoordinateHash(input: {
  geometryType: string | null | undefined;
  observedAt: string | null | undefined;
  coordinate: EonetCoordinate | null | undefined;
  magnitudeValue?: number | null | undefined;
  magnitudeUnit?: string | null | undefined;
}) {
  const payload = [
    input.geometryType ?? "",
    input.observedAt ?? "",
    input.coordinate?.[0]?.toFixed(6) ?? "",
    input.coordinate?.[1]?.toFixed(6) ?? "",
    input.magnitudeValue ?? "",
    input.magnitudeUnit ?? "",
  ].join("|");

  return createHash("sha1").update(payload).digest("hex");
}

export function formatCoordinateLabel(
  coordinates: EonetCoordinate | null,
) {
  if (!coordinates) {
    return null;
  }

  const [longitude, latitude] = coordinates;

  return `${formatSignedCoordinate(latitude, "N", "S")}, ${formatSignedCoordinate(longitude, "E", "W")}`;
}

function averageWrappedLongitude(longitudes: number[]) {
  const wrapped = longitudes.map((longitude) => (
    longitude < 0 ? longitude + 360 : longitude
  ));
  const center = (Math.min(...wrapped) + Math.max(...wrapped)) / 2;

  return center > 180 ? center - 360 : center;
}

function formatSignedCoordinate(
  value: number,
  positiveSuffix: string,
  negativeSuffix: string,
) {
  const suffix = value >= 0 ? positiveSuffix : negativeSuffix;

  return `${Math.abs(value).toFixed(2)}° ${suffix}`;
}

function isCoordinatePair(
  value: readonly EonetCoordinateNode[],
): value is EonetCoordinate {
  return value.length >= 2
    && typeof value[0] === "number"
    && typeof value[1] === "number";
}
