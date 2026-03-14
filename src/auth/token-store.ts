import { mkdir, chmod } from "node:fs/promises";
import { CONFIG_DIR, TOKENS_PATH, CONFIG_PATH } from "../config.js";
import { authError } from "../errors.js";

export interface StoredTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  scope: string;
}

export async function saveTokens(tokens: StoredTokens): Promise<void> {
  await mkdir(CONFIG_DIR, { recursive: true, mode: 0o700 });
  await Bun.write(TOKENS_PATH, JSON.stringify(tokens, null, 2));
  await chmod(TOKENS_PATH, 0o600);
}

export async function loadTokens(): Promise<StoredTokens> {
  const file = Bun.file(TOKENS_PATH);
  if (!(await file.exists())) {
    throw authError("Not logged in. Run `spotify login` first.");
  }
  return file.json() as Promise<StoredTokens>;
}

export async function deleteTokens(): Promise<void> {
  const file = Bun.file(TOKENS_PATH);
  if (await file.exists()) {
    const { unlink } = await import("node:fs/promises");
    await unlink(TOKENS_PATH);
  }
}

export function isExpired(tokens: StoredTokens): boolean {
  return Date.now() >= tokens.expires_at - 60_000;
}

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
  );
}

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
