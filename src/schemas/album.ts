/**
 * Zod schemas for Spotify album objects.
 *
 * @module
 */

import { z } from "zod";
import { SimplifiedArtistSchema } from "./artist.js";
import { ExternalIdsSchema, ExternalUrlsSchema, ImageSchema, PagingSchema } from "./common.js";
import { SimplifiedTrackSchema } from "./track.js";

/** Schema for a simplified album (used in track listings and search results). */
export const SimplifiedAlbumSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.literal("album"),
  album_type: z.string(),
  uri: z.string(),
  href: z.string(),
  artists: z.array(SimplifiedArtistSchema),
  images: z.array(ImageSchema),
  release_date: z.string(),
  release_date_precision: z.string(),
  total_tracks: z.number(),
  external_urls: ExternalUrlsSchema,
});

/** Schema for a full album object (includes track listing, genres, label). */
export const AlbumSchema = SimplifiedAlbumSchema.extend({
  tracks: PagingSchema(SimplifiedTrackSchema),
  genres: z.array(z.string()),
  label: z.string().optional(),
  popularity: z.number().optional(),
  copyrights: z.array(z.object({ text: z.string(), type: z.string() })).optional(),
  external_ids: ExternalIdsSchema.optional(),
});

/** Schema for a saved album (wraps an album with an `added_at` timestamp). */
export const SavedAlbumSchema = z.object({
  added_at: z.string(),
  album: AlbumSchema,
});

/** A simplified Spotify album (no track listing). */
export type SimplifiedAlbum = z.infer<typeof SimplifiedAlbumSchema>;

/** A full Spotify album with track listing and metadata. */
export type Album = z.infer<typeof AlbumSchema>;

/** A saved album from the user's library. */
export type SavedAlbum = z.infer<typeof SavedAlbumSchema>;
