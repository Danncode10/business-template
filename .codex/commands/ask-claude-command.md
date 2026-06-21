---
description: Find the best .claude command for a plain-English task and return a ready-to-run /claude-command prompt.
argument-hint: <plain-English intent>
---

The user's goal: **$ARGUMENTS**

## Procedure

1. Read `AGENTS.md`, `CLAUDE.md`, and `.codex/context/claude-compatibility.md`.
2. Scan `.claude/commands/**/*.md`.
3. For each command, read only the YAML frontmatter and first heading or opening paragraph.
4. Choose the command or short command chain that best matches the user's goal.
5. Return a ready-to-run Codex prompt that uses `/claude-command`.

## Output Format

Return only this block:

```text
/claude-command <command-name> <arguments inferred from the user's goal>
```

If a chain is useful, return one command per line in execution order:

```text
/claude-command new-feature <feature>
/claude-command ui <target>
/claude-command review
```

If no existing command fits, return:

```text
/claude-command make-command "<one-sentence description of the command needed>"
```

