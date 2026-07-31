# 1. Automated updates land through a pull request that merges itself

Date: 2026-07-31

## Status

Accepted.

## Context

A Refresh has to get regenerated content onto `main`. The obvious route is the one most profile repositories take and the one several of the actions used here offer out of the box: commit and `git push` straight to `main` from inside the workflow. It fails at three things this repository wants:

- **No record to inspect.** These generators do produce garbage — every Edition currently carries `Pushed undefined commit(s)` in its activity region. A push leaves the damage in the branch history with no object to look at, reopen or revert as a unit.
- **Every generator its own way.** Five scheduled workflows, five third-party actions, five different ideas of how to commit. A shared landing path is the only place run metadata, branch naming and retry behaviour can be stated once.
- **A direct push cannot be gated later.** Adding any review requirement to `main` would mean rewriting all five workflows rather than one composite action.

## Decision

Every Refresh that writes to `main` routes through `.github/actions/create-auto-merge-pr`. The composite action opens an Automated Update with `peter-evans/create-pull-request`, waits and retries once if creation raced another Refresh, then merges it — `gh pr merge --auto` normally, `gh pr merge --admin` when `force-merge` is `'true'`, which is what all three callers pass. Branch names carry `github.run_number` so two Refreshes cannot collide on one branch.

`global-metrics.yml` is the deliberate exception: the metrics action owns its own commit step, so it is told `output_action: pull-request-squash` and produces its Automated Update itself.

## Consequences

- **The pull request is a record, not a gate.** It is opened and merged by the same job seconds apart, and a Force Merge walks straight past any required check. Anyone who adds branch protection to `main` expecting it to hold the Refreshes back will be disappointed — see ADR 0003, where the checks that do matter run on `pull_request` and therefore on Bot Updates, not on these.
- **`main`'s history is mostly automated squashes**, one per Refresh per week, each titled from the caller's `commit-message`.
- **Admin merge needs the Owner Token** ([ADR 0002](./0002-workflows-act-as-the-owner.md)). With GitHub's own workflow identity the merge step fails, not the PR step, so the failure surfaces late and looks like a merge conflict.
- **`global-metrics.yml` carries its own cleanup** because its exception has a failure mode the composite action does not: a failed run strands a `metrics-run-*` branch, and the workflow deletes orphaned ones in an `if: failure()` step.
