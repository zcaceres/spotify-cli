/**
 * Command registry for the Spotify CLI.
 *
 * Maps command names (e.g. `"play"`, `"search"`) to their handler
 * functions and descriptions. This is the single source of truth
 * for all available CLI commands.
 *
 * @module
 */

/** Parsed CLI arguments passed to each command handler. */
export interface ParsedArgs {
  /** Non-flag arguments in the order they were provided. */
  positional: string[];
  /** Flag values keyed by name (without `--` prefix). Boolean flags have an empty string value. */
  flags: Record<string, string>;
  /** Flags that appeared more than once. All values collected in order. */
  multiFlags: Record<string, string[]>;
}

/** A function that handles a CLI command. */
export type CommandHandler = (args: ParsedArgs) => Promise<void>;

/** @internal */
interface CommandDef {
  handler: CommandHandler;
  description: string;
}

import {
  albumCommand,
  albumTracksCommand,
  removeAlbumsCommand,
  saveAlbumsCommand,
  savedAlbumsCommand,
} from "./albums.js";
import { authStatusCommand, loginCommand, logoutCommand } from "./auth.js";
import {
  devicesCommand,
  nextCommand,
  nowCommand,
  pauseCommand,
  playCommand,
  prevCommand,
  queueAddCommand,
  queueCommand,
  recentCommand,
  repeatCommand,
  seekCommand,
  shuffleCommand,
  transferCommand,
  volumeCommand,
} from "./player.js";
import {
  playlistAddCommand,
  playlistCommand,
  playlistCreateCommand,
  playlistRemoveCommand,
  playlistsCommand,
  playlistTracksCommand,
} from "./playlists.js";
import { searchCommand } from "./search.js";
import {
  audioFeaturesCommand,
  recommendationsCommand,
  removeTracksCommand,
  savedTracksCommand,
  saveTracksCommand,
  trackCommand,
} from "./tracks.js";
import { followCommand, followingCommand, meCommand, topCommand, unfollowCommand } from "./user.js";

/** Registry of all CLI commands, keyed by command name. */
export const commands = new Map<string, CommandDef>([
  // Auth
  ["login", { handler: loginCommand, description: "OAuth PKCE login (opens browser)" }],
  ["logout", { handler: logoutCommand, description: "Clear stored tokens" }],
  ["auth-status", { handler: authStatusCommand, description: "Show token validity & scopes" }],

  // Player
  ["now", { handler: nowCommand, description: "Currently playing track" }],
  ["play", { handler: playCommand, description: "Start/resume playback" }],
  ["pause", { handler: pauseCommand, description: "Pause playback" }],
  ["next", { handler: nextCommand, description: "Skip to next track" }],
  ["prev", { handler: prevCommand, description: "Skip to previous track" }],
  ["seek", { handler: seekCommand, description: "Seek to position (ms)" }],
  ["volume", { handler: volumeCommand, description: "Set volume (0-100)" }],
  ["shuffle", { handler: shuffleCommand, description: "Toggle shuffle (on|off)" }],
  ["repeat", { handler: repeatCommand, description: "Set repeat mode (off|track|context)" }],
  ["queue", { handler: queueCommand, description: "Show playback queue" }],
  ["queue-add", { handler: queueAddCommand, description: "Add track to queue" }],
  ["devices", { handler: devicesCommand, description: "List available devices" }],
  ["transfer", { handler: transferCommand, description: "Transfer playback to device" }],
  ["recent", { handler: recentCommand, description: "Recently played tracks" }],

  // Search
  ["search", { handler: searchCommand, description: "Search Spotify" }],

  // Tracks
  ["track", { handler: trackCommand, description: "Get track details" }],
  ["saved-tracks", { handler: savedTracksCommand, description: "List saved tracks" }],
  ["save-tracks", { handler: saveTracksCommand, description: "Save tracks to library" }],
  ["remove-tracks", { handler: removeTracksCommand, description: "Remove saved tracks" }],
  ["audio-features", { handler: audioFeaturesCommand, description: "Track audio features" }],
  ["recommendations", { handler: recommendationsCommand, description: "Get recommendations" }],

  // Albums
  ["album", { handler: albumCommand, description: "Get album details" }],
  ["album-tracks", { handler: albumTracksCommand, description: "List album tracks" }],
  ["saved-albums", { handler: savedAlbumsCommand, description: "List saved albums" }],
  ["save-albums", { handler: saveAlbumsCommand, description: "Save albums to library" }],
  ["remove-albums", { handler: removeAlbumsCommand, description: "Remove saved albums" }],

  // Playlists
  ["playlist", { handler: playlistCommand, description: "Get playlist details" }],
  ["playlists", { handler: playlistsCommand, description: "List your playlists" }],
  ["playlist-tracks", { handler: playlistTracksCommand, description: "List playlist tracks" }],
  ["playlist-add", { handler: playlistAddCommand, description: "Add tracks to playlist" }],
  ["playlist-remove", { handler: playlistRemoveCommand, description: "Remove tracks from playlist" }],
  ["playlist-create", { handler: playlistCreateCommand, description: "Create a new playlist" }],

  // User
  ["me", { handler: meCommand, description: "Current user profile" }],
  ["top", { handler: topCommand, description: "Top artists or tracks" }],
  ["following", { handler: followingCommand, description: "Followed artists" }],
  ["follow", { handler: followCommand, description: "Follow artists" }],
  ["unfollow", { handler: unfollowCommand, description: "Unfollow artists" }],
]);
