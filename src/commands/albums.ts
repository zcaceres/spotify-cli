/**
 * CLI command handlers for album operations.
 *
 * @module
 */

import * as api from "../api/albums.js";
import { argsError } from "../errors.js";
import { output } from "../output.js";
import { extractId, optionalIntFlag, requireIds } from "../parse.js";
import { resolveInputs, tryResolveItems } from "../resolve.js";
import type { CommandHandler } from "./index.js";

/** Handles `spotify album <id>`. Outputs album details. */
export const albumCommand: CommandHandler = async (args) => {
  const raw = args.positional[0];
  if (!raw) throw argsError("Usage: spotify album <id>");
  const data = await api.getAlbum(extractId(raw));
  output(data);
};

/**
 * Handles `spotify album tracks <id> [--limit N] [--offset N]`.
 *
 * Lists tracks in an album with optional pagination.
 */
export const albumTracksCommand: CommandHandler = async (args) => {
  const raw = args.positional[0];
  if (!raw) throw argsError("Usage: spotify album tracks <id>");
  const id = extractId(raw);
  const limit = optionalIntFlag(args.flags, "limit");
  const offset = optionalIntFlag(args.flags, "offset");
  const data = await api.getAlbumTracks(id, { limit, offset });
  output(data);
};

/**
 * Handles `spotify album saved [--limit N] [--offset N]`.
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
 * Handles `spotify album save <id...>`.
 *
 * Saves one or more albums to the current user's library.
 */
export const saveAlbumsCommand: CommandHandler = async (args) => {
  const rawInputs = requireIds(args.positional, "spotify album save <id...>");
  const { ids, searched } = await resolveInputs(rawInputs, "album");
  await api.saveAlbums(ids);
  const items = await tryResolveItems("album", ids);
  output({ status: "saved", ids, ...(items && { items }), ...(searched.length > 0 && { searched }) });
};

/**
 * Handles `spotify album remove <id...>`.
 *
 * Removes one or more albums from the current user's library.
 */
export const removeAlbumsCommand: CommandHandler = async (args) => {
  const rawInputs = requireIds(args.positional, "spotify album remove <id...>");
  const { ids, searched } = await resolveInputs(rawInputs, "album");
  await api.removeAlbums(ids);
  const items = await tryResolveItems("album", ids);
  output({ status: "removed", ids, ...(items && { items }), ...(searched.length > 0 && { searched }) });
};
