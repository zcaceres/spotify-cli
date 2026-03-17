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
  usage?: string;
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

/** Registry of all CLI commands, keyed by command name (space-separated for subcommands). */
export const commands = new Map<string, CommandDef>([
  // Auth
  [
    "login",
    {
      handler: loginCommand,
      description: "OAuth PKCE login (opens browser)",
      usage: "spotify login [--client-id <id>]",
    },
  ],
  ["logout", { handler: logoutCommand, description: "Clear stored tokens", usage: "spotify logout" }],
  [
    "auth status",
    { handler: authStatusCommand, description: "Show token validity & scopes", usage: "spotify auth status" },
  ],

  // Player
  ["now", { handler: nowCommand, description: "Currently playing track", usage: "spotify now" }],
  [
    "play",
    { handler: playCommand, description: "Start/resume playback", usage: "spotify play [--uri <uri>] [--device <id>]" },
  ],
  ["pause", { handler: pauseCommand, description: "Pause playback", usage: "spotify pause [--device <id>]" }],
  ["next", { handler: nextCommand, description: "Skip to next track", usage: "spotify next [--device <id>]" }],
  ["prev", { handler: prevCommand, description: "Skip to previous track", usage: "spotify prev [--device <id>]" }],
  ["seek", { handler: seekCommand, description: "Seek to position (ms)", usage: "spotify seek <ms>" }],
  ["volume", { handler: volumeCommand, description: "Set volume (0-100)", usage: "spotify volume <0-100>" }],
  ["shuffle", { handler: shuffleCommand, description: "Toggle shuffle (on|off)", usage: "spotify shuffle <on|off>" }],
  [
    "repeat",
    {
      handler: repeatCommand,
      description: "Set repeat mode (off|track|context)",
      usage: "spotify repeat <off|track|context>",
    },
  ],
  ["queue", { handler: queueCommand, description: "Show playback queue", usage: "spotify queue" }],
  [
    "queue add",
    { handler: queueAddCommand, description: "Add track to queue", usage: "spotify queue add <uri> [--device <id>]" },
  ],
  ["devices", { handler: devicesCommand, description: "List available devices", usage: "spotify devices" }],
  [
    "transfer",
    { handler: transferCommand, description: "Transfer playback to device", usage: "spotify transfer <device_id>" },
  ],
  ["recent", { handler: recentCommand, description: "Recently played tracks", usage: "spotify recent [--limit N]" }],

  // Search
  [
    "search",
    {
      handler: searchCommand,
      description: "Search Spotify",
      usage: "spotify search <query> [--type <type>] [--limit N]",
    },
  ],

  // Tracks
  ["track", { handler: trackCommand, description: "Get track details", usage: "spotify track <id>" }],
  [
    "track saved",
    {
      handler: savedTracksCommand,
      description: "List saved tracks",
      usage: "spotify track saved [--limit N] [--offset N]",
    },
  ],
  [
    "track save",
    { handler: saveTracksCommand, description: "Save tracks to library", usage: "spotify track save <id...>" },
  ],
  [
    "track remove",
    { handler: removeTracksCommand, description: "Remove saved tracks", usage: "spotify track remove <id...>" },
  ],
  [
    "track features",
    { handler: audioFeaturesCommand, description: "Track audio features", usage: "spotify track features <id>" },
  ],
  [
    "track recommendations",
    {
      handler: recommendationsCommand,
      description: "Get recommendations",
      usage:
        "spotify track recommendations [--seed-tracks <ids>] [--seed-artists <ids>] [--seed-genres <genres>] [--limit N]",
    },
  ],

  // Albums
  ["album", { handler: albumCommand, description: "Get album details", usage: "spotify album <id>" }],
  [
    "album tracks",
    {
      handler: albumTracksCommand,
      description: "List album tracks",
      usage: "spotify album tracks <id> [--limit N] [--offset N]",
    },
  ],
  [
    "album saved",
    {
      handler: savedAlbumsCommand,
      description: "List saved albums",
      usage: "spotify album saved [--limit N] [--offset N]",
    },
  ],
  [
    "album save",
    { handler: saveAlbumsCommand, description: "Save albums to library", usage: "spotify album save <id...>" },
  ],
  [
    "album remove",
    { handler: removeAlbumsCommand, description: "Remove saved albums", usage: "spotify album remove <id...>" },
  ],

  // Playlists
  ["playlist", { handler: playlistCommand, description: "Get playlist details", usage: "spotify playlist <id>" }],
  [
    "playlist list",
    {
      handler: playlistsCommand,
      description: "List your playlists",
      usage: "spotify playlist list [--limit N] [--offset N]",
    },
  ],
  [
    "playlist tracks",
    {
      handler: playlistTracksCommand,
      description: "List playlist tracks",
      usage: "spotify playlist tracks <id> [--limit N] [--offset N]",
    },
  ],
  [
    "playlist add",
    {
      handler: playlistAddCommand,
      description: "Add tracks to playlist",
      usage: "spotify playlist add <playlist_id> <uri...> [--position N]",
    },
  ],
  [
    "playlist remove",
    {
      handler: playlistRemoveCommand,
      description: "Remove tracks from playlist",
      usage: "spotify playlist remove <playlist_id> [uri...] [--match name] [--index N]",
    },
  ],
  [
    "playlist create",
    {
      handler: playlistCreateCommand,
      description: "Create a new playlist",
      usage: "spotify playlist create <name> [--description ...] [--public]",
    },
  ],

  // User
  ["me", { handler: meCommand, description: "Current user profile", usage: "spotify me" }],
  [
    "top",
    {
      handler: topCommand,
      description: "Top artists or tracks",
      usage: "spotify top <artists|tracks> [--limit N] [--time-range <short|medium|long>]",
    },
  ],
  ["following", { handler: followingCommand, description: "Followed artists", usage: "spotify following [--limit N]" }],
  ["follow", { handler: followCommand, description: "Follow artists", usage: "spotify follow <id...>" }],
  ["unfollow", { handler: unfollowCommand, description: "Unfollow artists", usage: "spotify unfollow <id...>" }],
]);
