import { beforeEach, describe, expect, mock, test } from "bun:test";
import { ErrorCode, SpotifyCliError } from "../errors.js";
import { fixtures } from "../test/fixtures/index.js";
import type { ParsedArgs } from "./index.js";

const mockSearch = mock(() => Promise.resolve(fixtures.searchTracks));

mock.module("../api/search.js", () => ({
  search: mockSearch,
}));

let captured: unknown;
mock.module("../output.js", () => ({
  output: (data: unknown) => {
    captured = data;
  },
}));

const { searchCommand } = await import("./search.js");

function args(positional: string[] = [], flags: Record<string, string> = {}): ParsedArgs {
  return { positional, flags, multiFlags: {} };
}

describe("search command", () => {
  beforeEach(() => {
    captured = undefined;
    mockSearch.mockClear();
  });

  test("searches with query and default type", async () => {
    await searchCommand(args(["Thunderstruck"]));
    expect(mockSearch).toHaveBeenCalledWith({
      q: "Thunderstruck",
      type: "track",
      limit: undefined,
      offset: undefined,
    });
    expect(captured).toEqual(fixtures.searchTracks);
  });

  test("joins multi-word queries", async () => {
    await searchCommand(args(["Never", "Gonna", "Give"]));
    expect(mockSearch).toHaveBeenCalledWith({
      q: "Never Gonna Give",
      type: "track",
      limit: undefined,
      offset: undefined,
    });
  });

  test("passes --type flag", async () => {
    await searchCommand(args(["AC/DC"], { type: "artist" }));
    expect(mockSearch).toHaveBeenCalledWith({
      q: "AC/DC",
      type: "artist",
      limit: undefined,
      offset: undefined,
    });
  });

  test("passes multiple types", async () => {
    await searchCommand(args(["rock"], { type: "track,album" }));
    expect(mockSearch).toHaveBeenCalledWith({
      q: "rock",
      type: "track,album",
      limit: undefined,
      offset: undefined,
    });
  });

  test("passes --limit and --offset", async () => {
    await searchCommand(args(["test"], { limit: "5", offset: "10" }));
    expect(mockSearch).toHaveBeenCalledWith({
      q: "test",
      type: "track",
      limit: 5,
      offset: 10,
    });
  });

  test("throws without query", async () => {
    await expect(searchCommand(args())).rejects.toThrow(/Usage/);
  });

  test("throws for invalid search type", async () => {
    try {
      await searchCommand(args(["rock"], { type: "invalid" }));
      expect.unreachable("should have thrown");
    } catch (e) {
      const err = e as SpotifyCliError;
      expect(err.details.code).toBe(ErrorCode.INVALID_ARGUMENT);
      expect(err.message).toContain("invalid");
    }
  });

  test("throws for partially invalid comma-separated types", async () => {
    await expect(searchCommand(args(["rock"], { type: "track,bogus" }))).rejects.toThrow(/bogus/);
  });

  test("accepts all valid search types", async () => {
    await searchCommand(args(["test"], { type: "track,album,artist,playlist,show,episode" }));
    expect(mockSearch).toHaveBeenCalled();
  });
});
