/**
 * Spotify Web API wrapper for track endpoints.
 *
 * @see {@link https://developer.spotify.com/documentation/web-api/reference/get-track | Spotify Tracks API}
 * @module
 */

import { spotifyFetch } from "./client.js";

/**
 * Fetches details for a single track.
 * @param id - The Spotify track ID.
 * @see `GET /tracks/{id}`
 */
export function getTrack(id: string) {
  return spotifyFetch(`/tracks/${id}`);
}

/**
 * Lists the current user's saved tracks with pagination.
 * @param options - Pagination options.
 * @param options.limit - Maximum number of tracks to return.
 * @param options.offset - Index of the first track to return.
 * @see `GET /me/tracks`
 */
export function getSavedTracks(options: { limit?: number | undefined; offset?: number | undefined }) {
  return spotifyFetch("/me/tracks", {
    params: options as Record<string, number | undefined>,
  });
}

/**
 * Saves one or more tracks to the current user's library.
 * @param ids - Array of Spotify track IDs to save.
 * @see `PUT /me/tracks`
 */
export function saveTracks(ids: string[]) {
  const uris = ids.map((id) => (id.startsWith("spotify:") ? id : `spotify:track:${id}`));
  return spotifyFetch("/me/library", {
    method: "PUT",
    params: { uris: uris.join(",") },
  });
}

/**
 * Removes one or more tracks from the current user's library.
 * @param ids - Array of Spotify track IDs to remove.
 * @see `DELETE /me/tracks`
 */
export function removeTracks(ids: string[]) {
  const uris = ids.map((id) => (id.startsWith("spotify:") ? id : `spotify:track:${id}`));
  return spotifyFetch("/me/library", {
    method: "DELETE",
    params: { uris: uris.join(",") },
  });
}

/**
 * Gets audio features (danceability, energy, tempo, etc.) for a track.
 * @param id - The Spotify track ID.
 * @see `GET /audio-features/{id}`
 */
export function getAudioFeatures(id: string) {
  return spotifyFetch(`/audio-features/${id}`);
}

/**
 * Gets track recommendations based on seed tracks, artists, and/or genres.
 * @param options - Seed and pagination options.
 * @param options.seed_tracks - Comma-separated Spotify track IDs.
 * @param options.seed_artists - Comma-separated Spotify artist IDs.
 * @param options.seed_genres - Comma-separated genre names.
 * @param options.limit - Maximum number of recommendations to return.
 * @see `GET /recommendations`
 */
export function getRecommendations(options: {
  seed_tracks?: string | undefined;
  seed_artists?: string | undefined;
  seed_genres?: string | undefined;
  limit?: number | undefined;
}) {
  return spotifyFetch("/recommendations", {
    params: options as Record<string, string | number | undefined>,
  });
}
