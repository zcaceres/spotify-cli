import { describe, expect, mock, test } from "bun:test";
import { SpotifyCliError } from "../errors.js";

// Each test gets a unique port to avoid EADDRINUSE between tests
let nextPort = 19000;

function getPort() {
  return nextPort++;
}

async function importServerWithPort(port: number) {
  mock.module("../config.js", () => ({
    CALLBACK_PORT: port,
  }));
  const mod = await import(`./server.js?port=${port}`);
  return mod.startCallbackServer as typeof import("./server.js").startCallbackServer;
}

/** Start server and immediately attach .catch() to prevent unhandled rejection */
function startServer(startCallbackServer: (state: string) => Promise<unknown>, state: string) {
  const captured: { result?: unknown; error?: unknown } = {};
  const promise = startCallbackServer(state)
    .then((r: unknown) => {
      captured.result = r;
    })
    .catch((e: unknown) => {
      captured.error = e;
    });
  return { promise, captured };
}

describe("startCallbackServer", () => {
  test("returns authorization code on valid callback", async () => {
    const port = getPort();
    const startCallbackServer = await importServerWithPort(port);
    const state = "test-state-123";
    const { promise, captured } = startServer(startCallbackServer, state);

    const res = await fetch(`http://127.0.0.1:${port}/callback?code=auth-code-abc&state=${state}`);
    expect(res.status).toBe(200);

    const body = await res.text();
    expect(body).toContain("Login successful");

    await promise;
    expect(captured.result).toEqual({ code: "auth-code-abc", state });
  });

  test("rejects on state mismatch", async () => {
    const port = getPort();
    const startCallbackServer = await importServerWithPort(port);
    const { promise, captured } = startServer(startCallbackServer, "expected-state");

    const res = await fetch(`http://127.0.0.1:${port}/callback?code=auth-code&state=wrong-state`);
    expect(res.status).toBe(200);
    expect(await res.text()).toContain("State mismatch");

    await promise;
    expect(captured.error).toBeInstanceOf(SpotifyCliError);
    expect((captured.error as SpotifyCliError).message).toContain("State mismatch");
  });

  test("rejects when code parameter is missing", async () => {
    const port = getPort();
    const startCallbackServer = await importServerWithPort(port);
    const state = "test-state";
    const { promise, captured } = startServer(startCallbackServer, state);

    const res = await fetch(`http://127.0.0.1:${port}/callback?state=${state}`);
    expect(res.status).toBe(200);
    expect(await res.text()).toContain("Missing parameters");

    await promise;
    expect(captured.error).toBeInstanceOf(SpotifyCliError);
    expect((captured.error as SpotifyCliError).message).toContain("Missing code or state");
  });

  test("rejects when state parameter is missing", async () => {
    const port = getPort();
    const startCallbackServer = await importServerWithPort(port);
    const { promise, captured } = startServer(startCallbackServer, "test-state");

    const res = await fetch(`http://127.0.0.1:${port}/callback?code=auth-code`);
    expect(res.status).toBe(200);
    expect(await res.text()).toContain("Missing parameters");

    await promise;
    expect(captured.error).toBeInstanceOf(SpotifyCliError);
    expect((captured.error as SpotifyCliError).message).toContain("Missing code or state");
  });

  test("rejects on Spotify error parameter", async () => {
    const port = getPort();
    const startCallbackServer = await importServerWithPort(port);
    const { promise, captured } = startServer(startCallbackServer, "test-state");

    const res = await fetch(`http://127.0.0.1:${port}/callback?error=access_denied`);
    expect(res.status).toBe(200);
    expect(await res.text()).toContain("Authorization failed");

    await promise;
    expect(captured.error).toBeInstanceOf(SpotifyCliError);
    expect((captured.error as SpotifyCliError).message).toContain("OAuth error: access_denied");
  });

  test("returns 404 for non-callback paths", async () => {
    const port = getPort();
    const startCallbackServer = await importServerWithPort(port);
    const state = "test-state";
    const { promise, captured } = startServer(startCallbackServer, state);

    const res = await fetch(`http://127.0.0.1:${port}/other-path`);
    expect(res.status).toBe(404);
    expect(await res.text()).toBe("Not found");

    // Server should still be running — shut it down properly
    await fetch(`http://127.0.0.1:${port}/callback?code=cleanup&state=${state}`);
    await promise;
    expect(captured.result).toEqual({ code: "cleanup", state });
  });

  test("server shuts down after valid callback", async () => {
    const port = getPort();
    const startCallbackServer = await importServerWithPort(port);
    const state = "shutdown-test";
    const { promise } = startServer(startCallbackServer, state);

    await fetch(`http://127.0.0.1:${port}/callback?code=auth-code&state=${state}`);
    await promise;

    try {
      await fetch(`http://127.0.0.1:${port}/callback?code=x&state=x`);
      expect.unreachable("should have thrown because server is stopped");
    } catch (err) {
      expect(err).toBeDefined();
    }
  });

  test("server shuts down after error callback", async () => {
    const port = getPort();
    const startCallbackServer = await importServerWithPort(port);
    const { promise } = startServer(startCallbackServer, "shutdown-error-test");

    await fetch(`http://127.0.0.1:${port}/callback?error=access_denied`);
    await promise;

    try {
      await fetch(`http://127.0.0.1:${port}/callback?code=x&state=x`);
      expect.unreachable("should have thrown because server is stopped");
    } catch (err) {
      expect(err).toBeDefined();
    }
  });
});
