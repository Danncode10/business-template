---
description: Bootstrap an existing repo into a first-class DannFlow project. Installs CI (and proves it passes), creates the dannflow.json version anchor, sets up the dev/feat branch flow, then runs the first sync from upstream.
argument-hint: (optional --no-protect to skip branch protection, --force to re-adopt)
---

# /adopt-dannflow

Turn a repo that was **never born from DannFlow** into a first-class DannFlow project — one that `/sync-upstream` and `/sync-to-upstream` can manage forever after.

Run this **once** per repo. If `dannflow.json` already exists, the repo is already adopted — use `/sync-upstream` instead.

> **Mental model.** DannFlow is the master template ("recipe book"). This command walks into a messy kitchen and installs the basics: the CI safety-check, the version label (`dannflow.json`), and the `dev` / `feat` branch counters. Its last step pulls the recipes in for the first time via `/sync-upstream`.

## What it does (in order)

1. **Preflight** — confirm clean tree, a GitHub repo, and that we're not already adopted.
2. **Detect project shape** — package manager, Node version, which npm scripts exist.
3. **Install CI** — drop in an auto-adjusted `ci.yml` **and prove it passes** before relying on it.
4. **Create the version anchor** — `dannflow.json` pointing at the current DannFlow commit.
5. **Set up the branch flow** — create `dev`, optionally protect `main`.
6. **First sync** — hand off to `/sync-upstream` to pull the template in.
7. **Commit** — with provenance trailers (see the spec at the bottom of this file).

---

## Argument parsing

- `/adopt-dannflow` → full adoption flow
- `/adopt-dannflow --no-protect` → do everything, but skip setting GitHub branch protection (create branches only)
- `/adopt-dannflow --force` → re-run even if `dannflow.json` already exists (re-anchor / repair)

---

## Step 0 — Preflight (always run first)

Run these in parallel:

```bash
git rev-parse --is-inside-work-tree 2>/dev/null || echo "NOT_A_REPO"
git status --porcelain
git remote get-url origin 2>/dev/null || echo "NO_ORIGIN"
cat dannflow.json 2>/dev/null || echo "NO_ANCHOR"
gh auth status 2>&1 | head -1 || echo "NO_GH"
```

Refuse and stop if:
- **Not a git repo** → tell the user to `git init` and push to GitHub first.
- **Dirty working tree** → tell the user to commit or stash first. Adoption touches several files; we don't want to mix it with unrelated work.
- **No `origin`** → adoption sets up a PR/CI flow, which needs a GitHub remote. Tell the user to create the repo on GitHub and `git remote add origin ...` first.
- **`dannflow.json` already exists** and `--force` was NOT passed → this repo is already adopted. Say: *"Already adopted (tracking DannFlow at `<sha>`). Use `/sync-upstream` to update, or `/adopt-dannflow --force` to re-anchor."* and stop.

If `gh` is not authenticated, warn that branch protection and PR creation will be skipped, and continue in a degraded (local-only) mode.

---

## Step 1 — Detect project shape (for auto-adjust)

The CI template must match the real project, so detect — **don't assume**:

```bash
# Package manager (first lockfile wins)
ls pnpm-lock.yaml yarn.lock package-lock.json bun.lockb 2>/dev/null

# Node version
cat .nvmrc 2>/dev/null; node -p "require('./package.json').engines?.node || ''" 2>/dev/null

# Which scripts actually exist
node -p "Object.keys(require('./package.json').scripts || {}).join(', ')" 2>/dev/null
```

Record:
- **pm** → `pnpm` | `yarn` | `npm` | `bun` (default `npm` if no lockfile)
- **node** → from `.nvmrc` / `engines.node`, else default to the LTS the template ships (`20`)
- **scripts** → the set actually present (`build`, `lint`, `typecheck`, `test`, …)

> ⚠️ **The auto-adjust trap.** Only emit CI steps whose scripts truly exist. A `lint` job that calls a missing `npm run lint` will fail forever — and once CI is a required check, **a broken workflow means nothing can ever merge.** When in doubt, leave a step out.

---

## Step 2 — Install CI and PROVE it passes

1. Read the template workflow from upstream (`.github/workflows/ci.yml`) — fetch it via the upstream remote (added in Step 3 if missing) or from `https://github.com/Danncode10/DannFlow`.
2. Rewrite it for the detected shape:
   - swap install/cache steps to the detected **pm**
   - set the **node** version
   - include only the jobs whose **scripts** exist
3. Write it to `.github/workflows/ci.yml`. If one already exists, **do not overwrite** — show a diff and ask (keep theirs, replace, or write `ci.dannflow.yml` alongside).
4. **Prove it green BEFORE relying on it.** Run each referenced script locally:
   ```bash
   <pm> install
   <pm> run build      # only the scripts that exist
   <pm> run lint
   <pm> run typecheck
   ```
   - If any fails, **stop before enabling branch protection** and report exactly which script failed. A required check that can't pass bricks the repo.
   - If all pass, continue.

---

## Step 3 — Create the version anchor (`dannflow.json`)

1. Ensure the `upstream` remote exists:
   ```bash
   git remote get-url upstream 2>/dev/null || git remote add upstream https://github.com/Danncode10/DannFlow.git
   git fetch upstream --quiet
   UPSTREAM_SHA=$(git rev-parse upstream/main)
   ```
2. Write `dannflow.json` at the repo root (note the **new fields** for the branch flow):
   ```json
   {
     "dannflow_commit": "<UPSTREAM_SHA>",
     "synced_at": "<ISO timestamp now>",
     "repo": "https://github.com/Danncode10/DannFlow",
     "base_branch": "main",
     "dev_branch": "dev"
   }
   ```
   Tell the user this file is the "version label" — every future sync reads and updates it.

---

## Step 4 — Set up the branch flow

The project's own counters: `feat/* → dev → main`.

1. Create `dev` off `main` if missing:
   ```bash
   git rev-parse --verify dev 2>/dev/null || git branch dev main
   git push -u origin dev
   ```
2. **Branch protection** (skip if `--no-protect` or no `gh`): require the CI check on `main` (and optionally `dev`) so nothing reaches the serving plate un-checked. Use the GitHub MCP / `gh api`. Confirm with the user before applying — this needs admin scope.
3. Do **not** pre-create `feat/*` branches — those are made on demand (the next step makes the first one).

---

## Step 5 — First sync (hand off to `/sync-upstream`)

Run `/sync-upstream` behavior to pull the template in for the first time. It lands changes on a `feat/sync-...` branch and opens a PR into `dev` (see that command). This is the "first grocery run."

---

## Step 6 — Commit with provenance

Stage only what adoption created (`.github/workflows/ci.yml`, `dannflow.json`, and any synced template files), then commit with the trailer spec below:

```
chore: adopt DannFlow conventions (CI, version anchor, branch flow)

DannFlow-Action: adopt
DannFlow-Source: Danncode10/DannFlow@<UPSTREAM_SHA>

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
```

---

## DannFlow provenance trailer spec (canonical — referenced by the other sync commands)

Every DannFlow command that moves files between a project and the template records **machine-readable provenance** as git trailers (`Key: Value` lines at the *bottom* of the commit message). The subject line still describes **what changed**; the trailers describe **where it came from**.

| Trailer | Used by | Value |
|---|---|---|
| `DannFlow-Action:` | all | `adopt` \| `sync-upstream` \| `contribute` |
| `DannFlow-Source:` | adopt, sync-upstream (incoming) | `Danncode10/DannFlow@<sha>` — the template commit pulled FROM |
| `DannFlow-Origin:` | sync-to-upstream (outgoing) | `<repo>@<sha>` — the project commit the change came FROM |

Rules:
- **Never** put "ran <command>" in the subject line — the subject says what changed. A computer can find the rest with `git log --grep "DannFlow-Action: sync-upstream"`.
- **Never** record the redundant "ran in this repo" — the commit already lives here. Record the **cross-repo link + SHA**, which is the part git history can't otherwise recover.
- The SHA in `DannFlow-Source:` should match `dannflow.json`'s `dannflow_commit`, so the anchor is recoverable from history if the file is lost.

---

## Safety rules

- **Refuse on a dirty tree.** Adoption touches multiple files; never mix with uncommitted work.
- **Never enable branch protection before CI is proven green** — a required check that can't pass makes the repo un-mergeable.
- **Never overwrite an existing `ci.yml`** without showing a diff and asking.
- **Never** force-push or rewrite `main`. Adoption only adds branches and files.
- If anything in Steps 1–4 fails, stop and report — do not continue to branch protection or sync on a half-set-up repo.

---

## See also

- `/sync-upstream` — keep an adopted project current (run forever after).
- `/sync-to-upstream` — contribute your improvements back up to DannFlow.
- `/update-dannflow` — smart entry point that auto-detects version and updates.
