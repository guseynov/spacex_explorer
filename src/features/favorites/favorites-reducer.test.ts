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
  name: "Sicily Etna Activity",
  net: "2020-01-01T00:00:00.000Z",
  status: { id: 1, name: "Active Event", abbrev: "Active" },
  imageUrl: "https://images2.imgbox.com/test.png",
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

  it("toggles events on and off", () => {
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

  it("removes events by id", () => {
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
