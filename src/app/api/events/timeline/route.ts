import { EventApiError } from "@/lib/api/errors";
import { parseEventSearchParams } from "@/lib/api/event-query-builder";
import { queryEventStoreTimeline } from "@/lib/api/event-store";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const filters = parseEventSearchParams(url.searchParams);
    const bucket = normalizeBucket(url.searchParams.get("bucket"));
    const buckets = await queryEventStoreTimeline({
      from: filters.from,
      to: filters.to,
      status: filters.status,
      category: filters.category,
      bucket,
    });

    return Response.json(
      {
        bucket,
        range: {
          from: filters.from,
          to: filters.to,
        },
        buckets,
        source: "database",
      },
      {
        headers: {
          "cache-control": "public, max-age=60, s-maxage=300, stale-while-revalidate=3600",
        },
      },
    );
  } catch (error) {
    if (error instanceof EventApiError) {
      return Response.json({ message: error.message }, { status: error.status });
    }

    return Response.json(
      { message: "Unexpected timeline data error." },
      { status: 500 },
    );
  }
}

function normalizeBucket(value: string | null) {
  return value === "week" || value === "month" ? value : "day";
}
