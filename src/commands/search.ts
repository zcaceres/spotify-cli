import * as api from "../api/search.js";
import { output } from "../output.js";
import { argsError } from "../errors.js";
import type { CommandHandler } from "./index.js";

export const searchCommand: CommandHandler = async (args) => {
  const query = args.positional[0];
  if (!query) throw argsError("Usage: spotify search <query> [--type track,album,...] [--limit N]");
  const type = args.flags["type"] ?? "track";
  const limit = args.flags["limit"] ? parseInt(args.flags["limit"], 10) : undefined;
  const offset = args.flags["offset"] ? parseInt(args.flags["offset"], 10) : undefined;
  const data = await api.search({ q: query, type, limit, offset });
  output(data);
};
