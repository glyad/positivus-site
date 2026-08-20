# Architecture

## Runtime

Positivus is a static site. The browser receives generated HTML documents, generated landing/authentication and Blog stylesheets, vanilla JavaScript modules, same-origin JSON search indexes, and local assets. There are no client-side package dependencies, backend services, cookies, third-party runtime APIs, or browser-to-CMS calls.

## Source and build flow

```text
sources/index.html ──────────────┐
sources/auth-template.html ──────┤
sources/js/auth-content.mjs ─────┤
sources/content/site-search.json ┤
sources/content/blog/*.json ─────┼─ local-json-adapter ─ schema/model ─┐
sources/scss/{main,blog}.scss ───┤                                      ├─ scripts/build.mjs ─ dist/
sources/js/ ─────────────────────┤                                      │
sources/assets/ ─────────────────┘                         routes/pages/discovery ─┘
```

The stylesheets are CSS-compatible SCSS. The build adds generated-file banners and copies them to `dist/css/main.css` and `dist/css/blog.css`. It copies the landing page, JavaScript, and assets without transformation, then renders authentication routes from the shared template and Blog routes from the normalized content model. `dist/manifest.json` records the package version, every generated page, and discovery artifacts for package and release inspection.

## Blog content adapter and validation boundary

`scripts/blog/local-json-adapter.mjs` is the replaceable provider boundary. It reads the repository fixtures under `sources/content/blog/` and returns one raw object containing settings, categories, tags, authors, series, and articles. A future CMS adapter must return that same shape; vendor SDK objects and provider-specific identifiers stop at this boundary.

`scripts/blog/schema.mjs` clones, normalizes, and validates the raw object before rendering. It enforces stable IDs, localized slugs and required fields, content states and dates, category/tag/author/series relationships, author expertise, block types, safe links, hero accessibility fields, and archived-content resolution. Errors are collected and reported together by record, locale, and field. `npm run content:check` and the build both fail closed: invalid content produces no deployable replacement.

Published records available at build time flow into `scripts/blog/render-site.mjs`; draft, scheduled, preview, withdrawn, and archived states follow their explicit route and indexing policies. English and Hebrew share stable CMS identities while keeping independent localized paths and availability. The renderer generates Blog home, browse and pagination, categories, tags and tag index, series, author directory and profiles, articles, recovery pages, and explicit missing-translation pages.

## Discovery and search artifacts

`scripts/blog/discovery.mjs` emits two intentionally distinct search products per locale:

- `search-index-en.json` and `search-index-he.json` power the shared site-wide search across landing/authored site documents and published Blog content.
- `blog/search-index-en.json` and `blog/search-index-he.json` power Blog-only query, filters, sort, and result counts.

The same normalized model produces locale-aware Blog RSS feeds, category feeds, author feeds, English/Hebrew sitemaps, canonical and alternate metadata, structured data, redirects, related-content inputs, reading time, and derived counts. Search indexes and feeds contain public, published content only.

## CMS publishing workflow

The repository fixtures are the current CMS-neutral mock source. A production integration changes the adapter import in `scripts/build.mjs`, supplies provider credentials only to the protected build environment, and returns the existing raw contract. A CMS publish/unpublish webhook is the integration point that triggers the GitHub build-and-deploy workflow. Validation, relationship, route, or rendering failures stop the workflow and preserve the previous successful static deployment. The browser never receives CMS credentials, provider SDKs, draft payloads, or a CMS endpoint.

## Internationalization

English strings remain in the authored HTML. `sources/js/main.js` contains the Hebrew translation dictionary and updates visible, dynamic, validation, status, metadata, and accessible text. The language switch changes `lang` and `dir` on the root element and saves the chosen locale in browser storage.

Authentication copy and route definitions live in `sources/js/auth-content.mjs`. `sources/js/auth.js` applies the selected language, fake-auth transitions, validation, and accessible status updates consistently across all authentication pages. Only the locale preference is stored; entered names, email addresses, passwords, and verification codes are never persisted.

Blog localization is resolved during the build from `sources/content/blog/`. Each generated page receives a fixed `lang`, `dir`, localized route, localized accessible copy, and a peer-language link when that translation exists. Missing translations render an announced recovery page rather than silently falling back to the wrong language.

Layout uses logical CSS properties where possible. Directional controls and the asymmetric contact decoration have explicit RTL transforms; brand and hero artwork retain their intended orientation.

## Blog prototype privacy boundary

Newsletter, consultation, and comment demonstrations are intentionally local UI states. Newsletter and consultation handlers prevent transport and announce that nothing is sent. The signed-in comment preview is selected only by the `commenter=demo` query parameter; submitted comments live in an in-memory array for the current document session, are removed by reload/navigation, do not mutate the URL, and are never written to cookies or browser storage. No comment endpoint or durable comment service exists. Production identity, moderation, persistence, consent, abuse controls, and retention are outside this prototype boundary.

## Tooling boundaries

- `scripts/build.mjs` creates deterministic deployable output.
- `scripts/blog/local-json-adapter.mjs` supplies the CMS-neutral raw content contract.
- `scripts/blog/schema.mjs` validates and normalizes content before any route is emitted.
- `scripts/blog/render-site.mjs` and `scripts/blog/discovery.mjs` generate localized pages, search indexes, feeds, sitemaps, redirects, and metadata.
- `scripts/dev.mjs` rebuilds on authored-source changes and serves `dist/`.
- `scripts/validate-content.mjs` exposes the same Blog validation boundary through `npm run content:check`.
- `scripts/validate.mjs` checks syntax, references, design guards, repository metadata, and external runtime dependencies.
- `scripts/package.mjs` creates the npm-compatible release archive and SHA-256 checksum.
- `scripts/release-guard.mjs` validates branch, worktree, version, lockfile, changelog, and tag state.
- GitHub Actions call the same npm scripts used locally.
