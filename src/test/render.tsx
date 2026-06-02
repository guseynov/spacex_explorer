import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { FavoritesProvider } from "@/features/favorites/favorites-context";
import { CompareProvider } from "@/features/compare/compare-context";

export function renderWithProviders(ui: ReactElement) {
  return render(
    <FavoritesProvider>
      <CompareProvider>{ui}</CompareProvider>
    </FavoritesProvider>,
  );
}
