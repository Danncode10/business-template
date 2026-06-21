# 🚀 Business Template (Built on DannFlow)

**A reusable client website template for web commissions.** This template is built on top of DannFlow—the Claude Code-optimized SaaS starter—and adds a multi-tenant architecture, SEO-first design, and a site management system for running client websites at scale.

Each client gets an isolated site (via Row Level Security) served from a shared Supabase database. All sites share the same Next.js codebase; you fork this template once, customize it, and deploy one Vercel app per client. When clients outgrow the shared tier, swap them to their own Supabase via environment variables.

**Start at ~80% done:** landing pages, blog CMS, lead inbox, admin dashboard, SEO controls, and pluggable vertical modules (restaurant menus, service booking, retail checkout, real estate listings, courses).

> **For commissions. For speed. Built on DannFlow's Zero-Hallucination methodology.**


[![Next.js](https://img.shields.io/badge/Next.js-16+-black?logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ECF8E?logo=supabase)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)

---

## 🏗️ Architecture at a Glance

### Multi-Tenant Model
- **One shared Supabase project** (free tier) serving all client sites via Row Level Security
- **One `organization_id` per client** — data isolation enforced at the RLS policy layer
- **Separate Vercel deployment per client** — all apps point to the same Supabase, allowing per-client code flexibility
- **Migration path:** When a client outgrows the free tier, swap them to their own Supabase via env vars (zero code changes)

### Three Core Pillars

**1. Public Landing Page**
- Hero, about, services/products, pricing, portfolio, testimonials, FAQ
- Contact form + business hours/location widget
- Blog with SEO controls per post

**2. SEO Layer**
- Editable meta/OG tags per page
- JSON-LD structured data (LocalBusiness, Organization, etc.)
- Auto-generated sitemap + robots.txt
- Alt text enforcement on images
- Core Web Vitals monitoring integration
- Local SEO features for Philippines-based businesses

**3. Admin Management System**
- **Site Editor** — edit landing page sections without code (hero copy, images, pricing)
- **Lead Inbox** — capture form submissions with status tracking
- **Blog CMS** — write + publish + schedule posts
- **Media Library** — image upload (backed by Cloudinary/R2 for scale)
- **Site Settings** — logo, colors, NAP data, social links, business hours
- **Per-Page SEO Controls** — title, description, OG image, keywords
- **Team & Roles** — manage who can edit what
- **Analytics Embed** — view traffic from your dashboard
- **Audit Log** — track who changed what and when

### Pluggable Vertical Modules (Add as Needed)
Choose modules based on client type—each adds 1-2 tables + components:
- **Restaurant** — menu management, reservations, hours
- **Service Business** — booking calendar, service listings, packages
- **Retail** — product cart, checkout, inventory
- **Real Estate** — property listings, inquiry capture, map integration
- **Education** — course catalog, enrollment, progress tracking

### ⚠️ Key Risks & Constraints

- **RLS discipline is non-negotiable** — one bad policy leaks client data across tenants. Every `SELECT`/`UPDATE`/`DELETE` must include the tenant filter.
- **Supabase free tier storage fills fast** — offload media to Cloudinary/R2 early to avoid billing surprises.
- **Noisy neighbor risk** — one client running expensive queries can slow other clients. Monitor and add query indices proactively.
- **Tenant migrations** — when a client outgrows shared hosting, you need a tenant-export script to safely move their data to their own Supabase.

### 📋 Next Planning Steps

Choose what to lock down first:
1. **Multi-tenancy model** — Option A (all shared Supabase) vs Option B (per-client Supabase on billing upgrade)
2. **Core schema** — Design `organizations`, `pages`, `sections`, `blog_posts`, `media`, `leads`, `site_settings`, + any vertical-specific tables
3. **Vertical specialization** — Pick the first vertical to build (restaurant, service, retail, real estate, or education) and design its schema

---

## 🔄 Built on DannFlow — The Upstream Loop

**This repo is not a dead-end copy.** It sits in the middle of a three-tier chain, and each tier pulls improvements from the one above and pushes generic fixes back up. That's how the template gets better every time you build a client site.

```
DannFlow              ← github.com/Danncode10/DannFlow (methodology + SaaS starter)
   └─ business-template  ← THIS repo (multi-tenant client platform)
        └─ client site      ← a fork you deploy per business
```

Your link to upstream lives in **`dannflow.json`** — it records the exact DannFlow commit this repo is synced to:

```json
{ "dannflow_commit": "<sha>", "repo": "https://github.com/Danncode10/DannFlow", "base_branch": "main", "dev_branch": "dev" }
```

### How improvements flow

| Direction | When | Command |
|---|---|---|
| ⬇️ **Pull down** | Bring the latest DannFlow improvements into this repo (or into a client fork) | `/sync-upstream` (file-level diff) or `/update-dannflow` (smart auto-detect) |
| ⬆️ **Push up** | You fixed a bug or wrote something generic that every project should get | `/sync-to-upstream` — classifies your changes as **generic** (PRs to upstream) vs **business-specific** (stays local) |
| 🆕 **Adopt** | Turn an existing repo into a DannFlow-tracked project (creates `dannflow.json`) | `/adopt-dannflow` |

**The rule of thumb for where a fix belongs:**
- Generic Claude command / skill / methodology fix → flows up to **DannFlow**
- Multi-tenant / RLS / client-platform feature → stays in **business-template**
- One-client customization → stays in that **client fork**, never pushed up

### Spin up a new client — two commands

Clone the template, then run two slash commands. Claude does the rest — interviews you, writes the config, makes the repo, and designs the whole site.

```bash
git clone <business-template>  my-client  &&  cd my-client

/new-project "Bismi Cafe & Resto"   # Phase 1 — scaffold & wire
/design-project                     # Phase 2 — Claude designs the site   ⭐ use Opus
```

**`/new-project`** — the setup. Interviews you for the business facts, writes `business.json` / `README` / `PROJECT_CONTEXT`, rebrands the code, **creates your GitHub repo and repoints `origin`** (keeping DannFlow as `upstream`), wires the Claude env, and stands up the Supabase tenant. Pauses once for your Supabase keys.

**`/design-project`** — the build. Reads your brief, runs a quick design-taste interview, then **designs and builds the actual site** — real copy, a fitting theme, every section — replacing all template placeholders. It's pure design judgement, so **run it on Opus.**

Then `npm run dev` to preview, and deploy to Vercel (separate app, same shared Supabase). Built something generic worth reusing? `/sync-to-upstream` pushes it up so the next client starts with it.

> **Why the repo step matters:** a fresh clone's `origin` still points at `business-template`. `/new-project` fixes it (`git remote set-url origin <your repo>`) so your pushes don't land on the template. Doing it by hand? Don't skip that.

---

## Quick Start 

Boot up your project and set your App Name with a single command:

```bash
curl -sSL https://raw.githubusercontent.com/Danncode10/DannFlow/main/install.sh | bash
```

This automates the entire setup: clones the repo, installs dependencies, sets up environment variables, **installs Ruflo (beta) and registers its MCP server**, runs the Ruflo `init wizard` in the new project, and finishes with interactive rebranding + a fresh Git history.

> **Ruflo is currently in beta.** The installer always pulls `ruflo@latest`, but features may shift between releases. If you set up DannFlow manually (without `install.sh`), you **must install Ruflo globally first** before running the project wizard — see [Ruflo Setup](#-ruflo-setup-beta) below.

#### 🪟 Windows Setup

The shell-based `install.sh` works on **macOS, Linux, and Windows (with WSL or Git Bash)**. Choose your approach:

**Option 1: WSL / Git Bash (Recommended)**
1. Install [Windows Subsystem for Linux](https://learn.microsoft.com/en-us/windows/wsl/install) or [Git Bash](https://git-scm.com/download/win)
2. Open WSL terminal or Git Bash and run the same command:
   ```bash
   curl -sSL https://raw.githubusercontent.com/Danncode10/DannFlow/main/install.sh | bash
   ```

**Option 2: Native Windows (PowerShell)**
PowerShell version coming soon. For now, use Option 1 or set up manually:
```powershell
# Manual setup steps (run these in PowerShell)
git clone https://github.com/Danncode10/DannFlow my-dannflow-app
cd my-dannflow-app
npm install
cp .env.example .env.local
npm run setup  # Installs Ruflo, skills, and more
```

For the full step-by-step guide (after cloning), run `./guide.sh` in WSL/Git Bash or see [docs/dannflow_docs/](docs/dannflow_docs/) for manual Supabase + MCP setup instructions.

### Quick Reference

Once set up, use these commands to accelerate your workflow:

```bash
./guide.sh workflow     # Show daily Vibe Coding loop (checkpoint → build → sync-types → review → commit)
./guide.sh vibe-check   # Health check: env, MCP, backups, types, CLI
./guide.sh commands     # List all 16 Claude Code slash commands (grouped by category)
npm run dev             # Start development server
npm run checkpoint      # Snapshot your live DB schema to supabase/backups/
npm run update-types    # Regenerate src/types/supabase.ts after schema changes
```

### Codex Command Bridge

This template can reuse the existing Claude command library from Codex through
the `.codex/` compatibility layer:

```text
/claude-command <claude-command> [arguments]
```

Examples:

```text
/claude-command ui src/components/BillingForm.tsx
/claude-command new-feature client-portal
/claude-command sync-upstream --commits 3
```

If you do not know which command fits, use:

```text
/ask-claude-command make the homepage responsive and review it
```

### The Initial Commit

The `./guide.sh init` command automatically handles rebranding and resets your Git history so you can start fresh. **Run it only once.**

If you prefer to do it manually:
```bash
rm -rf .git
git init
git add .
git commit -m "this projects initialized Dannflow"
```

---

## 🧠 Ruflo Setup (Beta)

DannFlow ships with [Ruflo](https://www.npmjs.com/package/ruflo) wired into the install flow. Ruflo gives Claude Code persistent memory tools, an MCP server, and (per project) swarms, hooks, and agents that complement the Vibe Coding loop.

> ⚠️ **Beta software.** Ruflo is still pre-1.0, so APIs and command surface can change. We always install `ruflo@latest` so you get the freshest build.

### One-time global install (per machine)

Do this **once, ever** — you must complete it **before** the per-project wizard. `install.sh` runs it for you; if you set things up manually, run:

```bash
npm install -g ruflo@latest
claude mcp add ruflo -- npx ruflo@latest mcp start
```

This makes Ruflo's memory tools and MCP server available in every Claude Code session on your machine.

### Per-project init (in each repo that wants full orchestration)

After cloning DannFlow (or any new project) and *after* the global install above:

```bash
cd your-project
npx ruflo@latest init wizard
```

This wires swarms, hooks, agents, and a `CLAUDE.md`-aware setup into that specific repo. **Don't run this before the global install** — the wizard expects the global `ruflo` binary to exist.

> The DannFlow `install.sh` performs both steps automatically. Manual setups must follow the order: **global install → MCP register → `init wizard`**.

### Ruflo file layout (what the wizard adds to your repo)

The `init wizard` writes into two top-level locations. Knowing the split avoids confusion later:

| Location | What it is | Commit it? |
|---|---|---|
| `.claude-flow/config.yaml`, `CAPABILITIES.md`, `agents/`, `hooks/`, `security/`, `workflows/` | Ruflo per-project configuration | ✅ Yes |
| `.claude-flow/data/`, `logs/`, `sessions/`, `metrics/`, `learning/` | Ruflo runtime state (churns constantly) | ❌ Gitignored |
| `.claude/agents/`, `.claude/skills/`, `.claude/helpers/` | Ruflo-installed agents, skills, hook handler | ✅ Yes |
| `.claude/settings.json` | Pre/PostToolUse hooks wiring Ruflo into Claude Code | ✅ Yes |
| `.claude/commands/<subdirs>/` + `claude-flow-*.md` | ~60 Ruflo-managed slash commands (separate namespace) | ✅ Yes |

**Namespace rule:** DannFlow's 16 curated commands live as top-level `.md` files in `.claude/commands/`. Everything inside a subdirectory (`agents/`, `swarm/`, `sparc/`, `github/`, …) or named `claude-flow-*.md` belongs to **Ruflo** and is managed by re-running the wizard. `/sync-commands` explicitly skips the Ruflo namespace so it won't flag those as orphans. See [docs/dannflow_docs/claude-workflow.md](docs/dannflow_docs/claude-workflow.md) for the full breakdown.

**Hook side-effect to know about:** `.claude/settings.json` adds Pre/PostToolUse hooks (5–10s timeouts) that route every Bash and Write/Edit through `.claude/helpers/hook-handler.cjs`. That's how Ruflo learns + coordinates. If you ever see a small lag on tool calls, that's why.

---

## 🎨 Design Taste Skills (three upstream packs)

`install.sh` installs three complementary design-taste skill packs after Ruflo. They give AI agents opinionated design taste covering broad style, motion craft, and anti-pattern detection.

| Pack | What it adds | Risk |
|---|---|---|
| [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | 12 skills — broad design taste (`design-taste-frontend`, `minimalist-ui`, `high-end-visual-design`, `redesign-existing-projects`, `full-output-enforcement` + 7 more) | Low |
| [emilkowalski/skill](https://github.com/emilkowalski/skill) | 1 skill — `emil-design-eng` — animation + micro-interaction craft. Pairs with Sonner/Vaul (already in stack) and Framer Motion. | Low |
| [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | 1 skill — `impeccable` — broad UI critique + 27 anti-pattern rules + 23 invocation commands. Also ships `npx impeccable detect <path>` CLI scanner. | ⚠️ Med |

> ⚠️ `impeccable` was flagged Medium Risk by both Gen and Snyk scanners (the other two are Low Risk). Skim `.agents/skills/impeccable/SKILL.md` before letting it make autonomous changes.

**Pull the latest of all three later:**

```bash
./guide.sh skills-update
# or individually (--all skips the interactive picker):
npx skills add https://github.com/Leonxlnx/taste-skill --all
npx skills add https://github.com/emilkowalski/skill --all
npx skills add https://github.com/pbakaus/impeccable --all
```

Idempotent — re-running fetches the freshest version. Sources land in `.agents/skills/<name>/` and are symlinked into `.claude/skills/<name>/`.

**Composition order** (don't fire taste skills before `/ui` — you'll polish a layout that may get restructured):

```
/ui  →  design-taste-frontend  →  emil-design-eng  →  impeccable  →  /review  →  /commit
```

Pick by surface: static page → Leonxlnx alone; animated component → add Emil; pre-merge audit → run Impeccable last. Full skill triage in [SKILLS.md](SKILLS.md).

---

## 🧰 Quality Skills (three utility packs)

`install.sh` also installs three non-visual skills that handle code correctness, accessibility compliance, and component-library guidance.

| Skill | Source | What it does |
|---|---|---|
| `claude-api` | [anthropics/skills](https://github.com/anthropics/skills) | Anthropic SDK guidance — prompt caching, correct model IDs, tool use, model migration. Auto-triggers on files importing `@anthropic-ai/sdk`. |
| `shadcn` | [shadcn/ui](https://github.com/shadcn-ui/ui) | Official Shadcn component docs + composition. Auto-triggers in projects with `components.json` (DannFlow has one). |
| `a11y-audit` | [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills) | WCAG 2.2 A/AA scanning + fixes for React/Next/Vue/Svelte. Complements `/ui` (which handles touch targets and focus rings but not contrast). |

All three are Low Risk. Refresh alongside the taste packs via `./guide.sh skills-update` — same command pulls latest for all six.

---

## 📈 SEO + Marketing Skills (two growth-focused packs)

DannFlow ships as a SaaS starter, so `install.sh` also installs two upstream packs covering the entire growth surface — technical SEO, copy, conversion, launch, pricing, ads, lifecycle, and more. **30+ auto-invoked skills** across the two packs.

| Pack | Source | What it covers |
|---|---|---|
| `coreyhaines31/marketingskills` | [skills.sh](https://skills.sh/coreyhaines31/marketingskills) | `seo-audit`, `programmatic-seo`, `ai-seo`, `schema`, `copywriting`, `cro`, `pricing`, `paywalls`, `signup`, `onboarding`, `launch`, `ads`, `emails`, `cold-email`, `marketing-psychology`, `competitor-profiling`, and ~20 more |
| `addyosmani/web-quality-skills` | [skills.sh](https://skills.sh/addyosmani/web-quality-skills) | `seo` — technical SEO + Core Web Vitals (from Google Chrome team) |

These skills auto-trigger when you ask things like "audit my SEO," "rewrite this hero copy," or "design a pricing page." They pair with the three project commands `/seo-check`, `/seo-fix`, and `/marketing-check`:

```
/seo-check                        # per-route audit (metadata, OG, JSON-LD, alt text…)
/seo-fix /pricing                 # active rewrite — adds missing essentials
/marketing-check                  # conversion-fundamentals audit on landing pages
```

> **Tip:** start a fresh project by triggering the `product-marketing` skill — it scaffolds `.agents/product-marketing.md` (ICP + positioning + value props) that all other Corey skills reference. Saves you re-explaining your product in every prompt.

All Low Risk. Refresh with `./guide.sh skills-update` (same command pulls latest for all eight packs).

---

## 🔑 Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```env
# Supabase — Project Settings > Data API
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...

# Site Branding
NEXT_PUBLIC_SITE_NAME=YourAppName
NEXT_PUBLIC_SITE_URL=https://yourapp.vercel.app
NEXT_PUBLIC_GITHUB_URL=https://github.com/yourusername

# Rate Limiting (Upstash Redis) — get from console.upstash.com
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=AAAx...
```

---

## 🏗️ What's Included

| Feature | Location | Details |
|---|---|---|
| **Auth (Login / Signup)** | `src/app/login/` | Email + password via Supabase Auth |
| **Forgot Password** | `src/app/forgot-password/` | Sends reset email via Gmail SMTP |
| **Reset Password** | `src/app/reset-password/` | Session-guarded — handles expired links gracefully |
| **Dashboard** | `src/app/dashboard/` | Protected route, server-rendered |
| **PillTabs & Bento UI** | `src/components/` | Mobile-first smooth interfaces with Shadcn constraints |
| **Profile Settings** | `src/components/profile-form.tsx` | Full name, age, birthday, gender |
| **Security Settings** | `src/components/security-form.tsx` | Re-auth gate → change password |
| **Version Control Tab** | `dashboard-shell.tsx` | Paginated GitHub repos (5/page) |
| **Internal Docs Tab** | `dashboard-shell.tsx` | Live documentation for all features |
| **TanStack Query** | `src/hooks/` | Client caching + optimistic mutations |
| **Cursor Pagination** | `Dashboard > Database` | Infinite scroll via Intersection Observer |
| **Toast Notifications** | Global | Sonner — success, error, descriptions |
| **Gmail SMTP** | Supabase Auth settings | Free auth emails on any domain |

---

## 🗺️ Setup Flows

Three paths depending on where you're starting from:

| Situation | Command |
|---|---|
| **New project** | `curl -sSL .../install.sh \| bash` |
| **Existing project** (no DannFlow) | `curl -sSL .../install-add.sh \| bash` |
| **Update existing DannFlow** | `/init-update` in Claude Code |

**After any install or update, run these 5 steps in Claude Code:**
```
1. Edit README.md         → describe YOUR project (Claude reads this)
2. /init-claude           → tailors CLAUDE.md + SKILLS.md + commands to your project
3. Fill PROJECT_CONTEXT.md → audience, stack choices, design rules, anti-decisions
4. /ruflo-upgrade         → adds memory + parallel-agent patterns to commands
5. /no-conflict           → verify docs and code are in sync
```

> Full guide: [docs/dannflow_docs/setup-flow.md](docs/dannflow_docs/setup-flow.md)

---

## 🎨 Personalize It (5 Steps)

### 1. Site name & branding
```
src/lib/config.ts  →  siteConfig.name / githubUrl / description
```
Or set env vars: `NEXT_PUBLIC_SITE_NAME`, `NEXT_PUBLIC_GITHUB_URL`

### 2. Show YOUR GitHub repos
The **GitHub MCP** and **Version Control** tabs show repos from `creatorRepos` in `src/lib/config.ts`.

To replace them with your own, prompt your AI:
```
"Use the GitHub MCP to fetch all public repos for <your-github-username>,
 pick the 20 most interesting ones, and update the creatorRepos array
 in src/lib/config.ts. Each entry: { name, url, description }"
```

### 3. Favicon
Replace `src/app/favicon.ico` with your brand icon.

### 4. Color theme
Edit CSS variables in `src/app/globals.css` under `@theme`:
```css
--color-primary: #2563eb;   /* your brand blue */
--color-background: #ffffff;
```

### 5. Database schema
Run `npm run update-types` after any Supabase schema change to regenerate `src/types/supabase.ts`.

---

## 🔐 Security Features

### Password Recovery Flow
1. `/forgot-password` → triggers `resetPasswordForEmail` via Gmail SMTP
2. `/reset-password` → session-guarded (expired links show a "Link Expired" state, not a blank form)

### Re-authentication Gate
Changing your password in the Dashboard **requires your current password first**:
- Silent `signInWithPassword` → verify identity
- If passes → `updateUser` with new password
- Gmail sends a "Password Changed" notification email

### Password Visibility Toggles
All password inputs have Eye/EyeOff icons. Browser-native password reveal icons are suppressed globally via `globals.css` to prevent clash.

---

## 📧 Gmail SMTP Setup (Free Auth Emails)

No custom domain? No problem. Use Gmail SMTP instead of Supabase's default mailer:

1. Enable **2-Step Verification** on your Google account
2. Go to Google Account → Security → **App Passwords** → create a 16-char password
3. In Supabase Dashboard → **Auth → SMTP Settings**:
   - Host: `smtp.gmail.com`
   - Port: `465`
   - Username: your Gmail address
   - Password: the 16-char app password
4. In **Auth → Email Templates** — enable:
   - ✅ Reset Password
   - ✅ Password Change (for security notifications)

---

## 🗃️ Database Workflow (Zero-Hallucination Loop)

The **Checkpoint → Build → Sync-Types → Review → Commit** loop ensures your AI agent never guesses about the database schema:

```bash
# Step 1: Before risky schema changes — save current state
npm run checkpoint         # or /checkpoint in Claude Code
                          # saves to supabase/backups/schema-MM-DD-YYYY-HH-MM.sql

# Step 2: Build your feature with Claude
# Claude reads your CLAUDE.md + types + services + the prompt you give it

# Step 3: After any schema change — regenerate types
npm run update-types      # or /sync-types in Claude Code
                          # regenerates src/types/supabase.ts from live schema

# Step 4: Verify it's correct
/review                   # Lint + typecheck + guardrail check
```

### Row Level Security (RLS-First Design)
All queries respect RLS by default. Every service in `src/services/` includes `.eq('id', userId)` unless building a public endpoint. DannFlow enforces RLS in `CLAUDE.md` so Claude never forgets.

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # Protected dashboard
│   ├── login/              # Auth pages
│   ├── forgot-password/
│   ├── reset-password/
│   └── globals.css         # Theme tokens + browser icon suppression
├── components/             # UI components (Shadcn-based)
│   ├── dashboard-shell.tsx # Main dashboard with all tabs
│   ├── profile-form.tsx    # Profile settings form
│   ├── security-form.tsx   # Password change with re-auth
│   ├── features-tabs.tsx   # Landing page feature showcase
│   └── ui/                 # Shadcn component primitives
├── services/               # Business logic (no UI code here)
│   ├── auth.ts             # Login, logout, updatePassword
│   ├── users.ts            # updateProfile
│   └── dashboard.ts        # Data fetching
├── lib/
│   └── config.ts           # ← CENTRAL CONFIG: siteConfig + creatorRepos
├── types/
│   └── supabase.ts         # Auto-generated — never edit manually
└── utils/
    └── supabase/           # Supabase client helpers

supabase/
└── backups/                # 📋 Schema snapshots from npm run checkpoint

.claude/
├── commands/               # 16 DannFlow slash commands + Ruflo subdirs (see Ruflo File Layout)
├── agents/                 # Ruflo-installed agent definitions (browser, sparc, swarm, …)
├── skills/                 # Ruflo-installed skills (agentdb-*, github-*, sparc-*) + design-taste symlinks → ../../.agents/skills/ (Leonxlnx + Emil + Impeccable)
├── helpers/                # Ruflo hook-handler scripts (hook-handler.cjs)
├── settings.json           # Ruflo Pre/PostToolUse hook wiring (committed)
└── plans/                  # Implementation plans (worktree mode)

.claude-flow/               # Ruflo per-project runtime — partially gitignored
├── config.yaml             # Ruflo config (committed)
├── CAPABILITIES.md         # What this Ruflo install can do (committed)
├── agents/, hooks/, security/, workflows/   # curated state (committed)
└── data/, logs/, sessions/, metrics/, learning/   # runtime state (gitignored)

.codex/
├── commands/               # Codex commands that load .claude command prompts
├── context/                # DannFlow + Claude compatibility notes for Codex
└── adapters/               # Command-loading contract

docs/
└── dannflow_docs/          # 📚 DannFlow documentation (separate from your /docs/)
```

---

## ⚡ Custom Slash Commands (Claude Code)

DannFlow ships with **16 built-in slash commands** that accelerate Vibe Coding. They live in `.claude/commands/` and are auto-exposed in Claude Code via the `/` prefix.

### Essential Commands

| Command | When to use |
|---|---|
| `/ask-command <what you want>` | Not sure which command fits your task? This routes you to the right one with a copy-paste prompt. |
| `/checkpoint` | **Before risky DB schema changes** — snapshots your live schema to `supabase/backups/schema-*.sql` |
| `/sync-types` | **After any schema change** — regenerates `src/types/supabase.ts` from live DB |
| `/sync-commands` | **Validates command docs** — scans `.claude/commands/` and checks that all commands are documented in `claude-workflow.md` and `guide.sh`. Use `--fix` to auto-patch. |
| `/new-feature <name>` | Scaffolds service + types + App Router page + form for a new feature |
| `/review` | Pre-PR: runs lint + typecheck + guardrail check against `CLAUDE.md` |
| `/commit` | Stages changes + drafts conventional commit message |

Run `./guide.sh commands` to see all 16 commands grouped by category (Discovery, Security, Supabase, Scaffolding, Housekeeping).

### Running Claude commands from Codex

Use the Codex bridge instead of duplicating command files:

```text
/claude-command <command> [arguments]
```

For example, `/claude-command sync-upstream` loads
`.claude/commands/sync-upstream.md` and runs it under Codex with DannFlow's
agent guardrails.

---

## 🤖 Vibe Coding Workflow (Claude-Optimized AI-Assisted Dev)

DannFlow is built **specifically for Claude Code, Cursor, and Antigravity**. It follows the **Trinity Model** — ensuring your AI agent always works from a perfect, up-to-date snapshot of your database.

| Layer | What | Where |
|---|---|---|
| 👁️ **The Eyes** | TypeScript types mirroring your DB (regenerated after schema changes) | `src/types/supabase.ts` |
| 📋 **The Blueprint** | SQL snapshots for disaster recovery + zero hallucination | `supabase/backups/` |
| ⚡ **The Action** | Pure business logic, no UI leakage, RLS-first | `src/services/` |

### The Daily Vibe Loop (Copy-Paste to Claude)

**Session starter prompt** (always paste this first):
```
Read CLAUDE.md before doing anything. Confirm my Supabase MCP is 
connected by listing all tables in the public schema, and check that 
src/types/supabase.ts is up to date with the live schema.
```

**The loop:**
```
1. /checkpoint           → Snapshot your DB before risky schema changes
2. Build with Claude     → Tell Claude what feature you want
3. /sync-types           → After any schema change
4. /review               → Pre-PR lint + typecheck + guardrails
5. /commit               → Stage + draft conventional commit
6. /sync-commands        → Validate command documentation stays in sync
```

Run `./guide.sh workflow` anytime to see the full loop with copy-paste prompts.

### 16 Custom Slash Commands (Claude Code)

All commands auto-generate via `npm run` or `/command` in Claude Code:

**Discovery & Setup** | **Security & Quality** | **Supabase** | **Scaffolding** | **Housekeeping**
---|---|---|---|---
`/ask-command` | `/security-audit` | `/checkpoint` | `/new-feature` | `/commit`
`/init-claude` | `/rls-check` | `/sync-types` | `/new-page` | `/cleanup`
`/make-command` | `/rls` | `/explain-schema` | | `/sync-commands`
 | `/ui` | | |
 | `/review` | | |

**Don't know which command to use?** Run `/ask-command <what you want>` in Claude Code for intelligent routing.

### MCP Agent Setup (Antigravity/Cursor/Claude Code)

DannFlow enforces the **AGENTS.md Standard**. When using AI tools:
1. **Connect the Supabase MCP** — live schema reads + type verification
2. **Connect the GitHub MCP** — branch history and PR automation
3. **Connect the Terminal MCP** — run `npm run checkpoint`, `npm run update-types`
4. **Always start sessions** with the copy-paste prompt above

See `./guide.sh vibe-check` for quick health verification that MCPs are working.

---

## 📚 Extended Documentation

> DannFlow docs live in `docs/dannflow_docs/` — keeping `docs/` free for your own project documentation.

| Doc | What it covers |
|---|---|
| [docs/dannflow_docs/claude-workflow.md](docs/dannflow_docs/claude-workflow.md) | **START HERE** — Daily Vibe Coding loop, all 16 slash commands, when to use each |
| [docs/dannflow_docs/methodology.md](docs/dannflow_docs/methodology.md) | Vibe Coding philosophy & Zero-Hallucination approach |
| [docs/dannflow_docs/the-holy-trinity.md](docs/dannflow_docs/the-holy-trinity.md) | Eyes (types), Blueprint (schema), Action (services) |
| [docs/dannflow_docs/mcp-setup.md](docs/dannflow_docs/mcp-setup.md) | Step-by-step Supabase + GitHub MCP setup for Claude Code |
| [docs/dannflow_docs/backups-and-sync.md](docs/dannflow_docs/backups-and-sync.md) | Checkpoint & schema sync loop with verification |
| [docs/dannflow_docs/production-features.md](docs/dannflow_docs/production-features.md) | Gmail SMTP, SEO, rate limiting, Toasts |
| [docs/dannflow_docs/ui-system.md](docs/dannflow_docs/ui-system.md) | Theme tokens, semantic colors & UI standards |

---

## 🤝 Working with Claude Code (Worktree Workflow)

When Claude Code uses **plan mode**, it creates an isolated branch called a **worktree** — a sandboxed copy of your repo where it makes changes safely without touching your working branch.

```
Your repo/
└── .claude/worktrees/
    └── claude/some-branch-name/   ← Claude edits here, not on your branch
```

### How to get Claude's edits into your branch

**Option A — Simple tasks (skip plan mode)**
Just ask Claude directly without `/plan`. It edits your files in-place on your current branch. Commit normally.

**Option B — After a plan mode session**
```bash
# Merge the worktree branch into YOUR current branch (not necessarily main)
git merge claude/some-branch-name

# Or cherry-pick just one commit
git cherry-pick <commit-hash>
```

**Option C — Push the worktree branch and PR it**
```bash
# Claude pushes the worktree branch, then you merge on GitHub
git checkout main
git merge claude/some-branch-name
git push
```

> **Rule of thumb:** Use plan mode for large structural changes. For everyday edits, skip it — Claude edits directly and you commit as normal.

---

## 🚀 Deploy to Vercel

1. Push your repo to GitHub
2. Import into [vercel.com](https://vercel.com) → add all `.env.local` vars as Vercel Environment Variables
3. Set `NEXT_PUBLIC_SITE_URL` to your Vercel domain (needed for password reset email links)
4. Deploy

> **Important:** Update Supabase → Auth → URL Configuration → add your Vercel URL to **Redirect URLs**.

---

*Built for speed. Structured for Agents. Optimized for the Vibe.*
