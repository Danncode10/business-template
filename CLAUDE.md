# CLAUDE.md — Business Template (Built on DannFlow)

> **Start here.** This file is Claude Code's authoritative config for this project. Read it before doing anything.

## What is the Business Template?

A multi-tenant client website platform built on DannFlow — optimized for **Vibe Coding** (AI-native dev workflow) with a Zero-Hallucination loop:

```
npm run checkpoint   →  snapshot live schema (RLS, triggers, enums) to supabase/backups/
npm run update-types →  regenerate src/types/supabase.ts from the live schema
```

**Architecture:** One shared Supabase database serving all clients via Row Level Security. Each client = one `organization_id` with complete data isolation. One Next.js codebase, separate Vercel deployment per client.

**Three core pillars:** (1) Public landing pages with blog, (2) SEO layer with editable meta/JSON-LD, (3) Admin dashboard for site editing, lead inbox, CMS, settings, team roles.

**Pluggable verticals:** Restaurant, service business, retail, real estate, education — add modules as needed per client.

The agent reads checkpoint + types before touching code, so it never guesses schema shape or tenant boundaries.

For the full story, see [README.md](README.md). For deeper docs, see [docs/dannflow_docs/](docs/dannflow_docs/).

## Tech stack

- **Framework**: Next.js 15+ (App Router), React 19
- **DB / Auth**: Supabase (`@supabase/ssr`, `@supabase/supabase-js`)
- **Styling**: Tailwind CSS v4 + Shadcn/UI primitives
- **State / Data**: TanStack Query, React Server Components by default
- **Rate limiting**: Upstash Redis + Ratelimit
- **Animation**: Framer Motion
- **Toasts**: Sonner
- **Icons**: lucide-react

## Project structure

```
src/
├── app/                # Next.js App Router pages (Server Components by default)
├── components/         # UI components (Shadcn-based)
├── services/           # ⚡ ALL business logic + Supabase queries live here
├── lib/
│   └── config.ts       # siteConfig (central config)
├── types/
│   └── supabase.ts     # 👁️ AUTO-GENERATED — never edit manually
└── utils/
    └── supabase/       # Supabase client helpers (server, client, middleware)

supabase/
└── backups/            # 📋 Timestamped DDL snapshots from npm run checkpoint
```

**Core schema** (multi-tenant):
- `organizations` — clients (tenants), each with unique `id` used as RLS boundary
- `pages` — landing page sections (hero, about, services, pricing, contact, blog)
- `sections` — editable content blocks (title, description, CTA, images)
- `blog_posts` — blog articles with SEO controls (title, slug, meta, content)
- `media` — images + files (offloaded to Cloudinary/R2)
- `leads` — form submissions + inquiry tracking
- `site_settings` — org-level config (logo, colors, NAP, hours, socials)
- `team_members` — users + roles per org
- `audit_log` — change tracking (who, what, when)

## Architectural guardrails (non-negotiable)

1. **Separation of concerns** — UI components MUST NOT contain DB logic or direct API calls.
2. **Service layer** — All business logic + Supabase queries live in `src/services/`.
3. **Type safety** — Use `src/types/supabase.ts` for all data shapes. **Never** use `any`.
4. **Server-first** — Default to Server Components. Only use `'use client'` when you need state, events, or browser APIs.
5. **Feature blueprints** — Before scaffolding a new feature, check `src/prompts/features/` for an existing blueprint.

## RLS security constraint (CRITICAL — Multi-Tenant)

Assume **Row Level Security is active on every table.** This is a SECURITY BOUNDARY between clients.

Every `select`/`update`/`delete` in `src/services/` MUST include:
- `.eq('organization_id', tenantId)` (tenant isolation), OR
- `.eq('user_id', userId)` (within a tenant, user ownership)

Examples:
```ts
// ✅ Correct — filters by org
const pages = await supabase
  .from('pages')
  .select('*')
  .eq('organization_id', tenantId)

// ❌ WRONG — leaks data to other clients
const pages = await supabase
  .from('pages')
  .select('*')
  // Missing tenant filter!
```

**NEVER skip the tenant filter**, even if "it's just a query." One bad policy leaks client data across the entire database. This is a SECURITY VULNERABILITY, not a style issue.

## UI quality standards

- **Mobile-first**: every component responsive from 375px up. No horizontal scroll.
- **Touch targets**: interactive elements ≥48px tall.
- **Forms**: labels ABOVE inputs (never placeholder-only). Visible focus rings via `ring-ring`. Error states use `text-destructive`.
- **Cards**: wrap form pages in Shadcn `<Card>` / `<CardHeader>` / `<CardContent>` / `<CardFooter>`.
- **Spacing**: stick to the scale — `p-4`, `p-6`, `gap-4`, `gap-6`. Don't cram.
- **Empty states**: never blank — centered icon + message.
- **Buttons**: always Shadcn `<Button variant="...">`, never raw `<button>`.

## Semantic tokens — CRITICAL

Use ONLY Tailwind/Shadcn semantic tokens. **Stating hex codes, `rgba()`, or hardcoded `white`/`black`/`gray-*` in className is a CRITICAL FAILURE.**

- Backgrounds: `bg-background`, `bg-card`, `bg-muted`
- Text: `text-foreground`, `text-muted-foreground`, `text-primary`
- Borders: `border`, `border-border`, `border-input`
- Brand: `bg-primary`, `text-primary-foreground`

Theme variables live in `src/app/globals.css` under `@theme`.

## Supabase workflow (MCP-driven, Multi-Tenant)

1. **Live schema first** — use the Supabase MCP to query tables/types/RLS before assuming structure.
2. **Schema changes** — apply migrations via MCP (`apply_migration`), not manual SQL entry.
3. **Sync types** — after any schema change, run `npm run update-types` to refresh `src/types/supabase.ts`.
4. **Checkpoint first** — before destructive schema changes, run `npm run checkpoint` to snapshot.
5. **RLS audits** — after adding a new table, verify RLS policies enforce `organization_id` filters. Use `/rls-check` before merging.

### Checkpoint protocol
When the user runs `npm run checkpoint` and provides the generated prompt:
1. Verify Supabase MCP connection.
2. Read live schema (tables, enums, RLS policies, triggers, functions) for the specified project ID.
3. Generate full DDL and save it to the timestamped `.sql` file in `supabase/backups/`.

### Schema design for multi-tenancy
When designing new tables:
1. **Always add** `organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`
2. **Always create** RLS policies enforcing `.eq('organization_id', auth.jwt() ->> 'organization_id')`
3. **Test** the policy with `/rls <table-name>` to confirm it blocks cross-tenant reads
4. For user-level ownership, also add `user_id UUID NOT NULL REFERENCES auth.users(id)` + RLS enforcing both filters

### Tenant migrations (client upgrade)
When a client outgrows the shared tier and moves to their own Supabase:
1. **Export**: run `npm run checkpoint` for the shared DB
2. **Filter**: extract DDL + data for just that organization_id
3. **Import**: apply to the client's new Supabase project
4. Update env vars (`NEXT_PUBLIC_SUPABASE_URL`, keys) to point to their Supabase
5. No code changes needed — RLS policies automatically apply to their isolated DB

### Multi-Project Supabase (Developer Namespace Pattern)
This Supabase project is **shared across multiple of Dann's projects** (not just clients within this template). Each project is namespaced via `app_id`.

**How it works:**
- Every shared table has an `app_id TEXT NOT NULL DEFAULT 'business-template'` column
- RLS policies enforce `app_id` in addition to `organization_id`
- Each project's `.env.local` sets `NEXT_PUBLIC_APP_ID=<project-slug>`
- Migrations applied here affect all projects sharing this Supabase — **always coordinate or use `app_id`-scoped migrations**

**RLS pattern (two-layer isolation):**
```sql
-- Layer 1: project namespace
-- Layer 2: client tenant
CREATE POLICY "project + org isolation" ON pages
  FOR ALL
  USING (
    app_id = current_setting('app.id', true)
    AND organization_id = (auth.jwt() ->> 'organization_id')::uuid
  );
```

**Service layer pattern:**
```ts
// Always filter both app_id and organization_id
const { data } = await supabase
  .from('pages')
  .select('*')
  .eq('app_id', process.env.NEXT_PUBLIC_APP_ID)
  .eq('organization_id', tenantId)
```

See [MULTI_PROJECT.md](MULTI_PROJECT.md) for the full guide, migration steps, and env setup.

## Required MCP tools

Before specialized work, verify these MCPs are connected:

- **Supabase MCP** — schema reads, SQL execution, types validation
- **GitHub MCP** — branch diffs, commit history, PR management
- **Terminal MCP** — local commands like `npm run checkpoint`

If a required MCP is missing, stop and tell the user:
> ⚠️ [Tool Name] MCP Not Detected: I need this to [task]. Open Settings → MCP Store → install "[Tool Name]" using credentials from `.env.local`.

## Code conventions

- Functional components + hooks. No classes.
- `async`/`await` for all async ops.
- Place new components in `src/components/`, logic in `src/lib/` or `src/hooks/`.
- DRY + SOLID. Extract repeated logic into hooks or components.
- **Don't restructure** existing folder hierarchy or UI patterns unless explicitly asked.
- After making code changes, end your response with a one-line conventional commit message for easy copy-paste (e.g. `feat: add password re-auth gate`).

## Claude environment in this repo

| File / Folder | Purpose |
|---|---|
| `CLAUDE.md` (this file) | Authoritative Claude Code config |
| [SKILLS.md](SKILLS.md) | Which Claude Code skills are relevant + when to invoke them |
| `.claude/commands/` | Custom slash commands (see its README for the list) |
| `AGENTS.md` | Cross-tool agent standard (Cursor/Antigravity/etc.) — kept for compatibility |
| `.codex/` | Codex compatibility layer that loads `.claude/commands/` through `/claude-command` |

If you don't know which custom command fits a task, run `/ask-command <your intent>`.

## Memory & docs

- **`PROJECT_CONTEXT.md`** (root) — project-specific decisions that override or extend this file: audience, stack choices, design rules, tone, anti-decisions. Read this before any feature work, UI rewrite, or marketing command. Fill it in once after running `/init-claude`.
- Project methodology in `docs/dannflow_docs/` (methodology, trinity model, MCP setup, backups, UI system)
- Central config: `src/lib/config.ts`
- Auto-generated types: `src/types/supabase.ts` (read-only)

---

## Ruflo memory protocol

Before starting any DannFlow command or multi-file task, search ruflo memory (`mcp__ruflo__memory_search`) for relevant prior decisions — use the feature name, table name, or technology as the search term.

After any non-trivial decision is made, store it in ruflo memory (`mcp__ruflo__memory_store`) **without being asked**. Good candidates:

- **Tech choices**: "We use Resend for email, not SendGrid"
- **Schema decisions**: "posts table uses soft deletes via deleted_at, not hard deletes"
- **Design decisions**: "Cards use rounded-xl, never rounded-md"
- **Anti-decisions**: "We're NOT using Zustand — TanStack Query handles all server state"
- **"Why" context**: "billing is behind a feature flag until Stripe goes live"

Auto-memory (`~/.claude/projects/.../memory/`) stores human-readable facts for future conversations. Ruflo memory enables semantic recall as the project grows past ~50 decisions. Use both.

---

**Be concise. Be proactive. Respect the guardrails. Default to Server Components. Never skip RLS.**
