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
export interface CommandDef {
  handler: CommandHandler;
  description: string;
  usage?: string;
  /** Text formatter for `--text` output mode. */
  textFormat: (data: unknown) => string;
}

import * as fmt from "../formatters.js";
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
  playlistRenameCommand,
  playlistsCommand,
  playlistTracksCommand,
  playlistUpdateCommand,
} from "./playlists.js";
import { searchCommand } from "./search.js";
import {
  audioFeaturesCommand,
  recommendationsCommand,
  removeTracksCommand,
  savedTracksCommand,
  saveTracksCommand,
  trackCommand,
  trackFindCommand,
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
      textFormat: fmt.formatLogin,
    },
  ],
  [
    "logout",
    {
      handler: logoutCommand,
      description: "Clear stored tokens",
      usage: "spotify logout",
      textFormat: fmt.formatLogout,
    },
  ],
  [
    "auth status",
    {
      handler: authStatusCommand,
      description: "Show token validity & scopes",
      usage: "spotify auth status",
      textFormat: fmt.formatAuthStatus,
    },
  ],

  // Player
  [
    "now",
    { handler: nowCommand, description: "Currently playing track", usage: "spotify now", textFormat: fmt.formatNow },
  ],
  [
    "play",
    {
      handler: playCommand,
      description: "Start/resume playback",
      usage: "spotify play [--uri <uri>] [--device <id>]",
      textFormat: fmt.formatPlay,
    },
  ],
  [
    "pause",
    {
      handler: pauseCommand,
      description: "Pause playback",
      usage: "spotify pause [--device <id>]",
      textFormat: fmt.formatPause,
    },
  ],
  [
    "next",
    {
      handler: nextCommand,
      description: "Skip to next track",
      usage: "spotify next [--device <id>]",
      textFormat: fmt.formatNext,
    },
  ],
  [
    "prev",
    {
      handler: prevCommand,
      description: "Skip to previous track",
      usage: "spotify prev [--device <id>]",
      textFormat: fmt.formatPrev,
    },
  ],
  [
    "seek",
    {
      handler: seekCommand,
      description: "Seek to position (ms)",
      usage: "spotify seek <ms>",
      textFormat: fmt.formatSeek,
    },
  ],
  [
    "volume",
    {
      handler: volumeCommand,
      description: "Set volume (0-100)",
      usage: "spotify volume <0-100>",
      textFormat: fmt.formatVolume,
    },
  ],
  [
    "shuffle",
    {
      handler: shuffleCommand,
      description: "Toggle shuffle (on|off)",
      usage: "spotify shuffle <on|off>",
      textFormat: fmt.formatShuffle,
    },
  ],
  [
    "repeat",
    {
      handler: repeatCommand,
      description: "Set repeat mode (off|track|context)",
      usage: "spotify repeat <off|track|context>",
      textFormat: fmt.formatRepeat,
    },
  ],
  [
    "queue",
    { handler: queueCommand, description: "Show playback queue", usage: "spotify queue", textFormat: fmt.formatQueue },
  ],
  [
    "queue add",
    {
      handler: queueAddCommand,
      description: "Add track to queue",
      usage: "spotify queue add <uri> [--device <id>]",
      textFormat: fmt.formatQueueAdd,
    },
  ],
  [
    "devices",
    {
      handler: devicesCommand,
      description: "List available devices",
      usage: "spotify devices",
      textFormat: fmt.formatDevices,
    },
  ],
  [
    "transfer",
    {
      handler: transferCommand,
      description: "Transfer playback to device",
      usage: "spotify transfer <device_id>",
      textFormat: fmt.formatTransfer,
    },
  ],
  [
    "recent",
    {
      handler: recentCommand,
      description: "Recently played tracks",
      usage: "spotify recent [--limit N]",
      textFormat: fmt.formatRecent,
    },
  ],

  // Search
  [
    "search",
    {
      handler: searchCommand,
      description: "Search Spotify",
      usage: "spotify search <query> [--type <type>] [--limit N]",
      textFormat: fmt.formatSearch,
    },
  ],

  // Tracks
  [
    "track",
    {
      handler: trackCommand,
      description: "Get track details",
      usage: "spotify track <id>",
      textFormat: fmt.formatTrack,
    },
  ],
  [
    "track find",
    {
      handler: trackFindCommand,
      description: "Find canonical track URI by title + artist",
      usage: "spotify track find --title <title> --artist <artist>",
      textFormat: fmt.formatTrack,
    },
  ],
  [
    "track saved",
    {
      handler: savedTracksCommand,
      description: "List saved tracks",
      usage: "spotify track saved [--limit N] [--offset N]",
      textFormat: fmt.formatSavedTracks,
    },
  ],
  [
    "track save",
    {
      handler: saveTracksCommand,
      description: "Save tracks to library",
      usage: "spotify track save <id...>",
      textFormat: fmt.formatTrackSave,
    },
  ],
  [
    "track remove",
    {
      handler: removeTracksCommand,
      description: "Remove saved tracks",
      usage: "spotify track remove <id...>",
      textFormat: fmt.formatTrackRemove,
    },
  ],
  [
    "track features",
    {
      handler: audioFeaturesCommand,
      description: "Track audio features",
      usage: "spotify track features <id>",
      textFormat: fmt.formatAudioFeatures,
    },
  ],
  [
    "track recommendations",
    {
      handler: recommendationsCommand,
      description: "Get recommendations",
      usage:
        "spotify track recommendations [--seed-tracks <ids>] [--seed-artists <ids>] [--seed-genres <genres>] [--limit N]",
      textFormat: fmt.formatRecommendations,
    },
  ],

  // Albums
  [
    "album",
    {
      handler: albumCommand,
      description: "Get album details",
      usage: "spotify album <id>",
      textFormat: fmt.formatAlbum,
    },
  ],
  [
    "album tracks",
    {
      handler: albumTracksCommand,
      description: "List album tracks",
      usage: "spotify album tracks <id> [--limit N] [--offset N]",
      textFormat: fmt.formatAlbumTracks,
    },
  ],
  [
    "album saved",
    {
      handler: savedAlbumsCommand,
      description: "List saved albums",
      usage: "spotify album saved [--limit N] [--offset N]",
      textFormat: fmt.formatSavedAlbums,
    },
  ],
  [
    "album save",
    {
      handler: saveAlbumsCommand,
      description: "Save albums to library",
      usage: "spotify album save <id...>",
      textFormat: fmt.formatAlbumSave,
    },
  ],
  [
    "album remove",
    {
      handler: removeAlbumsCommand,
      description: "Remove saved albums",
      usage: "spotify album remove <id...>",
      textFormat: fmt.formatAlbumRemove,
    },
  ],

  // Playlists
  [
    "playlist",
    {
      handler: playlistCommand,
      description: "Get playlist details",
      usage: "spotify playlist <id>",
      textFormat: fmt.formatPlaylist,
    },
  ],
  [
    "playlist list",
    {
      handler: playlistsCommand,
      description: "List your playlists",
      usage: "spotify playlist list [--limit N] [--offset N]",
      textFormat: fmt.formatPlaylists,
    },
  ],
  [
    "playlist tracks",
    {
      handler: playlistTracksCommand,
      description: "List playlist tracks",
      usage: "spotify playlist tracks <id> [--limit N] [--offset N]",
      textFormat: fmt.formatPlaylistTracks,
    },
  ],
  [
    "playlist add",
    {
      handler: playlistAddCommand,
      description: "Add tracks to playlist",
      usage: "spotify playlist add <playlist_id> [<uri>...] [--uris-file <path>] [-] [--position N]",
      textFormat: fmt.formatPlaylistAdd,
    },
  ],
  [
    "playlist remove",
    {
      handler: playlistRemoveCommand,
      description: "Remove tracks from playlist",
      usage: "spotify playlist remove <playlist_id> [<uri>...] [--uris-file <path>] [-] [--match name] [--index N]",
      textFormat: fmt.formatPlaylistRemove,
    },
  ],
  [
    "playlist create",
    {
      handler: playlistCreateCommand,
      description: "Create a new playlist",
      usage: "spotify playlist create <name> [--description ...] [--public]",
      textFormat: fmt.formatPlaylistCreate,
    },
  ],
  [
    "playlist rename",
    {
      handler: playlistRenameCommand,
      description: "Rename a playlist",
      usage: "spotify playlist rename <id> <new_name>",
      textFormat: fmt.formatPlaylistRename,
    },
  ],
  [
    "playlist update",
    {
      handler: playlistUpdateCommand,
      description: "Update playlist details (name, description, public, collaborative)",
      usage:
        "spotify playlist update <id> [--name <text>] [--description <text>] [--public|--private] [--collaborative|--no-collaborative]",
      textFormat: fmt.formatPlaylistUpdate,
    },
  ],

  // User
  ["me", { handler: meCommand, description: "Current user profile", usage: "spotify me", textFormat: fmt.formatMe }],
  [
    "top",
    {
      handler: topCommand,
      description: "Top artists or tracks",
      usage: "spotify top <artists|tracks> [--limit N] [--time-range <short|medium|long>]",
      textFormat: fmt.formatTop,
    },
  ],
  [
    "following",
    {
      handler: followingCommand,
      description: "Followed artists",
      usage: "spotify following [--limit N]",
      textFormat: fmt.formatFollowing,
    },
  ],
  [
    "follow",
    {
      handler: followCommand,
      description: "Follow artists",
      usage: "spotify follow <id...>",
      textFormat: fmt.formatFollow,
    },
  ],
  [
    "unfollow",
    {
      handler: unfollowCommand,
      description: "Unfollow artists",
      usage: "spotify unfollow <id...>",
      textFormat: fmt.formatUnfollow,
    },
  ],
]);
