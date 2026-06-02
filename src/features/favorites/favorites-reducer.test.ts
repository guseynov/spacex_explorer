// @vitest-environment jsdom

import type { FavoriteLaunch } from "@/lib/api/schemas";
import {
  FAVORITES_STORAGE_KEY,
  favoritesReducer,
  initialFavoritesState,
  readFavoritesFromStorage,
  writeFavoritesToStorage,
} from "./favorites-reducer";

const favorite: FavoriteLaunch = {
  id: "launch-1",
  name: "CRS-1",
  date_utc: "2020-01-01T00:00:00.000Z",
  success: true,
  upcoming: false,
  patch: "https://images2.imgbox.com/test.png",
  rocketId: "rocket-1",
  launchpadId: "launchpad-1",
};

describe("favorites reducer", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("hydrates persisted items", () => {
    expect(
      favoritesReducer(initialFavoritesState, {
        type: "hydrate",
        payload: [favorite],
      }),
    ).toEqual({
      items: [favorite],
      hasHydrated: true,
    });
  });

  it("toggles launches on and off", () => {
    const addedState = favoritesReducer(initialFavoritesState, {
      type: "toggle",
      payload: favorite,
    });

    expect(addedState.items).toEqual([favorite]);

    const removedState = favoritesReducer(addedState, {
      type: "toggle",
      payload: favorite,
    });

    expect(removedState.items).toEqual([]);
  });

  it("removes launches by id", () => {
    const nextState = favoritesReducer(
      {
        items: [favorite],
        hasHydrated: true,
      },
      {
        type: "remove",
        payload: favorite.id,
      },
    );

    expect(nextState.items).toEqual([]);
  });

  it("persists and reads local storage", () => {
    writeFavoritesToStorage([favorite]);

    expect(window.localStorage.getItem(FAVORITES_STORAGE_KEY)).toContain(
      '"launch-1"',
    );
    expect(readFavoritesFromStorage()).toEqual([favorite]);
  });

  it("returns an empty array for malformed storage", () => {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, "{bad json");

    expect(readFavoritesFromStorage()).toEqual([]);
  });
});
