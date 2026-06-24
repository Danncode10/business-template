---
description: Scaffolds a new feature end-to-end — service file, types, App Router page, and Shadcn form following the Card pattern.
argument-hint: <feature-name>
---

Scaffold a new feature: **$ARGUMENTS**

**Procedure:**

0. **Check ruflo memory** — search for any prior decisions related to `$ARGUMENTS` or its domain (e.g. if scaffolding "billing", search "billing", "stripe", "payments"). Surface relevant choices (library picks, schema decisions, design patterns) before writing any code.

1. **Check for a blueprint** — list `src/prompts/features/` and look for a file matching `$ARGUMENTS` or close to it. If one exists, follow it. If not, proceed with the default scaffolding below.

2. **Confirm requirements** with the user before writing files. Ask (briefly):
   - What's the primary user action? (create / view / edit / delete data?)
   - Does it need a new Supabase table? If yes:
     - Suggest running `/checkpoint` first
     - Create the table via Supabase MCP after showing the SQL and getting confirmation
     - **CRITICAL for multi-tenancy:** table MUST have `organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE` as the first column
     - Define RLS policies enforcing `organization_id` filter from `auth.jwt() ->> 'organization_id'`
   - Should it be a protected route (under `src/app/dashboard/`) or public?

3. **Scaffold these files** (use feature name in kebab-case for paths, PascalCase for components). These four artifacts are independent — **spawn parallel agents** for service, page, component, and types simultaneously when the feature scope is clear:
   - Agent A → `src/services/<feature-name>.ts`
   - Agent B → `src/app/<route>/page.tsx` + `loading.tsx` + `error.tsx`
   - Agent C → `src/components/<FeatureName>Form.tsx`
   - Agent D → any new type definitions needed

   (Skip the parallel split for small or ambiguous features — use judgement.)

   - **`src/services/<feature-name>.ts`** — service layer
     - Import typed Supabase client from `src/utils/supabase/server.ts`
     - Define functions using types from `src/types/supabase.ts` (no `any`)
     - **CRITICAL for multi-tenancy:** Every query MUST include `.eq('organization_id', tenantId)` (tenant isolation)
     - ALSO include user/ownership filter when applicable (RLS-compliant)
     - Example: `.from('pages').select('*').eq('organization_id', tenantId).eq('created_by', userId)`
     - Async/await, return typed results

   - **`src/app/<route>/page.tsx`** — Server Component by default
     - Fetch initial data via the service
     - Pass data as props to a Client Component if interactivity is needed
     - Include `loading.tsx` and `error.tsx` siblings

   - **`src/components/<FeatureName>Form.tsx`** (if applicable) — `'use client'`
     - Shadcn `<Card>` → `<CardHeader>` → `<CardContent>` → `<CardFooter>` structure
     - Labels above inputs (never placeholder-only)
     - Focus rings, error states (`text-destructive`)
     - Loading state on submit button
     - 48px minimum touch targets
     - Toast notifications via Sonner on success/error

4. **Wire it up** — if there's a navigation surface (e.g. `dashboard-shell.tsx`), add a link/tab entry.

5. **After scaffolding, run `/ui`** mentally on what you just wrote — verify semantic tokens, no hex, no raw `<button>`.

6. **Save to ruflo memory** — store key decisions made during scaffolding: library choices, schema shape, auth approach, any "why not" decisions. One entry per distinct decision.

7. **Report** what was created with file paths, then suggest:
   - Running `npm run dev` to test
   - Running `/review` before committing
   - The conventional commit message

**Constraints:**
- Never use `any`. If a type is missing, generate it in `src/types/` or use a `Database['public']['Tables'][...]` lookup.
- Never put DB calls in components. All Supabase queries go in `src/services/<feature-name>.ts`.
- Default to Server Components. Add `'use client'` only when state/events/browser APIs require it.
