"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import {
  retryDelay,
  shouldRetryRequest,
} from "@/lib/api/errors";
import { FavoritesProvider } from "@/features/favorites/favorites-context";
import { CompareProvider } from "@/features/compare/compare-context";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: shouldRetryRequest,
            retryDelay,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <FavoritesProvider>
        <CompareProvider>
          {children}
        </CompareProvider>
      </FavoritesProvider>
    </QueryClientProvider>
  );
}
