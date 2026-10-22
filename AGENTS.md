# AGENTS.md

Agent-facing guide for **fbuireu/fbuireu**: the Owner's GitHub profile README and the automation that keeps it current. See [GLOSSARY.md](./GLOSSARY.md) for the domain glossary (Edition, Generated Region, Artefact, Embed, Refresh, Automated Update…); do not duplicate it here. [ARCHITECTURE.md](./ARCHITECTURE.md) is the big picture: where each section of an Edition comes from, how each weekly Refresh runs and fails and how to undo one, how the Editions are kept, and the checks and the ADR index.

Reviewing a diff: [CODING_STANDARDS.md](./CODING_STANDARDS.md).

## What this is

A profile repository, not an application. There is no `package.json`, no dependency to install and nothing to build or run locally; the tree is markdown, images and YAML. Every piece of generated content comes from a third-party GitHub Action running on a weekly schedule, and the only thing this repository writes itself is the composite action that lands their output.

Read that literally before proposing anything: adding a test runner, a linter or a formatter here means introducing a toolchain the repository has never had. [ADR 0004](./docs/adr/0004-each-locale-is-a-whole-edition.md) is the decision that keeps it that way, and the cost it accepts.

## Surfaces

The Editions, each a whole document ([ADR 0004](./docs/adr/0004-each-locale-is-a-whole-edition.md)):

| File | Locale | Rendered by GitHub on the profile |
| --- | --- | --- |
| [`README.md`](./README.md) | English (Canonical) | yes |
| [`README.ca.md`](./README.ca.md) | Catalan | no |
| [`README.es.md`](./README.es.md) | Spanish | no |
| [`README.it.md`](./README.it.md) | Italian | no |

Each carries the same Generated Region, addressed by marker rather than by position. The marker spelling belongs to the tool that writes it, so do not "normalise" it:

| Region | Markers | Written by |
| --- | --- | --- |
| Recent activity | `<!--RECENT_ACTIVITY:start-->` … `<!--RECENT_ACTIVITY:end-->` | [`github-activity.yml`](./.github/workflows/github-activity.yml) |

Everything else in an Edition is an Authored Region and is expected to survive a Refresh byte-identical. Most of what looks generated in an Edition is not: the shields.io badges, the stats cards, the streak, the activity graph and the Spotify strip are Embeds, resolved live from somebody else's server when a reader opens the profile. Nothing here fetches or stores them, and nothing here notices when one dies.

## Refreshes

Every content workflow shares one cron, `0 0 * * 0` (Sunday 00:00 UTC), and every one of them accepts `workflow_dispatch`. GitHub starts them hours late, one after another; the observed start times, each Refresh's flow, its commit identity, what it does when it fails and how to undo one are in [ARCHITECTURE.md](./ARCHITECTURE.md) §2.

| Workflow | Writes | Lands on |
| --- | --- | --- |
| [`github-activity.yml`](./.github/workflows/github-activity.yml) | the activity region in every Edition | `main`, pushed directly by the action as `readme-bot`, one commit per Edition |
| [`wakatime-stats.yml`](./.github/workflows/wakatime-stats.yml) | [`assets/images/svg/wakatime.svg`](./assets/images/svg/wakatime.svg), the WakaTime plugin of `gh-metrics/metrics` rendered on its own | `main`, one Automated Update |
| [`snake-animation.yml`](./.github/workflows/snake-animation.yml) | [`dist/github-contribution-grid-snake.svg`](./dist/github-contribution-grid-snake.svg) and `-dark.svg` | `main`, one Automated Update |
| [`global-metrics.yml`](./.github/workflows/global-metrics.yml) | [`assets/images/svg/github-metrics.svg`](./assets/images/svg/github-metrics.svg) | `main`, its own PR, force-merged by a step of its own, the exception in [ADR 0001](./docs/adr/0001-automated-updates-land-through-a-self-merging-pull-request.md) |
| [`github-stars-tracker.yml`](./.github/workflows/github-stars-tracker.yml) | star data, charts, badge | `star-tracker-data` branch, plus an email when the count moved |
| [`follower-notifier.yml`](./.github/workflows/follower-notifier.yml) | nothing | email only |

The maintenance workflows run on events rather than the clock: [`dependabot-auto-merge.yml`](./.github/workflows/dependabot-auto-merge.yml) merges the security half of the Bot Updates (Renovate merges its own through the platform once the checks pass, since the `main` ruleset requires no approval), [`commit-message.yml`](./.github/workflows/commit-message.yml) lints the pull request title against conventional commits with a pinned action rather than a toolchain this repository does not have, [`dependency-review.yml`](./.github/workflows/dependency-review.yml) runs on every pull request, and [`zizmor.yml`](./.github/workflows/zizmor.yml) audits the workflows themselves ([ADR 0003](./docs/adr/0003-third-party-actions-are-pinned-to-commit-shas.md)). The `main` ruleset requires `Lint the pull request title`, `Dependency Review` and `zizmor`, the code-scanning check the zizmor action publishes, and gates only Bot Updates, since a Refresh force-merges past it ([ADR 0001](./docs/adr/0001-automated-updates-land-through-a-self-merging-pull-request.md)). The snake and WakaTime Refreshes title their pull requests conventionally for the same reason: they are opened with the Owner Token, so the workflows do run on them.

[`.github/actions/create-auto-merge-pr`](./.github/actions/create-auto-merge-pr) is the only first-party automation in the repository. Two Refreshes call it, [`snake-animation.yml`](./.github/workflows/snake-animation.yml) and [`wakatime-stats.yml`](./.github/workflows/wakatime-stats.yml), as `uses: $/.github/actions/create-auto-merge-pr` and passing `force-merge: 'true'`; `Platane/snk`, and the metrics action under `output_action: none`, write their files and commit nothing, so there is something for the composite to propose. Its inputs, outputs and steps are in [ARCHITECTURE.md](./ARCHITECTURE.md) §4. Read [ADR 0001](./docs/adr/0001-automated-updates-land-through-a-self-merging-pull-request.md) before changing anything in it, and the Gotchas bullet below for the Refresh that commits for itself and so gives it nothing.

## Branches

| Branch | Holds | Written by |
| --- | --- | --- |
| `main` | the Editions, `assets/`, `dist/`, the workflows | Refreshes, via direct pushes and Automated Updates ([ARCHITECTURE.md](./ARCHITECTURE.md) §2) |
| `star-tracker-data` | `stars-data.json`/`.csv`, `stargazers.json`, `charts/*.svg`, `stars-badge.svg` and a `README.md` report; each run deletes the charts it no longer draws | `fbuireu/github-star-tracker` |
| `development` | nothing of its own: it has no commit `main` lacks, and its newest commit is from 2026-09-13 | nothing in this tree; no workflow triggers on it or writes to it. It is kept on the Owner's decision |

Those are the long-lived ones. Three kinds of branch exist only while a Refresh runs: `snake-animation-update-<run_number>` and `wakatime-update-<run_number>`, each deleted when its Automated Update merges, and `metrics-run-<run_id>`, deleted by the metrics Force Merge or, when a run fails or is cancelled, by its cleanup step. A `metrics-run-*` branch with no pull request on it is a leftover; the cleanup step deletes every such branch, but it runs only when a metrics run fails or is cancelled, so a leftover stays until the next one that does, or until someone deletes it. `snk` can write its output to a branch of its own, and [`snake-animation.yml`](./.github/workflows/snake-animation.yml) does not: it writes both SVGs into `dist/` and lands them on `main` like any other Refresh, which is where the Editions quote them from.

## Secrets and variables

The Owner Token is `secrets.PAT`; which steps get it and which get `GITHUB_TOKEN` is [ADR 0002](./docs/adr/0002-workflows-act-as-the-owner.md), and the distinction is not stylistic. Every other secret is an Integration Token, handed to one tool for one service. Three of the secrets are GitHub personal access tokens, and only `PAT` is the Owner Token.

| Secret | Used by | Service | GitHub PAT | Stored as | When it stops working |
| --- | --- | --- | --- | --- | --- |
| `PAT` | the checkouts of `github-activity.yml`, `snake-animation.yml` and `wakatime-stats.yml`; the composite action in `snake-animation.yml` and `wakatime-stats.yml`; *Force merge metrics pull request* in `global-metrics.yml`; the tracker in `github-stars-tracker.yml`; *Approve and auto-merge* in `dependabot-auto-merge.yml` | GitHub, as the Owner; needs the admin role for `--admin` merges and the ruleset bypass the direct pushes rely on | yes, the Owner Token | an Actions secret **and** a Dependabot secret, with the same value: a run a Dependabot pull request starts reads only the latter | every Refresh but the follower notifier fails: activity, snake and WakaTime at the checkout, metrics at its Force Merge (the cleanup closes the pull request), the star tracker at once; Dependabot security updates stay open with a red approve step |
| `METRICS_TOKEN` | `token` of the metrics action in `global-metrics.yml` | GitHub, read by `gh-metrics/metrics` | yes | an Actions secret | the metrics run fails and the cleanup removes what it opened; the SVG on `main` stays last week's |
| `FOLLOWERS_NOTIFIER_TOKEN` | `myToken` of `follower-change` in `follower-notifier.yml` | GitHub: the followers of the account it belongs to, so it must be the Owner's | yes | an Actions secret | the run fails and no email goes out |
| `WAKATIME_TOKEN` | `plugin_wakatime_token` in `wakatime-stats.yml` and in `global-metrics.yml` | WakaTime | no | an Actions secret | `wakatime-stats.yml` fails at its metrics step and proposes nothing, so the card on `main` stays last week's; the metrics SVG's WakaTime section turns into an error panel with the run green |
| `PAGESPEED_TOKEN` | `plugin_pagespeed_token` in `global-metrics.yml` | Google PageSpeed Insights | no | an Actions secret | an error panel in that section of the metrics SVG, run green |
| `GOOGLE_MAPS_TOKEN` | `plugin_stargazers_worldmap_token` in `global-metrics.yml` | Google Maps | no | an Actions secret | an error panel in the stargazers world map, run green |
| `STEAM_TOKEN` | `plugin_steam_token` in `global-metrics.yml` | Steam Web API | no | an Actions secret | an error panel in the Steam section, run green |
| `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN` | `plugin_music_token` in `global-metrics.yml` | Spotify | no | Actions secrets | an error panel in the music section, run green |
| `MAIL_PASSWORD` | *Send email report* in `github-stars-tracker.yml`, *Email me* in `follower-notifier.yml` | the SMTP server in `vars.SMTP_SERVER` | no | an Actions secret | both runs fail at the email step, after the star data is pushed and the follower snapshot replaced, so that week's report and follower change are never mailed |

Rotating `PAT` means creating the new token on the Owner's account and updating it in both stores, Actions and Dependabot, before revoking the old one. Nothing watches any of these for expiry; the symptoms above, the *Debug* badges and GitHub's failure emails are how one shows ([ARCHITECTURE.md](./ARCHITECTURE.md) §2).

**Repository variables** (non-secret, `vars.*`): `SMTP_SERVER`, `SMTP_PORT`, `MAIL_USERNAME`, `PERSONAL_SITE_URL`, `STACKOVERFLOW_ID`, `LEETCODE_USER`, `SPOTIFY_USER`, `STEAM_ID`

## Conventions

- **Conventional commits**, on the pull request title that a squash merge commits, linted by [`commit-message.yml`](./.github/workflows/commit-message.yml). Refreshes use `docs:` for content and asset updates; keep that. Do NOT add a Co-Authored-By / Claude trailer to commits or PRs.
- **A change to one Edition is a change to every Edition.** Anything in an Authored Region (a new link, a reworded line, a row in the Language Table) has to be applied to all of them in the same commit. Nothing checks this.
- **Never hand-edit a Generated Region.** The next Refresh overwrites it, and the edit disappears without a trace.
- **How a workflow is written** (pins, comments, `env:`, concurrency, credentials) is [CODING_STANDARDS.md](./CODING_STANDARDS.md).

## Maintenance contract

These documents are not generated. When you change code, update the docs **in the same commit**: a follow-up commit is a promise, not a fix. Unlike the Owner's other repositories, this one has no test to enforce them, because there is no runtime here to run one in, so the contract is entirely manual.

| If you change | Update |
| --- | --- |
| What a domain word means, or introduce a new one | [`GLOSSARY.md`](./GLOSSARY.md): the glossary, vocabulary only |
| A rule about how code is written: the workflows and the composite action | [`CODING_STANDARDS.md`](./CODING_STANDARDS.md) |
| A workflow's schedule, output, landing route, commit identity or failure behaviour | the *Refreshes* table here, and that workflow's flow in [`ARCHITECTURE.md`](./ARCHITECTURE.md) §2 |
| A marker, or add a Generated Region | the *Surfaces* table here, every Edition, and the section map in [`ARCHITECTURE.md`](./ARCHITECTURE.md) §1 |
| A section of an Edition, or where one comes from | the section map in [`ARCHITECTURE.md`](./ARCHITECTURE.md) §1 |
| The composite action, a required check, or the Bot Update path | [`ARCHITECTURE.md`](./ARCHITECTURE.md) §4 |
| A secret or a repository variable | the *Secrets and variables* table here |
| Add an ADR | its row in the index in [`ARCHITECTURE.md`](./ARCHITECTURE.md) §5 |
| A behaviour a doc states as an invariant or a gotcha | that bullet, or delete it if it stopped being true |
| A decision an ADR records | that ADR: amend it, or supersede it with a new one and say so in both `## Status` blocks |

A new ADR starts as a copy of [ADR 0000](./docs/adr/0000-adr-template.md), the template, which says when a decision earns one and where to link it from.

## Gotchas

- **[`log.js`](./log.js) is not code.** One `console.log` line under a comment saying it exists to keep GitHub's CodeQL language detection happy. Nothing imports it, nothing runs it, and deleting it is the obvious tidy-up, but CodeQL is live on this repository through GitHub's default setup rather than a workflow in the tree, and its `javascript-typescript` analysis reports on every pull request. That is very likely the thing `log.js` is propping up, so leave it: it is cheap to keep and its absence would be silent.
- **Dependabot and Renovate are both wired up, and they are not doing the same job.** Renovate is the way in for version updates: [`renovate.json`](./.github/renovate.json) classifies Bot Updates, pins digests and auto-merges pin/patch/minor. Dependabot is deliberately left with **no `dependabot.yml`**, and that absence is the configuration, because without it GitHub opens Dependabot pull requests for security advisories only, and `dependabot-auto-merge.yml` exists to land those fast. Renovate watches advisories too (`:enableVulnerabilityAlerts`, `osvVulnerabilityAlerts`); the overlap is wanted, since two advisory sources catch more than either alone.

  Ways to break this, both of which look like cleanups: **adding `dependabot.yml`** turns Dependabot into a rival version-update bot and the two *will* collide on the same pins and the same labels; **deleting `dependabot-auto-merge.yml`** leaves security updates sitting open with nothing to merge them.
- **A Force Merge ignores branch protection.** Adding a required check to `main` will not gate the Refreshes; it will only gate Bot Updates ([ADR 0001](./docs/adr/0001-automated-updates-land-through-a-self-merging-pull-request.md)).
- **An Automated Update opened with `GITHUB_TOKEN` triggers no workflows.** GitHub deliberately does not fire `pull_request` events for pull requests its own workflow identity creates, so `zizmor.yml` never runs on a `metrics-run-*` branch and the `zizmor` status check the `main` ruleset requires stays pending on it forever. A Force Merge is therefore not an optimisation here, it is the only way out: waiting waits for something that is never coming. CodeQL still reports on those pull requests because it is GitHub's default setup, not a workflow in this tree.
- **`persist-credentials: true` in `github-activity.yml` is deliberate** and zizmor will flag it. The recent-activity action pushes using the credentials checkout leaves behind ([ADR 0002](./docs/adr/0002-workflows-act-as-the-owner.md)). It is the only checkout in the repository that persists anything: the star tracker, which looks like it would need the same, builds its own `http.extraheader` from the `github-token` input instead.
- **The activity Refresh commits to `main` itself.** `recent-activity` runs `git add / pull / commit / push` at the end of every step and has no input that turns it off, so an Automated Update step after it finds `main` already carrying the change and proposes nothing: do not give it one. ADR 0001's Consequence on generators that commit for themselves has the evidence, from when `waka-readme` did the same in `wakatime-stats.yml`. It reaches `main` past the ruleset only because the Owner Token is an admin's.
- **The WakaTime card replaced `athul/waka-readme` for the information, not the format.** The text region it wrote showed five languages; the card shows the week's total and daily average, and its projects, languages, editors and operating systems. Three settings in `wakatime-stats.yml` look like noise and are not. `token: NOT_NEEDED` keeps every GitHub credential out of the step, so the step must keep `base: ""` and no plugin that reads GitHub, which would get nothing to read with. `plugins_errors_fatal: yes`, the opposite of the metrics Refresh, makes a WakaTime failure fail the run instead of committing an error panel. `use_prebuilt_image: no` is [ADR 0003](./docs/adr/0003-third-party-actions-are-pinned-to-commit-shas.md)'s. Its labels are English in every Edition, since one file serves all four. The one candidate with more to show, `anmol098/waka-readme-stats` (AI coding, all-time totals, translated labels), only ever writes the repository's own `README.md` and runs `docker://wakareadmestats/waka-readme-stats:master`, a tag no SHA pins.
- **The skyline plugin points at [honzaap's GitHub City](https://github.com/honzaap/GithubCity), not at GitHub.** GitHub retired `skyline.github.com` in favour of a CLI that emits an `.stl`, which is no use to a plugin that works by screenshotting a page. It never touched the GitHub API for this: it drives puppeteer over whatever `plugin_skyline_settings.url` says, so repointing it is pure configuration. Two things follow. The `ready` and `hide` selectors are that site's DOM, so a redesign there breaks this and the symptom is a 90-second `TimeoutError` rather than a 404. And `plugin_skyline_year` is deliberately unset: the plugin resolves `${year}` to the runner's current year only while the input is absent, so pinning it freezes the animation on that year.
- **Nothing on the profile shows the star tracker's output.** `github-stars-tracker.yml` writes charts and a badge to `star-tracker-data` and emails the report; no Edition embeds any of it.
- **The star tracker's `exclude-repos` takes bare repository names.** The action matches each entry against the name alone, so an `owner/name` entry excludes nothing, and an entry such as `bw` drops every repository of that name the Owner Token lists, whoever owns it. What it reads before that list applies, collaborator and organisation repositories included, is in [ARCHITECTURE.md](./ARCHITECTURE.md) §2.
- **`{AMOUNT}` is dead in the push message, permanently.** The `PushEvent` payload of `GET /users/{user}/events/public` carries no `size` or `distinct_size`, so `recent-activity` renders the placeholder as the literal string `undefined`. Every activity config therefore states the push message without a count. Restoring `{AMOUNT}` puts `undefined` back on the profile in every language; no version of the action can fix it, because the API does not serve the number.
- **[`.imgbotconfig`](./.imgbotconfig) belongs to Imgbot**, the GitHub App that opens pull requests compressing a repository's images, and tells it to skip every `*.svg`, which covers every SVG Artefact. Whether the app is still installed is not visible from the tree; none of the last hundred pull requests here is Imgbot's.
- **The CV behind *Download my Resume* is a file committed by hand.** [`assets/pdf/Ferran-Buireu-CV.pdf`](./assets/pdf/Ferran-Buireu-CV.pdf) is not an Artefact: no Refresh writes it and nothing compares it with the CV elsewhere, so it changes only when someone commits a new one.
- **The snake is quoted from `dist/` on `main`, not from a branch.** `snake-animation.yml` writes both SVGs there weekly. The dark variant is the `prefers-color-scheme: dark` source; the light variant is both the light source and the `<img>` fallback.
