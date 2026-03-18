# Changelog

All notable changes to this project will be documented in this file.

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
