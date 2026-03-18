import { describe, expect, mock, test } from "bun:test";
import { getAlbums, getArtists, getTracks } from "./batch.js";
import type { FetchFn } from "./client.js";

function makeTrack(id: string, name: string) {
  return {
    id,
    name,
    type: "track",
    uri: `spotify:track:${id}`,
    href: `h/${id}`,
    artists: [{ id: "a1", name: "Artist 1", type: "artist", uri: "u", href: "h", external_urls: {} }],
    album: {
      id: "al1",
      name: "Album 1",
      album_type: "album",
      uri: "u",
      href: "h",
      images: [],
      release_date: "2020-01-01",
      external_urls: {},
    },
    duration_ms: 200000,
    explicit: false,
    track_number: 1,
    disc_number: 1,
    is_local: false,
    external_urls: {},
  };
}

describe("batch API (individual fetches)", () => {
  test("getTracks fetches each track by ID", async () => {
    const mockFetch = mock((path: string) => {
      if (path === "/tracks/abc") return Promise.resolve(makeTrack("abc", "Track A"));
      if (path === "/tracks/def") return Promise.resolve(makeTrack("def", "Track B"));
      return Promise.reject(new Error("unexpected"));
    }) as unknown as FetchFn;

    const result = await getTracks(["abc", "def"], mockFetch);
    expect(result).toHaveLength(2);
    expect(result[0]?.name).toBe("Track A");
    expect(result[1]?.name).toBe("Track B");
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  test("getTracks skips failed individual fetches", async () => {
    const mockFetch = mock((path: string) => {
      if (path === "/tracks/good") return Promise.resolve(makeTrack("good", "Good Track"));
      return Promise.reject(new Error("not found"));
    }) as unknown as FetchFn;

    const result = await getTracks(["good", "bad"], mockFetch);
    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe("Good Track");
  });

  test("getAlbums fetches each album by ID", async () => {
    const mockFetch = mock(() =>
      Promise.resolve({
        id: "alb1",
        name: "Album 1",
        type: "album",
        album_type: "album",
        uri: "u",
        href: "h",
        artists: [{ id: "a1", name: "Artist", type: "artist", uri: "u", href: "h", external_urls: {} }],
        images: [],
        release_date: "2020-01-01",
        release_date_precision: "day",
        total_tracks: 10,
        external_urls: {},
      }),
    ) as unknown as FetchFn;

    const result = await getAlbums(["alb1"], mockFetch);
    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe("Album 1");
    expect(mockFetch).toHaveBeenCalledWith("/albums/alb1");
  });

  test("getArtists fetches each artist by ID", async () => {
    const mockFetch = mock(() =>
      Promise.resolve({
        id: "art1",
        name: "Artist 1",
        type: "artist",
        uri: "u",
        href: "h",
        external_urls: {},
        images: [],
      }),
    ) as unknown as FetchFn;

    const result = await getArtists(["art1"], mockFetch);
    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe("Artist 1");
    expect(mockFetch).toHaveBeenCalledWith("/artists/art1");
  });

  test("fetches sequentially, not in parallel", async () => {
    const callOrder: string[] = [];
    const mockFetch = mock((path: string) => {
      callOrder.push(path);
      return Promise.resolve(makeTrack(path.split("/")[2] ?? "", "T"));
    }) as unknown as FetchFn;

    await getTracks(["a", "b", "c"], mockFetch);
    expect(callOrder).toEqual(["/tracks/a", "/tracks/b", "/tracks/c"]);
  });

  test("returns empty array for empty input", async () => {
    const mockFetch = mock(() => Promise.resolve({})) as unknown as FetchFn;
    const result = await getTracks([], mockFetch);
    expect(result).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
