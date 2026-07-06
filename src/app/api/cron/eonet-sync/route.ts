import { EventApiError } from "@/lib/api/errors";
import { syncRecentEvents } from "@/lib/eonet/sync-service";

export async function GET(request: Request) {
  try {
    assertAuthorized(request);
    const summary = await syncRecentEvents();

    return Response.json(
      {
        ok: true,
        ...summary,
      },
      {
        headers: {
          "cache-control": "no-store",
        },
      },
    );
  } catch (error) {
    if (error instanceof EventApiError) {
      return Response.json({ message: error.message }, { status: error.status });
    }

    if (error instanceof Error && error.message === "Unauthorized") {
      return Response.json({ message: error.message }, { status: 401 });
    }

    return Response.json(
      { message: "Unable to run EONET sync." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
}

function assertAuthorized(request: Request) {
  const secret = process.env.EONET_SYNC_SECRET;
  const cronHeader = request.headers.get("x-vercel-cron");
  const requestSecret =
    request.headers.get("x-eonet-sync-secret")
    ?? new URL(request.url).searchParams.get("secret");

  if (!secret) {
    return;
  }

  if (cronHeader === "1") {
    return;
  }

  if (requestSecret === secret) {
    return;
  }

  throw new Error("Unauthorized");
}
