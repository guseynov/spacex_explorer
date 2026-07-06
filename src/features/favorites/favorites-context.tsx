"use client";

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
} from "react";
import type { FavoriteEvent } from "@/lib/api/event-schemas";
import {
  favoritesReducer,
  initialFavoritesState,
  readFavoritesFromStorage,
  writeFavoritesToStorage,
} from "./favorites-reducer";

type FavoritesContextValue = {
  items: FavoriteEvent[];
  hasHydrated: boolean;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (event: FavoriteEvent) => void;
  removeFavorite: (id: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(
    favoritesReducer,
    initialFavoritesState,
  );

  useEffect(() => {
    dispatch({
      type: "hydrate",
      payload: readFavoritesFromStorage(),
    });
  }, []);

  useEffect(() => {
    if (!state.hasHydrated) {
      return;
    }

    writeFavoritesToStorage(state.items);
  }, [state.hasHydrated, state.items]);

  const value: FavoritesContextValue = {
    items: state.items,
    hasHydrated: state.hasHydrated,
    isFavorite: (id) => state.items.some((item) => item.id === id),
    toggleFavorite: (event) =>
      dispatch({ type: "toggle", payload: event }),
    removeFavorite: (id) => dispatch({ type: "remove", payload: id }),
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error("useFavorites must be used within FavoritesProvider.");
  }

  return context;
}
