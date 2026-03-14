/**
 * Zod schema for Spotify user profile objects.
 *
 * @module
 */

import { z } from "zod";
import { ImageSchema, ExternalUrlsSchema, FollowersSchema } from "./common.js";

/** Schema for the current user's Spotify profile. */
export const UserProfileSchema = z.object({
  id: z.string(),
  display_name: z.string().nullable(),
  type: z.literal("user"),
  uri: z.string(),
  href: z.string(),
  email: z.string().optional(),
  country: z.string().optional(),
  product: z.string().optional(),
  images: z.array(ImageSchema),
  followers: FollowersSchema,
  external_urls: ExternalUrlsSchema,
});

/** The current user's Spotify profile. */
export type UserProfile = z.infer<typeof UserProfileSchema>;
