# Architecture

How the profile is put together and why. What a reader sees is the [Canonical Edition](./README.md) itself; the
vocabulary is [GLOSSARY.md](./GLOSSARY.md); how to work here is [AGENTS.md](./AGENTS.md); what a review checks
is [CODING_STANDARDS.md](./CODING_STANDARDS.md). This document does not restate them.

## 1. What the profile is made of

There is no application here, so "architecture" means where each part of an Edition comes from. Every Edition
is the same stack of sections, and each section reaches the reader by one of four routes: an **Authored
Region** written by hand, a **Generated Region** a Refresh rewrites between markers, an **Artefact** a Refresh
commits as a file, or an **Embed** a third-party server draws when the profile is opened.

```mermaid
---
config:
  look: handDrawn
  layout: dagre
---
flowchart LR
    owner["the Owner, by hand"] -->|"Authored Region"| authored
    ga["github-activity.yml"] -->|"Generated Region"| activity
    ws["wakatime-stats.yml"] -->|"Generated Region"| waka
    sa["snake-animation.yml"] -->|"Artefact in dist/"| snake
    gm["global-metrics.yml"] -->|"Artefact in assets/images/svg/"| metrics
    third["third-party image services<br/>and GitHub's status badges"] -->|"Embed, drawn when<br/>the profile is opened"| embeds
    subgraph edition["every Edition"]
        authored["heading, Language Table, about,<br/>links, article lists, CV, license"]
        activity["Latest Activity"]
        embeds["stats cards, streak, trophies,<br/>music, Stack Overflow, Debug"]
        waka["WakaTime weekly stats"]
        snake["Qwerty, the snake"]
        metrics["detailed charts"]
    end
    st["github-stars-tracker.yml"] --> branch["star-tracker-data,<br/>an Artefact Branch"]
    fn["follower-notifier.yml"] --> mail["email to the Owner"]
```

Section by section, named as the Canonical Edition heads them; the other Editions carry the same sections in
the same order:

| Section | Route | Source |
| --- | --- | --- |
| Heading, hero image and quotes | Authored Region | Written by hand; the images are files under [`assets/images/`](./assets/images) |
| Language Table | Authored Region | Written by hand in every Edition; the flags are under [`assets/images/png/flags/`](./assets/images/png/flags) |
| The *working on*, *learning*, *ask me about* lines | Authored Region | Written by hand |
| *Download my Resume* | Authored Region | [`assets/pdf/Ferran-Buireu-CV.pdf`](./assets/pdf/Ferran-Buireu-CV.pdf), committed by hand; nothing here regenerates it |
| *How to reach me* | Authored Region of Embeds | Links written by hand, each drawn as an `img.shields.io` badge |
| *dev delusions*: Medium and Hashnode | Authored Region | Article lists kept by hand |
| *dev delusions*: Stack Overflow | Embed | `github-readme-stackoverflow.vercel.app` |
| *Latest Activity* | Generated Region | `<!--RECENT_ACTIVITY:start-->` … `<!--RECENT_ACTIVITY:end-->`, rewritten by [`github-activity.yml`](./.github/workflows/github-activity.yml) |
| *Top repositories*, *Top Contributions & Streak*, *Languages & Stats*, *Trophies* | Embeds | `github-readme-stats-fast.vercel.app`, `github-readme-activity-graph.vercel.app`, `github-readme-streak-stats.herokuapp.com`, `github-profile-trophy.vercel.app` |
| *Wakatime stats*, *Weekly stats* | Generated Region | `<!--START_SECTION:waka-->` … `<!--END_SECTION:waka-->`, rewritten by [`wakatime-stats.yml`](./.github/workflows/wakatime-stats.yml) |
| *Wakatime stats*, *Overall Languages* | Embed | `github-readme-stats-fast.vercel.app/api/wakatime` |
| *My exquisite music taste* | Embed | `spotify-recently-played-readme.vercel.app` |
| Qwerty, the contribution snake | Artefact | [`dist/github-contribution-grid-snake.svg`](./dist/github-contribution-grid-snake.svg) and its `-dark` twin, written by [`snake-animation.yml`](./.github/workflows/snake-animation.yml) and quoted from `raw.githubusercontent.com/…/main/dist/` |
| *Wanna see more detailed charts?* | Artefact | [`assets/images/svg/github-metrics.svg`](./assets/images/svg/github-metrics.svg), written by [`global-metrics.yml`](./.github/workflows/global-metrics.yml) and quoted by relative path |
| *Debug* | Embeds | GitHub's status badges for the six scheduled workflows; see §2 |
| *License* | Authored Region | Written by hand |

When a reader opens the profile, GitHub renders the Canonical Edition as it stands on `main`. The Generated
Regions are already text in it, the Artefacts are files in this repository, and every Embed is fetched through
GitHub's image proxy at that moment, from a server this repository does not run. Two scheduled workflows feed
nothing the profile shows: the star tracker writes an Artefact Branch no Edition quotes, and the follower
notifier only sends email.

## 2. The weekly refreshes

Six workflows run on a schedule, and they share one cron, `0 0 * * 0`, Sunday at 00:00 UTC; each also accepts
`workflow_dispatch`. GitHub starts scheduled runs late when it is busy, and midnight UTC is busy. Over the eight
Sundays from 2026-08-23 to 2026-10-11 they started at these times, in this order every week:

| Workflow | Started (UTC) | Lands as | Commit identity on `main` |
| --- | --- | --- | --- |
| [`github-activity.yml`](./.github/workflows/github-activity.yml) | 00:27 to 02:56 | a direct push per Edition | `readme-bot`, recent-activity's own name, with the GitHub Actions noreply address |
| [`follower-notifier.yml`](./.github/workflows/follower-notifier.yml) | 00:34 to 03:10 | an email | none |
| [`snake-animation.yml`](./.github/workflows/snake-animation.yml) | 00:51 to 03:37 | an Automated Update and a Force Merge | the Owner as author, GitHub as committer of the squash |
| [`github-stars-tracker.yml`](./.github/workflows/github-stars-tracker.yml) | 01:04 to 04:07 | a push to the Artefact Branch, and an email | `github-actions[bot]`, on `star-tracker-data` |
| [`wakatime-stats.yml`](./.github/workflows/wakatime-stats.yml) | 01:10 to 04:19 | a Contents API commit per Edition | the Owner |
| [`global-metrics.yml`](./.github/workflows/global-metrics.yml) | 01:49 to 05:32 | an Automated Update and a Force Merge | `github-actions[bot]` as author, GitHub as committer of the squash |

That order is what GitHub happened to do, not a promise. Each workflow's `concurrency` group serialises its own
runs and nothing else, so two Refreshes that write the same Edition, a manual dispatch, or a hand commit landing
mid-run can still meet. What each writer does when they do is in its own flow below.

The README Refreshes reach `main` without a pull request only because the Owner Token belongs to an admin and the
`main` ruleset lets the admin role bypass it; with any other token those pushes would be refused.

**How a failure gets noticed.** The *Debug* section at the foot of every Edition carries GitHub's status badge
for each of the six workflows, and a red one means that workflow's latest run failed. GitHub also emails a
failed scheduled run to whoever last changed that workflow's cron line. Neither sees the failures that end
green: a metrics plugin that draws an error panel, or an Edition whose WakaTime markers have gone.

### Recent activity

```mermaid
---
config:
  look: handDrawn
  layout: dagre
---
flowchart TD
    cron["Sunday cron, or manual"] --> checkout["Checkout with the Owner Token,<br/>credentials left in .git/config"]
    checkout --> next["next config, in order<br/>en, ca, it, es"]
    next --> events["recent-activity reads the Owner's<br/>public events with GITHUB_TOKEN"]
    events --> any{"any events?"}
    any -->|no| next
    any -->|yes| marker{"RECENT_ACTIVITY:start<br/>in that Edition?"}
    marker -->|no| fail["step fails; the Editions<br/>after it are skipped"]
    marker -->|yes| rewrite["replace the list up to the end marker,<br/>adding the end marker if it is gone"]
    rewrite --> pull["git add, git pull"]
    pull --> moved{"main changed that<br/>Edition meanwhile?"}
    moved -->|yes| fail
    moved -->|no| push["git commit and git push<br/>as readme-bot"]
    push --> next
    next -->|"all four done"| done["run ends green"]
```

One job, one checkout, four steps: *Run recent activity (EN)*, *(CA)*, *(IT)* and *(ES)*, each the same pinned
`Readme-Workflows/recent-activity` given its Edition's config (§3). It reads `GET /users/{user}/events/public`
with `GITHUB_TOKEN`, and pushes with the Owner Token the checkout left behind, which is why that checkout is the
one in the tree with `persist-credentials: true` ([ADR 0002](./docs/adr/0002-workflows-act-as-the-owner.md)).
An unchanged list commits nothing.

- **A missing start marker is loud.** The step stops with *Couldn't find the `<!--RECENT_ACTIVITY:start-->`
  comment. Exiting!*, and since the steps run in sequence, every Edition after it keeps last week's list. A
  missing end marker is repaired: the action writes the list and the end marker after the start one.
- **A collision fails the step.** `git pull` refuses when a commit that reached `main` since the checkout
  touched the Edition it has staged, and `git push` is rejected if one lands between the pull and the push.
  Either way the later Editions are skipped too.
- **An expired Owner Token** stops the run at the checkout, before any Edition is touched.

### WakaTime

```mermaid
---
config:
  look: handDrawn
  layout: dagre
---
flowchart TD
    cron["Sunday cron, or manual"] --> matrix["one job per Edition, one at a time:<br/>README.md, README.ca.md,<br/>README.es.md, README.it.md"]
    matrix --> read["waka-readme reads the Edition<br/>through the Contents API"]
    read --> marker{"START_SECTION:waka<br/>in it?"}
    marker -->|no| silent["warning in the log, nothing written,<br/>job ends green"]
    marker -->|yes| fetch["fetch the last 7 days<br/>from WakaTime with WAKATIME_TOKEN"]
    fetch --> answered{"WakaTime answered?"}
    answered -->|no| failed["job fails after its retries"]
    answered -->|yes| changed{"stats changed?"}
    changed -->|no| unchanged["no commit"]
    changed -->|yes| commit["update_file against the blob it read,<br/>with the Owner Token"]
    commit --> stale{"Edition changed<br/>since it was read?"}
    stale -->|yes| failed
    stale -->|no| main["a commit on main,<br/>authored by the Owner"]
    failed --> cancel["fail-fast cancels the<br/>Editions still queued"]
```

A matrix over the four Editions with `max-parallel: 1`, so they run one after another, and `fail-fast: true`.
The checkout is not what writes: `athul/waka-readme` reads and writes each Edition through the GitHub Contents
API with the Owner Token passed as `GH_TOKEN`, so every commit is the Owner's and none goes through `git push`.

- **A missing marker is silent.** The action logs *Cannot find … pattern in readme*, leaves the Edition as it
  is, and the job, the run and the *Debug* badge all stay green.
- **A dead WakaTime token takes every Edition down at once.** The first job, `README.md`, fails, and `fail-fast`
  cancels the three still queued. The metrics SVG's WakaTime section shows an error panel the same week (below).
- **A collision fails the job.** The commit names the blob it read; if the Edition changed in between, the API
  refuses it, the job fails, and `fail-fast` cancels the rest.

### Snake

```mermaid
---
config:
  look: handDrawn
  layout: dagre
---
flowchart TD
    cron["Sunday cron, or manual"] --> checkout["Checkout with the Owner Token"]
    checkout --> snk["Platane/snk reads the contribution calendar<br/>with GITHUB_TOKEN and writes both SVGs<br/>into dist/, committing nothing"]
    snk --> composite["Create and auto-merge PR:<br/>the create-auto-merge-pr composite"]
    composite --> diff{"anything changed?"}
    diff -->|no| none["no pull request,<br/>run ends green"]
    diff -->|yes| pr["Automated Update on<br/>snake-animation-update-N,<br/>opened with the Owner Token"]
    pr --> checks["the pull-request workflows run on it,<br/>and nothing waits for them"]
    pr --> merge["Force Merge: admin squash merge,<br/>up to 5 tries, 15 s apart"]
    merge --> main["a commit on main,<br/>authored by the Owner"]
```

`Platane/snk` renders `dist/github-contribution-grid-snake.svg` and the `-dark` variant from the Owner's
contribution calendar and leaves them uncommitted, which is what gives the composite action something to propose
(§4). Because the Owner Token opens the pull request, the pull-request workflows do run on it, which is why its
title is a Conventional Commit; the Force Merge does not wait for them
([ADR 0001](./docs/adr/0001-automated-updates-land-through-a-self-merging-pull-request.md)). The branch goes when
the pull request merges.

- **Opening the pull request can race** another Refresh. The composite tries once more after 45 seconds; if
  that fails too, the run fails and nothing lands.
- **A merge that keeps failing** exhausts its five tries, the run fails, and the Automated Update stays open
  for the Owner.
- **An expired Owner Token** stops the run at the checkout.

### Metrics

```mermaid
---
config:
  look: handDrawn
  layout: dagre
---
flowchart TD
    cron["Sunday cron, or manual;<br/>30-minute job timeout"] --> checkout["Checkout with GITHUB_TOKEN"]
    checkout --> branch["gh-metrics creates metrics-run-RUN_ID<br/>from main, with GITHUB_TOKEN"]
    branch --> render["render the SVG: GitHub data through METRICS_TOKEN,<br/>each plugin through its own token"]
    render --> plugin{"a plugin failed?"}
    plugin -->|yes| panel["error panel drawn into the SVG;<br/>the run carries on"]
    plugin -->|no| pr
    panel --> pr["commit the SVG on the branch, open<br/>Auto-generated metrics for run RUN_ID,<br/>as github-actions[bot]"]
    pr --> force["Force merge metrics pull request:<br/>admin squash merge with the Owner Token,<br/>3 tries, 10 s apart"]
    force --> main["a commit on main,<br/>authored by github-actions[bot]"]
    render -->|"30 minutes up"| cancelled["job cancelled"]
    force -->|"tries exhausted"| failed["job fails"]
    cancelled --> cleanup["Clean up orphaned metrics pull requests and branches:<br/>close this run's pull request, delete every<br/>metrics-run branch no open pull request uses"]
    failed --> cleanup
```

The metrics action owns its commit step, so it is told `output_action: pull-request` and opens the Automated
Update itself with `GITHUB_TOKEN`; a separate step force-merges it with the Owner Token
([ADR 0001](./docs/adr/0001-automated-updates-land-through-a-self-merging-pull-request.md)). A pull request
opened with `GITHUB_TOKEN` starts no workflow, so the required `zizmor` check never reports on it and the Force
Merge is the only way in. The head branch is deleted by the merge.

- **A dead plugin token gives a green run.** `plugins_errors_fatal: no` tells the action to draw a plugin's error
  into its section of the SVG and carry on, so a revoked Spotify, Steam, PageSpeed, Maps or WakaTime token, or a
  skyline page whose DOM changed, lands on `main` as an error panel with every check green. Only opening the
  detailed charts shows it.
- **A timeout ends the run cancelled, not failed.** The action creates `metrics-run-<run_id>` before it renders,
  and the render is the slow part, so a run that hits the 30-minute limit leaves that branch behind with no pull
  request on it. The cleanup step runs on `failure() || cancelled()` for that reason: it closes this run's pull
  request if there is one, then deletes every `metrics-run-*` branch that no open pull request uses, which also
  sweeps up anything an earlier run left.
- **A Force Merge that keeps failing**, for instance on an expired Owner Token, fails the run after its three
  tries, and the same cleanup closes the pull request.

### Star tracker

```mermaid
---
config:
  look: handDrawn
  layout: dagre
---
flowchart TD
    cron["Sunday cron, or manual"] --> tracker["github-star-tracker reads the stars<br/>of the Owner's public repositories<br/>with the Owner Token"]
    tracker --> branch["push data, charts, badge and README<br/>to star-tracker-data,<br/>as github-actions[bot]"]
    branch --> changed{"stars-changed?"}
    changed -->|no| done["run ends green"]
    changed -->|yes| mail["Send email report:<br/>the tracker's HTML report<br/>to MAIL_USERNAME over SMTP"]
```

`fbuireu/github-star-tracker` skips three repositories (`curriculum-vitae`, `email-signature`,
`hashnode-articles-backup`) and keeps its history on `star-tracker-data`: `stars-data.json` and `.csv`,
`stargazers.json`, `charts/*.svg`, `stars-badge.svg` and a `README.md` report. No Edition quotes any of it. The
charts drawn for the three skipped repositories before they were skipped are still on the branch; nothing
deletes them.

- **An expired Owner Token** fails the tracker: nothing is pushed and no email goes out.
- **A failed send** turns the run red after the branch has already been written, so that week's numbers are on
  the branch but not in the inbox.

### Followers

```mermaid
---
config:
  look: handDrawn
  layout: dagre
---
flowchart TD
    cron["Sunday cron, or manual"] --> fc["follower-change lists the followers<br/>of the account FOLLOWERS_NOTIFIER_TOKEN<br/>belongs to"]
    fc --> compare["compare with the newest snapshot artifact,<br/>then upload this run's list<br/>as the next snapshot"]
    compare --> notify{"shouldNotify?"}
    notify -->|"no change, or first run"| done["run ends green"]
    notify -->|yes| mail["Email me: follows and unfollows<br/>to MAIL_USERNAME over SMTP"]
```

The only Refresh that never touches the repository: its state is the snapshot it keeps as a workflow artifact,
and its output is an email.

- **A failed send loses that week's change.** The snapshot is uploaded before the email step, so the next run
  compares against it and the follows and unfollows that failed to send are never reported.
- **An expired `FOLLOWERS_NOTIFIER_TOKEN`** fails the run at the first step. The Owner Token is not involved.

## 3. The four Editions

Each Edition is a whole document, written and kept in step by hand
([ADR 0004](./docs/adr/0004-each-locale-is-a-whole-edition.md)). Nothing assembles them from a shared source: the
Authored Regions are copied across by whoever edits one, and the Refreshes fill each Edition's Generated Regions
separately, addressing it by file name and its regions by marker.

| Edition | Activity config | Activity step | WakaTime matrix entry |
| --- | --- | --- | --- |
| [`README.md`](./README.md), English, the Canonical Edition | [`en.config.yml`](./.github/config/github-activity/en.config.yml) | *Run recent activity (EN)* | `README.md` |
| [`README.ca.md`](./README.ca.md), Catalan | [`ca.config.yml`](./.github/config/github-activity/ca.config.yml) | *Run recent activity (CA)* | `README.ca.md` |
| [`README.es.md`](./README.es.md), Spanish | [`es.config.yml`](./.github/config/github-activity/es.config.yml) | *Run recent activity (ES)* | `README.es.md` |
| [`README.it.md`](./README.it.md), Italian | [`it.config.yml`](./.github/config/github-activity/it.config.yml) | *Run recent activity (IT)* | `README.it.md` |

The snake and the metrics Artefacts are single files that all four Editions quote by the same path, so one
Refresh updates every Edition at once.

The activity configs under [`.github/config/github-activity/`](./.github/config/github-activity) each name their
Edition (`readme_file`), the commit message for it (`commit_msg`) and the `Europe/Madrid` timezone, then the
activity lines. `en.config.yml` overrides only the `push` line, restated without a count (the `{AMOUNT}` gotcha in
[AGENTS.md](./AGENTS.md)), since English is otherwise the action's default; the other three translate all fifteen.

Adding a language, say `xx`, is this fixed set of edits, none of them optional:

1. Write `README.xx.md` as a whole Edition, with both pairs of markers spelt exactly as the others spell them.
2. Add its row to the Language Table in every Edition, with the pin only in its own.
3. Add its flag under [`assets/images/png/flags/`](./assets/images/png/flags).
4. Add `.github/config/github-activity/xx.config.yml`, with `readme_file: "./README.xx.md"`, its `commit_msg`, the
   timezone and all fifteen lines translated, the `push` one without `{AMOUNT}`.
5. Add a *Run recent activity (XX)* step to [`github-activity.yml`](./.github/workflows/github-activity.yml),
   the same pinned action pointed at that config. Without it the Edition's activity list never changes, and
   nothing fails to say so.
6. Add `README.xx.md` to the `readme` matrix in [`wakatime-stats.yml`](./.github/workflows/wakatime-stats.yml).
7. Add it to the *Surfaces* table in [AGENTS.md](./AGENTS.md) and to the table above.

## 4. Automation and checks

The `main` ruleset requires a pull request merged by squash, linear history, no approval, and three checks:
`Lint the pull request title` ([`commit-message.yml`](./.github/workflows/commit-message.yml)),
`Dependency Review` ([`dependency-review.yml`](./.github/workflows/dependency-review.yml)) and `zizmor`, the
code-scanning result of the findings [`zizmor.yml`](./.github/workflows/zizmor.yml) uploads. The admin role
bypasses it. CodeQL also runs, through GitHub's default setup rather than a workflow in the tree, and reports on
pull requests without being required.

What that gates is narrower than it looks. The activity and WakaTime Refreshes never open a pull request; the
snake's runs the checks and is force-merged without waiting; the metrics one starts no workflow at all (§2). The
checks gate Bot Updates and human pull requests, and nothing else.

### Bot Updates

```mermaid
---
config:
  look: handDrawn
  layout: dagre
---
flowchart TD
    renovate["Renovate: 1st and 15th,<br/>vulnerability alerts any time"] --> required
    dependabot["Dependabot:<br/>security updates only"] --> armer["dependabot-auto-merge.yml:<br/>approve and arm squash auto-merge<br/>with PAT, unless major"]
    armer --> required
    subgraph required["required checks"]
        lint["Lint the pull request title"]
        dr["Dependency Review"]
        zz["zizmor"]
    end
    required --> green{"all three pass?"}
    green -->|no| open["stays open"]
    green -->|yes| kind{"Update Type"}
    kind -->|"pin, digest, patch, minor,<br/>lock maintenance"| auto["GitHub's auto-merge,<br/>armed when it opened"]
    kind -->|major| owner["labelled major-update,<br/>waits for the Owner"]
    auto --> main["main"]
    owner --> main
```

Renovate opens the version updates on the 1st and 15th, and vulnerability updates at any time, and arms GitHub's
squash auto-merge on every Update Type its config lets through, so it needs no credential: the ruleset asks for
no approval. Dependabot has no `dependabot.yml`, so it opens only the security updates GitHub raises on its own,
and [`dependabot-auto-merge.yml`](./.github/workflows/dependabot-auto-merge.yml) approves and arms those with the
Owner Token, comments on a major instead, and labels each by type. A run started by a Dependabot pull request
reads only the repository's Dependabot secrets, so `PAT` has to be stored there as well as among the Actions
secrets; the token table in [AGENTS.md](./AGENTS.md#secrets-and-variables) says where every secret lives.

### The create-auto-merge-pr action

[`.github/actions/create-auto-merge-pr`](./.github/actions/create-auto-merge-pr/action.yml) is the one piece of
automation this repository writes itself. Its only caller is the snake Refresh, which references it as
`uses: $/.github/actions/create-auto-merge-pr`: the `$/` prefix resolves the path in this repository itself,
where `./` would resolve it in whatever the checkout left in the workspace. It is the one `uses:` in the tree
without a SHA pin, because there is no third party behind it to pin.

| Input | Default | What it does | The snake passes |
| --- | --- | --- | --- |
| `token` | `github.token` | Opens and merges the pull request; with the Owner Token the pull-request workflows run on it | `secrets.PAT` |
| `commit-message` | `docs: update repository assets` | The commit on the branch, and the subject of the squash | `docs: update snake grid animation` |
| `title` | `🤖 [AUTOMATED] Update Repository Assets` | The pull request title | `docs: update snake grid animation` |
| `branch` | `auto-update-<run_number>` | The head branch | `snake-animation-update-<run_number>` |
| `force-merge` | `'false'` | `'true'` merges with `--admin`; `'false'` arms `--auto` and waits for the checks; any other value merges nothing | `'true'` |
| `max-retries` | `'3'` | Attempts at the merge | `'5'` |
| `retry-delay` | `'10'` | Seconds between them | `'15'` |

It outputs `pull-request-number` and `pull-request-operation` (`created`, `updated` or `none`).

```mermaid
---
config:
  look: handDrawn
  layout: dagre
---
flowchart TD
    call["a Refresh calls it"] --> create["Create pull request:<br/>peter-evans/create-pull-request,<br/>continue-on-error"]
    create --> created{"succeeded?"}
    created -->|no| wait["Wait before retry: 45 s"]
    wait --> retry["Retry create pull request,<br/>the last chance"]
    created -->|yes| vars["Set PR vars"]
    retry --> vars
    vars --> number{"a pull request number?"}
    number -->|"no, nothing changed"| stop["ends, nothing to merge"]
    number -->|yes| ready["Wait for PR to be ready: 5 s"]
    ready --> mode{"force-merge?"}
    mode -->|"'false'"| automerge["Auto-merge PR:<br/>arm squash auto-merge, retried"]
    mode -->|"'true'"| admin["Force merge with admin privileges:<br/>undraft if needed, admin squash merge,<br/>retried"]
    automerge --> main["main"]
    admin --> main
```

The body it writes on every pull request says the pull request *will be auto-merged if all checks pass*, which
is true only of the `--auto` path; its one caller takes the other.

## 5. Decision records

The documents above are **what** and **how**. [docs/adr/](./docs/adr/) is **why**:

| ADR | Decision |
| --- | --- |
| [0001](./docs/adr/0001-automated-updates-land-through-a-self-merging-pull-request.md) | Automated updates land through a pull request that merges itself |
| [0002](./docs/adr/0002-workflows-act-as-the-owner.md) | Workflows act as the Owner, not as GitHub's workflow identity |
| [0003](./docs/adr/0003-third-party-actions-are-pinned-to-commit-shas.md) | Third-party actions are pinned to commit SHAs |
| [0004](./docs/adr/0004-each-locale-is-a-whole-edition.md) | Each locale is a whole Edition, not a generated translation |

Every one of them follows [0000, the template](./docs/adr/0000-adr-template.md): `# N. Title`, a date, a status,
then *Context*, *Decision*, *Consequences*. A new ADR starts by copying that file and adds its row here.
