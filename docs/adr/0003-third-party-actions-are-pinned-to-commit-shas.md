# 3. Third-party actions are pinned to commit SHAs

Date: 2026-07-31

## Status

Accepted.

## Context

This repository is a profile README with no application in it, which makes it look like the last place that needs supply-chain discipline. It is close to the opposite: it runs a dozen actions, most of them third-party, on a weekly schedule, unattended, with an Owner Token in the environment that can write to every repository the Owner owns ([ADR 0002](./0002-workflows-act-as-the-owner.md)). A version tag is a mutable pointer. Anyone who can move `v3` in somebody else's repository can run their code here, next Sunday at midnight, next to that token, and nobody would be watching.

Pinning to tags is what almost every profile repository does, reads better, and gives Renovate less to do. It was rejected: the entire attack needs one moved tag.

## Decision

Every `uses:` names a full commit SHA, with the human-readable version in a trailing comment. Renovate maintains both (`pinDigests: true` and `rangeStrategy: pin` in [`.github/renovate.json`](../../.github/renovate.json)), and pin, patch and minor Bot Updates merge themselves while major ones wait for the Owner. [`zizmor.yml`](../../.github/workflows/zizmor.yml) runs on every push to `main` and every pull request and reports into code scanning, so a regression is caught on the Bot Update that introduces it.

Two pins deliberately reference a branch commit rather than a release, and the comment says why rather than leaving a reader to guess: `Readme-Workflows/recent-activity` (the commit that removes dead glitch.me telemetry is unreleased) and `athul/waka-readme` (master).

## Consequences

- **The trailing comment is the only readable version anywhere.** Renovate rewrites it with the SHA; editing one by hand desynchronises the two and nothing checks it.
- **The two branch pins never advance on their own.** Renovate has no release to compare against, so they stay where they are until someone looks, which is the point, but it means "pinned" here also means "frozen".
- **A major Bot Update blocks a Refresh silently.** It sits open, labelled `major-update,review-required`, while the workflow keeps running the old SHA quite happily. Nothing escalates.
- **`zizmor` is not advisory.** It is the only automated check here with anything to inspect ([`dependency-review.yml`](../../.github/workflows/dependency-review.yml) runs on every pull request too, but there is no manifest in this repository for it to review), and it is why `persist-credentials: false` appears on the checkouts that do not need credentials.
