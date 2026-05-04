# Changelog

All notable changes to this project will be documented in this file.

## [0.4.0] - 2026-05-03

### Added
- `playlist rename <id> <new_name>` — focused command for changing a playlist's name.
- `playlist update <id>` — update one or more details of a playlist via flags: `--name`, `--description` (pass `""` to clear), `--public`/`--private`, and `--collaborative`/`--no-collaborative`. At least one field flag is required; mutually-exclusive flag pairs error when both are given.

## [0.3.0] - 2026-03-20

### Added
- **`--text` flag** — pass `--text` to any command for human-readable plaintext output instead of JSON. Each command has a dedicated text formatter for polished output; a generic fallback handles any without one.
- Text formatters for all 35+ commands covering player, search, albums, tracks, playlists, user, and auth domains.
- Error output in text mode includes the error code: `Error: <message> [CODE]`.

### Fixed
- `--text` flag respects the `--` separator — literal `--text` positional args after `--` are no longer stripped.
- `--text=value` syntax is now recognized (previously silently ignored).

### Changed
- `textFormat` is now a required field on `CommandDef`, so new commands cannot be added without a text formatter.

## [0.2.1] - 2026-03-18

### Fixed
- Detail commands (`track`, `album`, `playlist`, `album tracks`, `playlist tracks`, `track features`) now accept full Spotify URIs — previously only bare IDs worked, and URIs caused a 400 error.
- `queue add` validates malformed `spotify:` URIs client-side instead of leaking API 400/500 errors.
- Flag parser correctly handles negative numbers with space syntax (e.g. `--limit -5` now errors instead of silently corrupting the query).
- `shuffle`, `repeat`, and `top` commands use `INVALID_ARGUMENT` error code when a value is provided but not valid (was `MISSING_ARGUMENT`).
- Unknown subcommands (e.g. `auth blah`) now return an error instead of silently showing subcommand help with exit 0.
- `--help` after the `--` separator is treated as a literal positional argument, not a help trigger.

## [0.2.0] - 2026-03-18

### Added
- **Search-then-act** — mutation commands (`track save`, `queue add`, `follow`, `playlist add`, etc.) now accept human-readable names in place of Spotify IDs. The CLI searches for the top match and acts on it, showing what was matched in the `searched` field.
- **Enriched output** — Spotify's mutation APIs return only opaque IDs. The CLI now resolves them to human/agent-readable metadata (track name, artist, album) in a new `items` field, while preserving the `ids` field for backward compatibility.
- **Metadata cache** — resolved metadata is cached to `~/.spotify-cli/cache.json` (LRU, max 500 entries) so repeated invocations skip extra API calls.
- Input identification heuristic: Spotify URIs and 22-char base-62 IDs are used directly; anything else triggers a search. Malformed `spotify:` URIs are rejected with an error.

### Changed
- Replaced batch API endpoints (`GET /tracks?ids=`, etc.) with individual fetches. Spotify removed batch endpoints for apps in development mode as of February 2026.

## [0.1.2] - 2026-03-18

### Fixed
- Auto-convert bare track IDs to `spotify:track:` URIs in `playlist add`, `playlist remove`, and `queue add`
- `playlist create` no longer sends empty string as description when `--description` is omitted
- Reject negative `--limit` and `--offset` values with proper error
- Volume and seek validation errors now use `INVALID_ARGUMENT` error code
- Invalid search `--type` values caught client-side with clear error message

### Added
- `--version` / `-V` flag outputs CLI version
- `play` command accepts positional URI argument (`spotify play spotify:track:X`)

## [0.1.1] - 2026-03-17

### Changed
- Replace hyphenated commands with subcommand style (e.g. `playlist add` instead of `playlist-add`)
- Add `--help` flag support for all commands

### Fixed
- Fix test failures on Linux by replacing `mock.module` with dependency injection
- Fix biome lint formatting in command registry
- CI compatibility with Node.js 24 GitHub Actions runners

### Added
- `/release` command for automated version bumps
- macOS quarantine (`xattr`) instructions in docs
- Logo, favicon, and OG social sharing image
- Platform icons on releases page
- Docs site live at https://spotify-cli.zach.dev

## [0.1.0] - 2026-03-15

### Added
- Initial release
- 40+ commands for playback, search, library, playlists, albums, and user profile
- OAuth 2.0 PKCE authentication (no client secret needed)
- Automatic token refresh
- JSON output to stdout, structured errors to stderr
- Cross-platform binaries (macOS arm64/x64, Linux x64/arm64, Windows x64)
- VitePress documentation site
- CI/CD with GitHub Actions (lint, typecheck, test, release, docs)
