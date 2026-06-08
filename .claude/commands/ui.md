---
description: Active rewrite — makes target file or current diff fully responsive. Mobile-first, 48px touch targets, labels above inputs, focus rings, semantic tokens only.
argument-hint: <file-path or blank for current diff>
---

Target: **$ARGUMENTS** (if blank, target uncommitted changes in `src/components/` and `src/app/`).

This is an **active rewrite**, not a check. Read the target, then edit it directly to comply with DannFlow's UI standards.

**Before rewriting** — check ruflo memory for design decisions specific to this project (e.g. "cards use rounded-xl", "spacing scale is p-6/gap-6 not p-4", "hero buttons are h-14 not h-12"). Apply these on top of the standard rules below.

**Rewrite rules:**

1. **Mobile-first responsiveness**
   - Layout must work at 375px width with no horizontal scroll
   - Use Tailwind responsive prefixes correctly: base = mobile, `sm:` = ≥640px, `md:` = ≥768px, `lg:` = ≥1024px
   - Flex/grid layouts collapse to single column on mobile

2. **Touch targets ≥48px**
   - Buttons, links, inputs, icon buttons → minimum `h-12` or `min-h-12` + adequate horizontal padding
   - Icon-only buttons get `h-12 w-12`

3. **Forms**
   - Labels go ABOVE inputs (`<Label htmlFor=...>` on its own line, never placeholder-only)
   - Every input has a visible focus ring via `focus-visible:ring-2 focus-visible:ring-ring` (or use Shadcn `<Input>` which has it built-in)
   - Error states use `text-destructive` for messages and `border-destructive` for the input
   - Required fields marked with a visible indicator

4. **Semantic tokens ONLY (and Safari-safe)**
   - REPLACE any hex (`#ffffff`, `#000`), `rgb()`, `rgba()`, or hardcoded color words (`white`, `black`, `gray-500`, `slate-900`) with semantic tokens:
     - Backgrounds → `bg-background`, `bg-card`, `bg-muted`
     - Text → `text-foreground`, `text-muted-foreground`, `text-primary`
     - Borders → `border`, `border-border`, `border-input`
     - Brand → `bg-primary`, `text-primary-foreground`
   - **Cross-browser rule (Safari + Chrome):** Also replace Tailwind **alpha modifiers on structural surfaces/borders/dividers** — `bg-white/5`, `border-white/[0.07]`, `divide-white/10`, `text-white/40` — with solid tokens. Tailwind v4 compiles these to `color-mix(in oklab, …, transparent)`, which **Safari renders inconsistently** (borders blow out to near-full white, producing a harsh outlined box that looks fine in Chrome). Solid tokens render identically across browsers.
     - `border-white/[0.07]` → `border-border` · `bg-white/5` → `bg-muted` · `text-white/40` → `text-muted-foreground` · `divide-white/10` → `divide-border`
   - A single brand-button hover tint (`hover:bg-primary/90`) is acceptable; the rule targets borders, dividers, panels, and base text where the blow-out is visible.

5. **Shadcn primitives**
   - Replace raw `<button>` with `<Button variant="...">`
   - Form pages wrapped in `<Card>` with `<CardHeader>` / `<CardContent>` / `<CardFooter>`

6. **Spacing rhythm**
   - Stick to the scale: `p-4`, `p-6`, `gap-4`, `gap-6`, `space-y-4`, `space-y-6`
   - No `p-3.5`, `gap-2.5`, etc.

7. **States**
   - Buttons have a loading state when they trigger async ops (disable + show spinner)
   - Empty list/data states show a centered icon + message, never blank

**Procedure:**
1. Read the target file(s).
2. Identify every violation.
3. **If the target is multiple independent components**, spawn one agent per component in parallel — each has no shared state and can rewrite simultaneously. Merge results.
4. Edit the file(s) in place.
5. **Save any project-specific design decisions** made during the rewrite to ruflo memory (e.g. "chosen rounded-2xl for card corners on the dashboard").
6. Report a concise diff summary at the end: "Fixed N violations across M files: <bullet list of fix categories>."

If a file is already compliant, say so and skip it. Don't refactor unrelated logic — UI standards only.
