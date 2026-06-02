import type { Metadata } from "next";
import { FavoritesPage } from "@/features/favorites/favorites-page";

export const metadata: Metadata = {
  title: "Favorites",
};

export default function FavoritesRoute() {
  return (
    <div className="h-full overflow-auto pr-1">
      <FavoritesPage />
    </div>
  );
}
