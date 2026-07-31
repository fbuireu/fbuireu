# Profile

The domain of a GitHub profile that keeps itself current: what the profile says about its Owner, in which languages, and by which route each part of it arrives. Everything here is about the surfaces a reader sees and the provenance of what sits on them — not about the actions, tokens or YAML that fetch it.

## Surfaces

**Profile README**:
The document GitHub renders on `github.com/fbuireu` because this repository's name matches its Owner's login. It is the only reason this repository exists; there is no application here.
_Avoid_: readme, landing page, homepage, bio

**Edition**:
One complete language rendering of the Profile README. There are four — English, Catalan, Spanish, Italian — and each is a whole document rather than a fragment: an Edition that falls behind is wrong on its own, not partially translated.
_Avoid_: translation, locale file, variant, version

**Canonical Edition**:
The English `README.md`. It is the only Edition GitHub will ever render on the profile itself; the other three are reachable only by a reader who follows the Language Table.
_Avoid_: default readme, main readme, source of truth

**Language Table**:
The switcher at the head of every Edition, listing all four with a pin marking the one being read. It is the only navigation between Editions, and it is written by hand in each of them.
_Avoid_: language switcher, nav, locale selector

## Provenance

**Generated Region**:
A span inside an Edition delimited by a pair of HTML comment markers, whose contents are overwritten wholesale on each Refresh. The markers belong to whichever tool writes the region, so their spelling differs from one region to the next and is not ours to choose.
_Avoid_: placeholder, slot, injected block, template

**Authored Region**:
Everything in an Edition outside a Generated Region — the links, the prose, the jokes, the Language Table. It changes only when a human changes it, and a Refresh is expected to leave it byte-identical.
_Avoid_: static content, manual section, hardcoded

**Artefact**:
A file produced by a Refresh and committed to this repository — an SVG, a badge, a CSV. Because it is served from a URL under this repository, it keeps working for exactly as long as the file does.
_Avoid_: asset, output, build product, generated file

**Embed**:
A third-party image URL written into an Edition and resolved by the reader's browser, through GitHub's image proxy, at the moment the profile is opened. Nothing about it is stored here: an Embed is a live dependency on somebody else's uptime, and a dead one shows on the profile as a broken image.
_Avoid_: badge, widget, external image, remote asset

**Artefact Branch**:
A branch holding Artefacts and nothing else, unrelated to the history on `main` and written by a single Refresh. Only the star tracker keeps one today; the snake and the metrics SVG are Artefacts committed to `main` and quoted from there. Wherever an Artefact is quoted from, that path is a public interface — moving it breaks every Edition, and breaks them silently.
_Avoid_: data branch, output branch, orphan branch, gh-pages

**Refresh**:
One execution of a scheduled workflow that regenerates a Generated Region or an Artefact. It is the unit of freshness in this domain: "stale" means no Refresh has landed since the underlying fact changed.
_Avoid_: run, job, build, sync, update

## Landing Changes

**Automated Update**:
The pull request a Refresh opens against `main` carrying whatever it regenerated. Every Refresh that writes to `main` produces one; none of them push directly.
_Avoid_: bot commit, auto-commit, automated PR

**Force Merge**:
Merging an Automated Update with the Owner's administrative privileges instead of waiting on checks. It is the normal path for a Refresh, not an escape hatch.
_Avoid_: admin merge, bypass, skip checks, override

**Bot Update**:
A pull request opened by a dependency bot rather than by a Refresh. It carries no profile content — only version bumps to the third-party actions the Refreshes depend on, whether routine or prompted by a security advisory.
_Avoid_: dependency PR, renovate PR, dependabot PR

**Update Type**:
The severity a Bot Update is classified as — pin, patch, minor, major, or lock maintenance — and the sole input to whether it merges by itself or waits for the Owner.
_Avoid_: semver bump, risk level, category

## Identity

**Owner**:
The single human this Profile describes, and the only account with write access here. Every Automated Update is authored as the Owner rather than as a bot; that is deliberate, not cosmetic.
_Avoid_: user, author, maintainer, account

**Owner Token**:
The credential that lets a Refresh act as the Owner instead of as GitHub's own workflow identity. It is what makes an Automated Update approvable, mergeable, and capable of triggering the next Refresh.
_Avoid_: PAT, GITHUB_TOKEN, secret, credential

**Integration Token**:
A credential scoped to one external service a Refresh reads from — the time tracker, the music service, the map provider. Each names its own service and grants nothing on GitHub.
_Avoid_: API key, third-party secret, service token

**Pinned Action**:
A third-party action referenced by the exact commit that will run, rather than by a tag whose owner can move it. Every action a Refresh uses is one.
_Avoid_: locked action, versioned action, dependency

## Notifications

**Notification**:
An email sent to the Owner when something the Profile watches has moved — a follower gained or lost, a star count changed. It reports; it never writes to an Edition.
_Avoid_: alert, digest, report, ping
