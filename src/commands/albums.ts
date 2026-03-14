import * as api from "../api/albums.js";
import { output } from "../output.js";
import { argsError } from "../errors.js";
import type { CommandHandler } from "./index.js";

export const albumCommand: CommandHandler = async (args) => {
  const id = args.positional[0];
  if (!id) throw argsError("Usage: spotify album <id>");
  const data = await api.getAlbum(id);
  output(data);
};

export const albumTracksCommand: CommandHandler = async (args) => {
  const id = args.positional[0];
  if (!id) throw argsError("Usage: spotify album-tracks <id>");
  const limit = args.flags["limit"] ? parseInt(args.flags["limit"], 10) : undefined;
  const offset = args.flags["offset"] ? parseInt(args.flags["offset"], 10) : undefined;
  const data = await api.getAlbumTracks(id, { limit, offset });
  output(data);
};

export const savedAlbumsCommand: CommandHandler = async (args) => {
  const limit = args.flags["limit"] ? parseInt(args.flags["limit"], 10) : undefined;
  const offset = args.flags["offset"] ? parseInt(args.flags["offset"], 10) : undefined;
  const data = await api.getSavedAlbums({ limit, offset });
  output(data);
};

export const saveAlbumsCommand: CommandHandler = async (args) => {
  if (args.positional.length === 0) throw argsError("Usage: spotify save-albums <id...>");
  await api.saveAlbums(args.positional);
  output({ status: "saved", ids: args.positional });
};

export const removeAlbumsCommand: CommandHandler = async (args) => {
  if (args.positional.length === 0) throw argsError("Usage: spotify remove-albums <id...>");
  await api.removeAlbums(args.positional);
  output({ status: "removed", ids: args.positional });
};
