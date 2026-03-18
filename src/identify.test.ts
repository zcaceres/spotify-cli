import { describe, expect, test } from "bun:test";
import { identify } from "./identify.js";

describe("identify", () => {
  test("recognizes spotify URI", () => {
    const result = identify("spotify:track:4uLU6hMCjMI75M1A2tKUQC");
    expect(result).toEqual({
      kind: "uri",
      type: "track",
      id: "4uLU6hMCjMI75M1A2tKUQC",
      uri: "spotify:track:4uLU6hMCjMI75M1A2tKUQC",
    });
  });

  test("recognizes album URI", () => {
    const result = identify("spotify:album:4uLU6hMCjMI75M1A2tKUQC");
    expect(result).toEqual({
      kind: "uri",
      type: "album",
      id: "4uLU6hMCjMI75M1A2tKUQC",
      uri: "spotify:album:4uLU6hMCjMI75M1A2tKUQC",
    });
  });

  test("recognizes 22-char base-62 ID", () => {
    const result = identify("4uLU6hMCjMI75M1A2tKUQC");
    expect(result).toEqual({ kind: "id", id: "4uLU6hMCjMI75M1A2tKUQC" });
  });

  test("treats short string as query", () => {
    const result = identify("abc123");
    expect(result).toEqual({ kind: "query", query: "abc123" });
  });

  test("treats natural language as query", () => {
    const result = identify("bohemian rhapsody");
    expect(result).toEqual({ kind: "query", query: "bohemian rhapsody" });
  });

  test("treats long non-base62 string as query", () => {
    const result = identify("this-is-not-a-spotify-id!");
    expect(result).toEqual({ kind: "query", query: "this-is-not-a-spotify-id!" });
  });

  test("throws on malformed URI with missing ID", () => {
    expect(() => identify("spotify:track:")).toThrow(/Malformed Spotify URI/);
  });

  test("throws on malformed URI with invalid characters", () => {
    expect(() => identify("spotify:album:bad!")).toThrow(/Malformed Spotify URI/);
  });

  test("throws on incomplete URI", () => {
    expect(() => identify("spotify:")).toThrow(/Malformed Spotify URI/);
  });

  test("throws on URI with only type", () => {
    expect(() => identify("spotify:track")).toThrow(/Malformed Spotify URI/);
  });
});
