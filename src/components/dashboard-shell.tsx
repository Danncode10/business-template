"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Tag,
  Inbox,
  Calendar,
  Image as ImageIcon,
  BarChart3,
  ScrollText,
  Settings,
  LogOut,
  Home,
  PanelLeftClose,
  PanelLeft,
  X,
  Menu,
  type LucideIcon,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { siteConfig } from "@/lib/config";
import type { User as SupabaseUser } from "@supabase/supabase-js";

import { getEnabledTabs, isFeatureEnabled, type DashboardTabId } from "@/lib/dashboard-features";
import { OverviewTab } from "@/components/dashboard/tabs/overview-tab";
import { ServicesTab } from "@/components/dashboard/tabs/services-tab";
import { LeadsTab } from "@/components/dashboard/tabs/leads-tab";
import { BookingsTab } from "@/components/dashboard/tabs/bookings-tab";
import { GalleryTab } from "@/components/dashboard/tabs/gallery-tab";
import { AnalyticsTab } from "@/components/dashboard/tabs/analytics-tab";
import { LogsTab } from "@/components/dashboard/tabs/logs-tab";
import { SettingsTab } from "@/components/dashboard/tabs/settings-tab";
import { NotificationsBell } from "@/components/dashboard/notifications-bell";

const ICONS: Record<DashboardTabId, LucideIcon> = {
  overview: LayoutDashboard,
  services: Tag,
  leads: Inbox,
  bookings: Calendar,
  gallery: ImageIcon,
  analytics: BarChart3,
  logs: ScrollText,
  settings: Settings,
};

interface DashboardShellProps {
  user: SupabaseUser;
  profile: { full_name?: string | null; role?: string | null } | null;
}

export function DashboardShell({ user, profile }: DashboardShellProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const enabledTabs = React.useMemo(() => getEnabledTabs(), []);
  const validIds = React.useMemo(() => new Set(enabledTabs.map((t) => t.id)), [enabledTabs]);

  const initialTab = (() => {
    const fromQuery = searchParams.get("tab") as DashboardTabId | null;
    return fromQuery && validIds.has(fromQuery) ? fromQuery : "overview";
  })();

  const [activeTab, setActiveTabLocal] = React.useState<DashboardTabId>(initialTab);
  // Track which tabs have ever been visited — they stay mounted (just hidden) after first visit.
  const [mountedTabs, setMountedTabs] = React.useState<Set<DashboardTabId>>(new Set([initialTab]));
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  const displayName = profile?.full_name || user.email?.split("@")[0] || "there";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  const setTab = React.useCallback((tab: DashboardTabId) => {
    if (!validIds.has(tab)) return;
    setActiveTabLocal(tab);
    // Add to mounted set so the component is never unmounted after first visit
    setMountedTabs(prev => prev.has(tab) ? prev : new Set([...prev, tab]));
    router.push(`/dashboard?tab=${tab}`, { scroll: false });
    setSidebarOpen(false);
  }, [router, validIds]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const mainTabs = enabledTabs.filter((t) => t.id !== "settings");
  const activeLabel = enabledTabs.find((t) => t.id === activeTab)?.label ?? "Overview";

  return (
    <div className="h-screen bg-background flex overflow-hidden">

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-card border-r border-border flex flex-col
        transition-all duration-200 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        ${collapsed ? "md:w-14" : "md:w-56"}
        w-56 md:translate-x-0 md:relative md:z-auto md:h-full md:flex-shrink-0
      `}>

        <div className="h-14 flex items-center justify-between px-3 border-b border-border shrink-0">
          <a href="/" className={`flex items-center gap-2.5 overflow-hidden ${collapsed ? "md:justify-center md:w-full" : ""}`}>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-[0_2px_8px_rgba(220,38,38,0.4)] shrink-0">
              <span className="text-[11px] font-black text-white">{siteConfig.name.charAt(0)}</span>
            </div>
            <span className={`text-sm font-bold tracking-tight text-foreground whitespace-nowrap ${collapsed ? "md:hidden" : ""}`}>
              {siteConfig.name}
            </span>
          </a>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 text-muted-foreground hover:text-foreground rounded-md">
            <X className="w-4 h-4" />
          </button>
          {!collapsed && (
            <button onClick={() => setCollapsed(true)} className="hidden md:flex p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {collapsed && (
          <button onClick={() => setCollapsed(false)} className="hidden md:flex items-center justify-center h-10 w-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <PanelLeft className="w-4 h-4" />
          </button>
        )}

        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {!collapsed && (
            <p className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              Main
            </p>
          )}
          {mainTabs.map(({ id, label }) => {
            const Icon = ICONS[id];
            const isActive = activeTab === id;
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
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-border p-2 space-y-0.5">
          {isFeatureEnabled("always") && (
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
          )}

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
                      onClick={() => { router.push("/"); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <Home className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                      Back to Home
                    </button>
                    <button
                      onClick={() => { handleSignOut(); setUserMenuOpen(false); }}
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
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white font-black text-[10px]">
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

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        <header className="h-14 flex items-center justify-between px-5 border-b border-border bg-background shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-[14px] font-medium text-foreground hidden md:block">{activeLabel}</span>
          <div className="flex-1 md:hidden" />
          <NotificationsBell setTab={setTab} />
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {/* Lazy-mount: each tab mounts on first visit and stays mounted (hidden) after.
              This keeps React Query observers alive so there's zero reload on tab switch. */}
          {mountedTabs.has("overview")  && <div hidden={activeTab !== "overview"}>  <OverviewTab displayName={displayName} setTab={setTab} /></div>}
          {mountedTabs.has("services")  && <div hidden={activeTab !== "services"}>  <ServicesTab /></div>}
          {mountedTabs.has("leads")     && <div hidden={activeTab !== "leads"}>     <LeadsTab /></div>}
          {mountedTabs.has("bookings")  && <div hidden={activeTab !== "bookings"}>  <BookingsTab /></div>}
          {mountedTabs.has("gallery")   && <div hidden={activeTab !== "gallery"}>   <GalleryTab /></div>}
          {mountedTabs.has("analytics") && <div hidden={activeTab !== "analytics"}> <AnalyticsTab /></div>}
          {mountedTabs.has("logs")      && <div hidden={activeTab !== "logs"}>      <LogsTab /></div>}
          {mountedTabs.has("settings")  && <div hidden={activeTab !== "settings"}>  <SettingsTab /></div>}
        </main>
      </div>
    </div>
  );
}
