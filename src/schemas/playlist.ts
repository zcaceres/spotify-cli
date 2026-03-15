/**
 * Zod schemas for Spotify playlist objects.
 *
 * @module
 */

import { z } from "zod";
import { ExternalUrlsSchema, FollowersSchema, ImageSchema } from "./common.js";
import { TrackSchema } from "./track.js";

/** @internal Schema for the playlist owner (a Spotify user). */
const PlaylistOwnerSchema = z.object({
  id: z.string(),
  display_name: z.string().nullable().optional(),
  type: z.literal("user"),
  uri: z.string(),
  href: z.string(),
  external_urls: ExternalUrlsSchema,
});

/** Schema for a single item in a playlist (track with metadata about when/who added it). */
export const PlaylistItemSchema = z.object({
  added_at: z.string().nullable(),
  added_by: PlaylistOwnerSchema.nullable().optional(),
  is_local: z.boolean(),
  item: TrackSchema.nullable().optional(),
  primary_color: z.string().nullable().optional(),
  video_thumbnail: z.object({ url: z.string().nullable() }).nullable().optional(),
});

/** Schema for a simplified playlist (used in listings and search results). */
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
  items: z
    .object({
      href: z.string(),
      total: z.number(),
    })
    .optional(),
  primary_color: z.string().nullable().optional(),
});

/** Schema for a full playlist object (includes followers and full track listing). */
export const PlaylistSchema = SimplifiedPlaylistSchema.extend({
  followers: FollowersSchema,
  items: z.object({
    href: z.string(),
    items: z.array(PlaylistItemSchema),
    limit: z.number(),
    next: z.string().nullable(),
    offset: z.number(),
    previous: z.string().nullable(),
    total: z.number(),
  }),
});

/** A full Spotify playlist with track listing and followers. */
export type Playlist = z.infer<typeof PlaylistSchema>;

/** A simplified playlist (no full track listing). */
export type SimplifiedPlaylist = z.infer<typeof SimplifiedPlaylistSchema>;

/** A single item in a playlist. */
export type PlaylistItem = z.infer<typeof PlaylistItemSchema>;
