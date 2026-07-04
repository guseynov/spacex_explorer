import { LaunchSortOption } from "@/lib/api/query-builder";

export const sortLabels = {
  [LaunchSortOption.DateDesc]: "Newest activity",
  [LaunchSortOption.DateAsc]: "Oldest activity",
  [LaunchSortOption.NameAsc]: "Event title: A-Z",
  [LaunchSortOption.NameDesc]: "Event title: Z-A",
} as const;
