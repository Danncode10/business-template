---
description: Generates realistic, type-safe seed data from src/types/supabase.ts. Respects foreign keys and RLS ownership. Writes to supabase/seeds/.
argument-hint: <table-name> or "all" (optional --count=N, default 10)
---

Generate type-safe seed data for the table(s) named in `$ARGUMENTS`. Output as SQL INSERT statements in `supabase/seeds/`, ready to apply via Supabase MCP or `psql`.

## Procedure

0. **Check ruflo memory** — search for any prior decisions related to seed data generation, table dependency ordering, or realistic value strategies before generating. Apply stored patterns rather than re-inventing them.

1. **Parse `$ARGUMENTS`** — extract table name(s) and optional `--count=N` (default 10 rows per table). `all` means every table in the `public` schema.

2. **Read `src/types/supabase.ts`** — this is the source of truth for table shapes, column types, nullability, and enums. **Never** infer schema from anywhere else.

3. **Resolve dependency order** — if seeding multiple tables, topologically sort by foreign key dependencies. Parent tables first. Once the order is resolved, **spawn one agent per table in parallel** — each generates its SQL file independently. Collect all files, then write the dependency-ordered `seed-all-<ts>.sql` runner last.
   - If a circular FK is detected, stop and ask the user how to break the cycle.

4. **Generate realistic values per column type:**

   | Type | Strategy |
   |---|---|
   | `uuid` (PK) | `gen_random_uuid()` |
   | `uuid` (FK) | Reference a previously seeded row or existing `auth.users.id` |
   | `text` / `varchar` | Faker-style values matched to column name (`email` → email, `name` → full name, `bio` → sentence, `url` → URL) |
   | `int` / `bigint` | Sensible ranges based on column name (`age` → 18-80, `count` → 0-100) |
   | `numeric` / `decimal` | Same — match the name |
   | `boolean` | 70/30 true/false unless name suggests otherwise (`is_deleted` → mostly false) |
   | `timestamp` / `timestamptz` | Spread across last 30 days for `created_at`, future for `expires_at` |
   | `jsonb` | Realistic small object matching column name conventions |
   | enum types | Random valid value from the enum |
   | nullable columns | 80/20 populated/null |

5. **Honor RLS ownership** — if a table has a `user_id` column (or similar ownership FK to `auth.users`), distribute rows across 2-3 seed user IDs. Ask the user for these IDs if `auth.users` is empty; otherwise pick the first 3 existing users via the Supabase MCP.

6. **Output format** — write to `supabase/seeds/seed-<table>-<MM-DD-YYYY-HH-MM>.sql`:

   ```sql
   -- Seed: <table_name>
   -- Generated: <ISO timestamp>
   -- Rows: <count>
   -- Owner user_ids: <list, if applicable>

   INSERT INTO public.<table> (col1, col2, col3) VALUES
     ('val1', 'val2', 'val3'),
     ('val1', 'val2', 'val3'),
     ...;
   ```

   For `all`, write one file per table with the same timestamp, plus a `seed-all-<timestamp>.sql` that sources them in dependency order.

7. **Verify** — after writing, output a summary:
   ```
   ✅ Seeded <N> tables, <M> total rows
      supabase/seeds/seed-profiles-<ts>.sql      (10 rows)
      supabase/seeds/seed-posts-<ts>.sql         (10 rows, FK → profiles)
      supabase/seeds/seed-all-<ts>.sql           (dependency-ordered runner)

   To apply:
     • Via MCP: I can run apply_migration with this content — say "apply"
     • Via psql: psql $DATABASE_URL -f supabase/seeds/seed-all-<ts>.sql
   ```

8. **Wait for confirmation before applying.** Never auto-apply seed data to the live database.

## Constraints

- **Never edit `src/types/supabase.ts`** — it's auto-generated.
- **Never invent columns** that aren't in the types file.
- **Never seed `auth.users` directly** — Supabase manages that table. If you need test users, output a separate script that calls `supabase.auth.admin.createUser()` or instruct the user to seed via the Supabase dashboard.
- **Always namespace inserts with `public.`** to avoid schema ambiguity.
- **Never delete existing data.** Inserts only, no `TRUNCATE`, no `DELETE`.
- If a column has a `CHECK` constraint visible in the types or schema, respect it.
- If `supabase/seeds/` doesn't exist, create it.
- If `src/types/supabase.ts` is stale (older than the most recent `supabase/backups/` file), warn the user and suggest `/sync-types` first.
- Never `git add` or `git commit` — leave that for the user or `/commit`.

## Composition

```
/checkpoint        # safe rollback point
/seed all          # generate
# manually review the .sql files
/seed all → "apply"   # run via MCP after review
```
