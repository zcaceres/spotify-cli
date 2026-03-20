import { describe, expect, test } from "bun:test";
import { fixtures } from "./test/fixtures/index.js";
import {
  formatAlbum,
  formatAlbumRemove,
  formatAlbumSave,
  formatAlbumTracks,
  formatAudioFeatures,
  formatAuthStatus,
  formatCommandHelp,
  formatDevices,
  formatFollow,
  formatFollowing,
  formatHelp,
  formatLogin,
  formatLogout,
  formatMe,
  formatNext,
  formatNow,
  formatPause,
  formatPlay,
  formatPlaylist,
  formatPlaylistAdd,
  formatPlaylistCreate,
  formatPlaylistRemove,
  formatPlaylistTracks,
  formatPlaylists,
  formatPrev,
  formatQueue,
  formatQueueAdd,
  formatRecent,
  formatRecommendations,
  formatRepeat,
  formatSavedAlbums,
  formatSavedTracks,
  formatSearch,
  formatSeek,
  formatShuffle,
  formatTop,
  formatTrack,
  formatTrackRemove,
  formatTrackSave,
  formatTransfer,
  formatUnfollow,
  formatVersion,
  formatVolume,
} from "./formatters.js";

// ── Player ──

describe("formatNow", () => {
  test("formats currently playing track", () => {
    expect(formatNow(fixtures.currentlyPlaying)).toBe("Now playing: Thunderstruck - AC/DC");
  });

  test("shows not playing when status is not_playing", () => {
    expect(formatNow({ status: "not_playing" })).toBe("Not playing");
  });

  test("shows not playing for null", () => {
    expect(formatNow(null)).toBe("Not playing");
  });

  test("shows not playing when item is missing", () => {
    expect(formatNow({ is_playing: false })).toBe("Not playing");
  });
});

describe("formatPlay", () => {
  test("formats playing status", () => {
    expect(formatPlay({ status: "playing" })).toBe("Playing");
  });
});

describe("formatPause", () => {
  test("returns paused", () => {
    expect(formatPause()).toBe("Paused");
  });
});

describe("formatNext", () => {
  test("returns skipped to next", () => {
    expect(formatNext()).toBe("Skipped to next");
  });
});

describe("formatPrev", () => {
  test("returns skipped to previous", () => {
    expect(formatPrev()).toBe("Skipped to previous");
  });
});

describe("formatSeek", () => {
  test("formats seek position", () => {
    expect(formatSeek({ status: "seeked", position_ms: 45000 })).toBe("Seeked to 45000ms");
  });
});

describe("formatVolume", () => {
  test("formats volume level", () => {
    expect(formatVolume({ status: "volume_set", volume: 75 })).toBe("Volume set to 75");
  });
});

describe("formatShuffle", () => {
  test("formats shuffle on", () => {
    expect(formatShuffle({ status: "shuffle_set", shuffle: true })).toBe("Shuffle on");
  });

  test("formats shuffle off", () => {
    expect(formatShuffle({ status: "shuffle_set", shuffle: false })).toBe("Shuffle off");
  });
});

describe("formatRepeat", () => {
  test("formats repeat off", () => {
    expect(formatRepeat({ status: "repeat_set", repeat: "off" })).toBe("Repeat off");
  });

  test("formats repeat track", () => {
    expect(formatRepeat({ status: "repeat_set", repeat: "track" })).toBe("Repeat track");
  });

  test("formats repeat context", () => {
    expect(formatRepeat({ status: "repeat_set", repeat: "context" })).toBe("Repeat context");
  });
});

describe("formatQueue", () => {
  test("shows empty queue", () => {
    expect(formatQueue(fixtures.queue)).toBe("Queue is empty");
  });

  test("shows currently playing and queue items", () => {
    const data = {
      currently_playing: { name: "Song A", artists: [{ name: "Artist A" }] },
      queue: [
        { name: "Song B", artists: [{ name: "Artist B" }] },
        { name: "Song C", artists: [{ name: "Artist C" }] },
      ],
    };
    const result = formatQueue(data);
    expect(result).toContain("Now playing: Song A - Artist A");
    expect(result).toContain("Queue:");
    expect(result).toContain("1. Song B - Artist B");
    expect(result).toContain("2. Song C - Artist C");
  });

  test("handles null data", () => {
    expect(formatQueue(null)).toBe("(empty queue)");
  });
});

describe("formatQueueAdd", () => {
  test("formats with resolved items", () => {
    const data = {
      status: "added_to_queue",
      uri: "spotify:track:abc",
      items: [{ name: "Thunderstruck", artists: [{ name: "AC/DC" }] }],
    };
    expect(formatQueueAdd(data)).toBe("Added to queue: Thunderstruck - AC/DC");
  });

  test("falls back to URI when no items", () => {
    const data = { status: "added_to_queue", uri: "spotify:track:abc" };
    expect(formatQueueAdd(data)).toBe("Added to queue: spotify:track:abc");
  });
});

describe("formatDevices", () => {
  test("formats device list", () => {
    const result = formatDevices(fixtures.devices);
    expect(result).toBe("1. Test MacBook (Computer)");
  });

  test("marks active device", () => {
    const data = {
      devices: [{ name: "Speaker", type: "Speaker", is_active: true }],
    };
    expect(formatDevices(data)).toBe("1. Speaker (Speaker) [active]");
  });

  test("handles no devices", () => {
    expect(formatDevices({ devices: [] })).toBe("No devices");
  });
});

describe("formatTransfer", () => {
  test("formats transfer", () => {
    expect(formatTransfer({ status: "transferred", device_id: "dev123" })).toBe(
      "Transferred playback to dev123",
    );
  });
});

describe("formatRecent", () => {
  test("formats recently played tracks", () => {
    const result = formatRecent(fixtures.recentlyPlayed);
    expect(result).toBe("1. Never Gonna Give You Up - Rick Astley");
  });

  test("handles empty recent", () => {
    expect(formatRecent({ items: [] })).toBe("No recent tracks");
  });
});

// ── Search ──

describe("formatSearch", () => {
  test("formats search results with tracks", () => {
    const result = formatSearch(fixtures.searchTracks);
    expect(result).toContain("Tracks:");
    expect(result).toContain("1. Thunderstruck - AC/DC (track)");
  });

  test("handles no results", () => {
    expect(formatSearch({ tracks: { items: [] } })).toBe("No results");
  });

  test("handles null data", () => {
    expect(formatSearch(null)).toBe("No results");
  });

  test("formats multiple result types", () => {
    const data = {
      tracks: { items: [{ name: "Song", artists: [{ name: "Artist" }], type: "track" }] },
      albums: { items: [{ name: "Album", artists: [{ name: "Artist" }], type: "album" }] },
    };
    const result = formatSearch(data);
    expect(result).toContain("Tracks:");
    expect(result).toContain("Albums:");
  });
});

// ── Albums ──

describe("formatAlbum", () => {
  test("formats album details", () => {
    const result = formatAlbum(fixtures.album);
    expect(result).toBe("Album: The Razors Edge by AC/DC (1990)\n12 tracks");
  });

  test("handles album without release date", () => {
    const result = formatAlbum({ name: "Test", artists: [{ name: "Art" }] });
    expect(result).toBe("Album: Test by Art");
  });
});

describe("formatAlbumTracks", () => {
  test("formats album track list", () => {
    const result = formatAlbumTracks(fixtures.albumTracks);
    expect(result).toContain("1. Thunderstruck - AC/DC");
    expect(result).toContain("2. Fire Your Guns - AC/DC");
  });

  test("handles empty tracks", () => {
    expect(formatAlbumTracks({ items: [] })).toBe("No tracks");
  });
});

describe("formatSavedAlbums", () => {
  test("handles empty saved albums", () => {
    expect(formatSavedAlbums({ items: [] })).toBe("No saved albums");
  });

  test("formats saved album entries", () => {
    const data = {
      items: [{ album: { name: "The Razors Edge", artists: [{ name: "AC/DC" }] } }],
    };
    expect(formatSavedAlbums(data)).toBe("1. The Razors Edge - AC/DC");
  });
});

describe("formatAlbumSave", () => {
  test("formats with item names", () => {
    const data = { status: "saved", ids: ["id1"], items: [{ name: "Album", artists: [{ name: "Artist" }] }] };
    expect(formatAlbumSave(data)).toBe("Saved: Album - Artist");
  });

  test("falls back to IDs", () => {
    const data = { status: "saved", ids: ["id1", "id2"] };
    expect(formatAlbumSave(data)).toBe("Saved: id1, id2");
  });
});

describe("formatAlbumRemove", () => {
  test("formats removal", () => {
    const data = { status: "removed", ids: ["id1"] };
    expect(formatAlbumRemove(data)).toBe("Removed: id1");
  });
});

// ── Tracks ──

describe("formatTrack", () => {
  test("formats track details", () => {
    expect(formatTrack(fixtures.track)).toBe("Track: Thunderstruck - AC/DC");
  });
});

describe("formatSavedTracks", () => {
  test("formats saved tracks list", () => {
    const result = formatSavedTracks(fixtures.savedTracks);
    expect(result).toBe("1. A Buena Vista - Soneros De Verdad, Luis Frank");
  });

  test("handles empty saved tracks", () => {
    expect(formatSavedTracks({ items: [] })).toBe("No saved tracks");
  });
});

describe("formatTrackSave", () => {
  test("formats with items", () => {
    const data = { status: "saved", ids: ["id1"], items: [{ name: "Song", artists: [{ name: "Art" }] }] };
    expect(formatTrackSave(data)).toBe("Saved: Song - Art");
  });
});

describe("formatTrackRemove", () => {
  test("formats removal with IDs", () => {
    const data = { status: "removed", ids: ["abc", "def"] };
    expect(formatTrackRemove(data)).toBe("Removed: abc, def");
  });
});

describe("formatAudioFeatures", () => {
  test("formats audio features", () => {
    const data = { danceability: 0.8, energy: 0.9, tempo: 120, valence: 0.5 };
    const result = formatAudioFeatures(data);
    expect(result).toContain("danceability: 0.8");
    expect(result).toContain("energy: 0.9");
    expect(result).toContain("tempo: 120");
    expect(result).toContain("valence: 0.5");
  });
});

describe("formatRecommendations", () => {
  test("formats recommendation list", () => {
    const data = {
      tracks: [
        { name: "Song A", artists: [{ name: "Art A" }] },
        { name: "Song B", artists: [{ name: "Art B" }] },
      ],
    };
    const result = formatRecommendations(data);
    expect(result).toBe("1. Song A - Art A\n2. Song B - Art B");
  });

  test("handles empty recommendations", () => {
    expect(formatRecommendations({ tracks: [] })).toBe("No recommendations");
  });
});

// ── Playlists ──

describe("formatPlaylist", () => {
  test("formats playlist details", () => {
    const result = formatPlaylist(fixtures.playlistCreated);
    expect(result).toContain("Playlist: Test Playlist by testuser");
    expect(result).toContain("0 tracks");
  });
});

describe("formatPlaylists", () => {
  test("formats playlist list", () => {
    const result = formatPlaylists(fixtures.playlists);
    expect(result).toBe("1. Test Playlist");
  });

  test("handles empty playlists", () => {
    expect(formatPlaylists({ items: [] })).toBe("No playlists");
  });
});

describe("formatPlaylistTracks", () => {
  test("formats playlist track list", () => {
    const result = formatPlaylistTracks(fixtures.playlistTracks);
    expect(result).toBe("1. Thunderstruck - AC/DC");
  });
});

describe("formatPlaylistAdd", () => {
  test("formats with items", () => {
    const data = { ids: ["id1"], items: [{ name: "Song", artists: [{ name: "Art" }] }] };
    expect(formatPlaylistAdd(data)).toBe("Added to playlist: Song - Art");
  });
});

describe("formatPlaylistRemove", () => {
  test("formats removal", () => {
    const data = { ids: ["id1", "id2"] };
    expect(formatPlaylistRemove(data)).toBe("Removed from playlist: id1, id2");
  });
});

describe("formatPlaylistCreate", () => {
  test("formats created playlist", () => {
    expect(formatPlaylistCreate(fixtures.playlistCreated)).toBe("Created playlist: Test Playlist");
  });
});

// ── User ──

describe("formatMe", () => {
  test("formats user profile", () => {
    expect(formatMe(fixtures.me)).toBe("testuser (46 followers)");
  });
});

describe("formatTop", () => {
  test("formats top tracks", () => {
    const result = formatTop(fixtures.topTracks);
    expect(result).toBe("1. Texas - BigXthaPlug");
  });

  test("formats top artists (no artists field)", () => {
    const data = { items: [{ name: "AC/DC" }, { name: "Rick Astley" }] };
    const result = formatTop(data);
    expect(result).toBe("1. AC/DC\n2. Rick Astley");
  });

  test("handles empty results", () => {
    expect(formatTop({ items: [] })).toBe("No results");
  });
});

describe("formatFollowing", () => {
  test("formats followed artists", () => {
    const result = formatFollowing(fixtures.followedArtists);
    expect(result).toBe("1. Ruben Gonzalez");
  });

  test("handles no followed artists", () => {
    expect(formatFollowing({ artists: { items: [] } })).toBe("No followed artists");
  });
});

describe("formatFollow", () => {
  test("formats follow with items", () => {
    const data = { status: "followed", ids: ["id1"], items: [{ name: "AC/DC" }] };
    expect(formatFollow(data)).toBe("Followed: AC/DC");
  });
});

describe("formatUnfollow", () => {
  test("formats unfollow with IDs", () => {
    const data = { status: "unfollowed", ids: ["id1"] };
    expect(formatUnfollow(data)).toBe("Unfollowed: id1");
  });
});

// ── Auth ──

describe("formatLogin", () => {
  test("formats logged in", () => {
    expect(formatLogin({ status: "logged_in", expires_at: 123, scope: "user-read" })).toBe("Logged in");
  });
});

describe("formatLogout", () => {
  test("returns logged out", () => {
    expect(formatLogout()).toBe("Logged out");
  });
});

describe("formatAuthStatus", () => {
  test("formats valid status", () => {
    expect(formatAuthStatus({ status: "valid", expires_at: 123 })).toBe("Logged in (valid)");
  });

  test("formats expired status", () => {
    expect(formatAuthStatus({ status: "expired" })).toBe("Session expired");
  });

  test("formats not logged in", () => {
    expect(formatAuthStatus({ status: "not_logged_in" })).toBe("Not logged in");
  });
});

// ── Help / Version ──

describe("formatVersion", () => {
  test("formats version from data", () => {
    expect(formatVersion({ version: "1.2.3" })).toBe("spotify-cli v1.2.3");
  });
});

describe("formatHelp", () => {
  test("formats help with commands", () => {
    const data = {
      usage: "spotify <command> [args]",
      commands: { play: "Start playback", pause: "Pause playback" },
    };
    const result = formatHelp(data);
    expect(result).toContain("Usage: spotify <command> [args]");
    expect(result).toContain("Commands:");
    expect(result).toContain("play");
    expect(result).toContain("Start playback");
    expect(result).toContain("pause");
    expect(result).toContain("Pause playback");
  });
});

describe("formatCommandHelp", () => {
  test("formats command help with subcommands", () => {
    const data = {
      command: "playlist",
      description: "Playlist operations",
      usage: "spotify playlist <subcommand>",
      subcommands: { create: "Create a playlist", list: "List playlists" },
    };
    const result = formatCommandHelp(data);
    expect(result).toContain("playlist");
    expect(result).toContain("Playlist operations");
    expect(result).toContain("Usage: spotify playlist <subcommand>");
    expect(result).toContain("create - Create a playlist");
    expect(result).toContain("list - List playlists");
  });
});
