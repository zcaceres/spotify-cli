/**
 * Zod schemas for Spotify track objects.
 *
 * @module
 */

import { z } from "zod";
import { SimplifiedArtistSchema } from "./artist.js";
import { ExternalIdsSchema, ExternalUrlsSchema, ImageSchema } from "./common.js";

/** @internal Minimal album schema used within track objects to avoid circular imports. */
const SimplifiedAlbumInTrackSchema = z.object({
  id: z.string(),
  name: z.string(),
  album_type: z.string(),
  uri: z.string(),
  href: z.string(),
  images: z.array(ImageSchema),
  release_date: z.string(),
  external_urls: ExternalUrlsSchema,
});

/** Schema for a full track object. */
export const TrackSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.literal("track"),
  uri: z.string(),
  href: z.string(),
  artists: z.array(SimplifiedArtistSchema),
  album: SimplifiedAlbumInTrackSchema,
  duration_ms: z.number(),
  explicit: z.boolean(),
  popularity: z.number().optional(),
  track_number: z.number(),
  disc_number: z.number(),
  is_local: z.boolean(),
  external_urls: ExternalUrlsSchema,
  external_ids: ExternalIdsSchema.optional(),
  preview_url: z.string().nullable().optional(),
});

/** Schema for a simplified track (no album info, used in album track listings). */
export const SimplifiedTrackSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.literal("track"),
  uri: z.string(),
  href: z.string(),
  artists: z.array(SimplifiedArtistSchema),
  duration_ms: z.number(),
  explicit: z.boolean(),
  track_number: z.number(),
  disc_number: z.number(),
  is_local: z.boolean(),
  external_urls: ExternalUrlsSchema,
  preview_url: z.string().nullable().optional(),
});

/** Schema for a saved track (wraps a track with an `added_at` timestamp). */
export const SavedTrackSchema = z.object({
  added_at: z.string(),
  track: TrackSchema,
});

/**
 * Schema for audio features analysis data.
 *
 * Contains acoustic attributes like danceability, energy, tempo,
 * key, loudness, and more — values are typically 0.0 to 1.0
 * (except tempo, loudness, key, duration_ms, time_signature).
 */
export const AudioFeaturesSchema = z.object({
  id: z.string(),
  uri: z.string(),
  danceability: z.number(),
  energy: z.number(),
  key: z.number(),
  loudness: z.number(),
  mode: z.number(),
  speechiness: z.number(),
  acousticness: z.number(),
  instrumentalness: z.number(),
  liveness: z.number(),
  valence: z.number(),
  tempo: z.number(),
  duration_ms: z.number(),
  time_signature: z.number(),
});

/** A full Spotify track. */
export type Track = z.infer<typeof TrackSchema>;

/** A simplified track (no album, used in album listings). */
export type SimplifiedTrack = z.infer<typeof SimplifiedTrackSchema>;

/** A saved track from the user's library. */
export type SavedTrack = z.infer<typeof SavedTrackSchema>;

/** Audio features for a track (danceability, energy, tempo, etc.). */
export type AudioFeatures = z.infer<typeof AudioFeaturesSchema>;
