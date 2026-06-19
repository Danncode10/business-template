# The "Time Machine" Workflow — Database Backups & Type Sync

When you are "Vibe Coding," you will change your database frequently. This loop keeps your AI's view of the schema honest and gives you a restore point if something breaks.

> **Two kinds of "sync" in DannFlow.** This doc covers **database** sync — keeping `src/types/supabase.ts` and your backups aligned with the live schema. For **template** sync — pulling command/doc updates from DannFlow upstream — see [branching-and-sync.md](branching-and-sync.md).

## The loop

1. **Change**: Tell Claude Code to modify the DB (via the Supabase MCP, or `/migrate <description>`).
2. **Sync types**: Run `npm run update-types` (or `/sync-types`) to refresh `src/types/supabase.ts` — the AI's "Eyes." Never let it guess the schema.
3. **Checkpoint**: Every time you finish a feature, run `npm run checkpoint` (or `/checkpoint`).
   - The script verifies your Supabase MCP connection and generates a prompt.
   - Claude Code reads your live Supabase schema (tables, enums, RLS policies, triggers, functions) via MCP.
   - It writes a new timestamped DDL snapshot under `supabase/backups/`.
   - Example: `supabase/backups/schema-2026-06-18-21-00.sql`.

## Restoring

If you ever break your DB, "restore" by copying the SQL from your most recent checkpoint file in `supabase/backups/` into the Supabase SQL Editor and running it.

## The golden rule

**Change → Sync types → Checkpoint.** Do the type-sync *immediately* after any schema change so the AI never works against a stale `src/types/supabase.ts`. Checkpoint before anything destructive so you always have a way back.

## See also

- [branching-and-sync.md](branching-and-sync.md) — pulling template updates from DannFlow upstream (a different kind of sync).
- [the-holy-trinity.md](the-holy-trinity.md) — why Types + Schema + Services must stay aligned.
