// @vitest-environment jsdom

import type { FavoriteLaunch } from "@/lib/api/schemas";
import {
  compareReducer,
  initialCompareState,
  readCompareFromStorage,
  writeCompareToStorage,
  COMPARE_STORAGE_KEY,
} from "./compare-reducer";

const firstLaunch: FavoriteLaunch = {
  id: "launch-1",
  name: "Canadian Wildfire Cluster",
  net: "2020-05-30T19:22:00.000Z",
  status: { id: 2, name: "Closed Event", abbrev: "Closed" },
  imageUrl: "https://images2.imgbox.com/test-1.png",
};

const secondLaunch: FavoriteLaunch = {
  id: "launch-2",
  name: "Atlantic Tropical Storm Belt",
  net: "2023-11-01T00:00:00.000Z",
  status: { id: 1, name: "Active Event", abbrev: "Active" },
  imageUrl: "https://images2.imgbox.com/test-2.png",
};

const thirdLaunch: FavoriteLaunch = {
  id: "launch-3",
  name: "Andes Earthquake Sequence",
  net: "2024-01-01T00:00:00.000Z",
  status: { id: 2, name: "Closed Event", abbrev: "Closed" },
  imageUrl: "https://images2.imgbox.com/test-3.png",
};

describe("compare reducer", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("adds, replaces, and removes events in compare state", () => {
    const one = compareReducer(initialCompareState, {
      type: "toggle",
      payload: firstLaunch,
    });

    const two = compareReducer(one, {
      type: "toggle",
      payload: secondLaunch,
    });

    const replaced = compareReducer(two, {
      type: "toggle",
      payload: thirdLaunch,
    });

    expect(one.items).toEqual([firstLaunch]);
    expect(two.items).toEqual([secondLaunch, firstLaunch]);
    expect(replaced.items).toEqual([firstLaunch, thirdLaunch]);

    const removed = compareReducer(replaced, {
      type: "toggle",
      payload: firstLaunch,
    });

    expect(removed.items).toEqual([thirdLaunch]);
  });

  it("persists and reads compare selections", () => {
    writeCompareToStorage([firstLaunch, secondLaunch]);

    expect(window.localStorage.getItem(COMPARE_STORAGE_KEY)).toContain(
      '"launch-1"',
    );
    expect(readCompareFromStorage()).toEqual([firstLaunch, secondLaunch]);
  });

  it("returns an empty array for malformed compare storage", () => {
    window.localStorage.setItem(COMPARE_STORAGE_KEY, "[]");
    window.localStorage.setItem(
      COMPARE_STORAGE_KEY,
      JSON.stringify([{ id: 123, name: "bad" }]),
    );

    expect(readCompareFromStorage()).toEqual([]);
  });
});
