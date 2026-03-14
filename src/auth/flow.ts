import { SPOTIFY_AUTH_URL, SPOTIFY_TOKEN_URL, REDIRECT_URI, SCOPES } from "../config.js";
import { generateCodeVerifier, generateCodeChallenge, generateState } from "./pkce.js";
import { startCallbackServer } from "./server.js";
import { saveTokens, getClientId, saveClientId, type StoredTokens } from "./token-store.js";
import { authError, networkError } from "../errors.js";

export async function login(clientIdFlag?: string): Promise<StoredTokens> {
  const clientId = await getClientId(clientIdFlag);
  await saveClientId(clientId);

  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  const state = generateState();

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    code_challenge_method: "S256",
    code_challenge: challenge,
    state,
  });

  const authUrl = `${SPOTIFY_AUTH_URL}?${params}`;

  // Start callback server before opening browser
  const callbackPromise = startCallbackServer(state);

  // Open browser
  const opener =
    process.platform === "darwin"
      ? "open"
      : process.platform === "win32"
        ? "start"
        : "xdg-open";

  const proc = Bun.spawn([opener, authUrl], { stdout: "ignore", stderr: "ignore" });
  await proc.exited;

  console.error(JSON.stringify({ status: "waiting_for_login", url: authUrl }));

  const { code } = await callbackPromise;

  // Exchange code for tokens
  const tokenResponse = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      client_id: clientId,
      code_verifier: verifier,
    }),
  }).catch((err) => {
    throw networkError(`Token exchange failed: ${err.message}`);
  });

  if (!tokenResponse.ok) {
    const body = await tokenResponse.text();
    throw authError(`Token exchange failed (${tokenResponse.status}): ${body}`);
  }

  const data = (await tokenResponse.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    scope: string;
  };

  const tokens: StoredTokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
    scope: data.scope,
  };

  await saveTokens(tokens);
  return tokens;
}

export async function refreshAccessToken(tokens: StoredTokens): Promise<StoredTokens> {
  const clientId = await getClientId();

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: tokens.refresh_token,
      client_id: clientId,
    }),
  }).catch((err) => {
    throw networkError(`Token refresh failed: ${err.message}`);
  });

  if (!response.ok) {
    const body = await response.text();
    throw authError(`Token refresh failed (${response.status}): ${body}`);
  }

  const data = (await response.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope: string;
  };

  const updated: StoredTokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token ?? tokens.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
    scope: data.scope,
  };

  await saveTokens(updated);
  return updated;
}
