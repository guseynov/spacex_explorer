// @vitest-environment jsdom

import type { FavoriteEvent } from "@/lib/api/event-schemas";
import {
  compareReducer,
  initialCompareState,
  readCompareFromStorage,
  writeCompareToStorage,
  COMPARE_STORAGE_KEY,
} from "./compare-reducer";

const firstEvent: FavoriteEvent = {
  id: "event-1",
  title: "Canadian Wildfire Cluster",
  description: null,
  status: "closed",
  latestDate: "2026-05-30T19:22:00.000Z",
  categoryId: "wildfires",
  categoryLabel: "Wildfires",
  sourceLabel: "FIRMS",
  coordinateLabel: null,
  primaryCoordinate: null,
  magnitudeValue: null,
  magnitudeUnit: null,
};

const secondEvent: FavoriteEvent = {
  ...firstEvent,
  id: "event-2",
  title: "Atlantic Tropical Storm Belt",
  status: "active",
  latestDate: "2026-06-12T00:00:00.000Z",
  categoryId: "severeStorms",
  categoryLabel: "Severe Storms",
};

const thirdEvent: FavoriteEvent = {
  ...firstEvent,
  id: "event-3",
  title: "Andes Earthquake Sequence",
  categoryId: "earthquakes",
  categoryLabel: "Earthquakes",
};

describe("compare reducer", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("adds, replaces, and removes events in compare state", () => {
    const one = compareReducer(initialCompareState, {
      type: "toggle",
      payload: firstEvent,
    });

    const two = compareReducer(one, {
      type: "toggle",
      payload: secondEvent,
    });

    const replaced = compareReducer(two, {
      type: "toggle",
      payload: thirdEvent,
    });

    expect(one.items).toEqual([firstEvent]);
    expect(two.items).toEqual([secondEvent, firstEvent]);
    expect(replaced.items).toEqual([firstEvent, thirdEvent]);

    const removed = compareReducer(replaced, {
      type: "toggle",
      payload: firstEvent,
    });

    expect(removed.items).toEqual([thirdEvent]);
  });

  it("persists and reads compare selections", () => {
    writeCompareToStorage([firstEvent, secondEvent]);

    expect(window.localStorage.getItem(COMPARE_STORAGE_KEY)).toContain(
      '"event-1"',
    );
    expect(readCompareFromStorage()).toEqual([firstEvent, secondEvent]);
  });
});
