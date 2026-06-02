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
  upcoming: boolean,
  success: boolean | null,
) {
  if (upcoming) {
    return LaunchStatusLabel.Upcoming;
  }

  if (success === true) {
    return LaunchStatusLabel.Success;
  }

  if (success === false) {
    return LaunchStatusLabel.Failure;
  }

  return LaunchStatusLabel.Unknown;
}

export function getLaunchStatusTone(
  upcoming: boolean,
  success: boolean | null,
) {
  if (upcoming) {
    return LaunchStatusTone.Upcoming;
  }

  if (success === true) {
    return LaunchStatusTone.Success;
  }

  return LaunchStatusTone.Failure;
}

export function getLaunchTimingLabel(upcoming: boolean) {
  return upcoming ? LaunchStatusLabel.Upcoming : LaunchStatusLabel.Past;
}

export function getLaunchOutcomeLabel(
  upcoming: boolean,
  success: boolean | null,
) {
  if (upcoming) {
    return LaunchStatusLabel.Pending;
  }

  if (success === true) {
    return LaunchStatusLabel.Success;
  }

  if (success === false) {
    return LaunchStatusLabel.Failure;
  }

  return LaunchStatusLabel.Unknown;
}

export function getLaunchTimingTone(upcoming: boolean) {
  return upcoming ? LaunchStatusTone.Upcoming : LaunchStatusTone.Past;
}

export function getLaunchOutcomeTone(
  upcoming: boolean,
  success: boolean | null,
) {
  if (upcoming) {
    return LaunchStatusTone.Pending;
  }

  if (success === true) {
    return LaunchStatusTone.Success;
  }

  return LaunchStatusTone.Failure;
}
