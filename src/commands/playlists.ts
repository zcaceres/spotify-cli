/**
 * CLI command handlers for playlist operations.
 *
 * @module
 */

import * as api from "../api/playlists.js";
import { argsError } from "../errors.js";
import { output } from "../output.js";
import { ensureTrackUri, extractId, optionalIntFlag } from "../parse.js";
import { resolveInputs, tryResolveItems } from "../resolve.js";
import type { CommandHandler } from "./index.js";

/** Handles `spotify playlist <id>`. Outputs playlist details. */
export const playlistCommand: CommandHandler = async (args) => {
  const raw = args.positional[0];
  if (!raw) throw argsError("Usage: spotify playlist <id>");
  const data = await api.getPlaylist(extractId(raw));
  output(data);
};

/**
 * Handles `spotify playlist list [--limit N] [--offset N]`.
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
 * Handles `spotify playlist tracks <id> [--limit N] [--offset N]`.
 *
 * Lists the tracks in a playlist with optional pagination.
 */
export const playlistTracksCommand: CommandHandler = async (args) => {
  const raw = args.positional[0];
  if (!raw) throw argsError("Usage: spotify playlist tracks <id>");
  const id = extractId(raw);
  const limit = optionalIntFlag(args.flags, "limit");
  const offset = optionalIntFlag(args.flags, "offset");
  const data = await api.getPlaylistTracks(id, { limit, offset });
  output(data);
};

/**
 * Handles `spotify playlist add <playlist_id> <uri...> [--position N]`.
 *
 * Adds one or more tracks to a playlist at an optional position.
 */
export const playlistAddCommand: CommandHandler = async (args) => {
  const id = args.positional[0];
  const rawTracks = args.positional.slice(1);
  if (!id || rawTracks.length === 0) {
    throw argsError("Usage: spotify playlist add <playlist_id> <uri...>");
  }
  const { ids, searched } = await resolveInputs(rawTracks, "track");
  const trackUris = ids.map(ensureTrackUri);
  const position = optionalIntFlag(args.flags, "position");
  const data = await api.addTracksToPlaylist(id, trackUris, position);
  const items = await tryResolveItems("track", ids);
  output({ ...((data as object) ?? {}), ids, ...(items && { items }), ...(searched.length > 0 && { searched }) });
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
 * Handles `spotify playlist remove <playlist_id> [uri...] [--match name] [--index N]`.
 *
 * Removes tracks by URI, name substring match, or 1-based index.
 * --match and --index can be repeated. URIs can also be passed as positional args.
 */
export const playlistRemoveCommand: CommandHandler = async (args) => {
  const id = args.positional[0];
  if (!id) {
    throw argsError("Usage: spotify playlist remove <playlist_id> [uri...] [--match name] [--index N]");
  }

  const directUris = args.positional.slice(1);
  const matchValues = args.multiFlags.match ?? (args.flags.match !== undefined ? [args.flags.match] : []);
  const indexValues = args.multiFlags.index ?? (args.flags.index !== undefined ? [args.flags.index] : []);

  if (directUris.length === 0 && matchValues.length === 0 && indexValues.length === 0) {
    throw argsError("Usage: spotify playlist remove <playlist_id> [uri...] [--match name] [--index N]");
  }

  const urisToRemove = new Set<string>();
  // Resolve direct positional inputs (may be IDs, URIs, or search queries)
  let searched: Array<{ query: string; match: import("../resolve.js").ItemSummary }> = [];
  if (directUris.length > 0) {
    const resolved = await resolveInputs(directUris, "track");
    const resolvedUris = resolved.ids.map(ensureTrackUri);
    for (const u of resolvedUris) urisToRemove.add(u);
    searched = resolved.searched;
  }

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
      if (Number.isNaN(idx) || idx < 1 || idx > tracks.length) {
        throw argsError(`Invalid index ${idx}: playlist has ${tracks.length} tracks (1-based)`);
      }
      const track = tracks[idx - 1];
      if (track) urisToRemove.add(track.uri);
    }
  }

  const uriList = [...urisToRemove];
  const data = await api.removeTracksFromPlaylist(id, uriList);
  // Extract IDs from URIs for enrichment
  const trackIds = uriList.map((u) => u.replace(/^spotify:track:/, ""));
  const items = await tryResolveItems("track", trackIds);
  output({
    ...((data as object) ?? {}),
    ids: trackIds,
    ...(items && { items }),
    ...(searched.length > 0 && { searched }),
  });
};

/**
 * Handles `spotify playlist create <name> [--description ...] [--public]`.
 *
 * Creates a new playlist for the current user.
 */
export const playlistCreateCommand: CommandHandler = async (args) => {
  const name = args.positional[0];
  if (!name) throw argsError("Usage: spotify playlist create <name> [--description ...] [--public]");

  const description = args.flags.description;
  const isPublic = args.flags.public !== undefined ? true : undefined;

  const opts: { name: string; description?: string; public?: boolean } = { name };
  if (description !== undefined && description !== "") opts.description = description;
  if (isPublic !== undefined) opts.public = isPublic;

  const data = await api.createPlaylist(opts);
  output(data);
};

/**
 * Handles `spotify playlist rename <id> <new_name>`.
 *
 * Renames an existing playlist.
 */
export const playlistRenameCommand: CommandHandler = async (args) => {
  const rawId = args.positional[0];
  const name = args.positional[1];
  if (!rawId || !name) {
    throw argsError("Usage: spotify playlist rename <id> <new_name>");
  }
  const id = extractId(rawId);
  await api.renamePlaylist(id, name);
  output({ id, name });
};

const UPDATE_USAGE =
  "Usage: spotify playlist update <id> [--name <text>] [--description <text>] [--public|--private] [--collaborative|--no-collaborative]";

/**
 * Handles `spotify playlist update <id> [--name ...] [--description ...] [--public|--private] [--collaborative|--no-collaborative]`.
 *
 * Updates one or more details of an existing playlist. At least one field flag must be provided.
 */
export const playlistUpdateCommand: CommandHandler = async (args) => {
  const rawId = args.positional[0];
  if (!rawId) throw argsError(UPDATE_USAGE);
  const id = extractId(rawId);

  const opts: { name?: string; description?: string; public?: boolean; collaborative?: boolean } = {};

  if (args.flags.name !== undefined) opts.name = args.flags.name;
  if (args.flags.description !== undefined) opts.description = args.flags.description;

  const wantsPublic = args.flags.public !== undefined;
  const wantsPrivate = args.flags.private !== undefined;
  if (wantsPublic && wantsPrivate) {
    throw argsError("Cannot specify both --public and --private");
  }
  if (wantsPublic) opts.public = true;
  if (wantsPrivate) opts.public = false;

  const wantsCollab = args.flags.collaborative !== undefined;
  const wantsNoCollab = args.flags["no-collaborative"] !== undefined;
  if (wantsCollab && wantsNoCollab) {
    throw argsError("Cannot specify both --collaborative and --no-collaborative");
  }
  if (wantsCollab) opts.collaborative = true;
  if (wantsNoCollab) opts.collaborative = false;

  if (Object.keys(opts).length === 0) {
    throw argsError(
      "At least one field must be provided: --name, --description, --public/--private, or --collaborative/--no-collaborative",
    );
  }

  await api.updatePlaylistDetails(id, opts);
  output({ id, ...opts });
};
