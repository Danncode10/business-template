"use client";

import { motion } from "framer-motion";
import { Check, ArrowUpRight } from "lucide-react";
import { Typewriter } from "./typewriter";

const PLANS = [
  {
    name: "Starter",
    price: "$0",
    suffix: "/mo",
    description: "For solo builders getting started.",
    features: [
      "Full starter template",
      "Supabase auth & database",
      "Checkpoint system",
      "Community support",
    ],
    cta: "Get started",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$29",
    suffix: "/mo",
    description: "For serious builders shipping products.",
    features: [
      "Everything in Starter",
      "Priority AI support",
      "Advanced MCP integrations",
      "Premium templates",
      "Team collaboration",
    ],
    cta: "Start free trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    suffix: "",
    description: "For teams and organizations.",
    features: [
      "Everything in Pro",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
      "White-label options",
    ],
    cta: "Contact sales",
    highlight: false,
  },
];

interface PricingProps {
  isAuthed: boolean;
}

export function Pricing({ isAuthed }: PricingProps) {
  return (
    <section
      id="pricing"
      className="relative bg-background isolate overflow-hidden border-t border-white/[0.04]"
    >
      {/* Background dot grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid-sm opacity-50"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 grid-fade-overlay"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as any }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1 text-[10px] font-medium text-foreground/70 uppercase tracking-[0.2em]">
            Pricing
          </span>
          <h2 className="mt-6 text-4xl sm:text-5xl font-semibold text-foreground tracking-[-0.02em]">
            <Typewriter text="Simple, transparent pricing" speed={40} />
          </h2>
          <p className="mt-5 text-[15px] text-muted-foreground max-w-md mx-auto">
            Start free. Scale when you&apos;re ready.
          </p>
        </motion.div>

        {/* Plans */}
        <div className="mx-auto grid max-w-5xl grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 28, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.7,
                delay: i * 0.1,
                ease: [0.34, 1.35, 0.64, 1] as any,
              }}
              style={{ willChange: "transform" }}
              className="relative group transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-1"
            >
              {/* Animated border for highlighted plan */}
              {plan.highlight && (
                <div
                  aria-hidden
                  className="absolute -inset-px rounded-[2rem] bg-gradient-to-b from-primary/40 via-primary/10 to-transparent opacity-100 blur-sm"
                />
              )}

              {/* Outer bezel */}
              <div
                className={`relative p-1.5 rounded-[2rem] border ${
                  plan.highlight
                    ? "border-primary/30 bg-gradient-to-b from-white/[0.08] to-white/[0.02]"
                    : "border-white/[0.06] bg-white/[0.015]"
                } inner-highlight transition-all duration-500`}
              >
                {/* "Most popular" badge */}
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <div className="flex items-center gap-1.5 rounded-full bg-foreground text-background px-3 py-1 text-[10px] font-semibold tracking-wide shadow-[0_4px_16px_rgba(124,92,255,0.4)]">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Most popular
                    </div>
                  </div>
                )}

                {/* Inner core — no backdrop-blur (perf) */}
                <div className="rounded-[calc(2rem-0.375rem)] bg-card p-7 md:p-8 flex flex-col h-full">
                  {/* Plan header */}
                  <div className="mb-6">
                    <h3 className="text-base font-semibold text-foreground">
                      {plan.name}
                    </h3>
                    <p className="mt-1 text-[13px] text-muted-foreground">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-7">
                    <div className="flex items-baseline gap-1">
                      <span
                        className={`text-5xl font-semibold tracking-[-0.03em] ${
                          plan.highlight
                            ? "gradient-text-primary"
                            : "text-foreground"
                        }`}
                      >
                        {plan.price}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {plan.suffix}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2.5 text-[13px] text-foreground/80"
                      >
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full mt-0.5 ${
                            plan.highlight
                              ? "bg-primary/20 text-primary"
                              : "bg-white/[0.04] text-foreground/60"
                          }`}
                        >
                          <Check className="h-2.5 w-2.5" strokeWidth={3} />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <a
                    href={
                      plan.name === "Enterprise"
                        ? "#"
                        : isAuthed
                        ? "/dashboard"
                        : "/login"
                    }
                    className={`group/cta flex items-center justify-center gap-2 w-full py-3 rounded-full text-[13px] font-medium transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97] ${
                      plan.highlight
                        ? "bg-foreground text-background hover:opacity-90 shadow-[0_4px_20px_rgba(124,92,255,0.25),inset_0_1px_0_rgba(255,255,255,0.2)]"
                        : "bg-white/[0.04] border border-white/[0.06] text-foreground hover:bg-white/[0.08]"
                    }`}
                  >
                    {plan.cta}
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5 transition-transform duration-500" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
