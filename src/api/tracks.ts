import { spotifyFetch } from "./client.js";

export function getTrack(id: string) {
  return spotifyFetch(`/tracks/${id}`);
}

export function getSavedTracks(options: { limit?: number | undefined; offset?: number | undefined }) {
  return spotifyFetch("/me/tracks", {
    params: options as Record<string, number | undefined>,
  });
}

export function saveTracks(ids: string[]) {
  return spotifyFetch("/me/tracks", {
    method: "PUT",
    body: { ids },
  });
}

export function removeTracks(ids: string[]) {
  return spotifyFetch("/me/tracks", {
    method: "DELETE",
    body: { ids },
  });
}

export function getAudioFeatures(id: string) {
  return spotifyFetch(`/audio-features/${id}`);
}

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
