/**
 * Batch API endpoints for fetching multiple items by ID.
 *
 * @module
 */

import { z } from "zod";
import type { SimplifiedAlbum } from "../schemas/album.js";
import { SimplifiedAlbumSchema } from "../schemas/album.js";
import type { Artist } from "../schemas/artist.js";
import { ArtistSchema } from "../schemas/artist.js";
import type { Track } from "../schemas/track.js";
import { TrackSchema } from "../schemas/track.js";
import { spotifyFetch as defaultFetch, type FetchFn } from "./client.js";

const BatchTracksSchema = z.object({
  tracks: z.array(TrackSchema.nullable()),
});

const BatchAlbumsSchema = z.object({
  albums: z.array(SimplifiedAlbumSchema.nullable()),
});

const BatchArtistsSchema = z.object({
  artists: z.array(ArtistSchema.nullable()),
});

/**
 * Fetches multiple tracks by ID. Chunks into batches of 50.
 */
export async function getTracks(ids: string[], fetch: FetchFn = defaultFetch): Promise<Track[]> {
  return batchFetch(ids, 50, "/tracks", "ids", BatchTracksSchema, "tracks", fetch);
}

/**
 * Fetches multiple albums by ID. Chunks into batches of 20.
 */
export async function getAlbums(ids: string[], fetch: FetchFn = defaultFetch): Promise<SimplifiedAlbum[]> {
  return batchFetch(ids, 20, "/albums", "ids", BatchAlbumsSchema, "albums", fetch);
}

/**
 * Fetches multiple artists by ID. Chunks into batches of 50.
 */
export async function getArtists(ids: string[], fetch: FetchFn = defaultFetch): Promise<Artist[]> {
  return batchFetch(ids, 50, "/artists", "ids", BatchArtistsSchema, "artists", fetch);
}

async function batchFetch<S extends z.ZodTypeAny, K extends string>(
  ids: string[],
  chunkSize: number,
  path: string,
  paramName: string,
  schema: S,
  key: K,
  fetch: FetchFn,
): Promise<NonNullable<z.infer<S>[K][number]>[]> {
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += chunkSize) {
    chunks.push(ids.slice(i, i + chunkSize));
  }

  const results = await Promise.all(
    chunks.map((chunk) =>
      fetch(path, {
        params: { [paramName]: chunk.join(",") },
      }),
    ),
  );

  const items: NonNullable<z.infer<S>[K][number]>[] = [];
  for (const raw of results) {
    const parsed = schema.parse(raw);
    const arr = parsed[key] as (unknown | null)[];
    for (const item of arr) {
      if (item != null) items.push(item as NonNullable<z.infer<S>[K][number]>);
    }
  }
  return items;
}
