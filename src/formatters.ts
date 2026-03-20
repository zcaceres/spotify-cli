/**
 * Per-command text formatters for `--text` output mode.
 *
 * Each formatter receives the data object that `output()` would normally
 * JSON-serialize and returns a human-readable string.
 *
 * @module
 */

import { VERSION } from "./config.js";

// ── Helpers ──

/** @internal Shorthand for a loosely-typed record. */
type Rec = Record<string, unknown>;

/**
 * Coerces a value to a display string, treating `null`/`undefined` as `""`.
 * @param v - Any value.
 */
function str(v: unknown): string {
  return v == null ? "" : String(v);
}

/**
 * Formats an array of Spotify artist objects (or a scalar) as comma-separated names.
 * @param artists - The `artists` field from a Spotify API response.
 */
function artistNames(artists: unknown): string {
  if (!Array.isArray(artists)) return str(artists);
  return artists.map((a) => (typeof a === "object" && a !== null ? str((a as Rec).name) : str(a))).join(", ");
}

/**
 * Formats a track-like object as `"Name - Artist1, Artist2"`.
 * @param item - A Spotify track (or similar) object.
 */
function trackLine(item: unknown): string {
  if (typeof item !== "object" || item === null) return str(item);
  const t = item as Rec;
  const name = str(t.name);
  const artists = t.artists ? artistNames(t.artists) : "";
  return artists ? `${name} - ${artists}` : name;
}

/**
 * Renders an array as a 1-indexed numbered list.
 * @param items - Items to list.
 * @param formatter - Converts each item to a display string.
 */
function numberedList(items: unknown[], formatter: (item: unknown) => string): string {
  return items.map((item, i) => `${i + 1}. ${formatter(item)}`).join("\n");
}

/**
 * Produces a summary line for save/remove/follow operations.
 * Prefers resolved item names; falls back to raw IDs.
 * @param data - The output data object.
 * @param verb - Action label (e.g. `"Saved"`, `"Removed"`).
 */
function itemsSummary(data: Rec, verb: string): string {
  const items = data.items as unknown[] | undefined;
  if (items && Array.isArray(items) && items.length > 0) {
    return `${verb}: ${items.map((i) => trackLine(i)).join(", ")}`;
  }
  const ids = data.ids as string[] | undefined;
  if (ids && Array.isArray(ids)) {
    return `${verb}: ${ids.join(", ")}`;
  }
  return verb;
}

// ── Player ──

/** Formats `spotify now` — shows currently playing track or "Not playing". */
export function formatNow(data: unknown): string {
  if (typeof data !== "object" || data === null) return "Not playing";
  const d = data as Rec;
  if (d.status === "not_playing") return "Not playing";
  const item = d.item as Rec | undefined;
  if (!item) return "Not playing";
  return `Now playing: ${trackLine(item)}`;
}

export function formatPlay(data: unknown): string {
  if (typeof data === "object" && data !== null && (data as Rec).status === "playing") return "Playing";
  return str(data);
}

export function formatPause(): string {
  return "Paused";
}

export function formatNext(): string {
  return "Skipped to next";
}

export function formatPrev(): string {
  return "Skipped to previous";
}

export function formatSeek(data: unknown): string {
  const d = data as Rec;
  return `Seeked to ${d.position_ms}ms`;
}

export function formatVolume(data: unknown): string {
  const d = data as Rec;
  return `Volume set to ${d.volume}`;
}

export function formatShuffle(data: unknown): string {
  const d = data as Rec;
  return `Shuffle ${d.shuffle ? "on" : "off"}`;
}

export function formatRepeat(data: unknown): string {
  const d = data as Rec;
  return `Repeat ${d.repeat}`;
}

export function formatQueue(data: unknown): string {
  if (typeof data !== "object" || data === null) return "(empty queue)";
  const d = data as Rec;
  const currently = d.currently_playing;
  const queue = d.queue as unknown[] | undefined;
  const lines: string[] = [];
  if (currently) lines.push(`Now playing: ${trackLine(currently)}`);
  if (queue && queue.length > 0) {
    lines.push("Queue:");
    lines.push(numberedList(queue, trackLine));
  } else {
    lines.push("Queue is empty");
  }
  return lines.join("\n");
}

export function formatQueueAdd(data: unknown): string {
  const d = data as Rec;
  const items = d.items as unknown[] | undefined;
  if (items && items.length > 0) {
    return `Added to queue: ${trackLine(items[0])}`;
  }
  return `Added to queue: ${d.uri}`;
}

export function formatDevices(data: unknown): string {
  if (typeof data !== "object" || data === null) return "No devices";
  const d = data as Rec;
  const devices = (d.devices ?? d) as unknown[];
  if (!Array.isArray(devices) || devices.length === 0) return "No devices";
  return numberedList(devices, (dev) => {
    const d = dev as Rec;
    const active = d.is_active ? " [active]" : "";
    return `${d.name} (${d.type})${active}`;
  });
}

export function formatTransfer(data: unknown): string {
  const d = data as Rec;
  return `Transferred playback to ${d.device_id}`;
}

export function formatRecent(data: unknown): string {
  if (typeof data !== "object" || data === null) return "No recent tracks";
  const d = data as Rec;
  const items = d.items as unknown[] | undefined;
  if (!items || items.length === 0) return "No recent tracks";
  return numberedList(items, (item) => {
    const i = item as Rec;
    const track = i.track ?? i;
    return trackLine(track);
  });
}

// ── Search ──

export function formatSearch(data: unknown): string {
  if (typeof data !== "object" || data === null) return "No results";
  const d = data as Rec;
  const sections: string[] = [];
  for (const key of ["tracks", "albums", "artists", "playlists", "shows", "episodes"]) {
    const section = d[key] as Rec | undefined;
    if (!section) continue;
    const items = section.items as unknown[] | undefined;
    if (!items || items.length === 0) continue;
    const label = key.charAt(0).toUpperCase() + key.slice(1);
    sections.push(`${label}:`);
    sections.push(
      numberedList(items, (item) => {
        const i = item as Rec;
        const name = str(i.name);
        const artists = i.artists ? ` - ${artistNames(i.artists)}` : "";
        const type = i.type ? ` (${i.type})` : "";
        return `${name}${artists}${type}`;
      }),
    );
  }
  return sections.length > 0 ? sections.join("\n") : "No results";
}

// ── Albums ──

export function formatAlbum(data: unknown): string {
  if (typeof data !== "object" || data === null) return str(data);
  const d = data as Rec;
  const name = str(d.name);
  const artists = d.artists ? artistNames(d.artists) : "";
  const year = d.release_date ? str(d.release_date).slice(0, 4) : "";
  const total = d.total_tracks ? `${d.total_tracks} tracks` : "";
  const parts = [`Album: ${name}`];
  if (artists) parts[0] += ` by ${artists}`;
  if (year) parts[0] += ` (${year})`;
  if (total) parts.push(total);
  return parts.join("\n");
}

export function formatAlbumTracks(data: unknown): string {
  if (typeof data !== "object" || data === null) return "No tracks";
  const d = data as Rec;
  const items = d.items as unknown[] | undefined;
  if (!items || items.length === 0) return "No tracks";
  return numberedList(items, trackLine);
}

export function formatSavedAlbums(data: unknown): string {
  if (typeof data !== "object" || data === null) return "No saved albums";
  const d = data as Rec;
  const items = d.items as unknown[] | undefined;
  if (!items || items.length === 0) return "No saved albums";
  return numberedList(items, (item) => {
    const i = item as Rec;
    const album = (i.album ?? i) as Rec;
    const name = str(album.name);
    const artists = album.artists ? artistNames(album.artists) : "";
    return artists ? `${name} - ${artists}` : name;
  });
}

export function formatAlbumSave(data: unknown): string {
  return itemsSummary(data as Rec, "Saved");
}

export function formatAlbumRemove(data: unknown): string {
  return itemsSummary(data as Rec, "Removed");
}

// ── Tracks ──

export function formatTrack(data: unknown): string {
  if (typeof data !== "object" || data === null) return str(data);
  const d = data as Rec;
  return `Track: ${trackLine(d)}`;
}

export function formatSavedTracks(data: unknown): string {
  if (typeof data !== "object" || data === null) return "No saved tracks";
  const d = data as Rec;
  const items = d.items as unknown[] | undefined;
  if (!items || items.length === 0) return "No saved tracks";
  return numberedList(items, (item) => {
    const i = item as Rec;
    const track = (i.track ?? i) as Rec;
    return trackLine(track);
  });
}

export function formatTrackSave(data: unknown): string {
  return itemsSummary(data as Rec, "Saved");
}

export function formatTrackRemove(data: unknown): string {
  return itemsSummary(data as Rec, "Removed");
}

export function formatAudioFeatures(data: unknown): string {
  if (typeof data !== "object" || data === null) return str(data);
  const d = data as Rec;
  const keys = [
    "danceability",
    "energy",
    "tempo",
    "valence",
    "acousticness",
    "instrumentalness",
    "liveness",
    "speechiness",
    "loudness",
    "key",
    "mode",
    "time_signature",
  ];
  const lines: string[] = [];
  for (const k of keys) {
    if (k in d) lines.push(`${k}: ${d[k]}`);
  }
  return lines.length > 0 ? lines.join("\n") : str(data);
}

export function formatRecommendations(data: unknown): string {
  if (typeof data !== "object" || data === null) return "No recommendations";
  const d = data as Rec;
  const tracks = d.tracks as unknown[] | undefined;
  if (!tracks || tracks.length === 0) return "No recommendations";
  return numberedList(tracks, trackLine);
}

// ── Playlists ──

export function formatPlaylist(data: unknown): string {
  if (typeof data !== "object" || data === null) return str(data);
  const d = data as Rec;
  const name = str(d.name);
  const owner = d.owner ? str((d.owner as Rec).display_name ?? (d.owner as Rec).id) : "";
  const total = d.tracks ? str((d.tracks as Rec).total) : "";
  const parts = [`Playlist: ${name}`];
  if (owner) parts[0] += ` by ${owner}`;
  if (total) parts.push(`${total} tracks`);
  return parts.join("\n");
}

export function formatPlaylists(data: unknown): string {
  if (typeof data !== "object" || data === null) return "No playlists";
  const d = data as Rec;
  const items = d.items as unknown[] | undefined;
  if (!items || items.length === 0) return "No playlists";
  return numberedList(items, (item) => {
    const i = item as Rec;
    return str(i.name);
  });
}

export function formatPlaylistTracks(data: unknown): string {
  if (typeof data !== "object" || data === null) return "No tracks";
  const d = data as Rec;
  const items = d.items as unknown[] | undefined;
  if (!items || items.length === 0) return "No tracks";
  return numberedList(items, (item) => {
    const i = item as Rec;
    const track = (i.track ?? i.item ?? i) as Rec;
    return trackLine(track);
  });
}

export function formatPlaylistAdd(data: unknown): string {
  return itemsSummary(data as Rec, "Added to playlist");
}

export function formatPlaylistRemove(data: unknown): string {
  return itemsSummary(data as Rec, "Removed from playlist");
}

export function formatPlaylistCreate(data: unknown): string {
  if (typeof data !== "object" || data === null) return "Playlist created";
  const d = data as Rec;
  return `Created playlist: ${d.name}`;
}

// ── User ──

export function formatMe(data: unknown): string {
  if (typeof data !== "object" || data === null) return str(data);
  const d = data as Rec;
  const name = str(d.display_name ?? d.id);
  const followers = d.followers ? ` (${(d.followers as Rec).total} followers)` : "";
  return `${name}${followers}`;
}

export function formatTop(data: unknown): string {
  if (typeof data !== "object" || data === null) return "No results";
  const d = data as Rec;
  const items = d.items as unknown[] | undefined;
  if (!items || items.length === 0) return "No results";
  return numberedList(items, (item) => {
    const i = item as Rec;
    if (i.artists) return trackLine(i);
    return str(i.name);
  });
}

export function formatFollowing(data: unknown): string {
  if (typeof data !== "object" || data === null) return "No followed artists";
  const d = data as Rec;
  const artists = d.artists as Rec | undefined;
  const items = (artists?.items ?? d.items) as unknown[] | undefined;
  if (!items || items.length === 0) return "No followed artists";
  return numberedList(items, (item) => str((item as Rec).name));
}

export function formatFollow(data: unknown): string {
  return itemsSummary(data as Rec, "Followed");
}

export function formatUnfollow(data: unknown): string {
  return itemsSummary(data as Rec, "Unfollowed");
}

// ── Auth ──

export function formatLogin(data: unknown): string {
  if (typeof data === "object" && data !== null && (data as Rec).status === "logged_in") return "Logged in";
  return str(data);
}

export function formatLogout(): string {
  return "Logged out";
}

export function formatAuthStatus(data: unknown): string {
  if (typeof data !== "object" || data === null) return "Not logged in";
  const d = data as Rec;
  if (d.status === "not_logged_in") return "Not logged in";
  if (d.status === "expired") return "Session expired";
  return `Logged in (${d.status})`;
}

// ── Help / Version ──

export function formatHelp(data: unknown): string {
  if (typeof data !== "object" || data === null) return str(data);
  const d = data as Rec;
  const lines: string[] = [];
  if (d.usage) lines.push(`Usage: ${d.usage}`);
  const cmds = d.commands as Rec | undefined;
  if (cmds) {
    lines.push("");
    lines.push("Commands:");
    const entries = Object.entries(cmds);
    const maxLen = Math.max(...entries.map(([k]) => k.length));
    for (const [name, desc] of entries) {
      lines.push(`  ${name.padEnd(maxLen + 2)}${desc}`);
    }
  }
  return lines.join("\n");
}

export function formatVersion(data: unknown): string {
  if (typeof data === "object" && data !== null && (data as Rec).version) {
    return `spotify-cli v${(data as Rec).version}`;
  }
  return `spotify-cli v${VERSION}`;
}

export function formatCommandHelp(data: unknown): string {
  if (typeof data !== "object" || data === null) return str(data);
  const d = data as Rec;
  const lines: string[] = [];
  if (d.command) lines.push(str(d.command));
  if (d.description) lines.push(`  ${d.description}`);
  if (d.usage) lines.push(`  Usage: ${d.usage}`);
  const subs = d.subcommands as Rec | undefined;
  if (subs) {
    lines.push("  Subcommands:");
    for (const [name, desc] of Object.entries(subs)) {
      lines.push(`    ${name} - ${desc}`);
    }
  }
  return lines.join("\n");
}
