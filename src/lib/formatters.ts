import { format } from "date-fns";
import type { EventStatus } from "./api/event-schemas";

export function formatEventDateTime(dateUtc: string) {
  return format(new Date(dateUtc), "MMM d, yyyy '·' HH:mm 'UTC'");
}

export function formatEventDateLocal(dateLocal: string) {
  return format(new Date(dateLocal), "MMM d, yyyy '·' p");
}

export function formatEventDateOnly(dateUtc: string) {
  return format(new Date(dateUtc), "MMM d, yyyy");
}

export function formatEventRangeLabel(from: string, to: string) {
  return `${formatEventDateOnly(from)} to ${formatEventDateOnly(to)}`;
}

export function getEventStatusLabel(status: EventStatus) {
  return status === "active" ? "Open in feed" : "Closed in feed";
}

export function getEventStatusTone(status: EventStatus) {
  return status === "active" ? "active" : "closed";
}

export function formatMagnitude(
  magnitudeValue: number | null,
  magnitudeUnit: string | null | undefined,
) {
  if (magnitudeValue == null) {
    return "Unavailable";
  }

  return magnitudeUnit
    ? `${magnitudeValue} ${magnitudeUnit}`
    : String(magnitudeValue);
}
