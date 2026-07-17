"use client";

import type { Route } from "next";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";
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
  const serializedSearchParams = searchParams.toString();
  const filters = useMemo(
    () => parseEventSearchParams(new URLSearchParams(serializedSearchParams)),
    [serializedSearchParams],
  );
  const currentRoute = buildRouteWithQuery(pathname, serializedSearchParams);

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
