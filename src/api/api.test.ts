import { beforeEach, describe, expect, test } from "bun:test";
import { fixtures } from "../test/fixtures/index.js";
import * as albums from "./albums.js";
import type { FetchFn } from "./client.js";
import * as player from "./player.js";
import * as playlists from "./playlists.js";
import * as search from "./search.js";
import * as tracks from "./tracks.js";
import * as user from "./user.js";

let calls: unknown[][] = [];
let returnValue: unknown;

const mockFetch: FetchFn = ((...args: unknown[]) => {
  calls.push(args);
  return Promise.resolve(returnValue);
}) as FetchFn;

beforeEach(() => {
  calls = [];
  returnValue = undefined;
});

function calledWith(...expected: unknown[]) {
  expect(calls).toHaveLength(1);
  expect(calls[0]).toEqual(expected);
}

describe("tracks API", () => {
  test("getTrack calls correct path", async () => {
    returnValue = fixtures.track;
    const result = await tracks.getTrack("57bgtoPSgt236HzfBOd8kj", mockFetch);
    calledWith("/tracks/57bgtoPSgt236HzfBOd8kj");
    expect(result).toEqual(fixtures.track);
  });

  test("getSavedTracks passes pagination params", async () => {
    returnValue = fixtures.savedTracks;
    await tracks.getSavedTracks({ limit: 2, offset: 0 }, mockFetch);
    calledWith("/me/tracks", { params: { limit: 2, offset: 0 } });
  });

  test("saveTracks builds URIs and calls /me/library with PUT", async () => {
    await tracks.saveTracks(["57bgtoPSgt236HzfBOd8kj", "0cLvKgKkqlaJ9UajbitH4l"], mockFetch);
    calledWith("/me/library", {
      method: "PUT",
      params: { uris: "spotify:track:57bgtoPSgt236HzfBOd8kj,spotify:track:0cLvKgKkqlaJ9UajbitH4l" },
    });
  });

  test("saveTracks preserves full URIs if already prefixed", async () => {
    await tracks.saveTracks(["spotify:track:57bgtoPSgt236HzfBOd8kj"], mockFetch);
    calledWith("/me/library", {
      method: "PUT",
      params: { uris: "spotify:track:57bgtoPSgt236HzfBOd8kj" },
    });
  });

  test("removeTracks calls /me/library with DELETE", async () => {
    await tracks.removeTracks(["57bgtoPSgt236HzfBOd8kj"], mockFetch);
    calledWith("/me/library", {
      method: "DELETE",
      params: { uris: "spotify:track:57bgtoPSgt236HzfBOd8kj" },
    });
  });

  test("getAudioFeatures calls correct path", async () => {
    await tracks.getAudioFeatures("57bgtoPSgt236HzfBOd8kj", mockFetch);
    calledWith("/audio-features/57bgtoPSgt236HzfBOd8kj");
  });

  test("getRecommendations passes seed params", async () => {
    returnValue = { tracks: [] };
    await tracks.getRecommendations({ seed_tracks: "57bgtoPSgt236HzfBOd8kj", limit: 5 }, mockFetch);
    calledWith("/recommendations", {
      params: {
        seed_tracks: "57bgtoPSgt236HzfBOd8kj",
        seed_artists: undefined,
        seed_genres: undefined,
        limit: 5,
      },
    });
  });
});

describe("albums API", () => {
  test("getAlbum calls correct path", async () => {
    returnValue = fixtures.album;
    const result = await albums.getAlbum("4vu7F6h90Br1ZtYYaqfITy", mockFetch);
    calledWith("/albums/4vu7F6h90Br1ZtYYaqfITy");
    expect(result).toEqual(fixtures.album);
  });

  test("getAlbumTracks passes pagination", async () => {
    returnValue = fixtures.albumTracks;
    await albums.getAlbumTracks("4vu7F6h90Br1ZtYYaqfITy", { limit: 2, offset: 0 }, mockFetch);
    calledWith("/albums/4vu7F6h90Br1ZtYYaqfITy/tracks", { params: { limit: 2, offset: 0 } });
  });

  test("getSavedAlbums passes pagination", async () => {
    returnValue = fixtures.savedTracks;
    await albums.getSavedAlbums({ limit: 2, offset: 0 }, mockFetch);
    calledWith("/me/albums", { params: { limit: 2, offset: 0 } });
  });

  test("saveAlbums builds URIs and calls /me/library with PUT", async () => {
    await albums.saveAlbums(["4vu7F6h90Br1ZtYYaqfITy"], mockFetch);
    calledWith("/me/library", {
      method: "PUT",
      params: { uris: "spotify:album:4vu7F6h90Br1ZtYYaqfITy" },
    });
  });

  test("removeAlbums calls /me/library with DELETE", async () => {
    await albums.removeAlbums(["4vu7F6h90Br1ZtYYaqfITy"], mockFetch);
    calledWith("/me/library", {
      method: "DELETE",
      params: { uris: "spotify:album:4vu7F6h90Br1ZtYYaqfITy" },
    });
  });
});

describe("playlists API", () => {
  test("getPlaylist calls correct path", async () => {
    returnValue = fixtures.playlists.items[0];
    await playlists.getPlaylist("abc123", mockFetch);
    calledWith("/playlists/abc123");
  });

  test("getCurrentUserPlaylists passes pagination", async () => {
    returnValue = fixtures.playlists;
    await playlists.getCurrentUserPlaylists({ limit: 2, offset: 0 }, mockFetch);
    calledWith("/me/playlists", { params: { limit: 2, offset: 0 } });
  });

  test("getPlaylistTracks passes pagination", async () => {
    returnValue = fixtures.playlistTracks;
    await playlists.getPlaylistTracks("abc123", { limit: 50, offset: 0 }, mockFetch);
    calledWith("/playlists/abc123/items", { params: { limit: 50, offset: 0 } });
  });

  test("addTracksToPlaylist sends POST with URIs and position", async () => {
    returnValue = fixtures.snapshotId;
    await playlists.addTracksToPlaylist("abc123", ["spotify:track:57bgtoPSgt236HzfBOd8kj"], 0, mockFetch);
    calledWith("/playlists/abc123/items", {
      method: "POST",
      body: { uris: ["spotify:track:57bgtoPSgt236HzfBOd8kj"], position: 0 },
    });
  });

  test("addTracksToPlaylist omits position when undefined", async () => {
    returnValue = fixtures.snapshotId;
    await playlists.addTracksToPlaylist("abc123", ["spotify:track:57bgtoPSgt236HzfBOd8kj"], undefined, mockFetch);
    calledWith("/playlists/abc123/items", {
      method: "POST",
      body: { uris: ["spotify:track:57bgtoPSgt236HzfBOd8kj"], position: undefined },
    });
  });

  test("removeTracksFromPlaylist sends DELETE with items array", async () => {
    returnValue = fixtures.snapshotId;
    await playlists.removeTracksFromPlaylist("abc123", ["spotify:track:57bgtoPSgt236HzfBOd8kj"], mockFetch);
    calledWith("/playlists/abc123/items", {
      method: "DELETE",
      body: { items: [{ uri: "spotify:track:57bgtoPSgt236HzfBOd8kj" }] },
    });
  });

  test("replacePlaylistTracks sends PUT with ordered URIs", async () => {
    returnValue = fixtures.snapshotId;
    const uris = ["spotify:track:aaa", "spotify:track:bbb"];
    await playlists.replacePlaylistTracks("abc123", uris, mockFetch);
    calledWith("/playlists/abc123/items", {
      method: "PUT",
      body: { uris },
    });
  });

  test("createPlaylist sends POST to /me/playlists", async () => {
    returnValue = fixtures.playlistCreated;
    await playlists.createPlaylist({ name: "Test Playlist", description: "A test", public: true }, mockFetch);
    calledWith("/me/playlists", {
      method: "POST",
      body: { name: "Test Playlist", description: "A test", public: true },
    });
  });
});

describe("player API", () => {
  test("getCurrentlyPlaying calls correct path", async () => {
    returnValue = fixtures.currentlyPlaying;
    const result = await player.getCurrentlyPlaying(mockFetch);
    calledWith("/me/player/currently-playing");
    expect(result).toEqual(fixtures.currentlyPlaying);
  });

  test("startPlayback sends PUT with body and device_id param", async () => {
    await player.startPlayback({ device_id: "device123", uris: ["spotify:track:57bgtoPSgt236HzfBOd8kj"] }, mockFetch);
    calledWith("/me/player/play", {
      method: "PUT",
      params: { device_id: "device123" },
      body: { uris: ["spotify:track:57bgtoPSgt236HzfBOd8kj"] },
    });
  });

  test("startPlayback with no body sends undefined body", async () => {
    await player.startPlayback({}, mockFetch);
    calledWith("/me/player/play", {
      method: "PUT",
      params: { device_id: undefined },
      body: undefined,
    });
  });

  test("pausePlayback sends PUT with device_id", async () => {
    await player.pausePlayback("device123", mockFetch);
    calledWith("/me/player/pause", {
      method: "PUT",
      params: { device_id: "device123" },
    });
  });

  test("skipToNext sends POST", async () => {
    await player.skipToNext(undefined, mockFetch);
    calledWith("/me/player/next", {
      method: "POST",
      params: { device_id: undefined },
    });
  });

  test("skipToPrevious sends POST", async () => {
    await player.skipToPrevious("device123", mockFetch);
    calledWith("/me/player/previous", {
      method: "POST",
      params: { device_id: "device123" },
    });
  });

  test("seekToPosition sends PUT with position_ms", async () => {
    await player.seekToPosition(45000, undefined, mockFetch);
    calledWith("/me/player/seek", {
      method: "PUT",
      params: { position_ms: 45000, device_id: undefined },
    });
  });

  test("setVolume sends PUT with volume_percent", async () => {
    await player.setVolume(75, "device123", mockFetch);
    calledWith("/me/player/volume", {
      method: "PUT",
      params: { volume_percent: 75, device_id: "device123" },
    });
  });

  test("setShuffle sends PUT with state boolean", async () => {
    await player.setShuffle(true, undefined, mockFetch);
    calledWith("/me/player/shuffle", {
      method: "PUT",
      params: { state: true, device_id: undefined },
    });
  });

  test("setRepeat sends PUT with state string", async () => {
    await player.setRepeat("track", "device123", mockFetch);
    calledWith("/me/player/repeat", {
      method: "PUT",
      params: { state: "track", device_id: "device123" },
    });
  });

  test("getQueue calls correct path", async () => {
    returnValue = fixtures.queue;
    const result = await player.getQueue(mockFetch);
    calledWith("/me/player/queue");
    expect(result).toEqual(fixtures.queue);
  });

  test("addToQueue sends POST with uri param", async () => {
    await player.addToQueue("spotify:track:57bgtoPSgt236HzfBOd8kj", undefined, mockFetch);
    calledWith("/me/player/queue", {
      method: "POST",
      params: { uri: "spotify:track:57bgtoPSgt236HzfBOd8kj", device_id: undefined },
    });
  });

  test("getDevices calls correct path", async () => {
    returnValue = fixtures.devices;
    const result = await player.getDevices(mockFetch);
    calledWith("/me/player/devices");
    expect(result).toEqual(fixtures.devices);
  });

  test("transferPlayback sends PUT with device_ids body", async () => {
    await player.transferPlayback("device123", true, mockFetch);
    calledWith("/me/player", {
      method: "PUT",
      body: { device_ids: ["device123"], play: true },
    });
  });

  test("getRecentlyPlayed passes pagination params", async () => {
    returnValue = fixtures.recentlyPlayed;
    await player.getRecentlyPlayed({ limit: 2 }, mockFetch);
    calledWith("/me/player/recently-played", {
      params: { limit: 2, after: undefined, before: undefined },
    });
  });
});

describe("search API", () => {
  test("search passes query and type params", async () => {
    returnValue = fixtures.searchTracks;
    const result = await search.search({ q: "Thunderstruck", type: "track", limit: 1 }, mockFetch);
    calledWith("/search", {
      params: { q: "Thunderstruck", type: "track", limit: 1, offset: undefined },
    });
    expect(result).toEqual(fixtures.searchTracks);
  });

  test("search with multiple types and offset", async () => {
    await search.search({ q: "AC/DC", type: "track,album", limit: 5, offset: 10 }, mockFetch);
    calledWith("/search", {
      params: { q: "AC/DC", type: "track,album", limit: 5, offset: 10 },
    });
  });
});

describe("user API", () => {
  test("getCurrentUser calls /me", async () => {
    returnValue = fixtures.me;
    const result = await user.getCurrentUser(mockFetch);
    calledWith("/me");
    expect(result).toEqual(fixtures.me);
  });

  test("getTopItems passes type and options", async () => {
    returnValue = fixtures.topTracks;
    await user.getTopItems("tracks", { limit: 2, time_range: "short_term" }, mockFetch);
    calledWith("/me/top/tracks", {
      params: { limit: 2, time_range: "short_term", offset: undefined },
    });
  });

  test("getFollowedArtists passes limit and after cursor", async () => {
    returnValue = fixtures.followedArtists;
    await user.getFollowedArtists({ limit: 2, after: "4MzzjPw3VUmr72ZphV54Sa" }, mockFetch);
    calledWith("/me/following", {
      params: { type: "artist", limit: 2, after: "4MzzjPw3VUmr72ZphV54Sa" },
    });
  });

  test("followArtists builds URIs and calls /me/library with PUT", async () => {
    await user.followArtists(["711MCceyCBcFnzjGY4Q7Un"], mockFetch);
    calledWith("/me/library", {
      method: "PUT",
      params: { uris: "spotify:artist:711MCceyCBcFnzjGY4Q7Un" },
    });
  });

  test("unfollowArtists calls /me/library with DELETE", async () => {
    await user.unfollowArtists(["711MCceyCBcFnzjGY4Q7Un"], mockFetch);
    calledWith("/me/library", {
      method: "DELETE",
      params: { uris: "spotify:artist:711MCceyCBcFnzjGY4Q7Un" },
    });
  });
});
