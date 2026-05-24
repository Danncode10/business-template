---
name: masterplan-task
description: Execute a task from MASTERPLAN.md and auto-generate TEST.md verification guide
trigger: /masterplan-task
---

# /masterplan-task — Run & Test Phase Tasks

Execute one task from MASTERPLAN.md, generate code, and auto-create verification guide in TEST.md.

## Usage

```bash
/masterplan-task "Phase 1: Core Auth & Tenant Setup - Gmail SMTP Setup"
/masterplan-task "Phase 2: Team Roles & Permissions - Create team_members table"
/masterplan-task "Phase 5: Admin Dashboard Pages - Pages & Sections Schema"
```

## What it does

1. **Reads task** from MASTERPLAN.md (exact spec, no guessing)
2. **Implements feature** (code changes in src/, supabase/, etc.)
3. **Generates TEST.md section** with:
   - Automated test checks (Claude verifies)
   - Step-by-step manual verification (human follows)
   - Common issues + troubleshooting
4. **Marks task** [x] in MASTERPLAN.md
5. **Commits changes** (with conventional message)

## Output

```
✅ Phase 1: Gmail SMTP Setup — complete
📋 See TEST.md for verification steps
✔️ Task marked [x] in MASTERPLAN.md
📦 Changes committed: feat: implement gmail smtp setup
```

## Verification

After `/masterplan-task` completes:

1. **Automated tests** — Run the test script:
   ```bash
   npm run test:auth    # If Phase 1 test script exists
   ```

2. **Manual verification** — Follow step-by-step guide in TEST.md:
   ```
   ## Gmail SMTP Setup
   
   #### Manual Verification Steps
   1. Open src/lib/config.ts
   2. Verify GMAIL_USER is set...
   3. ...
   ```

3. **Mark complete** — Check off items in TEST.md as you verify

## Common flags

- `--no-commit` — Don't auto-commit, review changes first
- `--dry-run` — Show what would be done, don't execute

## Notes

- **Task spec is law** — Command reads exact task from MASTERPLAN.md, implements it exactly
- **Testing first** — Each task generates its own TEST.md section
- **RLS verified** — For security-critical tasks, RLS checks are part of TEST.md
- **Works cross-template** — Use this with any DannFlow template that has MASTERPLAN.md
