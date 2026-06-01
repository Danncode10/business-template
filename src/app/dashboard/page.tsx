import { requireDashboardAccess } from "@/services/auth-guard";
import { DashboardShell } from "@/components/dashboard-shell";

export default async function DashboardPage() {
  // Membership gate also runs in dashboard/layout.tsx; calling it here keeps the
  // user + profile typed and guarantees access even if the layout is bypassed.
  const { user, profile } = await requireDashboardAccess();

  return <DashboardShell user={user} profile={profile} />;
}
