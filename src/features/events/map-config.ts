import type { StyleSpecification } from "maplibre-gl";

export const DEFAULT_MAP_STYLE_URL = "https://demotiles.maplibre.org/style.json";
export const WORLD_IMAGERY_TILE_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
export const MAX_MAP_ZOOM = 16;

export type AtlasMapMode = "hybrid" | "atlas";

export const ATLAS_MAP_STYLE: StyleSpecification = {
  version: 8,
  name: "Earth Event Atlas",
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  sources: {
    maplibre: {
      type: "vector",
      url: "https://demotiles.maplibre.org/tiles/tiles.json",
      attribution:
        "© OpenStreetMap contributors · MapLibre demo tiles",
    },
    "world-imagery": {
      type: "raster",
      tiles: [WORLD_IMAGERY_TILE_URL],
      tileSize: 256,
      minzoom: 0,
      maxzoom: 23,
      attribution:
        "Source: Esri, Vantor, Earthstar Geographics, and the GIS User Community",
    },
  },
  layers: [
    {
      id: "atlas-background",
      type: "background",
      paint: { "background-color": "#07110f" },
    },
    {
      id: "atlas-imagery",
      type: "raster",
      source: "world-imagery",
      paint: {
        "raster-brightness-max": 0.78,
        "raster-contrast": 0.12,
        "raster-saturation": -0.12,
        "raster-fade-duration": 180,
      },
    },
    {
      id: "atlas-land",
      type: "fill",
      source: "maplibre",
      "source-layer": "countries",
      paint: {
        "fill-color": "#132824",
        "fill-opacity": 0.08,
      },
    },
    {
      id: "atlas-coast",
      type: "line",
      source: "maplibre",
      "source-layer": "countries",
      paint: {
        "line-color": "#9ab9ae",
        "line-width": ["interpolate", ["linear"], ["zoom"], 0, 0.55, 6, 1.2],
        "line-opacity": 0.7,
      },
    },
    {
      id: "atlas-geolines",
      type: "line",
      source: "maplibre",
      "source-layer": "geolines",
      paint: {
        "line-color": "#36564d",
        "line-width": 0.6,
        "line-opacity": 0.45,
        "line-dasharray": [3, 3],
      },
    },
    {
      id: "atlas-country-labels",
      type: "symbol",
      source: "maplibre",
      "source-layer": "centroids",
      minzoom: 1.4,
      layout: {
        "text-field": ["coalesce", ["get", "NAME"], ["get", "ABBREV"]],
        "text-font": ["Open Sans Semibold"],
        "text-size": ["interpolate", ["linear"], ["zoom"], 1.4, 9, 6, 13],
        "text-max-width": 8,
      },
      paint: {
        "text-color": "#eaf4ef",
        "text-halo-color": "#07110f",
        "text-halo-width": 1.6,
      },
    },
  ],
};

export function getMapStyleUrl() {
  return process.env.NEXT_PUBLIC_MAP_STYLE_URL || ATLAS_MAP_STYLE;
}

export function supportsAtlasMapModes() {
  return !process.env.NEXT_PUBLIC_MAP_STYLE_URL;
}
