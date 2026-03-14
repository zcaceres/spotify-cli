/**
 * Spotify Web API wrapper for playlist endpoints.
 *
 * @see {@link https://developer.spotify.com/documentation/web-api/reference/get-playlist | Spotify Playlists API}
 * @module
 */

import { spotifyFetch } from "./client.js";

/**
 * Fetches details for a single playlist.
 * @param id - The Spotify playlist ID.
 * @see `GET /playlists/{id}`
 */
export function getPlaylist(id: string) {
  return spotifyFetch(`/playlists/${id}`);
}

/**
 * Lists the current user's playlists with pagination.
 * @param options - Pagination options.
 * @param options.limit - Maximum number of playlists to return.
 * @param options.offset - Index of the first playlist to return.
 * @see `GET /me/playlists`
 */
export function getCurrentUserPlaylists(options: { limit?: number | undefined; offset?: number | undefined }) {
  return spotifyFetch("/me/playlists", {
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
) {
  return spotifyFetch(`/playlists/${id}/items`, {
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
export function addTracksToPlaylist(id: string, uris: string[], position?: number) {
  return spotifyFetch(`/playlists/${id}/items`, {
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
export function removeTracksFromPlaylist(id: string, uris: string[]) {
  return spotifyFetch(`/playlists/${id}/items`, {
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
export function replacePlaylistTracks(id: string, uris: string[]) {
  return spotifyFetch(`/playlists/${id}/items`, {
    method: "PUT",
    body: { uris },
  });
}

/**
 * Creates a new playlist for a user.
 * @param userId - The Spotify user ID to create the playlist for.
 * @param options - Playlist creation options.
 * @param options.name - Name for the new playlist.
 * @param options.description - Optional description.
 * @param options.public - Whether the playlist should be public (defaults to `true`).
 * @see `POST /users/{user_id}/playlists`
 */
export function createPlaylist(
  userId: string,
  options: {
    name: string;
    description?: string;
    public?: boolean;
  },
) {
  return spotifyFetch(`/users/${userId}/playlists`, {
    method: "POST",
    body: options,
  });
}
