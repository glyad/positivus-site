# Recommended GitHub settings

These settings cannot be stored completely in Git, so apply them after creating the GitHub repository.

## General

- Set `main` as the default branch.
- Enable Issues, Discussions, private vulnerability reporting, and automatic branch deletion.
- Disable merge commits; allow squash merge and rebase merge.
- Enable automatically suggested PR updates and always suggest updating PR branches.

## Main ruleset

- Target `main`.
- Require a pull request with at least one approval.
- Require conversation resolution and linear history.
- Require status checks: `CI / validate (Node 20)`, `CI / validate (Node 22)`, and `CodeQL / Analyze (javascript-typescript)`.
- Require branches to be up to date before merging.
- Block force pushes and deletions.
- Restrict tag creation matching `v*.*.*` to maintainers or the release role.

## Develop ruleset

- Target `develop`.
- Require a pull request with at least one approval.
- Require conversation resolution, linear history, and the two CI checks.
- Block force pushes and deletions.

## Actions

- Allow GitHub-authored actions used by this repository.
- Set the default workflow token permission to read repository contents.
- Permit write access only for the tagged release workflow through its explicit `contents: write` permission.
