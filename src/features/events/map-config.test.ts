import { describe, expect, it } from "vitest";
import {
  ATLAS_MAP_STYLE,
  MAX_MAP_ZOOM,
  WORLD_IMAGERY_TILE_URL,
} from "./map-config";

describe("map imagery configuration", () => {
  it("provides native imagery tiles through the supported map zoom range", () => {
    const imagerySource = ATLAS_MAP_STYLE.sources["world-imagery"];

    expect(imagerySource.type).toBe("raster");

    if (imagerySource.type !== "raster") {
      return;
    }

    expect(imagerySource.tiles).toContain(WORLD_IMAGERY_TILE_URL);
    expect(imagerySource.maxzoom).toBeGreaterThanOrEqual(MAX_MAP_ZOOM);
  });
});
