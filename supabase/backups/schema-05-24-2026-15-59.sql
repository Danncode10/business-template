-- Supabase Business Template Schema Checkpoint
-- Generated: 2026-05-24 15:59 UTC
-- Project: Businesses (okctavmxprxjtvnwvvas)
-- This schema represents the live state of the database at the time of capture.

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

-- ============================================================================
-- ENUMS / CUSTOM TYPES
-- ============================================================================

-- (None defined in public schema)

-- ============================================================================
-- TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.organizations (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    app_id text NOT NULL DEFAULT 'business-template'::text,
    name text NOT NULL,
    slug text NOT NULL,
    logo_url text,
    website text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT organizations_pkey PRIMARY KEY (id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- (Default indexes on primary keys only)

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- (None defined in public schema)

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- (None defined in public schema)

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "app_id isolation" ON public.organizations
    FOR ALL
    USING ((app_id = current_setting('app.id'::text, true)));

-- ============================================================================
-- MIGRATION HISTORY
-- ============================================================================
-- Migrations applied to reach this schema state:
-- 20260524052309 - init_app_id_foundation

-- ============================================================================
-- SCHEMA METADATA
-- ============================================================================
-- Captured schema: public
-- Total tables: 1
-- Total RLS policies: 1
-- Total functions: 0
-- Total triggers: 0
-- Total enums: 0
-- RLS enabled: YES (organizations)
