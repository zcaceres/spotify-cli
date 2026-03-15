/**
 * JSON output helpers for the CLI.
 *
 * All CLI output is JSON — successful results go to stdout,
 * errors go to stderr. This keeps output machine-parseable.
 *
 * @module
 */

import { ExitCode, SpotifyCliError } from "./errors.js";

/**
 * Writes a JSON-serialized value to stdout.
 * @param data - Any value to serialize and print.
 */
export function output(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
}

/**
 * Writes a JSON error object to stderr.
 * @param message - Error message string.
 * @param details - Optional additional context included in the JSON output.
 */
export function logError(message: string, details?: Record<string, unknown>): void {
  const obj: Record<string, unknown> = { error: message };
  if (details !== undefined) obj.details = details;
  console.error(JSON.stringify(obj));
}

/**
 * Top-level error handler that logs a JSON error and exits the process.
 *
 * If the error is a {@link SpotifyCliError}, its exit code and details are
 * used. Otherwise the process exits with {@link ExitCode.API}.
 *
 * @param err - The caught error value.
 */
export function handleError(err: unknown): never {
  if (err instanceof SpotifyCliError) {
    logError(err.message, err.details);
    process.exit(err.exitCode);
  }
  const message = err instanceof Error ? err.message : String(err);
  logError(message);
  process.exit(ExitCode.API);
}
