import { afterEach, beforeEach, vi } from "vitest";
import {
  buildLaunchesQueryPayload,
  defaultLaunchFilters,
  escapeMissionSearch,
  normalizeLaunchFilters,
  parseLaunchSearchParams,
  stringifyLaunchSearchParams,
} from "./query-builder";

describe("query builder", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-02T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("escapes regex metacharacters in search input", () => {
    expect(escapeMissionSearch("Starlink (v2)+")).toBe("Starlink \\(v2\\)\\+");
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

  it("parses URL params into the filter contract", () => {
    const params = new URLSearchParams(
      "timing=past&result=success&from=2020-01-01&to=2020-12-31&sort=name_desc&search=falcon",
    );

    expect(parseLaunchSearchParams(params)).toEqual({
      timing: "past",
      result: "success",
      from: "2020-01-01",
      to: "2020-12-31",
      sort: "name_desc",
      search: "falcon",
    });
  });

  it("stringifies only non-default filters", () => {
    const params = stringifyLaunchSearchParams({
      ...defaultLaunchFilters,
      timing: "past",
      search: "falcon",
    });

    expect(params.toString()).toBe("timing=past&search=falcon");
  });

  it("builds the SpaceX query payload for server-side pagination and filtering", () => {
    expect(
      buildLaunchesQueryPayload(
        {
          timing: "upcoming",
          result: "all",
          from: "2020-01-01",
          to: "2020-12-31",
          sort: "name_asc",
          search: "Starlink (v2)+",
        },
        3,
      ),
    ).toEqual({
      query: {
        upcoming: true,
        date_utc: {
          $gte: "2020-01-01T00:00:00.000Z",
          $lte: "2020-12-31T23:59:59.999Z",
        },
        name: {
          $regex: "Starlink \\(v2\\)\\+",
          $options: "i",
        },
      },
      options: {
        page: 3,
        limit: 12,
        sort: {
          name: "asc",
        },
      },
    });
  });

  it("builds the past launches query using the upcoming flag", () => {
    expect(
      buildLaunchesQueryPayload(
        {
          timing: "past",
          result: "all",
          from: "",
          to: "",
          sort: "date_desc",
          search: "",
        },
        1,
      ),
    ).toEqual({
      query: {
        upcoming: false,
      },
      options: {
        page: 1,
        limit: 12,
        sort: {
          date_utc: "desc",
        },
      },
    });
  });
});
