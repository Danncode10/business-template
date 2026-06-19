---
description: Auto-detect which DannFlow version this project is on and pull the latest updates from upstream. Creates dannflow.json if missing. The smart entry point for keeping any DannFlow-based project up to date.
argument-hint: (optional --init to force-create dannflow.json from scratch)
---

# /update-dannflow

The smart, zero-config entry point for updating a DannFlow-based project.

- Auto-detects `dannflow.json` to find your current version anchor
- If missing, creates one by detecting the upstream remote or asking the user
- Shows a changelog of what's new in DannFlow since your last sync
- Delegates to `/sync-upstream` for the actual file-level update

Use this instead of `/sync-upstream` when you just want to say "make my project current."

---

## Step 1 — Detect project state

Run these in parallel:

```bash
cat dannflow.json 2>/dev/null || echo "MISSING"
git remote get-url upstream 2>/dev/null || echo "NO_UPSTREAM"
git remote get-url origin 2>/dev/null || echo "NO_ORIGIN"
```

**Decision tree:**

| dannflow.json | upstream remote | Action |
|---|---|---|
| Exists | Exists | Normal update flow (Step 2) |
| Missing | Exists | Init flow — create dannflow.json (Step 1b) |
| Missing | Missing | Ask user for DannFlow repo URL (Step 1c) |

---

### Step 1b — Init flow (dannflow.json missing, upstream exists)

The project has an upstream remote but no version anchor. Find the closest matching commit:

```bash
git fetch upstream --quiet
# Find the most recent upstream commit that exists in this project's history
git log --oneline upstream/main | head -20
```

Because forked-and-rewritten projects have no shared history, we can't find an exact match. Instead:

1. Show the user the 10 most recent upstream commits:
   ```bash
   git log upstream/main --oneline -10 --no-merges
   ```
2. Ask: "Which commit did you last sync from? Enter a SHA, or press Enter to use the current upstream HEAD (safest if you're not sure)."
3. Use their answer (or upstream HEAD) as `dannflow_commit`.
4. Write `dannflow.json`:
   ```json
   {
     "dannflow_commit": "<chosen or upstream/main SHA>",
     "synced_at": "<ISO timestamp now>",
     "repo": "<git remote get-url upstream>"
   }
   ```
5. Tell the user: "Created dannflow.json with base commit `<sha>`. Commit this file to lock in your version anchor."
6. Proceed to Step 2.

---

### Step 1c — Full init (nothing exists)

No upstream remote and no dannflow.json — this may not be a DannFlow project, or it was set up manually.

1. Ask: "What is the DannFlow repo URL? (default: https://github.com/Danncode10/DannFlow)"
2. Add the remote:
   ```bash
   git remote add upstream <url>
   git fetch upstream --quiet
   ```
3. Continue with Step 1b.

---

## Step 2 — Read version anchor

Parse `dannflow.json`:
- `dannflow_commit` — the SHA you last synced from
- `synced_at` — when you last synced
- `repo` — the upstream DannFlow repo

Show a one-line status:
```
DannFlow version anchor: <short-sha> (synced <synced_at>)
Upstream repo: <repo>
```

---

## Step 3 — Fetch and compare

```bash
git fetch upstream --quiet
UPSTREAM_SHA=$(git rev-parse upstream/main)
```

Check if already up to date:
```bash
git log <dannflow_commit>..<UPSTREAM_SHA> --oneline --no-merges
```

- **0 commits:** Tell the user "Your project is already up to date with DannFlow. Nothing to sync." and exit.
- **N commits:** Show the changelog:

```
📦 DannFlow Changelog — <short-base-sha>..<short-upstream-sha>
N new commits since your last sync (<synced_at>):

  abc1234  feat(commands): add /update-dannflow command
  def5678  fix(sync): handle missing upstream remote gracefully
  ghi9012  chore(docs): update sync-upstream preflight steps
  ...

Affected areas: .claude/commands/, SKILLS.md
```

Generate the affected areas summary:
```bash
git diff --name-only <dannflow_commit> upstream/main -- \
  .claude/commands/ .claude/agents/ .github/ SKILLS.md CLAUDE.md AGENTS.md \
  guide.sh docs/dannflow_docs/ scripts/ src/prompts/features/
```

---

## Step 4 — Confirm and delegate

Ask:
```
Apply these updates to your project? (y/n)
- y → runs /sync-upstream in file-level mode, scoped to changed paths
- n → exit (dannflow.json is NOT updated until you actually sync)
```

If confirmed, invoke `/sync-upstream` behavior directly (file-level mode, using the changed paths from Step 3 as the scan scope — no need to scan everything).

After sync completes and the user approves the changes, update `dannflow.json`:
```json
{
  "dannflow_commit": "<new upstream/main SHA>",
  "synced_at": "<ISO timestamp now>",
  "repo": "<repo from existing dannflow.json>"
}
```

Tell the user:
```
✓ Updated dannflow.json → now tracking DannFlow at <new-short-sha>
Commit this file along with your synced changes:
  git add dannflow.json <synced files>
  git commit -m "chore(sync): update DannFlow to <new-short-sha>"
```

---

## --init flag

If the user passes `--init`, skip Steps 2-4 and go straight to Step 1b/1c to force-recreate `dannflow.json`. Useful when:
- The file got corrupted or accidentally deleted
- The user wants to re-anchor to a specific commit
- Setting up a project that was cloned without the file

---

## Safety rules

- **Never** update `dannflow.json` without the user approving the sync first. The anchor is only meaningful if it matches what was actually applied.
- **Never** auto-commit `dannflow.json` — always show the commit message suggestion and let the user run it.
- If `git status` shows a dirty working tree at the start, refuse and tell the user to commit or stash first.
- Validate that `dannflow_commit` is a real SHA before using it:
  ```bash
  git cat-file -t <dannflow_commit>
  ```
  If it's not found locally, run `git fetch upstream` first — the commit may not be in local history yet.

---

## See also

- `/sync-upstream` — lower-level sync with full file-by-file control
- `/sync-to-upstream` — contribute your improvements back to DannFlow
- `/sync-commands` — audit which commands are documented vs. orphaned
