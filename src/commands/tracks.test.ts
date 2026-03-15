import { beforeEach, describe, expect, mock, test } from "bun:test";
import { ErrorCode, SpotifyCliError } from "../errors.js";
import { fixtures } from "../test/fixtures/index.js";
import type { ParsedArgs } from "./index.js";

const mockGetTrack = mock(() => Promise.resolve(fixtures.track));
const mockGetSavedTracks = mock(() => Promise.resolve(fixtures.savedTracks));
const mockSaveTracks = mock(() => Promise.resolve(undefined));
const mockRemoveTracks = mock(() => Promise.resolve(undefined));
const mockGetAudioFeatures = mock(() => Promise.resolve({}));
const mockGetRecommendations = mock(() => Promise.resolve({ tracks: [] }));

mock.module("../api/tracks.js", () => ({
  getTrack: mockGetTrack,
  getSavedTracks: mockGetSavedTracks,
  saveTracks: mockSaveTracks,
  removeTracks: mockRemoveTracks,
  getAudioFeatures: mockGetAudioFeatures,
  getRecommendations: mockGetRecommendations,
}));

let captured: unknown;
mock.module("../output.js", () => ({
  output: (data: unknown) => {
    captured = data;
  },
}));

const {
  trackCommand,
  savedTracksCommand,
  saveTracksCommand,
  removeTracksCommand,
  audioFeaturesCommand,
  recommendationsCommand,
} = await import("./tracks.js");

function args(
  positional: string[] = [],
  flags: Record<string, string> = {},
  multiFlags: Record<string, string[]> = {},
): ParsedArgs {
  return { positional, flags, multiFlags };
}

describe("track command", () => {
  beforeEach(() => {
    captured = undefined;
    mockGetTrack.mockClear();
  });

  test("outputs track data for valid id", async () => {
    await trackCommand(args(["57bgtoPSgt236HzfBOd8kj"]));
    expect(mockGetTrack).toHaveBeenCalledWith("57bgtoPSgt236HzfBOd8kj");
    expect(captured).toEqual(fixtures.track);
  });

  test("throws without id", async () => {
    await expect(trackCommand(args())).rejects.toThrow(/Usage/);
  });
});

describe("saved-tracks command", () => {
  beforeEach(() => {
    captured = undefined;
    mockGetSavedTracks.mockClear();
  });

  test("passes limit and offset", async () => {
    await savedTracksCommand(args([], { limit: "10", offset: "5" }));
    expect(mockGetSavedTracks).toHaveBeenCalledWith({ limit: 10, offset: 5 });
    expect(captured).toEqual(fixtures.savedTracks);
  });

  test("works with no flags", async () => {
    await savedTracksCommand(args());
    expect(mockGetSavedTracks).toHaveBeenCalledWith({ limit: undefined, offset: undefined });
  });
});

describe("save-tracks command", () => {
  beforeEach(() => {
    captured = undefined;
    mockSaveTracks.mockClear();
  });

  test("saves single track", async () => {
    await saveTracksCommand(args(["abc123"]));
    expect(mockSaveTracks).toHaveBeenCalledWith(["abc123"]);
    expect(captured).toEqual({ status: "saved", ids: ["abc123"] });
  });

  test("saves multiple tracks", async () => {
    await saveTracksCommand(args(["abc", "def", "ghi"]));
    expect(mockSaveTracks).toHaveBeenCalledWith(["abc", "def", "ghi"]);
  });

  test("throws without ids", async () => {
    await expect(saveTracksCommand(args())).rejects.toThrow(/Usage/);
  });
});

describe("remove-tracks command", () => {
  beforeEach(() => {
    captured = undefined;
    mockRemoveTracks.mockClear();
  });

  test("removes single track", async () => {
    await removeTracksCommand(args(["abc123"]));
    expect(mockRemoveTracks).toHaveBeenCalledWith(["abc123"]);
    expect(captured).toEqual({ status: "removed", ids: ["abc123"] });
  });

  test("throws without ids", async () => {
    await expect(removeTracksCommand(args())).rejects.toThrow(/Usage/);
  });
});

describe("audio-features command", () => {
  beforeEach(() => {
    captured = undefined;
    mockGetAudioFeatures.mockClear();
  });

  test("outputs audio features", async () => {
    mockGetAudioFeatures.mockResolvedValue({ danceability: 0.8 });
    await audioFeaturesCommand(args(["abc123"]));
    expect(mockGetAudioFeatures).toHaveBeenCalledWith("abc123");
    expect(captured).toEqual({ danceability: 0.8 });
  });

  test("throws without id", async () => {
    await expect(audioFeaturesCommand(args())).rejects.toThrow(/Usage/);
  });

  test("wraps 403 as DEPRECATED error", async () => {
    mockGetAudioFeatures.mockRejectedValue(
      new SpotifyCliError("Spotify API error 403", 3, { code: ErrorCode.FORBIDDEN, status: 403 }),
    );
    try {
      await audioFeaturesCommand(args(["abc123"]));
      expect.unreachable("should throw");
    } catch (err) {
      const e = err as SpotifyCliError;
      expect(e.details.code).toBe(ErrorCode.DEPRECATED);
      expect(e.message).toContain("Audio Features API is restricted");
    }
  });

  test("rethrows non-403 errors", async () => {
    mockGetAudioFeatures.mockRejectedValue(
      new SpotifyCliError("Spotify API error 500", 3, { code: ErrorCode.API_ERROR, status: 500 }),
    );
    try {
      await audioFeaturesCommand(args(["abc123"]));
      expect.unreachable("should throw");
    } catch (err) {
      const e = err as SpotifyCliError;
      expect(e.details.status).toBe(500);
    }
  });
});

describe("recommendations command", () => {
  beforeEach(() => {
    captured = undefined;
    mockGetRecommendations.mockClear();
  });

  test("passes seed tracks and limit", async () => {
    mockGetRecommendations.mockResolvedValue({ tracks: [] });
    await recommendationsCommand(args([], { "seed-tracks": "a,b", limit: "5" }));
    expect(mockGetRecommendations).toHaveBeenCalledWith({
      seed_tracks: "a,b",
      seed_artists: undefined,
      seed_genres: undefined,
      limit: 5,
    });
  });

  test("passes seed artists", async () => {
    await recommendationsCommand(args([], { "seed-artists": "x,y" }));
    expect(mockGetRecommendations).toHaveBeenCalledWith({
      seed_tracks: undefined,
      seed_artists: "x,y",
      seed_genres: undefined,
      limit: undefined,
    });
  });

  test("passes seed genres", async () => {
    await recommendationsCommand(args([], { "seed-genres": "rock,metal" }));
    expect(mockGetRecommendations).toHaveBeenCalledWith({
      seed_tracks: undefined,
      seed_artists: undefined,
      seed_genres: "rock,metal",
      limit: undefined,
    });
  });

  test("throws without any seeds", async () => {
    await expect(recommendationsCommand(args())).rejects.toThrow(/Usage/);
  });

  test("wraps 403 as DEPRECATED error", async () => {
    mockGetRecommendations.mockRejectedValue(new SpotifyCliError("403", 3, { code: ErrorCode.FORBIDDEN, status: 403 }));
    try {
      await recommendationsCommand(args([], { "seed-tracks": "a" }));
      expect.unreachable("should throw");
    } catch (err) {
      const e = err as SpotifyCliError;
      expect(e.details.code).toBe(ErrorCode.DEPRECATED);
    }
  });

  test("wraps 404 as DEPRECATED error", async () => {
    mockGetRecommendations.mockRejectedValue(new SpotifyCliError("404", 3, { code: ErrorCode.NOT_FOUND, status: 404 }));
    try {
      await recommendationsCommand(args([], { "seed-genres": "rock" }));
      expect.unreachable("should throw");
    } catch (err) {
      const e = err as SpotifyCliError;
      expect(e.details.code).toBe(ErrorCode.DEPRECATED);
    }
  });
});
