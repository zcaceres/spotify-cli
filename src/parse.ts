/**
 * Utility parsers for CLI argument values.
 *
 * @module
 */

import { argsError, ErrorCode } from "./errors.js";

/**
 * Parses a string as a base-10 integer or throws an {@link argsError}.
 * @param value - The raw string value to parse.
 * @param name - Display name used in the error message (e.g. `"--limit"`).
 * @returns The parsed integer.
 * @throws `SpotifyCliError` if the value is not a valid integer.
 */
export function parseIntFlag(value: string, name: string): number {
  const n = parseInt(value, 10);
  if (Number.isNaN(n)) throw argsError(`${name} must be a number, got "${value}"`, ErrorCode.INVALID_ARGUMENT);
  return n;
}

/**
 * Reads an optional integer flag from a flags record.
 *
 * Returns `undefined` when the flag is absent or empty, otherwise
 * delegates to {@link parseIntFlag}.
 *
 * @param flags - The parsed flags record from CLI args.
 * @param name - The flag name (without `--` prefix).
 * @returns The parsed integer, or `undefined` if not provided.
 */
export function optionalIntFlag(flags: Record<string, string>, name: string): number | undefined {
  const val = flags[name];
  if (val === undefined || val === "") return undefined;
  const n = parseIntFlag(val, `--${name}`);
  if (n < 0) throw argsError(`--${name} must be non-negative`, ErrorCode.INVALID_ARGUMENT);
  return n;
}

/**
 * Extracts one or more non-empty IDs from positional arguments.
 *
 * @param positional - The positional arguments array.
 * @param usage - Usage string shown in the error message when no IDs are found.
 * @returns Array of non-empty ID strings.
 * @throws `SpotifyCliError` if no valid IDs are provided.
 */
/**
 * Ensures a string is a full Spotify track URI.
 * If the input already starts with `spotify:`, it is returned as-is.
 * Otherwise it is treated as a bare track ID and prefixed with `spotify:track:`.
 */
export function ensureTrackUri(id: string): string {
  return id.startsWith("spotify:") ? id : `spotify:track:${id}`;
}

export function requireIds(positional: string[], usage: string): string[] {
  const ids = positional.filter((id) => id !== "");
  if (ids.length === 0) throw argsError(`Usage: ${usage}`);
  return ids;
}
