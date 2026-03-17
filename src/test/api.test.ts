import { beforeEach, describe, expect, mock, test } from "bun:test";
import * as albums from "../api/albums.js";
import type { FetchFn } from "../api/client.js";
import * as player from "../api/player.js";
import * as playlists from "../api/playlists.js";
import * as search from "../api/search.js";
import * as tracks from "../api/tracks.js";
import * as user from "../api/user.js";
import { fixtures } from "./fixtures/index.js";

const mockFetch = mock() as unknown as ReturnType<typeof mock> & FetchFn;

beforeEach(() => {
  mockFetch.mockReset();
});

describe("tracks API", () => {
  test("getTrack calls correct path", async () => {
    mockFetch.mockResolvedValue(fixtures.track);
    const result = await tracks.getTrack("57bgtoPSgt236HzfBOd8kj", mockFetch);
    expect(mockFetch).toHaveBeenCalledWith("/tracks/57bgtoPSgt236HzfBOd8kj");
    expect(result).toEqual(fixtures.track);
  });

  test("getSavedTracks passes pagination params", async () => {
    mockFetch.mockResolvedValue(fixtures.savedTracks);
    await tracks.getSavedTracks({ limit: 2, offset: 0 }, mockFetch);
    expect(mockFetch).toHaveBeenCalledWith("/me/tracks", {
      params: { limit: 2, offset: 0 },
    });
  });

  test("saveTracks builds URIs and calls /me/library with PUT", async () => {
    mockFetch.mockResolvedValue(undefined);
    await tracks.saveTracks(["57bgtoPSgt236HzfBOd8kj", "0cLvKgKkqlaJ9UajbitH4l"], mockFetch);
    expect(mockFetch).toHaveBeenCalledWith("/me/library", {
      method: "PUT",
      params: { uris: "spotify:track:57bgtoPSgt236HzfBOd8kj,spotify:track:0cLvKgKkqlaJ9UajbitH4l" },
    });
  });

  test("saveTracks preserves full URIs if already prefixed", async () => {
    mockFetch.mockResolvedValue(undefined);
    await tracks.saveTracks(["spotify:track:57bgtoPSgt236HzfBOd8kj"], mockFetch);
    expect(mockFetch).toHaveBeenCalledWith("/me/library", {
      method: "PUT",
      params: { uris: "spotify:track:57bgtoPSgt236HzfBOd8kj" },
    });
  });

  test("removeTracks calls /me/library with DELETE", async () => {
    mockFetch.mockResolvedValue(undefined);
    await tracks.removeTracks(["57bgtoPSgt236HzfBOd8kj"], mockFetch);
    expect(mockFetch).toHaveBeenCalledWith("/me/library", {
      method: "DELETE",
      params: { uris: "spotify:track:57bgtoPSgt236HzfBOd8kj" },
    });
  });

  test("getAudioFeatures calls correct path", async () => {
    mockFetch.mockResolvedValue({});
    await tracks.getAudioFeatures("57bgtoPSgt236HzfBOd8kj", mockFetch);
    expect(mockFetch).toHaveBeenCalledWith("/audio-features/57bgtoPSgt236HzfBOd8kj");
  });

  test("getRecommendations passes seed params", async () => {
    mockFetch.mockResolvedValue({ tracks: [] });
    await tracks.getRecommendations(
      {
        seed_tracks: "57bgtoPSgt236HzfBOd8kj",
        limit: 5,
      },
      mockFetch,
    );
    expect(mockFetch).toHaveBeenCalledWith("/recommendations", {
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
    mockFetch.mockResolvedValue(fixtures.album);
    const result = await albums.getAlbum("4vu7F6h90Br1ZtYYaqfITy", mockFetch);
    expect(mockFetch).toHaveBeenCalledWith("/albums/4vu7F6h90Br1ZtYYaqfITy");
    expect(result).toEqual(fixtures.album);
  });

  test("getAlbumTracks passes pagination", async () => {
    mockFetch.mockResolvedValue(fixtures.albumTracks);
    await albums.getAlbumTracks("4vu7F6h90Br1ZtYYaqfITy", { limit: 2, offset: 0 }, mockFetch);
    expect(mockFetch).toHaveBeenCalledWith("/albums/4vu7F6h90Br1ZtYYaqfITy/tracks", {
      params: { limit: 2, offset: 0 },
    });
  });

  test("getSavedAlbums passes pagination", async () => {
    mockFetch.mockResolvedValue(fixtures.savedTracks);
    await albums.getSavedAlbums({ limit: 2, offset: 0 }, mockFetch);
    expect(mockFetch).toHaveBeenCalledWith("/me/albums", {
      params: { limit: 2, offset: 0 },
    });
  });

  test("saveAlbums builds URIs and calls /me/library with PUT", async () => {
    mockFetch.mockResolvedValue(undefined);
    await albums.saveAlbums(["4vu7F6h90Br1ZtYYaqfITy"], mockFetch);
    expect(mockFetch).toHaveBeenCalledWith("/me/library", {
      method: "PUT",
      params: { uris: "spotify:album:4vu7F6h90Br1ZtYYaqfITy" },
    });
  });

  test("removeAlbums calls /me/library with DELETE", async () => {
    mockFetch.mockResolvedValue(undefined);
    await albums.removeAlbums(["4vu7F6h90Br1ZtYYaqfITy"], mockFetch);
    expect(mockFetch).toHaveBeenCalledWith("/me/library", {
      method: "DELETE",
      params: { uris: "spotify:album:4vu7F6h90Br1ZtYYaqfITy" },
    });
  });
});

describe("playlists API", () => {
  test("getPlaylist calls correct path", async () => {
    mockFetch.mockResolvedValue(fixtures.playlists.items[0]);
    await playlists.getPlaylist("abc123", mockFetch);
    expect(mockFetch).toHaveBeenCalledWith("/playlists/abc123");
  });

  test("getCurrentUserPlaylists passes pagination", async () => {
    mockFetch.mockResolvedValue(fixtures.playlists);
    await playlists.getCurrentUserPlaylists({ limit: 2, offset: 0 }, mockFetch);
    expect(mockFetch).toHaveBeenCalledWith("/me/playlists", {
      params: { limit: 2, offset: 0 },
    });
  });

  test("getPlaylistTracks passes pagination", async () => {
    mockFetch.mockResolvedValue(fixtures.playlistTracks);
    await playlists.getPlaylistTracks("abc123", { limit: 50, offset: 0 }, mockFetch);
    expect(mockFetch).toHaveBeenCalledWith("/playlists/abc123/items", {
      params: { limit: 50, offset: 0 },
    });
  });

  test("addTracksToPlaylist sends POST with URIs and position", async () => {
    mockFetch.mockResolvedValue(fixtures.snapshotId);
    await playlists.addTracksToPlaylist("abc123", ["spotify:track:57bgtoPSgt236HzfBOd8kj"], 0, mockFetch);
    expect(mockFetch).toHaveBeenCalledWith("/playlists/abc123/items", {
      method: "POST",
      body: { uris: ["spotify:track:57bgtoPSgt236HzfBOd8kj"], position: 0 },
    });
  });

  test("addTracksToPlaylist omits position when undefined", async () => {
    mockFetch.mockResolvedValue(fixtures.snapshotId);
    await playlists.addTracksToPlaylist("abc123", ["spotify:track:57bgtoPSgt236HzfBOd8kj"], undefined, mockFetch);
    expect(mockFetch).toHaveBeenCalledWith("/playlists/abc123/items", {
      method: "POST",
      body: { uris: ["spotify:track:57bgtoPSgt236HzfBOd8kj"], position: undefined },
    });
  });

  test("removeTracksFromPlaylist sends DELETE with items array", async () => {
    mockFetch.mockResolvedValue(fixtures.snapshotId);
    await playlists.removeTracksFromPlaylist("abc123", ["spotify:track:57bgtoPSgt236HzfBOd8kj"], mockFetch);
    expect(mockFetch).toHaveBeenCalledWith("/playlists/abc123/items", {
      method: "DELETE",
      body: { items: [{ uri: "spotify:track:57bgtoPSgt236HzfBOd8kj" }] },
    });
  });

  test("replacePlaylistTracks sends PUT with ordered URIs", async () => {
    mockFetch.mockResolvedValue(fixtures.snapshotId);
    const uris = ["spotify:track:aaa", "spotify:track:bbb"];
    await playlists.replacePlaylistTracks("abc123", uris, mockFetch);
    expect(mockFetch).toHaveBeenCalledWith("/playlists/abc123/items", {
      method: "PUT",
      body: { uris },
    });
  });

  test("createPlaylist sends POST to /me/playlists", async () => {
    mockFetch.mockResolvedValue(fixtures.playlistCreated);
    await playlists.createPlaylist({ name: "Test Playlist", description: "A test", public: true }, mockFetch);
    expect(mockFetch).toHaveBeenCalledWith("/me/playlists", {
      method: "POST",
      body: { name: "Test Playlist", description: "A test", public: true },
    });
  });
});

describe("player API", () => {
  test("getCurrentlyPlaying calls correct path", async () => {
    mockFetch.mockResolvedValue(fixtures.currentlyPlaying);
    const result = await player.getCurrentlyPlaying(mockFetch);
    expect(mockFetch).toHaveBeenCalledWith("/me/player/currently-playing");
    expect(result).toEqual(fixtures.currentlyPlaying);
  });

  test("startPlayback sends PUT with body and device_id param", async () => {
    mockFetch.mockResolvedValue(undefined);
    await player.startPlayback(
      {
        device_id: "device123",
        uris: ["spotify:track:57bgtoPSgt236HzfBOd8kj"],
      },
      mockFetch,
    );
    expect(mockFetch).toHaveBeenCalledWith("/me/player/play", {
      method: "PUT",
      params: { device_id: "device123" },
      body: { uris: ["spotify:track:57bgtoPSgt236HzfBOd8kj"] },
    });
  });

  test("startPlayback with no body sends undefined body", async () => {
    mockFetch.mockResolvedValue(undefined);
    await player.startPlayback({}, mockFetch);
    expect(mockFetch).toHaveBeenCalledWith("/me/player/play", {
      method: "PUT",
      params: { device_id: undefined },
      body: undefined,
    });
  });

  test("pausePlayback sends PUT with device_id", async () => {
    mockFetch.mockResolvedValue(undefined);
    await player.pausePlayback("device123", mockFetch);
    expect(mockFetch).toHaveBeenCalledWith("/me/player/pause", {
      method: "PUT",
      params: { device_id: "device123" },
    });
  });

  test("skipToNext sends POST", async () => {
    mockFetch.mockResolvedValue(undefined);
    await player.skipToNext(undefined, mockFetch);
    expect(mockFetch).toHaveBeenCalledWith("/me/player/next", {
      method: "POST",
      params: { device_id: undefined },
    });
  });

  test("skipToPrevious sends POST", async () => {
    mockFetch.mockResolvedValue(undefined);
    await player.skipToPrevious("device123", mockFetch);
    expect(mockFetch).toHaveBeenCalledWith("/me/player/previous", {
      method: "POST",
      params: { device_id: "device123" },
    });
  });

  test("seekToPosition sends PUT with position_ms", async () => {
    mockFetch.mockResolvedValue(undefined);
    await player.seekToPosition(45000, undefined, mockFetch);
    expect(mockFetch).toHaveBeenCalledWith("/me/player/seek", {
      method: "PUT",
      params: { position_ms: 45000, device_id: undefined },
    });
  });

  test("setVolume sends PUT with volume_percent", async () => {
    mockFetch.mockResolvedValue(undefined);
    await player.setVolume(75, "device123", mockFetch);
    expect(mockFetch).toHaveBeenCalledWith("/me/player/volume", {
      method: "PUT",
      params: { volume_percent: 75, device_id: "device123" },
    });
  });

  test("setShuffle sends PUT with state boolean", async () => {
    mockFetch.mockResolvedValue(undefined);
    await player.setShuffle(true, undefined, mockFetch);
    expect(mockFetch).toHaveBeenCalledWith("/me/player/shuffle", {
      method: "PUT",
      params: { state: true, device_id: undefined },
    });
  });

  test("setRepeat sends PUT with state string", async () => {
    mockFetch.mockResolvedValue(undefined);
    await player.setRepeat("track", "device123", mockFetch);
    expect(mockFetch).toHaveBeenCalledWith("/me/player/repeat", {
      method: "PUT",
      params: { state: "track", device_id: "device123" },
    });
  });

  test("getQueue calls correct path", async () => {
    mockFetch.mockResolvedValue(fixtures.queue);
    const result = await player.getQueue(mockFetch);
    expect(mockFetch).toHaveBeenCalledWith("/me/player/queue");
    expect(result).toEqual(fixtures.queue);
  });

  test("addToQueue sends POST with uri param", async () => {
    mockFetch.mockResolvedValue(undefined);
    await player.addToQueue("spotify:track:57bgtoPSgt236HzfBOd8kj", undefined, mockFetch);
    expect(mockFetch).toHaveBeenCalledWith("/me/player/queue", {
      method: "POST",
      params: { uri: "spotify:track:57bgtoPSgt236HzfBOd8kj", device_id: undefined },
    });
  });

  test("getDevices calls correct path", async () => {
    mockFetch.mockResolvedValue(fixtures.devices);
    const result = await player.getDevices(mockFetch);
    expect(mockFetch).toHaveBeenCalledWith("/me/player/devices");
    expect(result).toEqual(fixtures.devices);
  });

  test("transferPlayback sends PUT with device_ids body", async () => {
    mockFetch.mockResolvedValue(undefined);
    await player.transferPlayback("device123", true, mockFetch);
    expect(mockFetch).toHaveBeenCalledWith("/me/player", {
      method: "PUT",
      body: { device_ids: ["device123"], play: true },
    });
  });

  test("getRecentlyPlayed passes pagination params", async () => {
    mockFetch.mockResolvedValue(fixtures.recentlyPlayed);
    await player.getRecentlyPlayed({ limit: 2 }, mockFetch);
    expect(mockFetch).toHaveBeenCalledWith("/me/player/recently-played", {
      params: { limit: 2, after: undefined, before: undefined },
    });
  });
});

describe("search API", () => {
  test("search passes query and type params", async () => {
    mockFetch.mockResolvedValue(fixtures.searchTracks);
    const result = await search.search({ q: "Thunderstruck", type: "track", limit: 1 }, mockFetch);
    expect(mockFetch).toHaveBeenCalledWith("/search", {
      params: { q: "Thunderstruck", type: "track", limit: 1, offset: undefined },
    });
    expect(result).toEqual(fixtures.searchTracks);
  });

  test("search with multiple types and offset", async () => {
    mockFetch.mockResolvedValue({});
    await search.search({ q: "AC/DC", type: "track,album", limit: 5, offset: 10 }, mockFetch);
    expect(mockFetch).toHaveBeenCalledWith("/search", {
      params: { q: "AC/DC", type: "track,album", limit: 5, offset: 10 },
    });
  });
});

describe("user API", () => {
  test("getCurrentUser calls /me", async () => {
    mockFetch.mockResolvedValue(fixtures.me);
    const result = await user.getCurrentUser(mockFetch);
    expect(mockFetch).toHaveBeenCalledWith("/me");
    expect(result).toEqual(fixtures.me);
  });

  test("getTopItems passes type and options", async () => {
    mockFetch.mockResolvedValue(fixtures.topTracks);
    await user.getTopItems("tracks", { limit: 2, time_range: "short_term" }, mockFetch);
    expect(mockFetch).toHaveBeenCalledWith("/me/top/tracks", {
      params: { limit: 2, time_range: "short_term", offset: undefined },
    });
  });

  test("getFollowedArtists passes limit and after cursor", async () => {
    mockFetch.mockResolvedValue(fixtures.followedArtists);
    await user.getFollowedArtists({ limit: 2, after: "4MzzjPw3VUmr72ZphV54Sa" }, mockFetch);
    expect(mockFetch).toHaveBeenCalledWith("/me/following", {
      params: { type: "artist", limit: 2, after: "4MzzjPw3VUmr72ZphV54Sa" },
    });
  });

  test("followArtists builds URIs and calls /me/library with PUT", async () => {
    mockFetch.mockResolvedValue(undefined);
    await user.followArtists(["711MCceyCBcFnzjGY4Q7Un"], mockFetch);
    expect(mockFetch).toHaveBeenCalledWith("/me/library", {
      method: "PUT",
      params: { uris: "spotify:artist:711MCceyCBcFnzjGY4Q7Un" },
    });
  });

  test("unfollowArtists calls /me/library with DELETE", async () => {
    mockFetch.mockResolvedValue(undefined);
    await user.unfollowArtists(["711MCceyCBcFnzjGY4Q7Un"], mockFetch);
    expect(mockFetch).toHaveBeenCalledWith("/me/library", {
      method: "DELETE",
      params: { uris: "spotify:artist:711MCceyCBcFnzjGY4Q7Un" },
    });
  });
});
