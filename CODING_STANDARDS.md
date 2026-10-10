# Coding standards

What a review checks a diff against. The words are the ones [GLOSSARY.md](./GLOSSARY.md) defines, the reasons
are in [docs/adr/](./docs/adr/), and what an implementer needs while working is in [AGENTS.md](./AGENTS.md).

**hard** marks a rule whose breach is a defect: report it with the rule. **judgement** marks a call the
reviewer weighs against the diff: report it as a question. A rule here outranks the smell baseline; where it
endorses something a smell would flag, the case is listed under *Deliberate overrides of the smell baseline*
at the end.

## Tooling already enforces

No rule below restates these, and a diff that breaks one fails CI:

- The pull request title, a Conventional Commit, linted by
  [`commit-message.yml`](./.github/workflows/commit-message.yml).
- zizmor's audit of the workflows ([`zizmor.yml`](./.github/workflows/zizmor.yml)).

## Every change

- **hard**: A change carries everything the maintenance contract in [AGENTS.md](./AGENTS.md) asks of it, in
  the same commit, and keeps every guardrail that guide states: every Edition for a change to an Authored
  Region, no hand edit inside a Generated Region, the *Surfaces* table for a new marker, the *Refreshes* table
  for a new schedule. A follow-up commit is a promise, not a fix.

## Workflows and the composite action

- **hard**: Every `uses:` names a full commit SHA with its version in a trailing comment, or its branch for a
  pin that follows one, and the two move together: the SHA is what runs, the comment is the only thing that
  makes it legible, and Renovate maintains both halves
  ([ADR 0003](./docs/adr/0003-third-party-actions-are-pinned-to-commit-shas.md)).
- **hard**: YAML carries no explanatory comments; the reason for a line goes in the commit message, the
  pull request, an ADR or a rule here, and a gotcha an implementer would otherwise trip on goes in the
  *Gotchas* of [AGENTS.md](./AGENTS.md). The trailing comment on a SHA pin is the one exception.
- **hard**: A shell step reads workflow data through `env:`, never through `${{ }}` inside the script body.
- **hard**: A scheduled workflow sets `concurrency.group: ${{ github.workflow }}-${{ github.ref }}` with
  `cancel-in-progress: false`, so a later Refresh queues behind a running one instead of racing it for the same
  Edition. A group keyed on `github.head_ref` serialises nothing, since `head_ref` is empty on `schedule` and
  `workflow_dispatch`.
- **hard**: A checkout sets `persist-credentials: false`. `github-activity.yml` is the one exception; the
  *Gotchas* in [AGENTS.md](./AGENTS.md) say why.
- **judgement**: Only a step that has to act as the Owner receives the Owner Token (`secrets.PAT`); the rest
  get `GITHUB_TOKEN` or the Integration Token for their one service
  ([ADR 0002](./docs/adr/0002-workflows-act-as-the-owner.md)).

## Docs

- **judgement**: Propose an ADR only for a decision that is hard to reverse, surprising without context and the
  result of a real trade-off, and link it from where it bites.
- **hard**: Fix a breach in the change that finds it, or report it on the pull request with the rule it breaks;
  no guide keeps a list of known inconsistencies, because an entry is a claim about the code that nothing keeps
  true.

## Deliberate overrides of the smell baseline

- **Duplicated Code**: every Edition is a whole document, and `github-activity.yml` runs the same action once
  per Edition, because a renderer would give this repository a toolchain it does not have
  ([ADR 0004](./docs/adr/0004-each-locale-is-a-whole-edition.md)).
- **Shotgun Surgery**: a change to an Authored Region is made in every Edition, and a new language is a fixed
  set of edits across the Editions, the activity configs and the WakaTime matrix
  ([ADR 0004](./docs/adr/0004-each-locale-is-a-whole-edition.md)).
