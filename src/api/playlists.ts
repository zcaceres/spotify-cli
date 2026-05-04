/**
 * Spotify Web API wrapper for playlist endpoints.
 *
 * @see {@link https://developer.spotify.com/documentation/web-api/reference/get-playlist | Spotify Playlists API}
 * @module
 */

import { spotifyFetch as defaultFetch, type FetchFn } from "./client.js";

/**
 * Fetches details for a single playlist.
 * @param id - The Spotify playlist ID.
 * @see `GET /playlists/{id}`
 */
export function getPlaylist(id: string, fetch: FetchFn = defaultFetch) {
  return fetch(`/playlists/${id}`);
}

/**
 * Lists the current user's playlists with pagination.
 * @param options - Pagination options.
 * @param options.limit - Maximum number of playlists to return.
 * @param options.offset - Index of the first playlist to return.
 * @see `GET /me/playlists`
 */
export function getCurrentUserPlaylists(
  options: { limit?: number | undefined; offset?: number | undefined },
  fetch: FetchFn = defaultFetch,
) {
  return fetch("/me/playlists", {
    params: options as Record<string, number | undefined>,
  });
}

/**
 * Lists the tracks in a playlist with pagination.
 * @param id - The Spotify playlist ID.
 * @param options - Pagination options.
 * @param options.limit - Maximum number of tracks to return.
 * @param options.offset - Index of the first track to return.
 * @see `GET /playlists/{id}/items`
 */
export function getPlaylistTracks(
  id: string,
  options: { limit?: number | undefined; offset?: number | undefined },
  fetch: FetchFn = defaultFetch,
) {
  return fetch(`/playlists/${id}/items`, {
    params: options as Record<string, number | undefined>,
  });
}

/**
 * Adds tracks to a playlist.
 * @param id - The Spotify playlist ID.
 * @param uris - Array of Spotify track URIs to add.
 * @param position - Zero-based position to insert tracks at. Appends if omitted.
 * @see `POST /playlists/{id}/items`
 */
export function addTracksToPlaylist(id: string, uris: string[], position?: number, fetch: FetchFn = defaultFetch) {
  return fetch(`/playlists/${id}/items`, {
    method: "POST",
    body: { uris, position },
  });
}

/**
 * Removes tracks from a playlist.
 * @param id - The Spotify playlist ID.
 * @param uris - Array of Spotify track URIs to remove.
 * @see `DELETE /playlists/{id}/items`
 */
export function removeTracksFromPlaylist(id: string, uris: string[], fetch: FetchFn = defaultFetch) {
  return fetch(`/playlists/${id}/items`, {
    method: "DELETE",
    body: { items: uris.map((uri) => ({ uri })) },
  });
}

/**
 * Replaces all tracks in a playlist with the given URIs in order.
 * @param id - The Spotify playlist ID.
 * @param uris - Ordered array of Spotify track URIs (max 100 per request).
 * @see `PUT /playlists/{id}/tracks`
 */
export function replacePlaylistTracks(id: string, uris: string[], fetch: FetchFn = defaultFetch) {
  return fetch(`/playlists/${id}/items`, {
    method: "PUT",
    body: { uris },
  });
}

/**
 * Creates a new playlist for the current user.
 * @param options - Playlist creation options.
 * @param options.name - Name for the new playlist.
 * @param options.description - Optional description.
 * @param options.public - Whether the playlist should be public (defaults to `true`).
 * @see `POST /me/playlists`
 */
export function createPlaylist(
  options: { name: string; description?: string; public?: boolean },
  fetch: FetchFn = defaultFetch,
) {
  return fetch("/me/playlists", {
    method: "POST",
    body: options,
  });
}

/**
 * Renames an existing playlist.
 * @param id - The Spotify playlist ID.
 * @param name - The new playlist name.
 * @see `PUT /playlists/{id}`
 */
export function renamePlaylist(id: string, name: string, fetch: FetchFn = defaultFetch) {
  return fetch(`/playlists/${id}`, {
    method: "PUT",
    body: { name },
  });
}

/**
 * Updates one or more details of an existing playlist.
 * @param id - The Spotify playlist ID.
 * @param options - Fields to update. Only the provided fields are sent.
 * @param options.name - New playlist name.
 * @param options.description - New description (pass empty string to clear).
 * @param options.public - Whether the playlist is public.
 * @param options.collaborative - Whether the playlist is collaborative. Spotify requires `public: false` for a collaborative playlist.
 * @see `PUT /playlists/{id}`
 */
export function updatePlaylistDetails(
  id: string,
  options: { name?: string; description?: string; public?: boolean; collaborative?: boolean },
  fetch: FetchFn = defaultFetch,
) {
  return fetch(`/playlists/${id}`, {
    method: "PUT",
    body: options,
  });
}
