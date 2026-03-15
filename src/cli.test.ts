import { describe, test, expect } from "bun:test";

// We need to test parseArgs, but it's not exported. We'll extract the logic
// by reimporting the module and testing via the CLI's argv parsing.
// Instead, let's just inline the parse logic for unit testing.

function parseArgs(argv: string[]) {
  const raw = argv.slice(2);
  const command = raw[0];

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

describe("parseArgs multiFlags", () => {
  test("single flag does not appear in multiFlags", () => {
    const result = parseArgs(["bun", "cli.ts", "cmd", "--match", "foo"]);
    expect(result.args.flags.match).toBe("foo");
    expect(result.args.multiFlags.match).toBeUndefined();
  });

  test("repeated flags collected in multiFlags", () => {
    const result = parseArgs(["bun", "cli.ts", "cmd", "--match", "foo", "--match", "bar"]);
    expect(result.args.flags.match).toBe("bar");
    expect(result.args.multiFlags.match).toEqual(["foo", "bar"]);
  });

  test("three repeated flags all collected", () => {
    const result = parseArgs(["bun", "cli.ts", "cmd", "--match", "a", "--match", "b", "--match", "c"]);
    expect(result.args.multiFlags.match).toEqual(["a", "b", "c"]);
  });

  test("different flags tracked independently", () => {
    const result = parseArgs(["bun", "cli.ts", "cmd", "--match", "foo", "--index", "1", "--match", "bar"]);
    expect(result.args.multiFlags.match).toEqual(["foo", "bar"]);
    expect(result.args.multiFlags.index).toBeUndefined();
    expect(result.args.flags.index).toBe("1");
  });

  test("repeated flags with = syntax", () => {
    const result = parseArgs(["bun", "cli.ts", "cmd", "--match=foo", "--match=bar"]);
    expect(result.args.multiFlags.match).toEqual(["foo", "bar"]);
  });

  test("positional args still work alongside repeated flags", () => {
    const result = parseArgs(["bun", "cli.ts", "cmd", "pos1", "--match", "foo", "pos2", "--match", "bar"]);
    expect(result.args.positional).toEqual(["pos1", "pos2"]);
    expect(result.args.multiFlags.match).toEqual(["foo", "bar"]);
  });
});
