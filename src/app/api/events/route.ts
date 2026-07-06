import { EventApiError } from "@/lib/api/errors";
import { parseEventSearchParams } from "@/lib/api/event-query-builder";
import {
  getEventStoreSyncStatus,
  queryEventStorePage,
} from "@/lib/api/event-store";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = Math.max(Number(url.searchParams.get("page")) || 1, 1);
    const limit = Math.max(Number(url.searchParams.get("limit")) || 500, 1);
    const filters = parseEventSearchParams(url.searchParams);
    const events = await queryEventStorePage(filters, page, limit);
    const sync = await getEventStoreSyncStatus();

    return Response.json({
      ...events,
      items: events.results,
      total: events.count,
      range: {
        from: filters.from,
        to: filters.to,
      },
      sync,
      source: "database",
    }, {
      headers: {
        "cache-control": "public, max-age=60, s-maxage=300, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    if (error instanceof EventApiError) {
      return Response.json({ message: error.message }, { status: error.status });
    }

    return Response.json(
      { message: "Unexpected event data error." },
      { status: 500 },
    );
  }
}
