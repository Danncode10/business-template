---
description: Reads business.json + README.md + MASTERPLAN.md + config.ts, syncs business values into the codebase, and prints a full setup status report. Run this first whenever you clone the template or hand it off to a new client.
argument-hint: [--sync] [--report-only]
---

You are initializing the business template for a specific client or project.

## Step 0 — Search ruflo memory

Before reading anything, search ruflo memory (`mcp__ruflo__memory_search`) for:
- The business name or client name
- Any prior setup decisions for this project

List what you find (or note "no prior memory").

## Step 1 — Read all source files in parallel

Read these files simultaneously:

1. `business.json` — business identity, contact, hours, branding, socials, features, deployment
2. `README.md` — project overview and tech stack
3. `CLAUDE.md` — guardrails and architecture rules
4. `MASTERPLAN.md` — phase plan and what's been built vs. pending
5. `src/lib/config.ts` — current coded config values
6. `.env.example` — current env var template
7. `.env.local` (if exists) — current local env overrides (note: never print secret values)

If `business.json` does not exist, stop and say:

> `business.json` not found. Create it by running:
> ```bash
> cp business.json.example business.json
> ```
> Then fill in your business details and re-run `/business-init`.

## Step 2 — Parse and validate business.json

Extract and validate these fields from `business.json`:

**Required (warn if missing/placeholder):**
- `business.name` — must not be "Your Business Name"
- `business.tagline`
- `contact.email` — must not be "hello@example.com"
- `contact.phone`
- `contact.address`
- `deployment.appId` — must match `NEXT_PUBLIC_APP_ID` in env

**Optional but recommended:**
- `branding.logoUrl`
- `contact.googleMapsUrl`
- `socials.*` (at least one social link)
- `seo.ogImage`
- `deployment.domain`
- `supabase.projectRef`

**Features check:**
- Note which `features.*` are `true` vs `false`

## Step 3 — Diff business.json against current codebase

Compare `business.json` values against:

- `src/lib/config.ts` — is `siteConfig.name`, `.description`, `.contact.*`, `.socials.*`, `.socialProof.*` in sync with `business.json`?
- `.env.example` — does `NEXT_PUBLIC_APP_ID` match `deployment.appId`?

List every field that is **out of sync** (business.json differs from config.ts).

## Step 4 — Sync (unless --report-only)

If `--report-only` flag is passed, skip this step.

Otherwise, apply ALL out-of-sync values:

### Sync to `src/lib/config.ts`

Update `siteConfig` with values from `business.json`:

```ts
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "<business.business.name>",
  description: "<business.business.description>",
  url: process.env.NEXT_PUBLIC_SITE_URL || "<contact.website>",
  githubUrl: process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/Danncode10",
  socialProof: {
    rating: "<socialProof.rating>",
    ratingSource: "<socialProof.ratingSource>",
    customers: "<socialProof.customers>",
    yearsInBusiness: "<socialProof.yearsInBusiness>",
  },
  contact: {
    email: "<contact.email>",
    phone: "<contact.phone>",
    address: "<contact.address>",
  },
  hours: { ...from business.json hours object },
  socials: {
    twitter: "<socials.twitter or '#'>",
    instagram: "<socials.instagram or '#'>",
    linkedin: "<socials.linkedin or '#'>",
  },
} as const;
```

Only edit `siteConfig` — preserve `creatorRepos` and other exports unchanged.

### Sync to `.env.example`

Ensure `.env.example` has these non-secret vars (add if missing):
```
NEXT_PUBLIC_APP_ID=<deployment.appId>
NEXT_PUBLIC_SITE_NAME=<business.business.name>
NEXT_PUBLIC_SITE_URL=<contact.website>
```

Do NOT add secret keys to `.env.example`.

### Sync sitemap/robots if domain is set

If `deployment.domain` is non-null, update `src/app/sitemap.ts` and `src/app/robots.ts` to use the domain.

## Step 5 — Run TypeScript check

After syncing, run `npx tsc --noEmit` to confirm the build is clean.

If it fails, show the errors and fix them before proceeding to the report.

## Step 6 — Print the setup status report

Output a formatted report:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  /business-init — Setup Report
  Business: <business.name>
  Vertical: <vertical>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Identity
   Name:        <name>
   Tagline:     <tagline>
   Industry:    <industry>
   Vertical:    <vertical>

✅ / ⚠️  Contact
   Email:       <email>         [✅ filled | ⚠️ placeholder]
   Phone:       <phone>         [...]
   Address:     <address>       [...]
   Maps URL:    <url or "not set — Contact Block will skip map embed">

✅ / ⚠️  Branding
   Primary:     <primaryColor>
   Accent:      <accentColor>
   Logo:        <url or "⚠️ not uploaded — using text logo">

✅ / ⚠️  Socials
   Twitter:     <url or "not set">
   Instagram:   <url or "not set">
   LinkedIn:    <url or "not set">

⚙️  Deployment
   App ID:      <appId>         [✅ matches .env | ⚠️ mismatch]
   Domain:      <domain or "⚠️ not set — sitemap uses placeholder">
   Vercel:      <project or "not set">
   Supabase:    <projectRef or "⚠️ not set — run /checkpoint to configure">

🔧 Features enabled
   ✅ testimonials   ✅ pricing   ✅ contactForm
   ⬜ blog   ⬜ gallery   ⬜ teamPage   ⬜ analytics

📋 MASTERPLAN status
   <Show Phase completion percentages from MASTERPLAN.md — e.g.:>
   Phase 1 (Auth):       ✅ complete
   Phase 2 (Landing):    🔄 in progress (X/Y tasks done)
   Phase 3–9:            ⬜ pending

⚠️  Items needing attention:
   - <list every field that was placeholder or not set>
   - <list any sync conflicts resolved>
   - <list any TypeScript errors found>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Next steps:
  1. Fill in any ⚠️ items in business.json and re-run /business-init
  2. Run: /masterplan-task "<next pending Phase task>"
  3. Run: /checkpoint  (when ready to lock schema)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Step 7 — Store to ruflo memory

Store a memory with key `business-init/<business.name>`:
```
Business: <name>
Vertical: <vertical>
Last initialized: <date>
Key fields set: name, email, phone, address, appId
Missing: <list of ⚠️ fields>
```

## Hard rules

- **Never print secret values** — skip `.env.local` Supabase keys, JWT secrets, API keys in any output
- **Never edit `creatorRepos`** in `config.ts` — that's template author data, not client data
- **Preserve `--_note` fields** in `business.json` during any future re-sync — they are documentation, not data
- **Never overwrite `.env.local`** — only suggest what to add, never write secrets
- **--report-only skips Step 4** — use it for inspection without mutation
- **Always run tsc after syncing** — never leave a broken build
