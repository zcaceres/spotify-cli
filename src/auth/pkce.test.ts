import { describe, expect, test } from "bun:test";
import { generateCodeChallenge, generateCodeVerifier, generateState } from "./pkce";

describe("generateCodeVerifier", () => {
  test("returns a base64url string", () => {
    const verifier = generateCodeVerifier();
    expect(verifier).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  test("produces unique values", () => {
    const a = generateCodeVerifier();
    const b = generateCodeVerifier();
    expect(a).not.toBe(b);
  });

  test("has sufficient length for security (>= 43 chars per RFC 7636)", () => {
    const verifier = generateCodeVerifier();
    expect(verifier.length).toBeGreaterThanOrEqual(43);
  });
});

describe("generateCodeChallenge", () => {
  test("returns a base64url string", async () => {
    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    expect(challenge).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  test("is deterministic for the same verifier", async () => {
    const verifier = generateCodeVerifier();
    const a = await generateCodeChallenge(verifier);
    const b = await generateCodeChallenge(verifier);
    expect(a).toBe(b);
  });

  test("differs for different verifiers", async () => {
    const a = await generateCodeChallenge("verifier-one");
    const b = await generateCodeChallenge("verifier-two");
    expect(a).not.toBe(b);
  });

  test("produces a SHA-256 sized output (43 base64url chars for 32 bytes)", async () => {
    const challenge = await generateCodeChallenge("test-verifier");
    expect(challenge.length).toBe(43);
  });
});

describe("generateState", () => {
  test("returns a base64url string", () => {
    const state = generateState();
    expect(state).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  test("produces unique values", () => {
    const a = generateState();
    const b = generateState();
    expect(a).not.toBe(b);
  });

  test("has sufficient length for CSRF protection", () => {
    const state = generateState();
    expect(state.length).toBeGreaterThanOrEqual(16);
  });
});
