# Custom Slash Commands — DannFlow

Drop `.md` files in this folder to add custom slash commands. Each file becomes `/filename`.

## Available commands

| Command | Purpose |
|---|---|
| `/init-claude` | Reads `README.md` + scans `src/` + `package.json`, then auto-rewrites `CLAUDE.md`, `SKILLS.md`, and refreshes this README to match the actual project state. |
| `/ask-command` | Meta-router. Describe what you want in plain English; it searches all commands here and returns the best one + a ready-to-paste prompt. |
| `/security-audit` | Full security scan: secrets in client bundles, service-role key leaks, `dangerouslySetInnerHTML`, missing `'use server'`, XSS vectors. |
| `/rls-check` | Walks `src/services/` and confirms every query filters by user/ownership. Cross-references `src/types/supabase.ts`. |
| `/rls <table>` | Inspects RLS policies for a single table via Supabase MCP. Returns who can SELECT/INSERT/UPDATE/DELETE and any gaps. |
| `/ui` | Active rewrite — makes the diff (or a target file) fully responsive: mobile-first, 48px touch targets, labels above inputs, focus rings, semantic tokens only. |
| `/checkpoint` | Runs `npm run checkpoint`: verifies Supabase MCP, pulls live schema, writes timestamped DDL to `supabase/backups/`. |
| `/sync-types` | Runs `npm run update-types`, diffs `src/types/supabase.ts` before/after, summarizes schema drift. |
| `/new-feature <name>` | Reads `src/prompts/features/` blueprint, scaffolds service + types + App Router page + Shadcn form. |
| `/new-page <route>` | Scaffolds an App Router page (Server Component) with `loading.tsx` + `error.tsx`, Card-wrapped layout. |
| `/explain-schema` | Pulls live Supabase schema via MCP → human-readable summary of tables, relationships, RLS policies. |
| `/review` | Pre-PR review: lint + typecheck + critique diff against `CLAUDE.md` guardrails. |
| `/commit` | Stages changes + drafts a conventional commit message. |
| `/cleanup` | Finds dead code, unused exports, orphaned components, stale files. |
| `/sync-commands` | Audits `.claude/commands/` and validates against `claude-workflow.md` and `./guide.sh`. Reports orphaned commands, optionally auto-patches docs. |
| `/auto-docs` | Broader superset of `/sync-commands`. Audits commands, skills, npm scripts, env vars, tech stack, and folder structure for documentation drift. `--fix` auto-patches the safe categories. |
| `/init-update` | Update your DannFlow project to the latest version — pull new commands, scripts, guide, skills, and more while preserving your code. Interactive menu or `--all` for one-command full update. |
| `/adopt-dannflow [--no-protect\|--force]` | Bootstrap a non-DannFlow repo into a first-class DannFlow project: detect shape, install + prove CI, write `dannflow.json`, create the `dev` branch, then run the first sync. Run once per repo. |
| `/sync-upstream [path|--commits [N]]` | Pull selective file or commit updates from DannFlow upstream. Lands changes on a `feat/sync-*` branch → PR into `dev`. File-level diff is the default — safe for forked-and-rewritten repos with no common git ancestry. Opt-in commit-level cherry-pick with `--commits`. |
| `/sync-to-upstream [path\|--dry-run]` | Contribute local improvements back UP to DannFlow. Classifies changes as generic vs. business-specific, then opens a clean PR into DannFlow `main`. |
| `/update-dannflow [--init]` | Smart entry point — auto-detects your `dannflow.json` version anchor and pulls the latest upstream updates. Creates the anchor if missing. |
| `/no-conflict` | Audits repo for conflicts between documentation (README, CLAUDE.md) and actual code — technology versions, features, commands, RLS enforcement, semantic tokens, folder structure. Reports only. |
| `/seed <table\|all>` | Generates realistic, type-safe seed data from `src/types/supabase.ts`. Respects FK order and RLS ownership. Writes to `supabase/seeds/`. |
| `/migrate <description>` | Wraps the full migration flow — checkpoint → apply_migration → sync-types — into one step. Plain-English description in, type-safe code out. |
| `/seo-check [route]` | Per-route SEO audit: metadata, OG, canonical, sitemap.ts, robots.ts, JSON-LD, alt text, heading hierarchy. Reports only. |
| `/seo-fix <route\|all>` | Active rewrite — adds missing SEO essentials. Scaffolds `sitemap.ts`, `robots.ts`, metadata blocks, JSON-LD. Plan-then-confirm. |
| `/marketing-check [route]` | Conversion-fundamentals audit for landing/marketing pages — headline, CTA, social proof, friction, pricing legibility. Opinionated, judgement-heavy. Reports only. |
| `/ruflo-upgrade` | Re-applies Ruflo memory + parallel-agent patterns to the 8 core commands. Safe to re-run after `/init-update`. |
| `/make-command` | Creates a new custom slash command from a plain-English description. Auto-updates documentation and proposes conflict-avoidance edits to existing commands or SKILLS.md. |
| `/masterplan-task` | Execute a task from MASTERPLAN.md and auto-generate TEST.md verification guide. Use during development sprints for systematic, hallucination-free feature scaffolding. |

## File format

Each command is a markdown file with optional YAML frontmatter:

```markdown
---
description: One-line summary used by /ask-command for routing.
argument-hint: <name> (optional — shown in help)
---

The prompt that Claude executes when you run /commandname.
Use $ARGUMENTS to reference args the user typed after the command.
```

## Keeping this index current

This table covers the core DannFlow commands. The folder also contains Ruflo/claude-flow
command packs (`claude-flow-*`, plus the `agents/`, `swarm/`, `sparc/`, etc. subfolders) that
aren't listed individually here. To reconcile this index with what's actually on disk, run
`/auto-docs` (broad drift check) or `/sync-commands` (command-specific) — they detect orphaned
or undocumented commands and can auto-patch.
