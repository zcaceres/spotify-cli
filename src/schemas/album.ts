import { z } from "zod";
import { ImageSchema, ExternalUrlsSchema, ExternalIdsSchema, PagingSchema } from "./common.js";
import { SimplifiedArtistSchema } from "./artist.js";
import { SimplifiedTrackSchema } from "./track.js";

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

export const AlbumSchema = SimplifiedAlbumSchema.extend({
  tracks: PagingSchema(SimplifiedTrackSchema),
  genres: z.array(z.string()),
  label: z.string().optional(),
  popularity: z.number(),
  copyrights: z.array(z.object({ text: z.string(), type: z.string() })).optional(),
  external_ids: ExternalIdsSchema.optional(),
});

export const SavedAlbumSchema = z.object({
  added_at: z.string(),
  album: AlbumSchema,
});

export type SimplifiedAlbum = z.infer<typeof SimplifiedAlbumSchema>;
export type Album = z.infer<typeof AlbumSchema>;
export type SavedAlbum = z.infer<typeof SavedAlbumSchema>;
