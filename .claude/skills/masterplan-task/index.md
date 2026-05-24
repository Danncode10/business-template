---
name: masterplan-task
description: Parse MASTERPLAN.md tasks and auto-generate TEST.md verification guides
versions:
  - 1.0.0
---

# Masterplan Task Executor

## Overview

This skill enables `/masterplan-task <phase-description>` command that:
1. Parses the exact task from MASTERPLAN.md
2. Implements the feature (no hallucination — reads spec)
3. Auto-generates TEST.md section with verification steps
4. Marks task complete in MASTERPLAN.md

## How It Works

### Step 1: Parse Task Spec
When user runs `/masterplan-task "Phase 1: Core Auth & Tenant Setup - Gmail SMTP Setup"`:
- Search MASTERPLAN.md for matching phase/task
- Extract:
  - Task description
  - Sub-tasks (all [ ] items under the task)
  - Acceptance criteria
  - Time estimate
  - Blockers

### Step 2: Generate Implementation Plan
- Break sub-tasks into concrete implementation steps
- Map to files that need to be created/modified
- Note any Supabase schema changes needed
- Identify tests/verification steps

### Step 3: Implement Feature
- Create/modify code files
- Run migrations if needed
- Update types if schema changed
- Follow project conventions (RLS, service layer, semantic tokens, etc.)

### Step 4: Generate TEST.md Section
For each sub-task, create a TEST.md section with:

```markdown
## [Feature Name]

**Status:** Complete  
**Date:** [today]  
**Tested by:** Claude + Human

### Automated Tests
- [x] Test description
- [ ] Test description
- Run: `npm run test:auth`

### Manual Verification Steps
1. **Setup Check**
   - [ ] Step 1
   - [ ] Step 2
   
2. **Feature Test**
   - [ ] User action 1
   - [ ] Expected result 1
   - [ ] User action 2
   - [ ] Expected result 2

3. **Edge Cases**
   - [ ] Invalid input handling
   - [ ] Error message displays

### Common Issues
- **Issue:** Solution
- **Issue:** Solution

### Acceptance Criteria Met?
- [x] AC 1
- [x] AC 2
```

### Step 5: Mark Task Complete
- Find task in MASTERPLAN.md
- Change `[ ]` → `[x]`
- Commit all changes with conventional message format

## TEST.md Structure

Each TEST.md section follows this pattern:

```
## Feature Name

**Status:** Complete/In Progress  
**Date:** YYYY-MM-DD  
**Tested by:** Claude + Human  

---

### Automated Tests (Claude runs)
- [x] Specific test 1
- [x] Specific test 2
- [ ] (blank for human to run)

### Manual Verification Steps (Human follows)
1. **Section 1: Setup**
   - [ ] Setup check 1
   - [ ] Setup check 2

2. **Section 2: Happy Path**
   - [ ] User action
   - [ ] Expected result
   - [ ] Verify X changed

3. **Section 3: Edge Cases**
   - [ ] Invalid input
   - [ ] Error handling
   - [ ] Boundary conditions

### Common Issues & Solutions
- **Issue:** Clear description → Solution
- **Issue:** Clear description → Solution

### Acceptance Criteria Met?
- [x] AC from MASTERPLAN.md
- [x] AC from MASTERPLAN.md
```

## Security & Quality Checks

For all tasks:
- ✅ RLS policies verified (if schema changes)
- ✅ Type safety (no `any`)
- ✅ Semantic tokens only (no hardcoded colors)
- ✅ Server Components default (`'use client'` justified)
- ✅ Service layer pattern (no DB logic in components)
- ✅ Conventional commit message

## Usage Examples

### Example 1: Auth Phase
```bash
/masterplan-task "Phase 1: Core Auth & Tenant Setup - Gmail SMTP Setup"
```

**Output:**
- `src/lib/email.ts` (Resend/Gmail setup)
- `src/services/auth.ts` (magic link functions)
- Test scripts in `npm run test:auth`
- TEST.md section added with full verification steps
- MASTERPLAN.md: `[ ] Gmail SMTP Setup` → `[x] Gmail SMTP Setup`

### Example 2: Schema Phase
```bash
/masterplan-task "Phase 2: Team Roles & Permissions - Create team_members table"
```

**Output:**
- `supabase/migrations/TIMESTAMP_create_team_members.sql`
- `src/types/supabase.ts` auto-updated (via `npm run update-types`)
- `src/services/team.ts` (team queries)
- RLS policies verified in TEST.md
- Checkpoint updated

### Example 3: UI Phase
```bash
/masterplan-task "Phase 5: Admin Dashboard Pages - Pages & Sections Schema"
```

**Output:**
- Component files created
- Service layer queries
- Admin UI pages
- TEST.md with visual verification steps
- Task marked complete

## Commit Message Format

```
feat: implement [feature name]

- Detailed change 1
- Detailed change 2
- Detailed change 3

Closes: MASTERPLAN.md Phase X
Test: See TEST.md for verification
```

## Tips & Constraints

- **Read MASTERPLAN.md first** — It's the source of truth, not your memory
- **Sub-tasks are mandatory** — Implement all [ ] items under the task
- **Acceptance criteria are gates** — Don't skip any
- **TEST.md is audit trail** — It proves what was tested
- **One command per task** — Run `/masterplan-task` once per task (not per sub-task)
- **RLS is non-negotiable** — Always include `organization_id` filters for multi-tenant projects

## Integration with Templates

Works with any DannFlow template that has:
- `MASTERPLAN.md` (with phases and tasks)
- `.claude/` folder (for commands/skills)
- `TEST.md` (or creates it)

Templates confirmed:
- ✅ business-template
- ✅ (others coming)
