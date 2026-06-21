# Business Template Notes for Codex

Business Template is a multi-tenant client website platform built on DannFlow.
It uses Next.js 15+, React 19, Supabase, Tailwind v4, and Shadcn/UI.

Each client is isolated by `organization_id`, and shared developer namespace
tables can also require `app_id`. Treat these as security boundaries.

## Operating Order

1. Read `AGENTS.md` before taking action.
2. Read `CLAUDE.md` for richer project context.
3. For feature work, check `PROJECT_CONTEXT.md` if present.
4. For new features, check `src/prompts/features/` before scaffolding.
5. Keep business logic and Supabase queries in `src/services/`.
6. Use generated types from `src/types/supabase.ts`; never use `any`.

## Database Discipline

Assume RLS is active on every table. Service queries must include explicit
`organization_id`, `app_id`, user, or ownership filters unless the endpoint is
intentionally public.

Before schema-sensitive work:

```bash
npm run checkpoint
npm run update-types
```

Use Supabase MCP for live schema reads and migrations when available.

## UI Discipline

Use Tailwind and Shadcn semantic tokens only:

- Backgrounds: `bg-background`, `bg-card`, `bg-muted`
- Text: `text-foreground`, `text-muted-foreground`, `text-primary`
- Borders: `border`, `border-border`, `border-input`
- Brand: `bg-primary`, `text-primary-foreground`

Avoid raw `button` elements for app UI. Use Shadcn `Button`.

## Codex Command Bridge

The `.claude/commands/` files remain the command source of truth. Codex should
load those prompts through `.codex/commands/claude-command.md` instead of copying
or rewriting them.
