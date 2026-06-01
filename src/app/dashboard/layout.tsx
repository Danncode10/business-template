import { requireDashboardAccess } from '@/services/auth-guard';

/**
 * Server-side gate for EVERY /dashboard/* route.
 *
 * Previously only /dashboard/page.tsx checked auth (and only "is logged in"),
 * leaving /dashboard/leads, /settings, /team, /pages unprotected. This layout
 * runs the membership gate once for the whole segment, so a user authenticated
 * via the shared Supabase pool but not a member of THIS deployment's org/app is
 * denied before any dashboard UI renders.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireDashboardAccess();
  return <>{children}</>;
}
