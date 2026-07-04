import type { FavoriteLaunch } from "@/lib/api/schemas";
import { favoriteLaunchSchema } from "@/lib/api/schemas";

export const FAVORITES_STORAGE_KEY = "eonet-explorer:favorites";

export type FavoritesState = {
  items: FavoriteLaunch[];
  hasHydrated: boolean;
};

export type FavoritesAction =
  | { type: "hydrate"; payload: FavoriteLaunch[] }
  | { type: "toggle"; payload: FavoriteLaunch }
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
    const result = favoriteLaunchSchema.array().safeParse(parsed);

    if (!result.success) {
      return [];
    }

    return result.data;
  } catch {
    return [];
  }
}

export function writeFavoritesToStorage(items: FavoriteLaunch[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(items));
}
