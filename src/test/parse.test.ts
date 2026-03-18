import { describe, expect, test } from "bun:test";
import { ErrorCode, ExitCode, SpotifyCliError } from "../errors.js";
import { ensureTrackUri, optionalIntFlag, parseIntFlag, requireIds } from "../parse.js";

describe("parseIntFlag", () => {
  test("parses a valid integer string", () => {
    expect(parseIntFlag("42", "--limit")).toBe(42);
  });

  test("parses zero", () => {
    expect(parseIntFlag("0", "--offset")).toBe(0);
  });

  test("parses negative integers", () => {
    expect(parseIntFlag("-5", "--position")).toBe(-5);
  });

  test("parses string with leading zeros", () => {
    expect(parseIntFlag("007", "--limit")).toBe(7);
  });

  test("truncates decimal values (parseInt behavior)", () => {
    expect(parseIntFlag("3.14", "--limit")).toBe(3);
  });

  test("throws SpotifyCliError for non-numeric string", () => {
    expect(() => parseIntFlag("abc", "--limit")).toThrow(SpotifyCliError);
    try {
      parseIntFlag("abc", "--limit");
    } catch (e) {
      const err = e as SpotifyCliError;
      expect(err.exitCode).toBe(ExitCode.ARGS);
      expect(err.details.code).toBe(ErrorCode.INVALID_ARGUMENT);
      expect(err.message).toContain("--limit");
      expect(err.message).toContain('"abc"');
    }
  });

  test("throws for empty string", () => {
    expect(() => parseIntFlag("", "--limit")).toThrow(SpotifyCliError);
  });

  test("includes flag name in error message", () => {
    try {
      parseIntFlag("xyz", "--offset");
    } catch (e) {
      expect((e as SpotifyCliError).message).toContain("--offset");
    }
  });
});

describe("optionalIntFlag", () => {
  test("returns parsed integer when flag is present", () => {
    const flags = { limit: "10" };
    expect(optionalIntFlag(flags, "limit")).toBe(10);
  });

  test("returns undefined when flag is absent", () => {
    const flags: Record<string, string> = {};
    expect(optionalIntFlag(flags, "limit")).toBeUndefined();
  });

  test("returns undefined when flag is empty string", () => {
    const flags = { limit: "" };
    expect(optionalIntFlag(flags, "limit")).toBeUndefined();
  });

  test("throws for non-numeric flag value", () => {
    const flags = { limit: "notanumber" };
    expect(() => optionalIntFlag(flags, "limit")).toThrow(SpotifyCliError);
  });

  test("error message includes --prefix for flag name", () => {
    const flags = { limit: "bad" };
    try {
      optionalIntFlag(flags, "limit");
    } catch (e) {
      expect((e as SpotifyCliError).message).toContain("--limit");
    }
  });

  test("parses zero correctly (not treated as falsy)", () => {
    const flags = { offset: "0" };
    expect(optionalIntFlag(flags, "offset")).toBe(0);
  });

  test("ignores unrelated flags", () => {
    const flags = { other: "5" };
    expect(optionalIntFlag(flags, "limit")).toBeUndefined();
  });
});

describe("ensureTrackUri", () => {
  test("returns full URI unchanged", () => {
    expect(ensureTrackUri("spotify:track:abc123")).toBe("spotify:track:abc123");
  });

  test("returns other spotify URIs unchanged", () => {
    expect(ensureTrackUri("spotify:album:abc123")).toBe("spotify:album:abc123");
  });

  test("prefixes bare ID with spotify:track:", () => {
    expect(ensureTrackUri("abc123")).toBe("spotify:track:abc123");
  });
});

describe("optionalIntFlag negative values", () => {
  test("throws for negative limit", () => {
    const flags = { limit: "-1" };
    expect(() => optionalIntFlag(flags, "limit")).toThrow(SpotifyCliError);
    try {
      optionalIntFlag(flags, "limit");
    } catch (e) {
      const err = e as SpotifyCliError;
      expect(err.details.code).toBe(ErrorCode.INVALID_ARGUMENT);
      expect(err.message).toContain("non-negative");
    }
  });

  test("throws for negative offset", () => {
    const flags = { offset: "-5" };
    expect(() => optionalIntFlag(flags, "offset")).toThrow(SpotifyCliError);
  });
});

describe("requireIds", () => {
  test("returns single ID from positional args", () => {
    expect(requireIds(["abc123"], "play <id>")).toEqual(["abc123"]);
  });

  test("returns multiple IDs", () => {
    expect(requireIds(["id1", "id2", "id3"], "play <id...>")).toEqual(["id1", "id2", "id3"]);
  });

  test("filters out empty strings", () => {
    expect(requireIds(["id1", "", "id2", ""], "play <id>")).toEqual(["id1", "id2"]);
  });

  test("throws when positional array is empty", () => {
    expect(() => requireIds([], "play <id>")).toThrow(SpotifyCliError);
  });

  test("throws when all positional args are empty strings", () => {
    expect(() => requireIds(["", "", ""], "play <id>")).toThrow(SpotifyCliError);
  });

  test("error includes usage string", () => {
    try {
      requireIds([], "spotify play <track-id>");
    } catch (e) {
      const err = e as SpotifyCliError;
      expect(err.message).toContain("Usage:");
      expect(err.message).toContain("spotify play <track-id>");
    }
  });

  test("error has ARGS exit code and MISSING_ARGUMENT code", () => {
    try {
      requireIds([], "play <id>");
    } catch (e) {
      const err = e as SpotifyCliError;
      expect(err.exitCode).toBe(ExitCode.ARGS);
      expect(err.details.code).toBe(ErrorCode.MISSING_ARGUMENT);
    }
  });

  test("preserves IDs with special characters", () => {
    expect(requireIds(["spotify:track:abc", "spotify:album:xyz"], "play <uri>")).toEqual([
      "spotify:track:abc",
      "spotify:album:xyz",
    ]);
  });
});
