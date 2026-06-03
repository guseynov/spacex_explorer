import type { InfiniteData } from "@tanstack/react-query";
import { LaunchesExplorer } from "@/features/launches/components/launches-explorer";
import { fetchLaunchesPage } from "@/lib/api/client";
import { parseLaunchSearchParams } from "@/lib/api/query-builder";
import type { LaunchesPage } from "@/lib/api/schemas";

export default async function HomePage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await props.searchParams;
  const filters = parseLaunchSearchParams(
    buildSearchParams(searchParams),
  );
  const firstPage = await fetchLaunchesPage(filters, 1);
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
