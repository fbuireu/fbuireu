# Contributing to fbuireu/fbuireu

A caveat up front: this is one person's GitHub profile, the README rendered
at [github.com/fbuireu](https://github.com/fbuireu) and the automation that
keeps it current. It is personal by definition, so the contributions that fit
are small: a typo, a broken translation, a dead link, a workflow that stopped
working. For anything bigger, open an issue first.

The working rules are [CLAUDE.md](./CLAUDE.md); the vocabulary is
[CONTEXT.md](./CONTEXT.md); the decisions are [docs/adr/](./docs/adr/).

## Code of Conduct

By participating you are expected to uphold the
[Code of Conduct](./CODE_OF_CONDUCT.md).

## The two things to know before editing

1. **The profile exists in four Editions**: `README.md` (English, the one
   GitHub renders), `README.ca.md`, `README.es.md` and `README.it.md`. Each is
   a whole document, deliberately not generated from a shared source. A text
   fix in one Edition almost always needs the same fix in the other three; a
   translation fix needs only its own.

2. **Parts of every Edition are machine-written.** The Generated Regions
   between markers are rewritten on a weekly schedule by GitHub Actions. Do
   not edit inside the markers: your change will be overwritten within a week.
   The marker spelling differs between regions on purpose; do not normalise it.

There is nothing to install and nothing to build: the tree is markdown, images
and YAML, and it stays that way by decision.

## How to contribute

- **A typo or a broken link** → a PR touching every Edition it appears in, or
  an issue if you'd rather not chase all four
- **A translation mistake** → a PR touching that Edition only
- **A workflow that misbehaves** → an issue; the automation runs with secrets,
  so changes to it are reviewed carefully
- **A suspicious link, or anything involving the workflows' security** → the
  [Security Policy](./SECURITY.md), not a public issue

Thanks for contributing! 🎉
