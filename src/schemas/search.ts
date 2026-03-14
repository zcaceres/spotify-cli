import { z } from "zod";
import { PagingSchema } from "./common.js";
import { TrackSchema } from "./track.js";
import { SimplifiedAlbumSchema } from "./album.js";
import { ArtistSchema } from "./artist.js";
import { SimplifiedPlaylistSchema } from "./playlist.js";

export const SearchResponseSchema = z.object({
  tracks: PagingSchema(TrackSchema).optional(),
  albums: PagingSchema(SimplifiedAlbumSchema).optional(),
  artists: PagingSchema(ArtistSchema).optional(),
  playlists: PagingSchema(SimplifiedPlaylistSchema.nullable()).optional(),
});

export type SearchResponse = z.infer<typeof SearchResponseSchema>;
