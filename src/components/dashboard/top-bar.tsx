"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, LogOut, User, Settings } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface TopBarProps {
  user: SupabaseUser;
  displayName: string;
  pageTitle: string;
}

export function TopBar({ user, displayName, pageTitle }: TopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.06] bg-background/95 px-6"
      style={{ backdropFilter: "blur(8px)" }}
    >
      {/* Page title */}
      <h1 className="text-[15px] font-semibold text-foreground tracking-tight">
        {pageTitle}
      </h1>

      {/* Right — user dropdown */}
      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 transition-colors hover:bg-white/[0.05]"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 border border-primary/30 text-[10px] font-bold text-primary">
            {initials}
          </div>
          <span className="text-[13px] font-medium text-foreground hidden sm:block max-w-[120px] truncate">
            {displayName}
          </span>
          <ChevronDown
            className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
            strokeWidth={1.5}
          />
        </button>

        <AnimatePresence>
          {menuOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />

              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-0 top-[calc(100%+8px)] z-50 w-52 rounded-2xl border border-white/[0.08] bg-card shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden"
              >
                {/* User info */}
                <div className="px-4 py-3 border-b border-white/[0.06]">
                  <p className="text-[12px] font-semibold text-foreground truncate">{displayName}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                </div>

                {/* Menu items */}
                <div className="p-1.5 space-y-0.5">
                  <button
                    onClick={() => { router.push("/dashboard/settings"); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors text-left"
                  >
                    <User className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Account Settings
                  </button>
                  <button
                    onClick={() => { router.push("/dashboard/settings"); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors text-left"
                  >
                    <Settings className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Organization
                  </button>
                </div>

                <div className="p-1.5 border-t border-white/[0.06]">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
                  >
                    <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Sign out
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
