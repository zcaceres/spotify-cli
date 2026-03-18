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
    // Put many entries
    for (let i = 0; i < 505; i++) {
      cachePut({ type: "artist", id: `id${i}`, name: `Artist ${i}` });
    }
    flushCache();
    const raw = JSON.parse(readFileSync(CACHE_PATH, "utf-8"));
    const count = Object.keys(raw.entries).length;
    expect(count).toBeLessThanOrEqual(500);
  });
});
