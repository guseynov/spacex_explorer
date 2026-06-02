import { z } from "zod";

const nullableUrl = z.string().url().nullable();

export const launchSchema = z.object({
  id: z.string(),
  name: z.string(),
  date_utc: z.string(),
  date_local: z.string(),
  upcoming: z.boolean(),
  success: z.boolean().nullable(),
  details: z.string().nullable(),
  flight_number: z.number(),
  rocket: z.string(),
  launchpad: z.string(),
  links: z.object({
    patch: z.object({
      small: nullableUrl,
      large: nullableUrl,
    }),
    flickr: z.object({
      original: z.array(z.string().url()),
      small: z.array(z.string().url()),
    }),
    article: nullableUrl,
    wikipedia: nullableUrl,
    webcast: nullableUrl,
    presskit: nullableUrl,
  }),
});

export const favoriteLaunchSchema = z.object({
  id: z.string(),
  name: z.string(),
  date_utc: z.string(),
  success: z.boolean().nullable(),
  upcoming: z.boolean(),
  patch: z.string().url().nullable(),
  rocketId: z.string(),
  launchpadId: z.string(),
});

export const launchesPageSchema = z.object({
  docs: z.array(launchSchema),
  totalDocs: z.number(),
  limit: z.number(),
  totalPages: z.number(),
  page: z.number(),
  hasPrevPage: z.boolean(),
  hasNextPage: z.boolean(),
  prevPage: z.number().nullable(),
  nextPage: z.number().nullable(),
});

export const rocketSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  country: z.string(),
  company: z.string(),
  first_flight: z.string(),
  description: z.string(),
  success_rate_pct: z.number(),
  flickr_images: z.array(z.string().url()),
});

export const launchpadSchema = z.object({
  id: z.string(),
  name: z.string(),
  full_name: z.string(),
  locality: z.string(),
  region: z.string(),
  details: z.string(),
  timezone: z.string(),
  status: z.string(),
  launch_attempts: z.number(),
  launch_successes: z.number(),
  images: z.object({
    large: z.array(z.string().url()),
  }),
});

export type Launch = z.infer<typeof launchSchema>;
export type LaunchesPage = z.infer<typeof launchesPageSchema>;
export type Rocket = z.infer<typeof rocketSchema>;
export type Launchpad = z.infer<typeof launchpadSchema>;
export type FavoriteLaunch = z.infer<typeof favoriteLaunchSchema>;
