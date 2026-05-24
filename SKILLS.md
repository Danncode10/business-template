# SKILLS.md — Claude Code Skills for DannFlow

> Skills are reusable capabilities Claude Code can invoke (e.g. `/security-review`, `/review`). They're managed globally (`~/.claude/skills/`) or via plugins — this file just documents **which skills matter for this project** and when to use them.

DannFlow is a **multi-tenant website builder and SaaS starter** — priorities are SEO + marketing (landing pages matter), lead capture, CMS, and RLS security (data isolation). This guide prioritizes skills accordingly.

## Recommended skills

| Skill | When to use it |
|---|---|
| **`init`** | Re-bootstrap `CLAUDE.md` from scratch. Use when the project pivots significantly or after a major refactor. Prefer `/init-claude` (project-specific custom command) for routine refreshes. |
| **`review`** | Run before opening a PR. Critiques the current branch's diff against project conventions in `CLAUDE.md`. |
| **`security-review`** | **Always run** before merging changes that touch: auth (`src/services/auth.ts`), RLS policies, Supabase queries, environment variables, or anything in `src/utils/supabase/`. Catches RLS bypasses and key leaks that `/security-audit` may miss. |
| **`simplify`** | Run after a feature lands. Reviews changed code for reuse, dead code, and over-engineering. |
| **`fewer-permission-prompts`** | Run once per fresh clone to auto-allowlist common Bash/MCP calls in `.claude/settings.json`. Reduces permission noise during normal dev. |

## Quality skill packs (installed by `install.sh`)

Three utility-oriented packs auto-installed on fresh clones. Refresh with `./guide.sh skills-update`.

| Skill | Source | When it auto-triggers |
|---|---|---|
| **`claude-api`** | [anthropics/skills](https://github.com/anthropics/skills) | Any file importing `@anthropic-ai/sdk` or `anthropic`. Enforces prompt caching, correct model IDs (Opus 4.7 / Sonnet 4.6 / Haiku 4.5), tool-use patterns, model migration. Install if/when DannFlow adds chat assistants, embeddings, or agents. |
| **`shadcn`** | [shadcn/ui](https://github.com/shadcn-ui/ui) | Any project with `components.json` (DannFlow has one). Provides up-to-date Shadcn component docs + composition patterns. Prevents the "raw `<button>` instead of `<Button>`" drift CLAUDE.md warns about. |
| **`a11y-audit`** | [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills) | WCAG 2.2 Level A/AA audits — color contrast, focus order, ARIA, alt text. Complements `/ui` (which enforces 48px targets + focus rings but doesn't check contrast/semantics). |

Manual install (idempotent):

```bash
npx skills add anthropics/skills@claude-api -y
npx skills add shadcn/ui@shadcn -y
npx skills add alirezarezvani/claude-skills@a11y-audit -y
```

## SEO + Marketing skill packs (installed by `install.sh`)

DannFlow is a SaaS starter, so it ships with two upstream packs covering everything from technical SEO to conversion optimization. Together they install **30+ auto-invoked skills**.

| Pack | Source | Highlights |
|---|---|---|
| **coreyhaines31/marketingskills** | [skills.sh](https://skills.sh/coreyhaines31/marketingskills) | `seo-audit` (116K+ installs), `programmatic-seo`, `ai-seo`, `schema`, `copywriting`, `copy-editing`, `cro`, `pricing`, `paywalls`, `signup`, `onboarding`, `churn-prevention`, `launch`, `ads`, `ad-creative`, `emails`, `cold-email`, `social`, `sms`, `referrals`, `directory-submissions`, `marketing-psychology`, `marketing-ideas`, `content-strategy`, `customer-research`, `competitor-profiling`, `competitors`, `site-architecture`, `popups`, `lead-magnets`, `sales-enablement`, `analytics`, `ab-testing`, `image`, `video`, `aso`, `revops`, `co-marketing`, `community-marketing`, `free-tools`, `product-marketing` |
| **addyosmani/web-quality-skills** | [skills.sh](https://skills.sh/addyosmani/web-quality-skills) | `seo` — Google Chrome team's technical SEO + Core Web Vitals patterns |

**Most relevant for website builders and B2B SaaS (prioritized):**

| Skill | When to use | Why |
|---|---|---|
| `seo-audit` (coreyhaines31) | "audit SEO", "meta tags", local SEO | **Core** — local search ranking (especially service/retail businesses) |
| `seo` (addyosmani) | Core Web Vitals, page-speed, indexing | **Core** — Google ranking factors |
| `copywriting` (coreyhaines31) | "write hero copy", "improve headline", services page copy | **Core** — first landing-page impression |
| `schema` (coreyhaines31) | "add JSON-LD", LocalBusiness markup | **Core** — local SEO relies on structured data |
| `marketing-psychology` (coreyhaines31) | "improve call-to-action", trust-building copy | **High** — leads depend on persuasion |
| `programmatic-seo` (coreyhaines31) | "generate blog posts at scale", location pages | **High** — blog scales SEO reach |
| `cro` (coreyhaines31) | "why aren't leads converting", form optimization | **Med** — lead-quality matters |
| `pricing` (coreyhaines31) | service/product pricing strategy | **Med** — if client sells services |
| `launch` (coreyhaines31) | go-live strategy, domain switchover | **Low** — one-time per site deployment |

**Tip — start here:** run `product-marketing` (coreyhaines31) on a fresh project to create `.agents/product-marketing.md` (ICP + positioning + value props). All the other Corey skills reference it, so you avoid repeating positioning context in every prompt.

These skills pair with the `/seo-check`, `/seo-fix`, and `/marketing-check` slash commands — commands enforce deterministic per-route checks; skills bring strategic judgment.

Manual install (idempotent):

```bash
npx skills add coreyhaines31/marketingskills --all
npx skills add addyosmani/web-quality-skills@seo -y
```

## Supabase agent skills (install separately)

Install once per machine:

```bash
npx skills add supabase/agent-skills
```

This adds Supabase-specific guidance for migrations, RLS policy design, and edge functions. Recommended by the Supabase MCP server.

## Design taste skill packs (three upstream sources)

`install.sh` installs three complementary design-taste skill packs. Refresh them anytime with:

```bash
./guide.sh skills-update
# or individually (--all skips the interactive picker):
npx skills add https://github.com/Leonxlnx/taste-skill --all
npx skills add https://github.com/emilkowalski/skill --all
npx skills add https://github.com/pbakaus/impeccable --all
```

All three install into `.agents/skills/<name>/` and symlink into `.claude/skills/<name>/`. Re-running is idempotent.

### Pack 1: Leonxlnx/taste-skill (12 skills, Low Risk)

Broad design-taste enforcement. Most relevant for DannFlow:

| Skill | When to use |
|---|---|
| **`design-taste-frontend`** | Default polish pass after `/ui`. Upgrades visual hierarchy, spacing rhythm, component polish. |
| **`redesign-existing-projects`** | Audit + upgrade an existing page (dashboard, profile, settings). |
| **`high-end-visual-design`** | Landing pages, marketing surfaces, "expensive feel". |
| **`minimalist-ui`** | Editorial/clean style — good default for a dev-tool starter. |
| **`full-output-enforcement`** | Prevents truncation on long generations (scaffolding many components). |

Lower priority: `gpt-taste` (GPT-tuned), `industrial-brutalist-ui` (off-brand), `stitch-design-taste` (Google Stitch format), `brandkit` / `imagegen-*` / `image-to-code` (need image-gen model).

### Pack 2: emilkowalski/skill (1 skill, Low Risk)

| Skill | When to use |
|---|---|
| **`emil-design-eng`** | Animation + micro-interaction craft. Use when adding/reviewing transitions, hover states, popovers, drawers, sheets. Enforces `ease-out` over `ease-in`, `scale(0.95)+opacity:0` over `scale(0)`, `:active` press states, popover transform-origin. Outputs Before/After/Why markdown table on review. |

Pairs naturally with Sonner + Vaul (in stack) and Framer Motion.

### Pack 3: pbakaus/impeccable (1 skill, ⚠️ Med Risk)

| Skill | When to use |
|---|---|
| **`impeccable`** | Broad UI critique covering design, redesign, audit, polish, animate, clarify, distill, harden. 27 deterministic anti-pattern rules (overused fonts, gray-on-color text, excessive cards) plus 23 invocation commands documented in its SKILL.md. Also ships an `npx impeccable detect <path>` CLI scanner. |

> ⚠️ **Security scanners flagged this pack as Medium Risk** (Gen + Snyk; the other two were Low Risk). Skim `.agents/skills/impeccable/SKILL.md` before relying on it for autonomous changes. Risk likely stems from the breadth of permissions its 23 commands request, not malware — but worth eyeballing.

### How the three packs compose

Don't fire taste skills before `/ui` — you'll polish a layout that may get restructured.

```
/ui                       # hard rules: responsive, 48px targets, semantic tokens, a11y
design-taste-frontend     # broad visual polish (Leonxlnx)
emil-design-eng           # motion + interaction craft (Emil) — for animated/interactive surfaces
impeccable                # critique pass with anti-pattern checks (pbakaus)
/review                   # pre-PR lint + typecheck + CLAUDE.md guardrails
/commit
```

Pick by surface — you don't need all four taste skills on every change:
- **Static page** → `design-taste-frontend` alone
- **Animated component** (drawer, modal, dropdown) → add `emil-design-eng`
- **Pre-merge audit of a big visual change** → run `impeccable` last

## Skills NOT relevant to this project

Skip these — they don't fit the stack:

- `anthropic-skills:docx` / `xlsx` / `pdf` / `pptx` — DannFlow doesn't produce office documents
- `update-config` — only needed when reshaping `.claude/settings.json` (rare)
- `keybindings-help` — personal IDE config, not project concern
- `schedule` / `loop` — for recurring agents, not in scope here

## How skills relate to custom commands

| Layer | Where defined | Scope |
|---|---|---|
| **Skill** | `~/.claude/skills/` or plugins | Global, reusable across all your projects |
| **Custom command** | `.claude/commands/*.md` (in this repo) | Project-specific, encodes DannFlow conventions |

Rule of thumb: if the workflow is **DannFlow-specific** (RLS check against `src/services/`, schema sync via `npm run update-types`), it's a custom command. If it's **generally useful** (security review of any diff), it's a skill.
