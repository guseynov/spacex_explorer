import { Prisma } from "@prisma/client";
import { startOfWeek, formatISO } from "date-fns";
import { prisma } from "@/lib/db";
import {
  EventSortOption,
  EVENT_PAGE_SIZE,
  getTimelineDomain,
  type EventListQueryParams,
  type EventSortOptionValue,
} from "@/lib/api/event-query-builder";
import {
  eventListPageSchema,
  eventSchema,
  type Event,
} from "@/lib/api/event-schemas";
import { formatCoordinateLabel } from "./geometry";
import type { NormalizedEonetEvent } from "./types";

export type EventTimelineBucket = {
  bucket: string;
  count: number;
};

export type EventSyncStatus = {
  lastSuccessfulSyncAt: string | null;
  isStale: boolean;
  source: "database";
};

export async function queryEventRepositoryPage(
  filters: EventListQueryParams,
  page: number,
  limit = EVENT_PAGE_SIZE,
) {
  const where = buildEventWhere(filters);
  const offset = Math.max(page - 1, 0) * limit;

  const [total, pageRows, histogramRows, syncStatus] = await Promise.all([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
      include: eventInclude,
      orderBy: buildEventOrderBy(filters.sort),
      skip: offset,
      take: limit,
    }),
    prisma.event.findMany({
      where,
      select: {
        latestObservedAt: true,
        firstObservedAt: true,
        closedAt: true,
        geometries: {
          select: {
            observedAt: true,
          },
        },
      },
    }),
    getEventSyncStatus(),
  ]);

  const results = pageRows.map(toUiEvent);
  const histogram = buildTimelineHistogram(histogramRows, 36);
  const summary = {
    count: histogramRows.length,
    histogram,
    syncedAt: syncStatus.lastSuccessfulSyncAt,
  };

  return eventListPageSchema.parse({
    count: total,
    page,
    pageSize: limit,
    nextPage: offset + limit < total ? page + 1 : null,
    previousPage: page > 1 ? page - 1 : null,
    results,
    summary,
  });
}

export async function queryEventRepositoryById(id: string) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: eventInclude,
  });

  return event ? toUiEvent(event) : null;
}

export async function queryEventRepositoryTimeline(
  filters: Pick<EventListQueryParams, "from" | "to" | "category" | "status"> & {
    bucket: "day" | "week" | "month";
  },
) {
  const { bucket, ...timelineFilters } = filters;
  const where = buildEventWhere({
    ...timelineFilters,
    search: "",
  });

  const rows = await prisma.event.findMany({
    where,
    select: {
      latestObservedAt: true,
      firstObservedAt: true,
      closedAt: true,
      geometries: {
        select: {
          observedAt: true,
        },
      },
    },
  });

  const buckets = new Map<string, number>();

  for (const row of rows) {
    const bucketDates = getTimelineDates(row);
    if (bucketDates.length === 0) {
      continue;
    }

    for (const date of bucketDates) {
      const bucketKey = formatBucketDate(date, bucket);
      buckets.set(bucketKey, (buckets.get(bucketKey) ?? 0) + 1);
    }
  }

  return [...buckets.entries()]
    .map(([bucket, count]) => ({ bucket, count }))
    .sort((left, right) => left.bucket.localeCompare(right.bucket));
}

export async function getEventSyncStatus(): Promise<EventSyncStatus> {
  const lastSuccessfulSync = await prisma.syncRun.findFirst({
    where: {
      status: "success",
    },
    orderBy: {
      finishedAt: "desc",
    },
    select: {
      finishedAt: true,
    },
  });

  return {
    lastSuccessfulSyncAt: lastSuccessfulSync?.finishedAt?.toISOString() ?? null,
    isStale: isSyncStale(lastSuccessfulSync?.finishedAt ?? null),
    source: "database",
  };
}

export async function getSyncRunSummary() {
  const [lastRun, lastSuccessfulSync, counts] = await Promise.all([
    prisma.syncRun.findFirst({
      orderBy: { createdAt: "desc" },
    }),
    prisma.syncRun.findFirst({
      where: { status: "success" },
      orderBy: { finishedAt: "desc" },
    }),
    Promise.all([
      prisma.event.count(),
      prisma.syncRun.count({ where: { status: "running" } }),
    ]),
  ]);

  return {
    lastRun,
    lastSuccessfulSyncAt: lastSuccessfulSync?.finishedAt?.toISOString() ?? null,
    eventCount: counts[0],
    runningSyncs: counts[1],
    isStale: isSyncStale(lastSuccessfulSync?.finishedAt ?? null),
  };
}

export async function upsertNormalizedEonetEvent(event: NormalizedEonetEvent) {
  const result = await prisma.$transaction(async (tx) => {
    const createdEvent = await tx.event.upsert({
      where: { id: event.id },
      create: {
        id: event.id,
        title: event.title,
        description: event.description,
        link: event.link,
        status: event.status,
        closedAt: event.closedAt,
        firstObservedAt: event.firstObservedAt,
        latestObservedAt: event.latestObservedAt,
        primaryCategoryId: event.primaryCategoryId,
        primaryCategoryTitle: event.primaryCategoryTitle,
        primarySourceId: event.primarySourceId,
        primarySourceTitle: event.primarySourceTitle,
        primaryLongitude: event.primaryLongitude,
        primaryLatitude: event.primaryLatitude,
        searchText: event.searchText,
        raw: event.raw,
        upstreamUpdatedAt: event.upstreamUpdatedAt,
      },
      update: {
        title: event.title,
        description: event.description,
        link: event.link,
        status: event.status,
        closedAt: event.closedAt,
        firstObservedAt: event.firstObservedAt,
        latestObservedAt: event.latestObservedAt,
        primaryCategoryId: event.primaryCategoryId,
        primaryCategoryTitle: event.primaryCategoryTitle,
        primarySourceId: event.primarySourceId,
        primarySourceTitle: event.primarySourceTitle,
        primaryLongitude: event.primaryLongitude,
        primaryLatitude: event.primaryLatitude,
        searchText: event.searchText,
        raw: event.raw,
        upstreamUpdatedAt: event.upstreamUpdatedAt,
      },
    });

    await tx.eventCategory.deleteMany({ where: { eventId: createdEvent.id } });
    await tx.eventSource.deleteMany({ where: { eventId: createdEvent.id } });
    await tx.eventGeometry.deleteMany({ where: { eventId: createdEvent.id } });

    if (event.categories.length > 0) {
      await tx.category.createMany({
        data: event.categories.map((category) => ({
          id: category.id,
          title: category.title,
          description: category.description,
          raw: category.raw as Prisma.InputJsonValue,
        })),
        skipDuplicates: true,
      });

      await tx.eventCategory.createMany({
        data: event.categories.map((category) => ({
          eventId: createdEvent.id,
          categoryId: category.id,
        })),
        skipDuplicates: true,
      });
    }

    if (event.sources.length > 0) {
      await tx.source.createMany({
        data: event.sources.map((source) => ({
          id: source.id,
          title: source.title,
          sourceUrl: source.sourceUrl,
          raw: source.raw as Prisma.InputJsonValue,
        })),
        skipDuplicates: true,
      });

      await tx.eventSource.createMany({
        data: event.sources.map((source) => ({
          eventId: createdEvent.id,
          sourceId: source.id,
        })),
        skipDuplicates: true,
      });
    }

    if (event.geometries.length > 0) {
      await tx.eventGeometry.createMany({
        data: event.geometries.map((geometry) => ({
          eventId: createdEvent.id,
          observedAt: geometry.observedAt,
          geometryType: geometry.geometryType,
          longitude: geometry.longitude,
          latitude: geometry.latitude,
          magnitudeValue: geometry.magnitudeValue,
          magnitudeUnit: geometry.magnitudeUnit,
          magnitudeDescription: geometry.magnitudeDescription,
          coordinateHash: geometry.coordinateHash,
          raw: geometry.raw as Prisma.InputJsonValue,
        })),
        skipDuplicates: true,
      });
    }

    return createdEvent;
  });

  return result;
}

export async function replaceSyncRunStatus(input: {
  id: string;
  status: "running" | "success" | "failed";
  finishedAt?: Date | null;
  error?: string | null;
  upstreamRequestCount?: number;
  eventsFetched?: number;
  eventsUpserted?: number;
}) {
  return prisma.syncRun.update({
    where: { id: input.id },
    data: {
      status: input.status,
      finishedAt: input.finishedAt ?? undefined,
      error: input.error ?? undefined,
      upstreamRequestCount: input.upstreamRequestCount,
      eventsFetched: input.eventsFetched,
      eventsUpserted: input.eventsUpserted,
    },
  });
}

export async function createSyncRun(input: {
  type: "incremental" | "backfill" | "manual";
  windowStart?: Date | null;
  windowEnd?: Date | null;
}) {
  return prisma.syncRun.create({
    data: {
      startedAt: new Date(),
      status: "running",
      type: input.type,
      windowStart: input.windowStart ?? null,
      windowEnd: input.windowEnd ?? null,
    },
  });
}

function buildEventWhere(filters: Pick<EventListQueryParams, "from" | "to" | "status" | "category" | "search">) {
  const and: Prisma.EventWhereInput[] = [];
  const where: Prisma.EventWhereInput = {};

  if (filters.status === "active" || filters.status === "closed") {
    where.status = filters.status;
  }

  if (filters.category !== "all") {
    where.OR = [
      { primaryCategoryId: filters.category },
      { categories: { some: { categoryId: filters.category } } },
    ];
  }

  if (filters.search) {
    where.searchText = {
      contains: filters.search.trim().toLowerCase(),
    };
  }

  const from = toDate(filters.from);
  const to = endOfDay(filters.to);

  and.push({
    OR: [
      {
        geometries: {
          some: {
            observedAt: {
              gte: from,
              lte: to,
            },
          },
        },
      },
      {
        AND: [
          { firstObservedAt: { lte: to } },
          { latestObservedAt: { gte: from } },
        ],
      },
    ],
  });

  where.AND = and;

  return where;
}

function buildEventOrderBy(sort: EventSortOptionValue): Prisma.EventOrderByWithRelationInput[] {
  switch (sort) {
    case EventSortOption.Oldest:
      return [{ latestObservedAt: "asc" }, { id: "asc" }];
    case EventSortOption.Title:
      return [{ title: "asc" }];
    case EventSortOption.Category:
      return [{ primaryCategoryTitle: "asc" }, { title: "asc" }];
    case EventSortOption.Severity:
      return [{ latestObservedAt: "desc" }, { title: "asc" }];
    case EventSortOption.Newest:
    default:
      return [{ latestObservedAt: "desc" }, { id: "asc" }];
  }
}

function toUiEvent(
  event: Prisma.EventGetPayload<{ include: typeof eventInclude }>,
): Event {
  const categories = event.categories.map((row) => ({
    id: row.category.id,
    title: row.category.title,
    description: row.category.description,
  }));
  const sources = event.sources.map((row) => ({
    id: row.source.id,
    title: row.source.title,
    url: row.source.sourceUrl,
  }));
  const geometries = event.geometries
    .slice()
    .sort((left, right) => {
      const leftTime = left.observedAt?.getTime() ?? 0;
      const rightTime = right.observedAt?.getTime() ?? 0;

      return rightTime - leftTime;
    })
    .map((geometry) => ({
      date: geometry.observedAt?.toISOString() ?? event.latestObservedAt?.toISOString() ?? new Date().toISOString(),
      type: geometry.geometryType ?? "Unknown",
      coordinates:
        geometry.longitude != null && geometry.latitude != null
          ? [geometry.longitude, geometry.latitude]
          : null,
      magnitudeValue: geometry.magnitudeValue,
      magnitudeUnit: geometry.magnitudeUnit,
      primaryCoordinate:
        geometry.longitude != null && geometry.latitude != null
          ? [geometry.longitude, geometry.latitude]
          : null,
    }));
  const latestGeometry = geometries[0] ?? null;
  const latestDate =
    event.latestObservedAt?.toISOString()
    ?? latestGeometry?.date
    ?? event.closedAt?.toISOString()
    ?? new Date().toISOString();
  const primaryCoordinate =
    event.primaryLongitude != null && event.primaryLatitude != null
      ? [event.primaryLongitude, event.primaryLatitude] as const
      : null;

  return eventSchema.parse({
    id: event.id,
    title: event.title,
    description: event.description,
    status: event.status,
    closedAt: event.closedAt?.toISOString() ?? null,
    categories,
    sources,
    geometries,
    latestDate,
    latestGeometry,
    primaryCoordinate,
    coordinateLabel: formatCoordinateLabel(primaryCoordinate),
    magnitudeValue: latestGeometry?.magnitudeValue ?? null,
    magnitudeUnit: latestGeometry?.magnitudeUnit ?? null,
    sourceLabel: event.primarySourceTitle ?? event.primarySourceId ?? "EONET",
    categoryLabel: event.primaryCategoryTitle ?? "Uncategorized",
    categoryId: event.primaryCategoryId ?? "uncategorized",
  });
}

function formatBucketDate(date: Date, bucket: "day" | "week" | "month") {
  switch (bucket) {
    case "week":
      return formatISO(startOfWeek(date, { weekStartsOn: 1 }), { representation: "date" });
    case "month":
      return date.toISOString().slice(0, 7);
    case "day":
    default:
      return date.toISOString().slice(0, 10);
  }
}

function toDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function endOfDay(value: string) {
  return new Date(`${value}T23:59:59.999Z`);
}

function isSyncStale(finishedAt: Date | null) {
  if (!finishedAt) {
    return true;
  }

  return Date.now() - finishedAt.getTime() > 24 * 60 * 60 * 1000;
}

function buildTimelineHistogram(
  rows: Array<{
    latestObservedAt: Date | null;
    firstObservedAt: Date | null;
    closedAt: Date | null;
    geometries: {
      observedAt: Date | null;
    }[];
  }>,
  bins: number,
) {
  const values = new Array(bins).fill(0);
  const domain = getTimelineDomain();
  const start = new Date(domain.min).getTime();
  const end = new Date(domain.max).getTime();
  const total = Math.max(end - start, 1);

  for (const row of rows) {
    const dates = getTimelineDates(row);
    for (const date of dates) {
      const time = date.getTime();
      if (Number.isNaN(time) || time < start || time > end) {
        continue;
      }

      const ratio = (time - start) / total;
      const index = Math.min(bins - 1, Math.max(0, Math.floor(ratio * bins)));
      values[index] += 1;
    }
  }

  return values;
}

function getTimelineDates(row: {
  latestObservedAt: Date | null;
  firstObservedAt: Date | null;
  closedAt: Date | null;
  geometries: {
    observedAt: Date | null;
  }[];
}) {
  const dates = row.geometries
    .map((geometry) => geometry.observedAt)
    .filter((value): value is Date => Boolean(value));

  if (dates.length > 0) {
    return dates;
  }

  const fallback = row.latestObservedAt ?? row.firstObservedAt ?? row.closedAt ?? null;

  return fallback ? [fallback] : [];
}

const geometryOrderBy: Prisma.EventGeometryOrderByWithRelationInput[] = [
  { observedAt: "desc" },
  { id: "desc" },
];

const eventInclude = {
  categories: {
    include: {
      category: true,
    },
  },
  sources: {
    include: {
      source: true,
    },
  },
  geometries: {
    orderBy: geometryOrderBy,
  },
} satisfies Prisma.EventInclude;
