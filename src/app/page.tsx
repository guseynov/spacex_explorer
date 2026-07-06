import { EventsExplorer } from "@/features/events/components/events-explorer";
import { queryEventStorePage } from "@/lib/api/event-store";
import { parseEventSearchParams } from "@/lib/api/event-query-builder";
import type { EventListPage } from "@/lib/api/event-schemas";

export default async function HomePage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await props.searchParams;
  const filters = parseEventSearchParams(buildSearchParams(searchParams));
  const initialRangeFilters = {
    ...filters,
    search: "",
    sort: "newest" as const,
  };
  const firstPage: EventListPage = await queryEventStorePage(initialRangeFilters, 1);

  return (
    <EventsExplorer
      initialData={firstPage}
      initialRangeFilters={initialRangeFilters}
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
