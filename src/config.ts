/**
 * Application configuration constants for the Spotify CLI.
 *
 * @module
 */

import { homedir } from "node:os";
import { join } from "node:path";

/** CLI version, kept in sync with package.json. */
export const VERSION = "0.1.2";

/** Directory where CLI configuration and tokens are stored (`~/.spotify-cli`). */
export const CONFIG_DIR = join(homedir(), ".spotify-cli");

/** Path to the stored OAuth tokens file. */
export const TOKENS_PATH = join(CONFIG_DIR, "tokens.json");

/** Path to the general config file (stores client ID, etc.). */
export const CONFIG_PATH = join(CONFIG_DIR, "config.json");

/** Path to the metadata cache file. */
export const CACHE_PATH = join(CONFIG_DIR, "cache.json");

/** Maximum number of entries stored in the metadata cache. */
export const CACHE_MAX_SIZE = 500;

/** Spotify Accounts authorization endpoint. */
export const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";

/** Spotify Accounts token exchange endpoint. */
export const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";

/** Spotify Web API v1 base URL. */
export const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

/** OAuth redirect URI for the local callback server. */
export const REDIRECT_URI = "http://127.0.0.1:8888/callback";

/** Port used by the local OAuth callback server. */
export const CALLBACK_PORT = 8888;

/** Space-separated list of OAuth scopes requested during login. */
export const SCOPES = [
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "user-read-private",
  "user-read-email",
  "user-read-recently-played",
  "user-top-read",
  "user-library-read",
  "user-library-modify",
  "user-follow-read",
  "user-follow-modify",
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-public",
  "playlist-modify-private",
].join(" ");
