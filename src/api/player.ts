/**
 * Spotify Web API wrapper for player/playback endpoints.
 *
 * @see {@link https://developer.spotify.com/documentation/web-api/reference/get-information-about-the-users-current-playback | Spotify Player API}
 * @module
 */

import { spotifyFetch } from "./client.js";

/**
 * Gets the current playback state (device, track, progress, etc.).
 * @see `GET /me/player`
 */
export function getPlaybackState() {
  return spotifyFetch("/me/player");
}

/**
 * Gets the currently playing track (lighter than full playback state).
 * @see `GET /me/player/currently-playing`
 */
export function getCurrentlyPlaying() {
  return spotifyFetch("/me/player/currently-playing");
}

/**
 * Starts or resumes playback.
 * @param options - Playback options.
 * @param options.device_id - Target device ID.
 * @param options.context_uri - Spotify URI of the context to play (album, playlist, artist).
 * @param options.uris - Array of Spotify track URIs to play.
 * @param options.offset - Where in the context to start (by position or URI).
 * @param options.position_ms - Position in milliseconds to seek to.
 * @see `PUT /me/player/play`
 */
export function startPlayback(options: {
  device_id?: string;
  context_uri?: string;
  uris?: string[];
  offset?: { position: number } | { uri: string };
  position_ms?: number;
}) {
  const { device_id, ...body } = options;
  const params: Record<string, string | undefined> = { device_id };
  const hasBody = Object.keys(body).length > 0;
  return spotifyFetch("/me/player/play", {
    method: "PUT",
    params,
    body: hasBody ? body : undefined,
  });
}

/**
 * Pauses playback on the active or specified device.
 * @param device_id - Optional target device ID.
 * @see `PUT /me/player/pause`
 */
export function pausePlayback(device_id?: string) {
  return spotifyFetch("/me/player/pause", {
    method: "PUT",
    params: { device_id },
  });
}

/**
 * Skips to the next track in the queue.
 * @param device_id - Optional target device ID.
 * @see `POST /me/player/next`
 */
export function skipToNext(device_id?: string) {
  return spotifyFetch("/me/player/next", {
    method: "POST",
    params: { device_id },
  });
}

/**
 * Skips to the previous track.
 * @param device_id - Optional target device ID.
 * @see `POST /me/player/previous`
 */
export function skipToPrevious(device_id?: string) {
  return spotifyFetch("/me/player/previous", {
    method: "POST",
    params: { device_id },
  });
}

/**
 * Seeks to a position in the currently playing track.
 * @param position_ms - Position in milliseconds to seek to.
 * @param device_id - Optional target device ID.
 * @see `PUT /me/player/seek`
 */
export function seekToPosition(position_ms: number, device_id?: string) {
  return spotifyFetch("/me/player/seek", {
    method: "PUT",
    params: { position_ms, device_id },
  });
}

/**
 * Sets the playback volume.
 * @param volume_percent - Volume level from 0 to 100.
 * @param device_id - Optional target device ID.
 * @see `PUT /me/player/volume`
 */
export function setVolume(volume_percent: number, device_id?: string) {
  return spotifyFetch("/me/player/volume", {
    method: "PUT",
    params: { volume_percent, device_id },
  });
}

/**
 * Enables or disables shuffle mode.
 * @param state - `true` to enable shuffle, `false` to disable.
 * @param device_id - Optional target device ID.
 * @see `PUT /me/player/shuffle`
 */
export function setShuffle(state: boolean, device_id?: string) {
  return spotifyFetch("/me/player/shuffle", {
    method: "PUT",
    params: { state, device_id },
  });
}

/**
 * Sets the repeat mode.
 * @param state - `"off"`, `"track"`, or `"context"`.
 * @param device_id - Optional target device ID.
 * @see `PUT /me/player/repeat`
 */
export function setRepeat(state: "off" | "track" | "context", device_id?: string) {
  return spotifyFetch("/me/player/repeat", {
    method: "PUT",
    params: { state, device_id },
  });
}

/**
 * Gets the user's playback queue.
 * @see `GET /me/player/queue`
 */
export function getQueue() {
  return spotifyFetch("/me/player/queue");
}

/**
 * Adds a track to the end of the playback queue.
 * @param uri - Spotify URI of the track to add.
 * @param device_id - Optional target device ID.
 * @see `POST /me/player/queue`
 */
export function addToQueue(uri: string, device_id?: string) {
  return spotifyFetch("/me/player/queue", {
    method: "POST",
    params: { uri, device_id },
  });
}

/**
 * Lists all available playback devices.
 * @see `GET /me/player/devices`
 */
export function getDevices() {
  return spotifyFetch("/me/player/devices");
}

/**
 * Transfers playback to a different device.
 * @param device_id - The target device ID.
 * @param play - If `true`, start playback on the new device.
 * @see `PUT /me/player`
 */
export function transferPlayback(device_id: string, play?: boolean) {
  return spotifyFetch("/me/player", {
    method: "PUT",
    body: { device_ids: [device_id], play },
  });
}

/**
 * Gets the user's recently played tracks.
 * @param options - Cursor-based pagination options.
 * @param options.limit - Maximum number of items to return.
 * @param options.after - Unix timestamp in ms — return items after this point.
 * @param options.before - Unix timestamp in ms — return items before this point.
 * @see `GET /me/player/recently-played`
 */
export function getRecentlyPlayed(options: {
  limit?: number | undefined;
  after?: number | undefined;
  before?: number | undefined;
}) {
  return spotifyFetch("/me/player/recently-played", {
    params: options as Record<string, number | undefined>,
  });
}
