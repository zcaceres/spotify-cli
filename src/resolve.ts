/**
 * Enrichment resolver — resolves Spotify IDs/queries to human-readable summaries.
 *
 * @module
 */

import { getAlbums, getArtists, getTracks } from "./api/batch.js";
import { search as defaultSearch } from "./api/search.js";
import { cacheGet as defaultCacheGet, cachePut as defaultCachePut, flushCache as defaultFlushCache } from "./cache.js";
import { identify } from "./identify.js";
import { SearchResponseSchema } from "./schemas/search.js";

export type TrackSummary = { type: "track"; id: string; name: string; artist: string; album: string };
export type AlbumSummary = { type: "album"; id: string; name: string; artist: string };
export type ArtistSummary = { type: "artist"; id: string; name: string };
export type ItemSummary = TrackSummary | AlbumSummary | ArtistSummary;

type SearchedEntry = { query: string; match: ItemSummary };

export interface ResolveDeps {
  getTracks: typeof getTracks;
  getAlbums: typeof getAlbums;
  getArtists: typeof getArtists;
  search: typeof defaultSearch;
  cacheGet: typeof defaultCacheGet;
  cachePut: typeof defaultCachePut;
  flushCache: typeof defaultFlushCache;
}

const defaultDeps: ResolveDeps = {
  getTracks,
  getAlbums,
  getArtists,
  search: defaultSearch,
  cacheGet: defaultCacheGet,
  cachePut: defaultCachePut,
  flushCache: defaultFlushCache,
};

function withDefaults(deps?: Partial<ResolveDeps>): ResolveDeps {
  return deps ? { ...defaultDeps, ...deps } : defaultDeps;
}

/**
 * Resolves a list of IDs to enriched summaries.
 * Checks cache first, batch-fetches uncached, caches results.
 */
export async function resolveItems(
  type: "track" | "album" | "artist",
  ids: string[],
  deps?: Partial<ResolveDeps>,
): Promise<ItemSummary[]> {
  const d = withDefaults(deps);
  const cached = new Map<string, ItemSummary>();
  const uncachedIds: string[] = [];

  for (const id of ids) {
    const hit = d.cacheGet(id);
    if (hit) {
      cached.set(id, hit);
    } else {
      uncachedIds.push(id);
    }
  }

  if (uncachedIds.length > 0) {
    const fetched = await fetchByType(type, uncachedIds, d);
    for (const item of fetched) {
      cached.set(item.id, item);
      d.cachePut(item);
    }
  }

  d.flushCache();

  return ids.map((id) => cached.get(id) ?? fallback(type, id));
}

/**
 * Best-effort enrichment — returns items on success, undefined on failure.
 * Never throws. Use this when enrichment should not interfere with core behavior.
 */
export async function tryResolveItems(
  type: "track" | "album" | "artist",
  ids: string[],
  deps?: Partial<ResolveDeps>,
): Promise<ItemSummary[] | undefined> {
  try {
    return await resolveItems(type, ids, deps);
  } catch {
    return undefined;
  }
}

/**
 * Resolves a single user input (ID, URI, or search query) to a Spotify ID.
 * Returns the resolved ID and, if a search was performed, what was matched.
 */
export async function resolveInput(
  input: string,
  type: "track" | "album" | "artist",
  deps?: Partial<ResolveDeps>,
): Promise<{ id: string; searched?: SearchedEntry }> {
  const d = withDefaults(deps);
  const identified = identify(input);

  if (identified.kind === "uri") {
    return { id: identified.id };
  }
  if (identified.kind === "id") {
    return { id: identified.id };
  }

  // Search query — parse with Zod to validate the response shape
  const raw = await d.search({ q: identified.query, type, limit: 1 });
  const result = SearchResponseSchema.parse(raw);

  const summary = extractTopResult(result, type);
  if (!summary) {
    return { id: input }; // fallback — let the API reject it
  }

  d.cachePut(summary);
  d.flushCache();

  return {
    id: summary.id,
    searched: { query: identified.query, match: summary },
  };
}

/**
 * Resolves multiple user inputs to Spotify IDs.
 * Returns the resolved IDs and any search matches.
 */
export async function resolveInputs(
  inputs: string[],
  type: "track" | "album" | "artist",
  deps?: Partial<ResolveDeps>,
): Promise<{ ids: string[]; searched: SearchedEntry[] }> {
  // Resolve sequentially to avoid hammering the search API with parallel requests
  const results: { id: string; searched?: SearchedEntry }[] = [];
  for (const input of inputs) {
    results.push(await resolveInput(input, type, deps));
  }
  const ids = results.map((r) => r.id);
  const searched = results
    .filter((r): r is { id: string; searched: SearchedEntry } => r.searched !== undefined)
    .map((r) => r.searched);
  return { ids, searched };
}

async function fetchByType(
  type: "track" | "album" | "artist",
  ids: string[],
  d: Required<ResolveDeps>,
): Promise<ItemSummary[]> {
  switch (type) {
    case "track": {
      const tracks = await d.getTracks(ids);
      return tracks.map((t) => ({
        type: "track" as const,
        id: t.id,
        name: t.name,
        artist: t.artists.map((a) => a.name).join(", "),
        album: t.album.name,
      }));
    }
    case "album": {
      const albums = await d.getAlbums(ids);
      return albums.map((a) => ({
        type: "album" as const,
        id: a.id,
        name: a.name,
        artist: a.artists.map((ar) => ar.name).join(", "),
      }));
    }
    case "artist": {
      const artists = await d.getArtists(ids);
      return artists.map((a) => ({
        type: "artist" as const,
        id: a.id,
        name: a.name,
      }));
    }
  }
}

function fallback(type: "track" | "album" | "artist", id: string): ItemSummary {
  switch (type) {
    case "track":
      return { type: "track", id, name: "unknown", artist: "unknown", album: "unknown" };
    case "album":
      return { type: "album", id, name: "unknown", artist: "unknown" };
    case "artist":
      return { type: "artist", id, name: "unknown" };
  }
}

function extractTopResult(
  result: import("./schemas/search.js").SearchResponse,
  type: "track" | "album" | "artist",
): ItemSummary | undefined {
  switch (type) {
    case "track": {
      const track = result.tracks?.items[0];
      if (!track) return undefined;
      return {
        type: "track",
        id: track.id,
        name: track.name,
        artist: track.artists.map((a) => a.name).join(", "),
        album: track.album.name,
      };
    }
    case "album": {
      const album = result.albums?.items[0];
      if (!album) return undefined;
      return {
        type: "album",
        id: album.id,
        name: album.name,
        artist: album.artists.map((a) => a.name).join(", "),
      };
    }
    case "artist": {
      const artist = result.artists?.items[0];
      if (!artist) return undefined;
      return {
        type: "artist",
        id: artist.id,
        name: artist.name,
      };
    }
  }
}
