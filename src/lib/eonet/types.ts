export type EonetCoordinateNode = number | EonetCoordinateNode[];

export type EonetCategoryRaw = {
  id: string;
  title: string;
  description?: string | null;
};

export type EonetSourceRaw = {
  id: string;
  title?: string | null;
  url?: string | null;
};

export type EonetGeometryRaw = {
  date?: string | null;
  type?: string | null;
  coordinates?: EonetCoordinateNode | null;
  magnitudeValue?: number | null;
  magnitudeUnit?: string | null;
  magnitudeDescription?: string | null;
};

export type EonetEventRaw = {
  id: string;
  title: string;
  description?: string | null;
  link?: string | null;
  closed?: string | null;
  categories?: EonetCategoryRaw[];
  sources?: EonetSourceRaw[];
  geometry?: EonetGeometryRaw[];
};

export type NormalizedEventGeometry = {
  observedAt: Date | null;
  geometryType: string | null;
  longitude: number | null;
  latitude: number | null;
  magnitudeValue: number | null;
  magnitudeUnit: string | null;
  magnitudeDescription: string | null;
  coordinateHash: string;
  raw: EonetGeometryRaw;
};

export type NormalizedEventCategory = {
  id: string;
  title: string;
  description: string | null;
  raw: EonetCategoryRaw;
};

export type NormalizedEventSource = {
  id: string;
  title: string | null;
  sourceUrl: string | null;
  raw: EonetSourceRaw;
};

export type NormalizedEonetEvent = {
  id: string;
  title: string;
  description: string | null;
  link: string | null;
  status: "active" | "closed";
  closedAt: Date | null;
  firstObservedAt: Date | null;
  latestObservedAt: Date | null;
  primaryCategoryId: string | null;
  primaryCategoryTitle: string | null;
  primarySourceId: string | null;
  primarySourceTitle: string | null;
  primaryLongitude: number | null;
  primaryLatitude: number | null;
  searchText: string;
  raw: EonetEventRaw;
  upstreamUpdatedAt: Date | null;
  categories: NormalizedEventCategory[];
  sources: NormalizedEventSource[];
  geometries: NormalizedEventGeometry[];
};
