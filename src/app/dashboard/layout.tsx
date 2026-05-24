import { redirect } from "next/navigation";
import { getUserProfile } from "@/services/dashboard";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/dashboard/top-bar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getUserProfile();

  if (!session?.user) {
    redirect("/login");
  }

  const { user, profile } = session;
  const displayName = profile?.full_name || user.email?.split("@")[0] || "User";

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />

      {/* Main content — offset by sidebar width on desktop */}
      <div className="flex-1 flex flex-col lg:ml-[220px] min-w-0 transition-[margin] duration-300">
        <TopBar
          user={user}
          displayName={displayName}
          pageTitle="Dashboard"
        />

        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
