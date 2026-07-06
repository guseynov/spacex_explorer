import {
  buildEventHistogram,
  filterEventsForExplorer,
  filterEventsForTimeline,
  filterVisibleRangeEvents,
} from "./event-data-utils";
import type { Event } from "./event-schemas";

const sampleEvents: Event[] = [
  {
    id: "event-1",
    title: "Flood in Nigeria",
    description: "River overflow",
    status: "closed",
    closedAt: "2026-06-08T00:00:00.000Z",
    categories: [{ id: "floods", title: "Floods", description: null }],
    sources: [{ id: "GDACS", title: "GDACS", url: "https://example.com/flood" }],
    geometries: [],
    latestDate: "2026-06-08T00:00:00.000Z",
    latestGeometry: null,
    primaryCoordinate: [3.4, 6.5],
    coordinateLabel: "6.50° N, 3.40° E",
    magnitudeValue: 2,
    magnitudeUnit: "m",
    sourceLabel: "GDACS",
    categoryLabel: "Floods",
    categoryId: "floods",
  },
  {
    id: "event-2",
    title: "Wildfire in Portugal",
    description: "Forest fire near Coimbra",
    status: "active",
    closedAt: null,
    categories: [{ id: "wildfires", title: "Wildfires", description: null }],
    sources: [{ id: "FIRMS", title: "FIRMS", url: "https://example.com/fire" }],
    geometries: [],
    latestDate: "2026-07-03T00:00:00.000Z",
    latestGeometry: null,
    primaryCoordinate: [-8.28, 40.63],
    coordinateLabel: "40.63° N, 8.28° W",
    magnitudeValue: 9,
    magnitudeUnit: "MW",
    sourceLabel: "FIRMS",
    categoryLabel: "Wildfires",
    categoryId: "wildfires",
  },
  {
    id: "event-3",
    title: "Dust over Chad",
    description: "Dense haze plume",
    status: "active",
    closedAt: null,
    categories: [{ id: "dustHaze", title: "Dust and haze", description: null }],
    sources: [{ id: "NASA", title: "NASA", url: "https://example.com/dust" }],
    geometries: [],
    latestDate: "2026-07-05T00:00:00.000Z",
    latestGeometry: null,
    primaryCoordinate: [18.7, 15.4],
    coordinateLabel: "15.40° N, 18.70° E",
    magnitudeValue: null,
    magnitudeUnit: null,
    sourceLabel: "NASA",
    categoryLabel: "Dust and haze",
    categoryId: "dustHaze",
  },
];

describe("event data utils", () => {
  it("filters and sorts explorer events locally by date and search", () => {
    expect(
      filterEventsForExplorer(sampleEvents, {
        from: "2026-07-01",
        to: "2026-07-06",
        search: "fire",
        sort: "newest",
      }).map((event) => event.id),
    ).toEqual(["event-2"]);
  });

  it("keeps timeline events outside the selected date range", () => {
    expect(
      filterEventsForTimeline(sampleEvents, { search: "" }).map((event) => event.id),
    ).toEqual(["event-1", "event-2", "event-3"]);
  });

  it("does not re-apply date filtering to already range-scoped results", () => {
    expect(
      filterVisibleRangeEvents(sampleEvents, {
        search: "wild",
        sort: "newest",
      }).map((event) => event.id),
    ).toEqual(["event-2"]);
  });

  it("builds histogram counts across the whole timeline domain", () => {
    expect(
      buildEventHistogram(
        sampleEvents,
        { from: "2026-06-01", to: "2026-07-06" },
        4,
      ),
    ).toEqual([1, 0, 0, 2]);
  });
});
