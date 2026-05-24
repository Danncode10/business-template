# Claude Workflow

> The Claude Code setup for this repo. Read this once. Then forget about it.

## TL;DR

```
1. Edit README.md to describe what you're building
2. Run /init-claude in Claude Code
3. Start building
```

That's the whole workflow. Everything else is detail.

---

## The setup, step by step

### Step 1 — Make the README reflect your project

`README.md` is the **source of truth** for what this codebase is. When you fork DannFlow and start your own product:

1. Open `README.md`
2. Replace the DannFlow intro with **your** project's pitch (2–3 sentences)
3. Update the feature table to match what you're building
4. Update the project structure section if you're adding new top-level folders

Don't worry about polishing it. Claude reads it to understand the project, not to publish it. You can keep it scrappy.

### Step 2 — Run `/init-claude`

In Claude Code, run:

```
/init-claude
```

This reads your updated `README.md` + `package.json` + `src/` + existing `.claude/commands/`, then **rewrites the entire Claude environment** to match:

- `CLAUDE.md` — Claude's project config
- `SKILLS.md` — which Claude Code skills are relevant
- `.claude/commands/README.md` — the command index
- **Individual command files** — adds missing ones (e.g. `/stripe-check` if you added Stripe), removes stale ones (e.g. `/rls-check` if you dropped Supabase), rewrites outdated bodies
- The command tables in this file (`claude-workflow.md`)

Before writing anything, `/init-claude` shows you a plan grouped by file and waits for confirmation. Skip the confirmation by adding "go" or "just do it" to your invocation.

> **Tip**: `/init-claude` won't silently overwrite hand-tuned commands. Every individual command change is in the plan and only applied after you say yes.

### Step 3 — Start building

You're done with setup. From here on, the daily loop is:

```
1. /checkpoint           → snapshot your DB schema (before risky changes)
2. Ask Claude to build something
3. /sync-types           → after any schema change
4. /review               → before opening a PR
5. /commit               → stage + draft commit message
```

---

## The full command list

> **Live source of truth**: run `./guide.sh commands` for the current list — it reads `.claude/commands/*.md` at runtime. The tables below are kept in sync by `/init-claude` but may drift between runs.

Run `/ask-command <what you want>` if you don't remember which command to use.

### Discovery & setup
| Command | What it does |
|---|---|
| `/ask-command <intent>` | Tells you which command to use for your task. Returns a copy-paste-ready prompt. |
| `/init-claude` | Rewrites the entire Claude environment (`CLAUDE.md`, `SKILLS.md`, commands README, individual commands, and this file's command tables) to match the current README + src + package.json. Plan-then-confirm flow. |
| `/make-command <description>` | Creates a new custom slash command from a plain-English description. Auto-updates this file's tables and proposes conflict-avoidance edits to existing commands. |

### Security & quality
| Command | What it does |
|---|---|
| `/security-audit` | Full security scan: secret leaks, service-role exposure, XSS, missing auth gates, rate-limiting gaps. |
| `/rls-check` | Walks `src/services/` and confirms every Supabase query has an ownership filter. |
| `/rls <table>` | Inspects RLS policies for one table. Useful for "why can't this user see X?" debugging. |
| `/ui` | **Active rewrite.** Makes the diff (or a target file) fully responsive — mobile-first, 48px touch targets, semantic tokens only. |
| `/review` | Pre-PR review. Runs lint + typecheck, then critiques diff against `CLAUDE.md` guardrails. |

### Supabase workflow
| Command | What it does |
|---|---|
| `/checkpoint` | Snapshots live schema (tables, RLS, triggers, functions) to `supabase/backups/schema-MM-DD-YYYY-HH-MM.sql`. |
| `/sync-types` | Runs `npm run update-types`, diffs `src/types/supabase.ts` before/after, summarizes schema drift. |
| `/explain-schema` | Plain-English summary of your live Supabase schema. |
| `/migrate <description>` | Wraps the full migration flow — checkpoint → apply_migration → sync-types — into one step. Plain-English description in, type-safe code out. |
| `/seed <table\|all>` | Generates type-safe seed data from `src/types/supabase.ts`. Respects FK dependency order and RLS ownership. Writes to `supabase/seeds/`. Never auto-applies. |

### Scaffolding
| Command | What it does |
|---|---|
| `/new-feature <name>` | Scaffolds service + types + App Router page + Shadcn form for a new feature. |
| `/new-page <route>` | Scaffolds an App Router page (Server Component) with `loading.tsx` + `error.tsx`. |
| `/masterplan-task <task>` | Execute a single task from `MASTERPLAN.md` with full context. Auto-generates `TEST.md` verification guide. Use during development sprints for systematic, hallucination-free feature scaffolding. |

### SEO & marketing
| Command | What it does |
|---|---|
| `/seo-check [route]` | Per-route SEO audit — metadata, OG, canonical, sitemap.ts, robots.ts, JSON-LD, alt text, heading hierarchy. Reports gaps only. |
| `/seo-fix <route\|all>` | Active rewrite — adds missing metadata, OG, canonical, JSON-LD, sitemap/robots files. Plan-then-confirm. |
| `/marketing-check [route]` | Conversion-fundamentals audit for landing/pricing pages — headline clarity, CTA, social proof, friction, pricing legibility. Opinionated. Reports only. |

### Housekeeping
| Command | What it does |
|---|---|
| `/commit` | Stages changes + drafts a conventional commit message. |
| `/cleanup` | Finds dead code, unused exports, orphaned components. Reports only — never deletes. |
| `/sync-commands` | Audits `.claude/commands/` and validates docs against `claude-workflow.md` + `./guide.sh`. Identifies orphaned commands, optionally auto-patches. |
| `/auto-docs` | Broader superset of `/sync-commands`. Audits commands, skills, npm scripts, env vars, tech stack, and folder structure for drift. `--fix` auto-patches the safe categories (commands/skills/scripts/env); stack and structure are report-only. |
| `/init-update` | Update your DannFlow project to the latest version — pull new commands, scripts, guide, skills, and more while preserving your code. Interactive menu or `--all` for one-command full update. |
| `/sync-upstream [path|--commits [N]]` | Pull selective file or commit updates from DannFlow upstream. File-level diff is default — safe for forked repos with no common git ancestry. |
| `/no-conflict` | Audits repo for conflicts between documentation (README, CLAUDE.md) and actual code — versions, features, commands, RLS, semantic tokens, folder structure. Reports only. |
| `/ruflo-upgrade` | Re-applies Ruflo memory + parallel-agent patterns to the 5 core commands (`/new-feature`, `/new-page`, `/security-audit`, `/seo-fix`, `/migrate`). Safe to re-run after `/init-update`. |

---

## Ruflo command namespace (beta — separate from DannFlow)

If you ran `npx ruflo@latest init wizard`, your `.claude/commands/` directory **also** contains a large set of Ruflo-installed commands organized by topic:

```
.claude/commands/
├── <DannFlow commands>.md      ← curated, listed in the tables above
├── claude-flow-help.md         ← Ruflo
├── claude-flow-memory.md       ← Ruflo
├── claude-flow-swarm.md        ← Ruflo
├── agents/                     ← Ruflo (agent lifecycle: spawn, list, metrics…)
├── analysis/                   ← Ruflo (bottleneck, token-usage, performance…)
├── automation/                 ← Ruflo (auto-agent, smart-spawn, self-healing…)
├── coordination/               ← Ruflo (orchestrate, task-orchestrate…)
├── github/                     ← Ruflo (pr-manager, code-review-swarm, release-swarm…)
├── hive-mind/                  ← Ruflo (hive-mind-spawn, consensus, memory…)
├── hooks/                      ← Ruflo (pre-task, post-edit, session-end…)
├── memory/                     ← Ruflo (memory-search, memory-persist, neural…)
├── monitoring/                 ← Ruflo (swarm-monitor, agent-metrics, real-time…)
├── optimization/               ← Ruflo (parallel-execute, topology-optimize…)
├── sparc/                      ← Ruflo (SPARC modes: architect, coder, tester, debug…)
├── swarm/                      ← Ruflo (swarm-init, swarm-spawn, strategies…)
└── workflows/                  ← Ruflo (workflow-create, workflow-execute…)
```

**Rules of thumb:**

- The tables above (Discovery & setup, Security & quality, Supabase workflow, Scaffolding, Housekeeping) document **DannFlow's commands only**. They will never list Ruflo commands.
- `/sync-commands` is scoped to the top level of `.claude/commands/` and explicitly skips the Ruflo subdirectories and the three `claude-flow-*.md` files. Ruflo commands are **not** orphans.
- Ruflo commands live and die with the Ruflo install. To update them, re-run `npx ruflo@latest init wizard`. To remove them, delete the relevant subdirectory (or uninstall Ruflo).
- Don't move Ruflo commands up to the top level — that breaks `/sync-commands` scoping and Ruflo's own expectations.

For what each Ruflo command does, run `/claude-flow-help` (top-level) or open the file directly.

---

## Design taste skill packs (three upstream sources)

`install.sh` installs three complementary design-taste skill packs (refreshable via `./guide.sh skills-update`). Sources live in `.agents/skills/<name>/` and are symlinked into `.claude/skills/<name>/`. These are **skills**, not slash commands — they're invoked by Claude when relevant, not typed with `/`.

| Pack | Repo | Skills | Risk |
|---|---|---|---|
| Leonxlnx | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | 12 broad design-taste skills | Low |
| Emil Kowalski | [emilkowalski/skill](https://github.com/emilkowalski/skill) | `emil-design-eng` (animation/UI craft) | Low |
| Impeccable | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | `impeccable` (anti-pattern critique, 23 commands) | ⚠️ Med |

**Most relevant skills for DannFlow work:**

| Skill | Trigger |
|---|---|
| `design-taste-frontend` (Leonxlnx) | Default polish pass after `/ui` |
| `redesign-existing-projects` (Leonxlnx) | Auditing/upgrading an existing screen |
| `high-end-visual-design` (Leonxlnx) | Premium landing/marketing surfaces |
| `minimalist-ui` (Leonxlnx) | Clean editorial style (good SaaS default) |
| `full-output-enforcement` (Leonxlnx) | Long generations that risk truncation |
| `emil-design-eng` (Emil) | Any animation/interaction surface — drawers, modals, popovers, hovers, press states |
| `impeccable` (pbakaus) | Pre-merge audit + anti-pattern scan on big visual changes |

**Rule:** taste skills run *after* `/ui` (which handles hard rules: responsive, 48px, semantic tokens, a11y). Don't polish a layout that may still get restructured. Full table + risk notes in [SKILLS.md](../../SKILLS.md).

To pull the latest skill definitions:
```bash
./guide.sh skills-update
```

---

## Quality skill packs (three utility sources)

`install.sh` also installs three non-visual skill packs alongside the taste packs. Same `./guide.sh skills-update` refreshes them all.

| Skill | Source | Auto-triggers when |
|---|---|---|
| `claude-api` | [anthropics/skills](https://github.com/anthropics/skills) | A file imports `@anthropic-ai/sdk` or you ask about prompt caching / model migration. Use if/when DannFlow grows AI features. |
| `shadcn` | [shadcn/ui](https://github.com/shadcn-ui/ui) | Project has `components.json` (DannFlow does). Provides current Shadcn component docs + composition guidance. |
| `a11y-audit` | [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills) | You ask for WCAG 2.2 A/AA compliance, contrast checks, ARIA review, or alt-text passes. |

All three are Low Risk. They complement `/ui` (hard responsive/touch-target rules) by adding domain knowledge `/ui` doesn't carry.

---

## SEO + Marketing skill packs (two upstream sources, 30+ skills)

`install.sh` also installs two growth-focused packs since DannFlow targets SaaS use cases. Same `./guide.sh skills-update` refreshes them with everything else.

| Pack | Source | Highlights |
|---|---|---|
| `coreyhaines31/marketingskills` | [skills.sh](https://skills.sh/coreyhaines31/marketingskills) | 30+ skills: SEO (`seo-audit`, `programmatic-seo`, `ai-seo`, `schema`), copy (`copywriting`, `copy-editing`, `cold-email`, `emails`), CRO (`cro`, `pricing`, `paywalls`, `signup`, `onboarding`), GTM (`launch`, `referrals`, `directory-submissions`), channels (`ads`, `social`, `sms`, `video`), strategy (`marketing-psychology`, `customer-research`, `competitor-profiling`, `analytics`, `ab-testing`) |
| `addyosmani/web-quality-skills` | [skills.sh](https://skills.sh/addyosmani/web-quality-skills) | `seo` skill — technical SEO + Core Web Vitals from Google Chrome team |

These pair with three DannFlow slash commands that enforce per-route checks:

| Command | Skills it composes with |
|---|---|
| `/seo-check` | `seo-audit`, `seo` (addy), `schema`, `site-architecture` |
| `/seo-fix` | `seo-audit`, `schema`, `copywriting` (for titles/descriptions) |
| `/marketing-check` | `cro`, `pricing`, `copywriting`, `marketing-psychology` |

**Workflow order for new SaaS:** trigger `product-marketing` once to scaffold positioning context → use the other skills as needed for execution.

---

## When to use what

**Building a new feature?**
```
/new-feature <name>             # scaffold
/ui                             # responsive + a11y hard rules
# Claude may then invoke:
#   design-taste-frontend       (broad polish)
#   emil-design-eng             (if the feature involves animation/interaction)
#   impeccable                  (final critique pass)
/review                         # before PR
/commit                         # ship it
```

**Changed the database?**
```
# Fastest path — one command chains all four steps:
/migrate "add bio text column to profiles"

# Manual path (if you prefer per-step control):
/checkpoint             # snapshot first
# (apply your migration via Supabase MCP)
/sync-types             # regenerate types
/rls <new-table>        # verify RLS on any new tables
/seed <new-table>       # optional: generate type-safe test data
```

**Auditing security?**
```
/security-audit
/rls-check
```

**Don't know what to do?**
```
/ask-command I want to <plain English>
```

---

## How this differs from skills

| Layer | Where it lives | When to use |
|---|---|---|
| **Custom command** (`.claude/commands/*.md`) | This repo | DannFlow-specific workflows (RLS check against `src/services/`, schema sync via `npm run update-types`) |
| **Skill** (`~/.claude/skills/` or plugin) | Your machine | Generally useful workflows reusable across all your projects (security review, code review, simplification) |

See [SKILLS.md](../../SKILLS.md) for which Claude Code skills are recommended for this project.

---

## Customizing the setup

The `.claude/` directory is yours. Customize freely:

- **Add a new command** — drop `your-command.md` into `.claude/commands/` with frontmatter:
  ```markdown
  ---
  description: One-line summary for /ask-command routing.
  argument-hint: <args> (optional)
  ---

  The prompt body. Use $ARGUMENTS for typed arguments.
  ```

- **Remove a command** — just delete the file. `/init-claude` won't recreate it unless you tell it to (or unless the README still mentions it).

- **Rewrite a command** — edit the `.md` file. `/init-claude` won't overwrite hand-edited commands unless you pass `--commands` AND confirm each change.

---

## FAQ

**Q: Will `/init-claude` overwrite my carefully tuned `CLAUDE.md` and commands?**
A: It rewrites everything — that's its job. But it always shows you the plan first and waits for confirmation per file. If you've made manual edits you want to keep, commit them first so you can review the diff and revert anything you don't like. The command preserves the non-negotiable guardrails (RLS, semantic tokens, service layer) unless your README clearly indicates the project no longer needs them.

**Q: Does Claude actually use these commands automatically?**
A: No — you invoke them with `/command-name`. Claude doesn't run them on its own. They're prompt shortcuts, not hooks.

**Q: What if I want a command to run automatically (e.g. `/ui` after every edit)?**
A: That's a hook, not a command. See Claude Code's settings — `PostToolUse` hooks in `.claude/settings.json` can run commands automatically. Different mechanism. Ask Claude to set one up via the `update-config` skill.

**Q: Why is `AGENTS.md` still around if `CLAUDE.md` is authoritative?**
A: `AGENTS.md` is the cross-tool standard (Cursor, Antigravity, etc. read it). `CLAUDE.md` is Claude-specific. We keep both for compatibility.
