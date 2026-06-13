import { z } from "zod";

const optionalText = z.string().nullable().optional();

const launchImageObjectSchema = z.object({
  image_url: optionalText,
  thumbnail_url: optionalText,
});

export const launchImageSchema = z.preprocess(
  (value) => {
    if (typeof value === "string") {
      const imageUrl = value.trim();

      return imageUrl ? { image_url: imageUrl, thumbnail_url: null } : null;
    }

    return value;
  },
  launchImageObjectSchema.nullable(),
);

export const launchLinkSchema = z.union([
  z.string(),
  z.object({
    url: z.string(),
  }),
]);

export const launchStatusSchema = z.object({
  id: z.number(),
  name: z.string(),
  abbrev: z.string(),
  description: z.string().optional(),
});

const countrySchema = z.object({
  name: z.string(),
});

const agencySchema = z.object({
  name: z.string(),
  country: z.array(countrySchema).optional(),
});

export const launcherConfigurationSchema = z.object({
  id: z.number(),
  name: z.string(),
  full_name: optionalText,
  variant: optionalText,
  description: optionalText,
  maiden_flight: optionalText,
  successful_launches: z.number().nullable().optional(),
  total_launch_count: z.number().nullable().optional(),
  manufacturer: agencySchema.nullable().optional(),
  image: launchImageSchema.optional(),
});

export const launchPadSchema = z.object({
  id: z.number(),
  name: z.string(),
  active: z.boolean().optional(),
  description: optionalText,
  map_image: optionalText,
  total_launch_count: z.number().nullable().optional(),
  orbital_launch_attempt_count: z.number().nullable().optional(),
  image: launchImageSchema.optional(),
  location: z
    .object({
      name: z.string(),
      description: optionalText,
      timezone_name: optionalText,
      country: countrySchema.nullable().optional(),
    })
    .nullable(),
  country: countrySchema.nullable().optional(),
});

const missionPatchSchema = z.object({
  image_url: optionalText,
});

export const launchSchema = z.object({
  id: z.string(),
  name: z.string(),
  net: z.string(),
  status: launchStatusSchema,
  image: launchImageSchema,
  infographic: launchImageSchema.optional(),
  failreason: optionalText,
  agency_launch_attempt_count: z.number().nullable().optional(),
  orbital_launch_attempt_count: z.number().nullable().optional(),
  mission: z
    .object({
      name: z.string().optional(),
      description: optionalText,
      image: launchImageSchema.optional(),
      info_urls: z.array(launchLinkSchema).optional(),
      vid_urls: z.array(launchLinkSchema).optional(),
    })
    .nullable(),
  rocket: z.object({
    id: z.number(),
    configuration: launcherConfigurationSchema,
  }),
  pad: launchPadSchema.nullable(),
  info_urls: z.array(launchLinkSchema).optional(),
  vid_urls: z.array(launchLinkSchema).optional(),
  mission_patches: z.array(missionPatchSchema).optional(),
  program: z
    .array(
      z.object({
        mission_patches: z.array(missionPatchSchema).optional(),
      }),
    )
    .optional(),
});

export const launchesPageSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(launchSchema),
});

export const launchTrendPageSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(
    z.object({
      net: z.string(),
      status: launchStatusSchema,
    }),
  ),
});

export const favoriteLaunchSchema = z.object({
  id: z.string(),
  name: z.string(),
  net: z.string(),
  status: launchStatusSchema,
  imageUrl: z.string().url().nullable(),
});

export type Launch = z.infer<typeof launchSchema>;
export type LaunchesPage = z.infer<typeof launchesPageSchema>;
export type LaunchTrendPage = z.infer<typeof launchTrendPageSchema>;
export type LaunchStatus = z.infer<typeof launchStatusSchema>;
export type FavoriteLaunch = z.infer<typeof favoriteLaunchSchema>;
export type LaunchLink = z.infer<typeof launchLinkSchema>;
