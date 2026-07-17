// @vitest-environment jsdom

import type { FavoriteEvent } from "@/lib/api/event-schemas";
import {
  FAVORITES_STORAGE_KEY,
  favoritesReducer,
  initialFavoritesState,
  readFavoritesFromStorage,
  writeFavoritesToStorage,
} from "./favorites-reducer";

const favorite: FavoriteEvent = {
  id: "event-1",
  title: "Sicily Etna Activity",
  description: null,
  status: "active",
  latestDate: "2026-07-01T00:00:00.000Z",
  categoryId: "volcanoes",
  categoryLabel: "Volcanoes",
  sourceLabel: "GDACS",
  coordinateLabel: "37.75° N, 15.00° E",
  primaryCoordinate: [15, 37.75],
  magnitudeValue: null,
  magnitudeUnit: null,
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

  it("persists and reads local storage", () => {
    writeFavoritesToStorage([favorite]);

    expect(window.localStorage.getItem(FAVORITES_STORAGE_KEY)).toContain(
      '"event-1"',
    );
    expect(readFavoritesFromStorage()).toEqual([favorite]);
  });

  it("ignores legacy launch favorites", () => {
    window.localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify([
        {
          id: "legacy-launch-1",
          name: "Old saved launch",
          status: "Success",
        },
      ]),
    );

    expect(readFavoritesFromStorage()).toEqual([]);
  });
});
