import { EventApiError } from "@/lib/api/errors";
import { getSyncRunSummary } from "@/lib/eonet/repository";

export async function GET() {
  try {
    const summary = await getSyncRunSummary();

    return Response.json(
      {
        ...summary,
        source: "database",
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

    return Response.json(
      { message: "Unable to read sync status." },
      { status: 500 },
    );
  }
}
