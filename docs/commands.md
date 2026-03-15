# Command Reference

40 commands for your terminal. All output is JSON to stdout; errors go to stderr.

```sh
$ spotify <command> [options]
```

## Authentication <Badge type="tip" text="3 commands" />

### login

OAuth PKCE login — opens your browser to authorize with Spotify.

```sh
$ spotify login [--client-id <id>]
```

| Option | Type | Description |
|---|---|---|
| `--client-id` | `string` | Use a custom Spotify app client ID |

```json
{ "status": "logged_in", "expires_at": 1700000000, "scope": "user-read-playback-state ..." }
```

### logout

Clear stored OAuth tokens from disk.

```sh
$ spotify logout
```

### auth-status

Show token validity and granted scopes.

```sh
$ spotify auth-status
```

```json
{ "status": "valid", "expires_at": 1700000000, "scope": ["user-read-playback-state", "..."] }
```

## Player <Badge type="tip" text="14 commands" />

### now

Currently playing track.

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

### play

Start or resume playback with optional targeting.

```sh
$ spotify play [--uri <uri>] [--context <uri>] [--device <id>] [--offset <n>] [--position <ms>]
```

| Option | Type | Description |
|---|---|---|
| `--uri` | `string` | Spotify URI of a track to play |
| `--context` | `string` | Context URI (album, playlist, artist) |
| `--device` | `string` | Target device ID |
| `--offset` | `integer` | Zero-based track offset within context |
| `--position` | `integer` | Start position in milliseconds |

### pause

Pause playback.

```sh
$ spotify pause [--device <id>]
```

### next

Skip to next track.

```sh
$ spotify next [--device <id>]
```

### prev

Skip to previous track.

```sh
$ spotify prev [--device <id>]
```

### seek

Seek to a position in the current track.

```sh
$ spotify seek <ms> [--device <id>]
```

| Option | Type | Description |
|---|---|---|
| `<ms>` | `integer` | Position in milliseconds (non-negative) |
| `--device` | `string` | Target device ID |

### volume

Set playback volume.

```sh
$ spotify volume <0-100> [--device <id>]
```

| Option | Type | Description |
|---|---|---|
| `<0-100>` | `integer` | Volume level (0–100) |
| `--device` | `string` | Target device ID |

### shuffle

Toggle shuffle mode.

```sh
$ spotify shuffle <on|off> [--device <id>]
```

### repeat

Set repeat mode.

```sh
$ spotify repeat <off|track|context> [--device <id>]
```

### queue

Show the current playback queue.

```sh
$ spotify queue
```

### queue-add

Add a track to the end of the playback queue.

```sh
$ spotify queue-add <uri> [--device <id>]
```

### devices

List all available playback devices.

```sh
$ spotify devices
```

### transfer

Transfer playback to a different device.

```sh
$ spotify transfer <device_id> [--play]
```

| Option | Type | Description |
|---|---|---|
| `<device_id>` | `string` | Target device ID |
| `--play` | `boolean` | Start playback on the new device |

### recent

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

### search

Search the Spotify catalog. Defaults to searching for tracks.

```sh
$ spotify search <query> [--type <type>] [--limit <n>] [--offset <n>]
```

| Option | Type | Default | Description |
|---|---|---|---|
| `<query>` | `string` | | Search query (multiple words joined) |
| `--type` | `string` | `track` | Comma-separated types: `track`, `album`, `artist`, `playlist` |
| `--limit` | `integer` | | Number of results to return |
| `--offset` | `integer` | | Result offset for pagination |

```json
{
  "tracks": {
    "items": [
      { "name": "Blinding Lights", "artists": [{ "name": "The Weeknd" }], "uri": "spotify:track:0VjIjW4GlUZAMYd2vXMi3b" }
    ]
  }
}
```

## Tracks <Badge type="tip" text="6 commands" />

### track

Get track details.

```sh
$ spotify track <id>
```

### audio-features

Track audio analysis features.

```sh
$ spotify audio-features <id>
```

::: warning Deprecated
Spotify removed access to the Audio Features API for most apps in November 2024. This command may return a 403 error.
:::

```json
{
  "danceability": 0.735,
  "energy": 0.578,
  "tempo": 120.08,
  "valence": 0.624,
  "acousticness": 0.014
}
```

### recommendations

Get track recommendations based on seeds. At least one seed type is required.

```sh
$ spotify recommendations --seed-tracks <ids> --seed-artists <ids> --seed-genres <genres> [--limit <n>]
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

### saved-tracks

List saved tracks in your library.

```sh
$ spotify saved-tracks [--limit <n>] [--offset <n>]
```

### save-tracks

Save one or more tracks to your library.

```sh
$ spotify save-tracks <id...>
```

### remove-tracks

Remove one or more tracks from your library.

```sh
$ spotify remove-tracks <id...>
```

## Albums <Badge type="tip" text="5 commands" />

### album

Get album details.

```sh
$ spotify album <id>
```

### album-tracks

List tracks in an album.

```sh
$ spotify album-tracks <id> [--limit <n>] [--offset <n>]
```

### saved-albums

List saved albums in your library.

```sh
$ spotify saved-albums [--limit <n>] [--offset <n>]
```

### save-albums

Save one or more albums to your library.

```sh
$ spotify save-albums <id...>
```

### remove-albums

Remove one or more albums from your library.

```sh
$ spotify remove-albums <id...>
```

## Playlists <Badge type="tip" text="6 commands" />

### playlist

Get playlist details.

```sh
$ spotify playlist <id>
```

### playlists

List your playlists.

```sh
$ spotify playlists [--limit <n>] [--offset <n>]
```

### playlist-tracks

List tracks in a playlist.

```sh
$ spotify playlist-tracks <id> [--limit <n>] [--offset <n>]
```

### playlist-add

Add tracks to a playlist at an optional position.

```sh
$ spotify playlist-add <playlist_id> <uri...> [--position <n>]
```

| Option | Type | Description |
|---|---|---|
| `<playlist_id>` | `string` | Target playlist ID |
| `<uri...>` | `string` | One or more Spotify track URIs |
| `--position` | `integer` | Zero-based insert position |

### playlist-remove

Remove tracks from a playlist by URI, name match, or index.

```sh
$ spotify playlist-remove <playlist_id> [uri...] [--match <name>] [--index <n>]
```

| Option | Type | Description |
|---|---|---|
| `<playlist_id>` | `string` | Target playlist ID |
| `[uri...]` | `string` | Track URIs to remove |
| `--match` | `string` | Remove tracks matching name or artist name (repeatable) |
| `--index` | `string` | Remove tracks at 1-based positions (comma-separated, repeatable) |

At least one of `uri`, `--match`, or `--index` is required.

```sh
# Remove by name match
$ spotify playlist-remove 37i9dQZF1DXcBWIGoYBM5M --match "Bohemian"

# Remove by index
$ spotify playlist-remove 37i9dQZF1DXcBWIGoYBM5M --index 1,3,5
```

### playlist-create

Create a new playlist.

```sh
$ spotify playlist-create <name> [--description <text>] [--public]
```

| Option | Type | Description |
|---|---|---|
| `<name>` | `string` | Playlist name |
| `--description` | `string` | Playlist description |
| `--public` | `boolean` | Make the playlist public |

## User <Badge type="tip" text="5 commands" />

### me

Current user profile.

```sh
$ spotify me
```

### top

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

### following

List followed artists.

```sh
$ spotify following [--limit <n>] [--after <artist_id>]
```

| Option | Type | Description |
|---|---|---|
| `--limit` | `integer` | Number of items |
| `--after` | `string` | Cursor — last artist ID from previous page |

### follow

Follow one or more artists.

```sh
$ spotify follow <id...>
```

### unfollow

Unfollow one or more artists.

```sh
$ spotify unfollow <id...>
```

## Exit Codes

| Code | Name | Meaning |
|---|---|---|
| `0` | `SUCCESS` | Command completed successfully |
| `1` | `ARGS` | Invalid arguments or usage error |
| `2` | `AUTH` | Authentication failure (not logged in, token expired) |
| `3` | `API` | Spotify API returned an error |
| `4` | `NETWORK` | Network connectivity failure |

Errors are written to stderr as JSON:

```json
{ "error": "Not logged in. Run 'spotify login' first." }
```
