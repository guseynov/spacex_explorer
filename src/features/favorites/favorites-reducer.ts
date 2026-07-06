import type { FavoriteEvent } from "@/lib/api/event-schemas";
import { favoriteEventSchema } from "@/lib/api/event-schemas";

export const FAVORITES_STORAGE_KEY = "eonet-explorer:favorites";

export type FavoritesState = {
  items: FavoriteEvent[];
  hasHydrated: boolean;
};

export type FavoritesAction =
  | { type: "hydrate"; payload: FavoriteEvent[] }
  | { type: "toggle"; payload: FavoriteEvent }
  | { type: "remove"; payload: string };

export const initialFavoritesState: FavoritesState = {
  items: [],
  hasHydrated: false,
};

export function favoritesReducer(
  state: FavoritesState,
  action: FavoritesAction,
): FavoritesState {
  switch (action.type) {
    case "hydrate":
      return {
        items: action.payload,
        hasHydrated: true,
      };
    case "toggle": {
      const exists = state.items.some((item) => item.id === action.payload.id);
      const nextItems = exists
        ? state.items.filter((item) => item.id !== action.payload.id)
        : [action.payload, ...state.items];

      return {
        ...state,
        items: nextItems,
      };
    }
    case "remove":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };
    default:
      return state;
  }
}

export function readFavoritesFromStorage() {
  if (typeof window === "undefined") {
    return [];
  }

  const rawValue = window.localStorage.getItem(FAVORITES_STORAGE_KEY);

  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;
    return Array.isArray(parsed)
      ? parsed.flatMap((item) => {
          const result = favoriteEventSchema.safeParse(item);
          return result.success ? [result.data] : [];
        })
      : [];
  } catch {
    return [];
  }
}

export function writeFavoritesToStorage(items: FavoriteEvent[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(items));
}
