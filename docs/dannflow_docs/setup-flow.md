# DannFlow Setup Flows

This document covers every path from "fresh start" to "fully Claude-configured project." Three flows: new project, update, and migrating an existing project.

---

## Flow 1 — New Project

**Trigger:** `curl -sSL https://raw.githubusercontent.com/Danncode10/DannFlow/main/install.sh | bash`

What `install.sh` does automatically:
1. Clones DannFlow → installs npm deps → copies `.env.example` → `.env.local`
2. Installs Ruflo globally + registers its MCP server with Claude Code
3. Runs `npx ruflo@latest init wizard` (agent hooks, session config)
4. Downloads all 8 skill packs (design taste, quality, SEO/marketing)
5. Runs `./guide.sh init` (rebrand + Git history reset)

**What you do after install (in Claude Code):**

```
Step 1 — Edit README.md
  Rewrite the intro to describe YOUR project.
  Update feature table and project structure.
  Don't polish it — Claude reads it raw.

Step 2 — Run /init-claude
  Reads README + package.json + src/.
  Rewrites:
    CLAUDE.md          ← Claude's project config
    SKILLS.md          ← which skills are relevant
    .claude/commands/  ← commands tailored to your stack

Step 3 — Fill in PROJECT_CONTEXT.md
  Add: audience, stack decisions, design rules, anti-decisions.
  Skills and commands read this file.
  Never edit skill files directly — put project context here.

Step 4 — Run /ruflo-upgrade
  Adds memory + parallel-agent patterns to 12 core commands.
  Safe to re-run after any /init-update.

Step 5 — Run /no-conflict
  Verifies all docs and code are in sync.
  Fix any drift before you start building.
```

**Total time:** ~5 minutes. After that, `/ask-command <what you want>` to start building.

---

## Flow 2 — Update Existing DannFlow Project

**Trigger:** `/init-update` in Claude Code (or `./guide.sh init-update` equivalent)

What `/init-update` does:
- Pulls latest commands, guide.sh, npm scripts, docs from the DannFlow repo
- Shows diffs and asks per-category before applying
- Checks ruflo memory for customizations before overwriting (Step 0)

**What you do after update:**

```
Step 1 — Run /ruflo-upgrade
  /init-update may have regenerated command files, wiping Ruflo patterns.
  /ruflo-upgrade restores them in one shot. Always run this after updates.

Step 2 — Run /no-conflict
  Verify the update didn't introduce documentation drift.

Step 3 — Run /init-claude (if major version update)
  Only needed if the DannFlow stack changed significantly.
  It will re-read your README and re-tailor the environment.
```

---

## Flow 3 — Existing Project (No DannFlow Tooling)

Use this when you have an existing Next.js / Supabase project and want to add DannFlow's Claude tooling without starting over.

**Trigger:**

```bash
curl -sSL https://raw.githubusercontent.com/Danncode10/DannFlow/main/install-add.sh | bash
```

What `install-add.sh` does:
- Downloads `.claude/` (commands, CLAUDE.md, SKILLS.md), `guide.sh`, `AGENTS.md`, `PROJECT_CONTEXT.md`
- Merges into your existing project — **never touches `src/`, `package.json`, `.env.local`, or your database**
- Installs Ruflo globally + registers MCP
- Downloads all 8 skill packs

**What you do after (same 5 steps as Flow 1):**

```
Step 1 — Edit README.md    (describe YOUR project)
Step 2 — Run /init-claude  (tailors everything to your project)
Step 3 — Fill PROJECT_CONTEXT.md
Step 4 — Run /ruflo-upgrade
Step 5 — Run /no-conflict
```

---

## The key files and what they do

| File | What it is | Who writes it | Who reads it |
|---|---|---|---|
| `README.md` | Project pitch and feature set | **You** | `/init-claude`, Claude at session start |
| `CLAUDE.md` | Claude's authoritative project config | `/init-claude` + you | Every command, every session |
| `SKILLS.md` | Which skills are relevant + when | `/init-claude` | Claude when choosing a skill |
| `PROJECT_CONTEXT.md` | Project-specific decisions (audience, stack, design, tone) | **You** | Skills + commands before acting |
| `.claude/commands/*.md` | Slash command definitions | DannFlow + `/init-claude` | Claude when you run `/command` |
| `src/types/supabase.ts` | Auto-generated Supabase types | `npm run update-types` | All service files + Claude |

---

## Shared Supabase auth setup

When one Supabase project serves many client deployments, configure both the
deployment env and Supabase Auth redirect allow-list.

Each client deployment needs:

```env
NEXT_PUBLIC_APP_ID=<client-slug>
NEXT_PUBLIC_ORG_ID=<client organization uuid>
NEXT_PUBLIC_SITE_URL=https://<client-domain>
NEXT_PUBLIC_SITE_NAME="<Client Name>"
```

In Supabase Auth URL Configuration:

- **Site URL** is only the fallback/default redirect URL.
- **Redirect URLs** must include every client domain that can receive password
  reset, magic link, email confirmation, or OAuth redirects.

Example Redirect URLs:

```text
http://localhost:3000/**
https://client-a.com/**
https://www.client-a.com/**
https://client-b.vercel.app/**
https://client-b.com/**
```

For the full checklist, see
[`auth-redirects-and-tenant-env.md`](./auth-redirects-and-tenant-env.md).

---

## Why PROJECT_CONTEXT.md exists

DannFlow ships with 8 skill packs from GitHub. Skills are updated by `./guide.sh skills-update`. If you edited a skill file directly, the update would overwrite your edits.

Instead: put project-specific context in `PROJECT_CONTEXT.md`. All skills and commands read `CLAUDE.md` + `PROJECT_CONTEXT.md` before acting. You get project-specific behavior without ever touching a skill file.

---

## Quick reference

```bash
# New project
curl -sSL .../install.sh | bash
# → then /init-claude → PROJECT_CONTEXT.md → /ruflo-upgrade → /no-conflict

# Existing project
curl -sSL .../install-add.sh | bash
# → then /init-claude → PROJECT_CONTEXT.md → /ruflo-upgrade → /no-conflict

# After any update
/init-update → /ruflo-upgrade → /no-conflict

# If Claude environment drifts
/init-claude   → re-tailors everything to current project state
/ruflo-upgrade → restores memory + parallel patterns
/no-conflict   → verifies docs match code
```

---

## Related commands

| Command | When to use |
|---|---|
| `/init-claude` | Tailor Claude environment to current project state. Run after install, after major updates, or when CLAUDE.md drifts significantly. |
| `/ruflo-upgrade` | Re-apply Ruflo memory + parallel-agent patterns to 12 core commands. Run after any update that regenerates command files. |
| `/no-conflict` | Audit docs vs. actual code. Run as the final step of any setup or update flow. |
| `/init-update` | Pull latest DannFlow commands, scripts, and docs while preserving your code. |
| `/sync-commands` | Lighter audit — checks only command docs for orphans and stale entries. |
| `/auto-docs` | Broadest audit — commands, skills, npm scripts, env vars, stack, and folder structure. |
