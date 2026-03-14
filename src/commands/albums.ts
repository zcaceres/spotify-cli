/**
 * CLI command handlers for album operations.
 *
 * @module
 */

import * as api from "../api/albums.js";
import { output } from "../output.js";
import { argsError } from "../errors.js";
import { optionalIntFlag, requireIds } from "../parse.js";
import type { CommandHandler } from "./index.js";

/** Handles `spotify album <id>`. Outputs album details. */
export const albumCommand: CommandHandler = async (args) => {
  const id = args.positional[0];
  if (!id) throw argsError("Usage: spotify album <id>");
  const data = await api.getAlbum(id);
  output(data);
};

/**
 * Handles `spotify album-tracks <id> [--limit N] [--offset N]`.
 *
 * Lists tracks in an album with optional pagination.
 */
export const albumTracksCommand: CommandHandler = async (args) => {
  const id = args.positional[0];
  if (!id) throw argsError("Usage: spotify album-tracks <id>");
  const limit = optionalIntFlag(args.flags, "limit");
  const offset = optionalIntFlag(args.flags, "offset");
  const data = await api.getAlbumTracks(id, { limit, offset });
  output(data);
};

/**
 * Handles `spotify saved-albums [--limit N] [--offset N]`.
 *
 * Lists the current user's saved albums.
 */
export const savedAlbumsCommand: CommandHandler = async (args) => {
  const limit = optionalIntFlag(args.flags, "limit");
  const offset = optionalIntFlag(args.flags, "offset");
  const data = await api.getSavedAlbums({ limit, offset });
  output(data);
};

/**
 * Handles `spotify save-albums <id...>`.
 *
 * Saves one or more albums to the current user's library.
 */
export const saveAlbumsCommand: CommandHandler = async (args) => {
  const ids = requireIds(args.positional, "spotify save-albums <id...>");
  await api.saveAlbums(ids);
  output({ status: "saved", ids });
};

/**
 * Handles `spotify remove-albums <id...>`.
 *
 * Removes one or more albums from the current user's library.
 */
export const removeAlbumsCommand: CommandHandler = async (args) => {
  const ids = requireIds(args.positional, "spotify remove-albums <id...>");
  await api.removeAlbums(ids);
  output({ status: "removed", ids });
};
