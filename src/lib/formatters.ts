import { format } from "date-fns";

export const LaunchStatusTone = {
  Upcoming: "upcoming",
  Past: "past",
  Success: "success",
  Failure: "failure",
  Pending: "pending",
} as const;

export const LaunchStatusLabel = {
  Upcoming: "Active",
  Past: "Closed",
  Success: "Closed",
  Failure: "Active",
  Pending: "Active",
  Unknown: "Unknown",
} as const;

export type LaunchTone = (typeof LaunchStatusTone)[keyof typeof LaunchStatusTone];

export function formatLaunchDate(dateUtc: string) {
  return format(new Date(dateUtc), "MMM d, yyyy 'at' HH:mm 'UTC'");
}

export function formatLaunchDateLocal(dateLocal: string) {
  return format(new Date(dateLocal), "MMM d, yyyy 'at' p");
}

export function getLaunchStatusLabel(
  _net: string,
  statusId: number,
) {
  if (statusId === 1) {
    return LaunchStatusLabel.Upcoming;
  }

  if (statusId === 2) {
    return LaunchStatusLabel.Past;
  }

  return LaunchStatusLabel.Unknown;
}

export function getLaunchStatusTone(
  _net: string,
  statusId: number,
) {
  if (statusId === 1) {
    return LaunchStatusTone.Upcoming;
  }

  if (statusId === 2) {
    return LaunchStatusTone.Past;
  }

  return LaunchStatusTone.Pending;
}

export function getLaunchTimingLabel(_net: string, statusId: number) {
  return statusId === 2
    ? LaunchStatusLabel.Past
    : LaunchStatusLabel.Upcoming;
}

export function getLaunchOutcomeLabel(
  _net: string,
  statusId: number,
) {
  if (statusId === 2) {
    return LaunchStatusLabel.Past;
  }

  if (statusId === 1) {
    return LaunchStatusLabel.Pending;
  }

  return LaunchStatusLabel.Unknown;
}

export function getLaunchTimingTone(_net: string, statusId: number) {
  return statusId === 2
    ? LaunchStatusTone.Past
    : LaunchStatusTone.Upcoming;
}

export function getLaunchOutcomeTone(
  _net: string,
  statusId: number,
) {
  if (statusId === 1) {
    return LaunchStatusTone.Pending;
  }

  if (statusId === 2) {
    return LaunchStatusTone.Past;
  }

  return LaunchStatusTone.Pending;
}

export function isLaunchUpcoming(net: string, now = new Date()) {
  return new Date(net).getTime() > now.getTime();
}
