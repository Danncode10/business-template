---
description: Pull selective updates from DannFlow upstream. Reads dannflow.json to know your base commit. File-level diff is the default — commit-level cherry-pick is opt-in.
---

# /sync-upstream

Pull selective updates from the DannFlow upstream repo without merging or rebasing. The user's project has rewritten git history (via `guide.sh init`), so **there is no common ancestor with `upstream/main`** — a normal `git merge upstream/main` would be a disaster. This command works around that.

> **Version-aware:** This command reads `dannflow.json` at the project root to know which DannFlow commit you last synced from, so it can show you only what's new since then.

> **Branch flow (the "serving plate stays clean" rule).** Synced changes do **not** land on whatever branch you're standing on. They land on a fresh `feat/sync-upstream-<short-sha>` branch and open a **PR into `dev`** (the `dev_branch` from `dannflow.json`). That routes every synced change through the same CI gate as your own work, so `main` is never touched directly. `dev → main` stays a normal PR you open after eyeballing CI. If the repo has no `dev` branch yet, it hasn't been adopted — tell the user to run `/adopt-dannflow` first.

**Two modes** — file-level is the default and recommended:

| Mode | When to use |
|---|---|
| **File-level (default)** | "Has DannFlow added new commands, skills, scripts, or docs I'm missing?" Safest for forked-and-rewritten repos. |
| **Commit-level (opt-in)** | User explicitly wants to inspect upstream commits and cherry-pick one. Expect conflicts. |

## Argument parsing

The user invokes this command with optional args:

- `/sync-upstream` → file-level mode, scan default paths (see below)
- `/sync-upstream <path>` → file-level mode, scoped to that path (file or dir)
- `/sync-upstream --commits` → commit-level mode (list commits, let user pick)
- `/sync-upstream --commits <N>` → commit-level mode, show last N commits

## Preflight (always run first)

1. **Read `dannflow.json`** to get the base commit:
   ```bash
   cat dannflow.json
   ```
   - If the file is missing, warn:
     ```
     ⚠️ No dannflow.json found. This project has no version anchor.
     Run /update-dannflow to create one before syncing.
     ```
     and stop.
   - Extract `dannflow_commit` (the SHA you last synced from) and `repo` (the upstream URL).
   - Show the user: `Last synced from DannFlow commit: <sha> on <synced_at>`

2. Verify `upstream` remote exists and matches `dannflow.json`'s `repo`:
   ```bash
   git remote get-url upstream
   ```
   - If missing, instruct the user:
     ```
     git remote add upstream <repo from dannflow.json>
     ```
     and stop.
   - If it exists but doesn't match the `repo` field in `dannflow.json`, warn: "upstream remote points to a different repo than dannflow.json expects. Confirm before continuing."

3. Fetch latest upstream (quiet — output is noisy):
   ```bash
   git fetch upstream --quiet
   ```

4. Confirm `upstream/main` exists:
   ```bash
   git rev-parse --verify upstream/main
   ```
   If it doesn't, fall back to whatever default branch upstream has (`git remote show upstream | grep 'HEAD branch'`).

5. **Show commit changelog** — what's new in upstream since your `dannflow_commit`:
   ```bash
   git log <dannflow_commit>..upstream/main --oneline --no-merges
   ```
   If there are no new commits, tell the user: "You're already up to date with DannFlow (at commit <sha>)." and exit.

---

## Mode A — File-level diff (DEFAULT)

This is the right mode for a forked-and-rewritten project. We're asking *"which upstream files are newer or different from mine, and which do I want to copy?"* — not merging history.

### Default scan paths

If the user didn't pass a path, scan these (in this order):

```
.claude/commands/
.claude/agents/
.github/
SKILLS.md
CLAUDE.md
AGENTS.md
PROJECT_CONTEXT.md
guide.sh
docs/dannflow_docs/
scripts/
src/prompts/features/
```

**Never auto-touch:** `src/app/`, `src/components/`, `src/services/`, `src/lib/config.ts`, `.env*`, `package.json`, `package-lock.json`, `supabase/`, `public/`, `next.config.ts`, `tsconfig.json`. The user's app code lives here — copying upstream over it would destroy their work. If the user explicitly passes one of these as a path arg, allow it but warn loudly first.

**Project-tuned — diff-only, never auto-pull:** `.github/workflows/ci.yml`. This file was rewritten by `/adopt-dannflow` to match *this* project's package manager, Node version, and scripts. Blindly copying upstream's generic version over it would break the CI gate (and once CI is a required check, that blocks every merge). If it differs from upstream, only ever **show the diff** and let the user hand-merge — never `git checkout upstream/main` over it. The rest of `.github/` (PR template, dependabot) is fine to sync normally.

### Procedure

1. **Build a change report** for the scanned paths:
   ```bash
   # For each scanned dir/file, compare working tree vs upstream/main
   git diff --stat HEAD upstream/main -- <path>
   git diff --name-status HEAD upstream/main -- <path>
   ```

2. **Categorize each file** in the diff into one of:
   - 🆕 **NEW upstream** — file exists in `upstream/main` but not locally
   - ✏️ **MODIFIED** — file exists in both, content differs
   - 🗑️ **DELETED upstream** — file exists locally but upstream removed it (rare; usually means it was renamed)

3. **Present a table** to the user:

   ```
   File-level diff: HEAD vs upstream/main

   #   Status      Path                                    +/-
   1   🆕 NEW      .claude/commands/foo.md                 +120
   2   ✏️ MODIFIED .claude/commands/commit.md              +14 / -3
   3   ✏️ MODIFIED SKILLS.md                                +40 / -2
   4   🆕 NEW      docs/dannflow_docs/new-thing.md          +88
   5   🗑️ DELETED  .claude/commands/old.md                   -50
   ```

4. **Ask the user which to pull**, accepting:
   - Numbers: `1,3,5` or `1-3`
   - `all`
   - `none` / `q` to quit
   - For each modified file, also offer `view N` to show the diff before deciding

5. **Create the landing branch first**, off the project's `dev` branch — so synced changes ride the CI gate instead of landing loose on `main`:
   ```bash
   UPSTREAM_SHA=$(git rev-parse upstream/main)
   SHORT_SHA=$(git rev-parse --short upstream/main)
   DEV_BRANCH=$(node -p "require('./dannflow.json').dev_branch || 'dev'")
   git rev-parse --verify "$DEV_BRANCH" >/dev/null 2>&1 || { echo "No '$DEV_BRANCH' branch — run /adopt-dannflow first."; exit 1; }
   git checkout -b "feat/sync-upstream-$SHORT_SHA" "$DEV_BRANCH"
   ```

6. **Apply the user's choices** onto that branch, file by file:
   - 🆕 NEW: `git checkout upstream/main -- <path>` (creates the file locally)
   - ✏️ MODIFIED:
     - First show `git diff HEAD upstream/main -- <path>` so user sees what changes
     - Ask: replace entirely (`git checkout upstream/main -- <path>`), merge manually, or skip
     - If "merge manually": copy upstream version to `<path>.upstream` next to the local file so user can diff them in their editor
   - 🗑️ DELETED: just inform the user — do NOT delete their local file unless they explicitly say to

7. **Update `dannflow.json`** with the new upstream HEAD SHA, preserving the existing branch fields:
   ```json
   {
     "dannflow_commit": "<new upstream/main SHA>",
     "synced_at": "<ISO timestamp>",
     "repo": "<repo from existing dannflow.json>",
     "base_branch": "<base_branch from existing dannflow.json, default main>",
     "dev_branch": "<dev_branch from existing dannflow.json, default dev>"
   }
   ```
   Tell the user: "Updated dannflow.json: now tracking DannFlow at `<new sha>`"

8. **Commit on the sync branch** with provenance trailers (see the canonical spec in `/adopt-dannflow`). Stage only the touched files plus `dannflow.json` — never `git add -A`:
   ```
   chore(sync): pull upstream updates to .claude/commands/ and SKILLS.md

   DannFlow-Action: sync-upstream
   DannFlow-Source: Danncode10/DannFlow@<UPSTREAM_SHA>

   Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
   ```
   The subject describes *what files changed*; the trailers record *which template commit it came from*. The `DannFlow-Source` SHA must match `dannflow.json`'s `dannflow_commit`.

9. **Open a PR into `dev`** (use the GitHub MCP / `gh pr create`), so CI gates the synced changes. Ask before pushing. Stop here — do **not** auto-merge to `main`; that promotion is a human checkpoint after CI goes green:
   ```bash
   git push -u origin "feat/sync-upstream-$SHORT_SHA"
   gh pr create --base "$DEV_BRANCH" --head "feat/sync-upstream-$SHORT_SHA" \
     --title "chore(sync): DannFlow @$SHORT_SHA" --body "Synced from Danncode10/DannFlow@$SHORT_SHA"
   ```
   If `gh` is unavailable, fall back to leaving the committed branch and printing the compare URL.

### Safety rules for file-level mode

- **Never** `git checkout upstream/main -- .` (whole tree). Always scoped paths.
- **Never** land synced changes directly on `main` or `dev`. Always the `feat/sync-upstream-<sha>` branch → PR into `dev`. If there's no `dev` branch, stop and point the user to `/adopt-dannflow`.
- **Never** auto-merge the sync PR to `main` — that promotion is a human checkpoint after CI passes.
- **Never** `git checkout upstream/main` over `.github/workflows/ci.yml` — diff-only (it's project-tuned).
- **Never** auto-overwrite a modified file without showing the diff first.
- If a target file has uncommitted local changes (`git status --porcelain <path>` is non-empty), warn and require explicit confirmation before overwriting.
- After every checkout, stage only what was touched — never use `git add -A`.

---

## Mode B — Commit-level cherry-pick (OPT-IN: `--commits`)

For when the user explicitly wants to see upstream commits and pick one. **Expect conflicts** — there's no common ancestor.

### Procedure

1. List recent upstream commits (default 20, or `<N>` from args):
   ```bash
   git log upstream/main --oneline -n 20 --no-merges
   ```

2. For each commit, also show the files it touched (`git show --stat <sha> --format=`) so the user can judge relevance before picking.

3. Ask user to pick one or more SHAs.

4. For each picked SHA, run:
   ```bash
   git cherry-pick -x <sha>
   ```
   - `-x` adds a "(cherry picked from commit ...)" trailer so provenance is recorded.

5. **If cherry-pick conflicts** (likely):
   - Show `git status` so the user sees the conflicted files
   - Offer three options:
     - **Resolve manually** — leave them in conflict state, instruct on `git add` + `git cherry-pick --continue`
     - **Abort** — `git cherry-pick --abort`
     - **Take theirs (upstream version) for specific files** — `git checkout --theirs <path> && git add <path>`
   - Do NOT auto-resolve.

6. After all cherry-picks complete (or abort), summarize what landed.

### Safety rules for commit-level mode

- **Never** cherry-pick multiple commits without confirming each one.
- If a commit touches files in the "never auto-touch" list above (`src/app/`, `package.json`, etc.), warn before cherry-picking.
- Never run `git cherry-pick --continue` automatically — let the user do it after they resolve.

---

## Output style

- Be concise. Tables and short prompts beat walls of text.
- Always show file paths and SHAs verbatim (never abbreviate truncated forms).
- After any operation, end with a one-line conventional commit suggestion for `/commit` to use.

## When to refuse

- If `git status` shows a dirty working tree at start, refuse and tell the user to commit or stash first. Sync over uncommitted work is too easy to lose.
- If `upstream` points anywhere other than the DannFlow repo, warn and ask the user to confirm before proceeding.

---

## See also

- `/sync-to-upstream` — the **reverse** flow: contribute your local improvements back to the DannFlow upstream repo.
