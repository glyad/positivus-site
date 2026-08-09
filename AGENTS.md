# Positivus repository guidance

## Scope

- Treat `sources/` as the authored website source of truth.
- Treat `dist/`, `artifacts/`, and `coverage/` as generated output. Do not edit or commit them.
- Keep the frontend dependency-free unless the user explicitly approves a dependency.
- Preserve English LTR and Hebrew RTL behavior together; changes to layout, copy, forms, or navigation must be checked in both directions.
- Keep source assets external. Do not replace visible artwork with CSS drawings, emoji, text glyphs, or inline SVG approximations.

## Workflow

- Branch from `develop` using `feature/<short-description>`.
- Merge feature branches into `develop` through pull requests.
- Promote `develop` to `main` through a release pull request.
- Create version tags only from commits contained in `main`.
- Use Conventional Commit-style subjects where practical, such as `feat:`, `fix:`, `docs:`, `chore:`, and `release:`.

## Required checks

- Run `npm run check` before committing or opening a pull request.
- Run `npm run release:dry-run` before preparing a release pull request.
- Update `CHANGELOG.md` whenever a user-visible change is prepared for release.
- Keep `package.json`, `package-lock.json`, the changelog version, and the release tag synchronized.

## Key paths

- `sources/index.html`: semantic page markup.
- `sources/scss/main.scss`: single stylesheet source; the build writes `dist/css/main.css`.
- `sources/js/main.js`: dependency-free interactions and translations.
- `sources/assets/`: local fonts, icons, illustrations, portraits, and logos.
- `scripts/`: build, preview, validation, packaging, and release guards.
- `tests/`: Node test-runner coverage for the repository toolchain.
- `docs/`: design system, visual QA evidence, architecture, and release documentation.
