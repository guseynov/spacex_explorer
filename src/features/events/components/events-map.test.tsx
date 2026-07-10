import { act, render, waitFor } from "@testing-library/react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Event } from "@/lib/api/event-schemas";
import { EventsMap } from "./events-map";

const maplibreMock = vi.hoisted(() => {
  class MockGeoJSONSource {
    setData = vi.fn();
  }

  class MockMap {
    styleLoaded = false;
    sources = new Map<string, MockGeoJSONSource>();
    layers = new Map<string, { id: string }>();
    listeners = new Map<string, Array<(event?: unknown) => void>>();
    layerListeners = new Map<string, Array<(event?: unknown) => void>>();
    remove = vi.fn();
    addControl = vi.fn();
    addSource = vi.fn((id: string) => {
      this.sources.set(id, new MockGeoJSONSource());
    });
    getSource = vi.fn((id: string) => this.sources.get(id));
    addLayer = vi.fn((layer: { id: string }) => {
      this.layers.set(layer.id, layer);
    });
    getLayer = vi.fn((id: string) => this.layers.get(id));
    setFilter = vi.fn();
    setProjection = vi.fn();
    flyTo = vi.fn();
    fitBounds = vi.fn();
    easeTo = vi.fn();
    getZoom = vi.fn(() => 1);
    getCanvas = vi.fn(() => ({ style: { cursor: "" } }));

    constructor() {
      mapInstances.push(this);
    }

    on(eventName: string, layerOrHandler: string | ((event?: unknown) => void), handler?: (event?: unknown) => void) {
      if (typeof layerOrHandler === "string" && handler) {
        const key = `${eventName}:${layerOrHandler}`;
        const listeners = this.layerListeners.get(key) ?? [];
        listeners.push(handler);
        this.layerListeners.set(key, listeners);
        return;
      }

      if (typeof layerOrHandler === "function") {
        const listeners = this.listeners.get(eventName) ?? [];
        listeners.push(layerOrHandler);
        this.listeners.set(eventName, listeners);
      }
    }

    isStyleLoaded() {
      return this.styleLoaded;
    }

    trigger(eventName: string, event?: unknown) {
      if (eventName === "load") {
        this.styleLoaded = true;
      }

      for (const listener of this.listeners.get(eventName) ?? []) {
        listener(event);
      }
    }

    triggerLayer(eventName: string, layerId: string, event?: unknown) {
      for (const listener of this.layerListeners.get(`${eventName}:${layerId}`) ?? []) {
        listener(event);
      }
    }
  }

  class MockPopup {
    remove = vi.fn();
    setLngLat = vi.fn(() => this);
    setHTML = vi.fn(() => this);
    addTo = vi.fn(() => this);

    constructor() {
      popupInstances.push(this);
    }
  }

  class MockNavigationControl {}

  const mapInstances: MockMap[] = [];
  const popupInstances: MockPopup[] = [];

  return {
    Map: MockMap,
    Popup: MockPopup,
    NavigationControl: MockNavigationControl,
    mapInstances,
    popupInstances,
  };
});

vi.mock("maplibre-gl", () => ({
  default: {
    Map: maplibreMock.Map,
    Popup: maplibreMock.Popup,
    NavigationControl: maplibreMock.NavigationControl,
  },
}));

const baseEvent: Event = {
  id: "EONET_1",
  title: "Test event",
  description: "Synthetic event",
  status: "active",
  closedAt: null,
  categories: [{ id: "wildfires", title: "Wildfires", description: null }],
  sources: [{ id: "NASA", url: "https://example.com", title: "NASA" }],
  geometries: [],
  latestDate: "2026-07-09T00:00:00.000Z",
  latestGeometry: null,
  primaryCoordinate: [12, 34],
  coordinateLabel: null,
  magnitudeValue: null,
  magnitudeUnit: null,
  sourceLabel: "EONET",
  categoryLabel: "Wildfires",
  categoryId: "wildfires",
};

function MapHarness() {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const events = [{ ...baseEvent }];

  return (
    <EventsMap
      events={events}
      selectedEventId={selectedEventId}
      focusRequest={null}
      onSelectEvent={setSelectedEventId}
    />
  );
}

function FocusHarness({
  focusRequest,
}: {
  focusRequest: { id: string; token: number } | null;
}) {
  return (
    <EventsMap
      events={[{ ...baseEvent }]}
      selectedEventId={focusRequest?.id ?? null}
      focusRequest={focusRequest}
      onSelectEvent={() => {}}
    />
  );
}

describe("EventsMap", () => {
  beforeEach(() => {
    maplibreMock.mapInstances.length = 0;
    maplibreMock.popupInstances.length = 0;
    vi.clearAllMocks();
  });

  it("does not recreate the map when selecting a point", async () => {
    render(<MapHarness />);

    expect(maplibreMock.mapInstances).toHaveLength(1);

    const map = maplibreMock.mapInstances[0];

    act(() => {
      map.trigger("load");
    });

    const source = map.getSource("events-source");
    const selectedSource = map.getSource("events-selected-source");

    act(() => {
      map.triggerLayer("click", "events-points", {
        features: [{ properties: { id: baseEvent.id } }],
      });
    });

    await waitFor(() => {
      expect(selectedSource?.setData).toHaveBeenCalledWith(
        expect.objectContaining({
          features: [
            expect.objectContaining({
              properties: expect.objectContaining({
                id: baseEvent.id,
              }),
            }),
          ],
        }),
      );
    });

    await waitFor(() => {
      expect(
        maplibreMock.popupInstances.some((popup) => popup.addTo.mock.calls.length > 0),
      ).toBe(true);
    });

    expect(source?.setData).toHaveBeenCalledTimes(1);
    expect(maplibreMock.mapInstances).toHaveLength(1);
    expect(map.remove).not.toHaveBeenCalled();
  });

  it("flies to a requested event even before the map style finishes loading", async () => {
    const { rerender } = render(<FocusHarness focusRequest={null} />);

    expect(maplibreMock.mapInstances).toHaveLength(1);

    const map = maplibreMock.mapInstances[0];

    rerender(
      <FocusHarness
        focusRequest={{ id: baseEvent.id, token: 1 }}
      />,
    );

    await waitFor(() => {
      expect(map.flyTo).toHaveBeenCalledWith(
        expect.objectContaining({
          center: baseEvent.primaryCoordinate,
          essential: true,
          duration: 900,
        }),
      );
    });
  });
});
