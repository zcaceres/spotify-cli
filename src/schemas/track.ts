import { z } from "zod";
import { ExternalUrlsSchema, ExternalIdsSchema, ImageSchema } from "./common.js";
import { SimplifiedArtistSchema } from "./artist.js";

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

export const SavedTrackSchema = z.object({
  added_at: z.string(),
  track: TrackSchema,
});

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

export type Track = z.infer<typeof TrackSchema>;
export type SimplifiedTrack = z.infer<typeof SimplifiedTrackSchema>;
export type SavedTrack = z.infer<typeof SavedTrackSchema>;
export type AudioFeatures = z.infer<typeof AudioFeaturesSchema>;
