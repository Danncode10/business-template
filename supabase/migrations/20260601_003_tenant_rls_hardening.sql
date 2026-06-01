-- ============================================================================
-- 20260601_003_tenant_rls_hardening.sql
--
-- ⚠️  DRAFT — NOT YET APPLIED.  Review + `npm run checkpoint` BEFORE running.
--     This rewrites RLS on the LIVE shared project ("Businesses").
--
-- WHY (audit findings, Issue #5):
--   The existing policies do NOT implement the two-layer (app_id + org_id)
--   isolation that CLAUDE.md/MULTI_PROJECT.md promise:
--     1. `services` had  "public read" USING (true)  -> every tenant's rows
--        (incl. unpublished) readable by anyone.
--     2. `services` had  authenticated write/update/delete USING
--        (auth.uid() IS NOT NULL) -> ANY logged-in user from ANY org could
--        modify ANY client's services. (Direct cross-tenant write hole.)
--     3. "tenant isolation" policies were HARDCODED to app_id='chris-auto-shine'
--        and never referenced organization_id at all.
--     4. `organizations` used current_setting('app.id') which the app never
--        sets -> effectively matched nothing.
--
-- WHAT THIS DOES:
--   - Adds SECURITY DEFINER helpers that read the CURRENT user's app_id/org_id
--     from their profile (so policies are dynamic, not hardcoded).
--   - Scopes every authenticated read/write to the user's own app_id + org_id.
--   - Restricts content writes (services, gallery) to org admins.
--   - Keeps published content publicly readable for the landing page.
--   - Keeps public submission paths open for visitor-facing forms.
--
-- DECISIONS THAT NEED YOUR SIGN-OFF (see inline NOTE blocks):
--   D1. leads / bookings / analytics_events accept ANONYMOUS inserts (visitor
--       forms + page-view events). WITH CHECK (true) allows submitting into any
--       app_id/org_id. Lower risk than a read leak, but spammable. The robust
--       fix is to route these through a validated server route / edge function
--       using the service-role key and drop the public insert policy. Flagged.
--   D2. `organizations` is publicly readable (business name/logo/NAP is public
--       branding). This exposes the list of orgs across apps. Acceptable for
--       public info; tighten if the tenant list must stay private.
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- Helpers: derive the caller's tenant from their profile row.
-- SECURITY DEFINER so they bypass RLS on profiles (avoids recursion / lockout).
-- ----------------------------------------------------------------------------
create or replace function public.current_app_id()
  returns text language sql stable security definer set search_path = public as $$
  select app_id from public.profiles where id = auth.uid()
$$;

create or replace function public.current_org_id()
  returns uuid language sql stable security definer set search_path = public as $$
  select organization_id from public.profiles where id = auth.uid()
$$;

create or replace function public.is_org_admin()
  returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
$$;

-- ----------------------------------------------------------------------------
-- profiles — keep self-access only (unchanged; listed for completeness).
--   policy "users can view and edit own profile"  USING (id = auth.uid())
-- ----------------------------------------------------------------------------

-- ----------------------------------------------------------------------------
-- organizations
-- ----------------------------------------------------------------------------
drop policy if exists "app_id isolation" on public.organizations;

-- D2: public branding info.
create policy "public read organizations"
  on public.organizations for select
  using (true);

create policy "members manage own organization"
  on public.organizations for all to authenticated
  using (id = public.current_org_id() and app_id = public.current_app_id())
  with check (id = public.current_org_id() and app_id = public.current_app_id());

-- ----------------------------------------------------------------------------
-- services
-- ----------------------------------------------------------------------------
drop policy if exists "public read" on public.services;
drop policy if exists "public can read published services" on public.services;
drop policy if exists "authenticated write" on public.services;
drop policy if exists "authenticated update" on public.services;
drop policy if exists "authenticated delete" on public.services;

create policy "public read published services"
  on public.services for select
  using (is_published = true);

create policy "admins manage org services"
  on public.services for all to authenticated
  using (
    app_id = public.current_app_id()
    and organization_id = public.current_org_id()
    and public.is_org_admin()
  )
  with check (
    app_id = public.current_app_id()
    and organization_id = public.current_org_id()
    and public.is_org_admin()
  );

-- ----------------------------------------------------------------------------
-- gallery_items
-- ----------------------------------------------------------------------------
drop policy if exists "public can read published gallery" on public.gallery_items;
drop policy if exists "authenticated admin can manage gallery" on public.gallery_items;

create policy "public read published gallery"
  on public.gallery_items for select
  using (is_published = true);

create policy "admins manage org gallery"
  on public.gallery_items for all to authenticated
  using (
    app_id = public.current_app_id()
    and organization_id = public.current_org_id()
    and public.is_org_admin()
  )
  with check (
    app_id = public.current_app_id()
    and organization_id = public.current_org_id()
    and public.is_org_admin()
  );

-- ----------------------------------------------------------------------------
-- leads — visitor contact-form submissions
-- ----------------------------------------------------------------------------
drop policy if exists "tenant isolation" on public.leads;

-- D1: anyone may submit a lead (public contact form).
create policy "public submit leads"
  on public.leads for insert to anon, authenticated
  with check (true);

create policy "members read org leads"
  on public.leads for select to authenticated
  using (app_id = public.current_app_id() and organization_id = public.current_org_id());

create policy "members update org leads"
  on public.leads for update to authenticated
  using (app_id = public.current_app_id() and organization_id = public.current_org_id())
  with check (app_id = public.current_app_id() and organization_id = public.current_org_id());

create policy "members delete org leads"
  on public.leads for delete to authenticated
  using (app_id = public.current_app_id() and organization_id = public.current_org_id());

-- ----------------------------------------------------------------------------
-- bookings — visitor booking submissions
-- ----------------------------------------------------------------------------
drop policy if exists "tenant isolation" on public.bookings;

-- D1: anyone may create a booking (public booking form).
create policy "public submit bookings"
  on public.bookings for insert to anon, authenticated
  with check (true);

create policy "members read org bookings"
  on public.bookings for select to authenticated
  using (app_id = public.current_app_id() and organization_id = public.current_org_id());

create policy "members update org bookings"
  on public.bookings for update to authenticated
  using (app_id = public.current_app_id() and organization_id = public.current_org_id())
  with check (app_id = public.current_app_id() and organization_id = public.current_org_id());

create policy "members delete org bookings"
  on public.bookings for delete to authenticated
  using (app_id = public.current_app_id() and organization_id = public.current_org_id());

-- ----------------------------------------------------------------------------
-- analytics_events — visitor page/events (append-only)
-- ----------------------------------------------------------------------------
drop policy if exists "tenant isolation" on public.analytics_events;

-- D1: anyone may emit an analytics event.
create policy "public insert analytics"
  on public.analytics_events for insert to anon, authenticated
  with check (true);

create policy "members read org analytics"
  on public.analytics_events for select to authenticated
  using (app_id = public.current_app_id() and organization_id = public.current_org_id());

-- ----------------------------------------------------------------------------
-- notifications — internal, members only
-- ----------------------------------------------------------------------------
drop policy if exists "tenant isolation" on public.notifications;

create policy "members manage org notifications"
  on public.notifications for all to authenticated
  using (app_id = public.current_app_id() and organization_id = public.current_org_id())
  with check (app_id = public.current_app_id() and organization_id = public.current_org_id());

-- ----------------------------------------------------------------------------
-- audit_logs — members read; inserts scoped; immutable (no update/delete)
-- ----------------------------------------------------------------------------
drop policy if exists "tenant isolation" on public.audit_logs;

create policy "members read org audit logs"
  on public.audit_logs for select to authenticated
  using (app_id = public.current_app_id() and organization_id = public.current_org_id());

create policy "members insert org audit logs"
  on public.audit_logs for insert to authenticated
  with check (app_id = public.current_app_id() and organization_id = public.current_org_id());

commit;

-- ============================================================================
-- ROLLBACK NOTE: the prior policies are captured in the audit dump in Issue #5
-- and in supabase/backups/. If anything breaks, re-create the previous policies
-- from that reference (they were permissive, so rollback restores access).
-- ============================================================================
