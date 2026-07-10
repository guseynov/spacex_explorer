import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { FavoriteEvent } from "@/lib/api/event-schemas";
import { EventListCard } from "./event-list-card";

const baseEvent: FavoriteEvent = {
  id: "event-1",
  title: "Flood in Nigeria",
  description: "River overflow",
  status: "closed",
  latestDate: "2026-06-08T00:00:00.000Z",
  categoryId: "floods",
  categoryLabel: "Floods",
  sourceLabel: "GDACS",
  coordinateLabel: "6.50° N, 3.40° E",
  primaryCoordinate: [3.4, 6.5],
  magnitudeValue: 2,
  magnitudeUnit: "m",
};

describe("EventListCard", () => {
  it("shows active map state clearly", () => {
    render(<EventListCard event={baseEvent} selected />);

    expect(screen.getByText("On map")).toBeInTheDocument();
  });

  it("focuses the map when the event has coordinates", () => {
    const onViewOnMap = vi.fn();

    render(
      <EventListCard
        event={baseEvent}
        onViewOnMap={onViewOnMap}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Map" }));

    expect(onViewOnMap).toHaveBeenCalledTimes(1);
  });

  it("does not treat the card body as an action target", () => {
    const onViewOnMap = vi.fn();

    render(
      <EventListCard
        event={baseEvent}
        onViewOnMap={onViewOnMap}
      />,
    );

    fireEvent.click(screen.getByText(baseEvent.title));

    expect(onViewOnMap).not.toHaveBeenCalled();
  });

  it("disables the map action when there is no map point", () => {
    const onViewOnMap = vi.fn();

    render(
      <EventListCard
        event={{ ...baseEvent, primaryCoordinate: null, coordinateLabel: null }}
        onViewOnMap={onViewOnMap}
      />,
    );

    const button = screen.getByRole("button", { name: "No map point" });

    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onViewOnMap).not.toHaveBeenCalled();
  });
});
