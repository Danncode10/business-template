"use client"

import * as React from "react"
import {
  LayoutDashboard,
  FileText,
  Inbox,
  Users,
  Settings,
  LogOut,
  Home,
  PanelLeftClose,
  PanelLeft,
  X,
  Menu,
  TrendingUp,
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { siteConfig } from "@/lib/config"
import type { User as SupabaseUser } from "@supabase/supabase-js"

/* ─────────────────────────────────────────────────────────────── */
/*  Nav config                                                       */
/* ─────────────────────────────────────────────────────────────── */
const NAV_MAIN = [
  { id: "overview",  label: "Overview",  icon: LayoutDashboard },
  { id: "pages",     label: "Pages",     icon: FileText },
  { id: "leads",     label: "Leads",     icon: Inbox },
  { id: "team",      label: "Team",      icon: Users },
]

/* ─────────────────────────────────────────────────────────────── */
/*  Stat card                                                        */
/* ─────────────────────────────────────────────────────────────── */
function StatCard({
  label, value, note, icon: Icon, accent,
}: {
  label: string; value: string; note: string; icon: React.ElementType; accent?: string
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
  )
}

/* ─────────────────────────────────────────────────────────────── */
/*  Coming-soon placeholder                                          */
/* ─────────────────────────────────────────────────────────────── */
function ComingSoon({ icon: Icon, title, description, phase }: {
  icon: React.ElementType; title: string; description: string; phase: string
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card flex flex-col items-center justify-center py-24 text-center px-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted border border-border mb-4">
        <Icon className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <h3 className="font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-[13px] text-muted-foreground max-w-xs leading-relaxed mb-4">{description}</p>
      <span className="text-[11px] text-muted-foreground border border-border rounded-full px-3 py-1">{phase}</span>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────── */
/*  Overview tab                                                     */
/* ─────────────────────────────────────────────────────────────── */
function OverviewTab({ displayName, setTab }: { displayName: string; setTab: (tab: string) => void }) {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground tracking-tight">
          Good day, {displayName}.
        </h2>
        <p className="text-[13px] text-muted-foreground mt-1">{today}</p>
      </div>

      {/* Stat cards — 4-column horizontal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Active Pages"    value="—" note="Add your first page"      icon={FileText}        accent="bg-primary/10" />
        <StatCard label="Today's Leads"   value="0" note="Clear inbox today"        icon={Inbox}           accent="bg-amber-500/10" />
        <StatCard label="Total Documents" value="—" note="Upload your first file"   icon={TrendingUp}      accent="bg-blue-500/10" />
        <StatCard label="Urgent Matters"  value="0" note="No items need attention"  icon={LayoutDashboard} accent="bg-rose-500/10" />
      </div>

      {/* Two-column: Recent Activity + Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="text-[13px] font-semibold text-foreground">Recent Activity</h3>
            <button className="text-[12px] text-primary hover:underline">View all →</button>
          </div>
          <div className="px-5 py-10 text-center">
            <p className="text-[13px] text-muted-foreground">No recent activity yet.</p>
            <p className="text-[12px] text-muted-foreground/60 mt-1">Start by editing your landing page.</p>
          </div>
        </div>

        {/* Upcoming */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="text-[13px] font-semibold text-foreground">Quick Actions</h3>
          </div>
          <div className="p-4 space-y-2">
            {[
              { label: "Edit landing page",  desc: "Customize your homepage",    tab: "pages" },
              { label: "View leads",         desc: "See who reached out",        tab: "leads" },
              { label: "Manage team",        desc: "Invite team members",        tab: "team" },
              { label: "Settings",           desc: "Branding & preferences",     tab: "settings" },
            ].map((a) => (
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
  )
}

/* ─────────────────────────────────────────────────────────────── */
/*  Main shell                                                       */
/* ─────────────────────────────────────────────────────────────── */
interface DashboardShellProps {
  user: SupabaseUser
  profile: { full_name?: string | null; role?: string | null } | null
}

export function DashboardShell({ user, profile }: DashboardShellProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTabLocal] = React.useState(searchParams.get("tab") || "overview")
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [collapsed, setCollapsed] = React.useState(false)
  const [userMenuOpen, setUserMenuOpen] = React.useState(false)

  const displayName = profile?.full_name || user.email?.split("@")[0] || "there"
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()

  const setTab = (tab: string) => {
    setActiveTabLocal(tab)
    router.push(`/dashboard?tab=${tab}`, { scroll: false })
    setSidebarOpen(false)
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const activeLabel = [...NAV_MAIN, { id: "settings", label: "Settings", icon: Settings }]
    .find(i => i.id === activeTab)?.label ?? "Overview"

  return (
    <div className="h-screen bg-background flex overflow-hidden">

      {/* ── Mobile overlay ─────────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ────────────────────────────────────────────────────── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-card border-r border-border flex flex-col
        transition-all duration-200 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        ${collapsed ? "md:w-14" : "md:w-56"}
        w-56 md:translate-x-0 md:relative md:z-auto md:h-full md:flex-shrink-0
      `}>

        {/* Logo row */}
        <div className="h-14 flex items-center justify-between px-3 border-b border-border shrink-0">
          <a href="/" className={`flex items-center gap-2.5 overflow-hidden ${collapsed ? "md:justify-center md:w-full" : ""}`}>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[#5B3FE0] shadow-[0_2px_8px_rgba(124,92,255,0.4)] shrink-0">
              <span className="text-[11px] font-black text-white">D</span>
            </div>
            <span className={`text-sm font-bold tracking-tight text-foreground whitespace-nowrap ${collapsed ? "md:hidden" : ""}`}>
              {siteConfig.name}
            </span>
          </a>
          {/* Mobile close */}
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 text-muted-foreground hover:text-foreground rounded-md">
            <X className="w-4 h-4" />
          </button>
          {/* Desktop collapse */}
          {!collapsed && (
            <button onClick={() => setCollapsed(true)} className="hidden md:flex p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Expand when collapsed */}
        {collapsed && (
          <button onClick={() => setCollapsed(false)} className="hidden md:flex items-center justify-center h-10 w-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <PanelLeft className="w-4 h-4" />
          </button>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {!collapsed && (
            <p className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              Main
            </p>
          )}
          {NAV_MAIN.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                title={collapsed ? label : undefined}
                className={`w-full flex items-center gap-3 rounded-lg text-[13px] transition-colors
                  ${collapsed ? "md:justify-center px-0 py-2.5" : "px-3 py-2"}
                  ${isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
              >
                <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                <span className={collapsed ? "md:hidden" : ""}>{label}</span>
              </button>
            )
          })}
        </nav>

        {/* Bottom: Settings + User ───────────────────────────────── */}
        <div className="shrink-0 border-t border-border p-2 space-y-0.5">
          <button
            onClick={() => setTab("settings")}
            title={collapsed ? "Settings" : undefined}
            className={`w-full flex items-center gap-3 rounded-lg text-[13px] transition-colors
              ${collapsed ? "md:justify-center px-0 py-2.5" : "px-3 py-2"}
              ${activeTab === "settings" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
          >
            <Settings className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            <span className={collapsed ? "md:hidden" : ""}>Settings</span>
          </button>

          {/* User profile row */}
          <div className="relative">
            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute bottom-full left-0 mb-2 w-52 z-50 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-[12px] font-bold text-foreground truncate">{displayName}</p>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">{user.email}</p>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={() => { router.push("/"); setUserMenuOpen(false) }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <Home className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                      Back to Home
                    </button>
                    <button
                      onClick={() => { handleSignOut(); setUserMenuOpen(false) }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
            <button
              onClick={() => setUserMenuOpen(v => !v)}
              title={collapsed ? displayName : undefined}
              className={`w-full flex items-center gap-2.5 rounded-lg hover:bg-muted transition-colors
                ${collapsed ? "md:justify-center px-0 py-2" : "px-3 py-2"}`}
            >
              <Avatar className="h-7 w-7 border border-border shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-primary to-[#5B3FE0] text-white font-black text-[10px]">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className={`flex-1 min-w-0 text-left ${collapsed ? "md:hidden" : ""}`}>
                <p className="text-[12px] font-semibold text-foreground truncate">{displayName}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
              </div>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="h-14 flex items-center justify-between px-5 border-b border-border bg-background shrink-0">
          {/* Mobile menu button */}
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          {/* Breadcrumb */}
          <span className="text-[14px] font-medium text-foreground hidden md:block">{activeLabel}</span>
          <div className="flex-1 md:hidden" />
          {/* Right spacer — user is already in sidebar */}
          <div className="w-8" />
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {activeTab === "overview" && <OverviewTab displayName={displayName} setTab={setTab} />}

          {activeTab === "pages" && (
            <ComingSoon icon={FileText} title="Page Editor" description="Create and edit your landing pages. Add sections, customize content, and publish changes live." phase="Phase 5" />
          )}
          {activeTab === "leads" && (
            <ComingSoon icon={Inbox} title="Lead Inbox" description="View all leads from your contact forms. Track inquiries and follow up with potential clients." phase="Phase 5" />
          )}
          {activeTab === "team" && (
            <ComingSoon icon={Users} title="Team Management" description="Invite team members, assign roles (admin, employee), and control access to pages and content." phase="Phase 2" />
          )}
          {activeTab === "settings" && (
            <ComingSoon icon={Settings} title="Settings" description="Configure your organization branding, SMTP email, domain, and notification preferences." phase="Phase 5" />
          )}
        </main>
      </div>
    </div>
  )
}
