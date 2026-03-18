import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { CACHE_PATH } from "./config.js";
import type { ItemSummary } from "./resolve.js";

// We need to reset the singleton between tests
let cacheGet: typeof import("./cache.js").cacheGet;
let cachePut: typeof import("./cache.js").cachePut;
let flushCache: typeof import("./cache.js").flushCache;
let resetCache: typeof import("./cache.js").resetCache;

beforeEach(async () => {
  // Clean up any existing cache file
  try {
    rmSync(CACHE_PATH, { force: true });
  } catch {
    // ignore
  }
  // Re-import to get fresh module state
  const mod = await import("./cache.js");
  cacheGet = mod.cacheGet;
  cachePut = mod.cachePut;
  flushCache = mod.flushCache;
  resetCache = mod.resetCache;
  resetCache();
});

afterEach(() => {
  try {
    rmSync(CACHE_PATH, { force: true });
  } catch {
    // ignore
  }
});

const trackSummary: ItemSummary = {
  type: "track",
  id: "abc123",
  name: "Test Track",
  artist: "Test Artist",
  album: "Test Album",
};

describe("cache", () => {
  test("returns undefined for missing entry", () => {
    expect(cacheGet("nonexistent")).toBeUndefined();
  });

  test("stores and retrieves entry", () => {
    cachePut(trackSummary);
    const result = cacheGet("abc123");
    expect(result).toEqual(trackSummary);
  });

  test("flushCache writes to disk", () => {
    cachePut(trackSummary);
    flushCache();
    expect(existsSync(CACHE_PATH)).toBe(true);
    const raw = JSON.parse(readFileSync(CACHE_PATH, "utf-8"));
    expect(raw.version).toBe(1);
    expect(raw.entries.abc123.summary).toEqual(trackSummary);
  });

  test("loads from disk on first access", () => {
    // Write cache file manually
    const dir = dirname(CACHE_PATH);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const data = {
      version: 1,
      entries: {
        xyz789: { summary: { ...trackSummary, id: "xyz789" }, accessedAt: Date.now() },
      },
    };
    writeFileSync(CACHE_PATH, JSON.stringify(data), "utf-8");

    resetCache(); // Force reload
    const result = cacheGet("xyz789");
    expect(result).toBeDefined();
    expect(result?.id).toBe("xyz789");
  });

  test("handles corrupt cache file gracefully", () => {
    const dir = dirname(CACHE_PATH);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(CACHE_PATH, "not valid json{{{", "utf-8");

    resetCache();
    expect(cacheGet("anything")).toBeUndefined();
  });

  test("evicts oldest entries when exceeding max size", () => {
    for (let i = 0; i < 505; i++) {
      cachePut({ type: "artist", id: `id${i}`, name: `Artist ${i}` });
    }
    flushCache();
    const raw = JSON.parse(readFileSync(CACHE_PATH, "utf-8"));
    const count = Object.keys(raw.entries).length;
    expect(count).toBeLessThanOrEqual(500);
  });

  test("evicts least recently accessed entries, not most recently added", () => {
    // Add entries with staggered access times
    for (let i = 0; i < 500; i++) {
      cachePut({ type: "artist", id: `old${i}`, name: `Old ${i}` });
    }
    // Access one old entry to refresh its accessedAt
    cacheGet("old0");
    // Now add entries that push past the limit
    for (let i = 0; i < 10; i++) {
      cachePut({ type: "artist", id: `new${i}`, name: `New ${i}` });
    }
    flushCache();
    const raw = JSON.parse(readFileSync(CACHE_PATH, "utf-8"));
    // old0 was accessed recently, so it should survive eviction
    expect(raw.entries.old0).toBeDefined();
    // new entries should all survive
    expect(raw.entries.new0).toBeDefined();
    expect(raw.entries.new9).toBeDefined();
    // total should be at max
    expect(Object.keys(raw.entries).length).toBeLessThanOrEqual(500);
  });

  test("cacheGet updates accessedAt timestamp", () => {
    cachePut(trackSummary);
    flushCache();
    const before = JSON.parse(readFileSync(CACHE_PATH, "utf-8"));
    const firstAccess = before.entries.abc123.accessedAt;

    // Small delay then access again
    resetCache();
    cacheGet("abc123");
    flushCache();
    const after = JSON.parse(readFileSync(CACHE_PATH, "utf-8"));
    expect(after.entries.abc123.accessedAt).toBeGreaterThanOrEqual(firstAccess);
  });

  test("cachePut overwrites existing entry", () => {
    cachePut(trackSummary);
    const updated = { ...trackSummary, name: "Updated Track" };
    cachePut(updated);
    const result = cacheGet("abc123");
    expect(result?.name).toBe("Updated Track");
  });

  test("flushCache is no-op when nothing is dirty", () => {
    // No mutations, flush should not create file
    flushCache();
    expect(existsSync(CACHE_PATH)).toBe(false);
  });

  test("flushCache preserves dirty flag on write failure", () => {
    cachePut(trackSummary);
    // Write a directory at the cache path to make the write fail
    const dir = dirname(CACHE_PATH);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    // Make cache path a directory so writeFileSync fails
    rmSync(CACHE_PATH, { force: true });
    mkdirSync(CACHE_PATH, { recursive: true });

    flushCache(); // Should fail silently

    // Clean up the bogus directory
    rmSync(CACHE_PATH, { recursive: true, force: true });

    // Flush again — should still attempt because dirty was preserved
    flushCache();
    // Now it should have written successfully
    expect(existsSync(CACHE_PATH)).toBe(true);
    const raw = JSON.parse(readFileSync(CACHE_PATH, "utf-8"));
    expect(raw.entries.abc123).toBeDefined();
  });

  test("handles cache file with wrong version", () => {
    const dir = dirname(CACHE_PATH);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(CACHE_PATH, JSON.stringify({ version: 99, entries: {} }), "utf-8");

    resetCache();
    expect(cacheGet("anything")).toBeUndefined();
  });

  test("handles cache file with missing entries field", () => {
    const dir = dirname(CACHE_PATH);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(CACHE_PATH, JSON.stringify({ version: 1 }), "utf-8");

    resetCache();
    expect(cacheGet("anything")).toBeUndefined();
  });

  test("multiple put-get cycles work correctly", () => {
    const items: ItemSummary[] = [
      { type: "track", id: "t1", name: "Track 1", artist: "A1", album: "Al1" },
      { type: "album", id: "a1", name: "Album 1", artist: "A2" },
      { type: "artist", id: "ar1", name: "Artist 1" },
    ];
    for (const item of items) cachePut(item);
    expect(cacheGet("t1")?.name).toBe("Track 1");
    expect(cacheGet("a1")?.name).toBe("Album 1");
    expect(cacheGet("ar1")?.name).toBe("Artist 1");
    expect(cacheGet("nonexistent")).toBeUndefined();
  });

  test("roundtrips through disk correctly", () => {
    cachePut(trackSummary);
    cachePut({ type: "artist", id: "art1", name: "Artist One" });
    flushCache();

    resetCache(); // Force reload from disk
    expect(cacheGet("abc123")).toEqual(trackSummary);
    expect(cacheGet("art1")?.name).toBe("Artist One");
  });
});
