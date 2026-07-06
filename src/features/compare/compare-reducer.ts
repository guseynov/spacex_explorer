import type { FavoriteEvent } from "@/lib/api/event-schemas";
import { favoriteEventSchema } from "@/lib/api/event-schemas";

export const COMPARE_STORAGE_KEY = "eonet-explorer:compare";
export const MAX_COMPARE_ITEMS = 2;

export type CompareState = {
  items: FavoriteEvent[];
  hasHydrated: boolean;
};

export type CompareAction =
  | { type: "hydrate"; payload: FavoriteEvent[] }
  | { type: "toggle"; payload: FavoriteEvent }
  | { type: "clear" };

export const initialCompareState: CompareState = {
  items: [],
  hasHydrated: false,
};

export function compareReducer(
  state: CompareState,
  action: CompareAction,
): CompareState {
  switch (action.type) {
    case "hydrate":
      return {
        items: action.payload.slice(0, MAX_COMPARE_ITEMS),
        hasHydrated: true,
      };
    case "toggle": {
      const exists = state.items.some((item) => item.id === action.payload.id);

      if (exists) {
        return {
          ...state,
          items: state.items.filter((item) => item.id !== action.payload.id),
        };
      }

      if (state.items.length < MAX_COMPARE_ITEMS) {
        return {
          ...state,
          items: [action.payload, ...state.items],
        };
      }

      return {
        ...state,
        items: [state.items[1], action.payload],
      };
    }
    case "clear":
      return {
        ...state,
        items: [],
      };
    default:
      return state;
  }
}

export function readCompareFromStorage() {
  if (typeof window === "undefined") {
    return [];
  }

  const rawValue = window.localStorage.getItem(COMPARE_STORAGE_KEY);

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

export function writeCompareToStorage(items: FavoriteEvent[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(items));
}
