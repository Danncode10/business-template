---
description: "PHASE 2 of 2 — Claude designs and builds the actual site. Reads README + business.json + PROJECT_CONTEXT, runs a design-taste interview, then strictly replaces the template's placeholder copy, theme, and sections with a bespoke design for THIS project. Run after /new-project. ⭐ Use Opus — this is the creative, judgement-heavy phase."
argument-hint: "[section name to focus on] (optional — defaults to the whole site)"
---

# /design-project  ·  Phase 2: Design & Build

> ⭐ **Use Opus for this command.** This phase is pure design judgement — taste, hierarchy, copy, restraint. Run it on the most capable model. If you're on a smaller model, say so and recommend switching before continuing.

> **Prerequisite:** `/new-project` (Phase 1) has run — the repo is rebranded, `business.json` is filled, the Claude env is wired, and the Supabase tenant exists. If `business.json` still has template defaults (name "DannFlow", appId "dannflow"), stop and tell the user to run `/new-project` first.

Your job: turn the template's generic placeholder site into a **bespoke, production-quality site for this specific project** — designed entirely by you. Don't ask the user to write copy or pick layouts they can't picture. Interview for taste and facts, then *design all of it* and show them the result.

## What it does

1. **Load the brief** — README + business.json + PROJECT_CONTEXT + the landing design system.
2. **Design interview** — a short, focused conversation about taste, references, and content you can't infer.
3. **Design the system** — set the theme (colors, type, mood) to fit the project; lock the section list.
4. **Build every section** — rewrite each landing component with real copy, structure, and content. No Lorem ipsum, no "Your Business Name" leftovers.
5. **Wire the data** — connect feature sections (services, pricing, gallery, testimonials, contact) to `business.json` / the Supabase tables created in Phase 1.
6. **Verify** — typecheck, `/no-conflict`, and a responsive pass. Report what was designed.

---

## Step 0 — Confirm the model + load the brief

1. If not running on Opus, recommend switching ("This is the design phase — Opus gives noticeably better taste. Switch and re-run, or continue on this model?"). Respect the user's choice.
2. Read in parallel — this is your design brief, treat it as source of truth:
   - `README.md` — what this project is and offers
   - `business.json` — name, vertical, services/features, contact, hours, social proof, branding hints
   - `PROJECT_CONTEXT.md` — audience, tone, design rules, **anti-decisions** (respect these absolutely)
   - `CLAUDE.md` — guardrails (semantic tokens, server-first, services layer, RLS)
   - `src/app/globals.css` — current `@theme` tokens you'll be retuning
   - `src/components/landing/*` and `src/components/navbar.tsx` — the components you'll redesign
3. **Recall the landing design system** from memory (search: "landing-design-system" / "landing design"). It defines the dark-premium vocabulary, the Framer Motion **perf rules**, and a FORBIDDEN animation list. Reuse those patterns; do not reintroduce the Safari-breaking blur-in animations.

---

## Step 1 — Design-taste interview (short, sharp)

Ask only what you genuinely can't infer from the brief. Group it so the user answers fast. Cover:

- **Vibe / references**: 2–3 sites or brands they admire, or 3 adjectives (e.g. "warm, trustworthy, local" vs "sleek, premium, minimal"). If they have none, propose a direction from the vertical and confirm.
- **Mood + palette**: light or dark? Keep the template's purple-on-OLED, or move to colors that fit the brand? Offer a concrete recommendation.
- **Hero promise**: the single most important sentence — what they want a first-time visitor to feel/do. You'll write the actual headline; just get the intent.
- **Content you can't invent**: real service/feature names + prices, signature offerings, a genuine testimonial or two, real photos (or confirm you should use tasteful placeholders/stock direction).
- **Sections**: confirm the page outline (see Step 3) — add/remove based on `features` and what the project offers.
- **Must-haves / must-avoids**: anything non-negotiable, plus things to never do (feeds PROJECT_CONTEXT anti-decisions).

Keep it to one or two rounds. Then **show the user the design plan** (palette + section list + hero direction) and get a "go" before building.

---

## Step 2 — Set the design system (theme first)

Before touching sections, lock the foundation in `src/app/globals.css` `@theme`:

- Retune `--color-*` tokens to the chosen palette. Keep the **semantic token contract** intact (background / foreground / card / muted / primary / accent / border / destructive) so every component re-themes automatically. **Never** hardcode hex/`rgba`/`white`/`black`/`gray-*` in `className` — that's a CLAUDE.md critical failure. All color lives in tokens.
- Pick type + spacing mood consistent with the vibe (the system uses Geist; change only if the brand demands it).
- Sync `branding.primaryColor` / `accentColor` in `business.json` to the final tokens.

State the before/after palette so the change is reviewable.

---

## Step 3 — Lock the section list

Default landing outline (prune/extend from `business.json.features` + the interview):

| Section | Component | Driven by |
|---|---|---|
| Hero | `hero.tsx` | headline + promise (you write it) |
| Social proof bar | `social-proof-bar.tsx` | `socialProof.*` |
| Services / What we offer | `services.tsx` | real services/features (+ `services` table if present) |
| How it works | `how-it-works.tsx` | the offering's flow |
| Pricing / Packages | `pricing.tsx` / `packages.tsx` | `features.pricing` |
| Gallery | `gallery.tsx` | `features.gallery` |
| Testimonials | `testimonials.tsx` | `features.testimonials` (+ `reviews` table) |
| Blog preview | `blog-preview.tsx` | `features.blog` |
| Contact + hours + map | `contact-block.tsx` | `contact.*`, `hours.*` |
| CTA banner | `cta-banner.tsx` | the primary action |

Delete sections a feature flag turned off; don't leave dead placeholder blocks. (Some components may not exist yet in a given DannFlow project — scaffold them with `/new-page` or `/new-feature` patterns if needed.)

---

## Step 4 — Build every section (design all)

For each section in the locked list, **rewrite the component** to be specific to this project:

- **Real copy** — headlines, subheads, body, CTAs written for *this* project. Zero placeholder text, zero "Your Business Name", zero Lorem ipsum left anywhere.
- **Reuse the design vocabulary** from the landing design system: eyebrow → gradient-word H2 → subtitle; double-bezel cards; magnetic CTA; one ambient orb per section; alternating cascade for feature rows.
- **Respect the perf + motion rules** — initial `{ opacity:0, y:16 }` (never blur-in), 0.5–0.7s, `whileInView { once:true, margin:'-60px' }`, stagger `i*0.04`. Honor the FORBIDDEN list from memory.
- **Guardrails** — Server Components by default (`'use client'` only for interaction); semantic tokens only; any data fetch goes through `src/services/` with the `app_id` + `organization_id` filters; ≥48px touch targets; labels above inputs; Shadcn `<Button>`/`<Card>`.
- **Mobile-first** — design at 375px up; no horizontal scroll; real empty states.

Also refresh shared chrome that carries the brand: `navbar.tsx`, footer, page metadata in `src/app/layout.tsx` and `page.tsx` (title/description/OG from `business.json` + `seo.*`).

---

## Step 5 — Wire the data

For enabled features, connect the section to real data instead of hardcoding where a table exists:
- `services` / `pricing` → `services` table (or `business.json` if no table)
- `gallery` → `gallery_items`
- `testimonials` → `reviews`
- `contactForm` → inserts into `leads`
All via `src/services/` with tenant filters (`app_id` + `organization_id`). Never query Supabase directly from a component. If a table is missing for an enabled feature, fall back to `business.json`-driven static content and note it.

---

## Step 6 — Verify & report

1. `npx tsc --noEmit` — fix any errors.
2. Run **`/no-conflict`** — confirm docs/code agree, no leftover template references, RLS intact.
3. Responsive pass (or run **`/ui`** on the changed files) — 375px+, focus rings, touch targets, semantic tokens only.
4. Suggest `npm run dev` so the user can see it.

Report:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🎨 <Project Name> — designed
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Palette:   <before> → <after>
  Sections:  <built list>   Removed: <pruned list>
  Data-wired: <services/gallery/testimonials/contact>
  Checks:    ✅ tsc   ✅ /no-conflict   ✅ responsive

  Preview:   npm run dev
  Ship:      deploy to Vercel (separate app, same shared Supabase)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
End with a one-line conventional commit suggestion (e.g. `feat: design <project> landing site`).

---

## Hard rules

- **Design everything — leave nothing generic.** No placeholder copy, no template defaults, no empty stub sections. If you lack a real fact, ask in the interview or make a tasteful, clearly-labeled assumption — never ship "Your Business Name".
- **Semantic tokens only** — hardcoded hex/`rgba`/`white`/`black`/`gray-*` in `className` is a critical failure. Retheme via `globals.css` tokens.
- **Honor the perf/motion rules** from the landing design system — never reintroduce blur-in hydration animations or animated orbs.
- **Respect PROJECT_CONTEXT anti-decisions** absolutely.
- **Guardrails hold** — Server-first, all data through `src/services/` with `app_id` + `organization_id`, RLS never bypassed.
- **Opus recommended** — flag it if running on anything smaller.
- **Don't re-scaffold infra** — repo, env, tenant, and wiring are `/new-project`'s job. This command is design + content only.
- **Never `git commit` automatically** — leave it to the user or `/commit`.
