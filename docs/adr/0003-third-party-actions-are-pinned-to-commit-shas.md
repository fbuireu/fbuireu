# 3. Third-party actions are pinned to commit SHAs

Date: 2026-07-31

## Status

Accepted. Amended 2026-10-22: `athul/waka-readme` is gone, and a SHA turns out not to freeze what a Docker action runs; see the Consequence that says so.

## Context

This repository is a profile README with no application in it, which makes it look like the last place that needs supply-chain discipline. It is close to the opposite: it runs a dozen actions, most of them third-party, on a weekly schedule, unattended, with an Owner Token in the environment that can write to every repository the Owner owns ([ADR 0002](./0002-workflows-act-as-the-owner.md)). A version tag is a mutable pointer. Anyone who can move `v3` in somebody else's repository can run their code here, next Sunday at midnight, next to that token, and nobody would be watching.

Pinning to tags is what almost every profile repository does, reads better, and gives Renovate less to do. It was rejected: the entire attack needs one moved tag.

## Decision

Every `uses:` names a full commit SHA, with the human-readable version in a trailing comment. Renovate maintains both (`pinDigests: true` and `rangeStrategy: pin` in [`.github/renovate.json`](../../.github/renovate.json)), and pin, patch and minor Bot Updates merge themselves while major ones wait for the Owner. [`zizmor.yml`](../../.github/workflows/zizmor.yml) runs on every push to `main` and every pull request and reports into code scanning, so a regression is caught on the Bot Update that introduces it.

Two actions are deliberately pinned to a branch commit rather than a release, and each comment names the branch so a reader can see it is not a tag: `Readme-Workflows/recent-activity` on `main`, and `gh-metrics/metrics` on `master`, ahead of the `v3.35.0-beta` its comment records, in both workflows that run it. Only the first says *why* in its comment (the commit that removes dead glitch.me telemetry is unreleased); for the second the reason is upstream's release habits and is not written down here. `athul/waka-readme` was a third, on `master` because it had tagged nothing since `v0.3.1` on 2024-05-01, until the WakaTime cards replaced it in 2026-10.

## Consequences

- **The trailing comment is the only readable version anywhere.** Renovate rewrites it with the SHA; editing one by hand desynchronises the two and nothing checks it.
- **Those branch pins never advance on their own.** Renovate has no release to compare against, so they stay where they are until someone looks, which is the point, but it means "pinned" here also means "frozen".
- **A SHA does not freeze what a Docker action runs.** It pins the action's files; the image is built or pulled when the job runs. `gh-metrics/metrics` decides which by its own name: at the pinned commit it fails to recognise itself, logs *Using a forked version* and builds from the pinned `Dockerfile`, about four minutes a run, while from upstream's `b594ca3` (2026-09-07) on it recognises itself and pulls `ghcr.io/gh-metrics/metrics:v3.35-beta`, a tag whoever can push there can move. Both workflows that run it set `use_prebuilt_image: no`, which keeps the build once the pin moves past that commit. Even the build floats: `node:20-bookworm-slim`, Google Chrome, Deno and a Ruby gem arrive at whatever version is current that Sunday, and only the npm dependencies are locked, by `npm ci`. An action whose `image:` is a `docker://` tag is worse: the SHA then pins only `action.yml`, and nothing that runs.
- **A major Bot Update blocks a Refresh silently.** It sits open, labelled `major-update`, while the workflow keeps running the old SHA quite happily. Nothing escalates.
- **`zizmor` is not advisory.** It is the only automated check here that reads how the workflows are written ([`dependency-review.yml`](../../.github/workflows/dependency-review.yml) runs on every pull request too, against the actions GitHub's dependency graph reads from the `uses:` lines, each recorded at the commit SHA it is pinned to; it looks at which actions a pull request brings in, not at how they are used), and it is why `persist-credentials: false` appears on the checkouts that do not need credentials.
