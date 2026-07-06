export const DEFAULT_MAP_STYLE_URL = "https://demotiles.maplibre.org/style.json";

export function getMapStyleUrl() {
  return process.env.NEXT_PUBLIC_MAP_STYLE_URL || DEFAULT_MAP_STYLE_URL;
}
