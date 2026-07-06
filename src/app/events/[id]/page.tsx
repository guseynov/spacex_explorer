import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventDetailScreen } from "@/features/events/components/event-detail-screen";
import { queryEventStoreById } from "@/lib/api/event-store";

export const metadata: Metadata = {
  title: "Event Detail",
};

export default async function EventDetailPage(
  props: {
    params: Promise<{ id: string }>;
  },
) {
  const params = await props.params;
  const eventId = params.id;
  const event = await queryEventStoreById(eventId);

  if (!event) {
    notFound();
  }

  return <EventDetailScreen eventId={eventId} initialEvent={event} />;
}
