"use client";

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
} from "react";
import type { FavoriteEvent } from "@/lib/api/event-schemas";
import {
  compareReducer,
  initialCompareState,
  readCompareFromStorage,
  writeCompareToStorage,
} from "./compare-reducer";

type CompareContextValue = {
  items: FavoriteEvent[];
  hasHydrated: boolean;
  isSelected: (id: string) => boolean;
  toggleCompare: (event: FavoriteEvent) => void;
  clearCompare: () => void;
};

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(
    compareReducer,
    initialCompareState,
  );

  useEffect(() => {
    dispatch({
      type: "hydrate",
      payload: readCompareFromStorage(),
    });
  }, []);

  useEffect(() => {
    if (!state.hasHydrated) {
      return;
    }

    writeCompareToStorage(state.items);
  }, [state.hasHydrated, state.items]);

  const value: CompareContextValue = {
    items: state.items,
    hasHydrated: state.hasHydrated,
    isSelected: (id) => state.items.some((item) => item.id === id),
    toggleCompare: (event) =>
      dispatch({ type: "toggle", payload: event }),
    clearCompare: () => dispatch({ type: "clear" }),
  };

  return (
    <CompareContext.Provider value={value}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);

  if (!context) {
    throw new Error("useCompare must be used within CompareProvider.");
  }

  return context;
}
