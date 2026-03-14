/**
 * Zod schemas for Spotify player/playback objects.
 *
 * @module
 */

import { z } from "zod";
import { TrackSchema } from "./track.js";

/** Schema for a playback device. */
export const DeviceSchema = z.object({
  id: z.string().nullable(),
  is_active: z.boolean(),
  is_private_session: z.boolean(),
  is_restricted: z.boolean(),
  name: z.string(),
  type: z.string(),
  volume_percent: z.number().nullable(),
  supports_volume: z.boolean(),
});

/** Schema for the playback context (album, playlist, or artist being played). */
export const PlaybackContextSchema = z.object({
  type: z.string(),
  href: z.string(),
  external_urls: z.object({ spotify: z.string().optional() }),
  uri: z.string(),
});

/** Schema for full playback state from `GET /me/player`. */
export const PlaybackStateSchema = z.object({
  device: DeviceSchema,
  repeat_state: z.string(),
  shuffle_state: z.boolean(),
  timestamp: z.number(),
  progress_ms: z.number().nullable(),
  is_playing: z.boolean(),
  item: TrackSchema.nullable(),
  currently_playing_type: z.string(),
  context: PlaybackContextSchema.nullable().optional(),
});

/** Schema for currently playing response from `GET /me/player/currently-playing` (subset of playback state). */
export const CurrentlyPlayingSchema = z.object({
  timestamp: z.number().optional(),
  progress_ms: z.number().nullable().optional(),
  is_playing: z.boolean(),
  item: TrackSchema.nullable().optional(),
  currently_playing_type: z.string(),
  context: PlaybackContextSchema.nullable().optional(),
});

/** Schema for the playback queue. */
export const QueueSchema = z.object({
  currently_playing: TrackSchema.nullable(),
  queue: z.array(TrackSchema),
});

/** Schema for the devices list response. */
export const DevicesSchema = z.object({
  devices: z.array(DeviceSchema),
});

/** Schema for a play history entry (recently played track). */
export const PlayHistorySchema = z.object({
  track: TrackSchema,
  played_at: z.string(),
  context: z
    .object({
      type: z.string(),
      href: z.string(),
      external_urls: z.object({ spotify: z.string().optional() }),
      uri: z.string(),
    })
    .nullable(),
});

/** A Spotify playback device. */
export type Device = z.infer<typeof DeviceSchema>;

/** Full playback state including device, track, and settings. */
export type PlaybackState = z.infer<typeof PlaybackStateSchema>;

/** The user's playback queue. */
export type Queue = z.infer<typeof QueueSchema>;

/** A play history entry (track + timestamp + context). */
export type PlayHistory = z.infer<typeof PlayHistorySchema>;
