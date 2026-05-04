<Badge type="tip" text="COMMAND REFERENCE" />

# Command Reference

Control Spotify playback, manage your library, search the catalog, and build automations — all from the command line. By default every command returns structured JSON. Pass `--text` for human-readable plaintext output.

```sh
$ spotify <command> [options]
```

### `--text` flag <Badge type="info" text="GLOBAL" />

Add `--text` to any command for concise, human-readable output instead of JSON. Useful for quick terminal checks and as a token-efficient format for LLM tool use.

```sh
$ spotify now --text
Now playing: Thunderstruck - AC/DC

$ spotify devices --text
1. Living Room Speaker (Speaker) [active]
2. MacBook Pro (Computer)

$ spotify volume 80 --text
Volume set to 80
```

The flag can appear anywhere in the argument list. Errors in text mode include the error code:

```
Error: Unknown command: foo [UNKNOWN_COMMAND]
```

## Authentication <Badge type="tip" text="3 commands" />

Manage OAuth tokens and session state. All auth data is stored locally — nothing is sent to third-party servers.

### login <Badge type="info" text="AUTH" />

Authenticate with Spotify using OAuth 2.0 PKCE. Opens browser to authorize, then stores tokens locally.

```sh
$ spotify login [--client-id <id>]
```

| Option | Type | Description |
|---|---|---|
| `--client-id` | `string` | Use a custom Spotify app client ID |

**OUTPUT**

```json
{ "status": "logged_in", "expires_at": 1700000000, "scope": "user-read-playback-state ..." }
```

### logout <Badge type="info" text="AUTH" />

Clear stored OAuth tokens from disk.

```sh
$ spotify logout
```

**OUTPUT**

```json
{ "status": "logged_out" }
```

### auth status <Badge type="info" text="AUTH" />

Show current token validity and granted OAuth scopes.

```sh
$ spotify auth status
```

**OUTPUT**

```json
{ "status": "valid", "expires_at": 1700000000, "scope": ["user-read-playback-state", "user-modify-playback-state", "..."] }
```

## Player <Badge type="tip" text="14 commands" />

Control playback, manage the queue, and interact with Spotify Connect devices. Most commands accept an optional `--device` flag to target a specific device.

### now <Badge type="info" text="PLAYER" />

Get the currently playing track with playback state.

```sh
$ spotify now
```

```json
{
  "item": {
    "name": "Bohemian Rhapsody",
    "artists": [{ "name": "Queen" }],
    "album": { "name": "A Night at the Opera" }
  },
  "is_playing": true,
  "progress_ms": 42000
}
```

### play <Badge type="info" text="PLAYER" />

Start or resume playback with optional targeting.

```sh
$ spotify play [--uri <uri>] [--context <uri>] [--device <id>] [--offset <n>] [--position <ms>]
```

| Option | Type | Description |
|---|---|---|
| `--uri` | `string` | Spotify URI of a track to play |
| `--context` | `string` | Context URI (album, playlist, or artist) to play within |
| `--device` | `string` | Target device ID |
| `--offset` | `integer` | Zero-based track offset within context |
| `--position` | `integer` | Start position in milliseconds |

<div class="compact-grid">

### pause <Badge type="info" text="PLAYER" />

Pause playback on the active device.

```sh
$ spotify pause [--device <id>]
```

### next <Badge type="info" text="PLAYER" />

Skip to the next track in the queue.

```sh
$ spotify next [--device <id>]
```

### prev <Badge type="info" text="PLAYER" />

Skip to the previous track.

```sh
$ spotify prev [--device <id>]
```

### seek <Badge type="info" text="PLAYER" />

Seek to a position in the current track.

```sh
$ spotify seek <ms> [--device <id>]
```

| Option | Type | Description |
|---|---|---|
| `<ms>` | `integer` | Position in milliseconds (non-negative) |
| `--device` | `string` | Target device ID |

### volume <Badge type="info" text="PLAYER" />

Set playback volume (0–100).

```sh
$ spotify volume <0-100> [--device <id>]
```

| Option | Type | Description |
|---|---|---|
| `<0-100>` | `integer` | Volume level (0–100) |
| `--device` | `string` | Target device ID |

### shuffle <Badge type="info" text="PLAYER" />

Toggle shuffle mode on or off.

```sh
$ spotify shuffle <on|off> [--device <id>]
```

### repeat <Badge type="info" text="PLAYER" />

Set repeat mode: off, track, or context.

```sh
$ spotify repeat <off|track|context> [--device <id>]
```

</div>

### queue <Badge type="info" text="PLAYER" />

Show the current playback queue.

```sh
$ spotify queue
```

### queue add <Badge type="info" text="PLAYER" />

Add a track to the end of the playback queue. Accepts a Spotify URI, a track ID, or a human-readable search query.

```sh
$ spotify queue add <uri|id|query> [--device <id>]
```

```sh
$ spotify queue add "bohemian rhapsody"
```

```json
{
  "status": "added_to_queue",
  "uri": "spotify:track:1BvDpRRJj7aYJfYUrxyH5N",
  "items": [
    { "type": "track", "id": "1BvDpRRJj7aYJfYUrxyH5N", "name": "Bohemian Rhapsody", "artist": "Queen", "album": "The Best Songs Of All Time" }
  ],
  "searched": [
    { "query": "bohemian rhapsody", "match": { "type": "track", "id": "1BvDpRRJj7aYJfYUrxyH5N", "name": "Bohemian Rhapsody", "artist": "Queen" } }
  ]
}
```

The `searched` field only appears when a search was performed. Full `spotify:` URIs are passed through directly.

### devices <Badge type="info" text="PLAYER" />

List all available Spotify Connect devices.

```sh
$ spotify devices
```

### transfer <Badge type="info" text="PLAYER" />

Transfer playback to a different device.

```sh
$ spotify transfer <device_id> [--play]
```

| Option | Type | Description |
|---|---|---|
| `<device_id>` | `string` | Target device ID |
| `--play` | `boolean` | Start playback on the new device |

### recent <Badge type="info" text="PLAYER" />

Recently played tracks with optional cursor-based pagination.

```sh
$ spotify recent [--limit <n>] [--after <timestamp>] [--before <timestamp>]
```

| Option | Type | Description |
|---|---|---|
| `--limit` | `integer` | Number of items to return |
| `--after` | `integer` | Unix timestamp — return items after this |
| `--before` | `integer` | Unix timestamp — return items before this |

## Search <Badge type="tip" text="1 command" />

Full-text search across the Spotify catalog. Supports tracks, albums, artists, and playlists.

### search <Badge type="info" text="SEARCH" />

Search the Spotify catalog. Defaults to searching for tracks.

```sh
$ spotify search <query> [--type <type>] [--limit <n>] [--offset <n>]
```

| Option | Type | Default | Description |
|---|---|---|---|
| `<query>` | `string` | | Search query (multiple words joined) |
| `--type` | `string` | `track` | Comma-separated types: `track`, `album`, `artist`, `playlist`, `show`, `episode` |
| `--limit` | `integer` | | Number of results to return |
| `--offset` | `integer` | | Result offset for pagination |

```sh
$ spotify search "Miles Davis" --type artist --limit 3
```

```json
{
  "artists": {
    "items": [
      { "name": "Miles Davis", "uri": "spotify:artist:0kbYTNQb1g4...", "popularity": 72 }
    ]
  }
}
```

## Tracks <Badge type="tip" text="7 commands" />

Look up individual tracks, analyze audio features, get recommendations, and manage your saved library.

### track <Badge type="info" text="TRACKS" />

Get detailed track metadata. Accepts a Spotify ID or full URI.

```sh
$ spotify track <id|uri>
```

### track find <Badge type="info" text="TRACKS" />

Resolve a track to its canonical URI by exact title + artist. Uses Spotify's `track:"X" artist:"Y"` filter syntax — deterministic and not personalized, unlike `spotify search`. Returns the top match in the same shape as `spotify track <id>`, or exits with `NOT_FOUND` (code 3) when nothing matches.

```sh
$ spotify track find --title <title> --artist <artist>
```

| Option | Type | Description |
|---|---|---|
| `--title` | `string` | Exact track title |
| `--artist` | `string` | Exact artist name |

```sh
$ spotify track find --title "Believer" --artist "Imagine Dragons" | jq -r .uri
# spotify:track:1WxLYjSg7PzYoxrkQHLp83
```

Prefer `track find` over `search` for agentic workflows where you have a known title + artist and need a deterministic URI.

### track features <Badge type="info" text="TRACKS" />

Get audio analysis features for a track. Accepts a Spotify ID or full URI.

```sh
$ spotify track features <id|uri>
```

::: warning Deprecated
Spotify removed access to the Audio Features API for most apps in November 2024. This command may return a 403 error.
:::

```json
{
  "danceability": 0.735,
  "energy": 0.578,
  "key": 5,
  "loudness": -5.883,
  "tempo": 120.08,
  "valence": 0.624,
  "acousticness": 0.014
}
```

### track recommendations <Badge type="info" text="TRACKS" />

Get track recommendations based on seed tracks, artists, or genres. At least one seed type is required.

```sh
$ spotify track recommendations --seed-tracks <ids> --seed-artists <ids> --seed-genres <genres> [--limit <n>]
```

| Option | Type | Description |
|---|---|---|
| `--seed-tracks` | `string` | Comma-separated track IDs |
| `--seed-artists` | `string` | Comma-separated artist IDs |
| `--seed-genres` | `string` | Comma-separated genre names |
| `--limit` | `integer` | Number of recommendations |

::: warning Deprecated
Spotify removed access to the Recommendations API for most apps in November 2024. This command may return a 403 or 404 error.
:::

<div class="compact-grid">

### track saved <Badge type="info" text="TRACKS" />

List saved tracks in your library.

```sh
$ spotify track saved [--limit <n>] [--offset <n>]
```

### track save <Badge type="info" text="TRACKS" />

Save one or more tracks to your library. Accepts Spotify IDs, URIs, or human-readable search queries.

```sh
$ spotify track save <id|query...>
```

```sh
$ spotify track save "bohemian rhapsody"
```

```json
{
  "status": "saved",
  "ids": ["4uLU6hMCjMI75M1A2tKUQC"],
  "items": [
    { "type": "track", "id": "4uLU6hMCjMI75M1A2tKUQC", "name": "Bohemian Rhapsody", "artist": "Queen", "album": "A Night at the Opera" }
  ],
  "searched": [
    { "query": "bohemian rhapsody", "match": { "type": "track", "id": "4uLU6hMCjMI75M1A2tKUQC", "name": "Bohemian Rhapsody", "artist": "Queen" } }
  ]
}
```

The `items` field enriches Spotify's opaque IDs with human-readable metadata. The `searched` field only appears when a search query was used instead of a direct ID.

### track remove <Badge type="info" text="TRACKS" />

Remove one or more tracks from your library. Accepts Spotify IDs, URIs, or human-readable search queries.

```sh
$ spotify track remove <id|query...>
```

</div>

## Albums <Badge type="tip" text="5 commands" />

Fetch album metadata, list album tracks, and manage your saved album library.

### album <Badge type="info" text="ALBUMS" />

Get album details and metadata. Accepts a Spotify ID or full URI.

```sh
$ spotify album <id|uri>
```

### album tracks <Badge type="info" text="ALBUMS" />

List all tracks in an album. Accepts a Spotify ID or full URI.

```sh
$ spotify album tracks <id|uri> [--limit <n>] [--offset <n>]
```

<div class="compact-grid">

### album saved <Badge type="info" text="ALBUMS" />

List saved albums in your library.

```sh
$ spotify album saved [--limit <n>] [--offset <n>]
```

### album save <Badge type="info" text="ALBUMS" />

Save one or more albums to your library. Accepts Spotify IDs, URIs, or human-readable search queries.

```sh
$ spotify album save <id|query...>
```

### album remove <Badge type="info" text="ALBUMS" />

Remove one or more albums from your library. Accepts Spotify IDs, URIs, or human-readable search queries.

```sh
$ spotify album remove <id|query...>
```

</div>

## Playlists <Badge type="tip" text="8 commands" />

Create, modify, and browse playlists. Supports adding and removing tracks by URI, name match, or index position.

### playlist <Badge type="info" text="PLAYLISTS" />

Get playlist details and metadata. Accepts a Spotify ID or full URI.

```sh
$ spotify playlist <id|uri>
```

### playlist list <Badge type="info" text="PLAYLISTS" />

List your playlists.

```sh
$ spotify playlist list [--limit <n>] [--offset <n>]
```

### playlist tracks <Badge type="info" text="PLAYLISTS" />

List tracks in a playlist. Accepts a Spotify ID or full URI.

```sh
$ spotify playlist tracks <id|uri> [--limit <n>] [--offset <n>]
```

### playlist add <Badge type="info" text="PLAYLISTS" />

Add tracks to a playlist at an optional position. Track arguments accept Spotify IDs, URIs, or human-readable search queries. URIs may also be supplied via `--uris-file` or piped on stdin via the `-` sentinel; all sources concatenate.

```sh
$ spotify playlist add <playlist_id> [<uri|id|query>...] [--uris-file <path>] [-] [--position <n>]
```

| Option | Type | Description |
|---|---|---|
| `<playlist_id>` | `string` | Target playlist ID |
| `[<uri\|id\|query>...]` | `string` | One or more track URIs, IDs, or search queries |
| `--uris-file` | `path` | File of URIs/IDs/queries, one per line. Blank lines and `#` comments are ignored. |
| `-` | sentinel | Read URIs/IDs/queries from stdin (one per line). |
| `--position` | `integer` | Zero-based insert position |

```sh
# From a file
$ spotify playlist add 37i9dQZF1DXcBWIGoYBM5M --uris-file uris.txt

# From stdin
$ printf 'spotify:track:aaa\nspotify:track:bbb\n' | spotify playlist add 37i9dQZF1DXcBWIGoYBM5M -

# Mix positional + file
$ spotify playlist add 37i9dQZF1DXcBWIGoYBM5M spotify:track:aaa --uris-file more.txt
```

### playlist remove <Badge type="info" text="PLAYLISTS" />

Remove tracks from a playlist by URI, name match, or index. URIs may also be supplied via `--uris-file` or piped on stdin via the `-` sentinel.

```sh
$ spotify playlist remove <playlist_id> [<uri|id|query>...] [--uris-file <path>] [-] [--match <name>] [--index <n>]
```

| Option | Type | Description |
|---|---|---|
| `<playlist_id>` | `string` | Target playlist ID |
| `[<uri\|id\|query>...]` | `string` | Track URIs, IDs, or search queries to remove |
| `--uris-file` | `path` | File of URIs/IDs/queries, one per line. Blank lines and `#` comments are ignored. |
| `-` | sentinel | Read URIs/IDs/queries from stdin (one per line). |
| `--match` | `string` | Remove tracks matching name or artist name (repeatable) |
| `--index` | `string` | Remove tracks at 1-based positions (comma-separated, repeatable) |

At least one of `uri`, `--uris-file`, `-`, `--match`, or `--index` is required.

```sh
# Remove by name match
$ spotify playlist remove 37i9dQZF1DXcBWIGoYBM5M --match "Bohemian"

# Remove by index
$ spotify playlist remove 37i9dQZF1DXcBWIGoYBM5M --index 1,3,5

# Remove URIs listed in a file
$ spotify playlist remove 37i9dQZF1DXcBWIGoYBM5M --uris-file remove-list.txt
```

### playlist create <Badge type="info" text="PLAYLISTS" />

Create a new playlist.

```sh
$ spotify playlist create <name> [--description <text>] [--public]
```

| Option | Type | Description |
|---|---|---|
| `<name>` | `string` | Playlist name |
| `--description` | `string` | Playlist description |
| `--public` | `boolean` | Make the playlist public |

### playlist rename <Badge type="info" text="PLAYLISTS" />

Rename an existing playlist. Accepts a Spotify ID or full URI.

```sh
$ spotify playlist rename <id|uri> <new_name>
```

| Option | Type | Description |
|---|---|---|
| `<id\|uri>` | `string` | Playlist ID or URI |
| `<new_name>` | `string` | New playlist name (quote if it contains spaces) |

### playlist update <Badge type="info" text="PLAYLISTS" />

Update one or more details of an existing playlist. At least one field flag must be provided. Accepts a Spotify ID or full URI.

```sh
$ spotify playlist update <id|uri> [--name <text>] [--description <text>] [--public|--private] [--collaborative|--no-collaborative]
```

| Option | Type | Description |
|---|---|---|
| `<id\|uri>` | `string` | Playlist ID or URI |
| `--name` | `string` | New playlist name |
| `--description` | `string` | New description (pass `""` to clear) |
| `--public` / `--private` | `boolean` | Make the playlist public or private (mutually exclusive) |
| `--collaborative` / `--no-collaborative` | `boolean` | Toggle collaborative mode (mutually exclusive). Spotify requires the playlist to be private for collaborative to be enabled. |

```sh
# Make a playlist private
$ spotify playlist update 37i9dQZF1DXcBWIGoYBM5M --private

# Rename and clear the description in one call
$ spotify playlist update 37i9dQZF1DXcBWIGoYBM5M --name "New Name" --description ""
```

## User <Badge type="tip" text="5 commands" />

View your profile, top listening stats, and manage artist follows.

### me <Badge type="info" text="USER" />

Get the current user's profile.

```sh
$ spotify me
```

### top <Badge type="info" text="USER" />

Your top artists or tracks over different time ranges.

```sh
$ spotify top <artists|tracks> [--time-range <range>] [--limit <n>] [--offset <n>]
```

| Option | Type | Default | Description |
|---|---|---|---|
| `<artists\|tracks>` | `string` | | Item type |
| `--time-range` | `string` | `medium_term` | `short_term` (4 weeks), `medium_term` (6 months), `long_term` (all time) |
| `--limit` | `integer` | | Number of items |
| `--offset` | `integer` | | Result offset |

```json
{
  "items": [
    { "name": "Radiohead", "uri": "spotify:artist:4Z8W4fKeB5YxbusRsdQVPb", "popularity": 82 }
  ]
}
```

### following <Badge type="info" text="USER" />

List followed artists.

```sh
$ spotify following [--limit <n>] [--after <artist_id>]
```

| Option | Type | Description |
|---|---|---|
| `--limit` | `integer` | Number of items |
| `--after` | `string` | Cursor — last artist ID from previous page |

<div class="compact-grid">

### follow <Badge type="info" text="USER" />

Follow one or more artists. Accepts Spotify IDs, URIs, or human-readable search queries.

```sh
$ spotify follow <id|query...>
```

### unfollow <Badge type="info" text="USER" />

Unfollow one or more artists. Accepts Spotify IDs, URIs, or human-readable search queries.

```sh
$ spotify unfollow <id|query...>
```

</div>

## Exit Codes

All commands use consistent exit codes for scripting and automation.

| Code | Name | Meaning |
|---|---|---|
| `0` | `SUCCESS` | Command completed successfully |
| `1` | `ARGS` | Invalid arguments or missing required options |
| `2` | `AUTH` | Not logged in or token expired |
| `3` | `API` | Spotify API returned an error (4xx/5xx) |
| `4` | `NETWORK` | Network connectivity failure |

Errors are written to stderr as JSON (or plaintext with `--text`):

```json
{ "error": "No active device found", "details": { "code": "NOT_FOUND", "status": 404, "path": "/me/player/seek" } }
```

```sh
# With --text
Error: No active device found [NOT_FOUND]
```
