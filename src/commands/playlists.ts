/**
 * CLI command handlers for playlist operations.
 *
 * @module
 */

import * as api from "../api/playlists.js";
import { argsError } from "../errors.js";
import { output } from "../output.js";
import { optionalIntFlag } from "../parse.js";
import type { CommandHandler } from "./index.js";

/** Handles `spotify playlist <id>`. Outputs playlist details. */
export const playlistCommand: CommandHandler = async (args) => {
  const id = args.positional[0];
  if (!id) throw argsError("Usage: spotify playlist <id>");
  const data = await api.getPlaylist(id);
  output(data);
};

/**
 * Handles `spotify playlists [--limit N] [--offset N]`.
 *
 * Lists the current user's playlists.
 */
export const playlistsCommand: CommandHandler = async (args) => {
  const limit = optionalIntFlag(args.flags, "limit");
  const offset = optionalIntFlag(args.flags, "offset");
  const data = await api.getCurrentUserPlaylists({ limit, offset });
  output(data);
};

/**
 * Handles `spotify playlist-tracks <id> [--limit N] [--offset N]`.
 *
 * Lists the tracks in a playlist with optional pagination.
 */
export const playlistTracksCommand: CommandHandler = async (args) => {
  const id = args.positional[0];
  if (!id) throw argsError("Usage: spotify playlist-tracks <id>");
  const limit = optionalIntFlag(args.flags, "limit");
  const offset = optionalIntFlag(args.flags, "offset");
  const data = await api.getPlaylistTracks(id, { limit, offset });
  output(data);
};

/**
 * Handles `spotify playlist-add <playlist_id> <uri...> [--position N]`.
 *
 * Adds one or more tracks to a playlist at an optional position.
 */
export const playlistAddCommand: CommandHandler = async (args) => {
  const id = args.positional[0];
  const uris = args.positional.slice(1);
  if (!id || uris.length === 0) {
    throw argsError("Usage: spotify playlist-add <playlist_id> <uri...>");
  }
  const position = optionalIntFlag(args.flags, "position");
  const data = await api.addTracksToPlaylist(id, uris, position);
  output(data);
};

/**
 * Fetches all tracks from a playlist, paginating through all results.
 */
async function fetchAllPlaylistTracks(
  playlistId: string,
): Promise<Array<{ uri: string; name: string; artists: string }>> {
  const tracks: Array<{ uri: string; name: string; artists: string }> = [];
  let offset = 0;
  const limit = 50;
  while (true) {
    const data = (await api.getPlaylistTracks(playlistId, { limit, offset })) as {
      items: Array<{ item: { uri: string; name: string; artists: Array<{ name: string }> } | null }>;
      total: number;
    };
    for (const entry of data.items) {
      if (entry.item) {
        tracks.push({
          uri: entry.item.uri,
          name: entry.item.name,
          artists: entry.item.artists.map((a) => a.name).join(", "),
        });
      }
    }
    offset += limit;
    if (offset >= data.total) break;
  }
  return tracks;
}

/**
 * Handles `spotify playlist-remove <playlist_id> [uri...] [--match name] [--index N]`.
 *
 * Removes tracks by URI, name substring match, or 1-based index.
 * --match and --index can be repeated. URIs can also be passed as positional args.
 */
export const playlistRemoveCommand: CommandHandler = async (args) => {
  const id = args.positional[0];
  if (!id) {
    throw argsError("Usage: spotify playlist-remove <playlist_id> [uri...] [--match name] [--index N]");
  }

  const directUris = args.positional.slice(1);
  const matchValues = args.multiFlags["match"] ?? (args.flags["match"] !== undefined ? [args.flags["match"]] : []);
  const indexValues = args.multiFlags["index"] ?? (args.flags["index"] !== undefined ? [args.flags["index"]] : []);

  if (directUris.length === 0 && matchValues.length === 0 && indexValues.length === 0) {
    throw argsError("Usage: spotify playlist-remove <playlist_id> [uri...] [--match name] [--index N]");
  }

  const urisToRemove = new Set<string>(directUris);

  if (matchValues.length > 0 || indexValues.length > 0) {
    const tracks = await fetchAllPlaylistTracks(id);

    for (const match of matchValues) {
      const lower = match.toLowerCase();
      const found = tracks.filter(
        (t) => t.name.toLowerCase().includes(lower) || t.artists.toLowerCase().includes(lower),
      );
      if (found.length === 0) {
        throw argsError(`No tracks matching "${match}" found in playlist`);
      }
      for (const t of found) urisToRemove.add(t.uri);
    }

    const indices = indexValues.flatMap((v) => v.split(",").map((s) => parseInt(s.trim(), 10)));
    for (const idx of indices) {
      if (isNaN(idx) || idx < 1 || idx > tracks.length) {
        throw argsError(`Invalid index ${idx}: playlist has ${tracks.length} tracks (1-based)`);
      }
      urisToRemove.add(tracks[idx - 1]!.uri);
    }
  }

  const data = await api.removeTracksFromPlaylist(id, [...urisToRemove]);
  output(data);
};

/**
 * Handles `spotify playlist-create <name> [--description ...] [--public]`.
 *
 * Creates a new playlist for the current user.
 */
export const playlistCreateCommand: CommandHandler = async (args) => {
  const name = args.positional[0];
  if (!name) throw argsError("Usage: spotify playlist-create <name> [--description ...] [--public]");

  const description = args.flags["description"];
  const isPublic = args.flags["public"] !== undefined ? true : undefined;

  const opts: { name: string; description?: string; public?: boolean } = { name };
  if (description !== undefined) opts.description = description;
  if (isPublic !== undefined) opts.public = isPublic;

  const data = await api.createPlaylist(opts);
  output(data);
};
