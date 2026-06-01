'use server';

import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';
import type { Database } from '@/types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

/**
 * Deployment identity — which project + which client this build serves.
 *
 * - app_id  → project namespace (shared across Dann's projects on one Supabase)
 * - org_id  → THIS client's organization. Optional, but REQUIRED in production
 *             multi-tenant deploys to physically isolate one client's dashboard
 *             from another's. When set, the gate fails closed against it.
 */
export async function getDeploymentAppId(): Promise<string> {
  return process.env.NEXT_PUBLIC_APP_ID ?? 'business-template';
}

export async function getDeploymentOrgId(): Promise<string | null> {
  return process.env.NEXT_PUBLIC_ORG_ID ?? null;
}

/**
 * Membership gate for the admin dashboard.
 *
 * Supabase Auth is project-level: a credential created on ANY deployment that
 * shares this Supabase project can authenticate here. Authentication alone is
 * therefore NOT proof of belonging. This guard upgrades "is logged in" to
 * "is a member of THIS deployment's app + organization".
 *
 * Fails CLOSED: any missing/mismatched/uncertain state denies access.
 *
 * Returns the authenticated user + their profile when access is granted.
 * Redirects otherwise (never returns to the caller on denial).
 */
export async function requireDashboardAccess(): Promise<{
  user: User;
  profile: Profile;
}> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // RLS on `profiles` is `id = auth.uid()`, so this only returns the caller's row.
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  // No profile row = orphaned auth user (e.g. signed up against a sibling site
  // but never provisioned here). Deny.
  if (error || !profile) redirect('/no-access');

  const expectedAppId = await getDeploymentAppId();
  if (profile.app_id !== expectedAppId) redirect('/no-access');

  const expectedOrgId = await getDeploymentOrgId();
  if (expectedOrgId) {
    // Strict tenant isolation: user must belong to THIS client's org.
    if (!profile.organization_id || profile.organization_id !== expectedOrgId) {
      redirect('/no-access');
    }
  }

  return { user, profile };
}
