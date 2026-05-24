# MASTERPLAN — DannFlow Business Template v1

> **Last updated:** 2026-05-24  
> **Status:** In active development  
> **Owner:** Dann

---

## **PHASE 0: Testing Infrastructure** (Prerequisites)

**Goal:** Build `/masterplan-task` command + TEST.md structure for systematic development  
**Est. time:** 3-4 hours  
**Blockers:** None (do this first!)

- [x] **Create `/masterplan-task` Command** ✅ Completed
  - [x] Reads task from MASTERPLAN.md (exact spec, no hallucination)
  - [x] Implements feature (code changes)
  - [x] Auto-generates TEST.md section
  - [x] Marks task [x] in MASTERPLAN.md
  - [x] Commits with conventional message

- [x] **Create TEST.md Template** ✅ Completed
  - [x] Sections for each phase
  - [x] Automated + manual test checklists
  - [x] Step-by-step verification guides
  - [x] Common issues + troubleshooting

- [ ] **Create npm Test Scripts**
  - [ ] `npm run test:auth` (Phase 1 tests)
  - [ ] `npm run test:dashboard` (Phase 2 tests)
  - [ ] `npm run test:roles` (Phase 3 tests)
  - [ ] `npm run test:domain` (Phase 4 tests)
  - [ ] `npm run test:rls` (Phase 5 tests)
  - [ ] `npm run test:blog` (Phase 6 tests)
  - [ ] `npm run test:multi-tenant` (full isolation test)

**Acceptance Criteria:**
- [x] `/masterplan-task` command available and working
- [x] TEST.md created with Phase 0 completed section
- [ ] All npm test scripts created and runnable

**Notes:**
- Phase 0 is *already complete* — the command/skill/TEST.md are built and in place
- Start Phase 1 by running: `/masterplan-task "Phase 1: Core Auth & Tenant Setup - Magic Link Auth Flow"`

---

## **PHASE 0.5: Multi-Project Supabase Setup** (Infrastructure)

**Goal:** Namespace all tables with `app_id` so this Supabase can serve multiple of Dann's projects safely  
**Est. time:** 2-4 hours  
**Status:** ✅ COMPLETE (2026-05-24)

- [x] **Add `app_id` to core tables** ✅
  - [x] Created `organizations` table with `app_id TEXT NOT NULL DEFAULT 'business-template'`
  - [x] Create index: `idx_organizations_app_id` for query perf
  - [x] Migration applied to Supabase (Businesses project)
  - [ ] Run `npm run checkpoint` after migration (do after first schema checkpoint)

- [x] **Update RLS policies (two-layer isolation)** ✅
  - [x] Organizations table RLS policy: `app_id = current_setting('app.id', true)::text`
  - [x] Foundation set for future table RLS updates
  - [x] Infrastructure ready for Phase 1 auth RLS

- [x] **Set env var in `.env.local`** ✅
  - [x] Add `NEXT_PUBLIC_APP_ID=business-template`
  - [x] Add `APP_ID=business-template` (server-side)

- [x] **Update service layer** ✅
  - [x] Created `src/services/multi-project.ts` with helper functions
  - [x] Includes: createOrganization, getOrganizationBySlug, getOrganizationById, listOrganizations, updateOrganization, deleteOrganization
  - [x] Helper: `withMultiProjectFilters()` for building queries

- [x] **Document in MULTI_PROJECT.md** ✅
  - [x] Full architecture guide with two-layer isolation patterns
  - [x] Schema design patterns
  - [x] RLS policy patterns
  - [x] Service layer patterns
  - [x] How to add a new project to this Supabase
  - [x] Migration safety checklist

**Acceptance Criteria:**
- [x] Organizations table has `app_id` column with default
- [x] RLS policies enforce `app_id` isolation
- [x] `.env.local` has `NEXT_PUBLIC_APP_ID=business-template`
- [x] MULTI_PROJECT.md written with full guide
- [x] Service helpers implemented in `src/services/multi-project.ts`
- [x] TypeScript types compile without errors

---

## **PHASE 1: Core Auth & Tenant Setup** (Foundation)

**Goal:** Magic link auth + tenant isolation + email infrastructure  
**Est. time:** 1-2 weeks  
**Blockers:** None

- [x] **Gmail SMTP Setup** ✅ (2026-05-24)
  - [x] Enable 2-Step Verification on Google Account
  - [x] Create Gmail App Password
  - [x] Configure Supabase SMTP (Host, Port, Username, Password)
  - [x] Enable email templates in Supabase (Reset Password, Confirm Sign Up)
  - [x] Test email delivery via Supabase (verified: signup → login → email)
  - [x] Document setup steps in TEST.md
  - [x] Sender name: "Dann"

- [ ] **Magic Link Auth Flow**
  - [ ] Create `/auth/request-magic-link` API route
  - [ ] Create `/auth/verify-magic-link` callback
  - [ ] Create invitation invite system (admin sends invite link)
  - [ ] Test: User receives magic link → clicks → sets password → logged in
  - [ ] Add "forgot password" flow (email link → reset password)

- [ ] **Session & Auth Middleware**
  - [ ] Verify Supabase SSR middleware works (refresh tokens)
  - [ ] Test session persistence across pages
  - [ ] Add logout functionality
  - [ ] Test: Session expires → redirects to login
  - [ ] Set `app.id` context for RLS enforcement

- [ ] **Type Safety for Auth**
  - [ ] Extend `src/types/supabase.ts` with `auth_users` type
  - [ ] Create `src/hooks/useAuthUser.ts` hook
  - [ ] Update all auth checks to use typed hooks (no `any`)

**Acceptance Criteria:**
- [ ] User can receive magic link via email
- [ ] User can set password once, change anytime
- [ ] Sessions persist correctly
- [ ] Forgot password works end-to-end
- [ ] RLS context set via middleware for org isolation

---

## **PHASE 2: Landing Page & Admin Dashboard** (UI Foundation)

**Goal:** Rebrand landing page to Dann Digital + build professional admin dashboard  
**Est. time:** 1-2 weeks (remaining — foundation complete)  
**Status:** In Progress — Foundation complete (2026-05-24)  
**Blockers:** None (UI work is independent of auth phases)

- [x] **Landing Page Customization (Dann Digital Brand)** ✅ Mostly complete
  - [x] Update hero section: "Help Small Businesses Go Digital" headline
  - [x] Replace DannFlow references with Dann Digital (hero, features, how-it-works, CTA)
  - [x] Update features section: removed developer tabs (Supabase Live, GitHub MCP), added 6 business-focused feature cards
  - [x] Update CTA banner: "Ready to go digital?" + "Get started"
  - [x] Update How It Works: 3 business-focused steps (Set up profile, Design website, Launch and grow)
  - [ ] Update footer: Company info for Dann Digital
  - [x] Maintain: Dark-premium theme, glass navbar, magnetic CTAs (from [[landing-design-system]])
  - [ ] Test: Mobile responsive, Safari + Chrome, <10% CPU idle

- [ ] **Testimonials / Reviews Section**
  - [ ] 3–5 quote cards: star rating, quote text, customer name, optional avatar
  - [ ] Sits below How It Works (before CTA banner)
  - [ ] Starter content editable via `site_settings` or section JSON
  - [ ] Optional: link to Google Reviews page

- [ ] **Services / Pricing Overview** (landing page teaser, not full vertical)
  - [ ] 3–6 service cards: name, short description, starting price or "Contact for pricing"
  - [ ] Pulls from vertical-specific table (Phase 7) or hardcoded starter cards
  - [ ] CTA per card: "Book now" / "Learn more" → contact form anchor

- [ ] **Contact Block** (above footer)
  - [ ] Address, phone, email, business hours (Mon–Sun)
  - [ ] Google Maps embed (iframe via place ID stored in `site_settings`)
  - [ ] Inline contact form: name, email, message → submits to `leads` table
  - [ ] Responsive: map full-width on mobile, side-by-side on desktop

- [ ] **Gallery / Photo Grid**
  - [ ] 4–9 photos in uniform grid or masonry layout
  - [ ] Images managed via dashboard Image Upload (Phase 2 editor)
  - [ ] Lightbox on click (optional)

- [ ] **Social Proof Bar**
  - [ ] Horizontal strip between hero and features: e.g., "4.9 ★ on Google · 500+ customers · 10 years in business"
  - [ ] Values configurable via `site_settings` (rating, customer count, years)
  - [ ] Subtle separator, no heavy card — just trust signals

- [x] **Dashboard Layout & Navigation** ✅ Foundation complete
  - [x] Single-component SPA (`dashboard-shell.tsx`) with `?tab=` URL param routing
  - [x] Fixed left sidebar (`bg-card border-r`)
  - [x] Collapsible sidebar on desktop (PanelLeftClose / PanelLeft)
  - [x] Mobile: slide-in overlay with backdrop blur
  - [x] Sidebar nav: Overview, Pages, Leads, Team
  - [x] `MAIN` section label above nav items
  - [x] Settings button at bottom of sidebar
  - [x] User profile row at bottom: Avatar + name + email + popup menu
  - [x] Popup menu: Back to Home + Sign Out
  - [x] Top bar with active tab breadcrumb
  - [ ] Top bar: org switcher
  - [ ] Top bar: notifications
  - [ ] RLS context: Set `app.id` and `organization_id` for dashboard queries (Phase 1 dependency)
  - [ ] Test: Switching orgs → data updates correctly

- [x] **Dashboard Components (Core)** ✅ Core done
  - [x] `StatCard` component (icon top-right, label, value, note, accent color)
  - [x] `ComingSoon` placeholder (dashed border, icon, title, description, phase badge)
  - [x] `OverviewTab` with 4-column stat cards + Recent Activity + Quick Actions
  - [ ] Data table component (sortable columns, filters)
  - [ ] Form components (inputs, selects, file upload)
  - [ ] Modal dialogs (create, edit, delete)
  - [x] Dark theme: Match landing page tokens (OLED black, purple accents)
  - [ ] Test: All components responsive (375px—2560px)

- [x] **Dashboard Pages (Stubs)** ✅ All stubs in place
  - [x] `/dashboard` → Overview (stat cards + quick actions)
  - [x] `/dashboard/pages` → ComingSoon stub
  - [x] `/dashboard/leads` → ComingSoon stub
  - [x] `/dashboard/team` → ComingSoon stub
  - [x] `/dashboard/settings` → ComingSoon stub
  - [ ] `/dashboard/analytics` → placeholder (future)

- [ ] **Pages & Sections Schema**
  - [ ] Verify `pages` table: id, org_id, slug, title, created_at
  - [ ] Verify `sections` table: id, page_id, org_id, type, title, description, cta_text, cta_url, image_url, order, created_at
  - [ ] Add section types enum: hero, about, services, pricing, testimonials, blog, contact, faq
  - [ ] Run checkpoint + update-types

- [ ] **Admin Page Editor**
  - [ ] Create `/dashboard/pages` listing all pages (hero, about, services, etc.)
  - [ ] Create `/dashboard/pages/[slug]/edit` editor (drag-to-reorder sections)
  - [ ] For each section: show form with fields (title, description, CTA, image)
  - [ ] Save to Supabase on submit
  - [ ] Live preview: Side-by-side editor + preview
  - [ ] Test: Edit hero title → appears on live site

- [ ] **Content Item CRUD** (add / edit / delete — reused by all Phase 7 verticals)
  - [ ] Table view: list items (name, price, category, status) with edit + delete per row
  - [ ] Add/edit via modal: name, description, price, image upload, category, display order
  - [ ] Price field label adapts per vertical ("Price", "Starting from", "Rate", "Per night")
  - [ ] Drag-to-reorder items within a section
  - [ ] Soft delete only (sets `deleted_at`, never hard-deletes)
  - [ ] This CRUD pattern is the base for Phase 7: menus, services, listings, courses

- [ ] **Page Sections Display**
  - [ ] Create `<PageSection>` component (reusable for all section types)
  - [ ] Create hero, about, services, contact, testimonial components
  - [ ] Homepage `/` displays sections from `pages.home`
  - [ ] Test: Live edit hero → homepage updates

- [ ] **Image Upload & Optimization**
  - [ ] Integrate Cloudinary or Supabase storage
  - [ ] Admin can upload image for each section
  - [ ] Store URL in `sections.image_url`
  - [ ] Auto-optimize: Convert to WebP, responsive sizes
  - [ ] Display optimized images on frontend

- [ ] **Site Settings (contact, hours, maps, branding)**
  - [ ] Verify/create `site_settings` table: `org_id`, `key TEXT`, `value TEXT` (or structured columns)
  - [ ] Structured fields: `business_name`, `tagline`, `logo_url`, `address`, `phone`, `email`, `hours` (JSON), `google_maps_url`, `social_links` (JSON), `primary_color`, `accent_color`
  - [ ] Build `/dashboard/settings` UI:
    - [ ] Business Info tab: name, tagline, logo upload
    - [ ] Contact tab: address, phone, email, hours per weekday
    - [ ] Integrations tab: Google Maps embed URL or place ID, social profile links
    - [ ] Branding tab: primary color, accent color (Phase 5+ full theming)
  - [ ] Fallback: `siteConfig` in `src/lib/config.ts` used as defaults until client configures
  - [ ] Update `.env.example`: technical vars only (Supabase URL, app ID, site name) — no business content
  - [ ] Run `npm run checkpoint` + `npm run update-types` after schema

- [ ] **Form Submissions (Contact, Lead Capture)**
  - [ ] Verify `leads` table exists
  - [ ] Create contact form component (reusable, used in Contact Block on landing page)
  - [ ] Form submits → creates lead record in Supabase with `organization_id` + `app_id`
  - [ ] Leads appear in `/dashboard/leads` inbox
  - [ ] Test: Submit contact form → appears in admin lead inbox

**Acceptance Criteria:**
- [x] Landing page hero rebranded ("Help small businesses go digital")
- [x] Developer-focused content removed (Supabase Live, GitHub MCP)
- [x] How It Works updated to 3 business-focused steps
- [x] CTA updated to "Ready to go digital?" / "Get started"
- [ ] Footer updated with Dann Digital company info
- [x] Landing page maintains dark-premium theme (OLED black, purple, glass nav)
- [ ] Testimonials section live on landing page
- [ ] Services / Pricing overview section live
- [ ] Contact block: address, hours, Google Maps embed, inline form
- [ ] Gallery / Photo grid section live
- [ ] Social proof bar between hero and features
- [x] Dashboard: fixed sidebar with nav (Overview, Pages, Leads, Team, Settings)
- [x] Dashboard: collapsible sidebar (desktop) + mobile overlay
- [x] Dashboard: user profile + popup menu at bottom
- [x] Dashboard: 4-column stat cards on Overview
- [x] Dashboard: Quick Actions + Recent Activity panels
- [x] Dashboard: all route stubs load without error
- [ ] Dashboard: org switcher in top bar
- [ ] Admin can edit hero, about, services pages
- [ ] Admin can add / edit / delete content items with price and image
- [ ] Dashboard settings: contact info, hours, Google Maps URL, social links
- [ ] Changes appear live within 2-3 seconds
- [ ] Contact forms submit → appear in lead inbox
- [ ] `.env.example` updated with technical vars only (no business content)
- [ ] All dashboard components styled consistently (dark theme, glass effects)
- [ ] Mobile responsive: 375px → 2560px

---

## **PHASE 3: Team Roles & Permissions** (Access Control)

**Goal:** Admin can invite/remove team members, assign roles  
**Est. time:** 1 week  
**Blockers:** Phase 1 complete

- [ ] **Schema: Team Members & Roles**
  - [ ] Create `team_members` table in Supabase
    ```
    - id (UUID, PK)
    - organization_id (UUID, FK → organizations)
    - user_id (UUID, FK → auth.users)
    - role (enum: admin, employee)
    - assigned_pages (TEXT[] optional, for per-page granularity)
    - created_at, updated_at
    ```
  - [ ] Create `roles` enum in Supabase
  - [ ] Add RLS policies:
    - [ ] Admins can invite/delete team members in their org only
    - [ ] Employees can only see their org + assigned resources
  - [ ] Run `npm run checkpoint` to save schema
  - [ ] Run `npm run update-types` to sync `src/types/supabase.ts`

- [ ] **Team Admin UI**
  - [ ] Build out `/dashboard/team` (replace ComingSoon stub)
  - [ ] Create "Invite team member" form (email input, sends magic link)
  - [ ] Create "Delete team member" button (with confirmation)
  - [ ] Display role badge (Admin / Employee)
  - [ ] Test RLS: employee tries to invite → should fail

- [ ] **Role-Based Access Control**
  - [ ] Create `src/hooks/useTeamRole.ts` (returns user's role in org)
  - [ ] Create `<RoleGuard>` component (admin-only UI)
  - [ ] Test: Employee can't see delete button
  - [ ] Test: Employee can't call admin API routes

- [ ] **Audit Log Integration**
  - [ ] Log team member invites/deletes to `audit_log` table
  - [ ] Include: who, action, target user, timestamp, org_id

**Acceptance Criteria:**
- [ ] Admin can invite team members by email
- [ ] Team members receive magic link, set password, join
- [ ] Admin can delete team members (access revoked)
- [ ] Employees see only their org's data
- [ ] All actions logged in audit_log

---

## **PHASE 4: Domain & Deployment** (Per-Client Setup)

**Goal:** Automated client onboarding script  
**Est. time:** 1 week  
**Blockers:** Phase 1 complete

- [ ] **Create `npm run add-client` Script**
  - [ ] Create `scripts/add-client.sh` (or TypeScript CLI)
  - [ ] Prompts user for:
    - [ ] Client name (e.g., "Mia's Cafe")
    - [ ] Client domain (e.g., "mias-cafe.com")
    - [ ] Admin email (for first invite)
  - [ ] Inserts org into Supabase `organizations` table
  - [ ] Generates unique `organization_id` (UUID)
  - [ ] Outputs:
    - [ ] Organization ID
    - [ ] Admin invite link (magic link with org context)
    - [ ] Demo URL (client-name.vercel.app)
    - [ ] Setup checklist (next steps)

- [ ] **Vercel Deployment per Client**
  - [ ] Document: How to create Vercel project per client
  - [ ] Create `vercel.json` template for env vars per-client
  - [ ] Test: Deploy client 1 to `client1.vercel.app`
  - [ ] Test: Deploy client 2 to `client2.vercel.app` (same code, different env)
  - [ ] Ensure both clients are isolated (RLS verified)

- [ ] **Custom Domain Setup (Future Automation)**
  - [ ] Document manual flow: Buy domain on Hostinger → point DNS to Vercel
  - [ ] Create checklist for client: "Your domain setup steps"
  - [ ] (Future: Automate DNS + Vercel custom domain via API)

- [ ] **Demo vs Production**
  - [ ] Document: Until domain DNS is live, use `domain.vercel.app` for testing
  - [ ] Add env var for demo mode (affects analytics, notifications)

**Acceptance Criteria:**
- [ ] `npm run add-client "Acme Corp" "acme.com"` creates org + sends invite
- [ ] Two clients can coexist in one Supabase without data leakage
- [ ] Each client deploys to separate Vercel project (or shared with env isolation)
- [ ] Onboarding takes <5 minutes per client

---

## **PHASE 5: Data Isolation & Security** (Multi-Tenant Hardening)

**Goal:** Bulletproof RLS policies + audit trail  
**Est. time:** 1 week  
**Blockers:** Phase 1, 3, 4 mostly complete

- [ ] **RLS Policy Audit**
  - [ ] Verify all tables have org-based RLS policies
    - [ ] `organizations` table (users can only see their own org)
    - [ ] `pages` table (.eq('organization_id', ...))
    - [ ] `sections` table (inherited via pages)
    - [ ] `blog_posts` table (.eq('organization_id', ...))
    - [ ] `leads` table (.eq('organization_id', ...))
    - [ ] `team_members` table (.eq('organization_id', ...))
    - [ ] `site_settings` table (.eq('organization_id', ...))
    - [ ] `media` table (.eq('organization_id', ...))
  - [ ] Create `/rls-check` command to validate
  - [ ] Run before every merge (CI check?)

- [ ] **Audit Log Table & Trigger**
  - [ ] Verify `audit_log` table exists with:
    - [ ] id, organization_id, user_id, action, table_name, record_id, changes, created_at
  - [ ] Create PostgreSQL trigger: log every INSERT/UPDATE/DELETE
  - [ ] Test: Edit a page → audit_log has entry
  - [ ] RLS: Employees can only see their org's audit log

- [ ] **Soft Deletes (Safety)**
  - [ ] Add `deleted_at` column to key tables (organizations, team_members)
  - [ ] Update RLS to hide soft-deleted records
  - [ ] Document: Never hard-delete, always soft-delete (audit trail)

- [ ] **Test Multi-Tenant Isolation**
  - [ ] Create test: Org A tries to read Org B's pages → denied
  - [ ] Create test: Org A deletes team member → Org B unaffected
  - [ ] Create test: User from Org A logs in → can't access Org B data
  - [ ] Add to CI/CD if possible

**Acceptance Criteria:**
- [ ] All queries in `src/services/` include `organization_id` filter
- [ ] `/rls-check` passes on all tables
- [ ] Two clients tested, confirmed isolated
- [ ] Audit log captures all changes

---

## **PHASE 6: Blog System** (Content & SEO)

**Goal:** Blog CMS with SEO controls  
**Est. time:** 1.5 weeks  
**Blockers:** Phase 2 complete

- [ ] **Blog Schema**
  - [ ] Verify `blog_posts` table: id, org_id, title, slug, content, excerpt, featured_image, author_id, published_at, seo_title, seo_description, seo_keywords
  - [ ] Create RLS: employees can edit only if assigned

- [ ] **Blog Editor**
  - [ ] Create `/dashboard/blog` listing all posts (replace Analytics stub or add nav item)
  - [ ] Create `/dashboard/blog/new` editor
  - [ ] Create `/dashboard/blog/[slug]/edit` editor
  - [ ] Editor fields: title, slug, content (markdown or rich text), excerpt, image, publish date
  - [ ] SEO fields: meta title, meta description, keywords

- [ ] **Blog Frontend**
  - [ ] Create `/blog` listing all published posts
  - [ ] Create `/blog/[slug]` post page
  - [ ] Display: title, featured image, content, author, date, related posts
  - [ ] Add JSON-LD schema for articles (SEO)

- [ ] **SEO Metadata**
  - [ ] Each blog post injects custom meta tags
  - [ ] Each post injects OpenGraph tags (for social sharing)
  - [ ] Test: Share blog post on Twitter → correct preview

**Acceptance Criteria:**
- [ ] Admin can create, edit, publish blog posts
- [ ] Published posts appear on `/blog`
- [ ] SEO metadata renders correctly (verify with OG debugger)

---

## **PHASE 7: Content Modules (Verticals)** (Pluggable Features)

**Goal:** Pre-built modules for restaurant, service, real estate, education  
**Est. time:** 3 weeks (staggered)  
**Blockers:** Phase 2, 6 complete

> Each vertical reuses the **Content Item CRUD** pattern built in Phase 2 (table + add/edit modal + image upload + drag-reorder). Only the table name, field labels, and section titles change per vertical.

### **Vertical 1: Restaurant**
- [ ] **Schema**
  - [ ] Create `menus` table (org_id, name, description)
  - [ ] Create `menu_categories` table (menu_id, name, order)
  - [ ] Create `menu_items` table (category_id, name, description, price, image)

- [ ] **Admin UI**
  - [ ] `/dashboard/restaurant/menus` — list/create menus
  - [ ] `/dashboard/restaurant/menus/[id]/edit` — edit menu items & categories

- [ ] **Frontend Display**
  - [ ] `/menu` page shows all categories + items with prices
  - [ ] Mobile-friendly layout

### **Vertical 2: Service Business**
- [ ] **Schema**
  - [ ] Create `services` table (org_id, name, description, price, duration)
  - [ ] Create `testimonials` table (org_id, author, text, rating, image)

- [ ] **Admin UI**
  - [ ] `/dashboard/services` — list/create services
  - [ ] `/dashboard/testimonials` — manage testimonials

- [ ] **Frontend Display**
  - [ ] Services section on homepage
  - [ ] Testimonial carousel

### **Vertical 3: Real Estate**
- [ ] **Schema**
  - [ ] Create `listings` table (org_id, title, price, bedrooms, bathrooms, address, description, images)

- [ ] **Admin UI**
  - [ ] `/dashboard/listings` — list/create/edit properties

- [ ] **Frontend Display**
  - [ ] `/listings` page with filters (price, beds, baths)
  - [ ] `/listings/[id]` detail page with gallery

### **Vertical 4: Education**
- [ ] **Schema**
  - [ ] Create `courses` table (org_id, title, description, price, lessons)
  - [ ] Create `lessons` table (course_id, title, content, order)

- [ ] **Admin UI**
  - [ ] `/dashboard/courses` — manage courses & lessons

- [ ] **Frontend Display**
  - [ ] `/courses` listing
  - [ ] `/courses/[id]` course detail

**Acceptance Criteria:**
- [ ] Each vertical has at least one working feature (menu, service, listing, course)
- [ ] Data is org-isolated (RLS verified)

---

## **PHASE 8: Deploy & Test in Production** (Quality Assurance)

**Goal:** End-to-end testing with 2+ real clients  
**Est. time:** 1 week  
**Blockers:** Phase 7 complete

- [ ] **Pre-Launch Checklist**
  - [ ] All RLS policies verified (run `/rls-check`)
  - [ ] Magic link emails working
  - [ ] Team member invites working
  - [ ] Audit log capturing all changes
  - [ ] Images uploading correctly
  - [ ] Blog posts publishing + appearing live
  - [ ] Contact forms submitting

- [ ] **Deploy Client 1 (Test)**
  - [ ] Run `npm run add-client "Test Co" "test-co.com"`
  - [ ] Deploy to Vercel
  - [ ] Test full user flow: invite → password → edit pages → publish blog

- [ ] **Deploy Client 2 (Production)**
  - [ ] Run `npm run add-client "Real Client" "realclient.com"`
  - [ ] Verify data isolation from Client 1
  - [ ] Test RLS: Client 2 can't see Client 1's data

- [ ] **Backup Procedure**
  - [ ] Verify `npm run checkpoint` saves schema
  - [ ] Document manual data backup process (Supabase dashboard export)
  - [ ] Create `BACKUP.md` with restore instructions

- [ ] **Documentation**
  - [ ] Create `ONBOARDING.md` (how to add a new client)
  - [ ] Create `TROUBLESHOOTING.md` (common issues)
  - [ ] Update `README.md` with quick-start for forks

**Acceptance Criteria:**
- [ ] 2+ clients deployed successfully
- [ ] No data leakage between clients
- [ ] Backup/restore procedure documented
- [ ] All docs complete

---

## **PHASE 9: Upstream & Open Source** (Distribution)

**Goal:** Make it easy for others to fork & customize  
**Est. time:** 1 week  
**Blockers:** Phase 8 complete

- [ ] **Create PROJECT_CONTEXT.md Template**
  - [ ] Copy template from CLAUDE.md instructions
  - [ ] Include example (your use case)
  - [ ] Add comments for guidance

- [ ] **Create `/business-init` Custom Command**
  - [ ] Guide user through editing PROJECT_CONTEXT.md
  - [ ] Guide user through editing README.md
  - [ ] Run `npm install`
  - [ ] Output: "You're ready! Start with Phase 1."

- [ ] **Create SETUP.md**
  - [ ] "How to fork this template for your own business"
  - [ ] Prerequisites (Node, npm, Supabase account)
  - [ ] Step-by-step fork + setup guide
  - [ ] Common questions answered

- [ ] **Update README.md**
  - [ ] Clear pitch (what is this template?)
  - [ ] Key features (magic link auth, multi-tenant, team roles, etc.)
  - [ ] Tech stack
  - [ ] Quick-start (`npm run add-client`)
  - [ ] Links to docs (SETUP.md, PROJECT_CONTEXT.md)

- [ ] **Create FEATURES.md**
  - [ ] List all built-in features (auth, team roles, blog, etc.)
  - [ ] List all verticals (restaurant, service, real estate, etc.)
  - [ ] Roadmap (future features)

- [ ] **GitHub / Open Source (Optional)**
  - [ ] Create GitHub repo (if public)
  - [ ] Add LICENSE (MIT?)
  - [ ] Create CONTRIBUTING.md (if accepting PRs)

**Acceptance Criteria:**
- [ ] Someone can fork → run `/business-init` → have a working template
- [ ] PROJECT_CONTEXT.md is crystal clear
- [ ] README guides users to SETUP.md

---

## **FUTURE PHASES** (Post v1)

- [ ] **Billing Integration** (Stripe, invoice tracking)
- [ ] **Analytics Dashboard** (page views, lead sources, form submissions)
- [ ] **Email Automation** (welcome sequence, lead follow-up)
- [ ] **Mobile App** (React Native version of admin dashboard)
- [ ] **AI Content Generation** (auto-write blog posts, product descriptions)
- [ ] **Multi-language Support** (i18n for global clients)
- [ ] **Custom Domain + SSL Automation** (Vercel + SSL cert automation)

---

## **Notes**

- **RLS is sacred** — every new query must include `organization_id` filter
- **Type safety always** — never use `any`, always run `npm run update-types`
- **Test early, test often** — RLS is a security boundary, test data isolation constantly
- **Checkpoint before merging** — keep `supabase/backups/` up to date
- **One command per phase** — keep scripts/commands simple and focused

---

**Last Status:** Phase 0 + 0.5 complete. Phase 1 (SMTP done). Phase 2 (landing + dashboard foundation done). Next: Phase 1 Magic Link Auth Flow.
