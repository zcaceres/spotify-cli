# Getting Started

## Prerequisites

- [Bun](https://bun.sh) runtime
- Spotify Premium account (required for playback controls)
- A Spotify Developer app (free, takes 2 minutes)

## Installation

```bash
git clone https://github.com/zcaceres/spotify-cli.git
cd spotify-cli
bun install
```

## Create a Spotify App

1. Go to [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Click **Create App**
3. Set the **Redirect URI** to `http://127.0.0.1:8888/callback`
4. Copy the **Client ID**

## Authentication

The CLI uses Spotify's PKCE auth flow. You must log in before using any commands:

```bash
bun run src/cli.ts login --client-id <your-client-id>
```

This opens your browser for OAuth authorization. After approving, tokens are saved to `~/.spotify-cli/tokens.json`.

## Usage

```bash
bun run src/cli.ts <command> [options]
```

All output is JSON to stdout. Errors go to stderr as JSON.

Use `bun run src/cli.ts --help` to see all available commands.
