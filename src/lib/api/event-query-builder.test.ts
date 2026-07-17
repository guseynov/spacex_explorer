import {
  buildEonetQueryParams,
  createBaseEventFilters,
  createDefaultEventFilters,
  getTimelineDomain,
  normalizeEventDateRange,
  normalizeEventFilters,
  parseEventSearchParams,
  toFavoriteEvent,
} from "./event-query-builder";

describe("event query builder", () => {
  const now = new Date("2026-07-06T12:00:00.000Z");

  it("normalizes and orders date ranges", () => {
    expect(
      normalizeEventDateRange("2026-07-05", "2026-06-01", now),
    ).toEqual({
      from: "2026-06-01",
      to: "2026-07-05",
    });
  });

  it("uses the fixed 2018 history boundary for URLs and date ranges", () => {
    expect(getTimelineDomain(now)).toEqual({
      min: "2018-01-01",
      max: "2026-07-06",
    });
    expect(
      parseEventSearchParams(
        new URLSearchParams("from=2018-01-01&to=2026-07-06"),
        now,
      ),
    ).toEqual({
      ...createDefaultEventFilters(now),
      from: "2018-01-01",
      to: "2026-07-06",
    });
    expect(
      normalizeEventDateRange("2017-01-01", "2019-01-01", now),
    ).toEqual({
      from: "2018-01-01",
      to: "2019-01-01",
    });
  });

  it("fills missing filters from defaults", () => {
    expect(normalizeEventFilters({ category: "wildfires" }, now)).toEqual({
      ...createDefaultEventFilters(now),
      category: "wildfires",
    });
  });

  it("builds a full-domain base filter set for cached timeline data", () => {
    expect(
      createBaseEventFilters(
        {
          status: "closed",
          category: "wildfires",
        },
        now,
      ),
    ).toEqual({
      status: "closed",
      category: "wildfires",
      from: "2018-01-01",
      to: "2026-07-06",
      sort: "newest",
      search: "",
    });
  });

  it("builds EONET params from event filters", () => {
    const params = buildEonetQueryParams({
      status: "active",
      category: "wildfires",
      from: "2026-05-01",
      to: "2026-07-06",
      sort: "newest",
      search: "portugal",
    });

    expect(params.toString()).toContain("status=open");
    expect(params.toString()).toContain("category=wildfires");
    expect(params.toString()).toContain("start=2026-05-01");
    expect(params.toString()).toContain("end=2026-07-06");
  });

  it("projects events for local favorites and compare state", () => {
    expect(
      toFavoriteEvent({
        id: "event-1",
        title: "Flood in Nigeria",
        description: "Example",
        status: "closed",
        closedAt: "2026-06-08T00:00:00.000Z",
        categories: [],
        sources: [],
        geometries: [],
        latestDate: "2026-06-08T00:00:00.000Z",
        latestGeometry: null,
        primaryCoordinate: [3.4, 6.5],
        coordinateLabel: "6.50° N, 3.40° E",
        magnitudeValue: null,
        magnitudeUnit: null,
        sourceLabel: "GDACS",
        categoryLabel: "Floods",
        categoryId: "floods",
      }),
    ).toEqual({
      id: "event-1",
      title: "Flood in Nigeria",
      description: "Example",
      status: "closed",
      latestDate: "2026-06-08T00:00:00.000Z",
      categoryId: "floods",
      categoryLabel: "Floods",
      sourceLabel: "GDACS",
      coordinateLabel: "6.50° N, 3.40° E",
      primaryCoordinate: [3.4, 6.5],
      magnitudeValue: null,
      magnitudeUnit: null,
    });
  });
});
