import { describe, test, expect, mock, beforeEach } from "bun:test";
import type { ParsedArgs } from "./index.js";

// Mock the API module before importing the command
const mockGetPlaylistTracks = mock(() => Promise.resolve({ items: [] as Array<{ item: { name: string; uri: string; artists: Array<{ name: string }> } | null }>, total: 0 }));
const mockRemoveTracksFromPlaylist = mock((_id: string, _uris: string[]) => Promise.resolve({ snapshot_id: "abc123" }));

mock.module("../api/playlists.js", () => ({
  getPlaylistTracks: mockGetPlaylistTracks,
  removeTracksFromPlaylist: mockRemoveTracksFromPlaylist,
  getPlaylist: mock(),
  getCurrentUserPlaylists: mock(),
  addTracksToPlaylist: mock(),
  createPlaylist: mock(),
}));

// Capture output instead of writing to stdout
let lastOutput: unknown;
mock.module("../output.js", () => ({
  output: (data: unknown) => {
    lastOutput = data;
  },
}));

const { playlistRemoveCommand } = await import("./playlists.js");

function makeArgs(positional: string[], flags: Record<string, string> = {}, multiFlags: Record<string, string[]> = {}): ParsedArgs {
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

describe("playlist-remove", () => {
  beforeEach(() => {
    mockGetPlaylistTracks.mockReset();
    mockRemoveTracksFromPlaylist.mockReset();
    mockRemoveTracksFromPlaylist.mockResolvedValue({ snapshot_id: "abc123" });
    lastOutput = undefined;
  });

  test("removes by direct URIs without fetching playlist", async () => {
    const args = makeArgs([PLAYLIST_ID, "spotify:track:aaa", "spotify:track:bbb"]);
    await playlistRemoveCommand(args);

    expect(mockGetPlaylistTracks).not.toHaveBeenCalled();
    expect(mockRemoveTracksFromPlaylist).toHaveBeenCalledWith(
      PLAYLIST_ID,
      expect.arrayContaining(["spotify:track:aaa", "spotify:track:bbb"]),
    );
  });

  test("removes by --match (single)", async () => {
    mockGetPlaylistTracks.mockResolvedValue(makeFakePlaylistResponse(SAMPLE_TRACKS));

    const args = makeArgs([PLAYLIST_ID], { match: "Hotel California" }, {});
    await playlistRemoveCommand(args);

    expect(mockGetPlaylistTracks).toHaveBeenCalledWith(PLAYLIST_ID, { limit: 50, offset: 0 });
    expect(mockRemoveTracksFromPlaylist).toHaveBeenCalledWith(PLAYLIST_ID, ["spotify:track:ccc"]);
  });

  test("removes by --match (multiple via multiFlags)", async () => {
    mockGetPlaylistTracks.mockResolvedValue(makeFakePlaylistResponse(SAMPLE_TRACKS));

    const args = makeArgs(
      [PLAYLIST_ID],
      { match: "Sandman" },
      { match: ["Hotel California", "Sandman"] },
    );
    await playlistRemoveCommand(args);

    const removedUris = mockRemoveTracksFromPlaylist.mock.calls[0]![1] as string[];
    expect(removedUris).toContain("spotify:track:ccc");
    expect(removedUris).toContain("spotify:track:ddd");
    expect(removedUris).toHaveLength(2);
  });

  test("--match is case-insensitive", async () => {
    mockGetPlaylistTracks.mockResolvedValue(makeFakePlaylistResponse(SAMPLE_TRACKS));

    const args = makeArgs([PLAYLIST_ID], { match: "danger zone" }, {});
    await playlistRemoveCommand(args);

    expect(mockRemoveTracksFromPlaylist).toHaveBeenCalledWith(PLAYLIST_ID, ["spotify:track:aaa"]);
  });

  test("--match searches artist names too", async () => {
    mockGetPlaylistTracks.mockResolvedValue(makeFakePlaylistResponse(SAMPLE_TRACKS));

    const args = makeArgs([PLAYLIST_ID], { match: "Eagles" }, {});
    await playlistRemoveCommand(args);

    expect(mockRemoveTracksFromPlaylist).toHaveBeenCalledWith(PLAYLIST_ID, ["spotify:track:ccc"]);
  });

  test("removes by --index (1-based)", async () => {
    mockGetPlaylistTracks.mockResolvedValue(makeFakePlaylistResponse(SAMPLE_TRACKS));

    const args = makeArgs([PLAYLIST_ID], { index: "3" }, {});
    await playlistRemoveCommand(args);

    expect(mockRemoveTracksFromPlaylist).toHaveBeenCalledWith(PLAYLIST_ID, ["spotify:track:ccc"]);
  });

  test("removes by --index with comma-separated values", async () => {
    mockGetPlaylistTracks.mockResolvedValue(makeFakePlaylistResponse(SAMPLE_TRACKS));

    const args = makeArgs([PLAYLIST_ID], { index: "1,3,5" }, {});
    await playlistRemoveCommand(args);

    const removedUris = mockRemoveTracksFromPlaylist.mock.calls[0]![1] as string[];
    expect(removedUris).toContain("spotify:track:aaa");
    expect(removedUris).toContain("spotify:track:ccc");
    expect(removedUris).toContain("spotify:track:eee");
    expect(removedUris).toHaveLength(3);
  });

  test("combines direct URIs with --match and --index", async () => {
    mockGetPlaylistTracks.mockResolvedValue(makeFakePlaylistResponse(SAMPLE_TRACKS));

    const args = makeArgs(
      [PLAYLIST_ID, "spotify:track:aaa"],
      { match: "Sandman", index: "3" },
      {},
    );
    await playlistRemoveCommand(args);

    const removedUris = mockRemoveTracksFromPlaylist.mock.calls[0]![1] as string[];
    expect(removedUris).toContain("spotify:track:aaa");
    expect(removedUris).toContain("spotify:track:ccc");
    expect(removedUris).toContain("spotify:track:ddd");
    expect(removedUris).toHaveLength(3);
  });

  test("deduplicates URIs when match and direct URI overlap", async () => {
    mockGetPlaylistTracks.mockResolvedValue(makeFakePlaylistResponse(SAMPLE_TRACKS));

    const args = makeArgs(
      [PLAYLIST_ID, "spotify:track:ccc"],
      { match: "Hotel California" },
      {},
    );
    await playlistRemoveCommand(args);

    const removedUris = mockRemoveTracksFromPlaylist.mock.calls[0]![1] as string[];
    expect(removedUris).toHaveLength(1);
    expect(removedUris).toContain("spotify:track:ccc");
  });

  test("throws when no URIs, --match, or --index provided", async () => {
    const args = makeArgs([PLAYLIST_ID]);
    await expect(playlistRemoveCommand(args)).rejects.toThrow();
  });

  test("throws when no playlist ID provided", async () => {
    const args = makeArgs([]);
    await expect(playlistRemoveCommand(args)).rejects.toThrow();
  });

  test("throws when --match finds nothing", async () => {
    mockGetPlaylistTracks.mockResolvedValue(makeFakePlaylistResponse(SAMPLE_TRACKS));

    const args = makeArgs([PLAYLIST_ID], { match: "Nonexistent Song" }, {});
    await expect(playlistRemoveCommand(args)).rejects.toThrow(/No tracks matching/);
  });

  test("throws when --index is out of range", async () => {
    mockGetPlaylistTracks.mockResolvedValue(makeFakePlaylistResponse(SAMPLE_TRACKS));

    const args = makeArgs([PLAYLIST_ID], { index: "99" }, {});
    await expect(playlistRemoveCommand(args)).rejects.toThrow(/Invalid index/);
  });

  test("throws when --index is 0 (not 1-based)", async () => {
    mockGetPlaylistTracks.mockResolvedValue(makeFakePlaylistResponse(SAMPLE_TRACKS));

    const args = makeArgs([PLAYLIST_ID], { index: "0" }, {});
    await expect(playlistRemoveCommand(args)).rejects.toThrow(/Invalid index/);
  });
});
