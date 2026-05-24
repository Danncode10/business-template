-- Migration: Add app_id namespace and organizations table
-- Purpose: Enable multi-project isolation (PHASE 0.5)
-- Created: 2026-05-24

-- ────────────────────────────────────────────────────────────────
-- 1. CREATE ORGANIZATIONS TABLE (tenant anchor)
-- ────────────────────────────────────────────────────────────────

CREATE TABLE "public"."organizations" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "app_id" text NOT NULL DEFAULT 'business-template',
    "name" text NOT NULL,
    "slug" text NOT NULL,
    "logo_url" text,
    "website" text,
    "created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
    "updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT "organizations_app_id_slug_unique" UNIQUE(app_id, slug)
);

CREATE INDEX "idx_organizations_app_id" ON "public"."organizations"(app_id);

-- ────────────────────────────────────────────────────────────────
-- 2. ADD APP_ID TO EXISTING TABLES
-- ────────────────────────────────────────────────────────────────

ALTER TABLE "public"."profiles"
  ADD COLUMN "app_id" text NOT NULL DEFAULT 'business-template',
  ADD COLUMN "organization_id" uuid REFERENCES "public"."organizations"(id) ON DELETE CASCADE;

CREATE INDEX "idx_profiles_app_id" ON "public"."profiles"(app_id);
CREATE INDEX "idx_profiles_organization_id" ON "public"."profiles"(organization_id);

-- ────────────────────────────────────────────────────────────────
-- 3. UPDATE RLS POLICIES (two-layer isolation)
-- ────────────────────────────────────────────────────────────────

-- Organizations: app_id + (admin or member check)
ALTER TABLE "public"."organizations" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "app_id isolation" ON "public"."organizations"
  FOR ALL
  USING (app_id = current_setting('app.id', true)::text);

-- Profiles: app_id + organization_id + user ownership
ALTER TABLE "public"."profiles" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can update all profiles" ON "public"."profiles";
DROP POLICY IF EXISTS "Admins can view all profiles" ON "public"."profiles";
DROP POLICY IF EXISTS "Users can view own profile" ON "public"."profiles";
DROP POLICY IF EXISTS "Users can update own profile." ON "public"."profiles";
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON "public"."profiles";

CREATE POLICY "project + org + user isolation" ON "public"."profiles"
  FOR ALL
  USING (
    app_id = current_setting('app.id', true)::text
    AND organization_id = (auth.jwt() ->> 'organization_id')::uuid
    AND id = auth.uid()
  )
  WITH CHECK (
    app_id = current_setting('app.id', true)::text
    AND organization_id = (auth.jwt() ->> 'organization_id')::uuid
    AND id = auth.uid()
  );
