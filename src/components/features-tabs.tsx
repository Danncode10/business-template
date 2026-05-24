"use client";

import { useState, useRef, MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database,
  GitBranch,
  Shield,
  Zap,
  Terminal,
  Layers,
  ExternalLink,
  ChevronRight,
  Code,
  Lock,
} from "lucide-react";
import type { Database as DatabaseType } from "@/types/supabase";

const FEATURES = [
  {
    icon: Layers,
    title: "Beautiful Landing Pages",
    description:
      "Drag-and-drop editor to create stunning websites. No coding required. Sections for hero, services, testimonials, pricing, and more.",
    span: "lg:col-span-2 lg:row-span-2",
    // Paint-only radial corner glow — no filter:blur cost on scroll
    glow: "radial-gradient(circle at 80% 20%, rgba(124,92,255,0.18), transparent 50%)",
  },
  {
    icon: Database,
    title: "Lead Capture & CRM",
    description:
      "Capture leads from contact forms. Inbox management, follow-up emails, and lead tracking built in.",
    span: "lg:col-span-2",
    glow: "radial-gradient(circle at 80% 20%, rgba(245,158,11,0.15), transparent 50%)",
  },
  {
    icon: Shield,
    title: "Team Collaboration",
    description: "Invite team members, assign roles, and manage permissions. Full audit trail of changes.",
    span: "",
    glow: "radial-gradient(circle at 80% 20%, rgba(16,185,129,0.15), transparent 50%)",
  },
  {
    icon: Zap,
    title: "SEO Optimized",
    description: "Built-in meta tags, JSON-LD schema, sitemaps, and Google analytics integration.",
    span: "",
    glow: "radial-gradient(circle at 80% 20%, rgba(249,115,22,0.15), transparent 50%)",
  },
  {
    icon: Code,
    title: "Multi-Tenant Ready",
    description:
      "One platform for multiple clients. Perfect for agencies. Complete data isolation and branding per client.",
    span: "lg:col-span-2",
    glow: "radial-gradient(circle at 80% 20%, rgba(139,92,246,0.15), transparent 50%)",
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description:
      "Row-level security, encrypted passwords, SMTP email delivery, and role-based access control.",
    span: "lg:col-span-2",
    glow: "radial-gradient(circle at 80% 20%, rgba(236,72,153,0.15), transparent 50%)",
  },
];

function BentoCard({
  feature,
  index,
}: {
  feature: (typeof FEATURES)[number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    if (frameRef.current !== null) return; // already a frame queued — skip
    const clientX = e.clientX;
    const clientY = e.clientY;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      ref.current.style.setProperty("--x", `${clientX - rect.left}px`);
      ref.current.style.setProperty("--y", `${clientY - rect.top}px`);
    });
  };

  const Icon = feature.icon;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.65,
        delay: index * 0.06,
        ease: [0.34, 1.35, 0.64, 1],
      }}
      style={{ willChange: "transform" }}
      className={`group relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.015] p-1.5 inner-highlight transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-white/[0.14] hover:-translate-y-1 ${feature.span}`}
    >
      {/* Mouse-follow glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(360px circle at var(--x) var(--y), rgba(124,92,255,0.15), transparent 70%)",
        }}
      />

      {/* Inner core — no backdrop-blur (perf) */}
      <div className="relative h-full rounded-[calc(1.5rem-0.375rem)] bg-card p-7 md:p-8 flex flex-col overflow-hidden">
        {/* Paint-only corner accent (no filter:blur cost) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: feature.glow }}
        />

        <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.06] mb-6 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:bg-white/[0.08] group-hover:scale-105 group-hover:rotate-[-3deg]">
          <Icon
            className="h-4 w-4 text-foreground transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-110"
            strokeWidth={1.5}
          />
        </div>

        <h3 className="relative text-[15px] font-semibold text-foreground tracking-tight mb-2">
          {feature.title}
        </h3>
        <p className="relative text-[13px] text-muted-foreground leading-relaxed">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

const GITHUB_PER_PAGE = 5;

interface Repo {
  name: string;
  url: string;
  description: string;
}

function GithubRepoPaginated({ repos }: { repos: Repo[] }) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(repos.length / GITHUB_PER_PAGE);
  const pageRepos = repos.slice(page * GITHUB_PER_PAGE, (page + 1) * GITHUB_PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Creator attribution */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-secondary border border-border">
        <GitBranch className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="text-[11px] font-mono text-muted-foreground leading-relaxed">
          Repositories of <span className="text-foreground font-semibold">Danncode10</span>, the creator of DannFlow.
          To show <span className="text-foreground font-semibold">your own repos</span>, edit{" "}
          <code className="bg-border px-1.5 py-0.5 rounded text-[10px]">src/lib/config.ts</code> → <code className="bg-border px-1.5 py-0.5 rounded text-[10px]">creatorRepos</code>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {pageRepos.map((repo, i) => (
          <a key={i} href={repo.url} target="_blank" rel="noreferrer" className="block group">
            <div className="group p-6 md:p-8 rounded-3xl md:rounded-5xl border border-border bg-card hover:border-primary/20 transition-all duration-300 flex flex-col h-full relative overflow-hidden hover:shadow-2xl hover:shadow-primary/5">
              <div className="flex items-center justify-between mb-5 md:mb-6">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl bg-secondary border border-border flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-inner">
                  <GitBranch className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <span className="text-[10px] font-medium uppercase text-muted-foreground tracking-wider opacity-50">Repo</span>
              </div>
              <h4 className="text-base md:text-lg font-semibold text-foreground mb-2 tracking-tight group-hover:text-primary transition-colors truncate">
                {repo.name}
              </h4>
              <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2">
                {repo.description || "No description available."}
              </p>
              <div className="mt-auto pt-5 border-t border-border flex items-center justify-between mt-5">
                <span className="text-[12px] font-medium text-primary flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                  View repo <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* [‹] 1 2 3 4 [›] */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:border-primary/50 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all text-base font-black"
          >
            ‹
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`w-9 h-9 flex items-center justify-center rounded-xl text-[12px] font-black transition-all border ${
                page === i
                  ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:border-primary/50 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all text-base font-black"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}

type Profile = DatabaseType["public"]["Tables"]["profiles"]["Row"];

export function FeaturesTabs({
  profiles,
  repos,
  currentRole,
}: {
  profiles: Profile[];
  repos: Repo[];
  currentRole?: string;
}) {


  const [active, setActive] = useState("features");
  const [hovered, setHovered] = useState<string | null>(null);

  const TABS_CONFIG = [
    { id: "features", label: "Features", icon: Zap, count: FEATURES.length },
    {
      id: "supabase",
      label: "Supabase Live",
      icon: Database,
      count: profiles?.length || 0,
    },
    {
      id: "github",
      label: "GitHub MCP",
      icon: GitHubIcon,
      count: repos?.length || 0,
    },
  ];



  return (
    <div className="w-full">
      {/* ── Tabs Navigation — refined glass pill ── */}
      <div className="flex justify-center mb-12 md:mb-16">
        <div className="flex p-1 rounded-full bg-white/[0.02] border border-white/[0.06] inner-highlight relative overflow-x-auto no-scrollbar max-w-[calc(100vw-2rem)]">
          {TABS_CONFIG.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = active === tab.id;
            const isHovered = hovered === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                onMouseEnter={() => setHovered(tab.id)}
                onMouseLeave={() => setHovered(null)}
                className={`relative flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-full text-[13px] font-medium transition-colors duration-300 whitespace-nowrap ${
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground/80"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="modern-pill"
                    className="absolute inset-0 bg-white/[0.06] rounded-full border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] z-0"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
                  />
                )}
                {isHovered && !isActive && (
                  <motion.div
                    layoutId="hover-pill"
                    className="absolute inset-0 bg-white/[0.02] rounded-full z-0"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <TabIcon
                    className="w-3.5 h-3.5"
                    strokeWidth={1.5}
                  />
                  {tab.label}
                  <span
                    className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-mono tracking-wide transition-colors duration-500 ${
                      isActive
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "bg-white/[0.04] text-muted-foreground border border-white/[0.04]"
                    }`}
                  >
                    {tab.count}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-[500px] relative px-4">
        <AnimatePresence mode="wait">
          {/* Section: Features Bento Grid */}
          {active === "features" && (
            <motion.div
              key="features-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 auto-rows-[minmax(180px,auto)]"
            >
              {FEATURES.map((feature, i) => (
                <BentoCard key={i} feature={feature} index={i} />
              ))}
            </motion.div>
          )}

          {/* Section: Supabase Dashboard */}
          {active === "supabase" && (
            <motion.div
              key="supabase-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-3xl md:rounded-5xl border border-border bg-card p-6 md:p-10 lg:p-14 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)] overflow-hidden"
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 md:gap-10 mb-10 md:mb-12">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="h-12 w-12 md:h-16 md:w-16 bg-primary rounded-xl md:rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 shrink-0">
                    <Database className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">Supabase</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Connected
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 md:gap-4 w-full lg:w-auto">
                  <div className="bg-secondary border border-border rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 flex flex-col flex-1 lg:min-w-[140px]">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Role</span>
                    <span className="text-lg md:text-xl font-bold text-primary tracking-tight flex items-center gap-2 capitalize">
                      <Lock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      {currentRole || "User"}
                    </span>
                  </div>
                  <div className="bg-foreground border border-foreground rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 flex flex-col flex-1 lg:min-w-[140px] text-background">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Members</span>
                    <span className="text-xl md:text-2xl font-black tracking-tight">{profiles?.length || 0}</span>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/10 rounded-2xl md:rounded-3xl p-6 md:p-8 mb-8 md:mb-10 flex gap-4 md:gap-6 items-start">
                <Shield className="w-5 h-5 md:w-6 md:h-6 text-primary shrink-0 mt-1" />
                <div>
                  <h4 className="text-base md:text-lg font-semibold text-foreground mb-1 md:mb-2 tracking-tight">Row-level security</h4>
                  <p className="text-muted-foreground text-[14px] md:text-[15px] leading-relaxed font-medium">
                    Your identity is encrypted by Supabase Auth and governed by strict RLS policies.
                    Only <strong className="text-primary">ADMIN</strong> role can edit data in this cluster.
                  </p>
                </div>
              </div>

              <div className="border border-border rounded-3xl overflow-hidden bg-secondary/30">
                <div className="bg-secondary px-8 py-4 border-b border-border flex items-center justify-between">
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Profile</span>
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Role</span>
                </div>

                {profiles && profiles.length > 0 ? (
                  <div className="divide-y divide-border bg-card">
                    {profiles.map((p, i) => (
                      <div key={i} className="px-4 md:px-8 py-4 md:py-6 flex items-center justify-between hover:bg-secondary transition-colors group gap-4">
                        <div className="flex items-center gap-3 md:gap-6 min-w-0">
                          <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl bg-secondary text-primary flex items-center justify-center font-black text-base md:text-lg border border-border shrink-0">
                            {(p.full_name || "U")[0].toUpperCase()}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm md:text-base font-bold text-foreground mb-0.5 md:mb-1 tracking-tight truncate">{p.full_name || "Anonymous identity"}</span>
                            <span className="text-[9px] md:text-[10px] font-bold text-muted-foreground font-mono tracking-tight opacity-70 italic truncate">{p.email || p.id?.slice(0, 24)}</span>
                          </div>
                        </div>
                        <span className={`px-2 md:px-3 py-1 rounded-md text-[10px] font-medium uppercase tracking-wide border transition-all shrink-0 ${p.role === 'admin' ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20' : 'bg-secondary text-muted-foreground border-border'
                          }`}>
                          {p.role || "user"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-20 text-center flex flex-col items-center justify-center grayscale opacity-40 bg-card">
                    <Database className="w-10 h-10 text-muted-foreground mb-4" />
                    <p className="text-lg font-bold text-muted-foreground italic">No nodes detected in cluster.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Section: GitHub Hub */}
          {active === "github" && (
            <motion.div
              key="github-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-3xl md:rounded-5xl border border-border bg-card p-6 md:p-10 lg:p-14 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)]"
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-10 md:mb-12">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="h-12 w-12 md:h-16 md:w-16 bg-foreground rounded-xl md:rounded-2xl flex items-center justify-center text-background shadow-xl shrink-0">
                    <GitHubIcon className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">GitHub</h3>
                    <span className="text-[10px] font-medium text-muted-foreground tracking-wide mt-1.5 block">MCP integration</span>
                  </div>
                </div>
                <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-secondary border border-border hover:bg-card transition-all text-xs font-medium text-foreground hover:shadow-md w-full md:w-auto justify-center">
                  Connect GitHub <ExternalLink className="w-3 h-3 text-muted-foreground" />
                </a>
              </div>

              {repos && repos.length > 0 ? (
                <GithubRepoPaginated repos={repos} />
              ) : (
                <div className="p-32 text-center flex flex-col items-center border border-dashed border-border rounded-5xl bg-secondary/30 grayscale opacity-40">
                  <Code className="w-12 h-12 mb-6 text-muted-foreground" />
                  <p className="text-base font-bold text-muted-foreground italic">Initializing Manifests...</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

