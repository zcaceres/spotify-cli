/**
 * Custom error types and exit codes for the Spotify CLI.
 *
 * All CLI errors are represented as {@link SpotifyCliError} instances, each
 * carrying a numeric {@link ExitCode} so the process can exit with a
 * machine-readable status.
 *
 * @module
 */

/**
 * Numeric exit codes used by the CLI process.
 *
 * | Code | Meaning |
 * |------|---------|
 * | 0 | Success |
 * | 1 | Invalid arguments |
 * | 2 | Authentication failure |
 * | 3 | Spotify API error |
 * | 4 | Network error |
 */
export const ExitCode = {
  SUCCESS: 0,
  ARGS: 1,
  AUTH: 2,
  API: 3,
  NETWORK: 4,
} as const;

/** Union of all valid exit code values. */
export type ExitCode = (typeof ExitCode)[keyof typeof ExitCode];

/**
 * Error class for all CLI-specific errors.
 *
 * Carries an {@link ExitCode} and optional structured `details` that get
 * serialized into the JSON error output.
 */
export class SpotifyCliError extends Error {
  constructor(
    message: string,
    /** The process exit code to use when this error is handled. */
    public readonly exitCode: ExitCode,
    /** Optional structured data included in the JSON error output. */
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "SpotifyCliError";
  }
}

/**
 * Creates an error for invalid CLI arguments (exit code 1).
 * @param message - Human-readable description of the argument error.
 */
export function argsError(message: string): SpotifyCliError {
  return new SpotifyCliError(message, ExitCode.ARGS);
}

/**
 * Creates an error for authentication failures (exit code 2).
 * @param message - Human-readable description of the auth error.
 */
export function authError(message: string): SpotifyCliError {
  return new SpotifyCliError(message, ExitCode.AUTH);
}

/**
 * Creates an error for Spotify API failures (exit code 3).
 * @param message - Human-readable description of the API error.
 * @param details - Optional structured data (e.g. HTTP status, path).
 */
export function apiError(message: string, details?: unknown): SpotifyCliError {
  return new SpotifyCliError(message, ExitCode.API, details);
}

/**
 * Creates an error for network failures (exit code 4).
 * @param message - Human-readable description of the network error.
 */
export function networkError(message: string): SpotifyCliError {
  return new SpotifyCliError(message, ExitCode.NETWORK);
}
