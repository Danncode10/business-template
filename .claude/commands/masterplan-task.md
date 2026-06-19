---
name: masterplan-task
description: Execute a task from MASTERPLAN.md and auto-generate a test file in docs/tests/
trigger: /masterplan-task
---

# /masterplan-task — Run & Test Phase Tasks

Execute one task from MASTERPLAN.md, generate code, and create a dedicated test file under `docs/tests/`.

## Usage

```bash
/masterplan-task "Phase 0: Foundation & Auth Wiring - Strip template SaaS content"
/masterplan-task "Phase 1: Full Schema + Reference Data - Seed 82 provinces"
/masterplan-task "Phase 2: Report Submission Flow - Build ReportForm client component"
```

## What it does

1. **Read the task** from MASTERPLAN.md — exact spec, no guessing
2. **Implement the feature** — code changes in `src/`, `supabase/`, `scripts/`, etc.
3. **Create `docs/tests/` if it doesn't exist**
4. **Generate `docs/tests/<phase-slug>/<task-slug>.md`** containing:
   - What was built (1-paragraph summary)
   - Automated checks (Claude runs these and reports pass/fail inline)
   - Step-by-step manual verification (human follows in browser/terminal)
   - RLS smoke test (if the task touches DB or auth)
   - Common issues + troubleshooting
5. **Mark task** `[x]` in MASTERPLAN.md
6. **Output a conventional commit message** for copy-paste

## Folder structure produced

```
docs/
└── tests/
    ├── phase-0/
    │   ├── strip-template-content.md
    │   └── verify-auth-flow.md
    ├── phase-1/
    │   ├── seed-provinces.md
    │   └── apply-full-schema.md
    ├── phase-2/
    │   ├── report-form.md
    │   └── agency-routing.md
    └── ...
```

File names are kebab-case derived from the task description.

## Test file template

Each generated file follows this structure:

```md
# Test: <Task Name>

**Phase:** <phase number and name>
**Task:** <task ID, e.g. 2.6>
**Date:** <ISO date>

## What was built

<1-paragraph summary of what was implemented>

## Automated checks

Claude runs these after implementation and marks each pass/fail:

- [ ] `npm run build` exits 0
- [ ] `npm run update-types` exits 0 (if schema changed)
- [ ] <task-specific checks>

## Manual verification

Step-by-step for the human to follow:

1. <step>
2. <step>
3. ...

## RLS smoke test

*(Skip if task doesn't touch DB)*

1. Log in as a test `user` → confirm you can only see own reports
2. Log in as `provincial_admin` → confirm province-scoped access
3. Try to access another user's data → confirm 403 / empty result

## Common issues

| Symptom | Likely cause | Fix |
|---|---|---|
| ... | ... | ... |
```

## Output

```
✅ Phase 2, Task 2.6 — ReportForm — complete
📁 docs/tests/phase-2/report-form.md created
✔️  Task marked [x] in MASTERPLAN.md
📦 Commit message: feat: add report submission form with location picker
```

## Flags

- `--no-commit` — Skip the commit message output, review changes first
- `--dry-run` — Show what would be done without executing

## Notes

- **Task spec is law** — reads exact wording from MASTERPLAN.md, implements it as written
- **One file per task** — never append to an existing test file; create a new one
- **RLS is always checked** for any task that touches Supabase tables or auth
- **Never skip the docs/tests/ write** — even if implementation is trivial
