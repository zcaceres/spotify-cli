#!/usr/bin/env bun

import { commands, type ParsedArgs } from "./commands/index.js";
import { output, handleError } from "./output.js";
import { argsError } from "./errors.js";

function parseArgs(argv: string[]): { command: string; args: ParsedArgs } {
  const raw = argv.slice(2);
  const command = raw[0];

  if (!command) {
    throw argsError("No command provided. Run `spotify help` to see available commands.");
  }

  const positional: string[] = [];
  const flags: Record<string, string> = {};
  const multiFlags: Record<string, string[]> = {};
  let restArePositional = false;

  for (let i = 1; i < raw.length; i++) {
    const arg = raw[i]!;

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
        if (next !== undefined && !next.startsWith("-")) {
          value = next;
          i++;
        } else {
          value = "";
        }
      }
      if (key in flags) {
        if (!multiFlags[key]) multiFlags[key] = [flags[key]!];
        multiFlags[key]!.push(value);
      }
      flags[key] = value;
    } else {
      positional.push(arg);
    }
  }

  return { command, args: { positional, flags, multiFlags } };
}

function showHelp(): void {
  output({ usage: "spotify <command> [args] [--flags]", commands: Object.fromEntries([...commands].map(([k, v]) => [k, v.description])) });
}

async function main() {
  try {
    const { command, args } = parseArgs(process.argv);

    if (command === "help" || command === "--help" || command === "-h") {
      showHelp();
      return;
    }

    const cmd = commands.get(command);
    if (!cmd) {
      throw argsError(`Unknown command: ${command}. Run \`spotify help\` to see available commands.`);
    }

    await cmd.handler(args);
  } catch (err) {
    handleError(err);
  }
}

main();
