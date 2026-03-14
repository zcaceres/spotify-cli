import { spotifyFetch } from "./client.js";

export function getCurrentUser() {
  return spotifyFetch("/me");
}

export function getTopItems(
  type: "artists" | "tracks",
  options: { time_range?: string | undefined; limit?: number | undefined; offset?: number | undefined },
) {
  return spotifyFetch(`/me/top/${type}`, {
    params: options as Record<string, string | number | undefined>,
  });
}

export function getFollowedArtists(options: { limit?: number | undefined; after?: string | undefined }) {
  return spotifyFetch("/me/following", {
    params: { type: "artist", ...options } as Record<string, string | number | undefined>,
  });
}

export function followArtists(ids: string[]) {
  return spotifyFetch("/me/following", {
    method: "PUT",
    params: { type: "artist" },
    body: { ids },
  });
}

export function unfollowArtists(ids: string[]) {
  return spotifyFetch("/me/following", {
    method: "DELETE",
    params: { type: "artist" },
    body: { ids },
  });
}
