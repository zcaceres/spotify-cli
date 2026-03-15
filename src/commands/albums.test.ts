import { beforeEach, describe, expect, mock, test } from "bun:test";
import { fixtures } from "../test/fixtures/index.js";
import type { ParsedArgs } from "./index.js";

const mockGetAlbum = mock(() => Promise.resolve(fixtures.album));
const mockGetAlbumTracks = mock(() => Promise.resolve(fixtures.albumTracks));
const mockGetSavedAlbums = mock(() => Promise.resolve(fixtures.savedTracks));
const mockSaveAlbums = mock(() => Promise.resolve(undefined));
const mockRemoveAlbums = mock(() => Promise.resolve(undefined));

mock.module("../api/albums.js", () => ({
  getAlbum: mockGetAlbum,
  getAlbumTracks: mockGetAlbumTracks,
  getSavedAlbums: mockGetSavedAlbums,
  saveAlbums: mockSaveAlbums,
  removeAlbums: mockRemoveAlbums,
}));

let captured: unknown;
mock.module("../output.js", () => ({
  output: (data: unknown) => {
    captured = data;
  },
}));

const { albumCommand, albumTracksCommand, savedAlbumsCommand, saveAlbumsCommand, removeAlbumsCommand } = await import(
  "./albums.js"
);

function args(positional: string[] = [], flags: Record<string, string> = {}): ParsedArgs {
  return { positional, flags, multiFlags: {} };
}

describe("album command", () => {
  beforeEach(() => {
    captured = undefined;
    mockGetAlbum.mockClear();
  });

  test("outputs album data", async () => {
    await albumCommand(args(["4vu7F6h90Br1ZtYYaqfITy"]));
    expect(mockGetAlbum).toHaveBeenCalledWith("4vu7F6h90Br1ZtYYaqfITy");
    expect(captured).toEqual(fixtures.album);
  });

  test("throws without id", async () => {
    await expect(albumCommand(args())).rejects.toThrow(/Usage/);
  });
});

describe("album-tracks command", () => {
  beforeEach(() => {
    captured = undefined;
    mockGetAlbumTracks.mockClear();
  });

  test("passes id, limit, and offset", async () => {
    await albumTracksCommand(args(["abc"], { limit: "2", offset: "0" }));
    expect(mockGetAlbumTracks).toHaveBeenCalledWith("abc", { limit: 2, offset: 0 });
  });

  test("works with no flags", async () => {
    await albumTracksCommand(args(["abc"]));
    expect(mockGetAlbumTracks).toHaveBeenCalledWith("abc", { limit: undefined, offset: undefined });
  });

  test("throws without id", async () => {
    await expect(albumTracksCommand(args())).rejects.toThrow(/Usage/);
  });
});

describe("saved-albums command", () => {
  beforeEach(() => {
    captured = undefined;
    mockGetSavedAlbums.mockClear();
  });

  test("passes limit and offset", async () => {
    await savedAlbumsCommand(args([], { limit: "5" }));
    expect(mockGetSavedAlbums).toHaveBeenCalledWith({ limit: 5, offset: undefined });
  });

  test("works with no flags", async () => {
    await savedAlbumsCommand(args());
    expect(mockGetSavedAlbums).toHaveBeenCalledWith({ limit: undefined, offset: undefined });
  });
});

describe("save-albums command", () => {
  beforeEach(() => {
    captured = undefined;
    mockSaveAlbums.mockClear();
  });

  test("saves single album", async () => {
    await saveAlbumsCommand(args(["abc123"]));
    expect(mockSaveAlbums).toHaveBeenCalledWith(["abc123"]);
    expect(captured).toEqual({ status: "saved", ids: ["abc123"] });
  });

  test("saves multiple albums", async () => {
    await saveAlbumsCommand(args(["abc", "def"]));
    expect(mockSaveAlbums).toHaveBeenCalledWith(["abc", "def"]);
  });

  test("throws without ids", async () => {
    await expect(saveAlbumsCommand(args())).rejects.toThrow(/Usage/);
  });
});

describe("remove-albums command", () => {
  beforeEach(() => {
    captured = undefined;
    mockRemoveAlbums.mockClear();
  });

  test("removes single album", async () => {
    await removeAlbumsCommand(args(["abc123"]));
    expect(mockRemoveAlbums).toHaveBeenCalledWith(["abc123"]);
    expect(captured).toEqual({ status: "removed", ids: ["abc123"] });
  });

  test("throws without ids", async () => {
    await expect(removeAlbumsCommand(args())).rejects.toThrow(/Usage/);
  });
});
