import { spotifyFetch } from "./client.js";

export function getPlaybackState() {
  return spotifyFetch("/me/player");
}

export function getCurrentlyPlaying() {
  return spotifyFetch("/me/player/currently-playing");
}

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

export function pausePlayback(device_id?: string) {
  return spotifyFetch("/me/player/pause", {
    method: "PUT",
    params: { device_id },
  });
}

export function skipToNext(device_id?: string) {
  return spotifyFetch("/me/player/next", {
    method: "POST",
    params: { device_id },
  });
}

export function skipToPrevious(device_id?: string) {
  return spotifyFetch("/me/player/previous", {
    method: "POST",
    params: { device_id },
  });
}

export function seekToPosition(position_ms: number, device_id?: string) {
  return spotifyFetch("/me/player/seek", {
    method: "PUT",
    params: { position_ms, device_id },
  });
}

export function setVolume(volume_percent: number, device_id?: string) {
  return spotifyFetch("/me/player/volume", {
    method: "PUT",
    params: { volume_percent, device_id },
  });
}

export function setShuffle(state: boolean, device_id?: string) {
  return spotifyFetch("/me/player/shuffle", {
    method: "PUT",
    params: { state, device_id },
  });
}

export function setRepeat(state: "off" | "track" | "context", device_id?: string) {
  return spotifyFetch("/me/player/repeat", {
    method: "PUT",
    params: { state, device_id },
  });
}

export function getQueue() {
  return spotifyFetch("/me/player/queue");
}

export function addToQueue(uri: string, device_id?: string) {
  return spotifyFetch("/me/player/queue", {
    method: "POST",
    params: { uri, device_id },
  });
}

export function getDevices() {
  return spotifyFetch("/me/player/devices");
}

export function transferPlayback(device_id: string, play?: boolean) {
  return spotifyFetch("/me/player", {
    method: "PUT",
    body: { device_ids: [device_id], play },
  });
}

export function getRecentlyPlayed(options: {
  limit?: number | undefined;
  after?: number | undefined;
  before?: number | undefined;
}) {
  return spotifyFetch("/me/player/recently-played", {
    params: options as Record<string, number | undefined>,
  });
}
