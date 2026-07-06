-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('active', 'closed');

-- CreateEnum
CREATE TYPE "SyncRunStatus" AS ENUM ('running', 'success', 'failed');

-- CreateEnum
CREATE TYPE "SyncRunType" AS ENUM ('incremental', 'backfill', 'manual');

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "link" TEXT,
    "status" "EventStatus" NOT NULL,
    "closedAt" TIMESTAMP(3),
    "firstObservedAt" TIMESTAMP(3),
    "latestObservedAt" TIMESTAMP(3),
    "primaryCategoryId" TEXT,
    "primaryCategoryTitle" TEXT,
    "primarySourceId" TEXT,
    "primarySourceTitle" TEXT,
    "primaryLongitude" DOUBLE PRECISION,
    "primaryLatitude" DOUBLE PRECISION,
    "searchText" TEXT NOT NULL,
    "raw" JSONB NOT NULL,
    "upstreamUpdatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventGeometry" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "observedAt" TIMESTAMP(3),
    "geometryType" TEXT,
    "longitude" DOUBLE PRECISION,
    "latitude" DOUBLE PRECISION,
    "magnitudeValue" DOUBLE PRECISION,
    "magnitudeUnit" TEXT,
    "magnitudeDescription" TEXT,
    "coordinateHash" TEXT NOT NULL,
    "raw" JSONB NOT NULL,

    CONSTRAINT "EventGeometry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "raw" JSONB,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "sourceUrl" TEXT,
    "raw" JSONB,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventCategory" (
    "eventId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "EventCategory_pkey" PRIMARY KEY ("eventId","categoryId")
);

-- CreateTable
CREATE TABLE "EventSource" (
    "eventId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,

    CONSTRAINT "EventSource_pkey" PRIMARY KEY ("eventId","sourceId")
);

-- CreateTable
CREATE TABLE "SyncRun" (
    "id" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3),
    "status" "SyncRunStatus" NOT NULL,
    "type" "SyncRunType" NOT NULL,
    "windowStart" TIMESTAMP(3),
    "windowEnd" TIMESTAMP(3),
    "upstreamRequestCount" INTEGER NOT NULL DEFAULT 0,
    "eventsFetched" INTEGER NOT NULL DEFAULT 0,
    "eventsUpserted" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyncRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "Event"("status");

-- CreateIndex
CREATE INDEX "Event_firstObservedAt_idx" ON "Event"("firstObservedAt");

-- CreateIndex
CREATE INDEX "Event_latestObservedAt_idx" ON "Event"("latestObservedAt");

-- CreateIndex
CREATE INDEX "Event_closedAt_idx" ON "Event"("closedAt");

-- CreateIndex
CREATE INDEX "Event_primaryCategoryId_idx" ON "Event"("primaryCategoryId");

-- CreateIndex
CREATE INDEX "Event_primaryLongitude_primaryLatitude_idx" ON "Event"("primaryLongitude", "primaryLatitude");

-- CreateIndex
CREATE INDEX "EventGeometry_eventId_idx" ON "EventGeometry"("eventId");

-- CreateIndex
CREATE INDEX "EventGeometry_observedAt_idx" ON "EventGeometry"("observedAt");

-- CreateIndex
CREATE INDEX "EventGeometry_longitude_latitude_idx" ON "EventGeometry"("longitude", "latitude");

-- CreateIndex
CREATE UNIQUE INDEX "EventGeometry_eventId_coordinateHash_observedAt_key" ON "EventGeometry"("eventId", "coordinateHash", "observedAt");

-- CreateIndex
CREATE INDEX "EventCategory_categoryId_idx" ON "EventCategory"("categoryId");

-- CreateIndex
CREATE INDEX "EventSource_sourceId_idx" ON "EventSource"("sourceId");

-- AddForeignKey
ALTER TABLE "EventGeometry" ADD CONSTRAINT "EventGeometry_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventCategory" ADD CONSTRAINT "EventCategory_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventCategory" ADD CONSTRAINT "EventCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSource" ADD CONSTRAINT "EventSource_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSource" ADD CONSTRAINT "EventSource_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;
