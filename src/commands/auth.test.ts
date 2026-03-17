import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { ParsedArgs } from "./index.js";

const fakeTokens = {
  access_token: "fake-access-token",
  refresh_token: "fake-refresh-token",
  expires_at: Date.now() + 3600_000,
  scope: "user-read-private user-read-email",
};

const mockLogin = mock(() => Promise.resolve({ ...fakeTokens }));
const mockLoadTokens = mock(() => Promise.resolve({ ...fakeTokens }));
const mockDeleteTokens = mock(() => Promise.resolve());
const mockIsExpired = mock((_tokens: unknown) => false);

// Mock with both .js and .ts extensions for Bun resolution
for (const ext of [".js", ".ts"]) {
  mock.module(`../auth/flow${ext}`, () => ({
    login: mockLogin,
    refreshAccessToken: mock(),
  }));

  mock.module(`../auth/token-store${ext}`, () => ({
    loadTokens: mockLoadTokens,
    deleteTokens: mockDeleteTokens,
    isExpired: mockIsExpired,
    saveTokens: mock(),
    getClientId: mock(),
    saveClientId: mock(),
  }));
}

let captured: unknown;
mock.module("../output.js", () => ({
  output: (data: unknown) => {
    captured = data;
  },
}));

const { loginCommand, logoutCommand, authStatusCommand } = await import("./auth.js");

function args(positional: string[] = [], flags: Record<string, string> = {}): ParsedArgs {
  return { positional, flags, multiFlags: {} };
}

describe("login command", () => {
  beforeEach(() => {
    captured = undefined;
    mockLogin.mockClear();
    mockLogin.mockResolvedValue({ ...fakeTokens });
  });

  test("calls login and outputs token info", async () => {
    await loginCommand(args());
    expect(mockLogin).toHaveBeenCalledWith(undefined);
    expect(captured).toEqual({
      status: "logged_in",
      expires_at: fakeTokens.expires_at,
      scope: fakeTokens.scope,
    });
  });

  test("passes --client-id to login", async () => {
    await loginCommand(args([], { "client-id": "my-client-id" }));
    expect(mockLogin).toHaveBeenCalledWith("my-client-id");
  });

  test("throws for empty --client-id", async () => {
    await expect(loginCommand(args([], { "client-id": "" }))).rejects.toThrow(/requires a value/);
  });
});

describe("logout command", () => {
  beforeEach(() => {
    captured = undefined;
    mockDeleteTokens.mockClear();
  });

  test("deletes tokens and outputs status", async () => {
    await logoutCommand(args());
    expect(mockDeleteTokens).toHaveBeenCalled();
    expect(captured).toEqual({ status: "logged_out" });
  });
});

describe("auth status command", () => {
  beforeEach(() => {
    captured = undefined;
    mockLoadTokens.mockClear();
    mockIsExpired.mockClear();
    mockLoadTokens.mockResolvedValue({ ...fakeTokens });
    mockIsExpired.mockReturnValue(false);
  });

  test("outputs valid status when tokens are fresh", async () => {
    await authStatusCommand(args());
    expect(captured).toEqual({
      status: "valid",
      expires_at: fakeTokens.expires_at,
      scope: ["user-read-private", "user-read-email"],
    });
  });

  test("outputs expired status when tokens are expired", async () => {
    mockIsExpired.mockReturnValue(true);
    await authStatusCommand(args());
    expect(captured).toEqual({
      status: "expired",
      expires_at: fakeTokens.expires_at,
      scope: ["user-read-private", "user-read-email"],
    });
  });

  test("outputs not_logged_in when no tokens exist", async () => {
    mockLoadTokens.mockRejectedValue(new Error("Not logged in"));
    await authStatusCommand(args());
    expect(captured).toEqual({ status: "not_logged_in" });
  });
});
