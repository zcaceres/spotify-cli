import { spotifyFetch } from "./client.js";

export function getPlaylist(id: string) {
  return spotifyFetch(`/playlists/${id}`);
}

export function getCurrentUserPlaylists(options: { limit?: number | undefined; offset?: number | undefined }) {
  return spotifyFetch("/me/playlists", {
    params: options as Record<string, number | undefined>,
  });
}

export function getPlaylistTracks(
  id: string,
  options: { limit?: number | undefined; offset?: number | undefined },
) {
  return spotifyFetch(`/playlists/${id}/items`, {
    params: options as Record<string, number | undefined>,
  });
}

export function addTracksToPlaylist(id: string, uris: string[], position?: number) {
  return spotifyFetch(`/playlists/${id}/items`, {
    method: "POST",
    body: { uris, position },
  });
}

export function removeTracksFromPlaylist(id: string, uris: string[]) {
  return spotifyFetch(`/playlists/${id}/items`, {
    method: "DELETE",
    body: { tracks: uris.map((uri) => ({ uri })) },
  });
}

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
