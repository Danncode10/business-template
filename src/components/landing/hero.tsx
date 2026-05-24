"use client";

import { useRef, useState, useEffect, MouseEvent } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ArrowRight,
  Terminal,
  Database,
  Shield,
  Zap,
} from "lucide-react";
import { siteConfig } from "@/lib/config";
import { Typewriter } from "./typewriter";
import { WaterParticles } from "./water-particles";

interface HeroProps {
  isAuthed: boolean;
}

const HERO_HEADLINE = "Help small businesses go digital.";
const HERO_TYPING_SPEED = 60; // ~2.5s total for headline

export function Hero({ isAuthed }: HeroProps) {
  const [typingDone, setTypingDone] = useState(false);

  // Blur the fixed navbar directly — CSS `body.intro-active header` can be
  // unreliable for fixed+z-indexed elements; inline styles guarantee it.
  const blurHeader = () => {
    const el = document.querySelector<HTMLElement>("header");
    if (!el) return;
    el.style.transition =
      "filter 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)";
    el.style.filter = "blur(8px)";
    el.style.opacity = "0.25";
    el.style.pointerEvents = "none";
  };
  const clearHeader = () => {
    const el = document.querySelector<HTMLElement>("header");
    if (!el) return;
    el.style.filter = "";
    el.style.opacity = "";
    el.style.pointerEvents = "";
  };

  useEffect(() => {
    document.body.classList.add("intro-active");
    blurHeader();
    return () => {
      document.body.classList.remove("intro-active");
      clearHeader();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typingDone) {
      document.body.classList.remove("intro-active");
      clearHeader();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typingDone]);

  return (
    <section
      id="home"
      className="relative overflow-hidden pt-16 pb-32 md:pt-24 md:pb-44"
      style={{
        background:
          "radial-gradient(ellipse 800px 600px at 80% 0%, rgba(124,92,255,0.16), transparent 60%), var(--color-background)",
      }}
    >
      {/* Static dot grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid opacity-40"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 grid-fade-overlay"
      />

      {/* Water-particle field — visible and moving immediately so it's
          present during the typewriter reveal, not only after it */}
      <WaterParticles active={true} count={140} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Microcopy link — blurred while typing, clears after */}
        <motion.a
          href="/#features"
          initial={{ opacity: 0.35, filter: "blur(8px)" }}
          animate={
            typingDone
              ? { opacity: 1, filter: "blur(0px)" }
              : { opacity: 0.35, filter: "blur(8px)" }
          }
          transition={{
            duration: 0.7,
            delay: typingDone ? 0 : 0,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="group inline-flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary uppercase tracking-[0.15em]">
            New
          </span>
          <span>Complete platform for client websites & marketing</span>
          <ArrowRight className="h-3 w-3 transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-1" />
        </motion.a>

        {/* Headline — typewriter reveal (~3s total) */}
        <h1 className="mt-8 max-w-[18ch] text-[2.75rem] sm:text-6xl md:text-7xl lg:text-[5rem] font-semibold tracking-[-0.035em] leading-[0.98] text-foreground">
          <Typewriter
            text={HERO_HEADLINE}
            speed={HERO_TYPING_SPEED}
            delay={200}
            onComplete={() => setTypingDone(true)}
            highlight={{ start: 4, end: 21, delay: 350 }}
          />
        </h1>

        {/* Subtitle — visible but blurred during typing, clears after */}
        <motion.p
          initial={{ opacity: 0.35, filter: "blur(10px)" }}
          animate={
            typingDone
              ? { opacity: 1, filter: "blur(0px)" }
              : { opacity: 0.35, filter: "blur(10px)" }
          }
          transition={{
            duration: 0.8,
            delay: typingDone ? 0.05 : 0,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="mt-8 max-w-xl text-[17px] text-muted-foreground leading-relaxed"
        >
          Build beautiful, multi-tenant client websites with Dann. One platform
          for landing pages, lead capture, team collaboration, and analytics.
          Launch faster, scale easier.
        </motion.p>

        {/* CTAs — visible but blurred during typing, pops in after */}
        <motion.div
          initial={{ opacity: 0.35, filter: "blur(10px)" }}
          animate={
            typingDone
              ? { opacity: 1, filter: "blur(0px)" }
              : { opacity: 0.35, filter: "blur(10px)" }
          }
          transition={{
            duration: 0.8,
            delay: typingDone ? 0.18 : 0,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-7"
        >
          <MagneticCTA href={isAuthed ? "/dashboard" : "/login"}>
            Start your journey
          </MagneticCTA>

          <a
            href={siteConfig.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 text-[14px] font-medium text-foreground/90 hover:text-foreground transition-colors"
          >
            <GitHubIcon className="h-3.5 w-3.5" />
            <span className="border-b border-white/[0.15] group-hover:border-white/[0.4] transition-colors pb-0.5">
              View on GitHub
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </motion.div>

        {/* Customer logo strip — blurred during typing, clears after */}
        <motion.div
          initial={{ opacity: 0.3, filter: "blur(10px)" }}
          animate={
            typingDone
              ? { opacity: 1, filter: "blur(0px)" }
              : { opacity: 0.3, filter: "blur(10px)" }
          }
          transition={{
            duration: 0.8,
            delay: typingDone ? 0.32 : 0,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="mt-16 flex flex-col gap-5"
        >
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground/60">
            Trusted by small business owners and agencies
          </p>
          {/* Grid (not flex) for universal gap support across browsers */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-x-8 gap-y-4 max-w-2xl">
            {[
              "Vercel",
              "Supabase",
              "Tailwind",
              "Shadcn",
              "TanStack",
              "Upstash",
            ].map((logo) => (
              <span
                key={logo}
                className="text-[15px] font-semibold tracking-tight text-foreground/40 hover:text-foreground/70 transition-colors duration-300 cursor-default text-center sm:text-left"
              >
                {logo}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Product preview — blurred during typing, fully revealed after */}
        <motion.div
          initial={{ opacity: 0.2, filter: "blur(14px)" }}
          animate={
            typingDone
              ? { opacity: 1, filter: "blur(0px)" }
              : { opacity: 0.2, filter: "blur(14px)" }
          }
          transition={{
            duration: 1.0,
            delay: typingDone ? 0.5 : 0,
            ease: [0.34, 1.3, 0.64, 1],
          }}
          className="relative mt-24"
          style={{ perspective: "1500px" }}
        >
          <TiltCard>
            <div className="relative rounded-[calc(2rem-0.375rem)] bg-card overflow-hidden border border-white/[0.04] inner-highlight">
              {/* Top bar */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04] bg-background/40">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                  <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                  <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.03] border border-white/[0.04]">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {siteConfig.name}.app/dashboard
                  </span>
                </div>
                <div className="w-12" />
              </div>

              {/* Dashboard grid */}
              <div className="grid grid-cols-12 gap-3 p-5">
                <div className="col-span-3 space-y-2">
                  {[Terminal, Database, Shield, Zap].map((Icon, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] transition-colors duration-200 ${
                        i === 0
                          ? "bg-primary/10 border border-primary/20 text-primary"
                          : "text-muted-foreground hover:bg-white/[0.02]"
                      }`}
                    >
                      <Icon className="h-3 w-3" strokeWidth={1.5} />
                      <span className="font-medium">
                        {["Overview", "Database", "Auth", "API"][i]}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="col-span-9 space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "MRR", val: "$48.2k", delta: "+12.4%" },
                      { label: "Active orgs", val: "1,247", delta: "+8.2%" },
                      { label: "Uptime", val: "99.99%", delta: "30d" },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                      >
                        <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground">
                          {s.label}
                        </p>
                        <p className="mt-1.5 text-base font-semibold text-foreground tabular-nums">
                          {s.val}
                        </p>
                        <p className="mt-0.5 text-[9px] text-emerald-400 font-mono">
                          {s.delta}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="relative h-32 rounded-xl bg-white/[0.02] border border-white/[0.04] overflow-hidden p-3">
                    <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground mb-2">
                      Revenue by tenant · last 12 weeks
                    </p>
                    <div className="flex items-end justify-between h-16 gap-1">
                      {[40, 60, 35, 75, 55, 85, 70, 90, 65, 80, 50, 95].map(
                        (h, i) => (
                          <div
                            key={i}
                            style={{ height: `${h}%` }}
                            className="flex-1 rounded-sm bg-gradient-to-t from-primary/40 to-primary/80"
                          />
                        )
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {[
                      { user: "stripe-checkout", action: "POST /api/webhooks · 200 OK" },
                      { user: "auth.signIn", action: "INSERT auth.sessions · RLS pass" },
                      { user: "pages.update", action: "UPDATE pages · org_id matched" },
                    ].map((row, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.015] border border-white/[0.03]"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-mono uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            ok
                          </span>
                          <div>
                            <p className="text-[10px] font-mono text-foreground">
                              {row.user}
                            </p>
                            <p className="text-[9px] text-muted-foreground">
                              {row.action}
                            </p>
                          </div>
                        </div>
                        <span className="text-[9px] font-mono text-muted-foreground">
                          {12 + i}ms
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TiltCard>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Magnetic CTA — button gently follows the cursor
   GPU-only (transform), rAF-throttled, no shadow animation.
   ───────────────────────────────────────────── */
function MagneticCTA({ href, children }: { href: string; children: React.ReactNode }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const frame = useRef<number | null>(null);

  const handleMove = (e: MouseEvent<HTMLAnchorElement>) => {
    if (frame.current !== null) return;
    const cx = e.clientX;
    const cy = e.clientY;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = cx - (rect.left + rect.width / 2);
      const y = cy - (rect.top + rect.height / 2);
      // Move at 18% of distance from center — subtle magnetism
      el.style.transform = `translate3d(${x * 0.18}px, ${y * 0.18}px, 0)`;
    });
  };

  const handleLeave = () => {
    if (frame.current !== null) {
      cancelAnimationFrame(frame.current);
      frame.current = null;
    }
    if (ref.current) ref.current.style.transform = "translate3d(0,0,0)";
  };

  return (
    <a
      ref={ref}
      href={href}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ willChange: "transform" }}
      className="group inline-flex items-center gap-2 pl-6 pr-2 py-2 text-sm font-medium rounded-full bg-foreground text-background active:scale-[0.97] transition-transform duration-[400ms] ease-[cubic-bezier(0.23,1,0.32,1)] shadow-[0_4px_20px_rgba(124,92,255,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]"
    >
      {children}
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-background/10 group-hover:bg-background/20 transition-colors duration-200">
        <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
    </a>
  );
}

/* ─────────────────────────────────────────────
   TiltCard — subtle 3D perspective tilt on mouse position.
   GPU-only, rAF-throttled. Resets on mouseleave.
   ───────────────────────────────────────────── */
function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    if (frame.current !== null) return;
    const cx = e.clientX;
    const cy = e.clientY;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (cx - rect.left) / rect.width - 0.5;
      const y = (cy - rect.top) / rect.height - 0.5;
      const rotX = -y * 4; // max ±2deg
      const rotY = x * 4;
      el.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    });
  };

  const handleLeave = () => {
    if (frame.current !== null) {
      cancelAnimationFrame(frame.current);
      frame.current = null;
    }
    if (ref.current) ref.current.style.transform = "rotateX(0deg) rotateY(0deg)";
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        willChange: "transform",
        transformStyle: "preserve-3d",
        transition: "transform 600ms cubic-bezier(0.23, 1, 0.32, 1)",
      }}
      className="relative p-1.5 rounded-[2rem] bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/[0.06] shadow-[0_12px_40px_-12px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.04)]"
    >
      {children}
    </div>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}
