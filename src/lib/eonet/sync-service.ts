import { addDays, formatISO } from "date-fns";
import { prisma } from "@/lib/db";
import {
  createSyncRun,
  replaceSyncRunStatus,
  upsertNormalizedEonetEvent,
} from "./repository";
import {
  fetchEonetCategories,
  fetchEonetEventsWindow,
} from "./upstream-client";
import { normalizeEonetEvent } from "./normalize-event";

export type SyncWindow = {
  status: "all" | "open" | "closed";
  start?: string;
  end?: string;
  days?: number;
  limit?: number;
};

export type SyncSummary = {
  runs: Array<{
    id: string;
    status: "running" | "success" | "failed";
    eventsFetched: number;
    eventsUpserted: number;
    upstreamRequestCount: number;
    error: string | null;
  }>;
};

export async function syncCategoriesAndSources() {
  const categories = await fetchEonetCategories();

  if (categories.length === 0) {
    return { categoriesUpserted: 0 };
  }

  await prisma.category.createMany({
    data: categories.map((category) => ({
      id: category.id,
      title: category.title,
      description: category.description ?? null,
      raw: category,
    })),
    skipDuplicates: true,
  });

  return { categoriesUpserted: categories.length };
}

export async function syncRecentEvents(options?: {
  recentDays?: number;
  openDays?: number;
}) {
  const recentDays = options?.recentDays ?? Number(process.env.EONET_SYNC_RECENT_DAYS ?? 30);
  const openDays = options?.openDays ?? 365;
  const windows: SyncWindow[] = [
    {
      status: "all",
      days: recentDays,
      limit: 1000,
    },
    {
      status: "open",
      days: openDays,
      limit: 1000,
    },
  ];

  await syncCategoriesAndSources();

  return syncWindows(windows, "incremental");
}

export async function syncBackfill(options?: {
  startDate?: string;
  endDate?: string;
  windowDays?: number;
}) {
  const startDate = options?.startDate ?? process.env.EONET_BACKFILL_START ?? "2018-01-01";
  const endDate = options?.endDate ?? formatISO(new Date(), { representation: "date" });
  const windowDays = options?.windowDays ?? 31;
  const windows: SyncWindow[] = [];
  let cursor = startDate;

  while (cursor <= endDate) {
    const windowEnd = addDays(new Date(`${cursor}T00:00:00.000Z`), windowDays - 1)
      .toISOString()
      .slice(0, 10);

    windows.push({
      status: "all",
      start: cursor,
      end: windowEnd > endDate ? endDate : windowEnd,
      limit: 1000,
    });

    cursor = addDays(new Date(`${windowEnd}T00:00:00.000Z`), 1)
      .toISOString()
      .slice(0, 10);
  }

  await syncCategoriesAndSources();

  return syncWindows(windows, "backfill");
}

async function syncWindows(windows: SyncWindow[], type: "incremental" | "backfill") {
  const runs: SyncSummary["runs"] = [];

  for (const window of windows) {
    const run = await createSyncRun({
      type,
      windowStart: window.start ? new Date(`${window.start}T00:00:00.000Z`) : null,
      windowEnd: window.end ? new Date(`${window.end}T23:59:59.999Z`) : null,
    });

    try {
      const upstreamEvents = await fetchEonetEventsWindow(window);
      const normalizedEvents = upstreamEvents.map(normalizeEonetEvent);

      let upsertedCount = 0;
      for (const event of normalizedEvents) {
        await upsertNormalizedEonetEvent(event);
        upsertedCount += 1;
      }

      await replaceSyncRunStatus({
        id: run.id,
        status: "success",
        finishedAt: new Date(),
        upstreamRequestCount: 1,
        eventsFetched: upstreamEvents.length,
        eventsUpserted: upsertedCount,
      });

      runs.push({
        id: run.id,
        status: "success",
        eventsFetched: upstreamEvents.length,
        eventsUpserted: upsertedCount,
        upstreamRequestCount: 1,
        error: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown sync error.";

      await replaceSyncRunStatus({
        id: run.id,
        status: "failed",
        finishedAt: new Date(),
        error: message,
      });

      runs.push({
        id: run.id,
        status: "failed",
        eventsFetched: 0,
        eventsUpserted: 0,
        upstreamRequestCount: 0,
        error: message,
      });
    }
  }

  return { runs };
}
