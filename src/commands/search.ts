import * as api from "../api/search.js";
import { output } from "../output.js";
import { argsError } from "../errors.js";
import { optionalIntFlag } from "../parse.js";
import type { CommandHandler } from "./index.js";

export const searchCommand: CommandHandler = async (args) => {
  const query = args.positional.join(" ");
  if (!query) throw argsError("Usage: spotify search <query> [--type track,album,...] [--limit N]");
  const type = args.flags["type"] ?? "track";
  const limit = optionalIntFlag(args.flags, "limit");
  const offset = optionalIntFlag(args.flags, "offset");
  const data = await api.search({ q: query, type, limit, offset });
  output(data);
};
