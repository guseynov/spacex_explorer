"use client";

import {
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import maplibregl from "maplibre-gl";
import { Map as MapIcon, Satellite, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Event } from "@/lib/api/event-schemas";
import { formatEventDateTime, getEventStatusLabel } from "@/lib/formatters";
import {
  createEventFeatureCollection,
  createSelectedEventFeatureCollection,
  getEventBounds,
} from "../event-map-utils";
import {
  getMapStyleUrl,
  MAX_MAP_ZOOM,
  supportsAtlasMapModes,
  type AtlasMapMode,
} from "../map-config";

const SOURCE_ID = "events-source";
const SELECTED_SOURCE_ID = "events-selected-source";
const CLUSTER_LAYER_ID = "events-clusters";
const CLUSTER_COUNT_LAYER_ID = "events-cluster-count";
const HALO_LAYER_ID = "events-halo";
const POINT_LAYER_ID = "events-points";
const SELECTED_GLOW_LAYER_ID = "events-selected-glow";
const SELECTED_RING_LAYER_ID = "events-selected-ring";

type EventsMapProps = {
  events: Event[];
  selectedEventId: string | null;
  fitScopeToken: symbol;
  focusRequest: {
    id: string;
    token: number;
  } | null;
  isLoading?: boolean;
  onSelectEvent: (id: string) => void;
  onSearchArea?: (eventIds: string[]) => void;
};

type CameraIntent = "scope-fit" | "browse" | null;

export function EventsMap({
  events,
  selectedEventId,
  fitScopeToken,
  focusRequest,
  isLoading = false,
  onSelectEvent,
  onSearchArea,
}: EventsMapProps) {
  const [mapMode, setMapMode] = useState<AtlasMapMode>("hybrid");
  const [isMapMoving, setIsMapMoving] = useState(false);
  const [isAreaSearchPending, setIsAreaSearchPending] = useState(false);
  const [mapOverlayBottomInset, setMapOverlayBottomInset] = useState(170);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const featureCollection = useMemo(
    () => createEventFeatureCollection(events),
    [events],
  );
  const selectedFeatureCollection = useMemo(
    () => createSelectedEventFeatureCollection(events, selectedEventId),
    [events, selectedEventId],
  );
  const eventsRef = useRef(events);
  const featureCollectionRef = useRef(featureCollection);
  const selectedFeatureCollectionRef = useRef(selectedFeatureCollection);
  const selectedEventIdRef = useRef(selectedEventId);
  const focusRequestRef = useRef(focusRequest);
  const fitScopeTokenRef = useRef(fitScopeToken);
  const handledFitScopeTokenRef = useRef<symbol | null>(null);
  const lastFocusedRequestTokenRef = useRef<number | null>(null);
  const cameraIntentRef = useRef<CameraIntent>(null);

  useEffect(() => {
    const mapContainer = containerRef.current;

    if (!mapContainer || typeof ResizeObserver === "undefined") {
      return;
    }

    const updateBottomInset = () => {
      const padding = getPopupSafeAreaPadding(mapContainer);
      const nextBottomInset = typeof padding === "number" ? padding : padding.bottom;

      setMapOverlayBottomInset((currentInset) =>
        currentInset === nextBottomInset ? currentInset : nextBottomInset,
      );
    };
    const resizeObserver = new ResizeObserver(updateBottomInset);

    resizeObserver.observe(mapContainer);
    document
      .querySelectorAll<HTMLElement>("[data-map-overlay='timeline']")
      .forEach((element) => resizeObserver.observe(element));
    window.addEventListener("resize", updateBottomInset);
    updateBottomInset();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateBottomInset);
    };
  }, []);

  const selectEvent = useEffectEvent((id: string) => {
    onSelectEvent(id);
  });

  useEffect(() => {
    eventsRef.current = events;
    featureCollectionRef.current = featureCollection;
    selectedFeatureCollectionRef.current = selectedFeatureCollection;
    selectedEventIdRef.current = selectedEventId;
    focusRequestRef.current = focusRequest;
    fitScopeTokenRef.current = fitScopeToken;
  }, [
    events,
    featureCollection,
    selectedFeatureCollection,
    selectedEventId,
    focusRequest,
    fitScopeToken,
  ]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: getMapStyleUrl(),
      center: [12, 18],
      zoom: 1.05,
      minZoom: 0.6,
      maxZoom: MAX_MAP_ZOOM,
      attributionControl: false,
      renderWorldCopies: false,
    });
    let popupDismissTimeout: number | null = null;

    const clearPopupDismiss = () => {
      if (popupDismissTimeout !== null) {
        window.clearTimeout(popupDismissTimeout);
        popupDismissTimeout = null;
      }
    };

    const restorePersistentPopup = () => {
      clearPopupDismiss();
      syncPersistentPopup(
        map,
        eventsRef.current,
        selectedEventIdRef.current,
        popupRef.current,
      );
    };

    const schedulePopupRestore = () => {
      clearPopupDismiss();
      popupDismissTimeout = window.setTimeout(restorePersistentPopup, 180);
    };

    mapRef.current = map;
    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: getPopupOffset(14),
      focusAfterOpen: false,
      padding: getPopupSafeAreaPadding(containerRef.current),
      className: "event-map-popup",
    });
    popup.on("open", () => {
      const content = popup.getElement().querySelector<HTMLElement>(".maplibregl-popup-content");

      content?.addEventListener("mouseenter", clearPopupDismiss);
      content?.addEventListener("mouseleave", schedulePopupRestore);
    });
    popupRef.current = popup;

    map.addControl(
      new maplibregl.NavigationControl({
        showCompass: false,
      }),
      "bottom-left",
    );
    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      "top-right",
    );

    map.on("load", () => {
      map.setProjection({ type: "mercator" });
      applyMapMode(map, "hybrid");

      map.addSource(SOURCE_ID, {
        type: "geojson",
        data: featureCollectionRef.current,
        cluster: true,
        clusterRadius: 40,
      });

      map.addSource(SELECTED_SOURCE_ID, {
        type: "geojson",
        data: selectedFeatureCollectionRef.current,
      });

      map.addLayer({
        id: CLUSTER_LAYER_ID,
        type: "circle",
        source: SOURCE_ID,
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#66d4b1",
          "circle-radius": [
            "step",
            ["get", "point_count"],
            16,
            12,
            19,
            32,
            23,
          ],
          "circle-stroke-width": 1,
          "circle-stroke-color": "#d8e7e0",
        },
      });

      map.addLayer({
        id: CLUSTER_COUNT_LAYER_ID,
        type: "symbol",
        source: SOURCE_ID,
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-size": 12,
          "text-font": ["Open Sans Semibold"],
        },
        paint: {
          "text-color": "#07110f",
        },
      });

      map.addLayer({
        id: HALO_LAYER_ID,
        type: "circle",
        source: SOURCE_ID,
        filter: [
          "all",
          ["!", ["has", "point_count"]],
          ["==", ["get", "status"], "active"],
        ],
        paint: {
          "circle-color": ["get", "markerColor"],
          "circle-radius": 13,
          "circle-opacity": 0.16,
          "circle-blur": 0.45,
        },
      });

      map.addLayer({
        id: POINT_LAYER_ID,
        type: "circle",
        source: SOURCE_ID,
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": ["get", "markerColor"],
          "circle-radius": 5.5,
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "rgba(255,255,255,0.9)",
        },
      });

      map.addLayer({
        id: SELECTED_GLOW_LAYER_ID,
        type: "circle",
        source: SELECTED_SOURCE_ID,
        paint: {
          "circle-color": ["get", "markerColor"],
          "circle-radius": 16,
          "circle-opacity": 0.18,
          "circle-blur": 0.6,
        },
      });

      map.addLayer({
        id: SELECTED_RING_LAYER_ID,
        type: "circle",
        source: SELECTED_SOURCE_ID,
        paint: {
          "circle-radius": 11,
          "circle-stroke-width": 2.4,
          "circle-stroke-color": ["get", "markerColor"],
          "circle-color": "rgba(0,0,0,0)",
        },
      });

      map.on("click", POINT_LAYER_ID, (event) => {
        const feature = event.features?.[0];
        const id = feature?.properties?.id;

        if (typeof id === "string") {
          clearPopupDismiss();
          selectedEventIdRef.current = id;
          selectEvent(id);
        }
      });

      map.on("click", CLUSTER_LAYER_ID, (event) => {
        const center = event.lngLat;

        cameraIntentRef.current = "browse";
        map.easeTo({
          center,
          zoom: Math.min(map.getZoom() + 2, MAX_MAP_ZOOM),
          duration: 650,
        });
      });

      map.on("mouseenter", POINT_LAYER_ID, (event) => {
        clearPopupDismiss();
        map.getCanvas().style.cursor = "pointer";
        const feature = event.features?.[0];
        const coordinates = feature?.geometry?.type === "Point"
          ? (feature.geometry.coordinates as [number, number])
          : null;

        if (!feature || !coordinates || !popupRef.current) {
          return;
        }

        popupRef.current
          .setOffset(getPopupOffset(14))
          .setLngLat(coordinates)
          .setHTML(buildPopupHtml(feature.properties))
          .addTo(map);
      });

      map.on("mouseleave", POINT_LAYER_ID, () => {
        map.getCanvas().style.cursor = "";
        schedulePopupRestore();
      });

      const markUserCameraIntent = (event?: unknown) => {
        const originalEvent = event && typeof event === "object" && "originalEvent" in event
          ? (event as { originalEvent?: unknown }).originalEvent
          : null;

        if (originalEvent) {
          cameraIntentRef.current = "browse";
        }
      };
      const handleMoveStart = () => {
        cameraIntentRef.current ??= "browse";
        setIsMapMoving(true);
      };
      const handleMoveEnd = () => {
        const completedIntent = cameraIntentRef.current;

        cameraIntentRef.current = null;
        setIsMapMoving(false);

        if (completedIntent) {
          setIsAreaSearchPending(completedIntent !== "scope-fit");
        }
      };
      const handleResize = () => {
        if (cameraIntentRef.current !== "scope-fit") {
          setIsAreaSearchPending(true);
        }
      };

      map.on("dragstart", markUserCameraIntent);
      map.on("zoomstart", markUserCameraIntent);
      map.on("rotatestart", markUserCameraIntent);
      map.on("movestart", handleMoveStart);
      map.on("moveend", handleMoveEnd);
      map.on("resize", handleResize);

      const initialFocusRequest = focusRequestRef.current;

      if (initialFocusRequest) {
        cameraIntentRef.current = "browse";
        if (focusMapOnRequest(map, eventsRef.current, initialFocusRequest)) {
          lastFocusedRequestTokenRef.current = initialFocusRequest.token;
        }
        handledFitScopeTokenRef.current = fitScopeTokenRef.current;
      } else {
        cameraIntentRef.current = "scope-fit";

        if (fitMapToEvents(map, eventsRef.current)) {
          handledFitScopeTokenRef.current = fitScopeTokenRef.current;
        }
      }

      if (!map.isMoving()) {
        cameraIntentRef.current = null;
      }

      syncPersistentPopup(
        map,
        eventsRef.current,
        selectedEventIdRef.current,
        popupRef.current,
      );
    });

    return () => {
      clearPopupDismiss();
      popupRef.current?.remove();
      popupRef.current = null;
      map.remove();
      mapRef.current = null;
      cameraIntentRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    applyMapMode(map, mapMode);
  }, [mapMode]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined;

    if (!source) {
      return;
    }

    source.setData({
      ...featureCollection,
    });
  }, [featureCollection]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    const source = map.getSource(SELECTED_SOURCE_ID) as maplibregl.GeoJSONSource | undefined;

    if (!source) {
      return;
    }

    source.setData({
      ...selectedFeatureCollection,
    });
  }, [selectedFeatureCollection]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    syncPersistentPopup(
      map,
      events,
      selectedEventId,
      popupRef.current,
    );
  }, [events, selectedEventId]);

  useEffect(() => {
    const map = mapRef.current;

    if (
      !map
      || !focusRequest
      || lastFocusedRequestTokenRef.current === focusRequest.token
    ) {
      return;
    }

    cameraIntentRef.current = "browse";

    if (focusMapOnRequest(map, events, focusRequest)) {
      lastFocusedRequestTokenRef.current = focusRequest.token;
    } else if (!map.isMoving()) {
      cameraIntentRef.current = null;
    }
  }, [events, focusRequest]);

  useEffect(() => {
    const map = mapRef.current;

    if (
      !map
      || !map.getSource(SOURCE_ID)
      || handledFitScopeTokenRef.current === fitScopeToken
    ) {
      return;
    }

    map.stop();
    cameraIntentRef.current = "scope-fit";
    setIsAreaSearchPending(false);

    if (events.length === 0) {
      cameraIntentRef.current = null;
      return;
    }

    if (fitMapToEvents(map, events)) {
      handledFitScopeTokenRef.current = fitScopeToken;
    }

    if (!map.isMoving()) {
      cameraIntentRef.current = null;
    }
  }, [events, fitScopeToken]);

  const searchCurrentArea = () => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    onSearchArea?.(getVisibleEventIds(map, eventsRef.current));
    setIsAreaSearchPending(false);
  };

  return (
    <div
      className="event-map-shell relative h-full w-full overflow-hidden bg-background"
      style={{
        "--map-overlay-bottom": `${mapOverlayBottomInset}px`,
      } as CSSProperties}
    >
      <div
        ref={containerRef}
        aria-label="Event map"
        data-testid="events-map"
        className="h-full w-full"
      />
      {supportsAtlasMapModes() ? (
        <div
          aria-label="Map appearance"
          className="absolute left-[var(--map-overlay-gutter)] top-4 z-20 flex overflow-hidden rounded-lg border border-border bg-[var(--panel-strong)] p-1 shadow-md"
          role="group"
        >
          {([
            { mode: "hybrid", Icon: Satellite },
            { mode: "atlas", Icon: MapIcon },
          ] as const).map(({ mode, Icon }) => (
            <button
              key={mode}
              type="button"
              aria-pressed={mapMode === mode}
              onClick={() => setMapMode(mode)}
              className="flex min-h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold capitalize text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-pressed:bg-[var(--brand)] aria-pressed:text-primary-foreground"
            >
              <Icon aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={1.8} />
              {mode}
            </button>
          ))}
        </div>
      ) : null}
      {isAreaSearchPending && !isMapMoving && !isLoading ? (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-[calc(max(0.75rem,env(safe-area-inset-bottom))_+_4.75rem)] z-30 flex justify-center px-4 lg:bottom-[var(--map-overlay-bottom)]"
        >
          <Button
            type="button"
            className="pointer-events-auto h-12 rounded-lg border-[var(--brand-strong)] px-6 text-base shadow-[0_4px_8px_rgba(0,0,0,0.42)]"
            onClick={searchCurrentArea}
          >
            <Search aria-hidden="true" className="size-5" strokeWidth={2.25} />
            Search in this area
          </Button>
        </div>
      ) : null}
      <p className="sr-only" aria-live="polite">
        {isAreaSearchPending && !isMapMoving && !isLoading
          ? "Map moved. Search in this area to update event results."
          : ""}
      </p>
      {isLoading ? (
        <div className="pointer-events-none absolute inset-0 bg-black/20">
          <div className="absolute left-4 top-16 rounded-md border border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground">
            Updating events
          </div>
        </div>
      ) : null}
    </div>
  );
}

function applyMapMode(map: maplibregl.Map, mode: AtlasMapMode) {
  if (map.getLayer("atlas-imagery")) {
    map.setLayoutProperty(
      "atlas-imagery",
      "visibility",
      mode === "hybrid" ? "visible" : "none",
    );
  }

  if (map.getLayer("atlas-land")) {
    map.setPaintProperty(
      "atlas-land",
      "fill-opacity",
      mode === "hybrid" ? 0.08 : 0.96,
    );
  }

  if (map.getLayer("atlas-coast")) {
    map.setPaintProperty(
      "atlas-coast",
      "line-color",
      mode === "hybrid" ? "#9ab9ae" : "#49665d",
    );
  }

  if (map.getLayer("atlas-country-labels")) {
    map.setPaintProperty(
      "atlas-country-labels",
      "text-color",
      mode === "hybrid" ? "#eaf4ef" : "#9aaea5",
    );
  }
}

function focusMapOnRequest(
  map: maplibregl.Map,
  events: Event[],
  focusRequest: EventsMapProps["focusRequest"],
) {
  if (!focusRequest) {
    return false;
  }

  const targetEvent = events.find((event) => event.id === focusRequest.id);

  if (!targetEvent?.primaryCoordinate) {
    return false;
  }

  map.stop();
  map.flyTo({
    center: targetEvent.primaryCoordinate,
    zoom: Math.max(map.getZoom(), 4.4),
    essential: true,
    duration: 900,
  });

  return true;
}

function fitMapToEvents(
  map: maplibregl.Map,
  events: Event[],
) {
  if (events.length === 0) {
    return false;
  }

  const bounds = getEventBounds(events);

  if (!bounds) {
    return false;
  }

  map.fitBounds(bounds, {
    padding: getViewportPadding(),
    duration: 700,
    maxZoom: 3.8,
  });

  return true;
}

function getVisibleEventIds(map: maplibregl.Map, events: Event[]) {
  const container = map.getContainer();
  const width = container.clientWidth;
  const height = container.clientHeight;

  return events.flatMap((event) => {
    if (!event.primaryCoordinate) {
      return [];
    }

    const point = map.project(event.primaryCoordinate);
    const isVisible =
      point.x >= 0
      && point.x <= width
      && point.y >= 0
      && point.y <= height;

    return isVisible ? [event.id] : [];
  });
}

function syncPersistentPopup(
  map: maplibregl.Map,
  events: Event[],
  selectedEventId: string | null,
  popup: maplibregl.Popup | null,
) {
  if (!popup || !selectedEventId) {
    popup?.remove();
    return;
  }

  const selectedEvent = events.find((event) => event.id === selectedEventId);

  if (!selectedEvent?.primaryCoordinate) {
    popup.remove();
    return;
  }

  popup.options.padding = getPopupSafeAreaPadding(map.getContainer());

  popup
    .setOffset(getPopupOffset(18))
    .setLngLat(selectedEvent.primaryCoordinate)
    .setHTML(buildPopupHtml({
      id: selectedEvent.id,
      title: selectedEvent.title,
      categoryLabel: selectedEvent.categoryLabel,
      status: selectedEvent.status,
      latestDate: selectedEvent.latestDate,
      sourceLabel: selectedEvent.sourceLabel,
    }))
    .addTo(map);
}

function getPopupOffset(
  distance: number,
): NonNullable<maplibregl.PopupOptions["offset"]> {
  return {
    center: [0, 0],
    top: [0, distance],
    "top-left": [0, distance],
    "top-right": [0, distance],
    bottom: [0, -distance],
    "bottom-left": [0, -distance],
    "bottom-right": [0, -distance],
    left: [distance, 0],
    right: [-distance, 0],
  };
}

function buildPopupHtml(properties: Record<string, unknown> | null | undefined) {
  const id = typeof properties?.id === "string" ? properties.id : null;
  const title = typeof properties?.title === "string" ? properties.title : "Event";
  const category = typeof properties?.categoryLabel === "string"
    ? properties.categoryLabel
    : "Uncategorized";
  const status = typeof properties?.status === "string"
    ? getEventStatusLabel(properties.status as Event["status"])
    : "Unknown";
  const latestDate = typeof properties?.latestDate === "string"
    ? formatEventDateTime(properties.latestDate)
    : "Unavailable";
  const sourceLabel = typeof properties?.sourceLabel === "string"
    ? properties.sourceLabel
    : "EONET";
  const detailsHref = id ? `/events/${encodeURIComponent(id)}` : null;

  return `
    <div class="space-y-2">
      <div class="text-xs font-semibold text-[#9be9ce]">${escapeHtml(category)}</div>
      <div class="text-sm font-semibold text-white">${escapeHtml(title)}</div>
      <div class="text-xs text-[#d8e7e0]">${escapeHtml(latestDate)}</div>
      <div class="text-xs text-[#9aaea5]">${escapeHtml(status)} · ${escapeHtml(sourceLabel)}</div>
      ${detailsHref ? `<a class="event-map-popup__link" href="${escapeHtml(detailsHref)}">View event details <span aria-hidden="true">→</span></a>` : ""}
    </div>
  `;
}

function getViewportPadding() {
  if (typeof window === "undefined") {
    return 48;
  }

  return window.innerWidth >= 1024
    ? { top: 72, right: 76, bottom: 170, left: 76 }
    : { top: 72, right: 28, bottom: 150, left: 28 };
}

function getPopupSafeAreaPadding(mapContainer: HTMLElement) {
  const rawFallback = getViewportPadding();
  const fallback = typeof rawFallback === "number"
    ? {
        top: rawFallback,
        right: rawFallback,
        bottom: rawFallback,
        left: rawFallback,
      }
    : rawFallback;

  if (typeof document === "undefined") {
    return fallback;
  }

  const mapRect = mapContainer.getBoundingClientRect();
  const timelineTop = [...document.querySelectorAll<HTMLElement>("[data-map-overlay='timeline']")]
    .map((element) => element.getBoundingClientRect())
    .filter(
      (rect) =>
        rect.width > 0
        && rect.height > 0
        && rect.right > mapRect.left
        && rect.left < mapRect.right
        && rect.bottom > mapRect.top
        && rect.top < mapRect.bottom,
    )
    .reduce<number | null>(
      (top, rect) => (top === null ? rect.top : Math.min(top, rect.top)),
      null,
    );

  if (timelineTop === null) {
    return fallback;
  }

  return {
    ...fallback,
    bottom: Math.max(
      fallback.bottom,
      Math.ceil(mapRect.bottom - timelineTop + 16),
    ),
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
