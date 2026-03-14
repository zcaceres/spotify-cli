import { SpotifyCliError, ExitCode } from "./errors.js";

export function output(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
}

export function logError(message: string, details?: unknown): void {
  const obj: Record<string, unknown> = { error: message };
  if (details !== undefined) obj["details"] = details;
  console.error(JSON.stringify(obj));
}

export function handleError(err: unknown): never {
  if (err instanceof SpotifyCliError) {
    logError(err.message, err.details);
    process.exit(err.exitCode);
  }
  const message = err instanceof Error ? err.message : String(err);
  logError(message);
  process.exit(ExitCode.API);
}
