/**
 * CLI command handlers for playback control.
 *
 * @module
 */

import * as api from "../api/player.js";
import { argsError } from "../errors.js";
import { output } from "../output.js";
import { optionalIntFlag, parseIntFlag } from "../parse.js";
import type { CommandHandler } from "./index.js";

/**
 * Handles `spotify now`.
 *
 * Outputs the currently playing track, or `{"status": "not_playing"}` if idle.
 */
export const nowCommand: CommandHandler = async () => {
  const data = await api.getCurrentlyPlaying();
  output(data ?? { status: "not_playing" });
};

/**
 * Handles `spotify play [--uri <uri>] [--context <uri>] [--device <id>] [--offset <n>] [--position <ms>]`.
 *
 * Starts or resumes playback, optionally targeting a specific device, URI, or position.
 */
export const playCommand: CommandHandler = async (args) => {
  const uri = args.flags.uri;
  const context = args.flags.context;
  const device = args.flags.device;
  const offset = args.flags.offset;
  const position = args.flags.position;

  const options: Parameters<typeof api.startPlayback>[0] = {};
  if (device) options.device_id = device;
  if (context) options.context_uri = context;
  if (uri) options.uris = [uri];
  if (offset !== undefined && offset !== "") options.offset = { position: parseIntFlag(offset, "--offset") };
  if (position !== undefined && position !== "") options.position_ms = parseIntFlag(position, "--position");

  await api.startPlayback(options);
  output({ status: "playing" });
};

/** Handles `spotify pause [--device <id>]`. */
export const pauseCommand: CommandHandler = async (args) => {
  await api.pausePlayback(args.flags.device);
  output({ status: "paused" });
};

/** Handles `spotify next [--device <id>]`. */
export const nextCommand: CommandHandler = async (args) => {
  await api.skipToNext(args.flags.device);
  output({ status: "skipped_next" });
};

/** Handles `spotify prev [--device <id>]`. */
export const prevCommand: CommandHandler = async (args) => {
  await api.skipToPrevious(args.flags.device);
  output({ status: "skipped_previous" });
};

/**
 * Handles `spotify seek <ms> [--device <id>]`.
 *
 * Seeks to a position in the currently playing track. Position must be non-negative.
 */
export const seekCommand: CommandHandler = async (args) => {
  const ms = args.positional[0];
  if (!ms) throw argsError("Usage: spotify seek <ms>");
  const position = parseIntFlag(ms, "position");
  if (position < 0) throw argsError("Seek position must be non-negative");
  await api.seekToPosition(position, args.flags.device);
  output({ status: "seeked", position_ms: position });
};

/**
 * Handles `spotify volume <0-100> [--device <id>]`.
 *
 * Sets playback volume. Value must be between 0 and 100 inclusive.
 */
export const volumeCommand: CommandHandler = async (args) => {
  const level = args.positional[0];
  if (!level) throw argsError("Usage: spotify volume <0-100>");
  const vol = parseIntFlag(level, "volume");
  if (vol < 0 || vol > 100) throw argsError("Volume must be 0-100");
  await api.setVolume(vol, args.flags.device);
  output({ status: "volume_set", volume: vol });
};

/**
 * Handles `spotify shuffle <on|off> [--device <id>]`.
 */
export const shuffleCommand: CommandHandler = async (args) => {
  const state = args.positional[0];
  if (state !== "on" && state !== "off") throw argsError("Usage: spotify shuffle <on|off>");
  await api.setShuffle(state === "on", args.flags.device);
  output({ status: "shuffle_set", shuffle: state === "on" });
};

/**
 * Handles `spotify repeat <off|track|context> [--device <id>]`.
 */
export const repeatCommand: CommandHandler = async (args) => {
  const state = args.positional[0];
  if (state !== "off" && state !== "track" && state !== "context") {
    throw argsError("Usage: spotify repeat <off|track|context>");
  }
  await api.setRepeat(state, args.flags.device);
  output({ status: "repeat_set", repeat: state });
};

/** Handles `spotify queue`. Outputs the current playback queue. */
export const queueCommand: CommandHandler = async () => {
  const data = await api.getQueue();
  output(data);
};

/**
 * Handles `spotify queue-add <uri> [--device <id>]`.
 *
 * Adds a track to the end of the playback queue.
 */
export const queueAddCommand: CommandHandler = async (args) => {
  const uri = args.positional[0];
  if (!uri) throw argsError("Usage: spotify queue-add <uri>");
  await api.addToQueue(uri, args.flags.device);
  output({ status: "added_to_queue", uri });
};

/** Handles `spotify devices`. Lists all available playback devices. */
export const devicesCommand: CommandHandler = async () => {
  const data = await api.getDevices();
  output(data);
};

/**
 * Handles `spotify transfer <device_id> [--play]`.
 *
 * Transfers playback to a different device.
 */
export const transferCommand: CommandHandler = async (args) => {
  const deviceId = args.positional[0];
  if (!deviceId) throw argsError("Usage: spotify transfer <device_id>");
  const play = args.flags.play !== undefined ? true : undefined;
  await api.transferPlayback(deviceId, play);
  output({ status: "transferred", device_id: deviceId });
};

/**
 * Handles `spotify recent [--limit N] [--after <timestamp>] [--before <timestamp>]`.
 *
 * Lists recently played tracks with optional cursor-based pagination.
 */
export const recentCommand: CommandHandler = async (args) => {
  const limit = optionalIntFlag(args.flags, "limit");
  const after = optionalIntFlag(args.flags, "after");
  const before = optionalIntFlag(args.flags, "before");
  const data = await api.getRecentlyPlayed({ limit, after, before });
  output(data);
};
