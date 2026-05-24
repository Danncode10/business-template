-- Supabase Schema Snapshot
-- Generated: 2026-05-24 (PHASE 0.5: Multi-Project Setup)
-- Status: PHASE 0.5 Complete

-- ── TABLES ──
CREATE TABLE "public"."organizations" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "app_id" text NOT NULL DEFAULT 'business-template',
    "name" text NOT NULL,
    "slug" text NOT NULL,
    "logo_url" text,
    "website" text,
    "created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
    "updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "organizations_app_id_slug_unique" UNIQUE (app_id, slug)
);

-- ── INDEXES ──
CREATE INDEX "idx_organizations_app_id" ON "public"."organizations"(app_id);

-- ── RLS POLICIES ──
ALTER TABLE "public"."organizations" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "app_id isolation" ON "public"."organizations"
  FOR ALL
  USING (app_id = current_setting('app.id', true)::text);

-- ── NOTES ──
-- PHASE 0.5 Foundation:
-- - organizations table created as tenant anchor
-- - app_id isolation policy enforces project namespace
-- - Ready for future tables (pages, sections, blog_posts, etc.)
-- - Service layer helpers in src/services/multi-project.ts
-- - Environment variables: NEXT_PUBLIC_APP_ID=business-template, APP_ID=business-template
