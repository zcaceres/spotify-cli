# spotify-cli

[![CI](https://github.com/zcaceres/spotify-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/zcaceres/spotify-cli/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
![Version](https://img.shields.io/badge/version-0.4.0-blue)

Secure, agent (and human) friendly CLI for playback, search, playlists, and library management. JSON output. PKCE auth.

**[Documentation](https://spotify-cli.zach.dev/)** · **[Command Reference](https://spotify-cli.zach.dev/commands)** · **[Releases](https://github.com/zcaceres/spotify-cli/releases)**

## Quick start

### Install

Download the latest binary for your platform from [Releases](https://github.com/zcaceres/spotify-cli/releases):

```bash
chmod +x spotify-darwin-arm64
xattr -d com.apple.quarantine spotify-darwin-arm64  # macOS only
sudo mv spotify-darwin-arm64 /usr/local/bin/spotify
```

Or run from source with [Bun](https://bun.sh):

```bash
git clone https://github.com/zcaceres/spotify-cli.git
cd spotify-cli && bun install
bun run src/cli.ts <command>  # instead of `spotify <command>`
```

### Set up a Spotify app

1. Go to [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Click **Create App**, set redirect URI to `http://127.0.0.1:8888/callback`
3. Copy the **Client ID**

### Log in

```bash
spotify login --client-id <your-client-id>
```

### Try it

```bash
spotify now                                    # what's playing
spotify search "bohemian rhapsody" --type track # search
spotify play --uri spotify:track:6rqhFgbbKwnb9MLmUQDhG6
spotify track saved --limit 5 | jq '.items[].track.name'  # pipe JSON anywhere
```

## Features

- **42 commands** — playback, search, library, playlists, albums, user profile
- **Search-then-act** — pass human-readable names where IDs are expected (e.g. `spotify queue add "bohemian rhapsody"`)
- **Enriched output** — Spotify's API returns opaque IDs for mutations; we resolve them to human/agent-readable names, artists, and albums automatically
- **JSON to stdout** — pipe to `jq`, scripts, or AI agents
- **PKCE auth** — no client secret, tokens refresh automatically
- **Structured errors** — JSON to stderr with [error codes](https://spotify-cli.zach.dev/commands#exit-codes) and exit codes
- **Zero config** — single binary, no runtime dependencies

## Exit codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Invalid arguments |
| 2 | Auth error |
| 3 | Spotify API error |
| 4 | Network error |

## Known limitations

- `track features` and `track recommendations` are restricted for Spotify apps created after November 2024 unless you have extended quota mode approval.
- As of February 2026, Spotify apps in development mode can no longer use batch endpoints. The CLI fetches items individually, which works but is slower for large operations. Apps with extended quota mode are unaffected.
- Queue and playback state schemas handle tracks only, not podcast episodes.

## License

MIT. Not affiliated with or endorsed by Spotify AB.
