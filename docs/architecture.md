# Architecture

## Runtime

Positivus is a static site. The browser receives one HTML document, one generated CSS file, one vanilla JavaScript file, and local assets. There are no client-side package dependencies, backend services, cookies, or network API calls.

## Source and build flow

```text
sources/index.html ──────────────┐
sources/scss/main.scss ──────────┼─ scripts/build.mjs ─ dist/
sources/js/main.js ──────────────┤
sources/assets/ ─────────────────┘
```

The stylesheet is CSS-compatible SCSS. The build adds a generated-file banner and copies it to `dist/css/main.css`. JavaScript, HTML, and assets are copied without transformation. `dist/manifest.json` records the package version for package and release inspection.

## Internationalization

English strings remain in the authored HTML. `sources/js/main.js` contains the Hebrew translation dictionary and updates visible, dynamic, validation, status, metadata, and accessible text. The language switch changes `lang` and `dir` on the root element and saves the chosen locale in browser storage.

Layout uses logical CSS properties where possible. Directional controls and the asymmetric contact decoration have explicit RTL transforms; brand and hero artwork retain their intended orientation.

## Tooling boundaries

- `scripts/build.mjs` creates deterministic deployable output.
- `scripts/dev.mjs` rebuilds on authored-source changes and serves `dist/`.
- `scripts/validate.mjs` checks syntax, references, design guards, repository metadata, and external runtime dependencies.
- `scripts/package.mjs` creates the npm-compatible release archive and SHA-256 checksum.
- `scripts/release-guard.mjs` validates branch, worktree, version, lockfile, changelog, and tag state.
- GitHub Actions call the same npm scripts used locally.
