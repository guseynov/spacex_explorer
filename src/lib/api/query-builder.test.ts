import { afterEach, beforeEach, vi } from "vitest";
import {
  buildEonetQueryParams,
  defaultLaunchFilters,
  normalizeLaunchFilters,
  parseLaunchSearchParams,
  stringifyLaunchSearchParams,
  toFavoriteLaunch,
} from "./query-builder";
import { launchImageSchema, launchSchema } from "./schemas";

describe("query builder", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-02T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("normalizes category filters and falls back to defaults", () => {
    expect(
      normalizeLaunchFilters({
        timing: "upcoming",
        category: "  wildfires  ",
        sort: "invalid",
      }),
    ).toEqual({
      ...defaultLaunchFilters,
      timing: "upcoming",
      category: "wildfires",
    });
  });

  it("parses and stringifies URL filters", () => {
    const params = new URLSearchParams(
      "timing=past&category=wildfires&from=2020-01-01&to=2020-12-31&sort=name_desc&search=fire",
    );
    const filters = parseLaunchSearchParams(params);

    expect(filters).toEqual({
      timing: "past",
      category: "wildfires",
      from: "2020-01-01",
      to: "2020-12-31",
      sort: "name_desc",
      search: "fire",
    });
    expect(stringifyLaunchSearchParams(filters).toString()).toBe(
      params.toString(),
    );
  });

  it("builds EONET query params from explicit filters", () => {
    const params = buildEonetQueryParams({
      timing: "past",
      category: "wildfires",
      from: "2020-01-01",
      to: "2020-12-31",
      sort: "name_desc",
      search: "fire",
    });

    expect(Object.fromEntries(params)).toEqual({
      limit: "1000",
      status: "closed",
      category: "wildfires",
      start: "2020-01-01",
      end: "2020-12-31",
    });
  });

  it("uses a rolling one-year window for active events without dates", () => {
    const params = buildEonetQueryParams({
      ...defaultLaunchFilters,
      timing: "upcoming",
    });

    expect(params.get("start")).toBe("2025-06-02");
  });

  it("creates the local saved-launch projection", () => {
    const launch = launchSchema.parse({
      id: "launch-1",
      name: "California Wildfire Cluster",
      net: "2026-06-01T00:00:00Z",
      status: { id: 2, name: "Closed Event", abbrev: "Closed" },
      image: {
        image_url: "https://example.com/launch.jpg",
        thumbnail_url: "https://example.com/thumb.jpg",
      },
      mission: null,
      rocket: {
        id: 1,
        configuration: { id: 164, name: "Wildfires" },
      },
      pad: null,
    });

    expect(toFavoriteLaunch(launch)).toEqual({
      id: "launch-1",
      name: "California Wildfire Cluster",
      net: "2026-06-01T00:00:00Z",
      status: launch.status,
      imageUrl: "https://example.com/thumb.jpg",
      rocketName: "Wildfires",
      padName: undefined,
      locationName: undefined,
      flightNumber: null,
    });
  });

  it("normalizes string image fields in launch payloads", () => {
    expect(
      launchImageSchema.parse("https://example.com/infographic.jpg"),
    ).toEqual({
      image_url: "https://example.com/infographic.jpg",
      thumbnail_url: null,
    });
  });
});
