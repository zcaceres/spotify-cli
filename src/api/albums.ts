import { spotifyFetch } from "./client.js";

export function getAlbum(id: string) {
  return spotifyFetch(`/albums/${id}`);
}

export function getAlbumTracks(id: string, options: { limit?: number | undefined; offset?: number | undefined }) {
  return spotifyFetch(`/albums/${id}/tracks`, {
    params: options as Record<string, number | undefined>,
  });
}

export function getSavedAlbums(options: { limit?: number | undefined; offset?: number | undefined }) {
  return spotifyFetch("/me/albums", {
    params: options as Record<string, number | undefined>,
  });
}

export function saveAlbums(ids: string[]) {
  return spotifyFetch("/me/albums", {
    method: "PUT",
    body: { ids },
  });
}

export function removeAlbums(ids: string[]) {
  return spotifyFetch("/me/albums", {
    method: "DELETE",
    body: { ids },
  });
}
