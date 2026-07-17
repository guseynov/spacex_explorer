import type { Metadata } from "next";
import { FavoritesPage } from "@/features/favorites/favorites-page";

export const metadata: Metadata = {
  title: "Saved Events",
};

export default function FavoritesRoute() {
  return <FavoritesPage />;
}
