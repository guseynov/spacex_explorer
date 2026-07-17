import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchEventsPage } from "./event-client";
import { EVENT_PAGE_SIZE, type EventListQueryParams } from "./event-query-builder";

const filters: EventListQueryParams = {
  status: "all",
  category: "wildfires",
  from: "2021-07-17",
  to: "2026-07-17",
  sort: "newest",
  search: "",
};

describe("event client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requests the same event page size used by the initial server render", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        count: 0,
        page: 1,
        pageSize: EVENT_PAGE_SIZE,
        nextPage: null,
        previousPage: null,
        results: [],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await fetchEventsPage(filters, 1);

    const requestUrl = new URL(
      String(fetchMock.mock.calls[0]?.[0]),
      "http://localhost",
    );

    expect(requestUrl.searchParams.get("limit")).toBe(String(EVENT_PAGE_SIZE));
  });
});
