import { describe, expect, mock, test } from "bun:test";
import { getAlbums, getArtists, getTracks } from "./batch.js";
import type { FetchFn } from "./client.js";

function makeMockFetch(response: unknown): FetchFn {
  return mock(() => Promise.resolve(response)) as unknown as FetchFn;
}

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

describe("batch API", () => {
  test("getTracks calls /tracks with comma-separated ids", async () => {
    const mockFetch = makeMockFetch({ tracks: [makeTrack("abc", "Track A")] });
    const result = await getTracks(["abc"], mockFetch);
    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe("Track A");
    expect(mockFetch).toHaveBeenCalledWith("/tracks", { params: { ids: "abc" } });
  });

  test("getTracks filters out null entries", async () => {
    const mockFetch = makeMockFetch({ tracks: [null] });
    const result = await getTracks(["bad"], mockFetch);
    expect(result).toHaveLength(0);
  });

  test("getAlbums calls /albums", async () => {
    const mockFetch = makeMockFetch({
      albums: [
        {
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
        },
      ],
    });
    const result = await getAlbums(["alb1"], mockFetch);
    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe("Album 1");
  });

  test("getArtists calls /artists", async () => {
    const mockFetch = makeMockFetch({
      artists: [
        {
          id: "art1",
          name: "Artist 1",
          type: "artist",
          uri: "u",
          href: "h",
          external_urls: {},
          images: [],
        },
      ],
    });
    const result = await getArtists(["art1"], mockFetch);
    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe("Artist 1");
  });

  test("chunks large ID lists into batches of 50", async () => {
    const ids = Array.from({ length: 75 }, (_, i) => `id${i}`);
    const mockFetch = mock(() =>
      Promise.resolve({
        tracks: [makeTrack("id0", "Track 0")],
      }),
    ) as unknown as FetchFn;
    await getTracks(ids, mockFetch);
    expect(mockFetch).toHaveBeenCalledTimes(2); // 50 + 25
  });
});
