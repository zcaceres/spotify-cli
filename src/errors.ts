export const ExitCode = {
  SUCCESS: 0,
  ARGS: 1,
  AUTH: 2,
  API: 3,
  NETWORK: 4,
} as const;

export type ExitCode = (typeof ExitCode)[keyof typeof ExitCode];

export class SpotifyCliError extends Error {
  constructor(
    message: string,
    public readonly exitCode: ExitCode,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "SpotifyCliError";
  }
}

export function argsError(message: string): SpotifyCliError {
  return new SpotifyCliError(message, ExitCode.ARGS);
}

export function authError(message: string): SpotifyCliError {
  return new SpotifyCliError(message, ExitCode.AUTH);
}

export function apiError(message: string, details?: unknown): SpotifyCliError {
  return new SpotifyCliError(message, ExitCode.API, details);
}

export function networkError(message: string): SpotifyCliError {
  return new SpotifyCliError(message, ExitCode.NETWORK);
}
