# Powering Up the AI (The MCP Trinity)

To make "DannFlow" work, the AI needs three sets of tools:

### 1. Supabase MCP (The Database Brain)
- **Purpose**: Allows the AI to create tables, write SQL, and check RLS policies automatically.
- **Setup**: Use your Supabase Access Token from Account Settings.
- **Hosted HTTP URL**: `https://mcp.supabase.com/mcp`
- **Safer read-only inspection**: `https://mcp.supabase.com/mcp?read_only=true`
- **Project-scoped access**: `https://mcp.supabase.com/mcp?project_ref=<project-ref>`

For a shared Supabase project, start read-only when auditing tenant state. Turn
on full access only when applying a known migration or provisioning a known
client/org. Always name the exact project and client before making changes.

### 2. GitHub MCP (The Memory)
- **Purpose**: Allows the AI to "Time Travel." It can compare why your code worked yesterday but broke today without you copying and pasting long diffs.
- **Setup**: Use a GitHub Personal Access Token with repo scopes.

### 3. Terminal MCP (The Hands)
- **Purpose**: Allows the AI to run commands like `npm install` or `npm run update-types` for you.
- **Setup**: Enable "Terminal" or "Shell" access in your agent settings (Claude Code, Cursor, or Antigravity).

### 4. Ruflo MCP (Memory + Orchestration) — Beta

- **Purpose**: Adds persistent memory tools, swarms, hooks, and project agents to Claude Code.
- **Status**: Currently in **beta** — we always install `ruflo@latest`.
- **Global install (once per machine, required BEFORE any per-project init):**
  ```bash
  npm install -g ruflo@latest
  claude mcp add ruflo -- npx ruflo@latest mcp start
  ```
- **Per-project init (run only after the global install above):**
  ```bash
  cd your-project
  npx ruflo@latest init wizard
  ```

> The DannFlow `install.sh` runs both steps automatically. If you set up manually, follow the order strictly: **global install → MCP register → `init wizard`**.
