"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { siteConfig } from "@/lib/config";

export function SocialProofBar() {
  const { rating, ratingSource, customers, yearsInBusiness } =
    siteConfig.socialProof;

  const items = [
    {
      value: `${rating} ★`,
      label: `on ${ratingSource}`,
    },
    {
      value: customers,
      label: "customers served",
    },
    {
      value: `${yearsInBusiness} yrs`,
      label: "in business",
    },
  ];

  return (
    <section className="relative border-y border-white/[0.04] bg-white/[0.01] overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-0 sm:divide-x sm:divide-white/[0.06]"
        >
          {items.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2.5 sm:px-10 first:pl-0 last:pr-0"
            >
              <span className="text-[15px] font-semibold text-foreground tabular-nums">
                {item.value}
              </span>
              <span className="text-[12px] text-muted-foreground">
                {item.label}
              </span>
            </div>
          ))}

          <div className="sm:pl-10 flex items-center gap-1.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="h-3 w-3 fill-amber-400 text-amber-400"
              />
            ))}
            <span className="ml-1 text-[11px] text-muted-foreground">
              Trusted by small business owners
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
