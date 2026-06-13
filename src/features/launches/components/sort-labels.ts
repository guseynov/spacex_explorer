import { LaunchSortOption } from "@/lib/api/query-builder";

export const sortLabels = {
  [LaunchSortOption.DateDesc]: "Newest first",
  [LaunchSortOption.DateAsc]: "Oldest first",
  [LaunchSortOption.NameAsc]: "Mission name: A-Z",
  [LaunchSortOption.NameDesc]: "Mission name: Z-A",
} as const;
