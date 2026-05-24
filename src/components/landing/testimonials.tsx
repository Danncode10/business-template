"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { Typewriter } from "./typewriter";

const TESTIMONIALS = [
  {
    quote:
      "Dann Digital transformed our online presence in just a week. We went from zero to a professional website with a working lead form. Highly recommended.",
    name: "Maria Santos",
    role: "Owner, Santos Bakery",
    rating: 5,
    initials: "MS",
    accent: "from-purple-500/20 to-violet-500/10",
  },
  {
    quote:
      "The platform is incredibly easy to use. I managed to set up my service listings, contact page, and team profiles without any technical help.",
    name: "James Rivera",
    role: "Director, Rivera Consulting",
    rating: 5,
    initials: "JR",
    accent: "from-amber-500/20 to-orange-500/10",
  },
  {
    quote:
      "We get new leads every week directly through the contact form on our site. The dashboard makes it easy to track and follow up with prospects.",
    name: "Chen Wei",
    role: "Founder, Wei Electrical",
    rating: 5,
    initials: "CW",
    accent: "from-emerald-500/20 to-teal-500/10",
  },
  {
    quote:
      "I love that I can update my business hours, photos, and pricing without calling a developer. The admin panel is really intuitive.",
    name: "Sofia Reyes",
    role: "Manager, Reyes Auto Detailing",
    rating: 5,
    initials: "SR",
    accent: "from-sky-500/20 to-blue-500/10",
  },
  {
    quote:
      "Switched from a static HTML site to this platform and the difference is night and day. Our online bookings doubled within the first month.",
    name: "David Park",
    role: "Owner, Park Fitness Studio",
    rating: 5,
    initials: "DP",
    accent: "from-rose-500/20 to-pink-500/10",
  },
];

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="relative bg-background isolate overflow-hidden border-t border-white/[0.04]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid-sm opacity-40"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 grid-fade-overlay-v"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-32">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1 text-[10px] font-medium text-foreground/70 uppercase tracking-[0.2em]">
            Testimonials
          </span>
          <h2 className="mt-6 text-4xl sm:text-5xl font-semibold text-foreground tracking-[-0.02em]">
            <Typewriter text="What our clients say" speed={40} />
          </h2>
          <p className="mt-5 text-[15px] text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Real businesses. Real results. Hear from owners who&apos;ve built
            their digital presence with us.
          </p>
        </motion.div>

        {/* Card grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.6,
                delay: i * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={`relative overflow-hidden rounded-2xl border border-white/[0.06] bg-card p-6 flex flex-col gap-4 ${
                i === 2 ? "md:col-span-2 lg:col-span-1" : ""
              }`}
            >
              {/* Gradient accent */}
              <div
                aria-hidden
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${t.accent} opacity-40`}
              />

              <div className="relative flex flex-col gap-4 flex-1">
                {/* Quote icon */}
                <Quote className="h-5 w-5 text-primary/50" strokeWidth={1.5} />

                {/* Stars */}
                <div className="flex items-center gap-0.5">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star
                      key={j}
                      className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                {/* Quote text */}
                <p className="text-[14px] text-foreground/80 leading-relaxed flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-2 border-t border-white/[0.06]">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${t.accent} border border-white/[0.1] text-[11px] font-semibold text-foreground shrink-0`}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-foreground">
                      {t.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
