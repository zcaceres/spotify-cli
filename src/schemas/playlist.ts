import { z } from "zod";
import { ImageSchema, ExternalUrlsSchema, FollowersSchema } from "./common.js";
import { TrackSchema } from "./track.js";

const PlaylistOwnerSchema = z.object({
  id: z.string(),
  display_name: z.string().nullable(),
  type: z.literal("user"),
  uri: z.string(),
  href: z.string(),
  external_urls: ExternalUrlsSchema,
});

export const PlaylistTrackSchema = z.object({
  added_at: z.string().nullable(),
  added_by: PlaylistOwnerSchema.nullable().optional(),
  is_local: z.boolean(),
  track: TrackSchema.nullable(),
});

export const SimplifiedPlaylistSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.literal("playlist"),
  uri: z.string(),
  href: z.string(),
  description: z.string().nullable(),
  images: z.array(ImageSchema),
  owner: PlaylistOwnerSchema,
  public: z.boolean().nullable(),
  collaborative: z.boolean(),
  snapshot_id: z.string(),
  external_urls: ExternalUrlsSchema,
  tracks: z.object({
    href: z.string(),
    total: z.number(),
  }),
});

export const PlaylistSchema = SimplifiedPlaylistSchema.extend({
  followers: FollowersSchema,
  tracks: z.object({
    href: z.string(),
    items: z.array(PlaylistTrackSchema),
    limit: z.number(),
    next: z.string().nullable(),
    offset: z.number(),
    previous: z.string().nullable(),
    total: z.number(),
  }),
});

export type Playlist = z.infer<typeof PlaylistSchema>;
export type SimplifiedPlaylist = z.infer<typeof SimplifiedPlaylistSchema>;
export type PlaylistTrack = z.infer<typeof PlaylistTrackSchema>;
