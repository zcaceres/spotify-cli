import { describe, expect, test } from "bun:test";
import { VERSION } from "./config.js";
import { parseArgs } from "./cli.js";

/** Helper: build a fake argv array as if invoked as `bun cli.ts ...args`. */
function argv(...args: string[]) {
  return ["bun", "cli.ts", ...args];
}

// --- subcommand resolution ---

describe("subcommand resolution", () => {
  test("resolves a two-word subcommand", () => {
    const result = parseArgs(argv("playlist", "create", "My Playlist"));
    expect(result.command).toBe("playlist create");
    expect(result.args.positional).toEqual(["My Playlist"]);
  });

  test("resolves single-word command when no subcommand matches", () => {
    const result = parseArgs(argv("playlist", "abc123"));
    expect(result.command).toBe("playlist");
    expect(result.args.positional).toEqual(["abc123"]);
  });

  test("resolves queue add subcommand", () => {
    const result = parseArgs(argv("queue", "add", "spotify:track:123"));
    expect(result.command).toBe("queue add");
    expect(result.args.positional).toEqual(["spotify:track:123"]);
  });

  test("resolves queue without subcommand", () => {
    const result = parseArgs(argv("queue"));
    expect(result.command).toBe("queue");
    expect(result.args.positional).toEqual([]);
  });

  test("resolves auth status subcommand", () => {
    const result = parseArgs(argv("auth", "status"));
    expect(result.command).toBe("auth status");
    expect(result.args.positional).toEqual([]);
  });

  test("resolves track save subcommand", () => {
    const result = parseArgs(argv("track", "save", "id1", "id2"));
    expect(result.command).toBe("track save");
    expect(result.args.positional).toEqual(["id1", "id2"]);
  });

  test("resolves track remove subcommand", () => {
    const result = parseArgs(argv("track", "remove", "id1"));
    expect(result.command).toBe("track remove");
    expect(result.args.positional).toEqual(["id1"]);
  });

  test("resolves track saved subcommand", () => {
    const result = parseArgs(argv("track", "saved"));
    expect(result.command).toBe("track saved");
    expect(result.args.positional).toEqual([]);
  });

  test("resolves track features subcommand", () => {
    const result = parseArgs(argv("track", "features", "abc123"));
    expect(result.command).toBe("track features");
    expect(result.args.positional).toEqual(["abc123"]);
  });

  test("resolves track recommendations subcommand", () => {
    const result = parseArgs(argv("track", "recommendations", "--seed-tracks", "id1"));
    expect(result.command).toBe("track recommendations");
    expect(result.args.flags["seed-tracks"]).toBe("id1");
  });

  test("resolves album tracks subcommand", () => {
    const result = parseArgs(argv("album", "tracks", "abc123"));
    expect(result.command).toBe("album tracks");
    expect(result.args.positional).toEqual(["abc123"]);
  });

  test("resolves album saved subcommand", () => {
    const result = parseArgs(argv("album", "saved", "--limit", "10"));
    expect(result.command).toBe("album saved");
    expect(result.args.flags.limit).toBe("10");
  });

  test("resolves album save subcommand", () => {
    const result = parseArgs(argv("album", "save", "id1"));
    expect(result.command).toBe("album save");
    expect(result.args.positional).toEqual(["id1"]);
  });

  test("resolves album remove subcommand", () => {
    const result = parseArgs(argv("album", "remove", "id1"));
    expect(result.command).toBe("album remove");
    expect(result.args.positional).toEqual(["id1"]);
  });

  test("resolves playlist list subcommand", () => {
    const result = parseArgs(argv("playlist", "list"));
    expect(result.command).toBe("playlist list");
    expect(result.args.positional).toEqual([]);
  });

  test("resolves playlist tracks subcommand", () => {
    const result = parseArgs(argv("playlist", "tracks", "abc123"));
    expect(result.command).toBe("playlist tracks");
    expect(result.args.positional).toEqual(["abc123"]);
  });

  test("resolves playlist add subcommand", () => {
    const result = parseArgs(argv("playlist", "add", "abc123", "spotify:track:aaa"));
    expect(result.command).toBe("playlist add");
    expect(result.args.positional).toEqual(["abc123", "spotify:track:aaa"]);
  });

  test("resolves playlist remove subcommand", () => {
    const result = parseArgs(argv("playlist", "remove", "abc123", "--match", "foo"));
    expect(result.command).toBe("playlist remove");
    expect(result.args.positional).toEqual(["abc123"]);
    expect(result.args.flags.match).toBe("foo");
  });

  test("does not treat flag as subcommand", () => {
    const result = parseArgs(argv("playlist", "--help"));
    expect(result.command).toBe("playlist");
    expect(result.args.flags.help).toBe("");
  });

  test("falls back to single command for unknown second word", () => {
    const result = parseArgs(argv("play", "--uri", "spotify:track:abc"));
    expect(result.command).toBe("play");
    expect(result.args.flags.uri).toBe("spotify:track:abc");
  });
});

// --- subcommand flags and positional args ---

describe("subcommand flags and positional args", () => {
  test("subcommand with flags parses correctly", () => {
    const result = parseArgs(argv("playlist", "tracks", "abc123", "--limit", "50", "--offset", "10"));
    expect(result.command).toBe("playlist tracks");
    expect(result.args.positional).toEqual(["abc123"]);
    expect(result.args.flags.limit).toBe("50");
    expect(result.args.flags.offset).toBe("10");
  });

  test("subcommand with -- separator", () => {
    const result = parseArgs(argv("playlist", "add", "abc123", "--", "--not-a-flag"));
    expect(result.command).toBe("playlist add");
    expect(result.args.positional).toEqual(["abc123", "--not-a-flag"]);
  });

  test("subcommand with repeated flags", () => {
    const result = parseArgs(argv("playlist", "remove", "abc123", "--match", "foo", "--match", "bar"));
    expect(result.command).toBe("playlist remove");
    expect(result.args.multiFlags.match).toEqual(["foo", "bar"]);
  });
});

// --- help flag ---

describe("--help flag", () => {
  test("--help is captured as a flag for commands", () => {
    const result = parseArgs(argv("playlist", "--help"));
    expect(result.command).toBe("playlist");
    expect(result.args.flags.help).toBe("");
  });

  test("--help is captured as a flag for subcommands", () => {
    const result = parseArgs(argv("playlist", "create", "--help"));
    expect(result.command).toBe("playlist create");
    expect(result.args.flags.help).toBe("");
  });
});

// --- error cases ---

describe("--version flag", () => {
  test("--version is parsed as a command", () => {
    const result = parseArgs(argv("--version"));
    expect(result.command).toBe("--version");
  });

  test("-V is parsed as a command", () => {
    const result = parseArgs(argv("-V"));
    expect(result.command).toBe("-V");
  });

  test("--version outputs version JSON", async () => {
    const proc = Bun.spawn(["bun", "run", "src/cli.ts", "--version"], {
      stdout: "pipe",
      stderr: "pipe",
    });
    const text = await new Response(proc.stdout).text();
    const result = JSON.parse(text);
    expect(result).toEqual({ version: VERSION });
  });

  test("-V outputs version JSON", async () => {
    const proc = Bun.spawn(["bun", "run", "src/cli.ts", "-V"], {
      stdout: "pipe",
      stderr: "pipe",
    });
    const text = await new Response(proc.stdout).text();
    const result = JSON.parse(text);
    expect(result).toEqual({ version: VERSION });
  });
});

describe("parseArgs errors", () => {
  test("throws on empty argv", () => {
    expect(() => parseArgs(argv())).toThrow(/No command provided/);
  });
});

// --- original multiFlags tests ---

describe("parseArgs multiFlags", () => {
  test("single flag does not appear in multiFlags", () => {
    const result = parseArgs(argv("cmd", "--match", "foo"));
    expect(result.args.flags.match).toBe("foo");
    expect(result.args.multiFlags.match).toBeUndefined();
  });

  test("repeated flags collected in multiFlags", () => {
    const result = parseArgs(argv("cmd", "--match", "foo", "--match", "bar"));
    expect(result.args.flags.match).toBe("bar");
    expect(result.args.multiFlags.match).toEqual(["foo", "bar"]);
  });

  test("three repeated flags all collected", () => {
    const result = parseArgs(argv("cmd", "--match", "a", "--match", "b", "--match", "c"));
    expect(result.args.multiFlags.match).toEqual(["a", "b", "c"]);
  });

  test("different flags tracked independently", () => {
    const result = parseArgs(argv("cmd", "--match", "foo", "--index", "1", "--match", "bar"));
    expect(result.args.multiFlags.match).toEqual(["foo", "bar"]);
    expect(result.args.multiFlags.index).toBeUndefined();
    expect(result.args.flags.index).toBe("1");
  });

  test("repeated flags with = syntax", () => {
    const result = parseArgs(argv("cmd", "--match=foo", "--match=bar"));
    expect(result.args.multiFlags.match).toEqual(["foo", "bar"]);
  });

  test("positional args still work alongside repeated flags", () => {
    const result = parseArgs(argv("cmd", "pos1", "--match", "foo", "pos2", "--match", "bar"));
    expect(result.args.positional).toEqual(["pos1", "pos2"]);
    expect(result.args.multiFlags.match).toEqual(["foo", "bar"]);
  });
});
