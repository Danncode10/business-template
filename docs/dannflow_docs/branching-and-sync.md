# Branching & Sync — Keeping Every Repo Clean

This is how a DannFlow project stays safe to ship and stays in sync with the template, without anyone ever breaking `main`.

## The kitchen model

Think of **DannFlow** as a master recipe book. It's always clean. Nobody cooks *in* it — you only copy recipes *out* of it. Each of your **projects** is a separate kitchen that started by photocopying that book.

There are only **two relationships** to understand, and they have different rules:

1. **Inside one project** — how you cook safely: `feat/* → dev → main`.
2. **Between a project and DannFlow** — how recipes are copied: file-by-file, because the histories are unrelated.

Keep these separate in your head and everything else follows.

---

## 1. Inside a project: `feat → dev → main`

Every adopted project has three "counters":

| Branch | Role |
|---|---|
| `feat/...` | Prep counter — you chop and experiment here. Messy is fine. |
| `dev` | Tasting counter — changes are combined and CI-checked here. |
| `main` | The serving plate — only finished, CI-passed work lands here. |

Work always flows **prep → tasting → plate**. The **CI safety-check (`.github/workflows/ci.yml`)** runs at each promotion, so nothing reaches `main` un-checked. Branch protection on `main` (and optionally `dev`) enforces this — you can't push straight to the plate.

> ⚠️ Because CI is a **required check**, a broken `ci.yml` blocks *every* merge. That's why `/adopt-dannflow` proves the workflow passes before turning it into a required check, and why `ci.yml` is tuned per-project (your package manager, Node version, and the scripts that actually exist).

**DannFlow itself needs only `main` + short-lived `feat/*`** — no `dev`. Nobody develops features into the template; its only inbound is contributions (below), which arrive as PRs into `main` and are gated by its own CI. That's what keeps the master book spotless.

---

## 2. Between a project and DannFlow: copying recipes

Your project has **rewritten git history** (from `guide.sh init`), so it shares **no common ancestor** with DannFlow. A normal `git merge`/PR across that boundary is impossible. Instead, DannFlow commands copy **individual files** and track versions with a small label file.

### The version label: `dannflow.json`

```json
{
  "dannflow_commit": "<the DannFlow commit you last synced from>",
  "synced_at": "<ISO timestamp>",
  "repo": "https://github.com/Danncode10/DannFlow",
  "base_branch": "main",
  "dev_branch": "dev"
}
```

This file is the anchor every sync reads and updates. If `dannflow.json` is missing, the repo was never adopted — run `/adopt-dannflow`.

### The three commands

| Command | Direction | What it does |
|---|---|---|
| **`/adopt-dannflow`** | setup (once) | Installs `ci.yml` (and proves it green), writes `dannflow.json`, creates `dev`, then runs the first sync. Turns a non-DannFlow repo into a first-class one. |
| **`/sync-upstream`** | DannFlow → project | Copies new template files in. Lands them on `feat/sync-upstream-<sha>` and opens a PR into `dev` — so synced changes ride the same CI gate. Never touches `main` directly. |
| **`/sync-to-upstream`** | project → DannFlow | Copies a generic improvement back up via a clean clone → `feat/*` branch → PR into DannFlow `main`. |

**Decision rule:** no `dannflow.json` → `/adopt-dannflow`. Has it → `/sync-upstream` to update, `/sync-to-upstream` to contribute.

---

## Provenance: how we record where a change came from

Every command that moves files records **machine-readable provenance** as git *trailers* (`Key: Value` lines at the bottom of the commit message). The subject line still says *what changed*; the trailers say *where it came from*.

| Trailer | Used by | Value |
|---|---|---|
| `DannFlow-Action:` | all | `adopt` \| `sync-upstream` \| `contribute` |
| `DannFlow-Source:` | adopt, sync-upstream | `Danncode10/DannFlow@<sha>` — template commit pulled FROM |
| `DannFlow-Origin:` | sync-to-upstream | `<repo>@<sha>` — project commit the change came FROM |

Example sync commit:
```
chore(sync): pull upstream updates to .claude/commands/ and SKILLS.md

DannFlow-Action: sync-upstream
DannFlow-Source: Danncode10/DannFlow@a1b2c3d
```

Why trailers instead of writing it in the subject:
- The subject stays a real description ("added X"), not "ran a command".
- It's searchable: `git log --grep "DannFlow-Action: sync-upstream"` finds every sync.
- The `DannFlow-Source` SHA matches `dannflow.json`, so your version is recoverable from git history even if the label file is deleted.

---

## What's safe to sync (and what's never touched)

`/sync-upstream` only ever copies **template files** — commands, agents, docs, scripts, blueprints. It **never** auto-touches your app code (`src/app/`, `src/services/`, `src/components/`, `config.ts`, `package.json`, `supabase/`, env files, etc.).

One special case: **`.github/workflows/ci.yml` is diff-only, never auto-pulled.** It's tuned to *your* project; overwriting it with the generic template version would break your CI gate. The command shows you the diff and lets you hand-merge.

---

## See also

- [backups-and-sync.md](backups-and-sync.md) — the database checkpoint / type-sync loop.
- [claude-workflow.md](claude-workflow.md) — the full daily command loop.
- `/adopt-dannflow`, `/sync-upstream`, `/sync-to-upstream`, `/update-dannflow` — the commands themselves.
