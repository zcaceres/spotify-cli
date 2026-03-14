import * as api from "../api/user.js";
import { output } from "../output.js";
import { argsError } from "../errors.js";
import { optionalIntFlag } from "../parse.js";
import type { CommandHandler } from "./index.js";

export const meCommand: CommandHandler = async () => {
  const data = await api.getCurrentUser();
  output(data);
};

export const topCommand: CommandHandler = async (args) => {
  const type = args.positional[0];
  if (type !== "artists" && type !== "tracks") {
    throw argsError("Usage: spotify top <artists|tracks> [--time-range ...] [--limit N]");
  }
  const time_range = args.flags["time-range"];
  const limit = optionalIntFlag(args.flags, "limit");
  const offset = optionalIntFlag(args.flags, "offset");
  const data = await api.getTopItems(type, { time_range, limit, offset });
  output(data);
};

export const followingCommand: CommandHandler = async (args) => {
  const limit = optionalIntFlag(args.flags, "limit");
  const after = args.flags["after"];
  const data = await api.getFollowedArtists({ limit, after });
  output(data);
};

export const followCommand: CommandHandler = async (args) => {
  if (args.positional.length === 0) throw argsError("Usage: spotify follow <id...>");
  await api.followArtists(args.positional);
  output({ status: "followed", ids: args.positional });
};

export const unfollowCommand: CommandHandler = async (args) => {
  if (args.positional.length === 0) throw argsError("Usage: spotify unfollow <id...>");
  await api.unfollowArtists(args.positional);
  output({ status: "unfollowed", ids: args.positional });
};
