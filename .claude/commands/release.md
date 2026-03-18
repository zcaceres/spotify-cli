# Release

Create a new release by bumping the version and pushing to main.

## Steps

1. Ask the user: **major, minor, or patch?**

2. Read the current version from `package.json`.

3. Calculate the new version using semver rules:
   - **patch**: 0.1.0 → 0.1.1
   - **minor**: 0.1.0 → 0.2.0
   - **major**: 0.1.0 → 1.0.0

4. Show the user the version bump (e.g. "0.1.0 → 0.1.1") and the commits since the last tag. Ask for confirmation before proceeding.

5. Update the version in these files:
   - `package.json` → `"version"` field
   - `README.md` → version badge (`https://img.shields.io/badge/version-X.Y.Z-blue`)

6. Run all checks:
   - `bun run lint`
   - `bun run typecheck`
   - `bun test`

   If any check fails, stop and report the error. Do NOT commit.

7. Stage only the changed files, commit with message: `release: vX.Y.Z`

8. Push to main. The Release workflow in `.github/workflows/release.yml` will automatically:
   - Build cross-platform binaries
   - Create a GitHub release with auto-generated notes
   - Upload binaries as release assets

9. Wait for the Release workflow to complete and report the result to the user. Include the release URL.
