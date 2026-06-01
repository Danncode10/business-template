-- ============================================================================
-- 20260601_004_security_definer_grants.sql
--
-- ✅ APPLIED 2026-06-01 to project "Businesses" (okctavmxprxjtvnwvvas).
--
-- Follow-up hardening to 003. Two things:
--   1. Lock execute grants on the tenant helper functions to `authenticated`
--      only (they're used inside RLS policies that target authenticated; anon
--      never needs them). Removes the default PUBLIC execute grant so they
--      aren't directly callable via /rest/v1/rpc by anonymous clients.
--   2. Revoke ALL direct-call grants on the pre-existing trigger functions —
--      they fire via triggers, never via RPC, so no role needs EXECUTE.
--
-- (003 finalized the helpers as SECURITY INVOKER, which clears the Supabase
--  "definer function executable" advisory; these grants are belt-and-suspenders
--  and keep the RPC surface minimal.)
-- ============================================================================

begin;

revoke execute on function public.current_app_id() from public, anon;
revoke execute on function public.current_org_id() from public, anon;
revoke execute on function public.is_org_admin()   from public, anon;
grant  execute on function public.current_app_id() to authenticated;
grant  execute on function public.current_org_id() to authenticated;
grant  execute on function public.is_org_admin()   to authenticated;

revoke execute on function public.handle_new_user()      from public, anon, authenticated;
revoke execute on function public.log_service_changes()  from public, anon, authenticated;

commit;
