"use client";

import { useEffect, useEffectEvent, useMemo, useRef } from "react";
import maplibregl, { type FilterSpecification } from "maplibre-gl";
import type { Event } from "@/lib/api/event-schemas";
import { formatEventDateTime, getEventStatusLabel } from "@/lib/formatters";
import {
  createEventFeatureCollection,
  getEventBounds,
} from "../event-map-utils";
import { getMapStyleUrl } from "../map-config";

const SOURCE_ID = "events-source";
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
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const featureCollection = useMemo(
    () => createEventFeatureCollection(events),
    [events],
  );

  const selectEvent = useEffectEvent((id: string) => {
    onSelectEvent(id);
  });

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: getMapStyleUrl(),
      center: [12, 18],
      zoom: 1.35,
      minZoom: 1,
      maxZoom: 12,
      attributionControl: false,
    });

    mapRef.current = map;
    popupRef.current = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 14,
      className: "event-map-popup",
    });

    map.addControl(
      new maplibregl.NavigationControl({
        showCompass: false,
      }),
      "bottom-left",
    );

    map.on("load", () => {
      map.addSource(SOURCE_ID, {
        type: "geojson",
        data: featureCollection,
        cluster: true,
        clusterRadius: 40,
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
        source: SOURCE_ID,
        filter: ["==", ["get", "id"], ""],
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
        source: SOURCE_ID,
        filter: ["==", ["get", "id"], ""],
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

        if (!feature || !coordinates || !popupRef.current) {
          return;
        }

        popupRef.current
          .setLngLat(coordinates)
          .setHTML(buildPopupHtml(feature.properties))
          .addTo(map);
      });

      map.on("mouseleave", POINT_LAYER_ID, () => {
        map.getCanvas().style.cursor = "";
        popupRef.current?.remove();
      });
    });

    return () => {
      popupRef.current?.remove();
      popupRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, [featureCollection]);

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

    const filter = (selectedEventId
      ? ["==", ["get", "id"], selectedEventId]
      : ["==", ["get", "id"], ""]) as FilterSpecification;

    if (map.getLayer(SELECTED_GLOW_LAYER_ID)) {
      map.setFilter(SELECTED_GLOW_LAYER_ID, filter);
    }
    if (map.getLayer(SELECTED_RING_LAYER_ID)) {
      map.setFilter(SELECTED_RING_LAYER_ID, filter);
    }
  }, [selectedEventId]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !map.isStyleLoaded() || !focusRequest) {
      return;
    }

    const targetEvent = events.find((event) => event.id === focusRequest.id);

    if (!targetEvent?.primaryCoordinate) {
      return;
    }

    map.flyTo({
      center: targetEvent.primaryCoordinate,
      zoom: Math.max(map.getZoom(), 4.4),
      essential: true,
      duration: 900,
    });
  }, [events, focusRequest]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !map.isStyleLoaded() || selectedEventId || events.length === 0) {
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
  }, [events, selectedEventId]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[1.15rem]">
      <div
        ref={containerRef}
        aria-label="Event map"
        data-testid="events-map"
        className="h-full w-full"
      />
      {isLoading ? (
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,9,19,0.1),rgba(5,9,19,0.42))]">
          <div className="absolute left-4 top-4 rounded-full border border-[rgba(147,197,253,0.16)] bg-[rgba(7,11,20,0.72)] px-3 py-2 type-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--muted)]">
            Loading event mirror
          </div>
        </div>
      ) : null}
    </div>
  );
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
      <div class="type-mono text-[10px] uppercase tracking-[0.16em] text-[rgba(197,208,232,0.68)]">${category}</div>
      <div class="text-sm font-semibold text-white">${title}</div>
      <div class="text-xs text-[rgba(226,232,247,0.76)]">${latestDate}</div>
      <div class="text-xs text-[rgba(197,208,232,0.62)]">${status} · ${sourceLabel}</div>
    </div>
  `;
}

function getViewportPadding() {
  if (typeof window === "undefined") {
    return 48;
  }

  return window.innerWidth >= 1024
    ? { top: 120, right: 460, bottom: 80, left: 80 }
    : { top: 120, right: 32, bottom: 360, left: 32 };
}
