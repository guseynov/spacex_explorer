import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Event } from "@/lib/api/event-schemas";
import { EventsMap } from "./events-map";

const maplibreMock = vi.hoisted(() => {
  class MockGeoJSONSource {
    setData = vi.fn();
  }

  class MockMap {
    options: Record<string, unknown>;
    styleLoaded = false;
    container = document.createElement("div");
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
    setLayoutProperty = vi.fn();
    setPaintProperty = vi.fn();
    stop = vi.fn();
    flyTo = vi.fn();
    fitBounds = vi.fn();
    easeTo = vi.fn();
    panBy = vi.fn();
    getZoom = vi.fn(() => 1);
    isMoving = vi.fn(() => false);
    getCanvas = vi.fn(() => ({ style: { cursor: "" } }));
    getContainer = vi.fn(() => this.container);
    project = vi.fn((coordinate: [number, number]) => {
      void coordinate;
      return { x: 50, y: 50 };
    });

    constructor(options: Record<string, unknown> = {}) {
      this.options = options;
      Object.defineProperties(this.container, {
        clientWidth: { configurable: true, value: 100 },
        clientHeight: { configurable: true, value: 100 },
      });

      for (const id of [
        "atlas-imagery",
        "atlas-land",
        "atlas-coast",
        "atlas-country-labels",
      ]) {
        this.layers.set(id, { id });
      }

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
    element = document.createElement("div");
    options: Record<string, unknown>;
    remove = vi.fn();
    setOffset = vi.fn(() => this);
    setLngLat = vi.fn(() => this);
    setHTML = vi.fn((html: string) => {
      this.element.innerHTML = html;
      return this;
    });
    addTo = vi.fn(() => this);
    getElement = vi.fn(() => this.element);
    isOpen = vi.fn(() => true);
    on = vi.fn(() => this);

    constructor(options: Record<string, unknown> = {}) {
      this.options = options;
      popupInstances.push(this);
    }
  }

  class MockNavigationControl {}
  class MockAttributionControl {}

  const mapInstances: MockMap[] = [];
  const popupInstances: MockPopup[] = [];

  return {
    Map: MockMap,
    Popup: MockPopup,
    NavigationControl: MockNavigationControl,
    AttributionControl: MockAttributionControl,
    mapInstances,
    popupInstances,
  };
});

vi.mock("maplibre-gl", () => ({
  default: {
    Map: maplibreMock.Map,
    Popup: maplibreMock.Popup,
    NavigationControl: maplibreMock.NavigationControl,
    AttributionControl: maplibreMock.AttributionControl,
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
const defaultFitScopeToken = Symbol("test-map-scope");

function MapHarness() {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [focusRequest, setFocusRequest] = useState<{ id: string; token: number } | null>(null);
  const events = [{ ...baseEvent }];

  return (
    <EventsMap
      events={events}
      selectedEventId={selectedEventId}
      fitScopeToken={defaultFitScopeToken}
      focusRequest={focusRequest}
      onSelectEvent={(id) => {
        setSelectedEventId(id);
        setFocusRequest((previousRequest) => ({
          id,
          token: (previousRequest?.token ?? 0) + 1,
        }));
      }}
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
      fitScopeToken={defaultFitScopeToken}
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

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("keeps the map mounted and stages an area search when selecting a point", async () => {
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
      expect(map.flyTo).toHaveBeenCalledWith(
        expect.objectContaining({ center: baseEvent.primaryCoordinate }),
      );
    });

    await waitFor(() => {
      expect(
        maplibreMock.popupInstances.some((popup) => popup.addTo.mock.calls.length > 0),
      ).toBe(true);
    });

    expect(maplibreMock.popupInstances).toHaveLength(1);
    expect(maplibreMock.popupInstances[0].setHTML).toHaveBeenLastCalledWith(
      expect.stringContaining(baseEvent.title),
    );
    expect(maplibreMock.popupInstances[0].setHTML).toHaveBeenLastCalledWith(
      expect.stringContaining("Open in feed"),
    );
    expect(maplibreMock.popupInstances[0].setHTML).toHaveBeenLastCalledWith(
      expect.stringContaining(`/events/${baseEvent.id}`),
    );
    expect(maplibreMock.popupInstances[0].options).toEqual(
      expect.objectContaining({
        offset: expect.objectContaining({
          bottom: [0, -14],
          "bottom-right": [0, -14],
          right: [-14, 0],
        }),
        className: "event-map-popup",
        padding: expect.objectContaining({ bottom: 170 }),
      }),
    );
    expect(maplibreMock.popupInstances[0].setOffset).toHaveBeenLastCalledWith(
      expect.objectContaining({
        bottom: [0, -18],
        "bottom-right": [0, -18],
        right: [-18, 0],
      }),
    );

    expect(source?.setData).toHaveBeenCalledTimes(1);
    expect(maplibreMock.mapInstances).toHaveLength(1);
    expect(map.panBy).not.toHaveBeenCalled();
    expect(map.remove).not.toHaveBeenCalled();

    act(() => {
      map.trigger("movestart");
      map.trigger("moveend");
    });

    expect(screen.getByRole("button", { name: "Search in this area" })).toBeInTheDocument();
  });

  it("restores the clicked event after a hover preview ends", async () => {
    render(<MapHarness />);
    const map = maplibreMock.mapInstances[0];

    act(() => {
      map.trigger("load");
      map.triggerLayer("click", "events-points", {
        features: [{ properties: { id: baseEvent.id } }],
      });
    });

    const popup = maplibreMock.popupInstances[0];

    await waitFor(() => {
      expect(popup.setHTML).toHaveBeenLastCalledWith(
        expect.stringContaining(baseEvent.title),
      );
    });

    act(() => {
      map.triggerLayer("mouseenter", "events-points", {
        features: [{
          geometry: { type: "Point", coordinates: [44, 55] },
          properties: {
            id: "hover-event",
            title: "Hover preview",
            categoryLabel: "Floods",
            status: "closed",
            latestDate: "2026-07-10T00:00:00.000Z",
            sourceLabel: "EONET",
          },
        }],
      });
    });

    expect(popup.setHTML).toHaveBeenLastCalledWith(
      expect.stringContaining("Hover preview"),
    );
    expect(popup.setOffset).toHaveBeenLastCalledWith(
      expect.objectContaining({
        bottom: [0, -14],
        "bottom-right": [0, -14],
      }),
    );
    expect(popup.setHTML).toHaveBeenLastCalledWith(
      expect.stringContaining("/events/hover-event"),
    );

    act(() => {
      map.triggerLayer("mouseleave", "events-points");
    });

    await waitFor(() => {
      expect(popup.setHTML).toHaveBeenLastCalledWith(
        expect.stringContaining(baseEvent.title),
      );
    });
    expect(popup.setOffset).toHaveBeenLastCalledWith(
      expect.objectContaining({
        bottom: [0, -18],
        "bottom-right": [0, -18],
      }),
    );
    expect(maplibreMock.popupInstances).toHaveLength(1);
  });

  it("supports deeper zoom for controls and cluster expansion", () => {
    render(<MapHarness />);
    const map = maplibreMock.mapInstances[0];

    expect(map.options).toEqual(
      expect.objectContaining({ maxZoom: 16 }),
    );

    act(() => {
      map.trigger("load");
      map.getZoom.mockReturnValue(15);
      map.triggerLayer("click", "events-clusters", {
        lngLat: { lng: 12, lat: 34 },
      });
    });

    expect(map.easeTo).toHaveBeenCalledWith(
      expect.objectContaining({ zoom: 16 }),
    );

    act(() => {
      map.trigger("movestart");
      map.trigger("moveend");
    });

    expect(screen.getByRole("button", { name: "Search in this area" })).toBeInTheDocument();
  });

  it("starts in hybrid mode and can return to the atlas style", () => {
    render(<MapHarness />);
    const map = maplibreMock.mapInstances[0];

    act(() => {
      map.trigger("load");
    });

    const hybridButton = screen.getByRole("button", { name: "hybrid" });
    const atlasButton = screen.getByRole("button", { name: "atlas" });

    expect(hybridButton).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(hybridButton.querySelector(".lucide-satellite")).toBeInTheDocument();
    expect(atlasButton.querySelector(".lucide-map")).toBeInTheDocument();
    expect(map.setLayoutProperty).toHaveBeenCalledWith(
      "atlas-imagery",
      "visibility",
      "visible",
    );

    fireEvent.click(atlasButton);

    expect(map.setLayoutProperty).toHaveBeenLastCalledWith(
      "atlas-imagery",
      "visibility",
      "none",
    );
    expect(map.setPaintProperty).toHaveBeenCalledWith(
      "atlas-land",
      "fill-opacity",
      0.96,
    );
  });

  it("searches the settled map area only after the user confirms it", () => {
    const onSearchArea = vi.fn();
    const westernEvent: Event = {
      ...baseEvent,
      id: "EONET_2",
      title: "Western event",
      primaryCoordinate: [-24, 18],
    };
    const eventWithoutCoordinates: Event = {
      ...baseEvent,
      id: "EONET_3",
      title: "Event without coordinates",
      primaryCoordinate: null,
    };

    render(
      <EventsMap
        events={[westernEvent, baseEvent, eventWithoutCoordinates]}
        selectedEventId={null}
        fitScopeToken={defaultFitScopeToken}
        focusRequest={null}
        onSelectEvent={() => {}}
        onSearchArea={onSearchArea}
      />,
    );

    const map = maplibreMock.mapInstances[0];

    map.project.mockImplementation(([longitude]: [number, number]) => ({
      x: longitude > 0 ? 50 : -1,
      y: 50,
    }));

    act(() => {
      map.trigger("load");
    });

    expect(onSearchArea).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "Search in this area" })).not.toBeInTheDocument();

    map.project.mockImplementation(([longitude]: [number, number]) => ({
      x: longitude < 0 ? 50 : 101,
      y: 50,
    }));

    act(() => {
      map.trigger("movestart");
      map.trigger("moveend");
    });

    expect(onSearchArea).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Search in this area" }));

    expect(onSearchArea).toHaveBeenLastCalledWith([westernEvent.id]);
    expect(screen.queryByRole("button", { name: "Search in this area" })).not.toBeInTheDocument();

    map.project.mockReturnValue({ x: 50, y: 50 });
    onSearchArea.mockClear();

    act(() => {
      map.trigger("resize");
    });

    expect(onSearchArea).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Search in this area" }));

    expect(onSearchArea).toHaveBeenLastCalledWith([
      westernEvent.id,
      baseEvent.id,
    ]);

    map.project.mockReturnValue({ x: 101, y: 50 });
    onSearchArea.mockClear();

    act(() => {
      map.trigger("resize");
    });
    fireEvent.click(screen.getByRole("button", { name: "Search in this area" }));

    expect(onSearchArea).toHaveBeenLastCalledWith([]);
  });

  it("keeps map overlays above a resizing desktop timeline", () => {
    let timelineTop = 656;
    let notifyResize = () => {};

    class MockResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        notifyResize = () => callback([], this as unknown as ResizeObserver);
      }

      observe = vi.fn();
      disconnect = vi.fn();
    }

    vi.stubGlobal("ResizeObserver", MockResizeObserver);
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function () {
      if (this.matches("[data-testid='events-map']")) {
        return {
          x: 0,
          y: 54,
          width: 800,
          height: 746,
          top: 54,
          right: 800,
          bottom: 800,
          left: 0,
          toJSON: () => ({}),
        };
      }

      if (this.matches("[data-map-overlay='timeline']")) {
        return {
          x: 16,
          y: timelineTop,
          width: 768,
          height: 800 - timelineTop - 16,
          top: timelineTop,
          right: 784,
          bottom: 784,
          left: 16,
          toJSON: () => ({}),
        };
      }

      return {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        toJSON: () => ({}),
      };
    });

    render(
      <>
        <div data-map-overlay="timeline" />
        <EventsMap
          events={[baseEvent]}
          selectedEventId={null}
          fitScopeToken={defaultFitScopeToken}
          focusRequest={null}
          onSelectEvent={() => {}}
          onSearchArea={() => {}}
        />
      </>,
    );

    const map = maplibreMock.mapInstances[0];

    act(() => {
      map.trigger("load");
      map.trigger("movestart");
      map.trigger("moveend");
    });

    const mapShell = screen.getByRole("button", {
      name: "Search in this area",
    }).closest(".event-map-shell");

    expect(mapShell).toHaveStyle({ "--map-overlay-bottom": "170px" });

    timelineTop = 569;
    act(() => notifyResize());

    expect(mapShell).toHaveStyle({ "--map-overlay-bottom": "247px" });
  });

  it("updates map data without committing a pending area search", async () => {
    const onSearchArea = vi.fn();
    const { rerender } = render(
      <EventsMap
        events={[baseEvent]}
        selectedEventId={null}
        fitScopeToken={defaultFitScopeToken}
        focusRequest={null}
        onSelectEvent={() => {}}
        onSearchArea={onSearchArea}
      />,
    );
    const map = maplibreMock.mapInstances[0];

    act(() => {
      map.trigger("load");
    });

    const source = map.getSource("events-source");
    const nextEvent: Event = {
      ...baseEvent,
      id: "EONET_4",
      title: "Updated event",
      primaryCoordinate: [22, 40],
    };

    source?.setData.mockClear();
    map.styleLoaded = false;

    act(() => {
      map.trigger("movestart");
      map.trigger("moveend");
    });

    expect(screen.getByRole("button", { name: "Search in this area" })).toBeInTheDocument();

    rerender(
      <EventsMap
        events={[nextEvent]}
        selectedEventId={null}
        fitScopeToken={defaultFitScopeToken}
        focusRequest={null}
        onSelectEvent={() => {}}
        onSearchArea={onSearchArea}
      />,
    );

    await waitFor(() => {
      expect(source?.setData).toHaveBeenCalledWith(
        expect.objectContaining({
          features: [
            expect.objectContaining({
              properties: expect.objectContaining({ id: nextEvent.id }),
            }),
          ],
        }),
      );
    });

    expect(onSearchArea).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Search in this area" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Search in this area" }));

    expect(onSearchArea).toHaveBeenLastCalledWith([nextEvent.id]);
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
      expect(map.stop).toHaveBeenCalled();
      expect(map.flyTo).toHaveBeenCalledWith(
        expect.objectContaining({
          center: baseEvent.primaryCoordinate,
          essential: true,
          duration: 900,
        }),
      );
    });
  });

  it("does not reset the camera when focused event data refreshes", async () => {
    const scopeToken = Symbol("stable-scope");
    const focusRequest = { id: baseEvent.id, token: 1 };
    const replacementEvent: Event = {
      ...baseEvent,
      id: "EONET_5",
      title: "Replacement event",
      primaryCoordinate: [-40, 15],
    };
    const { rerender } = render(
      <EventsMap
        events={[baseEvent]}
        selectedEventId={baseEvent.id}
        fitScopeToken={scopeToken}
        focusRequest={focusRequest}
        onSelectEvent={() => {}}
      />,
    );
    const map = maplibreMock.mapInstances[0];

    act(() => {
      map.trigger("load");
    });

    await waitFor(() => {
      expect(map.flyTo).toHaveBeenCalledWith(
        expect.objectContaining({ center: baseEvent.primaryCoordinate }),
      );
    });

    map.fitBounds.mockClear();
    map.flyTo.mockClear();

    rerender(
      <EventsMap
        events={[replacementEvent]}
        selectedEventId={null}
        fitScopeToken={scopeToken}
        focusRequest={focusRequest}
        onSelectEvent={() => {}}
      />,
    );

    await waitFor(() => {
      expect(map.getSource("events-source")?.setData).toHaveBeenCalledWith(
        expect.objectContaining({
          features: [
            expect.objectContaining({
              properties: expect.objectContaining({ id: replacementEvent.id }),
            }),
          ],
        }),
      );
    });

    expect(map.flyTo).not.toHaveBeenCalled();
    expect(map.fitBounds).not.toHaveBeenCalled();
  });

  it("fits once when the event filter scope intentionally changes", async () => {
    const initialScopeToken = Symbol("initial-scope");
    const nextScopeToken = Symbol("next-scope");
    const nextEvent: Event = {
      ...baseEvent,
      id: "EONET_6",
      title: "Next scope event",
      primaryCoordinate: [65, -12],
    };
    const { rerender } = render(
      <EventsMap
        events={[baseEvent]}
        selectedEventId={null}
        fitScopeToken={initialScopeToken}
        focusRequest={null}
        onSelectEvent={() => {}}
      />,
    );
    const map = maplibreMock.mapInstances[0];

    act(() => {
      map.trigger("load");
      map.trigger("movestart");
      map.trigger("moveend");
    });
    map.fitBounds.mockClear();

    expect(screen.getByRole("button", { name: "Search in this area" })).toBeInTheDocument();
    map.isMoving.mockReturnValue(true);

    rerender(
      <EventsMap
        events={[nextEvent]}
        selectedEventId={null}
        fitScopeToken={nextScopeToken}
        focusRequest={null}
        onSelectEvent={() => {}}
      />,
    );

    await waitFor(() => {
      expect(map.fitBounds).toHaveBeenCalledTimes(1);
    });

    expect(screen.queryByRole("button", { name: "Search in this area" })).not.toBeInTheDocument();

    act(() => {
      map.trigger("movestart");
      map.trigger("moveend");
    });

    expect(screen.queryByRole("button", { name: "Search in this area" })).not.toBeInTheDocument();
    map.isMoving.mockReturnValue(false);

    rerender(
      <EventsMap
        events={[{ ...nextEvent }]}
        selectedEventId={null}
        fitScopeToken={nextScopeToken}
        focusRequest={null}
        onSelectEvent={() => {}}
      />,
    );

    expect(map.fitBounds).toHaveBeenCalledTimes(1);
  });

});
