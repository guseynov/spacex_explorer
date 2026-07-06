"use client";

import type { Route } from "next";
import { usePathname, useSearchParams } from "next/navigation";
import {
  createDefaultEventFilters,
  normalizeEventFilters,
  parseEventSearchParams,
  stringifyEventSearchParams,
  type EventListQueryParams,
} from "@/lib/api/event-query-builder";

export function useEventFilters() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = parseEventSearchParams(new URLSearchParams(searchParams));
  const currentRoute = buildRouteWithQuery(pathname, searchParams.toString());

  const setFilters = (
    updates:
      | Partial<EventListQueryParams>
      | ((current: EventListQueryParams) => Partial<EventListQueryParams>),
  ) => {
    const nextPatch = typeof updates === "function" ? updates(filters) : updates;
    const nextFilters = normalizeEventFilters({
      ...filters,
      ...nextPatch,
    });
    const nextRoute = buildRouteWithQuery(
      pathname,
      stringifyEventSearchParams(nextFilters).toString(),
    );

    if (nextRoute === currentRoute) {
      return;
    }

    window.history.replaceState(null, "", nextRoute);
  };

  const resetFilters = () => {
    const nextRoute = buildRouteWithQuery(
      pathname,
      stringifyEventSearchParams(createDefaultEventFilters()).toString(),
    );

    if (nextRoute === currentRoute) {
      return;
    }

    window.history.replaceState(null, "", nextRoute);
  };

  return {
    filters,
    setFilters,
    resetFilters,
  };
}

function buildRouteWithQuery(pathname: string, query: string) {
  if (!query) {
    return pathname as Route;
  }

  return `${pathname}?${query}` as Route;
}
