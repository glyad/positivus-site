## Summary

Describe the user-visible or repository change.

## Target branch

- [ ] This feature or fix targets `develop` from `feature/<short-description>`.
- [ ] This release promotion targets `main` from `develop`.
- [ ] This pull request will use a regular merge commit, never squash or rebase.

## Validation

- [ ] `npm run check`
- [ ] English LTR checked when UI or copy changed.
- [ ] Hebrew RTL checked when UI or copy changed.
- [ ] `CHANGELOG.md` updated when the change is user-visible.
- [ ] Release version is greater than the latest `v*` tag when targeting `main`.
- [ ] No generated `dist/` or `artifacts/` files are committed.

## Screenshots or evidence

Add visual or command evidence when relevant.

## Release impact

- [ ] No release impact
- [ ] Patch
- [ ] Minor
- [ ] Major
