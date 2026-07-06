import { EVENT_PAGE_SIZE, type EventListQueryParams } from "./event-query-builder";
import type { Event, EventListPage } from "./event-schemas";
import {
  getEventSyncStatus,
  queryEventRepositoryById,
  queryEventRepositoryPage,
  queryEventRepositoryTimeline,
} from "@/lib/eonet/repository";
import { syncRecentEvents } from "@/lib/eonet/sync-service";

export async function readEventStoreSnapshot() {
  return {
    syncedAt: null,
    events: [],
  };
}

export async function writeEventStoreSnapshot() {
  throw new Error("writeEventStoreSnapshot is no longer supported.");
}

export async function queryEventStorePage(
  filters: EventListQueryParams,
  page: number,
  limit = EVENT_PAGE_SIZE,
) {
  return queryEventRepositoryPage(filters, page, limit);
}

export async function queryEventStoreById(id: string) {
  return queryEventRepositoryById(id);
}

export async function getEventStoreSummary(
  filters: Pick<EventListQueryParams, "status" | "category">,
) {
  const page = await queryEventRepositoryPage(
    {
      status: filters.status,
      category: filters.category,
      from: "2018-01-01",
      to: new Date().toISOString().slice(0, 10),
      search: "",
      sort: "newest",
    },
    1,
    1,
  );

  return page.summary ?? {
    count: 0,
    histogram: [],
    syncedAt: null,
  };
}

export async function getEventStoreEventCount() {
  const page = await queryEventRepositoryPage(
    {
      status: "all",
      category: "all",
      from: "2018-01-01",
      to: new Date().toISOString().slice(0, 10),
      search: "",
      sort: "newest",
    },
    1,
    1,
  );

  return page.count;
}

export async function syncEventStoreSnapshot() {
  return syncRecentEvents();
}

export async function queryEventStoreTimeline(
  filters: Pick<EventListQueryParams, "from" | "to" | "status" | "category"> & {
    bucket: "day" | "week" | "month";
  },
) {
  return queryEventRepositoryTimeline({
    from: filters.from,
    to: filters.to,
    status: filters.status,
    category: filters.category,
    bucket: filters.bucket,
  });
}

export async function getEventStoreSyncStatus() {
  return getEventSyncStatus();
}

export type { Event, EventListPage };
