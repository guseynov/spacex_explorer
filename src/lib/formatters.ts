import { format } from "date-fns";

export const LaunchStatusTone = {
  Upcoming: "upcoming",
  Past: "past",
  Success: "success",
  Failure: "failure",
  Pending: "pending",
} as const;

export const LaunchStatusLabel = {
  Upcoming: "Upcoming",
  Past: "Past",
  Success: "Success",
  Failure: "Failure",
  Pending: "Pending",
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
  net: string,
  statusId: number,
) {
  if (isLaunchUpcoming(net)) {
    return LaunchStatusLabel.Upcoming;
  }

  if (statusId === 3) {
    return LaunchStatusLabel.Success;
  }

  if (statusId === 4 || statusId === 7) {
    return LaunchStatusLabel.Failure;
  }

  return LaunchStatusLabel.Unknown;
}

export function getLaunchStatusTone(
  net: string,
  statusId: number,
) {
  if (isLaunchUpcoming(net)) {
    return LaunchStatusTone.Upcoming;
  }

  if (statusId === 3) {
    return LaunchStatusTone.Success;
  }

  return LaunchStatusTone.Failure;
}

export function getLaunchTimingLabel(net: string) {
  return isLaunchUpcoming(net)
    ? LaunchStatusLabel.Upcoming
    : LaunchStatusLabel.Past;
}

export function getLaunchOutcomeLabel(
  net: string,
  statusId: number,
) {
  if (isLaunchUpcoming(net)) {
    return LaunchStatusLabel.Pending;
  }

  if (statusId === 3) {
    return LaunchStatusLabel.Success;
  }

  if (statusId === 4 || statusId === 7) {
    return LaunchStatusLabel.Failure;
  }

  return LaunchStatusLabel.Unknown;
}

export function getLaunchTimingTone(net: string) {
  return isLaunchUpcoming(net)
    ? LaunchStatusTone.Upcoming
    : LaunchStatusTone.Past;
}

export function getLaunchOutcomeTone(
  net: string,
  statusId: number,
) {
  if (isLaunchUpcoming(net)) {
    return LaunchStatusTone.Pending;
  }

  if (statusId === 3) {
    return LaunchStatusTone.Success;
  }

  if (statusId === 4 || statusId === 7) {
    return LaunchStatusTone.Failure;
  }

  return LaunchStatusTone.Pending;
}

export function isLaunchUpcoming(net: string, now = new Date()) {
  return new Date(net).getTime() > now.getTime();
}
