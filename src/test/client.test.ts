import { describe, test, expect, mock, beforeEach, afterEach } from "bun:test";
import { SpotifyCliError, ErrorCode, ExitCode } from "../errors.js";

// Mock token store and auth flow so spotifyFetch can run without real credentials
const fakeTokens = {
  access_token: "fake-access-token",
  refresh_token: "fake-refresh-token",
  expires_at: Date.now() + 3600_000,
  scope: "user-read-private",
};

mock.module("../auth/token-store.js", () => ({
  loadTokens: mock(() => Promise.resolve({ ...fakeTokens })),
  isExpired: mock(() => false),
  saveTokens: mock(() => Promise.resolve()),
}));

mock.module("../auth/flow.js", () => ({
  refreshAccessToken: mock(() => Promise.resolve({ ...fakeTokens })),
}));

const { spotifyFetch } = await import("../api/client.js");

// Save original fetch
const originalFetch = globalThis.fetch;

describe("spotifyFetch", () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test("builds URL from path and appends query params", async () => {
    let capturedUrl = "";
    globalThis.fetch = mock(async (url: string) => {
      capturedUrl = url;
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as unknown as typeof fetch;

    await spotifyFetch("/me/tracks", { params: { limit: 5, offset: 0 } });
    const parsed = new URL(capturedUrl);
    expect(parsed.pathname).toBe("/v1/me/tracks");
    expect(parsed.searchParams.get("limit")).toBe("5");
    expect(parsed.searchParams.get("offset")).toBe("0");
  });

  test("skips undefined params", async () => {
    let capturedUrl = "";
    globalThis.fetch = mock(async (url: string) => {
      capturedUrl = url;
      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as unknown as typeof fetch;

    await spotifyFetch("/me/tracks", { params: { limit: 5, offset: undefined } });
    const parsed = new URL(capturedUrl);
    expect(parsed.searchParams.has("offset")).toBe(false);
  });

  test("sends Authorization header", async () => {
    let capturedHeaders: Record<string, string> = {};
    globalThis.fetch = mock(async (_url: string, init: RequestInit) => {
      capturedHeaders = Object.fromEntries(Object.entries(init.headers as Record<string, string>));
      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as unknown as typeof fetch;

    await spotifyFetch("/me");
    expect(capturedHeaders["Authorization"]).toBe("Bearer fake-access-token");
  });

  test("sends JSON body and Content-Type for POST", async () => {
    let capturedInit: RequestInit = {};
    globalThis.fetch = mock(async (_url: string, init: RequestInit) => {
      capturedInit = init;
      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as unknown as typeof fetch;

    await spotifyFetch("/playlists/abc/items", {
      method: "POST",
      body: { uris: ["spotify:track:123"] },
    });

    expect(capturedInit.method).toBe("POST");
    expect(capturedInit.body).toBe(JSON.stringify({ uris: ["spotify:track:123"] }));
    expect((capturedInit.headers as Record<string, string>)["Content-Type"]).toBe("application/json");
  });

  test("returns undefined for 204 responses", async () => {
    globalThis.fetch = mock(async () => new Response(null, { status: 204 })) as unknown as typeof fetch;
    const result = await spotifyFetch("/me/player/pause");
    expect(result).toBeUndefined();
  });

  test("returns undefined for non-JSON success responses", async () => {
    globalThis.fetch = mock(async () => new Response("snapshot123", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    })) as unknown as typeof fetch;
    const result = await spotifyFetch("/me/player/seek");
    expect(result).toBeUndefined();
  });

  test("throws auth error on 401", async () => {
    globalThis.fetch = mock(async () => new Response('{"error":"expired"}', {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })) as unknown as typeof fetch;

    try {
      await spotifyFetch("/me");
      expect.unreachable("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(SpotifyCliError);
      const e = err as SpotifyCliError;
      expect(e.exitCode).toBe(ExitCode.AUTH);
      expect(e.details.code).toBe(ErrorCode.TOKEN_EXPIRED);
    }
  });

  test("throws API error with NOT_FOUND code on 404", async () => {
    globalThis.fetch = mock(async () => new Response('{"error":"not found"}', {
      status: 404,
      headers: { "Content-Type": "application/json" },
    })) as unknown as typeof fetch;

    try {
      await spotifyFetch("/tracks/nonexistent");
      expect.unreachable("should have thrown");
    } catch (err) {
      const e = err as SpotifyCliError;
      expect(e.exitCode).toBe(ExitCode.API);
      expect(e.details.code).toBe(ErrorCode.NOT_FOUND);
      expect(e.details.status).toBe(404);
    }
  });

  test("throws API error with FORBIDDEN code on 403", async () => {
    globalThis.fetch = mock(async () => new Response('{"error":"forbidden"}', {
      status: 403,
      headers: { "Content-Type": "application/json" },
    })) as unknown as typeof fetch;

    try {
      await spotifyFetch("/audio-features/abc");
      expect.unreachable("should have thrown");
    } catch (err) {
      const e = err as SpotifyCliError;
      expect(e.details.code).toBe(ErrorCode.FORBIDDEN);
      expect(e.details.status).toBe(403);
    }
  });

  test("throws network error on fetch failure", async () => {
    globalThis.fetch = mock(async () => {
      throw new Error("DNS resolution failed");
    }) as unknown as typeof fetch;

    try {
      await spotifyFetch("/me");
      expect.unreachable("should have thrown");
    } catch (err) {
      const e = err as SpotifyCliError;
      expect(e.exitCode).toBe(ExitCode.NETWORK);
      expect(e.details.code).toBe(ErrorCode.NETWORK_ERROR);
      expect(e.message).toContain("DNS resolution failed");
    }
  });
});

describe("errors module", () => {
  test("SpotifyCliError has structured details", () => {
    const { argsError, apiError, authError, networkError } = require("../errors.js");

    const args = argsError("bad arg");
    expect(args.details.code).toBe(ErrorCode.MISSING_ARGUMENT);
    expect(args.exitCode).toBe(ExitCode.ARGS);

    const api = apiError("api failed", { status: 500, path: "/me" });
    expect(api.details.code).toBe(ErrorCode.API_ERROR);
    expect(api.details.status).toBe(500);
    expect(api.details.path).toBe("/me");

    const auth = authError("not logged in");
    expect(auth.details.code).toBe(ErrorCode.NOT_LOGGED_IN);

    const net = networkError("timeout");
    expect(net.details.code).toBe(ErrorCode.NETWORK_ERROR);
  });

  test("apiError with custom code preserves it", () => {
    const { apiError, ErrorCode: EC } = require("../errors.js");
    const err = apiError("deprecated", { code: EC.DEPRECATED, status: 403, deprecated: true });
    expect(err.details.code).toBe("DEPRECATED");
    expect(err.details.deprecated).toBe(true);
  });

  test("error codes are exhaustive strings", () => {
    const codes = Object.values(ErrorCode) as string[];
    expect(codes.length).toBeGreaterThan(0);
    for (const code of codes) {
      expect(typeof code).toBe("string");
      expect(code).toBe(code.toUpperCase());
    }
  });
});
