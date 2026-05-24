import { getUserProfile } from "@/services/dashboard";
import { DashboardShell } from "@/components/dashboard-shell";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getUserProfile();
  if (!session?.user) redirect("/login");

  const { user, profile } = session;

  return <DashboardShell user={user} profile={profile} />;
}
