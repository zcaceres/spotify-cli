/**
 * CLI command handlers for user profile and follow operations.
 *
 * @module
 */

import * as api from "../api/user.js";
import { output } from "../output.js";
import { argsError } from "../errors.js";
import { optionalIntFlag, requireIds } from "../parse.js";
import type { CommandHandler } from "./index.js";

/** Handles `spotify me`. Outputs the current user's profile. */
export const meCommand: CommandHandler = async () => {
  const data = await api.getCurrentUser();
  output(data);
};

/**
 * Handles `spotify top <artists|tracks> [--time-range short_term|medium_term|long_term] [--limit N] [--offset N]`.
 *
 * Gets the current user's top artists or tracks.
 */
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

/**
 * Handles `spotify following [--limit N] [--after <artist_id>]`.
 *
 * Lists the current user's followed artists.
 */
export const followingCommand: CommandHandler = async (args) => {
  const limit = optionalIntFlag(args.flags, "limit");
  const after = args.flags["after"];
  const data = await api.getFollowedArtists({ limit, after });
  output(data);
};

/**
 * Handles `spotify follow <id...>`.
 *
 * Follows one or more artists.
 */
export const followCommand: CommandHandler = async (args) => {
  const ids = requireIds(args.positional, "spotify follow <id...>");
  await api.followArtists(ids);
  output({ status: "followed", ids });
};

/**
 * Handles `spotify unfollow <id...>`.
 *
 * Unfollows one or more artists.
 */
export const unfollowCommand: CommandHandler = async (args) => {
  const ids = requireIds(args.positional, "spotify unfollow <id...>");
  await api.unfollowArtists(ids);
  output({ status: "unfollowed", ids });
};
