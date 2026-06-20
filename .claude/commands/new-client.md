---
description: One-shot client onboarding. Interviews you about the business, writes business.json + README + PROJECT_CONTEXT, rebrands the code, creates a fresh GitHub repo and repoints origin (keeping DannFlow as upstream), then chains /business-init → /init-claude → /ruflo-upgrade → /create-organization → /no-conflict. Ends with a repo link and "ready to vibe code".
argument-hint: "[business name]" (optional — you'll be asked if omitted)
---

# /new-client

Turn a fresh clone of **business-template** into a fully wired, repo-backed client project in one conversation. This command *is* the Phase 1–4 runbook from the README, automated. You answer questions about the business; this command writes every config file, fixes the git remote (the #1 footgun: a clone's `origin` still points at business-template), and runs the downstream slash commands in order.

> **Run this once, in a freshly cloned business-template directory.** If the repo has already been rebranded (package.json name isn't `business-template` and `business.json` is filled with real data), stop and tell the user this looks already-initialized — point them at `/business-init` for re-syncs instead.

## What it does (in order)

1. **Preflight** — confirm clean tree, this is an un-rebranded business-template clone, `gh` is authenticated, `dannflow.json` exists.
2. **Interview** — ask the user to describe the business; collect every `business.json` field conversationally.
3. **Write config files** — `business.json`, `README.md`, `PROJECT_CONTEXT.md`.
4. **Rebrand the code** — `package.json` name, `src/lib/config.ts` fallback, `.env.local` site name + `NEXT_PUBLIC_APP_ID`. (Does what `guide.sh init` does to *files*, but never renames the folder — that would break this session.)
5. **Git + new repo** — commit the rebrand on top of history, create a new GitHub repo, repoint `origin` to it, keep `upstream` → DannFlow, push.
6. **Wire Claude + codebase** — `/business-init`, then `/init-claude`, then `/ruflo-upgrade`.
7. **Stand up the tenant** — pause for the user to paste Supabase keys into `.env.local`, then `/create-organization`.
8. **Verify** — `/no-conflict`.
9. **Hand back** — print the repo URL, the Vercel next step, and "✅ your business is ready to be vibe coded."

---

## Step 0 — Preflight (always run first, in parallel)

```bash
git rev-parse --is-inside-work-tree 2>/dev/null || echo "NOT_A_REPO"
git status --porcelain
git branch --show-current
git remote -v
node -p "require('./package.json').name" 2>/dev/null
test -f dannflow.json && echo "DANNFLOW_OK" || echo "NO_DANNFLOW"
gh auth status 2>&1 | head -1
```

Evaluate the results:

- **Not a repo / no `dannflow.json`** → stop. Tell the user to clone business-template properly first (the clone carries `dannflow.json`).
- **Dirty tree** → stop. Tell the user to commit or stash first — this command makes many edits and must start clean.
- **`package.json` name is NOT `business-template`** (already rebranded) → stop and warn this looks already-initialized; suggest `/business-init`.
- **`origin` does not point at `.../business-template`** → warn. Either this isn't a clone of the template, or it's already been repointed. Confirm with the user before continuing.
- **`gh` not authenticated** → stop and tell the user to run `gh auth login` first (Step 5 needs it to create the repo). Offer the "just repoint, I'll make the repo manually" fallback if they can't.

Only continue once the tree is clean and this is recognizably a fresh template clone.

---

## Step 1 — Interview the user about the business

Have a short, friendly conversation. Ask for the business description **first** (open-ended), then fill gaps with targeted questions. Don't dump a 30-field form — infer what you can from their description, then confirm.

Collect (mapping to `business.json`):

- **Identity**: name, tagline, one-paragraph description, industry, `vertical` (one of: `general`, `restaurant`, `service`, `retail`, `real-estate`, `education`)
- **Contact**: email, phone, address, website (if any yet), Google Maps embed URL (optional)
- **Hours**: per-day; offer a sensible default (Mon–Fri 9–5, weekend closed) they can accept wholesale
- **Branding**: primary + accent color (hex). If they don't care, keep template defaults and say so.
- **Socials**: any of twitter/instagram/linkedin/facebook/youtube (null = hidden)
- **Social proof**: rating, source, customer count, years in business (optional — skip if unknown)
- **SEO**: a few keywords, og image URL (optional)
- **Features**: which of `blog`, `gallery`, `testimonials`, `pricing`, `contactForm`, `teamPage`, `analytics` to enable. These drive which tables `/create-organization` builds — explain that.
- **Client** (optional): if this site is for an external client, their name/email/github.

**Derive and confirm:**
- `SLUG` = kebab-case of the business name (lowercase, spaces→dashes, strip non-alphanumerics). e.g. "Bismi Cafe & Resto" → `bismi-cafe-and-resto`.
- `APP_ID` = `SLUG` (this becomes `deployment.appId` and `NEXT_PUBLIC_APP_ID` — the multi-project RLS namespace). **Never leave it as `business-template`.**

Show the user the final derived `SLUG` / `APP_ID` and the filled field summary. Get a "yes" before writing anything.

---

## Step 2 — Write the config files

### `business.json`
Rewrite it with the interview answers. Preserve all `_note` / `_readme` keys exactly. Set:
- `business.*`, `branding.*`, `contact.*`, `hours.*`, `socials.*`, `socialProof.*`, `seo.*` from the interview
- `deployment.appId` = `APP_ID` (the slug — NOT `business-template`)
- `features.*` from the interview
- `client.*` if provided
- Leave `supabase.organizationSlug` / `supabase.projectRef` as `null` (filled later by `/create-organization`)

### `README.md`
Rewrite the intro, feature table, and project description to describe **this client**, not DannFlow/business-template. Keep the "Built on DannFlow — upstream loop" section and the deployment section intact (those are still true). Claude reads this file in `/business-init` and `/init-claude`, so it must reflect reality.

### `PROJECT_CONTEXT.md`
Fill in: audience, design rules, tone, and explicit anti-decisions, derived from the interview. This is the file CLAUDE.md defers to for project-specific overrides.

Show a concise diff summary of all three files and confirm before moving on.

---

## Step 3 — Rebrand the code (files only — never rename the folder)

> `guide.sh init` also does these edits, but it `mv`s the project folder as its last step, which would pull the rug out from under this session. So we do the file edits here and skip the rename. (Renaming the folder is offered as an optional manual step at the very end.)

Apply:

1. **`package.json`** — set `"name"` to `SLUG`.
2. **`src/lib/config.ts`** — update the `name:` fallback (`process.env.NEXT_PUBLIC_SITE_NAME || "..."`) to the business name. Touch only `siteConfig` — never `creatorRepos`.
3. **`.env.local`** — if it exists, set `NEXT_PUBLIC_SITE_NAME="<name>"` and `NEXT_PUBLIC_APP_ID=<APP_ID>`. If it doesn't exist, `cp .env.example .env.local` first, then set those two non-secret vars. **Never write secret keys** — those come from the user in Step 6.

---

## Step 4 — Commit the rebrand

Stage only the files this command has touched so far (never `git add -A`):

```bash
git add business.json README.md PROJECT_CONTEXT.md package.json src/lib/config.ts .env.local 2>/dev/null
git commit -m "chore: initialize <business name> from business-template

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

Keep the existing history (do **not** `rm -rf .git`) — `/sync-upstream` needs the shared ancestry with DannFlow.

---

## Step 5 — Create the client GitHub repo and repoint origin

This is the step the README runbook was missing — the reason a clone's `origin` kept pointing at business-template.

1. **Confirm** with the user: "I'll create a new GitHub repo named `<SLUG>` and point this project at it. Public or private?" Default private.

2. **Create + repoint** (using `gh`):
   ```bash
   # Create the repo WITHOUT pushing yet (we repoint origin manually to be explicit)
   gh repo create <SLUG> --private --disable-wiki   # or --public
   ```
   `gh repo create <name>` (no `--source`) makes an empty remote repo and prints its URL. Capture the URL.

3. **Repoint `origin`, preserve `upstream`:**
   ```bash
   git remote set-url origin <new repo URL>
   git remote -v   # verify: origin = new repo, upstream = DannFlow
   ```
   `upstream` must still point at `https://github.com/Danncode10/DannFlow` so `/sync-upstream` keeps working.

4. **Push history + rebrand:**
   ```bash
   git push -u origin main
   ```

5. **Sanity check** — re-run `git remote -v` and show the user. `origin` must NOT contain `business-template`.

**Fallback if `gh` is unavailable or the user prefers manual:** pause, ask them to create an empty repo on github.com (no README/license) and paste the URL, then run `git remote set-url origin <url>` + verify + push. Never use `git remote add origin` here — origin already exists from the clone; adding would error.

---

## Step 6 — Wire Claude + the codebase

Run these existing commands in order. Each is a full command with its own steps — invoke them and let them run, passing "go" where they ask for confirmation since the user already approved the overall flow:

1. **`/business-init`** — syncs `business.json` into `config.ts` / `.env.example`, runs `tsc`, prints the setup report. (Confirms the rebrand actually took.)
2. **`/init-claude`** — rewrites `CLAUDE.md`, `SKILLS.md`, command docs to match this client. Tell it "go" so it doesn't stall on the plan confirmation.
3. **`/ruflo-upgrade`** — re-adds the memory + parallel-agent patterns that `/init-claude` may have reset.

After these, optionally run **`/sync-upstream`** to pull any newer template improvements (skip if there's no local/remote `dev` branch yet — note it and move on rather than blocking).

---

## Step 7 — Stand up the Supabase tenant

`/create-organization` needs real Supabase credentials, which only the user can provide.

1. **Pause and ask** the user to add to `.env.local` (and DO NOT print these back):
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```
   (Plus confirm `NEXT_PUBLIC_APP_ID=<APP_ID>` is present from Step 3.)

2. **Wait** for the user to confirm they've pasted the keys. Do not proceed on assumption.

3. **Run `/create-organization`** — it reads `business.json` + `.env.local`, finds the shared Supabase project, inserts the `organizations` row for this `APP_ID`, and creates the feature tables. Let it walk its own steps (it asks which tables to create based on `features`).

If the user doesn't have Supabase keys yet, that's fine — skip this step, note it clearly in the final report as the remaining manual task, and continue to verification.

---

## Step 8 — Verify

Run **`/no-conflict`** to confirm docs and code agree (RLS filters present, semantic tokens, structure). Surface anything it flags.

---

## Step 9 — Hand back to the user

Print a final report:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ <Business Name> is ready to be vibe coded
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Repo:      <new GitHub repo URL>
  Slug:      <SLUG>
  App ID:    <APP_ID>
  Vertical:  <vertical>

  ✅ Config files written   (business.json, README, PROJECT_CONTEXT)
  ✅ Code rebranded
  ✅ New repo created + origin repointed (upstream still → DannFlow)
  ✅ /business-init, /init-claude, /ruflo-upgrade
  ✅ / ⏭  Supabase tenant   <created | SKIPPED — add keys then run /create-organization>
  ✅ /no-conflict

  Remaining manual steps:
   1. <if skipped> Add Supabase keys to .env.local, run /create-organization
   2. Deploy to Vercel (separate app, same shared Supabase) — see README "Deploy to Vercel"
   3. (optional) Rename the project folder to <SLUG> to match the repo:
        cd .. && mv "<current folder>" <SLUG> && cd <SLUG>

  Start building:  npm run dev   →   describe the first page you want.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

End with a one-line conventional commit suggestion for any uncommitted doc tweaks.

---

## Hard rules

- **Never `rm -rf .git`** — keep shared history so `/sync-upstream` has a merge-base with DannFlow.
- **Never rename the project folder mid-session** — it breaks the working directory. Offer it as a final manual step only.
- **Never print or write secret values** — Supabase keys, service-role keys. The user pastes those into `.env.local` themselves.
- **`origin` must end up at the new client repo; `upstream` must stay at DannFlow.** Always `git remote -v` to prove it before pushing.
- **Never `git remote add origin`** — the clone already has `origin`; use `set-url`.
- **Never `git add -A`** — stage only the files this flow touched.
- **Stop on a dirty tree or an already-rebranded repo** — don't run the full flow twice over real client work.
- **`deployment.appId` / `NEXT_PUBLIC_APP_ID` must be the slug, never `business-template`** — it's the RLS namespace; collisions leak tenants.
- **Delegate, don't duplicate** — call `/business-init`, `/init-claude`, `/ruflo-upgrade`, `/create-organization`, `/no-conflict` rather than re-implementing their logic. If one of them changes, this command still works.
