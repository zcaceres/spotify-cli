/**
 * Zod schema for Spotify search responses.
 *
 * @module
 */

import { z } from "zod";
import { SimplifiedAlbumSchema } from "./album.js";
import { ArtistSchema } from "./artist.js";
import { PagingSchema } from "./common.js";
import { SimplifiedPlaylistSchema } from "./playlist.js";
import { TrackSchema } from "./track.js";

/**
 * Schema for the Spotify search endpoint response.
 *
 * Each field is optional — only the types requested via the `type`
 * query parameter will be present in the response.
 */
export const SearchResponseSchema = z.object({
  tracks: PagingSchema(TrackSchema).optional(),
  albums: PagingSchema(SimplifiedAlbumSchema).optional(),
  artists: PagingSchema(ArtistSchema).optional(),
  playlists: PagingSchema(SimplifiedPlaylistSchema.nullable()).optional(),
});

/** Search results from the Spotify catalog. */
export type SearchResponse = z.infer<typeof SearchResponseSchema>;
