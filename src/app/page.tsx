import type { InfiniteData } from "@tanstack/react-query";
import { RateLimitState } from "@/components/rate-limit-state";
import { LaunchesExplorer } from "@/features/launches/components/launches-explorer";
import { fetchLaunchesPage } from "@/lib/api/client";
import { LaunchApiError } from "@/lib/api/errors";
import { parseLaunchSearchParams } from "@/lib/api/query-builder";
import type { LaunchesPage } from "@/lib/api/schemas";

export default async function HomePage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await props.searchParams;
  const filters = parseLaunchSearchParams(
    buildSearchParams(searchParams),
  );
  let firstPage: LaunchesPage;

  try {
    firstPage = await fetchLaunchesPage(filters, 1);
  } catch (error) {
    if (error instanceof LaunchApiError && error.status === 429) {
      return (
        <div className="flex min-h-full items-start justify-center pt-6">
          <RateLimitState
            message="Launch Library is rate limiting requests right now. Refresh the page in a moment to try again."
          />
        </div>
      );
    }

    throw error;
  }

  const initialData: InfiniteData<LaunchesPage, number> = {
    pages: [firstPage],
    pageParams: [1],
  };

  return (
    <LaunchesExplorer
      initialData={initialData}
    />
  );
}

function buildSearchParams(
  params: Record<string, string | string[] | undefined>,
) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") {
      searchParams.set(key, value);
    }
  }

  return searchParams;
}
