/**
 * Multi-item fetch endpoints.
 *
 * Spotify removed batch endpoints (GET /tracks?ids=, etc.) for apps in
 * development mode as of February 2026. We fetch items individually
 * using the single-item endpoints, sequentially to avoid rate limiting.
 *
 * @module
 */

import type { SimplifiedAlbum } from "../schemas/album.js";
import { SimplifiedAlbumSchema } from "../schemas/album.js";
import type { Artist } from "../schemas/artist.js";
import { ArtistSchema } from "../schemas/artist.js";
import type { Track } from "../schemas/track.js";
import { TrackSchema } from "../schemas/track.js";
import { spotifyFetch as defaultFetch, type FetchFn } from "./client.js";

/**
 * Fetches multiple tracks by ID, one at a time.
 */
export async function getTracks(ids: string[], fetch: FetchFn = defaultFetch): Promise<Track[]> {
  return fetchIndividually(ids, "/tracks", TrackSchema, fetch);
}

/**
 * Fetches multiple albums by ID, one at a time.
 */
export async function getAlbums(ids: string[], fetch: FetchFn = defaultFetch): Promise<SimplifiedAlbum[]> {
  return fetchIndividually(ids, "/albums", SimplifiedAlbumSchema, fetch);
}

/**
 * Fetches multiple artists by ID, one at a time.
 */
export async function getArtists(ids: string[], fetch: FetchFn = defaultFetch): Promise<Artist[]> {
  return fetchIndividually(ids, "/artists", ArtistSchema, fetch);
}

async function fetchIndividually<T>(
  ids: string[],
  basePath: string,
  schema: { parse: (data: unknown) => T },
  fetch: FetchFn,
): Promise<T[]> {
  const items: T[] = [];
  for (const id of ids) {
    try {
      const raw = await fetch(`${basePath}/${id}`);
      items.push(schema.parse(raw));
    } catch {
      // Skip items that fail — enrichment is best-effort
    }
  }
  return items;
}
