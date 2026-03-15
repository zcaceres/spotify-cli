/**
 * Low-level HTTP client for the Spotify Web API.
 *
 * Handles authentication headers, token refresh, rate-limit retries,
 * and JSON response parsing. All other `api/*` modules delegate to
 * {@link spotifyFetch}.
 *
 * @module
 */

import { SPOTIFY_API_BASE } from "../config.js";
import { loadTokens, isExpired, saveTokens } from "../auth/token-store.js";
import { refreshAccessToken } from "../auth/flow.js";
import { apiError, networkError, authError } from "../errors.js";

/** Options for a Spotify API request. */
export interface RequestOptions {
  /** HTTP method (defaults to `"GET"`). */
  method?: string;
  /** Query parameters appended to the URL. `undefined` values are skipped. */
  params?: Record<string, string | number | boolean | undefined>;
  /** Request body, serialized as JSON. */
  body?: unknown;
}

/**
 * Makes an authenticated request to the Spotify Web API.
 *
 * Automatically refreshes expired tokens before the request and retries
 * on `429 Too Many Requests` up to 3 times.
 *
 * @typeParam T - Expected shape of the JSON response body.
 * @param path - API path (e.g. `"/me/player"`) or full URL.
 * @param options - HTTP method, query params, and/or JSON body.
 * @returns The parsed JSON response, or `undefined` for 204 / non-JSON responses.
 * @throws `SpotifyCliError` on auth, API, or network errors.
 */
export async function spotifyFetch<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  let tokens = await loadTokens();

  if (isExpired(tokens)) {
    tokens = await refreshAccessToken(tokens);
    await saveTokens(tokens);
  }

  const url = buildUrl(path, options.params);
  const method = options.method ?? "GET";

  const headers: Record<string, string> = {
    Authorization: `Bearer ${tokens.access_token}`,
  };
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const init: RequestInit = { method, headers };
  if (options.body !== undefined) {
    init.body = JSON.stringify(options.body);
  }

  const response = await fetchWithRetry(url, init);

  if (response.status === 204) {
    return undefined as T;
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    if (response.status === 401) {
      throw authError(`Unauthorized (token may be expired): ${body}`);
    }
    throw apiError(`Spotify API error ${response.status}: ${body}`, {
      status: response.status,
      path,
    });
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function buildUrl(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
): string {
  const url = new URL(path.startsWith("/") ? `${SPOTIFY_API_BASE}${path}` : path);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  retries = 3,
): Promise<Response> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const response = await fetch(url, init).catch((err) => {
      throw networkError(`Network error: ${err.message}`);
    });

    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After");
      const parsed = retryAfter ? parseInt(retryAfter, 10) : NaN;
      const waitMs = !isNaN(parsed) ? parsed * 1000 : 1000 * (attempt + 1);
      console.error(JSON.stringify({ warning: "rate_limited", retry_after_ms: waitMs }));
      await Bun.sleep(waitMs);
      continue;
    }

    return response;
  }

  throw apiError("Rate limited after max retries");
}
