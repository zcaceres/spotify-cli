/**
 * Spotify Web API wrapper for user and follow endpoints.
 *
 * @see {@link https://developer.spotify.com/documentation/web-api/reference/get-current-users-profile | Spotify Users API}
 * @module
 */

import { spotifyFetch } from "./client.js";

/**
 * Gets the current user's profile.
 * @see `GET /me`
 */
export function getCurrentUser() {
  return spotifyFetch("/me");
}

/**
 * Gets the current user's top artists or tracks.
 * @param type - Whether to fetch `"artists"` or `"tracks"`.
 * @param options - Query options.
 * @param options.time_range - Time range: `"short_term"`, `"medium_term"`, or `"long_term"`.
 * @param options.limit - Maximum number of items to return.
 * @param options.offset - Index of the first item to return.
 * @see `GET /me/top/{type}`
 */
export function getTopItems(
  type: "artists" | "tracks",
  options: { time_range?: string | undefined; limit?: number | undefined; offset?: number | undefined },
) {
  return spotifyFetch(`/me/top/${type}`, {
    params: options as Record<string, string | number | undefined>,
  });
}

/**
 * Gets the current user's followed artists with cursor-based pagination.
 * @param options - Pagination options.
 * @param options.limit - Maximum number of artists to return.
 * @param options.after - The last artist ID from the previous page (cursor).
 * @see `GET /me/following`
 */
export function getFollowedArtists(options: { limit?: number | undefined; after?: string | undefined }) {
  return spotifyFetch("/me/following", {
    params: { type: "artist", ...options } as Record<string, string | number | undefined>,
  });
}

/**
 * Follows one or more artists.
 * @param ids - Array of Spotify artist IDs to follow.
 * @see `PUT /me/following`
 */
export function followArtists(ids: string[]) {
  return spotifyFetch("/me/following", {
    method: "PUT",
    params: { type: "artist" },
    body: { ids },
  });
}

/**
 * Unfollows one or more artists.
 * @param ids - Array of Spotify artist IDs to unfollow.
 * @see `DELETE /me/following`
 */
export function unfollowArtists(ids: string[]) {
  return spotifyFetch("/me/following", {
    method: "DELETE",
    params: { type: "artist" },
    body: { ids },
  });
}
