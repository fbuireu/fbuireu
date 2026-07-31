# 2. Workflows act as the Owner, not as GitHub's workflow identity

Date: 2026-07-31

## Status

Accepted.

## Context

`secrets.GITHUB_TOKEN` is free, scoped to this repository, expires with the job and needs no maintenance. It is the right default, and it cannot do two things this repository depends on:

- **A commit made with it does not trigger another workflow.** That is a deliberate GitHub loop-breaker, and it means an Automated Update merged with `GITHUB_TOKEN` starts nothing downstream.
- **A review submitted with it is authored by `github-actions[bot]`, not by the Owner.** `renovate-auto-approve.yml` counts approvals whose author is `github.repository_owner` before deciding whether to add one — that check can never be satisfied by the workflow identity.

Beyond GitHub, five Refreshes read from services that have nothing to do with this repository, and handing them a GitHub credential would be pointless as well as dangerous.

## Decision

`secrets.PAT` is the Owner Token, and it is used wherever a step must *be* the Owner: `actions/checkout` in the workflows that push, the pull request created by `create-auto-merge-pr`, `gh pr merge`, `gh pr review --approve`, and the star tracker's own repository reads.

`GITHUB_TOKEN` is kept for everything that only reads or comments: the major-update comment in `dependabot-auto-merge.yml`, the checkout and `committer_token` in `global-metrics.yml`, the contribution-grid generator in `snake-animation.yml`, the orphan-branch cleanup, and — implicitly, by not being given anything else — `dependency-review.yml` and `zizmor.yml`.

Every external service gets its own Integration Token, named for that service and granting nothing on GitHub: `METRICS_TOKEN`, `WAKATIME_TOKEN`, `FOLLOWERS_NOTIFIER_TOKEN`, `SPOTIFY_CLIENT_ID`/`SPOTIFY_CLIENT_SECRET`/`SPOTIFY_REFRESH_TOKEN`, `STEAM_TOKEN`, `GOOGLE_MAPS_TOKEN`, `PAGESPEED_TOKEN`, `MAIL_PASSWORD`. The Owner Token is never passed to one.

## Consequences

- **The blast radius is every repository the Owner can write to**, not just this one. That is the price paid, and it is why [ADR 0003](./0003-third-party-actions-are-pinned-to-commit-shas.md) exists: an unpinned third-party action running on a schedule with this token in the environment is the realistic way it leaks.
- **When the token expires, every Refresh breaks at once**, and the failures do not say "expired token" — they surface as a 403 on checkout or as a merge step that silently exhausts its retries.
- **`persist-credentials` is load-bearing per workflow, not a style choice.** `github-activity.yml` sets it to `true` because the recent-activity action pushes with the credentials checkout left behind; the others set `false` because they hand the token to a step explicitly. Flipping either breaks that workflow only, and `zizmor` will flag the `true` — that one is intentional.
