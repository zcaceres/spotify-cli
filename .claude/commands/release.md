# Release

Create a new release by bumping the version and pushing to main.

## Steps

1. **Ensure we're on a clean main branch.**
   - Check the current branch with `git branch --show-current`.
   - If on a feature branch:
     - Verify the branch is in good shape: `bun run lint`, `bun run typecheck`, `bun test` must all pass.
     - Check that the branch is pushed and up to date with the remote.
     - Merge the branch to main: `git checkout main && git pull && git merge <branch> --no-edit`.
     - If the merge fails, stop and report the conflict. Do NOT force anything.
   - If already on main, pull latest: `git pull`.
   - Verify the working tree is clean (`git status`). If there are uncommitted changes, stop and ask the user what to do.

2. Ask the user: **major, minor, or patch?**

3. Read the current version from `package.json`.

4. Calculate the new version using semver rules:
   - **patch**: 0.1.0 → 0.1.1
   - **minor**: 0.1.0 → 0.2.0
   - **major**: 0.1.0 → 1.0.0

5. Show the user the version bump (e.g. "0.1.0 → 0.1.1") and the commits since the last tag. Ask for confirmation before proceeding.

6. Update the version in these files:
   - `package.json` → `"version"` field
   - `README.md` → version badge (`https://img.shields.io/badge/version-X.Y.Z-blue`)

7. Update `CHANGELOG.md`:
   - Add a new `## [X.Y.Z] - YYYY-MM-DD` section at the top (below the heading)
   - Categorize commits since the last tag into sections: `### Added`, `### Changed`, `### Fixed`, `### Removed`
   - Write concise, user-facing descriptions (not raw commit messages)
   - Skip docs-only and CI-only changes unless they're significant

8. Run all checks:
   - `bun run lint`
   - `bun run typecheck`
   - `bun test`

   If any check fails, stop and report the error. Do NOT commit.

9. Stage only the changed files, commit with message: `release: vX.Y.Z`

10. Push to main. The Release workflow in `.github/workflows/release.yml` will automatically:
    - Build cross-platform binaries
    - Create a GitHub release with auto-generated notes
    - Upload binaries as release assets

11. Wait for the Release workflow to complete and report the result to the user. Include the release URL.
