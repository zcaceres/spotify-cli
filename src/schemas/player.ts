import { z } from "zod";
import { TrackSchema } from "./track.js";

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

export const PlaybackContextSchema = z.object({
  type: z.string(),
  href: z.string(),
  external_urls: z.object({ spotify: z.string().optional() }),
  uri: z.string(),
});

// Full playback state from GET /me/player
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

// Currently playing from GET /me/player/currently-playing (subset — no device/shuffle/repeat)
export const CurrentlyPlayingSchema = z.object({
  timestamp: z.number().optional(),
  progress_ms: z.number().nullable().optional(),
  is_playing: z.boolean(),
  item: TrackSchema.nullable().optional(),
  currently_playing_type: z.string(),
  context: PlaybackContextSchema.nullable().optional(),
});

export const QueueSchema = z.object({
  currently_playing: TrackSchema.nullable(),
  queue: z.array(TrackSchema),
});

export const DevicesSchema = z.object({
  devices: z.array(DeviceSchema),
});

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

export type Device = z.infer<typeof DeviceSchema>;
export type PlaybackState = z.infer<typeof PlaybackStateSchema>;
export type Queue = z.infer<typeof QueueSchema>;
export type PlayHistory = z.infer<typeof PlayHistorySchema>;
