/**
 * Output helpers for the CLI.
 *
 * Supports two modes: JSON (default, machine-parseable) and text
 * (human-readable plaintext). The mode is set globally via `setOutputMode()`.
 *
 * @module
 */

import { ExitCode, SpotifyCliError } from "./errors.js";

type OutputMode = "json" | "text";
type TextFormatter = (data: unknown) => string;

let outputMode: OutputMode = "json";
let textFormatter: TextFormatter | undefined;

/**
 * Sets the global output mode.
 * @param mode - `"json"` for machine-parseable output, `"text"` for human-readable plaintext.
 */
export function setOutputMode(mode: OutputMode): void {
  outputMode = mode;
}

/** Returns the current output mode. */
export function getOutputMode(): OutputMode {
  return outputMode;
}

/**
 * Registers a text formatter for the current command.
 * Called by `cli.ts` before dispatching the command handler.
 * @param fn - Converts the output data to a human-readable string.
 */
export function setTextFormatter(fn: TextFormatter): void {
  textFormatter = fn;
}

/**
 * Generic fallback formatter for text mode.
 *
 * Renders data as readable `key: value` lines with indentation.
 * Arrays become numbered lists; nested objects are indented.
 *
 * @param data - Any value to format.
 * @param indent - Current indentation depth (used recursively).
 */
function genericTextFormat(data: unknown, indent = 0): string {
  const pad = "  ".repeat(indent);
  if (data === null || data === undefined) return `${pad}(none)`;
  if (typeof data === "string" || typeof data === "number" || typeof data === "boolean") {
    return `${pad}${data}`;
  }
  if (Array.isArray(data)) {
    if (data.length === 0) return `${pad}(empty)`;
    return data.map((item, i) => `${pad}${i + 1}. ${genericTextFormat(item).trimStart()}`).join("\n");
  }
  if (typeof data === "object") {
    const entries = Object.entries(data as Record<string, unknown>);
    if (entries.length === 0) return `${pad}(empty)`;
    return entries
      .map(([key, val]) => {
        if (typeof val === "object" && val !== null) {
          return `${pad}${key}:\n${genericTextFormat(val, indent + 1)}`;
        }
        return `${pad}${key}: ${val}`;
      })
      .join("\n");
  }
  return `${pad}${String(data)}`;
}

/**
 * Writes a value to stdout.
 *
 * In JSON mode the value is `JSON.stringify`'d. In text mode the registered
 * {@link setTextFormatter | text formatter} is used, falling back to a
 * generic key-value flattener.
 *
 * @param data - Any value to output.
 */
export function output(data: unknown): void {
  if (outputMode === "text") {
    console.log(textFormatter ? textFormatter(data) : genericTextFormat(data));
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

/**
 * Writes an error to stderr.
 *
 * In text mode prints `Error: <message>`. In JSON mode writes a JSON object.
 *
 * @param message - Error message string.
 * @param details - Optional additional context included in JSON output.
 */
export function logError(message: string, details?: Record<string, unknown>): void {
  if (outputMode === "text") {
    console.error(`Error: ${message}`);
  } else {
    const obj: Record<string, unknown> = { error: message };
    if (details !== undefined) obj.details = details;
    console.error(JSON.stringify(obj));
  }
}

/**
 * Top-level error handler that logs an error and exits the process.
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
