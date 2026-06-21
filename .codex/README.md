# Codex Context for DannFlow

This folder teaches Codex how to work inside DannFlow while reusing the existing
Claude Code command library.

## Start Here

Codex should read these files before project work:

1. `AGENTS.md` - cross-agent project rules and guardrails.
2. `CLAUDE.md` - the richest project context and workflow source.
3. `.codex/context/dannflow.md` - Codex-specific operating notes.
4. `.codex/context/claude-compatibility.md` - how to translate Claude-only instructions.

## Commands

Use the Codex commands in `.codex/commands/`:

| Command | Purpose |
|---|---|
| `/claude-command <command> [args]` | Load and run the exact prompt from `.claude/commands/`. |
| `/ask-claude-command <intent>` | Route a plain-English task to the best existing Claude command. |

Examples:

```text
/claude-command ui src/components/BillingForm.tsx
/claude-command new-feature billing
/claude-command sync-upstream --commits 3
/ask-claude-command make the pricing page responsive and review it
```

## Source of Truth

Do not duplicate the Claude command library into `.codex`. The canonical command
prompts remain in `.claude/commands/`; Codex loads them on demand and applies the
compatibility rules in this folder.

