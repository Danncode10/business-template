---
description: "PHASE 1 of 2 — scaffold a new client project from a fresh business-template clone. Interviews you about the business, writes business.json + README + PROJECT_CONTEXT, rebrands the code, creates a GitHub repo and repoints origin (keeping DannFlow as upstream), wires the Claude env, and stands up the Supabase tenant. When it finishes, run /design-project to have Claude design the actual site."
argument-hint: "[business name]" (optional — you'll be asked if omitted)
---

# /new-project  ·  Phase 1: Scaffold

> **Two-command flow:** `/new-project` (this) gets the project *standing* — repo, config, wiring, database tenant. Then **`/design-project`** has Claude *design and build* the actual site. Run them in that order.

Turn a fresh clone of **business-template** into a wired, repo-backed, database-connected project in one conversation. This is the boring-but-critical setup so the fun part (`/design-project`) has everything it needs.

> Run **once**, in a freshly cloned business-template directory. If the repo is already rebranded (package.json name ≠ `business-template`, `business.json` filled with real data), stop and say it looks already-initialized — point the user at `/business-init` for re-syncs.

## What it does

1. **Preflight** — clean tree, un-rebranded clone, `gh` authenticated, `dannflow.json` present.
2. **Interview** — collect the business facts (name, contact, hours, branding, socials, features).
3. **Write config** — `business.json`, `README.md`, `PROJECT_CONTEXT.md`.
4. **Rebrand code** — `package.json`, `src/lib/config.ts`, `.env.local`. (No folder rename — that would break this session.)
5. **Git + repo** — commit on top of history, create a GitHub repo, repoint `origin`, keep `upstream` → DannFlow, push.
6. **Wire Claude** — `/business-init` → `/init-claude` → `/ruflo-upgrade`.
7. **Database** — pause for Supabase keys, then `/create-organization` (org row + feature tables).
8. **Hand off** — print the repo link and tell the user to run **`/design-project`** next.

---

## Step 0 — Preflight (run first, in parallel)

```bash
git rev-parse --is-inside-work-tree 2>/dev/null || echo "NOT_A_REPO"
git status --porcelain
git remote -v
node -p "require('./package.json').name" 2>/dev/null
test -f dannflow.json && echo "DANNFLOW_OK" || echo "NO_DANNFLOW"
gh auth status 2>&1 | head -1
```

Stop conditions:
- **Not a repo / no `dannflow.json`** → tell the user to clone business-template properly (the clone carries `dannflow.json`).
- **Dirty tree** → commit or stash first; this command makes many edits.
- **`package.json` name ≠ `business-template`** → looks already-initialized; suggest `/business-init`.
- **`origin` not pointing at `.../business-template`** → confirm with the user before continuing.
- **`gh` not authenticated** → tell them to `gh auth login`, or offer the manual-repo fallback in Step 5.

---

## Step 1 — Interview: the business facts

Short, friendly conversation. Ask for an open-ended description first, then fill gaps. Don't dump a form — infer, then confirm. (Design taste comes later in `/design-project` — here you only need the facts.)

Collect → `business.json`:
- **Identity**: name, tagline, one-paragraph description, industry, `vertical` (`general` | `restaurant` | `service` | `retail` | `real-estate` | `education`)
- **Contact**: email, phone, address, website (if any), Google Maps embed URL (optional)
- **Hours**: per-day; offer Mon–Fri 9–5 / weekend closed as a default to accept wholesale
- **Branding**: primary + accent hex (keep template defaults if they don't care — real theming happens in `/design-project`)
- **Socials**: twitter / instagram / linkedin / facebook / youtube (null = hidden)
- **Social proof**: rating, source, customers, years (optional)
- **SEO**: a few keywords, og image (optional)
- **Features**: which of `blog`, `gallery`, `testimonials`, `pricing`, `contactForm`, `teamPage`, `analytics` — these drive which tables `/create-organization` builds
- **Client** (optional): external client name/email/github

Derive + confirm:
- `SLUG` = kebab-case of the name (e.g. "Bismi Cafe & Resto" → `bismi-cafe-and-resto`)
- `APP_ID` = `SLUG` → becomes `deployment.appId` and `NEXT_PUBLIC_APP_ID` (the RLS namespace). **Never leave it `business-template`.**

Show the derived slug + a field summary, get a "yes" before writing.

---

## Step 2 — Write config files

- **`business.json`** — rewrite with the answers; preserve every `_note` / `_readme` key. Set `deployment.appId = APP_ID`, leave `supabase.*` null (filled in Step 7).
- **`README.md`** — rewrite intro / feature table / description to describe **this client**. Keep the "Built on DannFlow" + deployment sections. (`/business-init` and `/design-project` read this.)
- **`PROJECT_CONTEXT.md`** — audience, tone, and explicit anti-decisions from the interview.

Show a concise diff summary, confirm.

---

## Step 3 — Rebrand the code (files only — never rename the folder)

> `guide.sh init` does these same edits but `mv`s the project folder last, which would break this session. We skip the rename (offered as an optional manual step at the end).

1. **`package.json`** — `"name"` → `SLUG`.
2. **`src/lib/config.ts`** — update the `name:` fallback to the business name. Touch only `siteConfig`, never `creatorRepos`.
3. **`.env.local`** — `cp .env.example .env.local` if missing, then set `NEXT_PUBLIC_SITE_NAME` and `NEXT_PUBLIC_APP_ID=<APP_ID>`. **Never write secret keys.**

---

## Step 4 — Commit the rebrand

Stage only touched files (never `git add -A`). Keep history — do **not** `rm -rf .git` (`/sync-upstream` needs the DannFlow ancestry):

```bash
git add business.json README.md PROJECT_CONTEXT.md package.json src/lib/config.ts .env.local 2>/dev/null
git commit -m "chore: initialize <business name> from business-template

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Step 5 — Create the client repo and repoint origin

The step the old runbook forgot — why a clone's `origin` kept pointing at business-template.

1. Confirm: "I'll create a GitHub repo `<SLUG>` and point this project at it. Public or private?" (default private)
2. Create + repoint:
   ```bash
   gh repo create <SLUG> --private --disable-wiki     # capture the printed URL
   git remote set-url origin <new repo URL>           # NOT 'git remote add' — origin already exists
   git remote -v                                      # origin = client repo, upstream = DannFlow
   ```
3. Push: `git push -u origin main`
4. Re-run `git remote -v` and show the user — `origin` must NOT contain `business-template`.

**Manual fallback (no `gh`):** pause, have them create an empty repo (no README/license) on github.com, paste the URL, then `git remote set-url origin <url>` + verify + push.

---

## Step 6 — Wire the Claude environment

Run in order; pass "go" where they ask, since the user already approved the flow:
1. **`/business-init`** — syncs `business.json` → config/env, runs `tsc`, prints the setup report.
2. **`/init-claude`** — rewrites `CLAUDE.md` / `SKILLS.md` / command docs to match this client.
3. **`/ruflo-upgrade`** — restores memory + parallel-agent patterns `/init-claude` may have reset.

---

## Step 7 — Stand up the Supabase tenant

1. Pause and ask the user to add to `.env.local` (never print these back):
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```
2. Wait for confirmation they've pasted the keys.
3. Run **`/create-organization`** — inserts the `organizations` row for this `APP_ID` and creates the feature tables.

If they don't have keys yet, skip — note it as a remaining task and continue.

---

## Step 8 — Hand off to Phase 2

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ <Business Name> is scaffolded
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Repo:    <new repo URL>
  Slug:    <SLUG>     App ID: <APP_ID>     Vertical: <vertical>

  ✅ Config written   ✅ Rebranded   ✅ Repo + origin repointed
  ✅ Claude wired     ✅ / ⏭ Supabase tenant

  👉 NEXT: run  /design-project   — Claude designs & builds the actual site.
     (Use Opus for this — it's the creative, judgement-heavy phase.)

  Later: deploy to Vercel (separate app, same shared Supabase).
  Optional: rename the folder to match the repo —
     cd .. && mv "<current folder>" <SLUG> && cd <SLUG>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Hard rules

- **Never `rm -rf .git`** — keep the DannFlow ancestry for `/sync-upstream`.
- **Never rename the folder mid-session** — offer it as a final manual step only.
- **Never print or write secret values** — the user pastes Supabase keys themselves.
- **`origin` → client repo, `upstream` → DannFlow.** Always `git remote -v` to prove it before pushing.
- **Never `git remote add origin`** (it already exists from the clone) and **never `git add -A`**.
- **`APP_ID` / `NEXT_PUBLIC_APP_ID` = the slug, never `business-template`** — it's the RLS namespace.
- **Stop on a dirty tree or an already-rebranded repo.**
- **Delegate, don't duplicate** — call `/business-init`, `/init-claude`, `/ruflo-upgrade`, `/create-organization`. Don't reimplement them.
- **Don't design here** — visual design, copy, and content are `/design-project`'s job. Keep this phase to facts + wiring.
