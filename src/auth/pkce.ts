/**
 * PKCE (Proof Key for Code Exchange) helpers for the OAuth 2.0 flow.
 *
 * Generates the code verifier, code challenge, and state values used
 * during the Spotify authorization code flow with PKCE.
 *
 * @see {@link https://datatracker.ietf.org/doc/html/rfc7636 | RFC 7636 — PKCE}
 * @module
 */

/**
 * Generates a cryptographically random code verifier (64 bytes, base64url-encoded).
 * @returns A base64url-encoded random string suitable for use as a PKCE code verifier.
 */
export function generateCodeVerifier(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(64));
  return base64url(bytes);
}

/**
 * Derives a SHA-256 code challenge from a code verifier.
 * @param verifier - The code verifier string to hash.
 * @returns A base64url-encoded SHA-256 hash of the verifier.
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64url(new Uint8Array(digest));
}

/**
 * Generates a cryptographically random state string for CSRF protection.
 * @returns A base64url-encoded random string (16 bytes).
 */
export function generateState(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return base64url(bytes);
}

function base64url(bytes: Uint8Array): string {
  const binary = String.fromCharCode(...bytes);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
