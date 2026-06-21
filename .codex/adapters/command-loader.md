# Command Loader Contract

This file defines the expected behavior for Codex-compatible Claude command
loading. It is intentionally written as an agent contract rather than executable
code so it can be followed by any Codex surface.

## Input

```text
/claude-command <command-name-or-path> [arguments]
```

## Resolution

Resolve the command in this order:

1. If input starts with `.claude/commands/`, use it as a relative path.
2. If input ends with `.md`, use it as a relative path.
3. Try `.claude/commands/<name>.md`.
4. Search `.claude/commands/**/<name>.md`.

If zero matches are found, suggest:

```text
/ask-claude-command <plain-English goal>
```

If more than one match is found, ask the user to choose the exact path.

## Execution

1. Read the resolved command file fully.
2. Strip YAML frontmatter only for execution, but retain it as metadata.
3. Replace `$ARGUMENTS` with the argument string.
4. Execute the resulting instruction under `AGENTS.md` and Codex environment
   rules.

## Non-Goals

- Do not duplicate all `.claude/commands` into `.codex/commands`.
- Do not translate Claude commands permanently unless the user asks.
- Do not run Claude hooks automatically from Codex.

