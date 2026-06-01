-- ============================================================================
-- RLS POLICY ROLLBACK SNAPSHOT — captured 2026-06-01, BEFORE migration
-- 20260601_003_tenant_rls_hardening.sql was applied to project
-- "Businesses" (okctavmxprxjtvnwvvas).
--
-- To roll back the hardening migration, run this file. It restores the exact
-- policies that existed prior. (Note: these were the PERMISSIVE/insecure
-- policies — restoring them re-opens the cross-tenant holes documented in
-- Issue #5. Roll back only if the new policies break the live client.)
--
-- This does NOT drop the new policies/helper functions; pair with manual
-- cleanup if a full revert is needed.
-- ============================================================================

DROP POLICY IF EXISTS "tenant isolation" ON public.analytics_events;
CREATE POLICY "tenant isolation" ON public.analytics_events AS PERMISSIVE FOR ALL TO public USING ((app_id = 'chris-auto-shine'::text));

DROP POLICY IF EXISTS "tenant isolation" ON public.audit_logs;
CREATE POLICY "tenant isolation" ON public.audit_logs AS PERMISSIVE FOR ALL TO public USING ((app_id = 'chris-auto-shine'::text));

DROP POLICY IF EXISTS "tenant isolation" ON public.bookings;
CREATE POLICY "tenant isolation" ON public.bookings AS PERMISSIVE FOR ALL TO public USING ((app_id = 'chris-auto-shine'::text));

DROP POLICY IF EXISTS "authenticated admin can manage gallery" ON public.gallery_items;
CREATE POLICY "authenticated admin can manage gallery" ON public.gallery_items AS PERMISSIVE FOR ALL TO public USING (((app_id = 'chris-auto-shine'::text) AND (EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::user_role) AND (profiles.app_id = 'chris-auto-shine'::text))))));

DROP POLICY IF EXISTS "public can read published gallery" ON public.gallery_items;
CREATE POLICY "public can read published gallery" ON public.gallery_items AS PERMISSIVE FOR SELECT TO public USING (((app_id = 'chris-auto-shine'::text) AND (is_published = true)));

DROP POLICY IF EXISTS "tenant isolation" ON public.leads;
CREATE POLICY "tenant isolation" ON public.leads AS PERMISSIVE FOR ALL TO public USING ((app_id = 'chris-auto-shine'::text));

DROP POLICY IF EXISTS "tenant isolation" ON public.notifications;
CREATE POLICY "tenant isolation" ON public.notifications AS PERMISSIVE FOR ALL TO public USING ((app_id = 'chris-auto-shine'::text));

DROP POLICY IF EXISTS "app_id isolation" ON public.organizations;
CREATE POLICY "app_id isolation" ON public.organizations AS PERMISSIVE FOR ALL TO public USING ((app_id = current_setting('app.id'::text, true)));

DROP POLICY IF EXISTS "users can view and edit own profile" ON public.profiles;
CREATE POLICY "users can view and edit own profile" ON public.profiles AS PERMISSIVE FOR ALL TO public USING ((id = auth.uid())) WITH CHECK ((id = auth.uid()));

DROP POLICY IF EXISTS "authenticated delete" ON public.services;
CREATE POLICY "authenticated delete" ON public.services AS PERMISSIVE FOR DELETE TO public USING ((auth.uid() IS NOT NULL));

DROP POLICY IF EXISTS "authenticated update" ON public.services;
CREATE POLICY "authenticated update" ON public.services AS PERMISSIVE FOR UPDATE TO public USING ((auth.uid() IS NOT NULL));

DROP POLICY IF EXISTS "authenticated write" ON public.services;
CREATE POLICY "authenticated write" ON public.services AS PERMISSIVE FOR INSERT TO public WITH CHECK ((auth.uid() IS NOT NULL));

DROP POLICY IF EXISTS "public can read published services" ON public.services;
CREATE POLICY "public can read published services" ON public.services AS PERMISSIVE FOR SELECT TO public USING (((app_id = 'chris-auto-shine'::text) AND (is_published = true)));

DROP POLICY IF EXISTS "public read" ON public.services;
CREATE POLICY "public read" ON public.services AS PERMISSIVE FOR SELECT TO public USING (true);
