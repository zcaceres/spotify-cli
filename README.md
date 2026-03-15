# spotify-cli

Agent-friendly Spotify CLI. JSON-first output, flat subcommands, no interactive prompts.

Built with Bun + TypeScript + Zod. PKCE auth (no client secret needed).

## Prerequisites

- [Bun](https://bun.sh) runtime
- Spotify Premium account (required for playback controls)
- A Spotify Developer app (free, takes 2 minutes)

## Setup

### 1. Install dependencies

```bash
bun install
```

### 2. Create a Spotify app

All Spotify API access requires a registered app, even for personal use. It's free and no review is needed (dev mode supports up to 25 users).

1. Go to [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Click **Create App**
3. Fill in any name and description
4. Set the **Redirect URI** to `http://127.0.0.1:8888/callback`
5. Copy the **Client ID**

### 3. Log in

```bash
bun run src/cli.ts login --client-id <your-client-id>
```

This opens your browser for OAuth authorization. After approving, tokens are saved to `~/.spotify-cli/tokens.json`.

To skip the `--client-id` flag on future logins, set the environment variable:

```bash
export SPOTIFY_CLIENT_ID=<your-client-id>
```

Or save it permanently:

```bash
echo '{"client_id": "<your-client-id>"}' > ~/.spotify-cli/config.json
```

### 4. Verify

```bash
bun run src/cli.ts auth-status   # check token validity
bun run src/cli.ts me             # your profile
bun run src/cli.ts now            # currently playing
```

## Usage

```bash
bun run src/cli.ts <command> [args] [--flags]
```

All output is JSON to stdout. Errors go to stderr as JSON.

### Commands

#### Auth
| Command | Description |
|---------|-------------|
| `login` | OAuth PKCE login (opens browser) |
| `logout` | Clear stored tokens |
| `auth-status` | Show token validity and scopes |

#### Player (requires Premium)
| Command | Description |
|---------|-------------|
| `now` | Currently playing track |
| `play` | Start/resume playback (`--uri`, `--context`, `--device`, `--offset`, `--position`) |
| `pause` | Pause playback |
| `next` | Skip to next track |
| `prev` | Skip to previous track |
| `seek <ms>` | Seek to position |
| `volume <0-100>` | Set volume |
| `shuffle <on\|off>` | Toggle shuffle |
| `repeat <off\|track\|context>` | Set repeat mode |
| `queue` | Show playback queue |
| `queue-add <uri>` | Add track to queue |
| `devices` | List available devices |
| `transfer <device_id>` | Transfer playback (`--play`) |
| `recent` | Recently played tracks (`--limit`, `--after`, `--before`) |

#### Search
| Command | Description |
|---------|-------------|
| `search <query>` | Search Spotify (`--type`, `--limit`, `--offset`) |

#### Library
| Command | Description |
|---------|-------------|
| `track <id>` | Get track details |
| `saved-tracks` | List saved tracks (`--limit`, `--offset`) |
| `save-tracks <id...>` | Save tracks to library |
| `remove-tracks <id...>` | Remove saved tracks |
| `audio-features <id>` | Track audio features |
| `recommendations` | Get recommendations (`--seed-tracks`, `--seed-artists`, `--seed-genres`) |

#### Albums
| Command | Description |
|---------|-------------|
| `album <id>` | Get album details |
| `album-tracks <id>` | List album tracks (`--limit`, `--offset`) |
| `saved-albums` | List saved albums (`--limit`, `--offset`) |
| `save-albums <id...>` | Save albums to library |
| `remove-albums <id...>` | Remove saved albums |

#### Playlists
| Command | Description |
|---------|-------------|
| `playlist <id>` | Get playlist details |
| `playlists` | List your playlists (`--limit`, `--offset`) |
| `playlist-tracks <id>` | List playlist tracks (`--limit`, `--offset`) |
| `playlist-add <id> <uri...>` | Add tracks to playlist (`--position`) |
| `playlist-remove <id> [uri...]` | Remove tracks (`--match`, `--index`, or URIs) |
| `playlist-create <name>` | Create playlist (`--description`, `--public`) |

#### User
| Command | Description |
|---------|-------------|
| `me` | Current user profile |
| `top <artists\|tracks>` | Top items (`--time-range`, `--limit`) |
| `following` | Followed artists (`--limit`, `--after`) |
| `follow <id...>` | Follow artists |
| `unfollow <id...>` | Unfollow artists |

## Exit codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Invalid arguments |
| 2 | Auth error |
| 3 | Spotify API error |
| 4 | Network error |

## Known limitations

- `audio-features` and `recommendations` are restricted for Spotify apps created after November 2024 unless you have extended quota mode approval.
- Queue and playback state schemas handle tracks only, not podcast episodes.
