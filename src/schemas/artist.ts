import { z } from "zod";
import { ImageSchema, ExternalUrlsSchema, FollowersSchema } from "./common.js";

export const SimplifiedArtistSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.literal("artist"),
  uri: z.string(),
  href: z.string(),
  external_urls: ExternalUrlsSchema,
});

export const ArtistSchema = SimplifiedArtistSchema.extend({
  followers: FollowersSchema.optional(),
  genres: z.array(z.string()).optional(),
  images: z.array(ImageSchema),
  popularity: z.number().optional(),
});

export type SimplifiedArtist = z.infer<typeof SimplifiedArtistSchema>;
export type Artist = z.infer<typeof ArtistSchema>;
