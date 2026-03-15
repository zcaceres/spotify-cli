import { beforeEach, describe, expect, mock, test } from "bun:test";
import { fixtures } from "../test/fixtures/index.js";
import type { ParsedArgs } from "./index.js";

const mockGetCurrentUser = mock(() => Promise.resolve(fixtures.me));
const mockGetTopItems = mock(() => Promise.resolve(fixtures.topTracks));
const mockGetFollowedArtists = mock(() => Promise.resolve(fixtures.followedArtists));
const mockFollowArtists = mock(() => Promise.resolve(undefined));
const mockUnfollowArtists = mock(() => Promise.resolve(undefined));

mock.module("../api/user.js", () => ({
  getCurrentUser: mockGetCurrentUser,
  getTopItems: mockGetTopItems,
  getFollowedArtists: mockGetFollowedArtists,
  followArtists: mockFollowArtists,
  unfollowArtists: mockUnfollowArtists,
}));

let captured: unknown;
mock.module("../output.js", () => ({
  output: (data: unknown) => {
    captured = data;
  },
}));

const { meCommand, topCommand, followingCommand, followCommand, unfollowCommand } = await import("./user.js");

function args(positional: string[] = [], flags: Record<string, string> = {}): ParsedArgs {
  return { positional, flags, multiFlags: {} };
}

describe("me command", () => {
  beforeEach(() => {
    captured = undefined;
    mockGetCurrentUser.mockClear();
  });

  test("outputs user profile", async () => {
    await meCommand(args());
    expect(mockGetCurrentUser).toHaveBeenCalled();
    expect(captured).toEqual(fixtures.me);
  });
});

describe("top command", () => {
  beforeEach(() => {
    captured = undefined;
    mockGetTopItems.mockClear();
  });

  test("fetches top tracks", async () => {
    await topCommand(args(["tracks"]));
    expect(mockGetTopItems).toHaveBeenCalledWith("tracks", {
      time_range: undefined,
      limit: undefined,
      offset: undefined,
    });
    expect(captured).toEqual(fixtures.topTracks);
  });

  test("fetches top artists", async () => {
    await topCommand(args(["artists"]));
    expect(mockGetTopItems).toHaveBeenCalledWith("artists", {
      time_range: undefined,
      limit: undefined,
      offset: undefined,
    });
  });

  test("passes time-range flag", async () => {
    await topCommand(args(["tracks"], { "time-range": "short_term" }));
    expect(mockGetTopItems).toHaveBeenCalledWith("tracks", {
      time_range: "short_term",
      limit: undefined,
      offset: undefined,
    });
  });

  test("passes limit and offset", async () => {
    await topCommand(args(["artists"], { limit: "10", offset: "5" }));
    expect(mockGetTopItems).toHaveBeenCalledWith("artists", {
      time_range: undefined,
      limit: 10,
      offset: 5,
    });
  });

  test("throws for invalid type", async () => {
    await expect(topCommand(args(["songs"]))).rejects.toThrow(/Usage/);
  });

  test("throws without type", async () => {
    await expect(topCommand(args())).rejects.toThrow(/Usage/);
  });
});

describe("following command", () => {
  beforeEach(() => {
    captured = undefined;
    mockGetFollowedArtists.mockClear();
  });

  test("fetches followed artists", async () => {
    await followingCommand(args());
    expect(mockGetFollowedArtists).toHaveBeenCalledWith({ limit: undefined, after: undefined });
    expect(captured).toEqual(fixtures.followedArtists);
  });

  test("passes limit and after cursor", async () => {
    await followingCommand(args([], { limit: "5", after: "abc123" }));
    expect(mockGetFollowedArtists).toHaveBeenCalledWith({ limit: 5, after: "abc123" });
  });
});

describe("follow command", () => {
  beforeEach(() => {
    captured = undefined;
    mockFollowArtists.mockClear();
  });

  test("follows single artist", async () => {
    await followCommand(args(["711MCceyCBcFnzjGY4Q7Un"]));
    expect(mockFollowArtists).toHaveBeenCalledWith(["711MCceyCBcFnzjGY4Q7Un"]);
    expect(captured).toEqual({ status: "followed", ids: ["711MCceyCBcFnzjGY4Q7Un"] });
  });

  test("follows multiple artists", async () => {
    await followCommand(args(["aaa", "bbb", "ccc"]));
    expect(mockFollowArtists).toHaveBeenCalledWith(["aaa", "bbb", "ccc"]);
  });

  test("throws without ids", async () => {
    await expect(followCommand(args())).rejects.toThrow(/Usage/);
  });
});

describe("unfollow command", () => {
  beforeEach(() => {
    captured = undefined;
    mockUnfollowArtists.mockClear();
  });

  test("unfollows single artist", async () => {
    await unfollowCommand(args(["711MCceyCBcFnzjGY4Q7Un"]));
    expect(mockUnfollowArtists).toHaveBeenCalledWith(["711MCceyCBcFnzjGY4Q7Un"]);
    expect(captured).toEqual({ status: "unfollowed", ids: ["711MCceyCBcFnzjGY4Q7Un"] });
  });

  test("throws without ids", async () => {
    await expect(unfollowCommand(args())).rejects.toThrow(/Usage/);
  });
});
