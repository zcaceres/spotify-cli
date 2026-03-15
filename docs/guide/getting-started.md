# Getting Started

## Installation

### Pre-built binary (recommended)

Download the latest binary for your platform from the [Releases](/releases) page. Then make it executable and move it to your PATH:

```bash
chmod +x spotify-darwin-arm64
sudo mv spotify-darwin-arm64 /usr/local/bin/spotify
```

Verify the installation:

```bash
spotify --help
```

### From source

Requires [Bun](https://bun.sh) runtime.

```bash
git clone https://github.com/zcaceres/spotify-cli.git
cd spotify-cli
bun install
```

When running from source, use `bun run src/cli.ts` instead of `spotify` in the examples below.

## Create a Spotify App

1. Go to [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Click **Create App**
3. Set the **Redirect URI** to `http://127.0.0.1:8888/callback`
4. Copy the **Client ID**

A Spotify Premium account is required for playback controls (play, pause, skip, etc.). Read-only commands like search and library browsing work with any account.

## Authentication

The CLI uses Spotify's OAuth 2.0 PKCE flow — no client secret needed. Log in before using any commands:

```bash
spotify login --client-id <your-client-id>
```

This opens your browser for authorization. After approving, tokens are saved to `~/.spotify-cli/tokens.json` and refresh automatically.

## First commands

Check what's currently playing:

```bash
spotify now
```

Search for a track and play it:

```bash
spotify search "bohemian rhapsody" --type track
spotify play --uri spotify:track:6rqhFgbbKwnb9MLmUQDhG6
```

Browse your saved library:

```bash
spotify liked --limit 5
spotify playlists
```

Control playback:

```bash
spotify pause
spotify skip
spotify volume 80
```

## JSON output

All output is JSON to stdout, making it easy to pipe into other tools:

```bash
spotify now | jq '.item.name'
spotify liked --limit 50 | jq '[.items[].track.name]'
```

Errors are written to stderr as JSON with structured [error codes](/commands#exit-codes).

## Troubleshooting

**"No active device"** — Open Spotify on any device (phone, desktop, or web player) before running playback commands. Use `spotify devices` to list available devices.

**"Token expired"** — Tokens refresh automatically. If you hit auth errors, run `spotify login --client-id <id>` again.

**"Command not found: spotify"** — Ensure the binary is in your PATH, or use the full path to the binary.
