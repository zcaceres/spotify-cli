/**
 * File-backed LRU cache for resolved item metadata.
 *
 * @module
 */

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { CACHE_MAX_SIZE, CACHE_PATH } from "./config.js";
import type { ItemSummary } from "./resolve.js";

interface CacheEntry {
  summary: ItemSummary;
  accessedAt: number;
}

interface CacheData {
  version: 1;
  entries: Record<string, CacheEntry>;
}

let cache: CacheData | null = null;
let dirty = false;

function load(): CacheData {
  if (cache) return cache;
  try {
    if (existsSync(CACHE_PATH)) {
      const raw = readFileSync(CACHE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === 1 && parsed.entries) {
        cache = parsed as CacheData;
        return cache;
      }
    }
  } catch {
    // Corrupt/missing file → empty cache
  }
  cache = { version: 1, entries: {} };
  return cache;
}

export function cacheGet(id: string): ItemSummary | undefined {
  const data = load();
  const entry = data.entries[id];
  if (!entry) return undefined;
  entry.accessedAt = Date.now();
  dirty = true;
  return entry.summary;
}

export function cachePut(summary: ItemSummary): void {
  const data = load();
  data.entries[summary.id] = { summary, accessedAt: Date.now() };
  dirty = true;
  evict(data);
}

function evict(data: CacheData): void {
  const keys = Object.keys(data.entries);
  if (keys.length <= CACHE_MAX_SIZE) return;
  const sorted = keys.sort((a, b) => (data.entries[a]?.accessedAt ?? 0) - (data.entries[b]?.accessedAt ?? 0));
  const toRemove = sorted.slice(0, keys.length - CACHE_MAX_SIZE);
  for (const key of toRemove) {
    delete data.entries[key];
  }
}

export function flushCache(): void {
  if (!dirty || !cache) return;
  try {
    const dir = dirname(CACHE_PATH);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const tmp = join(dir, `.cache.${process.pid}.tmp`);
    writeFileSync(tmp, JSON.stringify(cache), "utf-8");
    renameSync(tmp, CACHE_PATH);
  } catch {
    // Non-critical — cache write failure is acceptable
  }
  dirty = false;
}

/** Reset internal state (for testing). */
export function resetCache(): void {
  cache = null;
  dirty = false;
}
