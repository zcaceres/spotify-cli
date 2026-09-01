# Getting Started

## Installation

### Pre-built binary (recommended)

Download the latest binary from [Releases](/releases), make it executable, and move it to your PATH:

```bash
chmod +x spotify-darwin-arm64
sudo mv spotify-darwin-arm64 /usr/local/bin/spotify
```

On macOS, remove the quarantine flag because the binary is unsigned:

```bash
xattr -d com.apple.quarantine /usr/local/bin/spotify
```

Check the installation:

```bash
spotify --help
```

### From source

Requires [Bun](https://bun.sh).

```bash
git clone https://github.com/zcaceres/spotify-cli.git
cd spotify-cli
bun install
```

When running from source, replace `spotify` below with `bun run src/cli.ts`.

## Create a Spotify App

1. Go to [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Click **Create App**
3. Set the **Redirect URI** to `http://127.0.0.1:8888/callback`
4. Copy the **Client ID**

Playback controls require Spotify Premium. Search and library commands work with any account.

## Authentication

The CLI uses OAuth 2.0 PKCE, so it needs no client secret. Log in before running commands:

```bash
spotify login --client-id <your-client-id>
```

Your browser opens for approval. Tokens are then saved to `~/.spotify-cli/tokens.json` and refreshed as needed.

## First commands

See what's playing:

```bash
spotify now
```

Find and play a track:

```bash
spotify search "bohemian rhapsody" --type track
spotify play --uri spotify:track:6rqhFgbbKwnb9MLmUQDhG6
```

Save or queue tracks by name:

```bash
spotify track save "bohemian rhapsody"
spotify queue add "never gonna give you up"
```

Browse your library:

```bash
spotify track saved --limit 5
spotify playlist list
```

Control playback:

```bash
spotify pause
spotify next
spotify volume 80
```

## Output formats

Commands write JSON to stdout by default, so you can pipe it into other tools:

```bash
spotify now | jq '.item.name'
spotify track saved --limit 50 | jq '[.items[].track.name]'
```

Use `--text` for plain text:

```bash
spotify now --text
# Now playing: Thunderstruck - AC/DC

spotify volume 80 --text
# Volume set to 80
```

Errors go to stderr as JSON, or plain text with `--text`. Each includes an [error code](/commands#exit-codes).

## Troubleshooting

**"No active device":** Open Spotify on your phone, desktop, or the web before running playback commands. Use `spotify devices` to list devices.

**"Token expired":** If token refresh fails, run `spotify login --client-id <id>` again.

**"Command not found: spotify":** Put the binary in your PATH or run it with its full path.
