/**
 * CLI command handlers for authentication.
 *
 * @module
 */

import { login } from "../auth/flow.js";
import { deleteTokens, isExpired, loadTokens } from "../auth/token-store.js";
import { argsError } from "../errors.js";
import { output } from "../output.js";
import type { CommandHandler } from "./index.js";

/**
 * Handles `spotify login [--client-id <id>]`.
 *
 * Initiates the OAuth PKCE flow, opening the user's browser to
 * Spotify's authorization page. Outputs the token expiry and scopes on success.
 */
export const loginCommand: CommandHandler = async (args) => {
  const raw = args.flags["client-id"];
  if (raw !== undefined && raw === "") {
    throw argsError("--client-id requires a value");
  }
  const tokens = await login(raw);
  output({ status: "logged_in", expires_at: tokens.expires_at, scope: tokens.scope });
};

/**
 * Handles `spotify logout`.
 *
 * Deletes stored OAuth tokens from disk.
 */
export const logoutCommand: CommandHandler = async () => {
  await deleteTokens();
  output({ status: "logged_out" });
};

/**
 * Handles `spotify auth-status`.
 *
 * Reports whether the stored tokens are valid, expired, or missing.
 */
export const authStatusCommand: CommandHandler = async () => {
  try {
    const tokens = await loadTokens();
    output({
      status: isExpired(tokens) ? "expired" : "valid",
      expires_at: tokens.expires_at,
      scope: tokens.scope.split(" "),
    });
  } catch {
    output({ status: "not_logged_in" });
  }
};
