/**
 * Utility parsers for CLI argument values.
 *
 * @module
 */

import { argsError } from "./errors.js";

/**
 * Parses a string as a base-10 integer or throws an {@link argsError}.
 * @param value - The raw string value to parse.
 * @param name - Display name used in the error message (e.g. `"--limit"`).
 * @returns The parsed integer.
 * @throws `SpotifyCliError` if the value is not a valid integer.
 */
export function parseIntFlag(value: string, name: string): number {
  const n = parseInt(value, 10);
  if (isNaN(n)) throw argsError(`${name} must be a number, got "${value}"`);
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
  return parseIntFlag(val, `--${name}`);
}

/**
 * Extracts one or more non-empty IDs from positional arguments.
 *
 * @param positional - The positional arguments array.
 * @param usage - Usage string shown in the error message when no IDs are found.
 * @returns Array of non-empty ID strings.
 * @throws `SpotifyCliError` if no valid IDs are provided.
 */
export function requireIds(positional: string[], usage: string): string[] {
  const ids = positional.filter((id) => id !== "");
  if (ids.length === 0) throw argsError(`Usage: ${usage}`);
  return ids;
}
