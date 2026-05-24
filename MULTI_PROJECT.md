# MULTI_PROJECT.md — Shared Supabase Across Multiple Projects

> **One Supabase. Multiple projects.** This guide documents how Dann's projects share a single Supabase instance using `app_id` namespace isolation — with no data leakage between projects.

**Last updated:** 2026-05-24  
**Status:** Active (business-template is the first project using this setup)

---

## Why One Supabase?

- Free tier is enough for multiple projects during early growth
- Avoids managing/paying for multiple Supabase instances
- Simple graduation path: when a project scales, point its env vars at its own Supabase — zero code changes

---

## Architecture: Two-Layer Isolation

```
Supabase (shared)
├── Layer 1: app_id            ← isolates projects from each other
│   ├── business-template
│   ├── project-2 (future)
│   └── project-3 (future)
│
└── Layer 2: organization_id   ← isolates clients within a project (multi-tenant)
    ├── client-org-1
    ├── client-org-2
    └── ...
```

Every row is stamped with both `app_id` and `organization_id`. RLS enforces both.

---

## Schema Pattern

Every shared table must have:

```sql
app_id          TEXT NOT NULL DEFAULT 'business-template',
organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
```

Example migration for a new table:

```sql
CREATE TABLE public.pages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id          TEXT NOT NULL DEFAULT 'business-template',
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL,
  content         JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(app_id, organization_id, slug)
);

CREATE INDEX ON pages(app_id);
CREATE INDEX ON pages(organization_id);
```

---

## RLS Policy Pattern

All RLS policies enforce both layers:

```sql
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project + org isolation" ON pages
  FOR ALL
  USING (
    app_id = current_setting('app.id', true)
    AND organization_id = (auth.jwt() ->> 'organization_id')::uuid
  )
  WITH CHECK (
    app_id = current_setting('app.id', true)
    AND organization_id = (auth.jwt() ->> 'organization_id')::uuid
  );
```

> `current_setting('app.id', true)` reads the `app.id` session variable set at runtime.

---

## Service Layer Pattern

Every query in `src/services/` must include both filters:

```ts
// ✅ Correct — both layers enforced
const { data } = await supabase
  .from('pages')
  .select('*')
  .eq('app_id', process.env.NEXT_PUBLIC_APP_ID!)
  .eq('organization_id', tenantId)

// ❌ Wrong — leaks data to other projects or other clients
const { data } = await supabase
  .from('pages')
  .select('*')
```

Grep check before merge:
```bash
grep -r "\.from('" src/services/ | grep -v "app_id"
```
Any match is a potential data leak — fix it before merging.

---

## Environment Variables

Each project using this Supabase gets its own `.env.local`:

```bash
# Shared Supabase credentials (same for all projects)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Project namespace (UNIQUE per project — this is the isolation key)
NEXT_PUBLIC_APP_ID=business-template
APP_ID=business-template
```

> **Never reuse the same `APP_ID` across two projects.** Use kebab-case slugs: `business-template`, `portfolio-site`, `booking-tool`, etc.

---

## Adding a New Project to This Supabase

1. Create the new project's `.env.local` with a unique `APP_ID`
2. Run the namespace migration (add `app_id` to all tables you'll use)
3. Seed an initial `organizations` row with the new `app_id`
4. Verify RLS: query from project A cannot return rows from project B

```sql
-- Quick isolation test (run in Supabase SQL editor)
SELECT * FROM pages WHERE app_id = 'other-project-slug';
-- Should return 0 rows when queried from business-template context
```

---

## Graduating a Project to Its Own Supabase

When a project outgrows the shared instance:

1. **Snapshot**: `npm run checkpoint` (captures full DDL)
2. **Export**: dump only rows where `app_id = 'your-project'`
3. **New Supabase**: create new project, apply DDL (drop the `app_id` column if you want, it's optional now)
4. **Update env**: change `NEXT_PUBLIC_SUPABASE_URL` and keys in `.env.local` / Vercel settings
5. **Remove** the `app_id` filter from service queries (optional cleanup)

Zero code changes required beyond env vars.

---

## Projects Using This Supabase

| Project | `APP_ID` | Status |
|---|---|---|
| business-template | `business-template` | Active |
| _(add future projects here)_ | | |

---

## Migration Safety Checklist

Before running any migration on the shared Supabase:

- [ ] Does this migration add a column? → Include `app_id` default on it
- [ ] Does this migration drop a column? → Check all projects use it or none do
- [ ] Does this migration rename a table? → Update service layer in ALL projects
- [ ] Does this migration change an RLS policy? → Test isolation across all active `app_id` values
- [ ] Run `npm run checkpoint` before and after

---

**Rule of thumb:** Treat this Supabase like a shared cloud. Namespace everything. Never assume you're the only project in it.
