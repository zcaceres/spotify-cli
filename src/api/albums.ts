/**
 * Spotify Web API wrapper for album endpoints.
 *
 * @see {@link https://developer.spotify.com/documentation/web-api/reference/get-an-album | Spotify Albums API}
 * @module
 */

import { spotifyFetch as defaultFetch, type FetchFn } from "./client.js";

/**
 * Fetches details for a single album.
 * @param id - The Spotify album ID.
 * @see `GET /albums/{id}`
 */
export function getAlbum(id: string, fetch: FetchFn = defaultFetch) {
  return fetch(`/albums/${id}`);
}

/**
 * Lists tracks in an album with pagination.
 * @param id - The Spotify album ID.
 * @param options - Pagination options.
 * @param options.limit - Maximum number of tracks to return.
 * @param options.offset - Index of the first track to return.
 * @see `GET /albums/{id}/tracks`
 */
export function getAlbumTracks(
  id: string,
  options: { limit?: number | undefined; offset?: number | undefined },
  fetch: FetchFn = defaultFetch,
) {
  return fetch(`/albums/${id}/tracks`, {
    params: options as Record<string, number | undefined>,
  });
}

/**
 * Lists the current user's saved albums with pagination.
 * @param options - Pagination options.
 * @param options.limit - Maximum number of albums to return.
 * @param options.offset - Index of the first album to return.
 * @see `GET /me/albums`
 */
export function getSavedAlbums(
  options: { limit?: number | undefined; offset?: number | undefined },
  fetch: FetchFn = defaultFetch,
) {
  return fetch("/me/albums", {
    params: options as Record<string, number | undefined>,
  });
}

/**
 * Saves one or more albums to the current user's library.
 * @param ids - Array of Spotify album IDs to save.
 * @see `PUT /me/library`
 */
export function saveAlbums(ids: string[], fetch: FetchFn = defaultFetch) {
  const uris = ids.map((id) => (id.startsWith("spotify:") ? id : `spotify:album:${id}`));
  return fetch("/me/library", {
    method: "PUT",
    params: { uris: uris.join(",") },
  });
}

/**
 * Removes one or more albums from the current user's library.
 * @param ids - Array of Spotify album IDs to remove.
 * @see `DELETE /me/library`
 */
export function removeAlbums(ids: string[], fetch: FetchFn = defaultFetch) {
  const uris = ids.map((id) => (id.startsWith("spotify:") ? id : `spotify:album:${id}`));
  return fetch("/me/library", {
    method: "DELETE",
    params: { uris: uris.join(",") },
  });
}
