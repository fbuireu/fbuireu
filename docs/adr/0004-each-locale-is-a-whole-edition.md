# 4. Each locale is a whole Edition, not a generated translation

Date: 2026-07-31

## Status

Accepted.

## Context

The Profile README exists in four languages. GitHub renders exactly one of them, [`README.md`](../../README.md), so the other three are a courtesy to readers who follow the Language Table, not a requirement of the platform.

The tidy option is one source document plus a translation table, rendered into four files by a build step. It costs this repository something it currently does not spend: a toolchain. There is no `package.json` here, no dependency to install, nothing to run locally: the repository is markdown, images and YAML, and every generator is a third-party action. A renderer would make the four Editions consistent by construction and make the repository something you have to build.

## Decision

Each Edition is a complete, hand-written document carrying its own Generated Regions. Automation fans out over the four files rather than over one source:

- [`wakatime-stats.yml`](../../.github/workflows/wakatime-stats.yml) runs a matrix over `README.md`, [`README.ca.md`](../../README.ca.md), [`README.es.md`](../../README.es.md), [`README.it.md`](../../README.it.md), with `max-parallel: 1` so four Automated Updates do not race each other onto `main`.
- [`github-activity.yml`](../../.github/workflows/github-activity.yml) invokes the same action four times, once per config under [`.github/config/github-activity/`](../../.github/config/github-activity). Those configs are also where the per-locale wording of activity lines lives, and [`en.config.yml`](../../.github/config/github-activity/en.config.yml) carries no `messages:` block because English is the action's default.

## Consequences

- **An Authored Region edited in one Edition is wrong in the other three** until someone copies it across, and nothing detects the drift. This is the whole cost of the decision, and it is paid on every content edit, not on every Refresh.
- **Adding a fifth language is five edits**, none of them optional: a new `README.xx.md`, a new activity config, a new entry in the WakaTime matrix, a new row in the Language Table (in all five Editions), and a flag under [`assets/images/png/flags/`](../../assets/images/png/flags).
- **The Generated Regions must exist in every Edition with identical markers**, because the workflows address them by marker, not by position. An Edition missing `<!--RECENT_ACTIVITY:start-->` is skipped in silence.
