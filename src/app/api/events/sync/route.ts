import { EventApiError } from "@/lib/api/errors";
import { syncEventStoreSnapshot } from "@/lib/api/event-store";

export async function POST() {
  try {
    const summary = await syncEventStoreSnapshot();

    return Response.json(
      {
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

    return Response.json(
      { message: "Unable to sync event mirror." },
      { status: 500 },
    );
  }
}
