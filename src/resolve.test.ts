import { describe, expect, mock, test } from "bun:test";
import type { ResolveDeps } from "./resolve.js";
import { resolveInput, resolveInputs, resolveItems, tryResolveItems } from "./resolve.js";

function makeTrackFixture(id: string, name: string) {
  return {
    id,
    name,
    type: "track" as const,
    uri: `spotify:track:${id}`,
    href: `h/${id}`,
    artists: [{ id: "a1", name: "Artist A", type: "artist" as const, uri: "u", href: "h", external_urls: {} }],
    album: {
      id: "al1",
      name: "Album X",
      album_type: "album",
      uri: "u",
      href: "h",
      images: [],
      release_date: "2020-01-01",
      external_urls: {},
    },
    duration_ms: 200000,
    explicit: false,
    track_number: 1,
    disc_number: 1,
    is_local: false,
    external_urls: {},
  };
}

function makeSearchResponse(id: string, name: string) {
  return {
    tracks: {
      href: "h",
      items: [makeTrackFixture(id, name)],
      limit: 1,
      next: null,
      offset: 0,
      previous: null,
      total: 1,
    },
  };
}

function makeDeps(overrides: Partial<ResolveDeps> = {}): ResolveDeps {
  return {
    getTracks: mock(() => Promise.resolve([makeTrackFixture("t1", "Track One")])),
    getAlbums: mock(() =>
      Promise.resolve([
        {
          id: "a1",
          name: "Album One",
          type: "album" as const,
          album_type: "album",
          uri: "u",
          href: "h",
          artists: [{ id: "ar1", name: "Artist B", type: "artist" as const, uri: "u", href: "h", external_urls: {} }],
          images: [],
          release_date: "2020",
          release_date_precision: "day",
          total_tracks: 10,
          external_urls: {},
        },
      ]),
    ),
    getArtists: mock(() =>
      Promise.resolve([
        {
          id: "ar1",
          name: "Artist One",
          type: "artist" as const,
          uri: "u",
          href: "h",
          external_urls: {},
          images: [],
        },
      ]),
    ),
    search: mock(() => Promise.resolve(makeSearchResponse("found1", "Found Track"))),
    cacheGet: mock(() => undefined),
    cachePut: mock(() => {}),
    flushCache: mock(() => {}),
    ...overrides,
  };
}

describe("resolveItems", () => {
  test("resolves track IDs to summaries", async () => {
    const deps = makeDeps();
    const items = await resolveItems("track", ["t1"], deps);
    expect(items).toHaveLength(1);
    expect(items[0]).toEqual({
      type: "track",
      id: "t1",
      name: "Track One",
      artist: "Artist A",
      album: "Album X",
    });
  });

  test("resolves album IDs to summaries", async () => {
    const deps = makeDeps();
    const items = await resolveItems("album", ["a1"], deps);
    expect(items).toHaveLength(1);
    expect(items[0]).toEqual({
      type: "album",
      id: "a1",
      name: "Album One",
      artist: "Artist B",
    });
  });

  test("resolves artist IDs to summaries", async () => {
    const deps = makeDeps();
    const items = await resolveItems("artist", ["ar1"], deps);
    expect(items).toHaveLength(1);
    expect(items[0]).toEqual({
      type: "artist",
      id: "ar1",
      name: "Artist One",
    });
  });

  test("returns fallback for unresolved IDs", async () => {
    const deps = makeDeps({
      getTracks: mock(() => Promise.resolve([])),
    });
    const items = await resolveItems("track", ["missing"], deps);
    expect(items[0]).toEqual({
      type: "track",
      id: "missing",
      name: "unknown",
      artist: "unknown",
      album: "unknown",
    });
  });

  test("uses cache for known IDs", async () => {
    const mockGetTracks = mock(() => Promise.resolve([]));
    const deps = makeDeps({
      cacheGet: mock((id: string) =>
        id === "cached1"
          ? { type: "track" as const, id: "cached1", name: "Cached", artist: "A", album: "B" }
          : undefined,
      ),
      getTracks: mockGetTracks,
    });
    const items = await resolveItems("track", ["cached1"], deps);
    expect(items[0]?.name).toBe("Cached");
    expect(mockGetTracks).not.toHaveBeenCalled();
  });

  test("caches newly fetched items", async () => {
    const deps = makeDeps();
    await resolveItems("track", ["t1"], deps);
    expect(deps.cachePut).toHaveBeenCalled();
    expect(deps.flushCache).toHaveBeenCalled();
  });
});

describe("resolveInput", () => {
  test("extracts ID from URI without searching", async () => {
    const deps = makeDeps();
    const result = await resolveInput("spotify:track:abc123", "track", deps);
    expect(result.id).toBe("abc123");
    expect(result.searched).toBeUndefined();
    expect(deps.search).not.toHaveBeenCalled();
  });

  test("passes through 22-char ID without searching", async () => {
    const deps = makeDeps();
    const result = await resolveInput("4uLU6hMCjMI75M1A2tKUQC", "track", deps);
    expect(result.id).toBe("4uLU6hMCjMI75M1A2tKUQC");
    expect(result.searched).toBeUndefined();
    expect(deps.search).not.toHaveBeenCalled();
  });

  test("searches for query strings", async () => {
    const deps = makeDeps();
    const result = await resolveInput("bohemian rhapsody", "track", deps);
    expect(result.id).toBe("found1");
    expect(result.searched).toBeDefined();
    expect(result.searched?.query).toBe("bohemian rhapsody");
    expect(result.searched?.match.name).toBe("Found Track");
    expect(deps.search).toHaveBeenCalledWith({ q: "bohemian rhapsody", type: "track", limit: 1 });
  });

  test("falls back to raw input when search returns no results", async () => {
    const deps = makeDeps({
      search: mock(() =>
        Promise.resolve({
          tracks: { href: "h", items: [], limit: 1, next: null, offset: 0, previous: null, total: 0 },
        }),
      ),
    });
    const result = await resolveInput("nonexistent song", "track", deps);
    expect(result.id).toBe("nonexistent song");
    expect(result.searched).toBeUndefined();
  });
});

describe("resolveInputs", () => {
  test("resolves multiple inputs sequentially", async () => {
    const deps = makeDeps();
    const result = await resolveInputs(["4uLU6hMCjMI75M1A2tKUQC", "bohemian rhapsody"], "track", deps);
    expect(result.ids).toEqual(["4uLU6hMCjMI75M1A2tKUQC", "found1"]);
    expect(result.searched).toHaveLength(1);
    expect(result.searched[0]?.query).toBe("bohemian rhapsody");
  });

  test("returns empty searched array when all inputs are IDs", async () => {
    const deps = makeDeps();
    const result = await resolveInputs(["4uLU6hMCjMI75M1A2tKUQC"], "track", deps);
    expect(result.searched).toEqual([]);
  });
});

describe("tryResolveItems", () => {
  test("returns items on success", async () => {
    const deps = makeDeps();
    const items = await tryResolveItems("track", ["t1"], deps);
    expect(items).toBeDefined();
    expect(items).toHaveLength(1);
  });

  test("returns undefined on failure instead of throwing", async () => {
    const deps = makeDeps({
      getTracks: mock(() => Promise.reject(new Error("network error"))),
    });
    const items = await tryResolveItems("track", ["t1"], deps);
    expect(items).toBeUndefined();
  });
});
