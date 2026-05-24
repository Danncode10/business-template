"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Users,
  Inbox,
  Settings,
  ChevronLeft,
  Menu,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/pages", icon: FileText, label: "Pages" },
  { href: "/dashboard/leads", icon: Inbox, label: "Leads" },
  { href: "/dashboard/team", icon: Users, label: "Team" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 220 }}
        transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        className="hidden lg:flex flex-col fixed left-0 top-0 h-full z-40 border-r border-white/[0.06] bg-background/95"
        style={{ backdropFilter: "blur(8px)" }}
      >
        {/* Logo row */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-white/[0.06] shrink-0">
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                key="logo-text"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[#5B3FE0] shadow-[0_2px_8px_rgba(124,92,255,0.4)] shrink-0">
                  <span className="text-[11px] font-black text-white">D</span>
                </div>
                <span className="text-sm font-semibold tracking-tight text-foreground">
                  Dann Digital
                </span>
              </motion.div>
            )}
            {collapsed && (
              <motion.div
                key="logo-icon"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[#5B3FE0] shadow-[0_2px_8px_rgba(124,92,255,0.4)]"
              >
                <span className="text-[11px] font-black text-white">D</span>
              </motion.div>
            )}
          </AnimatePresence>

          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="mx-auto mt-3 flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors"
          >
            <Menu className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        )}

        {/* Nav items */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-hidden">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center gap-3 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-colors duration-200 ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.span
                      key="label"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-primary"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </motion.aside>
    </>
  );
}
