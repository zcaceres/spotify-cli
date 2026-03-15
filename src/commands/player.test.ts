import { beforeEach, describe, expect, mock, test } from "bun:test";
import { fixtures } from "../test/fixtures/index.js";
import type { ParsedArgs } from "./index.js";

const mockGetCurrentlyPlaying = mock(() => Promise.resolve(fixtures.currentlyPlaying));
const mockStartPlayback = mock(() => Promise.resolve(undefined));
const mockPausePlayback = mock(() => Promise.resolve(undefined));
const mockSkipToNext = mock(() => Promise.resolve(undefined));
const mockSkipToPrevious = mock(() => Promise.resolve(undefined));
const mockSeekToPosition = mock(() => Promise.resolve(undefined));
const mockSetVolume = mock(() => Promise.resolve(undefined));
const mockSetShuffle = mock(() => Promise.resolve(undefined));
const mockSetRepeat = mock(() => Promise.resolve(undefined));
const mockGetQueue = mock(() => Promise.resolve(fixtures.queue));
const mockAddToQueue = mock(() => Promise.resolve(undefined));
const mockGetDevices = mock(() => Promise.resolve(fixtures.devices));
const mockTransferPlayback = mock(() => Promise.resolve(undefined));
const mockGetRecentlyPlayed = mock(() => Promise.resolve(fixtures.recentlyPlayed));

mock.module("../api/player.js", () => ({
  getCurrentlyPlaying: mockGetCurrentlyPlaying,
  startPlayback: mockStartPlayback,
  pausePlayback: mockPausePlayback,
  skipToNext: mockSkipToNext,
  skipToPrevious: mockSkipToPrevious,
  seekToPosition: mockSeekToPosition,
  setVolume: mockSetVolume,
  setShuffle: mockSetShuffle,
  setRepeat: mockSetRepeat,
  getQueue: mockGetQueue,
  addToQueue: mockAddToQueue,
  getDevices: mockGetDevices,
  transferPlayback: mockTransferPlayback,
  getRecentlyPlayed: mockGetRecentlyPlayed,
}));

let captured: unknown;
mock.module("../output.js", () => ({
  output: (data: unknown) => {
    captured = data;
  },
}));

const {
  nowCommand,
  playCommand,
  pauseCommand,
  nextCommand,
  prevCommand,
  seekCommand,
  volumeCommand,
  shuffleCommand,
  repeatCommand,
  queueCommand,
  queueAddCommand,
  devicesCommand,
  transferCommand,
  recentCommand,
} = await import("./player.js");

function args(positional: string[] = [], flags: Record<string, string> = {}): ParsedArgs {
  return { positional, flags, multiFlags: {} };
}

describe("now command", () => {
  beforeEach(() => {
    captured = undefined;
    mockGetCurrentlyPlaying.mockClear();
  });

  test("outputs currently playing track", async () => {
    await nowCommand(args());
    expect(captured).toEqual(fixtures.currentlyPlaying);
  });

  test("outputs not_playing when nothing is playing", async () => {
    mockGetCurrentlyPlaying.mockResolvedValue(null as never);
    await nowCommand(args());
    expect(captured).toEqual({ status: "not_playing" });
  });

  test("outputs not_playing for undefined response", async () => {
    mockGetCurrentlyPlaying.mockResolvedValue(undefined as never);
    await nowCommand(args());
    expect(captured).toEqual({ status: "not_playing" });
  });
});

describe("play command", () => {
  beforeEach(() => {
    captured = undefined;
    mockStartPlayback.mockClear();
  });

  test("starts playback with no options", async () => {
    await playCommand(args());
    expect(mockStartPlayback).toHaveBeenCalledWith({});
    expect(captured).toEqual({ status: "playing" });
  });

  test("passes uri", async () => {
    await playCommand(args([], { uri: "spotify:track:abc" }));
    expect(mockStartPlayback).toHaveBeenCalledWith({
      uris: ["spotify:track:abc"],
    });
  });

  test("passes context uri", async () => {
    await playCommand(args([], { context: "spotify:album:abc" }));
    expect(mockStartPlayback).toHaveBeenCalledWith({
      context_uri: "spotify:album:abc",
    });
  });

  test("passes device id", async () => {
    await playCommand(args([], { device: "device123" }));
    expect(mockStartPlayback).toHaveBeenCalledWith({
      device_id: "device123",
    });
  });

  test("passes offset and position", async () => {
    await playCommand(args([], { offset: "3", position: "45000" }));
    expect(mockStartPlayback).toHaveBeenCalledWith({
      offset: { position: 3 },
      position_ms: 45000,
    });
  });

  test("ignores empty offset and position", async () => {
    await playCommand(args([], { offset: "", position: "" }));
    expect(mockStartPlayback).toHaveBeenCalledWith({});
  });
});

describe("pause command", () => {
  beforeEach(() => {
    captured = undefined;
    mockPausePlayback.mockClear();
  });

  test("pauses playback", async () => {
    await pauseCommand(args());
    expect(mockPausePlayback).toHaveBeenCalledWith(undefined);
    expect(captured).toEqual({ status: "paused" });
  });

  test("passes device id", async () => {
    await pauseCommand(args([], { device: "d1" }));
    expect(mockPausePlayback).toHaveBeenCalledWith("d1");
  });
});

describe("next command", () => {
  beforeEach(() => {
    captured = undefined;
    mockSkipToNext.mockClear();
  });

  test("skips to next", async () => {
    await nextCommand(args());
    expect(mockSkipToNext).toHaveBeenCalledWith(undefined);
    expect(captured).toEqual({ status: "skipped_next" });
  });

  test("passes device id", async () => {
    await nextCommand(args([], { device: "d1" }));
    expect(mockSkipToNext).toHaveBeenCalledWith("d1");
  });
});

describe("prev command", () => {
  beforeEach(() => {
    captured = undefined;
    mockSkipToPrevious.mockClear();
  });

  test("skips to previous", async () => {
    await prevCommand(args());
    expect(mockSkipToPrevious).toHaveBeenCalledWith(undefined);
    expect(captured).toEqual({ status: "skipped_previous" });
  });
});

describe("seek command", () => {
  beforeEach(() => {
    captured = undefined;
    mockSeekToPosition.mockClear();
  });

  test("seeks to position", async () => {
    await seekCommand(args(["45000"]));
    expect(mockSeekToPosition).toHaveBeenCalledWith(45000, undefined);
    expect(captured).toEqual({ status: "seeked", position_ms: 45000 });
  });

  test("passes device id", async () => {
    await seekCommand(args(["1000"], { device: "d1" }));
    expect(mockSeekToPosition).toHaveBeenCalledWith(1000, "d1");
  });

  test("throws without position", async () => {
    await expect(seekCommand(args())).rejects.toThrow(/Usage/);
  });

  test("throws for negative position", async () => {
    await expect(seekCommand(args(["-1"]))).rejects.toThrow(/non-negative/);
  });

  test("throws for non-numeric position", async () => {
    await expect(seekCommand(args(["abc"]))).rejects.toThrow(/must be a number/);
  });
});

describe("volume command", () => {
  beforeEach(() => {
    captured = undefined;
    mockSetVolume.mockClear();
  });

  test("sets volume", async () => {
    await volumeCommand(args(["75"]));
    expect(mockSetVolume).toHaveBeenCalledWith(75, undefined);
    expect(captured).toEqual({ status: "volume_set", volume: 75 });
  });

  test("sets volume 0", async () => {
    await volumeCommand(args(["0"]));
    expect(mockSetVolume).toHaveBeenCalledWith(0, undefined);
  });

  test("sets volume 100", async () => {
    await volumeCommand(args(["100"]));
    expect(mockSetVolume).toHaveBeenCalledWith(100, undefined);
  });

  test("throws without value", async () => {
    await expect(volumeCommand(args())).rejects.toThrow(/Usage/);
  });

  test("throws for volume > 100", async () => {
    await expect(volumeCommand(args(["101"]))).rejects.toThrow(/0-100/);
  });

  test("throws for volume < 0", async () => {
    await expect(volumeCommand(args(["-1"]))).rejects.toThrow(/0-100/);
  });
});

describe("shuffle command", () => {
  beforeEach(() => {
    captured = undefined;
    mockSetShuffle.mockClear();
  });

  test("enables shuffle", async () => {
    await shuffleCommand(args(["on"]));
    expect(mockSetShuffle).toHaveBeenCalledWith(true, undefined);
    expect(captured).toEqual({ status: "shuffle_set", shuffle: true });
  });

  test("disables shuffle", async () => {
    await shuffleCommand(args(["off"]));
    expect(mockSetShuffle).toHaveBeenCalledWith(false, undefined);
    expect(captured).toEqual({ status: "shuffle_set", shuffle: false });
  });

  test("passes device id", async () => {
    await shuffleCommand(args(["on"], { device: "d1" }));
    expect(mockSetShuffle).toHaveBeenCalledWith(true, "d1");
  });

  test("throws for invalid state", async () => {
    await expect(shuffleCommand(args(["yes"]))).rejects.toThrow(/Usage/);
  });

  test("throws without state", async () => {
    await expect(shuffleCommand(args())).rejects.toThrow(/Usage/);
  });
});

describe("repeat command", () => {
  beforeEach(() => {
    captured = undefined;
    mockSetRepeat.mockClear();
  });

  test("sets repeat off", async () => {
    await repeatCommand(args(["off"]));
    expect(mockSetRepeat).toHaveBeenCalledWith("off", undefined);
    expect(captured).toEqual({ status: "repeat_set", repeat: "off" });
  });

  test("sets repeat track", async () => {
    await repeatCommand(args(["track"]));
    expect(mockSetRepeat).toHaveBeenCalledWith("track", undefined);
  });

  test("sets repeat context", async () => {
    await repeatCommand(args(["context"]));
    expect(mockSetRepeat).toHaveBeenCalledWith("context", undefined);
  });

  test("throws for invalid state", async () => {
    await expect(repeatCommand(args(["all"]))).rejects.toThrow(/Usage/);
  });
});

describe("queue command", () => {
  beforeEach(() => {
    captured = undefined;
    mockGetQueue.mockClear();
  });

  test("outputs queue", async () => {
    await queueCommand(args());
    expect(captured).toEqual(fixtures.queue);
  });
});

describe("queue-add command", () => {
  beforeEach(() => {
    captured = undefined;
    mockAddToQueue.mockClear();
  });

  test("adds track to queue", async () => {
    await queueAddCommand(args(["spotify:track:abc"]));
    expect(mockAddToQueue).toHaveBeenCalledWith("spotify:track:abc", undefined);
    expect(captured).toEqual({ status: "added_to_queue", uri: "spotify:track:abc" });
  });

  test("passes device id", async () => {
    await queueAddCommand(args(["spotify:track:abc"], { device: "d1" }));
    expect(mockAddToQueue).toHaveBeenCalledWith("spotify:track:abc", "d1");
  });

  test("throws without uri", async () => {
    await expect(queueAddCommand(args())).rejects.toThrow(/Usage/);
  });
});

describe("devices command", () => {
  beforeEach(() => {
    captured = undefined;
    mockGetDevices.mockClear();
  });

  test("outputs devices list", async () => {
    await devicesCommand(args());
    expect(captured).toEqual(fixtures.devices);
  });
});

describe("transfer command", () => {
  beforeEach(() => {
    captured = undefined;
    mockTransferPlayback.mockClear();
  });

  test("transfers playback", async () => {
    await transferCommand(args(["device123"]));
    expect(mockTransferPlayback).toHaveBeenCalledWith("device123", undefined);
    expect(captured).toEqual({ status: "transferred", device_id: "device123" });
  });

  test("passes --play flag", async () => {
    await transferCommand(args(["device123"], { play: "" }));
    expect(mockTransferPlayback).toHaveBeenCalledWith("device123", true);
  });

  test("throws without device_id", async () => {
    await expect(transferCommand(args())).rejects.toThrow(/Usage/);
  });
});

describe("recent command", () => {
  beforeEach(() => {
    captured = undefined;
    mockGetRecentlyPlayed.mockClear();
  });

  test("passes limit", async () => {
    await recentCommand(args([], { limit: "10" }));
    expect(mockGetRecentlyPlayed).toHaveBeenCalledWith({ limit: 10, after: undefined, before: undefined });
  });

  test("passes after and before timestamps", async () => {
    await recentCommand(args([], { after: "1000000", before: "2000000" }));
    expect(mockGetRecentlyPlayed).toHaveBeenCalledWith({ limit: undefined, after: 1000000, before: 2000000 });
  });

  test("works with no flags", async () => {
    await recentCommand(args());
    expect(mockGetRecentlyPlayed).toHaveBeenCalledWith({ limit: undefined, after: undefined, before: undefined });
    expect(captured).toEqual(fixtures.recentlyPlayed);
  });
});
