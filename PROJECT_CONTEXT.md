# PROJECT_CONTEXT.md — Business Template Strategic Decisions

> This file locks **non-negotiable architectural and product decisions** for the Business Template. Read this before planning features, schema changes, or deployment strategy. This overrides generic DannFlow patterns where conflicts exist.

**Last updated:** 2026-05-23  
**Decision phase:** LOCKED (planning → implementation)

---

## Identity & Purpose

**Project:** Business Template (Built on DannFlow)

**Pitch:** Multi-tenant client website platform — one shared Supabase + one codebase deployed per client to Vercel. Turns designers/agencies into SaaS founders by letting them white-label a modern website builder for service businesses, restaurants, retail, real estate, and education verticals.

**Target audience:** Designers and small agencies in the Philippines (and globally) offering 5+ web projects per year. They want a repeatable, themeable, SEO-friendly platform they can deploy and customize for each client without rebuilding from scratch.

**Success metric:** Ship MVP (landing page + booking system + admin dashboard) to first pilot client by Q3 2026. Booking conversions ≥15% by Q4. Revenue upsell: setup fee + monthly SaaS fee per client.

**Tone:** Professional + direct. Service-industry first (not startup-glossy). Card-based UI for admin. Marketing copy emphasizes time-to-market and client retention (not hype).

---

## Multi-Tenancy Model — LOCKED (Option A)

**Decision:** Shared Supabase (free tier) + Per-Client Vercel Deployment

### Why Option A?

- **Simplest operational model** — one database instance, one set of migrations, one RLS policy system to maintain
- **Easiest client migration** — export organization data → import to client-provided Supabase → update env vars
- **Cost-effective at scale** — Supabase free tier supports ~200+ active organizations before hitting row limits
- **Decoupled auth** — each client controls their own Supabase project, but **all tenants share one instance during MVP**
  - Can graduate to Option B (separate Supabase per client) if revenue justifies it

### Why NOT Option B?

- **Too complex early** — per-client Supabase = per-client schema migrations, RLS policy copies, backup workflows
- **Overhead during MVP** — we're optimizing for speed, not enterprise isolation
- **Cost unknown** — charging clients for Supabase ($25/mo) eats margin if SaaS fee is low

### Why NOT Option C (Postgres multi-schema)?

- **Supabase doesn't expose schema selection** via JWT — you'd have to use a proxy layer
- **RLS policies become harder to reason about** (policies span schemas, not isolated)

### Critical constraint: RLS discipline is non-negotiable

Every query in `src/services/` **MUST** filter by `organization_id`:

```typescript
// CORRECT — tenant isolation enforced
const { data } = await supabase
  .from('pages')
  .select('*')
  .eq('organization_id', tenantId);

// WRONG — data leak risk
const { data } = await supabase
  .from('pages')
  .select('*');
```

Failure to enforce this is a **data-leakage vulnerability**, not a style issue. Every PR touching `src/services/` must pass `/rls-check` before merge.

### Known risks (mitigated)

| Risk | Impact | Mitigation |
|---|---|---|
| **"Noisy neighbor"** — one heavy tenant degrades others | High | Monitor Upstash Redis quota; implement per-org rate limits |
| **RLS policy bugs** — leak data across org_id boundaries | Critical | Code review checklist; `/rls-check` on every service change; test suite with multi-tenant fixtures |
| **Supabase free tier limits** — row count, auth users, bandwidth | Medium | Migrate to pro tier at $25–$100/mo when revenue justifies; document limits in onboarding |
| **Tenant data migrations** — export/import on client request | Medium | Write migration CLI tool; test on pilot clients first |

---

## First Vertical — LOCKED (Service Business)

**Decision:** Launch with booking + scheduling system for service businesses (salons, spas, consultants, fitness, etc.)

### Why Service Business?

1. **Market demand** — Philippines has strong service industry; designers already get 3–5 salon/spa clients per year
2. **Schema simplicity** — only 3–4 new tables (services, service_slots, bookings, customers) on top of core multi-tenant tables
3. **Revenue upsell path** — SMS reminders, payment processing, loyalty programs are natural Phase 2 monetization hooks
4. **Quick validation** — can launch MVP with just a landing page + booking form + admin dashboard without payment processing

### Core schema for Service Business

```sql
-- Multi-tenant base (all verticals)
organizations          -- clients/sites
pages                  -- editable pages (landing, about, services, contact)
sections               -- page sections (hero, testimonials, blog, etc)
blog_posts             -- blog with meta + JSON-LD
media                  -- images/files (Cloudinary references)
leads                  -- form submissions (contact, booking inquiry)
site_settings          -- brand colors, logo, domain, SEO defaults
team_members           -- admins + staff with role-based access
audit_log              -- track all changes for compliance

-- Service business tables
services               -- service offerings (haircut, massage, etc)
service_slots          -- availability windows (Mon 9–11am, etc)
bookings               -- customer appointments
customers              -- service business customers (name, phone, email)
```

### Why NOT other verticals?

| Vertical | Blocker | Defer to |
|---|---|---|
| **E-commerce (Retail)** | Requires Stripe, inventory, shipping — too big for MVP | Phase 2 |
| **Blog-only (Media)** | Not enough value to charge for; too close to free Webflow/Wix | Maybe never (free feature for all) |
| **Real Estate** | Requires map integrations, MLS feeds, complex filtering | Phase 2 |
| **Restaurant** | POS integration, menu management, delivery APIs — scope creep | Phase 2 |
| **Education** | LMS + course builder + student tracking — different architecture | Phase 2+ |

---

## MVP Feature Set (Phase 1)

**Goal:** Ship by Q3 2026. First paying customer by September.

### What's IN MVP?

**Public landing page**
- Hero section (video bg, CTA)
- Services overview (cards, pricing)
- Testimonials (carousel, rich text)
- Blog index (recent posts, search)
- Booking CTA (all pages)
- Mobile-responsive, 98+ Lighthouse score, Core Web Vitals ≥75

**Service booking system**
- Public calendar view (available slots)
- Booking form (name, email, phone, service, time, notes)
- Confirmation email (Resend or Supabase email)
- SMS reminder (Twilio, optional — may defer to Phase 1.5)
- Customer portal (view/reschedule/cancel bookings)

**Admin dashboard** (behind auth)
- **Site editor** — edit landing page content (sections, text, images) without code
- **Bookings tab** — see all bookings, mark complete, reschedule, cancel
- **Customers tab** — customer list, phone, email, booking history
- **Services tab** — add/edit services, configure pricing and slots
- **Settings** — brand colors, logo, domain, timezone, business hours, email templates
- **Team** — invite staff, assign roles (admin, editor, staff/viewer)
- **Audit log** — who changed what, when (compliance requirement)

### What's NOT in MVP

| Feature | Reason | Target phase |
|---|---|---|
| **Payment processing** (Stripe, GCash) | Too many integrations; MVP focuses on lead capture | Phase 2 (Q4 2026) |
| **SMS reminders** | Twilio cost + dependency; email confirmations first | Phase 1.5 (Oct 2026) |
| **Advanced blog** (categories, tags, SEO tools) | Blog is secondary; lead capture via booking is primary | Phase 2 |
| **Multi-location** | Schema gets complex; focus on single-location MVP | Phase 2 |
| **Analytics** (Google Analytics dashboard in admin) | Nice-to-have; GA4 embed in settings page | Phase 3 (2027) |
| **API for integrations** (Zapier, Make.com) | Low priority for MVP; customers can use Supabase webhooks | Phase 3 |
| **Chatbot / AI assistant** | Fun but not core value; defer | Phase 3 |

---

## Technology Stack (LOCKED)

| Category | Choice | Why |
|---|---|---|
| **Runtime / Framework** | Next.js 16+, React 19 | Latest stable, Server Components first, Vercel deployment |
| **Database / Auth** | Supabase (managed PostgreSQL) | RLS for multi-tenancy, realtime, Edge Functions, free tier |
| **UI Framework** | Shadcn/UI (Tailwind v4) | Component library, semantic tokens, a11y out-of-box |
| **Data fetching** | TanStack Query (React Query) | Server state caching, SSR-friendly, Supabase queries |
| **Styling** | Tailwind CSS v4 + semantic tokens | No hardcoded colors; theme variables only |
| **Animation** | Framer Motion | Micro-interactions, transitions, loader states |
| **Toast notifications** | Sonner | In-app feedback for form submissions, errors |
| **Icons** | lucide-react | Clean, modern, MIT-licensed |
| **Media storage** | Cloudinary | Image optimization, transformations, free tier adequate |
| **Email** | Resend | Send confirmations, reminders; free tier 100/day |
| **SMS (Phase 2)** | Twilio | SMS reminders and confirmations |
| **Hosting** | Vercel (per-client) | Deploys main codebase; each client gets own domain + env |
| **Rate limiting** | Upstash Redis + Ratelimit | Prevent booking spam, API abuse |
| **Observability** | Vercel logs + Supabase dashboard | Monitoring, debugging, RLS audit logs |

**NO Zustand, Redux, or Context API** — TanStack Query handles all server state.  
**NO tRPC or GraphQL** — REST API via Supabase JS client + Edge Functions.  
**NO MUI, Chakra, or headless-ui** — Shadcn/UI only.

---

## RLS Security Rules (SQL)

Every table has an `organization_id` FK. RLS policies enforce `auth.jwt() ->> 'organization_id'` match.

```sql
-- Example: pages table
CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(organization_id, slug)
);

CREATE POLICY "org isolation" ON pages
  FOR ALL
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);
```

**Pattern:** Every service query in `src/services/` includes `.eq('organization_id', tenantId)` before executing. No exceptions.

---

## Design Rules & Tone

**Visual:** Card-based layout, professional + direct, service-industry first (not crypto/startup vibes).

**Color:** Semantic tokens only. No hardcoded hex, `rgba()`, or color names. All theme vars in `src/app/globals.css`.

**Buttons & forms:**
- Buttons always Shadcn `<Button>`, never raw `<button>`
- Form labels ABOVE inputs (not placeholder-only)
- 48px minimum touch targets on mobile
- Focus rings visible via `ring-ring`
- Error states use `text-destructive`

---

## Deployment Phases

### Phase 1 — MVP (Q3 2026)
- [ ] Schema designed + RLS policies
- [ ] Landing page + booking system
- [ ] Admin dashboard (site editor, bookings, customers, services, settings, team, audit log)
- [ ] Email confirmations (Resend)
- [ ] First pilot customer live

### Phase 2 — Payments & Blog (Q4 2026)
- [ ] Stripe integration
- [ ] Advanced blog with SEO
- [ ] SMS reminders

### Phase 3+ — Scale (2027+)
- [ ] Multi-location support
- [ ] More verticals (retail, real estate, education, restaurant)
- [ ] Zapier/Make integrations

---

## Multi-Project Supabase — LOCKED

**Decision:** One Supabase project serves multiple of Dann's own projects (business-template + future projects). Tables are namespaced via `app_id`.

**Two layers of isolation:**
- **Layer 1 — `app_id`** (project namespace): isolates this template's tables from other projects Dann builds
- **Layer 2 — `organization_id`** (tenant isolation): isolates clients from each other within this template

**Env vars per project:**
```
NEXT_PUBLIC_APP_ID=business-template
```

**Why:**
- Free Supabase tier is more than enough for multiple small projects at dev stage
- Avoids paying for/managing multiple Supabase instances during growth phase
- Simple to graduate: when a project scales, point its env vars to its own Supabase

**Constraint:** Any migration to the shared Supabase must include `app_id` on new tables. Never run a migration that drops or modifies shared infrastructure without checking which projects are affected. See [MULTI_PROJECT.md](MULTI_PROJECT.md).

---

## Anti-Decisions (What We're NOT Doing)

1. **NOT a visual page builder with drag-drop.** Text + image CRUD only in MVP.
2. **NOT using Stripe immediately.** Payments in Phase 2.
3. **NOT a separate Supabase per client in MVP.** One shared instance with RLS (`organization_id`). Clients can migrate later via env vars.
4. **NOT a separate Supabase per project yet.** One shared Supabase + `app_id` namespace for all Dann's projects. Graduate when needed.
5. **NOT building multi-tenant auth UI.** Clients provision their own Supabase + JWT.
6. **NOT writing a CMS from scratch.** Simple JSONB columns for now.
7. **NOT adding AI/chatbot early.** Phase 3 if demand emerges.
8. **NOT making this restaurant-first.** Service business is first vertical; restaurants Phase 2.
9. **NOT a white-label theme store.** We're a repeatable deployment platform per client.

---

**Approved by:** Dann (decision lock)  
**Phase:** Planning → implementation  
**Next action:** Sketch core schema → provision Supabase → scaffold MVP routes

