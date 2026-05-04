/**
 * Utility parsers for CLI argument values.
 *
 * @module
 */

import { readFileSync } from "node:fs";
import { argsError, ErrorCode } from "./errors.js";
import { identify } from "./identify.js";

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

/**
 * Extracts a Spotify ID from user input that may be a full URI or a bare ID.
 * For detail/read commands that take a single `<id>` argument.
 */
/**
 * Extracts a Spotify ID from user input that may be a full URI or a bare ID.
 * For detail/read commands that take a single `<id>` argument.
 */
export function extractId(input: string): string {
  const result = identify(input);
  if (result.kind === "uri") return result.id;
  if (result.kind === "id") return result.id;
  return input;
}

/**
 * Reader for stdin contents. Overridable for tests via {@link _setStdinReader}.
 * Default reads the entire contents of file descriptor 0 as UTF-8.
 */
let stdinReader: () => string = () => readFileSync(0, "utf8");

/** @internal Test-only override for the stdin reader. Restore by passing the original. */
export function _setStdinReader(fn: () => string): void {
  stdinReader = fn;
}

/**
 * Loads a list of inputs (URIs, IDs, or search queries) from a combination of
 * positional args, a file flag, and stdin.
 *
 * - Positional `-` is a sentinel meaning "read from stdin" (consumed at most once).
 * - `flags[fileFlag]` (default `"uris-file"`) names a file to read line-by-line.
 * - File and stdin lines are trimmed; blank lines and `#`-prefixed comments are skipped.
 *
 * Inputs from all three sources are concatenated in this order: positional, then file.
 * The stdin contents are inserted at the position of the `-` sentinel.
 *
 * @param positional - Positional args after consuming any leading IDs (e.g. playlist id).
 * @param flags - Parsed flags record; only `flags[fileFlag]` is consulted.
 * @param options - Optional override of the file flag name and stdin behavior.
 * @returns Combined list of non-empty input strings.
 */
export function loadVariadicInputs(
  positional: string[],
  flags: Record<string, string>,
  options: { fileFlag?: string; allowStdin?: boolean } = {},
): string[] {
  const fileFlag = options.fileFlag ?? "uris-file";
  const allowStdin = options.allowStdin ?? true;

  const out: string[] = [];
  let stdinConsumed = false;

  for (const item of positional) {
    if (allowStdin && item === "-" && !stdinConsumed) {
      out.push(...parseLines(stdinReader()));
      stdinConsumed = true;
    } else if (allowStdin && item === "-") {
    } else {
      out.push(item);
    }
  }

  const filePath = flags[fileFlag];
  if (filePath !== undefined && filePath !== "") {
    out.push(...parseLines(readFileSync(filePath, "utf8")));
  }

  return out;
}

function parseLines(content: string): string[] {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));
}
