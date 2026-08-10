# Branching model

The repository uses a protected `main` → `develop` → `feature` hierarchy.

```text
main
└── develop
    └── feature/<short-description>
```

## Main

- Contains released, production-ready history.
- Accepts pull requests from `develop` for releases.
- Requires successful CI and CodeQL checks, review, resolved conversations, and a regular merge commit.
- Is the only branch from which version tags may be published.

## Develop

- Integrates the next release.
- Accepts pull requests from `feature/*` branches.
- Requires successful CI, review, resolved conversations, and a regular merge commit.
- Must be updated from `main` after every release.

## Feature branches

- Start from current `develop`.
- Use `feature/<short-description>`, including release-preparation work such as `feature/release-v1.1.0`.
- Stay short-lived and focused.
- Are deleted after merge.

Squash and rebase merges are disabled repository-wide. The branch policy permits `main` → `develop` only for the automated post-release synchronization pull request; `develop` is never deleted.

Repository administrators should apply the recommended rules in [docs/github-settings.md](github-settings.md) after a remote is created.
