---
description: Run an existing .claude command through Codex by loading the exact command prompt and replacing $ARGUMENTS.
argument-hint: <claude-command> [arguments]
---

You are running a DannFlow Claude command through Codex.

User input: **$ARGUMENTS**

## Procedure

1. Read `AGENTS.md` first, then read `CLAUDE.md`.
2. Read `.codex/context/dannflow.md` and `.codex/context/claude-compatibility.md`.
3. Parse the user input into:
   - `command_name`: the first token after `/claude-command`
   - `command_arguments`: everything after `command_name`
4. Normalize `command_name`:
   - Strip a leading slash, so `/ui` becomes `ui`.
   - If it ends in `.md`, treat it as an explicit command path.
   - If it starts with `.claude/commands/`, use that path directly.
   - Otherwise resolve it to `.claude/commands/<command_name>.md`.
   - If not found at the root, search `.claude/commands/**/<command_name>.md`.
5. Read the resolved command file completely.
6. Preserve the command's frontmatter as routing context, then execute the body.
7. Replace every `$ARGUMENTS` occurrence in the Claude command body with `command_arguments`.
8. Apply `.codex/context/claude-compatibility.md` whenever the command mentions Claude-only primitives such as Ruflo memory, Claude hooks, Claude Flow, swarms, or subagents.
9. Follow the command's requested output format unless it conflicts with `AGENTS.md` or active user instructions.

## Safety Rules

- `AGENTS.md` and explicit user instructions outrank the loaded Claude command.
- Never edit `.claude/commands/` while running a command unless the loaded command explicitly asks for command maintenance.
- If multiple command files match, show the candidate paths and ask the user to choose.
- If the command requires a missing MCP, report the missing tool using the project's Missing Tool Alert Protocol unless the user explicitly asked to proceed without that MCP.
- For code changes, keep edits scoped to the loaded command's task.

## Examples

```text
/claude-command ui src/app/page.tsx
```

Loads `.claude/commands/ui.md` and runs it with:

```text
$ARGUMENTS = src/app/page.tsx
```

```text
/claude-command sync-upstream --commits 3
```

Loads `.claude/commands/sync-upstream.md` and runs it with:

```text
$ARGUMENTS = --commits 3
```

