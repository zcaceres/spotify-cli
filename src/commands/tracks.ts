import * as api from "../api/tracks.js";
import { output } from "../output.js";
import { argsError } from "../errors.js";
import { optionalIntFlag } from "../parse.js";
import type { CommandHandler } from "./index.js";

export const trackCommand: CommandHandler = async (args) => {
  const id = args.positional[0];
  if (!id) throw argsError("Usage: spotify track <id>");
  const data = await api.getTrack(id);
  output(data);
};

export const savedTracksCommand: CommandHandler = async (args) => {
  const limit = optionalIntFlag(args.flags, "limit");
  const offset = optionalIntFlag(args.flags, "offset");
  const data = await api.getSavedTracks({ limit, offset });
  output(data);
};

export const saveTracksCommand: CommandHandler = async (args) => {
  if (args.positional.length === 0) throw argsError("Usage: spotify save-tracks <id...>");
  await api.saveTracks(args.positional);
  output({ status: "saved", ids: args.positional });
};

export const removeTracksCommand: CommandHandler = async (args) => {
  if (args.positional.length === 0) throw argsError("Usage: spotify remove-tracks <id...>");
  await api.removeTracks(args.positional);
  output({ status: "removed", ids: args.positional });
};

export const audioFeaturesCommand: CommandHandler = async (args) => {
  const id = args.positional[0];
  if (!id) throw argsError("Usage: spotify audio-features <id>");
  const data = await api.getAudioFeatures(id);
  output(data);
};

export const recommendationsCommand: CommandHandler = async (args) => {
  const seedTracks = args.flags["seed-tracks"];
  const seedArtists = args.flags["seed-artists"];
  const seedGenres = args.flags["seed-genres"];
  const limit = optionalIntFlag(args.flags, "limit");

  if (!seedTracks && !seedArtists && !seedGenres) {
    throw argsError(
      "Usage: spotify recommendations --seed-tracks <ids> | --seed-artists <ids> | --seed-genres <genres>",
    );
  }

  const data = await api.getRecommendations({
    seed_tracks: seedTracks,
    seed_artists: seedArtists,
    seed_genres: seedGenres,
    limit,
  });
  output(data);
};
