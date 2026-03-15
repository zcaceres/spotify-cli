/**
 * Zod schemas for Spotify artist objects.
 *
 * @module
 */

import { z } from "zod";
import { ExternalUrlsSchema, FollowersSchema, ImageSchema } from "./common.js";

/** Schema for a simplified artist (used in track/album listings). */
export const SimplifiedArtistSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.literal("artist"),
  uri: z.string(),
  href: z.string(),
  external_urls: ExternalUrlsSchema,
});

/** Schema for a full artist object (includes images, genres, popularity). */
export const ArtistSchema = SimplifiedArtistSchema.extend({
  followers: FollowersSchema.optional(),
  genres: z.array(z.string()).optional(),
  images: z.array(ImageSchema),
  popularity: z.number().optional(),
});

/** A simplified Spotify artist (no images/genres/followers). */
export type SimplifiedArtist = z.infer<typeof SimplifiedArtistSchema>;

/** A full Spotify artist with images, genres, and popularity. */
export type Artist = z.infer<typeof ArtistSchema>;
