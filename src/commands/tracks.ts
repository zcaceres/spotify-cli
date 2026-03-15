/**
 * CLI command handlers for track operations.
 *
 * @module
 */

import * as api from "../api/tracks.js";
import { apiError, argsError, ErrorCode, SpotifyCliError } from "../errors.js";
import { output } from "../output.js";
import { optionalIntFlag, requireIds } from "../parse.js";
import type { CommandHandler } from "./index.js";

/** Handles `spotify track <id>`. Outputs track details. */
export const trackCommand: CommandHandler = async (args) => {
  const id = args.positional[0];
  if (!id) throw argsError("Usage: spotify track <id>");
  const data = await api.getTrack(id);
  output(data);
};

/**
 * Handles `spotify saved-tracks [--limit N] [--offset N]`.
 *
 * Lists the current user's saved tracks.
 */
export const savedTracksCommand: CommandHandler = async (args) => {
  const limit = optionalIntFlag(args.flags, "limit");
  const offset = optionalIntFlag(args.flags, "offset");
  const data = await api.getSavedTracks({ limit, offset });
  output(data);
};

/**
 * Handles `spotify save-tracks <id...>`.
 *
 * Saves one or more tracks to the current user's library.
 */
export const saveTracksCommand: CommandHandler = async (args) => {
  const ids = requireIds(args.positional, "spotify save-tracks <id...>");
  await api.saveTracks(ids);
  output({ status: "saved", ids });
};

/**
 * Handles `spotify remove-tracks <id...>`.
 *
 * Removes one or more tracks from the current user's library.
 */
export const removeTracksCommand: CommandHandler = async (args) => {
  const ids = requireIds(args.positional, "spotify remove-tracks <id...>");
  await api.removeTracks(ids);
  output({ status: "removed", ids });
};

/**
 * Handles `spotify audio-features <id>`.
 *
 * Outputs audio analysis features (danceability, energy, tempo, etc.) for a track.
 */
export const audioFeaturesCommand: CommandHandler = async (args) => {
  const id = args.positional[0];
  if (!id) throw argsError("Usage: spotify audio-features <id>");
  try {
    const data = await api.getAudioFeatures(id);
    output(data);
  } catch (err) {
    if (err instanceof SpotifyCliError && err.details.status === 403) {
      throw apiError(
        "Audio Features API is restricted. Spotify removed access for most apps in November 2024. See: https://developer.spotify.com/blog/2024-11-27-changes-to-the-web-api",
        { code: ErrorCode.DEPRECATED, status: 403, deprecated: true },
      );
    }
    throw err;
  }
};

/**
 * Handles `spotify recommendations --seed-tracks <ids> | --seed-artists <ids> | --seed-genres <genres> [--limit N]`.
 *
 * Gets track recommendations based on seed tracks, artists, and/or genres.
 * At least one seed type is required.
 */
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

  try {
    const data = await api.getRecommendations({
      seed_tracks: seedTracks,
      seed_artists: seedArtists,
      seed_genres: seedGenres,
      limit,
    });
    output(data);
  } catch (err) {
    if (err instanceof SpotifyCliError && [403, 404].includes(err.details.status ?? 0)) {
      throw apiError(
        "Recommendations API is no longer available. Spotify removed access in November 2024. See: https://developer.spotify.com/blog/2024-11-27-changes-to-the-web-api",
        { code: ErrorCode.DEPRECATED, status: err.details.status ?? 0, deprecated: true },
      );
    }
    throw err;
  }
};
