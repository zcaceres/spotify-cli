import { beforeEach, describe, expect, mock, test } from "bun:test";
import { fixtures } from "../test/fixtures/index.js";
import type { ParsedArgs } from "./index.js";

// Mock the API module before importing the commands
const mockGetPlaylist = mock(() => Promise.resolve(fixtures.playlists.items[0]));
const mockGetCurrentUserPlaylists = mock(() => Promise.resolve(fixtures.playlists));
const mockGetPlaylistTracks = mock(() =>
  Promise.resolve({
    items: [] as Array<{ item: { name: string; uri: string; artists: Array<{ name: string }> } | null }>,
    total: 0,
  }),
);
const mockAddTracksToPlaylist = mock(() => Promise.resolve(fixtures.snapshotId));
const mockRemoveTracksFromPlaylist = mock((_id: string, _uris: string[]) => Promise.resolve(fixtures.snapshotId));
const mockCreatePlaylist = mock(() => Promise.resolve(fixtures.playlistCreated));

mock.module("../api/playlists.js", () => ({
  getPlaylist: mockGetPlaylist,
  getCurrentUserPlaylists: mockGetCurrentUserPlaylists,
  getPlaylistTracks: mockGetPlaylistTracks,
  addTracksToPlaylist: mockAddTracksToPlaylist,
  removeTracksFromPlaylist: mockRemoveTracksFromPlaylist,
  createPlaylist: mockCreatePlaylist,
}));

let captured: unknown;
mock.module("../output.js", () => ({
  output: (data: unknown) => {
    captured = data;
  },
}));

const {
  playlistCommand,
  playlistsCommand,
  playlistTracksCommand,
  playlistAddCommand,
  playlistRemoveCommand,
  playlistCreateCommand,
} = await import("./playlists.js");

function args(
  positional: string[] = [],
  flags: Record<string, string> = {},
  multiFlags: Record<string, string[]> = {},
): ParsedArgs {
  return { positional, flags, multiFlags };
}

function makeFakePlaylistResponse(tracks: Array<{ name: string; uri: string; artists: string[] }>) {
  return {
    items: tracks.map((t) => ({
      item: {
        name: t.name,
        uri: t.uri,
        artists: t.artists.map((a) => ({ name: a })),
      },
    })),
    total: tracks.length,
  };
}

const PLAYLIST_ID = "playlist123";
const SAMPLE_TRACKS = [
  { name: "Danger Zone", uri: "spotify:track:aaa", artists: ["Kenny Loggins"] },
  { name: "Thunderstruck", uri: "spotify:track:bbb", artists: ["AC/DC"] },
  { name: "Hotel California", uri: "spotify:track:ccc", artists: ["Eagles"] },
  { name: "Enter Sandman", uri: "spotify:track:ddd", artists: ["Metallica"] },
  { name: "Paint It Black", uri: "spotify:track:eee", artists: ["The Rolling Stones"] },
];

// --- playlist command ---

describe("playlist command", () => {
  beforeEach(() => {
    captured = undefined;
    mockGetPlaylist.mockClear();
  });

  test("outputs playlist data", async () => {
    await playlistCommand(args(["abc123"]));
    expect(mockGetPlaylist).toHaveBeenCalledWith("abc123");
    expect(captured).toEqual(fixtures.playlists.items[0]);
  });

  test("throws without id", async () => {
    await expect(playlistCommand(args())).rejects.toThrow(/Usage/);
  });
});

// --- playlists command ---

describe("playlists command", () => {
  beforeEach(() => {
    captured = undefined;
    mockGetCurrentUserPlaylists.mockClear();
  });

  test("lists playlists with defaults", async () => {
    await playlistsCommand(args());
    expect(mockGetCurrentUserPlaylists).toHaveBeenCalledWith({ limit: undefined, offset: undefined });
    expect(captured).toEqual(fixtures.playlists);
  });

  test("passes limit and offset", async () => {
    await playlistsCommand(args([], { limit: "5", offset: "10" }));
    expect(mockGetCurrentUserPlaylists).toHaveBeenCalledWith({ limit: 5, offset: 10 });
  });
});

// --- playlist-tracks command ---

describe("playlist-tracks command", () => {
  beforeEach(() => {
    captured = undefined;
    mockGetPlaylistTracks.mockClear();
  });

  test("lists tracks with pagination", async () => {
    mockGetPlaylistTracks.mockResolvedValue(structuredClone(fixtures.playlistTracks) as never);
    await playlistTracksCommand(args(["abc123"], { limit: "50", offset: "0" }));
    expect(mockGetPlaylistTracks).toHaveBeenCalledWith("abc123", { limit: 50, offset: 0 });
  });

  test("works with no flags", async () => {
    mockGetPlaylistTracks.mockResolvedValue(structuredClone(fixtures.playlistTracks) as never);
    await playlistTracksCommand(args(["abc123"]));
    expect(mockGetPlaylistTracks).toHaveBeenCalledWith("abc123", { limit: undefined, offset: undefined });
  });

  test("throws without id", async () => {
    await expect(playlistTracksCommand(args())).rejects.toThrow(/Usage/);
  });
});

// --- playlist-add command ---

describe("playlist-add command", () => {
  beforeEach(() => {
    captured = undefined;
    mockAddTracksToPlaylist.mockClear();
  });

  test("adds tracks to playlist", async () => {
    await playlistAddCommand(args(["abc123", "spotify:track:aaa", "spotify:track:bbb"]));
    expect(mockAddTracksToPlaylist).toHaveBeenCalledWith(
      "abc123",
      ["spotify:track:aaa", "spotify:track:bbb"],
      undefined,
    );
  });

  test("adds tracks with position", async () => {
    await playlistAddCommand(args(["abc123", "spotify:track:aaa"], { position: "3" }));
    expect(mockAddTracksToPlaylist).toHaveBeenCalledWith("abc123", ["spotify:track:aaa"], 3);
  });

  test("throws without playlist id", async () => {
    await expect(playlistAddCommand(args())).rejects.toThrow(/Usage/);
  });

  test("throws without uris", async () => {
    await expect(playlistAddCommand(args(["abc123"]))).rejects.toThrow(/Usage/);
  });
});

// --- playlist-create command ---

describe("playlist-create command", () => {
  beforeEach(() => {
    captured = undefined;
    mockCreatePlaylist.mockClear();
  });

  test("creates playlist with name only", async () => {
    await playlistCreateCommand(args(["My Playlist"]));
    expect(mockCreatePlaylist).toHaveBeenCalledWith({ name: "My Playlist" });
    expect(captured).toEqual(fixtures.playlistCreated);
  });

  test("creates playlist with description", async () => {
    await playlistCreateCommand(args(["My Playlist"], { description: "A great playlist" }));
    expect(mockCreatePlaylist).toHaveBeenCalledWith({
      name: "My Playlist",
      description: "A great playlist",
    });
  });

  test("creates playlist with --public flag", async () => {
    await playlistCreateCommand(args(["My Playlist"], { public: "" }));
    expect(mockCreatePlaylist).toHaveBeenCalledWith({
      name: "My Playlist",
      public: true,
    });
  });

  test("creates playlist with all options", async () => {
    await playlistCreateCommand(args(["My Playlist"], { description: "desc", public: "" }));
    expect(mockCreatePlaylist).toHaveBeenCalledWith({
      name: "My Playlist",
      description: "desc",
      public: true,
    });
  });

  test("throws without name", async () => {
    await expect(playlistCreateCommand(args())).rejects.toThrow(/Usage/);
  });
});

// --- playlist-remove command (existing tests) ---

describe("playlist-remove", () => {
  beforeEach(() => {
    mockGetPlaylistTracks.mockReset();
    mockRemoveTracksFromPlaylist.mockReset();
    mockRemoveTracksFromPlaylist.mockResolvedValue({ snapshot_id: "abc123" } as never);
    captured = undefined;
  });

  test("removes by direct URIs without fetching playlist", async () => {
    await playlistRemoveCommand(args([PLAYLIST_ID, "spotify:track:aaa", "spotify:track:bbb"]));
    expect(mockGetPlaylistTracks).not.toHaveBeenCalled();
    expect(mockRemoveTracksFromPlaylist).toHaveBeenCalledWith(
      PLAYLIST_ID,
      expect.arrayContaining(["spotify:track:aaa", "spotify:track:bbb"]),
    );
  });

  test("removes by --match (single)", async () => {
    mockGetPlaylistTracks.mockResolvedValue(makeFakePlaylistResponse(SAMPLE_TRACKS));
    await playlistRemoveCommand(args([PLAYLIST_ID], { match: "Hotel California" }, {}));
    expect(mockGetPlaylistTracks).toHaveBeenCalledWith(PLAYLIST_ID, { limit: 50, offset: 0 });
    expect(mockRemoveTracksFromPlaylist).toHaveBeenCalledWith(PLAYLIST_ID, ["spotify:track:ccc"]);
  });

  test("removes by --match (multiple via multiFlags)", async () => {
    mockGetPlaylistTracks.mockResolvedValue(makeFakePlaylistResponse(SAMPLE_TRACKS));
    await playlistRemoveCommand(args([PLAYLIST_ID], { match: "Sandman" }, { match: ["Hotel California", "Sandman"] }));
    const removedUris = mockRemoveTracksFromPlaylist.mock.calls[0]![1] as string[];
    expect(removedUris).toContain("spotify:track:ccc");
    expect(removedUris).toContain("spotify:track:ddd");
    expect(removedUris).toHaveLength(2);
  });

  test("--match is case-insensitive", async () => {
    mockGetPlaylistTracks.mockResolvedValue(makeFakePlaylistResponse(SAMPLE_TRACKS));
    await playlistRemoveCommand(args([PLAYLIST_ID], { match: "danger zone" }, {}));
    expect(mockRemoveTracksFromPlaylist).toHaveBeenCalledWith(PLAYLIST_ID, ["spotify:track:aaa"]);
  });

  test("--match searches artist names too", async () => {
    mockGetPlaylistTracks.mockResolvedValue(makeFakePlaylistResponse(SAMPLE_TRACKS));
    await playlistRemoveCommand(args([PLAYLIST_ID], { match: "Eagles" }, {}));
    expect(mockRemoveTracksFromPlaylist).toHaveBeenCalledWith(PLAYLIST_ID, ["spotify:track:ccc"]);
  });

  test("removes by --index (1-based)", async () => {
    mockGetPlaylistTracks.mockResolvedValue(makeFakePlaylistResponse(SAMPLE_TRACKS));
    await playlistRemoveCommand(args([PLAYLIST_ID], { index: "3" }, {}));
    expect(mockRemoveTracksFromPlaylist).toHaveBeenCalledWith(PLAYLIST_ID, ["spotify:track:ccc"]);
  });

  test("removes by --index with comma-separated values", async () => {
    mockGetPlaylistTracks.mockResolvedValue(makeFakePlaylistResponse(SAMPLE_TRACKS));
    await playlistRemoveCommand(args([PLAYLIST_ID], { index: "1,3,5" }, {}));
    const removedUris = mockRemoveTracksFromPlaylist.mock.calls[0]![1] as string[];
    expect(removedUris).toContain("spotify:track:aaa");
    expect(removedUris).toContain("spotify:track:ccc");
    expect(removedUris).toContain("spotify:track:eee");
    expect(removedUris).toHaveLength(3);
  });

  test("combines direct URIs with --match and --index", async () => {
    mockGetPlaylistTracks.mockResolvedValue(makeFakePlaylistResponse(SAMPLE_TRACKS));
    await playlistRemoveCommand(args([PLAYLIST_ID, "spotify:track:aaa"], { match: "Sandman", index: "3" }, {}));
    const removedUris = mockRemoveTracksFromPlaylist.mock.calls[0]![1] as string[];
    expect(removedUris).toContain("spotify:track:aaa");
    expect(removedUris).toContain("spotify:track:ccc");
    expect(removedUris).toContain("spotify:track:ddd");
    expect(removedUris).toHaveLength(3);
  });

  test("deduplicates URIs when match and direct URI overlap", async () => {
    mockGetPlaylistTracks.mockResolvedValue(makeFakePlaylistResponse(SAMPLE_TRACKS));
    await playlistRemoveCommand(args([PLAYLIST_ID, "spotify:track:ccc"], { match: "Hotel California" }, {}));
    const removedUris = mockRemoveTracksFromPlaylist.mock.calls[0]![1] as string[];
    expect(removedUris).toHaveLength(1);
    expect(removedUris).toContain("spotify:track:ccc");
  });

  test("throws when no URIs, --match, or --index provided", async () => {
    await expect(playlistRemoveCommand(args([PLAYLIST_ID]))).rejects.toThrow();
  });

  test("throws when no playlist ID provided", async () => {
    await expect(playlistRemoveCommand(args([]))).rejects.toThrow();
  });

  test("throws when --match finds nothing", async () => {
    mockGetPlaylistTracks.mockResolvedValue(makeFakePlaylistResponse(SAMPLE_TRACKS));
    await expect(playlistRemoveCommand(args([PLAYLIST_ID], { match: "Nonexistent Song" }, {}))).rejects.toThrow(
      /No tracks matching/,
    );
  });

  test("throws when --index is out of range", async () => {
    mockGetPlaylistTracks.mockResolvedValue(makeFakePlaylistResponse(SAMPLE_TRACKS));
    await expect(playlistRemoveCommand(args([PLAYLIST_ID], { index: "99" }, {}))).rejects.toThrow(/Invalid index/);
  });

  test("throws when --index is 0 (not 1-based)", async () => {
    mockGetPlaylistTracks.mockResolvedValue(makeFakePlaylistResponse(SAMPLE_TRACKS));
    await expect(playlistRemoveCommand(args([PLAYLIST_ID], { index: "0" }, {}))).rejects.toThrow(/Invalid index/);
  });
});
