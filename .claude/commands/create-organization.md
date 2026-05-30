# /create-organization

You are setting up the Supabase tenant for this project. Follow every step in order. Do not skip steps. Ask for confirmation before running any destructive SQL.

---

## STEP 1 — Read the repo context

Read these files to understand the project:
- `business.json` — business name, slug, appId, website, features, services
- `src/lib/config.ts` — siteConfig (name, url, contact)
- `.env.example` — confirm NEXT_PUBLIC_APP_ID value
- `.env.local` (if it exists) — get the actual Supabase project ref/URL in use

Extract and store these values for use in all later steps:
- `APP_ID` = `deployment.appId` from business.json (e.g. `chris-auto-shine`)
- `ORG_NAME` = `business.name` from business.json
- `ORG_SLUG` = same as APP_ID (kebab-case)
- `ORG_WEBSITE` = `contact.website` from business.json
- `FEATURES` = the `features` object from business.json (shows which tables are needed)

---

## STEP 2 — Connect to Supabase and identify the project

Use `mcp__supabase-mcp-server__list_projects` to list all Supabase projects.

Look for the shared Dannflow project (it will be the one whose URL matches `NEXT_PUBLIC_SUPABASE_URL` from `.env.local`, or the project named something like "dannflow", "business-template", or "shared").

Display the project name and ref to the user, and confirm: **"Is this the correct Supabase project?"** before continuing.

Store the `project_id` for all subsequent MCP calls.

---

## STEP 3 — Verify the schema is ready

Use `mcp__supabase-mcp-server__list_tables` to check which tables exist in the `public` schema.

Confirm these foundation tables exist (they come from the business-template migration):
- `organizations`
- `profiles`

If either is missing, stop and tell the user: **"The base migration from business-template has not been applied to this Supabase project. Run the migration at `supabase/migrations/20260524_001_add_app_id_and_organizations.sql` first."**

If both exist, continue.

---

## STEP 4 — Check if the organization already exists

Run this SQL via `mcp__supabase-mcp-server__execute_sql`:

```sql
SELECT id, name, slug, app_id, website, created_at
FROM public.organizations
WHERE app_id = '<APP_ID>'
  AND slug = '<ORG_SLUG>';
```

- If a row is returned: tell the user the org already exists, show the row, and ask if they want to update it or skip to table creation (Step 6).
- If no row: continue to Step 5.

---

## STEP 5 — Create the organization row (the tenant anchor)

Run this SQL to register this project as a tenant:

```sql
INSERT INTO public.organizations (app_id, name, slug, website)
VALUES (
  '<APP_ID>',
  '<ORG_NAME>',
  '<ORG_SLUG>',
  '<ORG_WEBSITE>'
)
ON CONFLICT (app_id, slug) DO NOTHING
RETURNING id, name, slug, app_id, created_at;
```

Show the user the returned row. Store the returned `id` as `ORG_ID`.

Then update `business.json` — set `supabase.organizationSlug` to `<ORG_SLUG>`.

---

## STEP 6 — Analyze which tables to create

Based on `FEATURES` from business.json and the nature of this business (service business, car detailing), propose the following table plan. Show the user a checklist and ask them to confirm which tables to create:

### Always create (core for any service business):
- [ ] **`leads`** — contact form submissions from the website. Every inquiry lands here.
- [ ] **`bookings`** — service appointment requests (date, service, vehicle, customer info).
- [ ] **`analytics_events`** — lightweight page view + CTA click tracking (no third-party needed).

### Create if feature is enabled in business.json:
- [ ] **`reviews`** — customer reviews/testimonials (if `features.testimonials = true`)
- [ ] **`gallery_items`** — managed gallery images with captions (if `features.gallery = true`)
- [ ] **`services`** — service catalog with pricing (if `features.pricing = true`)

### Suggested extras (ask the user):
- [ ] **`notifications`** — in-app admin alerts for new leads, bookings, reviews.
- [ ] **`page_views`** — daily page view counts per path for the dashboard analytics widget.

Wait for the user to confirm which tables to create before proceeding.

---

## STEP 7 — Create confirmed tables

For each confirmed table, apply the migration using `mcp__supabase-mcp-server__apply_migration`. 

Use this pattern for ALL tables — every table MUST have `app_id` and `organization_id` for tenant isolation:

### `leads` table
```sql
CREATE TABLE IF NOT EXISTS public.leads (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id           TEXT NOT NULL DEFAULT '<APP_ID>',
  organization_id  UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Submission data
  name             TEXT NOT NULL,
  email            TEXT NOT NULL,
  phone            TEXT,
  message          TEXT,
  service_interest TEXT,              -- which service they asked about
  source           TEXT DEFAULT 'contact-form', -- 'contact-form', 'phone', 'walk-in'

  -- Status
  status           TEXT NOT NULL DEFAULT 'new',  -- 'new', 'contacted', 'booked', 'closed'
  notes            TEXT,             -- admin internal notes

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_leads_app_id          ON public.leads(app_id);
CREATE INDEX idx_leads_organization_id ON public.leads(organization_id);
CREATE INDEX idx_leads_status          ON public.leads(status);
CREATE INDEX idx_leads_created_at      ON public.leads(created_at DESC);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant isolation" ON public.leads
  FOR ALL
  USING (
    app_id = current_setting('app.id', true)::text
    AND organization_id = (
      SELECT id FROM public.organizations
      WHERE app_id = current_setting('app.id', true)::text
      LIMIT 1
    )
  );
```

### `bookings` table
```sql
CREATE TABLE IF NOT EXISTS public.bookings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id           TEXT NOT NULL DEFAULT '<APP_ID>',
  organization_id  UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Customer info
  customer_name    TEXT NOT NULL,
  customer_email   TEXT NOT NULL,
  customer_phone   TEXT,

  -- Booking details
  service          TEXT NOT NULL,    -- service name (e.g. 'Full Detail', 'Exterior Wash')
  package          TEXT,             -- package tier if applicable
  vehicle_type     TEXT,             -- 'sedan', 'suv', 'truck', 'van'
  vehicle_make     TEXT,
  vehicle_model    TEXT,
  vehicle_year     TEXT,
  notes            TEXT,

  -- Scheduling
  preferred_date   DATE,
  preferred_time   TEXT,
  confirmed_date   DATE,
  confirmed_time   TEXT,

  -- Status & pricing
  status           TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
  price_quoted     NUMERIC(10,2),
  price_paid       NUMERIC(10,2),
  payment_status   TEXT DEFAULT 'unpaid', -- 'unpaid', 'deposit', 'paid'

  -- Meta
  source           TEXT DEFAULT 'website', -- 'website', 'phone', 'referral', 'walk-in'
  lead_id          UUID REFERENCES public.leads(id) ON DELETE SET NULL,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bookings_app_id          ON public.bookings(app_id);
CREATE INDEX idx_bookings_organization_id ON public.bookings(organization_id);
CREATE INDEX idx_bookings_status          ON public.bookings(status);
CREATE INDEX idx_bookings_confirmed_date  ON public.bookings(confirmed_date);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant isolation" ON public.bookings
  FOR ALL
  USING (
    app_id = current_setting('app.id', true)::text
    AND organization_id = (
      SELECT id FROM public.organizations
      WHERE app_id = current_setting('app.id', true)::text
      LIMIT 1
    )
  );
```

### `analytics_events` table
```sql
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id           TEXT NOT NULL DEFAULT '<APP_ID>',
  organization_id  UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  event_type       TEXT NOT NULL,    -- 'page_view', 'cta_click', 'form_submit', 'phone_click'
  page_path        TEXT,             -- e.g. '/', '/services', '/contact'
  referrer         TEXT,             -- where the visitor came from
  user_agent       TEXT,
  ip_hash          TEXT,             -- hashed for privacy
  session_id       TEXT,

  -- Optional metadata
  properties       JSONB DEFAULT '{}', -- e.g. { "button": "Book Now", "section": "hero" }

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_analytics_app_id          ON public.analytics_events(app_id);
CREATE INDEX idx_analytics_organization_id ON public.analytics_events(organization_id);
CREATE INDEX idx_analytics_event_type      ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_created_at      ON public.analytics_events(created_at DESC);
CREATE INDEX idx_analytics_page_path       ON public.analytics_events(page_path);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant isolation" ON public.analytics_events
  FOR ALL
  USING (
    app_id = current_setting('app.id', true)::text
    AND organization_id = (
      SELECT id FROM public.organizations
      WHERE app_id = current_setting('app.id', true)::text
      LIMIT 1
    )
  );
```

### `reviews` table (if requested)
```sql
CREATE TABLE IF NOT EXISTS public.reviews (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id           TEXT NOT NULL DEFAULT '<APP_ID>',
  organization_id  UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  reviewer_name    TEXT NOT NULL,
  reviewer_email   TEXT,
  rating           SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title            TEXT,
  body             TEXT NOT NULL,
  service          TEXT,             -- which service the review is about
  source           TEXT DEFAULT 'website', -- 'website', 'google', 'facebook'
  source_url       TEXT,             -- link to original review if imported
  is_featured      BOOLEAN DEFAULT false,
  is_published     BOOLEAN DEFAULT false,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reviews_app_id          ON public.reviews(app_id);
CREATE INDEX idx_reviews_organization_id ON public.reviews(organization_id);
CREATE INDEX idx_reviews_is_published    ON public.reviews(is_published);
CREATE INDEX idx_reviews_rating          ON public.reviews(rating);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant isolation" ON public.reviews
  FOR ALL
  USING (
    app_id = current_setting('app.id', true)::text
    AND organization_id = (
      SELECT id FROM public.organizations
      WHERE app_id = current_setting('app.id', true)::text
      LIMIT 1
    )
  );
```

### `gallery_items` table (if requested)
```sql
CREATE TABLE IF NOT EXISTS public.gallery_items (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id           TEXT NOT NULL DEFAULT '<APP_ID>',
  organization_id  UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  title            TEXT,
  caption          TEXT,
  image_url        TEXT NOT NULL,     -- Supabase Storage URL
  before_image_url TEXT,              -- optional before/after pair
  service_tag      TEXT,              -- which service this showcases
  display_order    INTEGER DEFAULT 0,
  is_published     BOOLEAN DEFAULT true,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_gallery_app_id          ON public.gallery_items(app_id);
CREATE INDEX idx_gallery_organization_id ON public.gallery_items(organization_id);
CREATE INDEX idx_gallery_display_order   ON public.gallery_items(display_order);

ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant isolation" ON public.gallery_items
  FOR ALL
  USING (
    app_id = current_setting('app.id', true)::text
    AND organization_id = (
      SELECT id FROM public.organizations
      WHERE app_id = current_setting('app.id', true)::text
      LIMIT 1
    )
  );
```

### `notifications` table (if requested)
```sql
CREATE TABLE IF NOT EXISTS public.notifications (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id           TEXT NOT NULL DEFAULT '<APP_ID>',
  organization_id  UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  type             TEXT NOT NULL,    -- 'new_lead', 'new_booking', 'new_review', 'system'
  title            TEXT NOT NULL,
  body             TEXT,
  link             TEXT,             -- dashboard deep-link e.g. '/dashboard?tab=leads'
  is_read          BOOLEAN DEFAULT false,
  metadata         JSONB DEFAULT '{}',

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_app_id          ON public.notifications(app_id);
CREATE INDEX idx_notifications_organization_id ON public.notifications(organization_id);
CREATE INDEX idx_notifications_is_read         ON public.notifications(is_read);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant isolation" ON public.notifications
  FOR ALL
  USING (
    app_id = current_setting('app.id', true)::text
    AND organization_id = (
      SELECT id FROM public.organizations
      WHERE app_id = current_setting('app.id', true)::text
      LIMIT 1
    )
  );
```

---

## STEP 8 — Seed default data (if applicable)

After all tables are created, ask: **"Would you like to seed default data?"**

If yes, read `business.json` and seed the following:

### Seed services (if `services` table was created)
Read the services from `src/components/landing/services.tsx` or `business.json` and insert them into the `services` table with the correct `app_id` and `organization_id`.

### Seed sample analytics (optional)
Insert a single `page_view` event so the analytics widget has something to show:
```sql
INSERT INTO public.analytics_events (app_id, organization_id, event_type, page_path)
VALUES ('<APP_ID>', '<ORG_ID>', 'page_view', '/');
```

---

## STEP 9 — Update business.json

After everything is set up, update `business.json` to record the Supabase state:
- Set `supabase.organizationSlug` = `<ORG_SLUG>`
- Set `supabase.projectRef` = the Supabase project ref (from Step 2)
- For any feature that now has a table, set its value to `true` in `features`

---

## STEP 10 — Summary report

Print a summary table:

```
✅ Tenant created
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
APP_ID:     chris-auto-shine
ORG NAME:   Chris Auto Shine Detailing
ORG SLUG:   chris-auto-shine
ORG ID:     <uuid>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tables created:
  ✅ leads
  ✅ bookings
  ✅ analytics_events
  ✅ reviews            (features.testimonials → true)
  ✅ gallery_items      (features.gallery → true)
  ✅ notifications
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Next steps:
  1. Add NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
     + SUPABASE_SERVICE_ROLE_KEY to .env.local
  2. Wire up the contact form to insert into `leads`
  3. Wire up the dashboard Leads tab to read from `leads`
  4. Add the analytics snippet to track page views
```
