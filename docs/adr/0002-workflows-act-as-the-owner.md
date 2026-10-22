# 2. Workflows act as the Owner, not as GitHub's workflow identity

Date: 2026-07-31

## Status

Accepted. Amended 2026-08-28: the recent-activity steps moved to `GITHUB_TOKEN`, and `github-stars-tracker.yml` stopped persisting the Owner Token, which is what the last Consequence had claimed all along. Amended 2026-10-17: the lists name every user of the Owner Token, including `waka-readme`'s commits and the star tracker's push, and `METRICS_TOKEN` and `FOLLOWERS_NOTIFIER_TOKEN` are GitHub personal access tokens. Amended 2026-10-22: `wakatime-stats.yml` stopped handing the Owner Token to a third-party tool; its checkout and the composite hold it, and its metrics step reads WakaTime with no GitHub credential at all. Amended 2026-10-22: `profile-cards.yml` joins both lists, the Owner Token for its checkout and composite, `GITHUB_TOKEN` for its generators.

## Context

`secrets.GITHUB_TOKEN` is free, scoped to this repository, expires with the job and needs no maintenance. It is the right default, and it cannot do some things this repository depends on:

- **A commit made with it does not trigger another workflow.** That is a deliberate GitHub loop-breaker, and it means an Automated Update merged with `GITHUB_TOKEN` starts nothing downstream.
- **A review submitted with it is authored by `github-actions[bot]`, not by the Owner.** A `renovate-auto-approve.yml` workflow used to count approvals whose author is `github.repository_owner` before deciding whether to add one, and that check could never be satisfied by the workflow identity. The `main` ruleset requires no approval now, so that workflow is gone, and the point stands for anything that would submit a review here.

Beyond GitHub, most Refreshes read from services that have nothing to do with this repository, and handing them a GitHub credential would be pointless as well as dangerous.

## Decision

`secrets.PAT` is the Owner Token, and it is used wherever a step must *be* the Owner: `actions/checkout` in the workflows that push or propose a change ([`github-activity.yml`](../../.github/workflows/github-activity.yml), [`snake-animation.yml`](../../.github/workflows/snake-animation.yml), [`wakatime-stats.yml`](../../.github/workflows/wakatime-stats.yml) and [`profile-cards.yml`](../../.github/workflows/profile-cards.yml)), the pull request created by `create-auto-merge-pr`, `gh pr merge`, `gh pr review --approve`, and the star tracker, which reads the Owner's repositories and pushes the `star-tracker-data` branch.

`GITHUB_TOKEN` is kept for everything that need not be the Owner, whether it reads, comments or writes: the major-update comment and the update-type labels in [`dependabot-auto-merge.yml`](../../.github/workflows/dependabot-auto-merge.yml), the checkout and `committer_token` in [`global-metrics.yml`](../../.github/workflows/global-metrics.yml), with which the metrics action creates its branch, commits and opens its Automated Update, the contribution-grid generator in [`snake-animation.yml`](../../.github/workflows/snake-animation.yml), every card generator in [`profile-cards.yml`](../../.github/workflows/profile-cards.yml), which read public data only, the recent-activity steps in [`github-activity.yml`](../../.github/workflows/github-activity.yml), which call `activity.listPublicEventsForUser` and nothing else and push with the credential the checkout left rather than with what they are handed, the orphan-branch cleanup, and (implicitly, by not being given anything else) [`dependency-review.yml`](../../.github/workflows/dependency-review.yml) and [`zizmor.yml`](../../.github/workflows/zizmor.yml).

Every external service gets its own Integration Token, named for that service: `WAKATIME_TOKEN`, `SPOTIFY_CLIENT_ID`/`SPOTIFY_CLIENT_SECRET`/`SPOTIFY_REFRESH_TOKEN`, `STEAM_TOKEN`, `GOOGLE_MAPS_TOKEN`, `PAGESPEED_TOKEN` and `MAIL_PASSWORD` grant nothing on GitHub. The two third-party tools that read GitHub itself get a GitHub personal access token each, separate from the Owner Token: `METRICS_TOKEN` for the metrics action and `FOLLOWERS_NOTIFIER_TOKEN` for `follower-change`, which lists the followers of the account the token belongs to. The same metrics action rendering the WakaTime cards in `wakatime-stats.yml` reads no GitHub data and gets no GitHub token, `token: NOT_NEEDED`. The Owner Token is never passed to a third-party tool that only reads.

## Consequences

- **The blast radius is every repository the Owner can write to**, not just this one. That is the price paid, and it is why [ADR 0003](./0003-third-party-actions-are-pinned-to-commit-shas.md) exists: an unpinned third-party action running on a schedule with this token in the environment is the realistic way it leaks.
- **When the token expires, every Refresh but the follower notifier breaks at once**, and so does the Dependabot auto-merge, which reads its copy from the Dependabot secret store. The failures do not say "expired token": they surface as a 403 on checkout or a merge step that exhausts its retries. Rotating it means updating both stores, Actions and Dependabot.
- **`persist-credentials` is load-bearing per workflow, not a style choice.** [`github-activity.yml`](../../.github/workflows/github-activity.yml) sets it to `true` because the recent-activity action pushes with the credentials checkout left behind; the others set `false` because they hand the token to a step explicitly. Flipping either breaks that workflow only, and `zizmor` will flag the `true`, which is intentional.
