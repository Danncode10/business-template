"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Typewriter } from "@/components/landing/typewriter";
import { cn } from "@/lib/utils";
import type { Tables } from "@/types/supabase";

// ─── Types ──────────────────────────────────────────────────────────────────

type PriceTier = { label: string; price: string };
type Service = Tables<"services">;

type PackageView = {
  id: string;
  name: string;
  features: string[];
  prices: PriceTier[];
  featured: boolean;
  badge: string | null;
};

type SimpleRow = { id: string; label: string; price: string };

// ─── Helpers ────────────────────────────────────────────────────────────────

function asStringArray(raw: unknown): string[] {
  return Array.isArray(raw) ? (raw as string[]) : [];
}
function asTiers(raw: unknown): PriceTier[] {
  return Array.isArray(raw) ? (raw as PriceTier[]) : [];
}

function toPackage(s: Service): PackageView {
  return {
    id: s.id,
    name: s.name,
    features: asStringArray(s.features),
    prices: asTiers(s.pricing_tiers),
    featured: !!s.is_featured,
    badge: s.badge,
  };
}

function toSimpleRow(s: Service): SimpleRow {
  const tiers = asTiers(s.pricing_tiers);
  return { id: s.id, label: s.name, price: tiers[0]?.price ?? "" };
}

// ─── Card ───────────────────────────────────────────────────────────────────

function PackageCard({ pkg, index }: { pkg: PackageView; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative rounded-3xl p-px inner-highlight overflow-hidden flex flex-col",
        pkg.featured
          ? "bg-gradient-to-br from-primary/60 via-primary/20 to-transparent"
          : "bg-gradient-to-br from-white/10 via-white/[0.04] to-transparent"
      )}
    >
      {pkg.badge && (
        <div className="absolute top-4 right-4 z-10">
          <span className="px-3 py-1 rounded-full bg-primary text-white text-xs font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {pkg.badge}
          </span>
        </div>
      )}

      <div className="bg-card rounded-3xl p-6 flex flex-col gap-5 h-full">
        <h3 className="text-white font-bold text-xl">{pkg.name}</h3>

        <ul className="space-y-2 flex-1">
          {pkg.features.map((f, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-sm text-muted-foreground leading-relaxed">{f}</span>
            </li>
          ))}
        </ul>

        {pkg.prices.length > 0 && (
          <div className="pt-4 border-t border-border">
            <div className={cn(
              "grid gap-2",
              pkg.prices.length === 3 ? "grid-cols-3" : pkg.prices.length === 2 ? "grid-cols-2" : "grid-cols-1"
            )}>
              {pkg.prices.map((p, i) => (
                <div key={i} className="text-center">
                  {p.label && <p className="text-[10px] text-muted-foreground mb-1">{p.label}</p>}
                  <p className={cn("font-bold", pkg.featured ? "text-primary text-lg" : "text-white text-base")}>
                    {p.price}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Tab config ─────────────────────────────────────────────────────────────

const TAB_CONFIG = [
  { key: "packages",  label: "Packages"  },
  { key: "services",  label: "Services"  },
  { key: "premium",   label: "Premium"   },
] as const;

type TabKey = (typeof TAB_CONFIG)[number]["key"];

// ─── Main component ─────────────────────────────────────────────────────────

export function Packages({ services }: { services: Service[] }) {
  const [tab, setTab] = useState<TabKey>("packages");

  const byCategory = (cat: string) =>
    services
      .filter((s) => s.category === cat)
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

  const activePackages  = byCategory(tab).map(toPackage);
  const specialtyItems  = byCategory("specialty").map(toSimpleRow);
  const addOns          = byCategory("addons").map(toSimpleRow);

  return (
    <section id="packages" className="py-28 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Pricing
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            <Typewriter text="Choose Your Package" speed={35} />
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-base">
            Tailored packages for every need and budget.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <div className="flex gap-1 p-1 rounded-2xl bg-card border border-border">
            {TAB_CONFIG.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                  tab === t.key ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-white"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "grid gap-5",
              activePackages.length === 2
                ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            )}
          >
            {activePackages.length === 0 ? (
              <p className="col-span-full text-center text-muted-foreground py-12">
                No packages available in this category yet.
              </p>
            ) : (
              activePackages.map((pkg, i) => <PackageCard key={pkg.id} pkg={pkg} index={i} />)
            )}
          </motion.div>
        </AnimatePresence>

        {/* Extras */}
        {(specialtyItems.length > 0 || addOns.length > 0) && (
          <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {specialtyItems.length > 0 && (
              <div>
                <h3 className="text-white font-bold text-xl mb-6">Specialty Services</h3>
                <div className="rounded-3xl p-px bg-gradient-to-br from-white/10 via-white/[0.04] to-transparent inner-highlight">
                  <div className="bg-card rounded-3xl p-6 space-y-3">
                    {specialtyItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <span className="text-sm text-white">{item.label}</span>
                        <span className="text-sm font-bold text-primary">{item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {addOns.length > 0 && (
              <div>
                <h3 className="text-white font-bold text-xl mb-6">Add-ons</h3>
                <div className="rounded-3xl p-px bg-gradient-to-br from-white/10 via-white/[0.04] to-transparent inner-highlight">
                  <div className="bg-card rounded-3xl p-6 space-y-3">
                    {addOns.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <span className="text-sm text-white">{item.label}</span>
                        <span className="text-sm font-bold text-primary">{item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground mt-12">
          Not sure which package is right for you?{" "}
          <a href="#contact" className="text-primary hover:underline font-medium">
            Get in touch
          </a>{" "}
          and we&apos;ll help you find the perfect fit.
        </p>
      </div>
    </section>
  );
}
