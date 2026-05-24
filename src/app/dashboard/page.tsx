import { getUserProfile } from "@/services/dashboard";
import { redirect } from "next/navigation";
import { Users, FileText, Inbox, TrendingUp } from "lucide-react";

const STAT_CARDS = [
  {
    label: "Pages",
    value: "—",
    icon: FileText,
    color: "text-primary",
    bg: "bg-primary/10 border-primary/20",
    note: "Ready to add",
  },
  {
    label: "Leads",
    value: "—",
    icon: Inbox,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    note: "Connect contact form",
  },
  {
    label: "Team Members",
    value: "1",
    icon: Users,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    note: "Invite your team",
  },
  {
    label: "Visitors",
    value: "—",
    icon: TrendingUp,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    note: "Analytics coming soon",
  },
];

export default async function DashboardPage() {
  const session = await getUserProfile();
  if (!session?.user) redirect("/login");

  const { profile, user } = session;
  const name = profile?.full_name || user.email?.split("@")[0] || "there";

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground tracking-tight">
          Welcome back, {name}
        </h2>
        <p className="mt-1 text-[14px] text-muted-foreground">
          Here's what's happening with your business.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.015] p-1.5 inner-highlight"
            >
              <div className="rounded-[calc(1rem-0.375rem)] bg-card px-5 py-5">
                <div className={`inline-flex items-center justify-center h-9 w-9 rounded-xl border ${card.bg} mb-4`}>
                  <Icon className={`h-4 w-4 ${card.color}`} strokeWidth={1.5} />
                </div>
                <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium">
                  {card.label}
                </p>
                <p className="mt-1.5 text-3xl font-semibold text-foreground tabular-nums">
                  {card.value}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground/60">
                  {card.note}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="text-[13px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Edit landing page", desc: "Customize your homepage", href: "/dashboard/pages" },
            { label: "View leads", desc: "See who reached out", href: "/dashboard/leads" },
            { label: "Invite team", desc: "Add team members", href: "/dashboard/team" },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              className="group flex flex-col gap-1 rounded-2xl border border-white/[0.06] bg-white/[0.015] p-4 transition-all duration-200 hover:border-primary/30 hover:bg-primary/[0.03] inner-highlight"
            >
              <span className="text-[13px] font-medium text-foreground group-hover:text-primary transition-colors">
                {action.label}
              </span>
              <span className="text-[12px] text-muted-foreground">
                {action.desc}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Activity placeholder */}
      <div>
        <h3 className="text-[13px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-4">
          Recent Activity
        </h3>
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-1.5 inner-highlight">
          <div className="rounded-[calc(1rem-0.375rem)] bg-card px-6 py-10 text-center">
            <p className="text-[13px] text-muted-foreground">
              No activity yet. Start by editing your landing page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
