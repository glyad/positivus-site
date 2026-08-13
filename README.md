# Positivus static landing page

A dependency-free HTML, SCSS/CSS, and vanilla JavaScript recreation of Olga Averchenko's [Positivus Landing Page Design](https://www.figma.com/community/file/1230604708032389430/positivus-landing-page-design).

The site supports English LTR and automatically translated Hebrew RTL layouts. It includes responsive navigation, service cards, an accordion, team reveal, testimonial carousel, validated contact and newsletter forms, persistent language selection, and a complete prototype authentication journey with no real accounts or stored personal data.

## Requirements

- Node.js 20 or newer; Node.js 22 is the repository default.
- npm 10 or newer.
- Python 3 with Pillow only when regenerating the optional visual-QA comparison images.

No frontend or runtime packages are required.

## Get started

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:4173/`. The development command builds the site into `dist/`, starts the local server, and rebuilds when files under `sources/` change.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Build, serve, and watch the authored sources. |
| `npm run build` | Create the deployable `dist/` directory. |
| `npm run serve` | Serve an existing `dist/` build. |
| `npm run preview` | Build once and serve without watching. |
| `npm run format:check` | Check line endings, final newlines, and trailing whitespace. |
| `npm run lint` | Validate JavaScript syntax, local references, source guards, and repository files. |
| `npm test` | Run the Node test suite. |
| `npm run check` | Run all required pull-request checks and build the site. |
| `npm run package` | Build a release tarball and SHA-256 checksum in `artifacts/`. |
| `npm run release:dry-run` | Run release checks from a non-main preparation branch without creating a tag. |
| `npm run release:guard` | Enforce clean, synchronized release metadata on `main`. |
| `npm run release:merge-guard` | Verify that a release commit is a regular two-parent merge. |
| `npm run release:plan` | Verify that the prepared package version increments the latest release tag. |
| `npm run qa:visual` | Regenerate visual comparison images when Pillow is installed. |
| `npm run qa:auth-visual` | Regenerate the authentication visual comparison boards. |

## Repository structure

```text
sources/              Authored HTML, SCSS, JavaScript, fonts, icons, and imagery
scripts/              Build, preview, validation, package, and release tooling
tests/                Node test-runner coverage for the repository toolchain
docs/                 Design system, visual QA evidence, and process documentation
.github/              CI, CodeQL, release automation, templates, and Dependabot
dist/                 Generated deployable site; ignored by Git
artifacts/            Generated release archives and checksums; ignored by Git
AGENTS.md              Codex repository guidance
```

`sources/scss/main.scss` is deliberately CSS-compatible. The zero-dependency build copies it deterministically to `dist/css/main.css`, avoiding a Sass runtime while keeping a familiar source layout.

## Branching and releases

The repository uses a protected three-level flow:

```text
main ← develop ← feature/<short-description>
```

Feature pull requests target `develop`. Release pull requests promote `develop` to `main`, and every pull request uses a regular merge commit—squash and rebase are disabled. A successful release merge verifies the prepared version increment, creates its annotated tag, runs all checks, packages the static build, writes a checksum, creates the GitHub Release, and opens an auto-merged synchronization pull request from `main` back to `develop`.

See [CONTRIBUTING.md](CONTRIBUTING.md), [RELEASING.md](RELEASING.md), and [docs/branching.md](docs/branching.md) for the complete process.

## Design documentation

- [Product roadmap](docs/ROADMAP.md)
- [Extracted UX/UI design system](docs/design-system.md)
- [Authentication UX/UI specification](docs/authentication.md)
- [Implementation architecture](docs/architecture.md)
- [Latest visual QA report](docs/design-qa.md)

## Attribution and license

The repository code is available under the [MIT License](LICENSE). The original design, brand artwork, image assets, and font retain their respective ownership and licenses; see [ATTRIBUTION.md](ATTRIBUTION.md) for details.
