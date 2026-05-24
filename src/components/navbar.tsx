"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { businessConfig } from "@/lib/business-config";
import { signOut } from "@/services/auth";
import { useRouter } from "next/navigation";
import { LogOut, LayoutDashboard, Settings, ChevronDown, ArrowUpRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { User } from "@supabase/supabase-js";

const navLinks = [
  { label: "Services", href: "/#services" },
  { label: "Gallery", href: "/#gallery" },
  { label: "Contact", href: "/#contact" },
];

export function Navbar({ user }: { user: User | null }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <motion.div
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as any }}
          style={{ transform: "translateZ(0)" }}
          className={`pointer-events-auto mt-4 flex items-center gap-1 rounded-full border border-white/[0.08] bg-[#0A0A12]/95 px-1.5 py-1.5 transition-shadow duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] inner-highlight ${
            scrolled
              ? "shadow-[0_8px_32px_-8px_rgba(0,0,0,0.7),0_0_0_1px_rgba(124,92,255,0.1)]"
              : "shadow-[0_4px_16px_-4px_rgba(0,0,0,0.5)]"
          }`}
        >
          {/* Logo */}
          <Link
            href="/#home"
            className="group flex items-center gap-2 pl-3 pr-4 py-1.5 rounded-full hover:bg-white/[0.03] transition-colors"
          >
            <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[#5B3FE0] shadow-[0_2px_8px_rgba(124,92,255,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]">
              <span className="text-[11px] font-black text-primary-foreground">
                {businessConfig.name?.[0]?.toUpperCase() || 'D'}
              </span>
            </div>
            <span className="text-sm font-semibold tracking-tight text-foreground">
              {businessConfig.name}
            </span>
          </Link>

          {/* Desktop nav — with sliding underline reveal on hover */}
          <nav className="hidden md:flex items-center">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="group relative px-3.5 py-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                {link.label}
                {/* Underline reveal — scales in from left on hover */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute left-3.5 right-3.5 bottom-0.5 h-[1px] bg-gradient-to-r from-primary/70 via-primary to-primary/70 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]"
                />
              </a>
            ))}
          </nav>

          {/* CTA + Github Link */}
          <div className="hidden md:flex items-center gap-1 pl-1">
            {businessConfig.githubUrl && (
              <a
                href={businessConfig.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-[13px] font-medium text-muted-foreground rounded-full hover:text-foreground hover:bg-white/[0.03] transition-all duration-300"
                title="View on GitHub"
              >
                GitHub
              </a>
            )}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="group flex items-center gap-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] active:scale-[0.97] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] pl-1 pr-3 py-1 border border-white/[0.06]">
                  <Avatar className="h-6 w-6 ring-1 ring-white/10">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-[#5B3FE0] text-primary-foreground font-black text-[9px]">
                      {user.email?.[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[12px] font-medium text-foreground/90 max-w-[110px] truncate">
                    {user.email?.split("@")[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-64 mt-3 rounded-2xl shadow-2xl border-white/[0.06] bg-card">
                  <DropdownMenuLabel>
                    <div className="flex flex-col gap-0.5 py-1">
                      <p className="text-[10px] font-bold text-foreground uppercase tracking-[0.15em] truncate">
                        {user.email?.split("@")[0]}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono truncate">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => router.push("/dashboard")}
                    className="rounded-lg mx-1 my-0.5 cursor-pointer"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/dashboard?tab=settings")}
                    className="rounded-lg mx-1 my-0.5 cursor-pointer"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span className="font-medium text-sm">Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="rounded-lg mx-1 my-0.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span className="font-medium text-sm">Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <a
                  href="/login"
                  className="px-3.5 py-1.5 text-[13px] font-medium text-muted-foreground rounded-full hover:text-foreground hover:bg-white/[0.03] transition-all duration-300"
                >
                  Sign in
                </a>
                <a
                  href="/login"
                  className="group flex items-center gap-1.5 pl-3.5 pr-1.5 py-1.5 text-[13px] font-medium rounded-full bg-foreground text-background hover:bg-foreground/90 active:scale-[0.97] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] shadow-[0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]"
                >
                  Get started
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background/10 group-hover:bg-background/20 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300">
                    <ArrowUpRight className="w-3 h-3" />
                  </span>
                </a>
              </>
            )}
          </div>

          {/* Mobile toggle — morphing hamburger */}
          <button
            className="md:hidden relative h-9 w-9 flex items-center justify-center rounded-full hover:bg-white/[0.04] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span
              className={`absolute h-[1.5px] w-4 bg-foreground rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                mobileOpen ? "rotate-45" : "-translate-y-[4px]"
              }`}
            />
            <span
              className={`absolute h-[1.5px] w-4 bg-foreground rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                mobileOpen ? "-rotate-45" : "translate-y-[4px]"
              }`}
            />
          </button>
        </motion.div>
      </header>

      {/* Mobile full-screen overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] as any }}
            className="md:hidden fixed inset-0 z-40 bg-background/95 pt-24 px-6"
          >
            <nav className="flex flex-col gap-1">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{
                    duration: 0.35,
                    delay: 0.05 + i * 0.04,
                    ease: [0.16, 1, 0.3, 1] as any,
                  }}
                  className="flex items-center justify-between px-5 py-5 rounded-2xl border border-white/[0.04] hover:border-white/10 hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-2xl font-semibold tracking-tight text-foreground">
                    {link.label}
                  </span>
                  <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
                </motion.a>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.2, ease: [0.16, 1, 0.3, 1] as any }}
                className="mt-6 flex flex-col gap-3"
              >
                {user ? (
                  <>
                    <button
                      onClick={() => {
                        router.push("/dashboard");
                        setMobileOpen(false);
                      }}
                      className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-foreground text-background font-semibold text-sm"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl border border-red-400/20 bg-red-400/5 text-red-400 font-semibold text-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </>
                ) : (
                  <a
                    href="/login"
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-foreground text-background font-semibold text-sm"
                  >
                    Get started
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                )}
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer so content isn't hidden under the floating nav */}
      <div className="h-20" />
    </>
  );
}
