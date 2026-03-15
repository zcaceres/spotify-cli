/**
 * Persistent storage for OAuth tokens and client configuration.
 *
 * Tokens and config are stored as JSON files in {@link CONFIG_DIR}
 * with restrictive file permissions (600/700).
 *
 * @module
 */

import { mkdir, chmod } from "node:fs/promises";
import { CONFIG_DIR, TOKENS_PATH, CONFIG_PATH } from "../config.js";
import { authError, ErrorCode } from "../errors.js";

/**
 * OAuth tokens persisted to disk.
 */
export interface StoredTokens {
  /** The Spotify API access token. */
  access_token: string;
  /** The refresh token used to obtain new access tokens. */
  refresh_token: string;
  /** Unix timestamp (ms) when the access token expires. */
  expires_at: number;
  /** Space-separated list of granted OAuth scopes. */
  scope: string;
}

/**
 * Persists tokens to disk with secure file permissions (600).
 * @param tokens - The tokens to save.
 */
export async function saveTokens(tokens: StoredTokens): Promise<void> {
  await mkdir(CONFIG_DIR, { recursive: true, mode: 0o700 });
  await Bun.write(TOKENS_PATH, JSON.stringify(tokens, null, 2));
  await chmod(TOKENS_PATH, 0o600);
}

/**
 * Loads stored tokens from disk.
 * @returns The stored tokens.
 * @throws `SpotifyCliError` if not logged in or the tokens file is invalid.
 */
export async function loadTokens(): Promise<StoredTokens> {
  const file = Bun.file(TOKENS_PATH);
  if (!(await file.exists())) {
    throw authError("Not logged in. Run `spotify login` first.", ErrorCode.NOT_LOGGED_IN);
  }
  let data: unknown;
  try {
    data = await file.json();
  } catch {
    throw authError("Corrupted tokens file. Run `spotify login` to re-authenticate.", ErrorCode.TOKEN_CORRUPTED);
  }
  const tokens = data as Record<string, unknown>;
  if (
    typeof tokens["access_token"] !== "string" ||
    typeof tokens["refresh_token"] !== "string" ||
    typeof tokens["expires_at"] !== "number"
  ) {
    throw authError("Invalid tokens file. Run `spotify login` to re-authenticate.", ErrorCode.TOKEN_CORRUPTED);
  }
  return tokens as unknown as StoredTokens;
}

/**
 * Deletes stored tokens from disk (logout).
 */
export async function deleteTokens(): Promise<void> {
  const file = Bun.file(TOKENS_PATH);
  if (await file.exists()) {
    const { unlink } = await import("node:fs/promises");
    await unlink(TOKENS_PATH);
  }
}

/**
 * Checks whether the stored tokens are expired (with a 60-second buffer).
 * @param tokens - The tokens to check.
 * @returns `true` if the access token is expired or about to expire.
 */
export function isExpired(tokens: StoredTokens): boolean {
  return Date.now() >= tokens.expires_at - 60_000;
}

/**
 * Resolves the Spotify client ID from (in priority order):
 * 1. The `--client-id` CLI flag
 * 2. The `SPOTIFY_CLIENT_ID` environment variable
 * 3. The stored config file
 *
 * @param flagValue - Optional client ID from the CLI flag.
 * @returns The resolved client ID.
 * @throws `SpotifyCliError` if no client ID can be found.
 */
export async function getClientId(flagValue?: string): Promise<string> {
  if (flagValue) return flagValue;
  const envId = process.env["SPOTIFY_CLIENT_ID"];
  if (envId) return envId;

  const file = Bun.file(CONFIG_PATH);
  if (await file.exists()) {
    const config = (await file.json()) as Record<string, unknown>;
    if (typeof config["client_id"] === "string") return config["client_id"];
  }

  throw authError(
    "No client ID found. Provide --client-id, set SPOTIFY_CLIENT_ID, or save to ~/.spotify-cli/config.json",
    ErrorCode.MISSING_CLIENT_ID,
  );
}

/**
 * Persists the client ID to the config file for future use.
 * @param clientId - The Spotify application client ID to save.
 */
export async function saveClientId(clientId: string): Promise<void> {
  await mkdir(CONFIG_DIR, { recursive: true, mode: 0o700 });
  let config: Record<string, unknown> = {};
  const file = Bun.file(CONFIG_PATH);
  if (await file.exists()) {
    config = (await file.json()) as Record<string, unknown>;
  }
  config["client_id"] = clientId;
  await Bun.write(CONFIG_PATH, JSON.stringify(config, null, 2));
  await chmod(CONFIG_PATH, 0o600);
}
