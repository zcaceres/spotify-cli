/**
 * Real Spotify API response fixtures (sanitized).
 *
 * Captured from live API responses with personal info removed.
 * Used by integration tests to verify API modules handle real response shapes.
 *
 * @module
 */

export const fixtures = {
  me: {
    country: "US",
    display_name: "testuser",
    email: "test@example.com",
    explicit_content: { filter_enabled: false, filter_locked: false },
    external_urls: { spotify: "https://open.spotify.com/user/testuser" },
    followers: { href: null, total: 46 },
    href: "https://api.spotify.com/v1/users/testuser",
    id: "testuser",
    images: [],
    product: "premium",
    type: "user",
    uri: "spotify:user:testuser",
  },

  track: {
    album: {
      album_type: "album",
      artists: [
        {
          external_urls: { spotify: "https://open.spotify.com/artist/711MCceyCBcFnzjGY4Q7Un" },
          href: "https://api.spotify.com/v1/artists/711MCceyCBcFnzjGY4Q7Un",
          id: "711MCceyCBcFnzjGY4Q7Un",
          name: "AC/DC",
          type: "artist",
          uri: "spotify:artist:711MCceyCBcFnzjGY4Q7Un",
        },
      ],
      external_urls: { spotify: "https://open.spotify.com/album/4vu7F6h90Br1ZtYYaqfITy" },
      href: "https://api.spotify.com/v1/albums/4vu7F6h90Br1ZtYYaqfITy",
      id: "4vu7F6h90Br1ZtYYaqfITy",
      images: [
        { url: "https://i.scdn.co/image/ab67616d0000b2739a9b1cc067e4460da04adce2", width: 640, height: 640 },
        { url: "https://i.scdn.co/image/ab67616d00001e029a9b1cc067e4460da04adce2", width: 300, height: 300 },
        { url: "https://i.scdn.co/image/ab67616d000048519a9b1cc067e4460da04adce2", width: 64, height: 64 },
      ],
      is_playable: true,
      name: "The Razors Edge",
      release_date: "1990-09-24",
      release_date_precision: "day",
      total_tracks: 12,
      type: "album",
      uri: "spotify:album:4vu7F6h90Br1ZtYYaqfITy",
    },
    artists: [
      {
        external_urls: { spotify: "https://open.spotify.com/artist/711MCceyCBcFnzjGY4Q7Un" },
        href: "https://api.spotify.com/v1/artists/711MCceyCBcFnzjGY4Q7Un",
        id: "711MCceyCBcFnzjGY4Q7Un",
        name: "AC/DC",
        type: "artist",
        uri: "spotify:artist:711MCceyCBcFnzjGY4Q7Un",
      },
    ],
    disc_number: 1,
    duration_ms: 292333,
    explicit: false,
    external_ids: { isrc: "AUAP09000014" },
    external_urls: { spotify: "https://open.spotify.com/track/57bgtoPSgt236HzfBOd8kj" },
    href: "https://api.spotify.com/v1/tracks/57bgtoPSgt236HzfBOd8kj",
    id: "57bgtoPSgt236HzfBOd8kj",
    is_local: false,
    is_playable: true,
    name: "Thunderstruck",
    track_number: 1,
    type: "track",
    uri: "spotify:track:57bgtoPSgt236HzfBOd8kj",
  },

  searchTracks: {
    tracks: {
      href: "https://api.spotify.com/v1/search?offset=0&limit=1&query=Thunderstruck%20AC%2FDC&type=track",
      limit: 1,
      next: "https://api.spotify.com/v1/search?offset=1&limit=1&query=Thunderstruck%20AC%2FDC&type=track",
      offset: 0,
      previous: null,
      total: 1000,
      items: [
        {
          album: {
            album_type: "album",
            artists: [{ external_urls: { spotify: "https://open.spotify.com/artist/711MCceyCBcFnzjGY4Q7Un" }, href: "https://api.spotify.com/v1/artists/711MCceyCBcFnzjGY4Q7Un", id: "711MCceyCBcFnzjGY4Q7Un", name: "AC/DC", type: "artist", uri: "spotify:artist:711MCceyCBcFnzjGY4Q7Un" }],
            external_urls: { spotify: "https://open.spotify.com/album/4vu7F6h90Br1ZtYYaqfITy" },
            href: "https://api.spotify.com/v1/albums/4vu7F6h90Br1ZtYYaqfITy",
            id: "4vu7F6h90Br1ZtYYaqfITy",
            images: [{ height: 640, width: 640, url: "https://i.scdn.co/image/ab67616d0000b2739a9b1cc067e4460da04adce2" }],
            is_playable: true,
            name: "The Razors Edge",
            release_date: "1990-09-24",
            release_date_precision: "day",
            total_tracks: 12,
            type: "album",
            uri: "spotify:album:4vu7F6h90Br1ZtYYaqfITy",
          },
          artists: [{ external_urls: { spotify: "https://open.spotify.com/artist/711MCceyCBcFnzjGY4Q7Un" }, href: "https://api.spotify.com/v1/artists/711MCceyCBcFnzjGY4Q7Un", id: "711MCceyCBcFnzjGY4Q7Un", name: "AC/DC", type: "artist", uri: "spotify:artist:711MCceyCBcFnzjGY4Q7Un" }],
          disc_number: 1,
          duration_ms: 292333,
          explicit: false,
          external_ids: { isrc: "AUAP09000014" },
          external_urls: { spotify: "https://open.spotify.com/track/57bgtoPSgt236HzfBOd8kj" },
          href: "https://api.spotify.com/v1/tracks/57bgtoPSgt236HzfBOd8kj",
          id: "57bgtoPSgt236HzfBOd8kj",
          is_local: false,
          is_playable: true,
          name: "Thunderstruck",
          track_number: 1,
          type: "track",
          uri: "spotify:track:57bgtoPSgt236HzfBOd8kj",
        },
      ],
    },
  },

  album: {
    album_type: "album",
    total_tracks: 12,
    external_urls: { spotify: "https://open.spotify.com/album/4vu7F6h90Br1ZtYYaqfITy" },
    href: "https://api.spotify.com/v1/albums/4vu7F6h90Br1ZtYYaqfITy",
    id: "4vu7F6h90Br1ZtYYaqfITy",
    images: [
      { url: "https://i.scdn.co/image/ab67616d0000b2739a9b1cc067e4460da04adce2", height: 640, width: 640 },
      { url: "https://i.scdn.co/image/ab67616d00001e029a9b1cc067e4460da04adce2", height: 300, width: 300 },
      { url: "https://i.scdn.co/image/ab67616d000048519a9b1cc067e4460da04adce2", height: 64, width: 64 },
    ],
    name: "The Razors Edge",
    release_date: "1990-09-24",
    release_date_precision: "day",
    type: "album",
    uri: "spotify:album:4vu7F6h90Br1ZtYYaqfITy",
    artists: [
      {
        external_urls: { spotify: "https://open.spotify.com/artist/711MCceyCBcFnzjGY4Q7Un" },
        href: "https://api.spotify.com/v1/artists/711MCceyCBcFnzjGY4Q7Un",
        id: "711MCceyCBcFnzjGY4Q7Un",
        name: "AC/DC",
        type: "artist",
        uri: "spotify:artist:711MCceyCBcFnzjGY4Q7Un",
      },
    ],
    copyrights: [{ text: "(P) 1990 Leidseplein Presse B.V.", type: "P" }],
    external_ids: { upc: "886444890151" },
    genres: [],
  },

  albumTracks: {
    href: "https://api.spotify.com/v1/albums/4vu7F6h90Br1ZtYYaqfITy/tracks?offset=0&limit=2",
    items: [
      {
        artists: [{ external_urls: { spotify: "https://open.spotify.com/artist/711MCceyCBcFnzjGY4Q7Un" }, href: "https://api.spotify.com/v1/artists/711MCceyCBcFnzjGY4Q7Un", id: "711MCceyCBcFnzjGY4Q7Un", name: "AC/DC", type: "artist", uri: "spotify:artist:711MCceyCBcFnzjGY4Q7Un" }],
        disc_number: 1,
        duration_ms: 292333,
        explicit: false,
        external_urls: { spotify: "https://open.spotify.com/track/57bgtoPSgt236HzfBOd8kj" },
        href: "https://api.spotify.com/v1/tracks/57bgtoPSgt236HzfBOd8kj",
        id: "57bgtoPSgt236HzfBOd8kj",
        name: "Thunderstruck",
        track_number: 1,
        type: "track",
        uri: "spotify:track:57bgtoPSgt236HzfBOd8kj",
        is_local: false,
      },
      {
        artists: [{ external_urls: { spotify: "https://open.spotify.com/artist/711MCceyCBcFnzjGY4Q7Un" }, href: "https://api.spotify.com/v1/artists/711MCceyCBcFnzjGY4Q7Un", id: "711MCceyCBcFnzjGY4Q7Un", name: "AC/DC", type: "artist", uri: "spotify:artist:711MCceyCBcFnzjGY4Q7Un" }],
        disc_number: 1,
        duration_ms: 173753,
        explicit: false,
        external_urls: { spotify: "https://open.spotify.com/track/0cLvKgKkqlaJ9UajbitH4l" },
        href: "https://api.spotify.com/v1/tracks/0cLvKgKkqlaJ9UajbitH4l",
        id: "0cLvKgKkqlaJ9UajbitH4l",
        name: "Fire Your Guns",
        track_number: 2,
        type: "track",
        uri: "spotify:track:0cLvKgKkqlaJ9UajbitH4l",
        is_local: false,
      },
    ],
    limit: 2,
    next: "https://api.spotify.com/v1/albums/4vu7F6h90Br1ZtYYaqfITy/tracks?offset=2&limit=2",
    offset: 0,
    previous: null,
    total: 12,
  },

  playlists: {
    href: "https://api.spotify.com/v1/me/playlists?offset=0&limit=2",
    limit: 2,
    next: "https://api.spotify.com/v1/me/playlists?offset=2&limit=2",
    offset: 0,
    previous: null,
    total: 112,
    items: [
      {
        collaborative: false,
        description: "",
        external_urls: { spotify: "https://open.spotify.com/playlist/abc123" },
        href: "https://api.spotify.com/v1/playlists/abc123",
        id: "abc123",
        images: null,
        name: "Test Playlist",
        owner: {
          display_name: "testuser",
          external_urls: { spotify: "https://open.spotify.com/user/testuser" },
          href: "https://api.spotify.com/v1/users/testuser",
          id: "testuser",
          type: "user",
          uri: "spotify:user:testuser",
        },
        primary_color: null,
        public: true,
        snapshot_id: "AAAAAeVjTHxxOP/x8oDpg0679osdxtIR",
        items: { href: "https://api.spotify.com/v1/playlists/abc123/items", total: 5 },
        type: "playlist",
        uri: "spotify:playlist:abc123",
      },
    ],
  },

  playlistTracks: {
    href: "https://api.spotify.com/v1/playlists/abc123/items?offset=0&limit=2",
    items: [
      {
        added_at: "2026-01-01T00:00:00Z",
        item: {
          album: {
            album_type: "album",
            artists: [{ external_urls: { spotify: "https://open.spotify.com/artist/711MCceyCBcFnzjGY4Q7Un" }, href: "https://api.spotify.com/v1/artists/711MCceyCBcFnzjGY4Q7Un", id: "711MCceyCBcFnzjGY4Q7Un", name: "AC/DC", type: "artist", uri: "spotify:artist:711MCceyCBcFnzjGY4Q7Un" }],
            name: "The Razors Edge",
            type: "album",
          },
          artists: [{ name: "AC/DC", id: "711MCceyCBcFnzjGY4Q7Un", type: "artist", uri: "spotify:artist:711MCceyCBcFnzjGY4Q7Un" }],
          duration_ms: 292333,
          id: "57bgtoPSgt236HzfBOd8kj",
          name: "Thunderstruck",
          type: "track",
          uri: "spotify:track:57bgtoPSgt236HzfBOd8kj",
        },
      },
    ],
    limit: 2,
    next: null,
    offset: 0,
    previous: null,
    total: 1,
  },

  savedTracks: {
    href: "https://api.spotify.com/v1/me/tracks?offset=0&limit=2",
    items: [
      {
        added_at: "2026-01-23T02:58:08Z",
        track: {
          album: {
            album_type: "album",
            artists: [{ external_urls: { spotify: "https://open.spotify.com/artist/12eNUx8BvR5qmpFssq8Vkt" }, href: "https://api.spotify.com/v1/artists/12eNUx8BvR5qmpFssq8Vkt", id: "12eNUx8BvR5qmpFssq8Vkt", name: "Soneros De Verdad", type: "artist", uri: "spotify:artist:12eNUx8BvR5qmpFssq8Vkt" }],
            name: "A Buena Vista: Barrio De La Habana",
            type: "album",
          },
          artists: [
            { name: "Soneros De Verdad", id: "12eNUx8BvR5qmpFssq8Vkt", type: "artist", uri: "spotify:artist:12eNUx8BvR5qmpFssq8Vkt" },
            { name: "Luis Frank", id: "3NOoOH3WZuJRNe5cvmW7ic", type: "artist", uri: "spotify:artist:3NOoOH3WZuJRNe5cvmW7ic" },
          ],
          duration_ms: 193693,
          id: "6K4iVISawI285iTxyvBIEB",
          name: "A Buena Vista",
          type: "track",
          uri: "spotify:track:6K4iVISawI285iTxyvBIEB",
        },
      },
    ],
    limit: 2,
    next: "https://api.spotify.com/v1/me/tracks?offset=2&limit=2",
    offset: 0,
    previous: null,
    total: 1500,
  },

  devices: {
    devices: [
      {
        id: "device123",
        is_active: false,
        is_private_session: false,
        is_restricted: false,
        name: "Test MacBook",
        supports_volume: true,
        type: "Computer",
        volume_percent: 50,
      },
    ],
  },

  queue: {
    currently_playing: null,
    queue: [],
  },

  recentlyPlayed: {
    items: [
      {
        track: {
          album: {
            album_type: "album",
            artists: [{ external_urls: { spotify: "https://open.spotify.com/artist/0gxyHStUsqpMadRV0Di1Qt" }, href: "https://api.spotify.com/v1/artists/0gxyHStUsqpMadRV0Di1Qt", id: "0gxyHStUsqpMadRV0Di1Qt", name: "Rick Astley", type: "artist", uri: "spotify:artist:0gxyHStUsqpMadRV0Di1Qt" }],
            name: "Whenever You Need Somebody",
            type: "album",
          },
          artists: [{ name: "Rick Astley", id: "0gxyHStUsqpMadRV0Di1Qt", type: "artist", uri: "spotify:artist:0gxyHStUsqpMadRV0Di1Qt" }],
          duration_ms: 213573,
          id: "4PTG3Z6ehGkBFwjybzWkR8",
          name: "Never Gonna Give You Up",
          type: "track",
          uri: "spotify:track:4PTG3Z6ehGkBFwjybzWkR8",
        },
        played_at: "2026-03-15T13:48:21.018Z",
        context: { type: "playlist", uri: "spotify:playlist:abc123" },
      },
    ],
    next: "https://api.spotify.com/v1/me/player/recently-played?before=1773547654577&limit=2",
    cursors: { after: "1773582501018", before: "1773547654577" },
    limit: 2,
    href: "https://api.spotify.com/v1/me/player/recently-played?limit=2",
  },

  topTracks: {
    items: [
      {
        album: {
          album_type: "album",
          artists: [{ external_urls: { spotify: "https://open.spotify.com/artist/6qxpnaukVayrQn6ViNvu9I" }, href: "https://api.spotify.com/v1/artists/6qxpnaukVayrQn6ViNvu9I", id: "6qxpnaukVayrQn6ViNvu9I", name: "BigXthaPlug", type: "artist", uri: "spotify:artist:6qxpnaukVayrQn6ViNvu9I" }],
          name: "AMAR",
          type: "album",
        },
        artists: [{ name: "BigXthaPlug", id: "6qxpnaukVayrQn6ViNvu9I", type: "artist", uri: "spotify:artist:6qxpnaukVayrQn6ViNvu9I" }],
        duration_ms: 146133,
        id: "7j7ud2oFTJ8BjmeI8bjkQm",
        name: "Texas",
        type: "track",
        uri: "spotify:track:7j7ud2oFTJ8BjmeI8bjkQm",
      },
    ],
    total: 5291,
    limit: 2,
    offset: 0,
    href: "https://api.spotify.com/v1/me/top/tracks?limit=2",
    next: "https://api.spotify.com/v1/me/top/tracks?offset=2&limit=2",
    previous: null,
  },

  followedArtists: {
    artists: {
      href: "https://api.spotify.com/v1/me/following?type=artist&limit=2",
      limit: 2,
      next: "https://api.spotify.com/v1/me/following?type=artist&limit=2&after=4MzzjPw3VUmr72ZphV54Sa",
      cursors: { after: "4MzzjPw3VUmr72ZphV54Sa" },
      total: 140,
      items: [
        {
          external_urls: { spotify: "https://open.spotify.com/artist/00n4Vljc6N9pvJ26SKPphh" },
          href: "https://api.spotify.com/v1/artists/00n4Vljc6N9pvJ26SKPphh",
          id: "00n4Vljc6N9pvJ26SKPphh",
          images: [{ url: "https://i.scdn.co/image/e6ba16e3b34581a4fcfb8bd11fac7bbf7bb40f77", height: 1477, width: 1000 }],
          name: "Ruben Gonzalez",
          type: "artist",
          uri: "spotify:artist:00n4Vljc6N9pvJ26SKPphh",
        },
      ],
    },
  },

  playlistCreated: {
    collaborative: false,
    description: "",
    external_urls: { spotify: "https://open.spotify.com/playlist/newplaylist123" },
    href: "https://api.spotify.com/v1/playlists/newplaylist123",
    id: "newplaylist123",
    images: null,
    name: "Test Playlist",
    owner: { display_name: "testuser", id: "testuser", type: "user", uri: "spotify:user:testuser" },
    public: true,
    snapshot_id: "AAAAAeVjTHx",
    tracks: { href: "https://api.spotify.com/v1/playlists/newplaylist123/tracks", total: 0 },
    type: "playlist",
    uri: "spotify:playlist:newplaylist123",
  },

  snapshotId: { snapshot_id: "abc123snapshot" },

  currentlyPlaying: {
    is_playing: true,
    progress_ms: 45000,
    item: {
      album: {
        album_type: "album",
        artists: [{ name: "AC/DC", id: "711MCceyCBcFnzjGY4Q7Un", type: "artist", uri: "spotify:artist:711MCceyCBcFnzjGY4Q7Un" }],
        name: "The Razors Edge",
        type: "album",
      },
      artists: [{ name: "AC/DC", id: "711MCceyCBcFnzjGY4Q7Un", type: "artist", uri: "spotify:artist:711MCceyCBcFnzjGY4Q7Un" }],
      duration_ms: 292333,
      id: "57bgtoPSgt236HzfBOd8kj",
      name: "Thunderstruck",
      type: "track",
      uri: "spotify:track:57bgtoPSgt236HzfBOd8kj",
    },
    device: { id: "device123", name: "Test MacBook", type: "Computer", volume_percent: 50 },
    shuffle_state: false,
    repeat_state: "off",
  },

  /** Spotify API error responses */
  errors: {
    unauthorized: { error: { status: 401, message: "The access token expired" } },
    notFound: { error: { status: 404, message: "Resource not found" } },
    forbidden: { error: { status: 403, message: "Forbidden" } },
    rateLimited: { error: { status: 429, message: "API rate limit exceeded" } },
    badRequest: { error: { status: 400, message: "Missing required field: uris" } },
  },
} as const;
