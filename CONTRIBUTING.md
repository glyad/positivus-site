# Contributing

## Development setup

1. Install the Node.js version in `.nvmrc`.
2. Run `npm ci`.
3. Create a branch from `develop` using `feature/<short-description>`.
4. Run `npm run dev` while editing files under `sources/`.

Do not edit `dist/` or `artifacts/`; both are generated and ignored.

## Pull requests

- Feature and fix pull requests target `develop`.
- Pull requests are merged with regular merge commits, never squash or rebase.
- Keep one focused change per pull request.
- Use a clear Conventional Commit-style title when practical.
- Update tests and documentation with behavior or tooling changes.
- Update `CHANGELOG.md` for user-visible changes.
- Run `npm run check` before requesting review.
- Verify English LTR and Hebrew RTL behavior for layout or copy changes.

The pull-request template records the required checks and release impact.

## Commit subjects

Preferred prefixes are `feat:`, `fix:`, `docs:`, `test:`, `build:`, `ci:`, `chore:`, and `release:`. Keep the subject imperative and concise.

## Releases

Release pull requests promote `develop` into `main` with a regular merge commit. The successful merge triggers the guarded tag, artifact, GitHub Release, and `main` → `develop` synchronization automation. Do not tag feature or develop commits. Follow [RELEASING.md](RELEASING.md) for the complete process.
