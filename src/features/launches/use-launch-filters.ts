"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  defaultLaunchFilters,
  normalizeLaunchFilters,
  parseLaunchSearchParams,
  stringifyLaunchSearchParams,
  type LaunchesQueryParams,
} from "@/lib/api/query-builder";

export function useLaunchFilters() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = parseLaunchSearchParams(new URLSearchParams(searchParams));

  const setFilters = (
    updates:
      | Partial<LaunchesQueryParams>
      | ((current: LaunchesQueryParams) => Partial<LaunchesQueryParams>),
  ) => {
    const nextPatch = resolveFilterUpdates(updates, filters);
    const nextFilters = normalizeLaunchFilters({
      ...filters,
      ...nextPatch,
    });
    const nextRoute = buildRouteWithQuery(
      pathname,
      stringifyLaunchSearchParams(nextFilters).toString(),
    );

    router.replace(nextRoute, {
      scroll: false,
    });
  };

  const resetFilters = () => {
    const nextRoute = buildRouteWithQuery(
      pathname,
      stringifyLaunchSearchParams(defaultLaunchFilters).toString(),
    );

    router.replace(nextRoute, {
      scroll: false,
    });
  };

  return {
    filters,
    setFilters,
    resetFilters,
  };
}

function resolveFilterUpdates(
  updates:
    | Partial<LaunchesQueryParams>
    | ((current: LaunchesQueryParams) => Partial<LaunchesQueryParams>),
  filters: LaunchesQueryParams,
) {
  if (typeof updates === "function") {
    return updates(filters);
  }

  return updates;
}

function buildRouteWithQuery(pathname: string, query: string) {
  if (!query) {
    return pathname as Route;
  }

  return `${pathname}?${query}` as Route;
}
