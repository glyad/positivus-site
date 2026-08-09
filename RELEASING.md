# Releasing Positivus

Releases use Semantic Versioning and annotated `vMAJOR.MINOR.PATCH` tags. A tag must point to a commit contained in `main`.

## Prepare on develop

1. Confirm all intended feature pull requests are merged into `develop`.
2. Create a preparation branch from `develop`, for example `feature/release-v1.1.0`.
3. Run the matching version command:
   - `npm run version:patch`
   - `npm run version:minor`
   - `npm run version:major`
4. Move the relevant `CHANGELOG.md` entries from `Unreleased` into a dated section matching the new package version.
5. Run `npm run release:dry-run`.
6. Merge the preparation pull request into `develop`.

## Promote to main

1. Open a release pull request from `develop` to `main`.
2. Require the CI and CodeQL checks and at least one approving review.
3. Merge without changing the prepared version files.
4. Update `develop` from `main` after the release merge if the hosting platform does not do so automatically.

## Tag and publish

From a clean, current `main` checkout:

```sh
npm ci
npm run release:guard
npm run package
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin v1.1.0
```

The release workflow then:

1. Verifies the tag matches `package.json` and `package-lock.json`.
2. Verifies the tagged commit is contained in `origin/main`.
3. Runs formatting, validation, tests, and the build.
4. Creates the versioned static-site `.tar.gz` package and `SHA256SUMS.txt`.
5. Uploads both as workflow artifacts.
6. Creates the GitHub Release with generated release notes and attached artifacts.

If any guard fails, fix the release metadata through a pull request. Do not move or overwrite an existing public release tag.
