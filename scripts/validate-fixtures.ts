import { z } from "zod";
import { PlaybackStateSchema, CurrentlyPlayingSchema, DevicesSchema, QueueSchema, PlayHistorySchema } from "../src/schemas/player.js";
import { TrackSchema, SavedTrackSchema } from "../src/schemas/track.js";
import { AlbumSchema, SimplifiedAlbumSchema, SavedAlbumSchema } from "../src/schemas/album.js";
import { ArtistSchema } from "../src/schemas/artist.js";
import { PlaylistSchema, SimplifiedPlaylistSchema, PlaylistItemSchema } from "../src/schemas/playlist.js";
import { UserProfileSchema } from "../src/schemas/user.js";
import { SearchResponseSchema } from "../src/schemas/search.js";
import { PagingSchema, CursorPagingSchema } from "../src/schemas/common.js";

const results: { fixture: string; status: string; errors?: unknown }[] = [];

async function validate(name: string, schema: z.ZodTypeAny, file: string) {
  try {
    const data = await Bun.file(`fixtures/${file}`).json();
    const result = schema.safeParse(data);
    if (result.success) {
      results.push({ fixture: name, status: "PASS" });
    } else {
      results.push({ fixture: name, status: "FAIL", errors: result.error.issues });
    }
  } catch (e) {
    results.push({ fixture: name, status: "ERROR", errors: String(e) });
  }
}

// Auth & User
await validate("me", UserProfileSchema, "me.json");

// Player
await validate("now", CurrentlyPlayingSchema, "now.json");
await validate("devices", DevicesSchema, "devices.json");
await validate("queue", QueueSchema, "queue.json");
await validate("recent", CursorPagingSchema(PlayHistorySchema), "recent.json");

// Search
await validate("search-tracks", SearchResponseSchema, "search-tracks.json");
await validate("search-artists", SearchResponseSchema, "search-artists.json");
await validate("search-albums", SearchResponseSchema, "search-albums.json");
await validate("search-playlists", SearchResponseSchema, "search-playlists.json");

// Tracks
await validate("track", TrackSchema, "track.json");
await validate("saved-tracks", PagingSchema(SavedTrackSchema), "saved-tracks.json");

// Albums
await validate("album", AlbumSchema, "album.json");
await validate("album-tracks", PagingSchema(z.any()), "album-tracks.json");
await validate("saved-albums", PagingSchema(SavedAlbumSchema), "saved-albums.json");

// Playlists
await validate("playlists", PagingSchema(SimplifiedPlaylistSchema), "playlists.json");
await validate("playlist", PlaylistSchema, "playlist.json");
await validate("playlist-tracks", PagingSchema(PlaylistItemSchema), "playlist-tracks.json");

// User
await validate("top-artists", PagingSchema(ArtistSchema), "top-artists.json");
await validate("top-tracks", PagingSchema(TrackSchema), "top-tracks.json");
await validate("following", z.object({ artists: CursorPagingSchema(ArtistSchema) }), "following.json");

// Report
console.log("\n=== FIXTURE VALIDATION REPORT ===\n");
const passed = results.filter(r => r.status === "PASS");
const failed = results.filter(r => r.status === "FAIL");
const errored = results.filter(r => r.status === "ERROR");

for (const r of results) {
  const icon = r.status === "PASS" ? "OK" : r.status === "FAIL" ? "FAIL" : "ERR";
  console.log(`  [${icon}] ${r.fixture}`);
}

console.log(`\n${passed.length} passed, ${failed.length} failed, ${errored.length} errors\n`);

if (failed.length > 0) {
  console.log("=== FAILURES ===\n");
  for (const r of failed) {
    console.log(`--- ${r.fixture} ---`);
    console.log(JSON.stringify(r.errors, null, 2));
    console.log();
  }
}
