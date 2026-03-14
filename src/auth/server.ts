/**
 * Local HTTP callback server for the OAuth authorization flow.
 *
 * Starts a temporary HTTP server on {@link CALLBACK_PORT} that waits for
 * Spotify to redirect the user back with an authorization code. The server
 * automatically shuts down after receiving the callback or timing out.
 *
 * @module
 */

import { CALLBACK_PORT } from "../config.js";
import { authError } from "../errors.js";

/** The result returned by the OAuth callback server. */
interface CallbackResult {
  /** The authorization code to exchange for tokens. */
  code: string;
  /** The state parameter echoed back by Spotify. */
  state: string;
}

/**
 * Starts a local HTTP server and waits for the OAuth callback.
 *
 * The server validates the `state` parameter against `expectedState` to
 * prevent CSRF attacks. It times out after 120 seconds.
 *
 * @param expectedState - The state value sent in the authorization request.
 * @returns The authorization code and state from the callback.
 * @throws `SpotifyCliError` on timeout, missing parameters, or state mismatch.
 */
export function startCallbackServer(expectedState: string): Promise<CallbackResult> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      server.stop();
      reject(authError("OAuth callback timed out after 120 seconds"));
    }, 120_000);

    const server = Bun.serve({
      hostname: "127.0.0.1",
      port: CALLBACK_PORT,
      fetch(req) {
        const url = new URL(req.url);
        if (url.pathname !== "/callback") {
          return new Response("Not found", { status: 404 });
        }

        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const error = url.searchParams.get("error");

        if (error) {
          clearTimeout(timeout);
          server.stop();
          reject(authError(`OAuth error: ${error}`));
          return new Response(html("Authorization failed. You can close this tab."), {
            headers: { "Content-Type": "text/html" },
          });
        }

        if (!code || !state) {
          clearTimeout(timeout);
          server.stop();
          reject(authError("Missing code or state in callback"));
          return new Response(html("Missing parameters. You can close this tab."), {
            headers: { "Content-Type": "text/html" },
          });
        }

        if (state !== expectedState) {
          clearTimeout(timeout);
          server.stop();
          reject(authError("State mismatch — possible CSRF attack"));
          return new Response(html("State mismatch. You can close this tab."), {
            headers: { "Content-Type": "text/html" },
          });
        }

        clearTimeout(timeout);
        server.stop();
        resolve({ code, state });
        return new Response(html("Login successful! You can close this tab."), {
          headers: { "Content-Type": "text/html" },
        });
      },
    });
  });
}

function html(message: string): string {
  return `<!DOCTYPE html><html><body><h2>${message}</h2></body></html>`;
}
