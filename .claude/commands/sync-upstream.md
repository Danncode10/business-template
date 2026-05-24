---
description: Pull selective updates from DannFlow upstream. File-level diff is the default — commit-level cherry-pick is opt-in.
---

# /sync-upstream

Pull selective updates from the DannFlow upstream repo without merging or rebasing. The user's project has rewritten git history (via `guide.sh init`), so **there is no common ancestor with `upstream/main`** — a normal `git merge upstream/main` would be a disaster. This command works around that.

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

1. Verify `upstream` remote exists:
   ```bash
   git remote get-url upstream
   ```
   - If missing, instruct the user:
     ```
     git remote add upstream https://github.com/Danncode10/DannFlow.git
     ```
     and stop.

2. Fetch latest upstream (quiet — output is noisy):
   ```bash
   git fetch upstream --quiet
   ```

3. Confirm `upstream/main` exists:
   ```bash
   git rev-parse --verify upstream/main
   ```
   If it doesn't, fall back to whatever default branch upstream has (`git remote show upstream | grep 'HEAD branch'`).

---

## Mode A — File-level diff (DEFAULT)

This is the right mode for a forked-and-rewritten project. We're asking *"which upstream files are newer or different from mine, and which do I want to copy?"* — not merging history.

### Default scan paths

If the user didn't pass a path, scan these (in this order):

```
.claude/commands/
.claude/agents/
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

5. **Apply the user's choices**, file by file:
   - 🆕 NEW: `git checkout upstream/main -- <path>` (creates the file locally)
   - ✏️ MODIFIED:
     - First show `git diff HEAD upstream/main -- <path>` so user sees what changes
     - Ask: replace entirely (`git checkout upstream/main -- <path>`), merge manually, or skip
     - If "merge manually": copy upstream version to `<path>.upstream` next to the local file so user can diff them in their editor
   - 🗑️ DELETED: just inform the user — do NOT delete their local file unless they explicitly say to

6. **After applying**, run `git status` and show what changed. Do NOT auto-commit. End with a suggested conventional commit message, e.g.:
   ```
   chore(sync): pull upstream updates to .claude/commands/ and SKILLS.md
   ```

### Safety rules for file-level mode

- **Never** `git checkout upstream/main -- .` (whole tree). Always scoped paths.
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
