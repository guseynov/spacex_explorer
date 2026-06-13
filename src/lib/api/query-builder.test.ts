import { afterEach, beforeEach, vi } from "vitest";
import {
  buildLaunchLibraryQueryParams,
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

  it("normalizes the result filter when upcoming is selected", () => {
    expect(
      normalizeLaunchFilters({
        timing: "upcoming",
        result: "failure",
      }),
    ).toEqual({
      ...defaultLaunchFilters,
      timing: "upcoming",
      result: "all",
    });
  });

  it("parses and stringifies URL filters", () => {
    const params = new URLSearchParams(
      "timing=past&result=success&from=2020-01-01&to=2020-12-31&sort=name_desc&search=falcon",
    );
    const filters = parseLaunchSearchParams(params);

    expect(filters).toEqual({
      timing: "past",
      result: "success",
      from: "2020-01-01",
      to: "2020-12-31",
      sort: "name_desc",
      search: "falcon",
    });
    expect(stringifyLaunchSearchParams(filters).toString()).toBe(
      params.toString(),
    );
  });

  it("builds Launch Library pagination and filters", () => {
    const params = buildLaunchLibraryQueryParams(
      {
        timing: "past",
        result: "failure",
        from: "2020-01-01",
        to: "2020-12-31",
        sort: "name_desc",
        search: "Starlink (v2)+",
      },
      3,
    );

    expect(Object.fromEntries(params)).toEqual({
      limit: "12",
      offset: "24",
      mode: "normal",
      ordering: "-name",
      net__gte: "2020-01-01T00:00:00.000Z",
      net__lte: "2020-12-31T23:59:59.999Z",
      status__ids: "4,7",
      search: "Starlink (v2)+",
    });
  });

  it("uses the current time as the upcoming lower bound", () => {
    const params = buildLaunchLibraryQueryParams(
      { ...defaultLaunchFilters, timing: "upcoming" },
      1,
    );

    expect(params.get("net__gte")).toBe("2026-06-02T00:00:00.000Z");
  });

  it("creates the local saved-launch projection", () => {
    const launch = launchSchema.parse({
      id: "launch-1",
      name: "Falcon 9 | Test",
      net: "2026-06-01T00:00:00Z",
      status: { id: 3, name: "Launch Successful", abbrev: "Success" },
      image: {
        image_url: "https://example.com/launch.jpg",
        thumbnail_url: "https://example.com/thumb.jpg",
      },
      mission: null,
      rocket: {
        id: 1,
        configuration: { id: 164, name: "Falcon 9" },
      },
      pad: null,
    });

    expect(toFavoriteLaunch(launch)).toEqual({
      id: "launch-1",
      name: "Falcon 9 | Test",
      net: "2026-06-01T00:00:00Z",
      status: launch.status,
      imageUrl: "https://example.com/thumb.jpg",
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
