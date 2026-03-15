/**
 * Custom error types and exit codes for the Spotify CLI.
 *
 * All CLI errors are represented as {@link SpotifyCliError} instances, each
 * carrying a numeric {@link ExitCode} so the process can exit with a
 * machine-readable status. Errors include a structured {@link ErrorCode}
 * for machine-readable error classification.
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
 * Machine-readable error codes for structured error handling.
 *
 * These enable consumers to programmatically handle specific error
 * conditions without parsing error message strings.
 */
export const ErrorCode = {
  // Args errors
  MISSING_ARGUMENT: "MISSING_ARGUMENT",
  INVALID_ARGUMENT: "INVALID_ARGUMENT",
  UNKNOWN_COMMAND: "UNKNOWN_COMMAND",

  // Auth errors
  NOT_LOGGED_IN: "NOT_LOGGED_IN",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  TOKEN_CORRUPTED: "TOKEN_CORRUPTED",
  MISSING_CLIENT_ID: "MISSING_CLIENT_ID",

  // API errors
  API_ERROR: "API_ERROR",
  RATE_LIMITED: "RATE_LIMITED",
  NOT_FOUND: "NOT_FOUND",
  FORBIDDEN: "FORBIDDEN",
  DEPRECATED: "DEPRECATED",

  // Network errors
  NETWORK_ERROR: "NETWORK_ERROR",
} as const;

/** Union of all valid error code strings. */
export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

/** Structured error details included in JSON error output. */
export interface ErrorDetails {
  code: ErrorCode;
  status?: number;
  path?: string;
  deprecated?: boolean;
  [key: string]: unknown;
}

/**
 * Error class for all CLI-specific errors.
 *
 * Carries an {@link ExitCode} and structured {@link ErrorDetails} that get
 * serialized into the JSON error output.
 */
export class SpotifyCliError extends Error {
  constructor(
    message: string,
    /** The process exit code to use when this error is handled. */
    public readonly exitCode: ExitCode,
    /** Structured data included in the JSON error output. */
    public readonly details: ErrorDetails,
  ) {
    super(message);
    this.name = "SpotifyCliError";
  }
}

/**
 * Creates an error for invalid CLI arguments (exit code 1).
 * @param message - Human-readable description of the argument error.
 * @param code - Specific error code (defaults to `MISSING_ARGUMENT`).
 */
export function argsError(message: string, code: ErrorCode = ErrorCode.MISSING_ARGUMENT): SpotifyCliError {
  return new SpotifyCliError(message, ExitCode.ARGS, { code });
}

/**
 * Creates an error for authentication failures (exit code 2).
 * @param message - Human-readable description of the auth error.
 * @param code - Specific error code (defaults to `NOT_LOGGED_IN`).
 */
export function authError(message: string, code: ErrorCode = ErrorCode.NOT_LOGGED_IN): SpotifyCliError {
  return new SpotifyCliError(message, ExitCode.AUTH, { code });
}

/**
 * Creates an error for Spotify API failures (exit code 3).
 * @param message - Human-readable description of the API error.
 * @param details - Structured data (HTTP status, path, etc). `code` defaults to `API_ERROR`.
 */
export function apiError(message: string, details?: Partial<ErrorDetails>): SpotifyCliError {
  return new SpotifyCliError(message, ExitCode.API, { code: ErrorCode.API_ERROR, ...details });
}

/**
 * Creates an error for network failures (exit code 4).
 * @param message - Human-readable description of the network error.
 */
export function networkError(message: string): SpotifyCliError {
  return new SpotifyCliError(message, ExitCode.NETWORK, { code: ErrorCode.NETWORK_ERROR });
}
