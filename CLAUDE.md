# CLAUDE.md

Agent-facing guide for **fbuireu/fbuireu**: the Owner's GitHub profile README and the automation that keeps it current. See [CONTEXT.md](./CONTEXT.md) for the domain glossary (Edition, Generated Region, Artefact, Embed, Refresh, Automated Update…); do not duplicate it here.

## What this is

A profile repository, not an application. There is no `package.json`, no dependency to install and nothing to build or run locally; the tree is markdown, images and YAML. Every piece of generated content comes from a third-party GitHub Action running on a weekly schedule, and the only thing this repository writes itself is the composite action that lands their output.

Read that literally before proposing anything: adding a test runner, a linter or a formatter here means introducing a toolchain the repository has never had. [ADR 0004](./docs/adr/0004-each-locale-is-a-whole-edition.md) is the decision that keeps it that way, and the cost it accepts.

## Surfaces

Four Editions, each a whole document ([ADR 0004](./docs/adr/0004-each-locale-is-a-whole-edition.md)):

| File | Locale | Rendered by GitHub on the profile |
| --- | --- | --- |
| [`README.md`](./README.md) | English (Canonical) | yes |
| [`README.ca.md`](./README.ca.md) | Catalan | no |
| [`README.es.md`](./README.es.md) | Spanish | no |
| [`README.it.md`](./README.it.md) | Italian | no |

Each carries the same two Generated Regions, addressed by marker rather than by position. The marker spelling belongs to the tool that writes it, which is why the two do not match each other. Do not "normalise" them:

| Region | Markers | Written by |
| --- | --- | --- |
| Recent activity | `<!--RECENT_ACTIVITY:start-->` … `<!--RECENT_ACTIVITY:end-->` | [`github-activity.yml`](./.github/workflows/github-activity.yml) |
| WakaTime weekly | `<!--START_SECTION:waka-->` … `<!--END_SECTION:waka-->` | [`wakatime-stats.yml`](./.github/workflows/wakatime-stats.yml) |

Everything else in an Edition is an Authored Region and is expected to survive a Refresh byte-identical. Most of what looks generated in an Edition is not: the shields.io badges, the stats cards, the streak, the activity graph and the Spotify strip are Embeds, resolved live from somebody else's server when a reader opens the profile. Nothing here fetches or stores them, and nothing here notices when one dies.

## Refreshes

All five content workflows share one cron, `0 0 * * 0` (Sunday 00:00 UTC), and all five accept `workflow_dispatch`.

| Workflow | Writes | Lands on |
| --- | --- | --- |
| `github-activity.yml` | the activity region in all four Editions | `main`, pushed directly by the action, one commit per Edition |
| `wakatime-stats.yml` | the WakaTime region, matrix over the four Editions, `max-parallel: 1` | `main`, pushed directly by the action, one commit per Edition |
| [`snake-animation.yml`](./.github/workflows/snake-animation.yml) | [`dist/github-contribution-grid-snake.svg`](./dist/github-contribution-grid-snake.svg) and `-dark.svg` | `main`, one Automated Update |
| [`global-metrics.yml`](./.github/workflows/global-metrics.yml) | [`assets/images/svg/github-metrics.svg`](./assets/images/svg/github-metrics.svg) | `main`, its own PR, force-merged by a step of its own, the exception in [ADR 0001](./docs/adr/0001-automated-updates-land-through-a-self-merging-pull-request.md) |
| [`github-stars-tracker.yml`](./.github/workflows/github-stars-tracker.yml) | star data, charts, badge | `star-tracker-data` branch, plus an email when the count moved |
| [`follower-notifier.yml`](./.github/workflows/follower-notifier.yml) | nothing | email only |

Four maintenance workflows run on events rather than the clock: [`dependabot-auto-merge.yml`](./.github/workflows/dependabot-auto-merge.yml) merges the security half of the Bot Updates (Renovate merges its own through the platform once the checks pass, since the `main` ruleset requires no approval), [`commit-message.yml`](./.github/workflows/commit-message.yml) lints the pull request title against conventional commits with a pinned action rather than a toolchain this repository does not have, [`dependency-review.yml`](./.github/workflows/dependency-review.yml) runs on every pull request, and [`zizmor.yml`](./.github/workflows/zizmor.yml) audits the workflows themselves ([ADR 0003](./docs/adr/0003-third-party-actions-are-pinned-to-commit-shas.md)). The `main` ruleset requires `Lint the pull request title`, `Dependency Review` and `zizmor`, the code-scanning check the zizmor action publishes, and gates only Bot Updates, since a Refresh force-merges past it ([ADR 0001](./docs/adr/0001-automated-updates-land-through-a-self-merging-pull-request.md)). The snake Refresh titles its pull request conventionally for the same reason: its pull request is opened with the Owner Token, so the workflows do run on it.

[`.github/actions/create-auto-merge-pr`](./.github/actions/create-auto-merge-pr) is the only first-party automation in the repository. One Refresh calls it, [`snake-animation.yml`](./.github/workflows/snake-animation.yml), passing `force-merge: 'true'`; `Platane/snk` writes two files and commits nothing, so there is something for the composite to propose. Read [ADR 0001](./docs/adr/0001-automated-updates-land-through-a-self-merging-pull-request.md) before changing anything in it, and the Gotchas bullet below for the two Refreshes that used to call it and never had anything to give it.

## Branches

| Branch | Holds | Written by |
| --- | --- | --- |
| `main` | the Editions, `assets/`, `dist/`, the workflows | Refreshes, via Automated Updates |
| `star-tracker-data` | `stars-data.json`/`.csv`, `charts/*.svg`, `stars-badge.svg`, a report | `fbuireu/github-star-tracker` |

Those two are the whole list. `snk` can write its output to a branch of its own, the way it did here until 2025-06-26, and [`snake-animation.yml`](./.github/workflows/snake-animation.yml) does not: it writes both SVGs into `dist/` and lands them on `main` like any other Refresh, which is where the Editions quote them from.

## Secrets and variables

The Owner Token is `secrets.PAT`; which steps get it and which get `GITHUB_TOKEN` is [ADR 0002](./docs/adr/0002-workflows-act-as-the-owner.md), and the distinction is not stylistic.

- **Owner Token**: `PAT`
- **Integration Tokens**: `METRICS_TOKEN`, `WAKATIME_TOKEN`, `FOLLOWERS_NOTIFIER_TOKEN`, `PAGESPEED_TOKEN`, `GOOGLE_MAPS_TOKEN`, `STEAM_TOKEN`, `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN`, `MAIL_PASSWORD`
- **Repository variables** (non-secret, `vars.*`): `SMTP_SERVER`, `SMTP_PORT`, `MAIL_USERNAME`, `PERSONAL_SITE_URL`, `STACKOVERFLOW_ID`, `LEETCODE_USER`, `SPOTIFY_USER`, `STEAM_ID`

## Conventions

- **Conventional commits.** Refreshes use `docs:` for content and asset updates; keep that. Do NOT add a Co-Authored-By / Claude trailer to commits or PRs.
- **A change to one Edition is a change to four.** Anything in an Authored Region (a new link, a reworded line, a row in the Language Table) has to be applied to all four files in the same commit. Nothing checks this.
- **Never hand-edit a Generated Region.** The next Refresh overwrites it, and the edit disappears without a trace.
- **No explanatory comments in YAML.** Rationale goes in *Gotchas* below or in the ADR, not above the line; that is the same rule the Owner's other repositories apply to source. The single exception is the trailing comment on a SHA pin, which carries the version and, where the pin is a branch rather than a release, the reason why.
- **Every `uses:` is SHA-pinned with a version comment**, including the first-party composite action's dependencies. Renovate maintains both halves; do not edit the comment by hand ([ADR 0003](./docs/adr/0003-third-party-actions-are-pinned-to-commit-shas.md)).
- **Shell steps read workflow data through `env:`, not through `${{ }}` interpolation** inside the script body. That is a zizmor rule (template injection) and the existing steps all follow it: `STEPS_METADATA_OUTPUTS_UPDATE_TYPE` and friends look verbose for exactly this reason.

## Maintenance contract

These documents are not generated, and this repository has no test to enforce them; unlike the Owner's other repositories, there is no runtime here to run one in. That makes the contract entirely manual: when you change a workflow, update the docs **in the same commit**. A follow-up commit is a promise, not a fix.

| If you change | Update |
| --- | --- |
| What a domain word means, or introduce a new one | [`CONTEXT.md`](./CONTEXT.md): the glossary, vocabulary only |
| A workflow's schedule, output, or landing branch | the *Refreshes* table here |
| A marker, or add a Generated Region | the *Surfaces* table here, and every Edition |
| A secret or a repository variable | the *Secrets and variables* list here |
| A behaviour a doc states as an invariant or a gotcha | that bullet, or delete it if it stopped being true |
| An entry under *Known inconsistencies* | delete it: that is part of the fix, not tidying for later |
| A decision an ADR records | that ADR: amend it, or supersede it with a new one and say so in both `## Status` blocks |

Propose an ADR in [`docs/adr/`](./docs/adr/) when a decision is **hard to reverse**, **surprising without context** and **the result of a real trade-off**. All three, or it is not an ADR. Copy [ADR 0000](./docs/adr/0000-adr-template.md), the template, number it one above the highest existing file (`NNNN-kebab-title.md`, `# N. Title` / `Date:` / `## Status` / `## Context` / `## Decision` / `## Consequences`), then link it from wherever it bites: a Gotchas bullet here, a row in a table above, a `CONTEXT.md` entry. There is no index; an ADR nothing links to will not be read.

## Gotchas

- **[`log.js`](./log.js) is not code.** Two lines of `console.log` whose comment says it exists to keep GitHub's CodeQL language detection happy. Nothing imports it, nothing runs it, and deleting it is the obvious tidy-up, but CodeQL is live on this repository through GitHub's default setup rather than a workflow in the tree, and its `javascript-typescript` analysis reports on every pull request. That is very likely the thing `log.js` is propping up, so leave it: it is cheap to keep and its absence would be silent.
- **Dependabot and Renovate are both wired up, and they are not doing the same job.** Renovate is the way in for version updates: [`renovate.json`](./.github/renovate.json) classifies Bot Updates, pins digests and auto-merges pin/patch/minor. Dependabot is deliberately left with **no `dependabot.yml`**, and that absence is the configuration, because without it GitHub opens Dependabot pull requests for security advisories only, and `dependabot-auto-merge.yml` exists to land those fast. Renovate watches advisories too (`:enableVulnerabilityAlerts`, `osvVulnerabilityAlerts`); the overlap is wanted, since two advisory sources catch more than either alone.

  Two ways to break this, both of which look like cleanups: **adding `dependabot.yml`** turns Dependabot into a second version-update bot and the two *will* collide on the same pins and the same labels; **deleting `dependabot-auto-merge.yml`** leaves security updates sitting open with nothing to merge them.
- **A Force Merge ignores branch protection.** Adding a required check to `main` will not gate the Refreshes; it will only gate Bot Updates ([ADR 0001](./docs/adr/0001-automated-updates-land-through-a-self-merging-pull-request.md)).
- **An Automated Update opened with `GITHUB_TOKEN` triggers no workflows.** GitHub deliberately does not fire `pull_request` events for pull requests its own workflow identity creates, so `zizmor.yml` never runs on a `metrics-run-*` branch and the `zizmor` status check the `main` ruleset requires stays pending on it forever. A Force Merge is therefore not an optimisation here, it is the only way out: waiting waits for something that is never coming. CodeQL still reports on those pull requests because it is GitHub's default setup, not a workflow in this tree.
- **`persist-credentials: true` in `github-activity.yml` is deliberate** and zizmor will flag it. The recent-activity action pushes using the credentials checkout leaves behind ([ADR 0002](./docs/adr/0002-workflows-act-as-the-owner.md)). It is the only checkout in the repository that persists anything; `github-stars-tracker.yml` used to as well, contradicting that ADR, and it never needed to, because the star tracker builds its own `http.extraheader` from the `github-token` input.
- **The two README Refreshes push straight to `main`, and always did.** Both generators commit and push on their own: `recent-activity`'s `commitFile` runs `git add / pull / commit / push` unconditionally, with no input that disables it and nothing in the four activity configs that could, and `waka-readme` does the same once given a `COMMIT_MESSAGE`. So by the time a `create-auto-merge-pr` step ran, `main` already carried the change and there was nothing to propose. Both logged it: activity run 1724 said *Branch 'activity-update-1724' is not ahead of base 'main' and will not be created* with `pull-request-operation = none`, and the WakaTime matrix reached *Set PR vars* with an empty pull request number and skipped every step after it. The composite's own `continue-on-error: true` on its first attempt is what kept it quiet in both. Those steps are gone rather than left as silent no-ops, which also takes `pull-requests: write` off both workflows and leaves the Owner Token, in `wakatime-stats.yml`, on the one input that needs it.
- **A concurrency group keyed on `github.head_ref || github.run_id` does not serialise a Refresh.** `head_ref` is empty on `schedule` and on `workflow_dispatch`, so the group falls through to the run id, which is unique per run: two overlapping Refreshes each got their own group and raced for the same Edition anyway. Every scheduled workflow keys on `${{ github.workflow }}-${{ github.ref }}` now, with `cancel-in-progress: false`, so a second run queues instead of cancelling a push halfway.
- **The skyline plugin points at GitHub City, not at GitHub.** `skyline.github.com/<user>/<year>` returns a 404 and `github/skyline` has been deleted: GitHub retired the site in favour of the `gh skyline` CLI, which emits an `.stl` and is no use to a plugin that works by screenshotting a web page. The plugin never touched the GitHub API for this: it drives puppeteer over whatever `plugin_skyline_settings.url` says, records frames and embeds the animation in the SVG, so repointing it is pure configuration. What it points at now is [honzaap's GitHub City](https://github.com/honzaap/GithubCity), the alternative the plugin's own README documents. Two things follow. The `ready` and `hide` selectors are that site's DOM, so they break when it changes and the symptom is a 90-second `TimeoutError`, not a 404. The old default died exactly that way, waiting forever for a `Share on Twitter` span. And `plugin_skyline_year` is deliberately unset: the plugin resolves `${year}` to the runner's current year only while the input is absent, so pinning it freezes the animation on that year.
- **Nothing on the profile shows the star tracker's output.** `github-stars-tracker.yml` writes charts and a badge to `star-tracker-data` and emails the report; no Edition embeds any of it.
- **`{AMOUNT}` is dead in the push message, permanently.** GitHub removed `size` and `distinct_size` from the `PushEvent` payload of `GET /users/{user}/events/public`; the keys are simply absent now, so `recent-activity` renders the placeholder as the literal string `undefined`. All four activity configs therefore state the push message without a count. Restoring `{AMOUNT}` puts `undefined` back on the profile in every language; no version of the action can fix it, because the number is no longer served.
- **The snake is quoted from `dist/` on `main`, not from a branch.** `snake-animation.yml` writes both SVGs there weekly. The dark variant is the `prefers-color-scheme: dark` source; the light variant is both the light source and the `<img>` fallback. The branch that used to hold them, `snake-grid-animation`, was deleted on 2026-08-29; nothing had written to it since 2025-06-26 and no Edition had quoted it since they were repointed at `dist/`.

## Known inconsistencies

Things that are wrong on the profile right now. Fix and delete the entry: deleting it is part of the fix, not tidying for later; do not let the list rot into decoration.

- None open.
