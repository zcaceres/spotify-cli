/**
 * CLI command handler for Spotify catalog search.
 *
 * @module
 */

import * as api from "../api/search.js";
import { argsError } from "../errors.js";
import { output } from "../output.js";
import { optionalIntFlag } from "../parse.js";
import type { CommandHandler } from "./index.js";

/**
 * Handles `spotify search <query> [--type track,album,...] [--limit N] [--offset N]`.
 *
 * Searches the Spotify catalog. Defaults to searching for tracks if
 * `--type` is not specified.
 */
export const searchCommand: CommandHandler = async (args) => {
  const query = args.positional.join(" ");
  if (!query) throw argsError("Usage: spotify search <query> [--type track,album,...] [--limit N]");
  const type = args.flags["type"] ?? "track";
  const limit = optionalIntFlag(args.flags, "limit");
  const offset = optionalIntFlag(args.flags, "offset");
  const data = await api.search({ q: query, type, limit, offset });
  output(data);
};
