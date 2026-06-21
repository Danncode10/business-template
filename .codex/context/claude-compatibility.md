# Claude-to-Codex Compatibility

Use this guide when a `.claude/commands/*.md` prompt references Claude-specific
features.

## Translation Table

| Claude instruction | Codex behavior |
|---|---|
| Read `CLAUDE.md` | Read `AGENTS.md` first, then `CLAUDE.md`. |
| Run `/some-command` | Resolve and load `.claude/commands/some-command.md` through `/claude-command`. |
| `$ARGUMENTS` | Replace with the arguments passed after the command name. |
| Search Ruflo memory | Search local context files first: `PROJECT_CONTEXT.md`, docs, relevant source, and `.claude` docs. If Ruflo MCP is available, use it. |
| Store Ruflo memory | Summarize the decision in the response or update the relevant project context file only when explicitly asked. If Ruflo MCP is available, use it. |
| Spawn parallel agents | Use Codex subagents or parallel tool calls when available. Otherwise split the task internally and execute sequentially. |
| Claude hooks | Treat as advisory. Codex does not automatically run Claude Code hooks. |
| Claude Flow, swarms, hive mind | Use only if matching MCP/tools are connected. Otherwise preserve the intent with normal Codex planning and execution. |
| Use Opus | Use the active Codex model. Mention model-specific requirements only if they affect risk or scope. |

## Precedence

1. Current user instructions.
2. `AGENTS.md`.
3. Safety and filesystem rules from the active Codex environment.
4. `CLAUDE.md`.
5. The loaded `.claude/commands/*.md` prompt.
6. This compatibility guide.

## Missing Tools

When a loaded command requires an MCP that is not available, follow the Missing
Tool Alert Protocol from `AGENTS.md`, unless the user explicitly says to proceed
without discussing MCPs.

