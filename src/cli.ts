#!/usr/bin/env bun

import { commands, type ParsedArgs } from "./commands/index.js";
import { VERSION } from "./config.js";
import { argsError, ErrorCode } from "./errors.js";
import { formatCommandHelp, formatHelp, formatVersion } from "./formatters.js";
import { handleError, output, setOutputMode, setTextFormatter } from "./output.js";

/** Collect subcommands for a given parent command prefix. */
function getSubcommands(parent: string): Record<string, string> {
  const prefix = `${parent} `;
  const subs: Record<string, string> = {};
  for (const [key, def] of commands) {
    if (key.startsWith(prefix)) {
      subs[key.slice(prefix.length)] = def.description;
    }
  }
  return subs;
}

export function parseArgs(argv: string[]): { command: string; args: ParsedArgs } {
  const raw = argv.slice(2);
  const first = raw[0];

  if (!first) {
    throw argsError("No command provided. Run `spotify help` to see available commands.", ErrorCode.MISSING_ARGUMENT);
  }

  // Try two-word subcommand first (e.g. "playlist create")
  const second = raw[1];
  let command: string;
  let argStart: number;
  if (second && !second.startsWith("-") && commands.has(`${first} ${second}`)) {
    command = `${first} ${second}`;
    argStart = 2;
  } else {
    command = first;
    argStart = 1;
  }

  const positional: string[] = [];
  const flags: Record<string, string> = {};
  const multiFlags: Record<string, string[]> = {};
  let restArePositional = false;

  for (let i = argStart; i < raw.length; i++) {
    const arg = raw[i];
    if (arg === undefined) continue;

    if (restArePositional) {
      positional.push(arg);
      continue;
    }

    if (arg === "--") {
      restArePositional = true;
      continue;
    }

    if (arg.startsWith("--")) {
      let key: string;
      let value: string;
      const eqIdx = arg.indexOf("=");
      if (eqIdx !== -1) {
        key = arg.slice(2, eqIdx);
        value = arg.slice(eqIdx + 1);
      } else {
        key = arg.slice(2);
        const next = raw[i + 1];
        // Consume the next token as the flag value unless it looks like another flag.
        // A single "-" followed by a digit (e.g. "-5") is a negative number, not a flag.
        const isNextFlag = next?.startsWith("-") && !/^-\d/.test(next);
        if (next !== undefined && !isNextFlag) {
          value = next;
          i++;
        } else {
          value = "";
        }
      }
      if (key in flags) {
        const existing = flags[key];
        if (!multiFlags[key] && existing !== undefined) multiFlags[key] = [existing];
        multiFlags[key]?.push(value);
      }
      flags[key] = value;
    } else {
      positional.push(arg);
    }
  }

  return { command, args: { positional, flags, multiFlags } };
}

function showHelp(): void {
  output({
    usage: "spotify <command> [args] [--flags]",
    commands: Object.fromEntries([...commands].map(([k, v]) => [k, v.description])),
  });
}

function showCommandHelp(command: string, cmd: { description: string; usage?: string }): void {
  const subcommands = getSubcommands(command);
  const result: Record<string, unknown> = {
    command,
    description: cmd.description,
    usage: cmd.usage ?? `spotify ${command}`,
  };
  if (Object.keys(subcommands).length > 0) {
    result.subcommands = subcommands;
  }
  output(result);
}

async function main() {
  try {
    const { command, args } = parseArgs(process.argv);

    // Extract --text flag before dispatching
    if (args.flags.text !== undefined) {
      setOutputMode("text");
      delete args.flags.text;
    }

    if (command === "--version" || command === "-V") {
      setTextFormatter(formatVersion);
      output({ version: VERSION });
      return;
    }

    if (command === "help" || command === "--help" || command === "-h") {
      setTextFormatter(formatHelp);
      showHelp();
      return;
    }

    const cmd = commands.get(command);

    if (!cmd) {
      // Check if this is a parent with subcommands (e.g. "auth" has "auth status")
      const subs = getSubcommands(command);
      if (Object.keys(subs).length > 0) {
        // If the user passed an argument that isn't a valid subcommand, error
        const attempted = args.positional[0];
        if (attempted) {
          throw argsError(
            `Unknown subcommand: ${command} ${attempted}. Available: ${Object.keys(subs).join(", ")}`,
            ErrorCode.UNKNOWN_COMMAND,
          );
        }
        setTextFormatter(formatCommandHelp);
        output({
          command,
          usage: `spotify ${command} <subcommand>`,
          subcommands: subs,
        });
        return;
      }
      throw argsError(
        `Unknown command: ${command}. Run \`spotify help\` to see available commands.`,
        ErrorCode.UNKNOWN_COMMAND,
      );
    }

    if (args.flags.help !== undefined) {
      setTextFormatter(formatCommandHelp);
      showCommandHelp(command, cmd);
      return;
    }

    if (cmd.textFormat) setTextFormatter(cmd.textFormat);
    await cmd.handler(args);
  } catch (err) {
    handleError(err);
  }
}

if (import.meta.main) {
  main();
}
