import { argsError } from "./errors.js";

export function parseIntFlag(value: string, name: string): number {
  const n = parseInt(value, 10);
  if (isNaN(n)) throw argsError(`${name} must be a number, got "${value}"`);
  return n;
}

export function optionalIntFlag(flags: Record<string, string>, name: string): number | undefined {
  const val = flags[name];
  if (val === undefined || val === "") return undefined;
  return parseIntFlag(val, `--${name}`);
}
