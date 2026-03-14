import * as api from "../api/playlists.js";
import { getCurrentUser } from "../api/user.js";
import { output } from "../output.js";
import { argsError } from "../errors.js";
import { optionalIntFlag } from "../parse.js";
import type { CommandHandler } from "./index.js";

export const playlistCommand: CommandHandler = async (args) => {
  const id = args.positional[0];
  if (!id) throw argsError("Usage: spotify playlist <id>");
  const data = await api.getPlaylist(id);
  output(data);
};

export const playlistsCommand: CommandHandler = async (args) => {
  const limit = optionalIntFlag(args.flags, "limit");
  const offset = optionalIntFlag(args.flags, "offset");
  const data = await api.getCurrentUserPlaylists({ limit, offset });
  output(data);
};

export const playlistTracksCommand: CommandHandler = async (args) => {
  const id = args.positional[0];
  if (!id) throw argsError("Usage: spotify playlist-tracks <id>");
  const limit = optionalIntFlag(args.flags, "limit");
  const offset = optionalIntFlag(args.flags, "offset");
  const data = await api.getPlaylistTracks(id, { limit, offset });
  output(data);
};

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

export const playlistRemoveCommand: CommandHandler = async (args) => {
  const id = args.positional[0];
  const uris = args.positional.slice(1);
  if (!id || uris.length === 0) {
    throw argsError("Usage: spotify playlist-remove <playlist_id> <uri...>");
  }
  const data = await api.removeTracksFromPlaylist(id, uris);
  output(data);
};

export const playlistCreateCommand: CommandHandler = async (args) => {
  const name = args.positional[0];
  if (!name) throw argsError("Usage: spotify playlist-create <name> [--description ...] [--public]");

  const user = (await getCurrentUser()) as { id: string };
  const description = args.flags["description"];
  const isPublic = args.flags["public"] !== undefined ? true : undefined;

  const opts: { name: string; description?: string; public?: boolean } = { name };
  if (description !== undefined) opts.description = description;
  if (isPublic !== undefined) opts.public = isPublic;

  const data = await api.createPlaylist(user.id, opts);
  output(data);
};
