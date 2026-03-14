import { spotifyFetch } from "./client.js";

export function search(options: {
  q: string;
  type: string;
  limit?: number | undefined;
  offset?: number | undefined;
}) {
  return spotifyFetch("/search", {
    params: options as Record<string, string | number | undefined>,
  });
}
