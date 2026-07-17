import { z } from "zod";

const optionalText = z.string().trim().nullable().optional();

export type CoordinateNode = number | CoordinateNode[];

const coordinateNodeSchema: z.ZodType<CoordinateNode> = z.lazy(() =>
  z.union([z.number(), z.array(coordinateNodeSchema)]),
);

export const coordinatePairSchema = z.tuple([z.number(), z.number()]);

export const eventStatusSchema = z.enum(["active", "closed"]);

export const eventCategorySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: optionalText,
});

export const eventSourceSchema = z.object({
  id: z.string(),
  url: z.string().url().nullable().optional(),
  title: optionalText,
});

export const eventGeometrySchema = z.object({
  date: z.string(),
  type: z.string(),
  coordinates: coordinateNodeSchema.nullable(),
  magnitudeValue: z.number().nullable(),
  magnitudeUnit: optionalText,
  primaryCoordinate: coordinatePairSchema.nullable(),
});

export const eventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: optionalText,
  status: eventStatusSchema,
  closedAt: z.string().nullable(),
  categories: z.array(eventCategorySchema),
  sources: z.array(eventSourceSchema),
  geometries: z.array(eventGeometrySchema),
  latestDate: z.string(),
  latestGeometry: eventGeometrySchema.nullable(),
  primaryCoordinate: coordinatePairSchema.nullable(),
  coordinateLabel: optionalText,
  magnitudeValue: z.number().nullable(),
  magnitudeUnit: optionalText,
  sourceLabel: z.string(),
  categoryLabel: z.string(),
  categoryId: z.string(),
});

export const eventListPageSchema = z.object({
  count: z.number(),
  page: z.number(),
  pageSize: z.number(),
  nextPage: z.number().nullable(),
  previousPage: z.number().nullable(),
  results: z.array(eventSchema),
  summary: z
    .object({
      count: z.number(),
      mirrorCount: z.number(),
      histogram: z.array(z.number()),
      syncedAt: z.string().nullable(),
    })
    .optional(),
});

export const favoriteEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: optionalText,
  status: eventStatusSchema,
  latestDate: z.string(),
  categoryId: z.string(),
  categoryLabel: z.string(),
  sourceLabel: z.string(),
  coordinateLabel: optionalText,
  primaryCoordinate: coordinatePairSchema.nullable(),
  magnitudeValue: z.number().nullable(),
  magnitudeUnit: optionalText,
});

export type EventStatus = z.infer<typeof eventStatusSchema>;
export type EventCategory = z.infer<typeof eventCategorySchema>;
export type EventSource = z.infer<typeof eventSourceSchema>;
export type EventGeometry = z.infer<typeof eventGeometrySchema>;
export type Event = z.infer<typeof eventSchema>;
export type EventListPage = z.infer<typeof eventListPageSchema>;
export type FavoriteEvent = z.infer<typeof favoriteEventSchema>;
export type EventTimelineSummary = NonNullable<EventListPage["summary"]>;
