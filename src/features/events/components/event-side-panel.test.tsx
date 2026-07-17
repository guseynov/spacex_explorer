import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Event } from "@/lib/api/event-schemas";
import { createDefaultEventFilters } from "@/lib/api/event-query-builder";
import { renderWithProviders } from "@/test/render";
import { EventSidePanel } from "./event-side-panel";

function createEvent(index: number): Event {
  return {
    id: `event-${index}`,
    title: `Virtual event ${index}`,
    description: null,
    status: "active",
    closedAt: null,
    categories: [{ id: "wildfires", title: "Wildfires", description: null }],
    sources: [],
    geometries: [],
    latestDate: "2026-07-15T00:00:00.000Z",
    latestGeometry: null,
    primaryCoordinate: null,
    coordinateLabel: null,
    magnitudeValue: null,
    magnitudeUnit: null,
    sourceLabel: "EONET",
    categoryLabel: "Wildfires",
    categoryId: "wildfires",
  };
}

describe("EventSidePanel virtualization", () => {
  it("mounts only the visible window for a very large result set", () => {
    const events = Array.from({ length: 10_000 }, (_, index) => createEvent(index));

    renderWithProviders(
      <EventSidePanel
        events={events}
        filters={{
          ...createDefaultEventFilters(new Date("2026-07-15T00:00:00.000Z")),
          category: "wildfires",
        }}
        totalCount={events.length}
        mirrorCount={events.length}
        selectedEventId={null}
        onChangeFilters={vi.fn()}
        onResetFilters={vi.fn()}
        onViewOnMap={vi.fn()}
      />,
    );

    const mountedRows = screen.getAllByRole("button", { name: /select virtual event/i });

    expect(screen.getByText("10,000")).toBeInTheDocument();
    expect(mountedRows.length).toBeGreaterThan(0);
    expect(mountedRows.length).toBeLessThan(30);
    expect(screen.queryByRole("button", { name: "Select Virtual event 9999" })).not.toBeInTheDocument();

    const scrollableList = screen.getByLabelText("Scrollable event list");
    fireEvent.wheel(screen.getByRole("complementary", { name: "Event results" }), { deltaY: 184 });
    expect(scrollableList.scrollTop).toBe(184);
  });

  it("keeps the rail list-only when an event is selected", () => {
    const event = createEvent(1);

    renderWithProviders(
      <EventSidePanel
        events={[event]}
        filters={{
          ...createDefaultEventFilters(new Date("2026-07-15T00:00:00.000Z")),
          category: "wildfires",
        }}
        totalCount={1}
        mirrorCount={1}
        selectedEventId={event.id}
        onChangeFilters={vi.fn()}
        onResetFilters={vi.fn()}
        onViewOnMap={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: `Select ${event.title}` })).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByRole("button", { name: /save event/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: `View details for ${event.title}` })).toHaveAttribute(
      "href",
      `/events/${event.id}`,
    );
  });

  it("keeps event dates intact while truncating long source names", () => {
    const event = {
      ...createEvent(1),
      sourceLabel: "Global Disaster Alert and Coordination System",
    };

    renderWithProviders(
      <EventSidePanel
        events={[event]}
        filters={{
          ...createDefaultEventFilters(new Date("2026-07-15T00:00:00.000Z")),
          category: "wildfires",
        }}
        totalCount={1}
        mirrorCount={1}
        selectedEventId={event.id}
        onChangeFilters={vi.fn()}
        onResetFilters={vi.fn()}
        onViewOnMap={vi.fn()}
      />,
    );

    expect(screen.getByText("Jul 15, 2026")).toHaveClass(
      "shrink-0",
      "whitespace-nowrap",
    );
    expect(
      screen.getByTitle("Global Disaster Alert and Coordination System"),
    ).toHaveClass("min-w-0", "flex-1", "truncate");
  });

  it("requires a category before mounting event rows", () => {
    const events = [createEvent(1), createEvent(2)];

    renderWithProviders(
      <EventSidePanel
        events={events}
        filters={createDefaultEventFilters(new Date("2026-07-15T00:00:00.000Z"))}
        totalCount={events.length}
        mirrorCount={events.length}
        selectedEventId={null}
        onChangeFilters={vi.fn()}
        onResetFilters={vi.fn()}
        onViewOnMap={vi.fn()}
      />,
    );

    const panel = screen.getByRole("complementary", { name: "Event results" });

    expect(panel).toHaveClass("overflow-y-auto");
    expect(panel).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("heading", { name: "Browse by category" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Wildfires" }).querySelector(".lucide-flame"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Human-caused" }).querySelector(".lucide-factory"),
    ).toBeInTheDocument();
    expect(screen.queryByText("🔥")).not.toBeInTheDocument();
    expect(screen.getByText("Choose what to explore")).toBeInTheDocument();
    expect(screen.getByLabelText("Event search")).toBeDisabled();
    expect(screen.queryByRole("button", { name: /select virtual event/i })).not.toBeInTheDocument();
  });

  it("does not report an empty mirror when only the current view has no matches", () => {
    renderWithProviders(
      <EventSidePanel
        events={[]}
        filters={{
          ...createDefaultEventFilters(new Date("2026-07-15T00:00:00.000Z")),
          category: "wildfires",
        }}
        totalCount={0}
        mirrorCount={1_749}
        selectedEventId={null}
        onChangeFilters={vi.fn()}
        onResetFilters={vi.fn()}
        onViewOnMap={vi.fn()}
      />,
    );

    expect(screen.getByText(/no mirrored events match this category/i)).toBeInTheDocument();
    expect(screen.queryByText(/local event mirror is empty/i)).not.toBeInTheDocument();
  });

  it("labels searched-area results and explains how to refresh an empty area", () => {
    const { rerender } = renderWithProviders(
      <EventSidePanel
        events={[createEvent(1), createEvent(2)]}
        filters={{
          ...createDefaultEventFilters(new Date("2026-07-15T00:00:00.000Z")),
          category: "wildfires",
        }}
        totalCount={5}
        mirrorCount={5}
        selectedEventId={null}
        isMapAreaFiltered
        onChangeFilters={vi.fn()}
        onResetFilters={vi.fn()}
        onViewOnMap={vi.fn()}
      />,
    );

    expect(screen.getByText(/in area · 5 total/i)).toBeInTheDocument();

    rerender(
      <EventSidePanel
        events={[]}
        filters={{
          ...createDefaultEventFilters(new Date("2026-07-15T00:00:00.000Z")),
          category: "wildfires",
        }}
        totalCount={5}
        mirrorCount={5}
        selectedEventId={null}
        isMapAreaFiltered
        onChangeFilters={vi.fn()}
        onResetFilters={vi.fn()}
        onViewOnMap={vi.fn()}
      />,
    );

    expect(screen.getByText(/then choose search in this area/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reset filters" })).not.toBeInTheDocument();
  });
});
