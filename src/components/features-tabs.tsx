"use client";

import { useState, useRef, MouseEvent } from "react";
import { motion } from "framer-motion";
import {
  Layers,
  Database,
  Shield,
  Zap,
  Code,
  Lock,
} from "lucide-react";

const FEATURES = [
  {
    icon: Layers,
    title: "Beautiful Landing Pages",
    description:
      "Drag-and-drop editor to create stunning websites. No coding required. Sections for hero, services, testimonials, pricing, and more.",
    span: "lg:col-span-2 lg:row-span-2",
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
    if (frameRef.current !== null) return;
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

export function FeaturesTabs() {
  return (
    <div className="w-full">
      {/* Features Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 auto-rows-[minmax(180px,auto)]">
        {FEATURES.map((feature, i) => (
          <BentoCard key={i} feature={feature} index={i} />
        ))}
      </div>
    </div>
  );
}
