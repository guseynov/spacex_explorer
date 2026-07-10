"use client";

import { useEffect, useEffectEvent, useMemo, useRef } from "react";
import maplibregl from "maplibre-gl";
import type { Event } from "@/lib/api/event-schemas";
import { formatEventDateTime, getEventStatusLabel } from "@/lib/formatters";
import {
  createEventFeatureCollection,
  createSelectedEventFeatureCollection,
  getEventBounds,
} from "../event-map-utils";
import { getMapStyleUrl } from "../map-config";

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
  focusRequest: {
    id: string;
    token: number;
  } | null;
  isLoading?: boolean;
  onSelectEvent: (id: string) => void;
};

export function EventsMap({
  events,
  selectedEventId,
  focusRequest,
  isLoading = false,
  onSelectEvent,
}: EventsMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const hoverPopupRef = useRef<maplibregl.Popup | null>(null);
  const selectedPopupRef = useRef<maplibregl.Popup | null>(null);
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

  const selectEvent = useEffectEvent((id: string) => {
    onSelectEvent(id);
  });

  useEffect(() => {
    eventsRef.current = events;
    featureCollectionRef.current = featureCollection;
    selectedFeatureCollectionRef.current = selectedFeatureCollection;
    selectedEventIdRef.current = selectedEventId;
    focusRequestRef.current = focusRequest;
  }, [events, featureCollection, selectedFeatureCollection, selectedEventId, focusRequest]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: getMapStyleUrl(),
      center: [12, 18],
      zoom: 0.85,
      minZoom: 0.4,
      maxZoom: 12,
      attributionControl: false,
      renderWorldCopies: false,
    });

    mapRef.current = map;
    hoverPopupRef.current = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 14,
      className: "event-map-popup",
    });
    selectedPopupRef.current = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 18,
      className: "event-map-popup event-map-popup-selected",
    });

    map.addControl(
      new maplibregl.NavigationControl({
        showCompass: false,
      }),
      "bottom-left",
    );

    map.on("load", () => {
      map.setProjection({ type: "globe" });

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
          "circle-color": "rgba(68, 144, 245, 0.78)",
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
          "circle-stroke-color": "rgba(197,208,232,0.65)",
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
          "text-color": "#f8fbff",
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
          selectEvent(id);
        }
      });

      map.on("click", CLUSTER_LAYER_ID, (event) => {
        const center = event.lngLat;

        map.easeTo({
          center,
          zoom: Math.min(map.getZoom() + 2, 7),
          duration: 650,
        });
      });

      map.on("mouseenter", POINT_LAYER_ID, (event) => {
        map.getCanvas().style.cursor = "pointer";
        const feature = event.features?.[0];
        const coordinates = feature?.geometry?.type === "Point"
          ? (feature.geometry.coordinates as [number, number])
          : null;

        if (!feature || !coordinates || !hoverPopupRef.current) {
          return;
        }

        hoverPopupRef.current
          .setLngLat(coordinates)
          .setHTML(buildPopupHtml(feature.properties))
          .addTo(map);
      });

      map.on("mouseleave", POINT_LAYER_ID, () => {
        map.getCanvas().style.cursor = "";
        hoverPopupRef.current?.remove();
      });

      if (!focusMapOnRequest(map, eventsRef.current, focusRequestRef.current)) {
        fitMapToEvents(map, eventsRef.current, selectedEventIdRef.current);
      }

      syncSelectedPopup(map, eventsRef.current, selectedEventIdRef.current, selectedPopupRef.current);
    });

    return () => {
      hoverPopupRef.current?.remove();
      hoverPopupRef.current = null;
      selectedPopupRef.current?.remove();
      selectedPopupRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !map.isStyleLoaded()) {
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

    if (!map || !map.isStyleLoaded()) {
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

    syncSelectedPopup(map, events, selectedEventId, selectedPopupRef.current);
  }, [events, selectedEventId]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !focusRequest) {
      return;
    }

    focusMapOnRequest(map, events, focusRequest);
  }, [events, focusRequest]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || selectedEventId || events.length === 0) {
      return;
    }

    fitMapToEvents(map, events, selectedEventId);
  }, [events, selectedEventId]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl">
      <div
        ref={containerRef}
        aria-label="Event map"
        data-testid="events-map"
        className="h-full w-full"
      />
      {isLoading ? (
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,9,19,0.1),rgba(5,9,19,0.42))]">
          <div className="absolute left-4 top-4 rounded-full border border-border bg-background/72 px-3 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Loading event mirror
          </div>
        </div>
      ) : null}
    </div>
  );
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
  selectedEventId: string | null,
) {
  if (selectedEventId || events.length === 0) {
    return;
  }

  const bounds = getEventBounds(events);

  if (!bounds) {
    return;
  }

  map.fitBounds(bounds, {
    padding: getViewportPadding(),
    duration: 700,
    maxZoom: 3.8,
  });
}

function syncSelectedPopup(
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

  popup
    .setLngLat(selectedEvent.primaryCoordinate)
    .setHTML(buildSelectedPopupHtml(selectedEvent))
    .addTo(map);
}

function buildPopupHtml(properties: Record<string, unknown> | null | undefined) {
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

  return `
    <div class="space-y-2">
      <div class="text-[10px] font-semibold uppercase tracking-[0.16em] text-[rgba(197,208,232,0.68)]">${category}</div>
      <div class="text-sm font-semibold text-white">${title}</div>
      <div class="text-xs text-[rgba(226,232,247,0.76)]">${latestDate}</div>
      <div class="text-xs text-[rgba(197,208,232,0.62)]">${status} · ${sourceLabel}</div>
    </div>
  `;
}

function buildSelectedPopupHtml(event: Event) {
  return `
    <div class="space-y-1.5">
      <div class="text-[10px] font-semibold uppercase tracking-[0.16em] text-[rgba(147,197,253,0.78)]">Focused event</div>
      <div class="text-sm font-semibold text-white">${event.title}</div>
    </div>
  `;
}

function getViewportPadding() {
  if (typeof window === "undefined") {
    return 48;
  }

  return window.innerWidth >= 1024
    ? { top: 140, right: 620, bottom: 96, left: 120 }
    : { top: 120, right: 32, bottom: 360, left: 32 };
}
