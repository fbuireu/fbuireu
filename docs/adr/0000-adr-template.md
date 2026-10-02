# 0. ADR template

Date: 2026-07-31

## Status

Template. Not a decision: copy this file, do not edit it in place.

## Context

Copy this file to `NNNN-kebab-title.md`, numbered one above the highest existing ADR. The `# N. Title` heading carries that same number and states the decision in one line; the file slug is the short form of it.

Write an ADR only when the decision is **hard to reverse**, **surprising without context** and **the result of a real trade-off**. All of them, or it is not an ADR.

This section holds the forces, not the answer: what the situation was, what the alternatives were, and why the obvious option was not obviously right. Someone reading it two years from now has none of the context you have today, and the constraint that made this hard is the part they will be missing.

## Decision

What was decided, in the present tense, as a rule the repository follows: "every Refresh that writes to `main` opens an Automated Update", not "we decided to use pull requests". Name the alternative that was rejected and why, since that is what stops it being re-proposed. Point at files and step names rather than line numbers, because a `file.yml:42` citation rots the moment anything above it moves.

## Consequences

What follows from this, including what it costs. The bullets someone needs before touching the workflows:

- What is now load-bearing and must not be removed, and what breaks if it is.
- What this makes harder, slower, or impossible. An ADR with no cost recorded is usually not describing a real trade-off.
- Where the decision bites in the rest of the docs: the rule in [`CODING_STANDARDS.md`](../../CODING_STANDARDS.md) a reviewer holds a diff to, the Gotchas bullet in [`AGENTS.md`](../../AGENTS.md), the [`CONTEXT.md`](../../CONTEXT.md) term it defines the behaviour of, the other ADR it depends on. There is no index; an ADR nothing links to will not be read.
