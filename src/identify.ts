/**
 * Input identification heuristic — determines whether user input
 * is a Spotify URI, a bare Spotify ID, or a search query.
 *
 * @module
 */

export type Identified =
  | { kind: "uri"; type: string; id: string; uri: string }
  | { kind: "id"; id: string }
  | { kind: "query"; query: string };

const URI_RE = /^spotify:([a-z]+):([A-Za-z0-9]+)$/;
const ID_RE = /^[A-Za-z0-9]{22}$/;

export function identify(input: string): Identified {
  const uriMatch = URI_RE.exec(input);
  if (uriMatch?.[1] && uriMatch[2]) {
    return { kind: "uri", type: uriMatch[1], id: uriMatch[2], uri: input };
  }

  if (ID_RE.test(input)) {
    return { kind: "id", id: input };
  }

  return { kind: "query", query: input };
}
