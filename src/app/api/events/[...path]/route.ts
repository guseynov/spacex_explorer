import { parseLaunchSearchParams } from "@/lib/api/query-builder";
import {
  fetchEonetEventById,
  fetchEonetEventsPage,
} from "@/lib/api/eonet-source";
import { LaunchApiError } from "@/lib/api/errors";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;

  try {
    if (path[0] !== "launches") {
      return Response.json({ message: "Not found" }, { status: 404 });
    }

    if (path[1]) {
      const launch = await fetchEonetEventById(path[1]);

      return Response.json(launch, {
        headers: {
          "cache-control": "public, max-age=60, s-maxage=300",
        },
      });
    }

    const url = new URL(request.url);
    const page = Math.max(Number(url.searchParams.get("page")) || 1, 1);
    const filters = parseLaunchSearchParams(url.searchParams);
    const launches = await fetchEonetEventsPage(filters, page);

    return Response.json(launches, {
      headers: {
        "cache-control": "public, max-age=60, s-maxage=300",
      },
    });
  } catch (error) {
    if (error instanceof LaunchApiError) {
      return Response.json({ message: error.message }, { status: error.status });
    }

    return Response.json(
      { message: "Unexpected event data error." },
      { status: 500 },
    );
  }
}
