# 3. Third-party actions are pinned to commit SHAs

Date: 2026-07-31

## Status

Accepted.

## Context

This repository is a profile README with no application in it, which makes it look like the last place that needs supply-chain discipline. It is close to the opposite: it runs a dozen actions, most of them third-party, on a weekly schedule, unattended, with an Owner Token in the environment that can write to every repository the Owner owns ([ADR 0002](./0002-workflows-act-as-the-owner.md)). A version tag is a mutable pointer. Anyone who can move `v3` in somebody else's repository can run their code here, next Sunday at midnight, next to that token, and nobody would be watching.

Pinning to tags is what almost every profile repository does, reads better, and gives Renovate less to do. It was rejected: the entire attack needs one moved tag.

## Decision

Every `uses:` names a full commit SHA, with the human-readable version in a trailing comment. Renovate maintains both (`pinDigests: true` and `rangeStrategy: pin` in [`.github/renovate.json`](../../.github/renovate.json)), and pin, patch and minor Bot Updates merge themselves while major ones wait for the Owner. [`zizmor.yml`](../../.github/workflows/zizmor.yml) runs on every push to `main` and every pull request and reports into code scanning, so a regression is caught on the Bot Update that introduces it.

Three pins deliberately reference a branch commit rather than a release, and each comment names the branch so a reader can see it is not a tag: `Readme-Workflows/recent-activity` on `main`, `athul/waka-readme` on `master`, and `gh-metrics/metrics` on `master`, ahead of the `v3.35.0-beta` its comment records. Only the first says *why* in its comment (the commit that removes dead glitch.me telemetry is unreleased). `athul/waka-readme` has tagged nothing since `v0.3.1` on 2024-05-01 and ships its fixes on `master` alone, among them the move off PyGithub's deprecated login (2025-09) and the 22-character time column the Editions' WakaTime tables are drawn with (2026-02); the pinned commit was upstream's head in 2026-10. For `gh-metrics/metrics` the reason is upstream's release habits and is not written down here.

## Consequences

- **The trailing comment is the only readable version anywhere.** Renovate rewrites it with the SHA; editing one by hand desynchronises the two and nothing checks it.
- **Those branch pins never advance on their own.** Renovate has no release to compare against, so they stay where they are until someone looks, which is the point, but it means "pinned" here also means "frozen".
- **A SHA does not freeze a Docker action that builds itself.** `athul/waka-readme` declares `image: dockerfile`, so every WakaTime job builds its image on the runner from `docker.io/python:3-slim` and `pip install`s PyGithub, requests and Faker at the newest release above a `>=` floor, with no lock file. The pin fixes `main.py`; the interpreter and the libraries it runs on, next to the Owner Token, are whatever that Sunday's are. An action whose `image:` is a `docker://` tag is worse: the SHA then pins only `action.yml`, and nothing that runs.
- **A major Bot Update blocks a Refresh silently.** It sits open, labelled `major-update`, while the workflow keeps running the old SHA quite happily. Nothing escalates.
- **`zizmor` is not advisory.** It is the only automated check here that reads how the workflows are written ([`dependency-review.yml`](../../.github/workflows/dependency-review.yml) runs on every pull request too, against the actions GitHub's dependency graph reads from the `uses:` lines, each recorded at the commit SHA it is pinned to; it looks at which actions a pull request brings in, not at how they are used), and it is why `persist-credentials: false` appears on the checkouts that do not need credentials.
