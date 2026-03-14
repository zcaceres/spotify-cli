/**
 * Spotify Web API wrapper for the search endpoint.
 *
 * @see {@link https://developer.spotify.com/documentation/web-api/reference/search | Spotify Search API}
 * @module
 */

import { spotifyFetch } from "./client.js";

/**
 * Searches the Spotify catalog for tracks, albums, artists, and/or playlists.
 * @param options - Search parameters.
 * @param options.q - The search query string.
 * @param options.type - Comma-separated list of item types (e.g. `"track,album"`).
 * @param options.limit - Maximum number of results per type.
 * @param options.offset - Index of the first result to return.
 * @see `GET /search`
 */
export function search(options: {
  q: string;
  type: string;
  limit?: number | undefined;
  offset?: number | undefined;
}) {
  return spotifyFetch("/search", {
    params: options as Record<string, string | number | undefined>,
  });
}
