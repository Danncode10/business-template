"use client";

import { useQuery } from "@tanstack/react-query";
import { FileText, Inbox, TrendingUp, LayoutDashboard } from "lucide-react";
import { getDashboardStats, getRecentActivity } from "@/services/dashboard-stats";
import type { DashboardTabId } from "@/lib/dashboard-features";
import { isFeatureEnabled, type FeatureFlag } from "@/lib/dashboard-features";

function StatCard({
  label, value, note, icon: Icon, accent,
}: {
  label: string; value: string | number; note: string; icon: React.ElementType; accent?: string
}) {
  return (
    <div className="bg-card border border-border rounded-2xl px-5 py-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.15em]">{label}</p>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${accent ?? "bg-muted"}`}>
          <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
        </div>
      </div>
      <p className="text-3xl font-bold text-foreground tabular-nums">{value}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{note}</p>
    </div>
  );
}

function describeActivity(action: string, diff: unknown): string {
  if (action === "update.service" && diff && typeof diff === "object") {
    const fields = Object.keys(diff as Record<string, unknown>);
    return `Updated service: ${fields.join(", ")}`;
  }
  if (action === "create.service") return "Created a new service";
  if (action === "delete.service") return "Deleted a service";
  return action;
}

interface OverviewTabProps {
  displayName: string;
  setTab: (tab: DashboardTabId) => void;
}

export function OverviewTab({ displayName, setTab }: OverviewTabProps) {
  const today = new Date().toLocaleDateString("en-AU", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
    staleTime: 30_000,
  });

  const { data: activity } = useQuery({
    queryKey: ["recent-activity"],
    queryFn: () => getRecentActivity(8),
    staleTime: 30_000,
  });

  const quickActions: Array<{ label: string; desc: string; tab: DashboardTabId; flag: FeatureFlag }> = [
    { label: "Edit services & pricing",   desc: "Update prices live",       tab: "services" as const, flag: "pricing" as const },
    { label: "View leads",                desc: "See who reached out",      tab: "leads" as const,    flag: "contactForm" as const },
    { label: "Manage bookings",           desc: "Confirm appointments",     tab: "bookings" as const, flag: "contactForm" as const },
    { label: "Update gallery",            desc: "Publish before/after",     tab: "gallery" as const,  flag: "gallery" as const },
    { label: "View analytics",            desc: "Page views & traffic",     tab: "analytics" as const, flag: "analytics" as const },
    { label: "Account settings",          desc: "Profile & security",       tab: "settings" as const, flag: "always" as const },
  ].filter(a => isFeatureEnabled(a.flag));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-foreground tracking-tight">
          Good day, {displayName}.
        </h2>
        <p className="text-[13px] text-muted-foreground mt-1">{today}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Active Services"   value={stats?.publishedServices ?? "—"} note="Live on your site"        icon={FileText}        accent="bg-primary/10" />
        <StatCard label="Today's Leads"     value={stats?.todayLeads ?? "—"}        note={`${stats?.newLeads ?? 0} new total`} icon={Inbox}      accent="bg-amber-500/10" />
        <StatCard label="Total Bookings"    value={stats?.totalBookings ?? "—"}     note={`${stats?.pendingBookings ?? 0} pending`} icon={TrendingUp} accent="bg-blue-500/10" />
        <StatCard label="Gallery Items"     value={stats?.galleryPublished ?? "—"}  note="Published"                 icon={LayoutDashboard} accent="bg-rose-500/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="text-[13px] font-semibold text-foreground">Recent Activity</h3>
          </div>
          <div className="divide-y divide-border max-h-80 overflow-y-auto">
            {(activity ?? []).length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-[13px] text-muted-foreground">No recent activity yet.</p>
              </div>
            ) : (
              (activity ?? []).map((a) => (
                <div key={a.id} className="px-5 py-3 text-[12px]">
                  <p className="text-foreground">{describeActivity(a.action, a.diff)}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {a.actor_email ?? "system"} · {new Date(a.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="text-[13px] font-semibold text-foreground">Quick Actions</h3>
          </div>
          <div className="p-4 space-y-2">
            {quickActions.map((a) => (
              <button
                key={a.tab}
                onClick={() => setTab(a.tab)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-background hover:border-primary/30 hover:bg-primary/[0.03] transition-all duration-200 text-left group"
              >
                <div>
                  <p className="text-[13px] font-medium text-foreground group-hover:text-primary transition-colors">{a.label}</p>
                  <p className="text-[11px] text-muted-foreground">{a.desc}</p>
                </div>
                <span className="text-muted-foreground group-hover:text-primary text-xs">→</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
