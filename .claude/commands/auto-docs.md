---
description: Audits the entire repo for documentation drift — commands, skills, npm scripts, env vars, tech stack, and folder structure — and reports or auto-patches gaps. Broader superset of /sync-commands.
argument-hint: (optional --fix to auto-patch, --scope=commands|skills|scripts|env|stack|all)
---

Audit DannFlow's documentation surface for drift against the real state of the codebase. Report every gap, grouped by source, then optionally auto-patch.

> **Relationship to `/sync-commands`:** `/sync-commands` only audits commands. `/auto-docs` audits everything below. If you only changed `.claude/commands/`, prefer `/sync-commands` — it's faster.

## Procedure

0. **Check ruflo memory** — search for any prior decisions related to documentation drift detection, DannFlow updates, or doc sync strategies before auditing. Apply stored patterns rather than re-inventing them.

## Scope

By default audit all six surfaces. Use `--scope=<name>` to narrow.

| Scope | What's checked | Sources of truth | Docs that must reflect it |
|---|---|---|---|
| `commands` | Top-level `.md` files in `.claude/commands/` (excluding `README.md`, subdirs, and `claude-flow-*.md`) | `.claude/commands/*.md` frontmatter | `docs/dannflow_docs/claude-workflow.md`, `.claude/commands/README.md`, `guide.sh` (commands helper) |
| `skills` | Skills in `.claude/skills/` (symlinks into `.agents/skills/`) | `.claude/skills/*/SKILL.md` frontmatter | `SKILLS.md`, `README.md` (Design Taste + Quality sections), `docs/dannflow_docs/claude-workflow.md` |
| `scripts` | npm scripts in `package.json` | `package.json` `"scripts"` block | `README.md`, `CLAUDE.md` workflow sections |
| `env` | Required env vars in `.env.example` | `.env.example` | `README.md` Environment Variables section |
| `stack` | Major deps (Next, React, Supabase, Tailwind, TanStack Query, Framer Motion, Sonner, etc.) | `package.json` `"dependencies"` | `CLAUDE.md` Tech stack section, `README.md` features table |
| `structure` | Top-level folders under `src/` | filesystem | `CLAUDE.md` Project structure, `README.md` |

## Procedure

1. **Determine scope** — read `$ARGUMENTS`. Default to `all`. Parse `--fix` flag separately.

2. **Run scopes in parallel** — each scope (commands, skills, scripts, env, stack, structure) reads different sources and writes to different doc sections. Spawn one agent per scope simultaneously. Merge results before generating the report.

3. **For each scope, build two sets:**
   - **Reality set** — what exists on disk (commands, skills, scripts, deps, env vars, folders).
   - **Documented set** — what each doc claims exists.

4. **Compute diffs:**
   - `Reality - Documented` → missing from docs (orphans)
   - `Documented - Reality` → stale in docs (references things that no longer exist)

5. **Skip Ruflo namespace** — same exclusions as `/sync-commands`:
   - `.claude/commands/<subdirs>/` (agents, sparc, swarm, github, etc.)
   - `.claude/commands/claude-flow-*.md`
   - `.claude/skills/` entries that came from Ruflo install (anything under `.agents/` is fine; only flag drift for our 6 curated packs + their skills).

6. **Generate the report** in the format below.

7. **If `--fix` was passed**, ask for confirmation, then apply patches:
   - Add missing rows to tables (commands, skills, scripts, env vars).
   - Remove stale rows referring to deleted items.
   - For `stack` and `structure` drift, **never auto-patch** — only report. These changes need human judgment about how to phrase the docs.

## Output format

```
📋 DannFlow Documentation Audit
Scope: <scopes audited>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMMANDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
On disk: <N> | Documented in claude-workflow.md: <M> | In .claude/commands/README.md: <K>

Missing from docs:
  - /<command-name>
    Description: <from frontmatter>
    Suggested category: <inferred>
    Add to: claude-workflow.md, .claude/commands/README.md

Stale references (in docs but not on disk):
  - /<command-name> referenced in claude-workflow.md:<line>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SKILLS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Installed: <N> | Documented in SKILLS.md: <M>

Missing from SKILLS.md:
  - <skill-name> (pack: <source>)
    Description: <from SKILL.md frontmatter>

Stale references:
  - <skill-name> referenced but no longer installed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NPM SCRIPTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
In package.json: <N> | Mentioned in README/CLAUDE.md: <M>

Missing from docs:
  - npm run <script>: <inferred purpose>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENV VARS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
In .env.example: <N> | In README Environment Variables section: <M>

Missing from README:
  - <VAR_NAME>: <comment from .env.example, if any>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TECH STACK (report-only — no auto-fix)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Drift detected:
  - CLAUDE.md says "Tailwind CSS v4" — package.json has "tailwindcss@^3.x"
  - README features table mentions Stripe — no `stripe` dep installed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FOLDER STRUCTURE (report-only — no auto-fix)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Drift detected:
  - CLAUDE.md describes src/hooks/ — folder does not exist
  - src/services/payments/ exists — not documented

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Clean: <list of scopes with no drift>
⚠ Drift: <list of scopes with drift>

Auto-fixable: <count> issues (rerun with --fix)
Manual review needed: <count> issues (stack/structure)
```

## Constraints

- **Read-only by default.** Only `--fix` writes.
- **Never** modify files in `.claude/commands/<subdirs>/` or any `claude-flow-*.md` file — Ruflo namespace.
- **Never** delete a command file from disk based on doc drift — drift means update the doc, not delete the code.
- When `--fix` runs, always show the exact diff and ask "Proceed? (y/n)" before writing.
- Preserve formatting of all docs (markdown tables, section order, blank lines).
- If a command's category is ambiguous, ask the user to clarify before patching.
- Never `git add` or `git commit` — leave that for the user or `/commit`.

## When to use this vs siblings

- `/sync-commands` — commands only, faster, narrower.
- `/no-conflict` — looks for *semantic* conflicts (e.g. README says "uses Stripe" but code doesn't). Overlap with `/auto-docs --scope=stack` but `/no-conflict` is read-only and judgement-heavy.
- `/auto-docs` — broadest. Use after a session that added/removed any of: a command, a skill, an npm script, an env var, a major dep, a top-level folder.
