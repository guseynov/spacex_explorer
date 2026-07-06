import { EventApiError } from "@/lib/api/errors";
import { queryEventStoreById } from "@/lib/api/event-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const event = await queryEventStoreById(id);

    if (!event) {
      return Response.json(
        { message: "Event not found." },
        { status: 404 },
      );
    }

    return Response.json({
      ...event,
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
